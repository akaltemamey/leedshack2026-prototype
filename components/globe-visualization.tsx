"use client"

import { Suspense, useRef, useMemo, useState, useCallback } from "react"
import { Canvas, useFrame, type ThreeEvent, useLoader } from "@react-three/fiber"
import { OrbitControls, Html, Stars } from "@react-three/drei"
import * as THREE from "three"
import type { Hotspot } from "@/lib/types"
import type { SatellitePosition } from "@/lib/orbital"

const EARTH_RADIUS_KM = 6371 // used to map real altitude (km) to visual radius

// Convert lat/lon to 3D position on sphere
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  return new THREE.Vector3(x, y, z)
}

// Realistic Earth textures via jsDelivr 
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const [dayMap, nightMap, normalMap, specMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/earth_atmos_2048.jpg",
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/earth_lights_2048.png",
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/earth_normal_2048.jpg",
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/earth_specular_2048.jpg",
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/earth_clouds_2048.png",
  ])

  // Texture quality + color-space compat (prevents white-screen on older three)
  useMemo(() => {
    const setup = (t: THREE.Texture, isColor: boolean) => {
      t.anisotropy = 8
      t.generateMipmaps = true
      t.minFilter = THREE.LinearMipmapLinearFilter
      t.magFilter = THREE.LinearFilter

      if (isColor) {
        if ("colorSpace" in t) {
          ;(t as any).colorSpace = (THREE as any).SRGBColorSpace
        } else {
          ;(t as any).encoding = (THREE as any).sRGBEncoding
        }
      }

      t.needsUpdate = true
    }

    setup(dayMap, true)
    setup(nightMap, true)
    setup(cloudsMap, true)
    setup(normalMap, false)
    setup(specMap, false)
  }, [dayMap, nightMap, normalMap, specMap, cloudsMap])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.00035

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.05 + Math.sin(t * 0.6) * 0.02
    }
  })

  return (
    <group>
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.99, 256, 256]} />
        <meshPhongMaterial
          map={dayMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.6, 0.6)}
          specularMap={specMap}
          specular={new THREE.Color("#2a5aa3")}
          shininess={35}
          // Night lights
          emissiveMap={nightMap}
          emissive={new THREE.Color("#ffffff")}
          emissiveIntensity={0.85}
        />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.01, 128, 128]} />
        <meshPhongMaterial map={cloudsMap} transparent opacity={0.55} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.05, 128, 128]} />
        <meshBasicMaterial color="#66ccff" transparent opacity={0.05} />
      </mesh>
    </group>
  )
}

// Atmosphere glow (slightly improved)
function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[2.08, 128, 128]} />
      <meshBasicMaterial color="#58c4ff" transparent opacity={0.045} side={THREE.BackSide} />
    </mesh>
  )
}

// Launch site marker
function LaunchSiteMarker({
  lat,
  lon,
  name,
  isActive,
}: {
  lat: number
  lon: number
  name: string
  isActive: boolean
}) {
  const position = useMemo(() => latLonToVector3(lat, lon, 2.02), [lat, lon])
  const [hovered, setHovered] = useState(false)

  return (
    <group position={position}>
      <mesh onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[isActive ? 0.04 : 0.025, 16, 16]} />
        <meshBasicMaterial color={isActive ? "#22d3ee" : "#94a3b8"} transparent opacity={isActive ? 1 : 0.6} />
      </mesh>
      {isActive && (
        <mesh>
          <ringGeometry args={[0.06, 0.08, 32]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
      {hovered && (
        <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
          <div className="rounded-md bg-card/95 px-2 py-1 text-xs font-sans text-card-foreground shadow-lg border border-border whitespace-nowrap backdrop-blur-sm">
            {name}
          </div>
        </Html>
      )}
    </group>
  )
}

// Corridor path line
function CorridorPath({
  path,
  visible,
  color = "#22d3ee",
}: {
  path: { lat: number; lon: number }[]
  visible: boolean
  color?: string
}) {
  const points = useMemo(() => path.map((p) => latLonToVector3(p.lat, p.lon, 2.03)), [path])
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  if (!visible || points.length === 0) return null

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={2} transparent opacity={0.9} />
    </line>
  )
}

// Corridor buffer - rising cone from launch site
function CorridorBuffer({
  path,
  width,
  visible,
  color = "#22d3ee",
}: {
  path: { lat: number; lon: number }[]
  width: number
  visible: boolean
  color?: string
}) {
  const geometry = useMemo(() => {
    if (path.length < 2) return null

    const positions: number[] = []
    const indices: number[] = []

    const launchPoint = latLonToVector3(path[0].lat, path[0].lon, 2.0)
    const numRadialSegments = 12
    const verticesPerRing = numRadialSegments

    const startRadius = Math.max(0.05, (width / 100) * 0.12)

    for (let i = 0; i < path.length; i++) {
      const point = path[i]
      const fraction = i / (path.length - 1)

      const centerPos = latLonToVector3(point.lat, point.lon, 2.0)
      const direction = centerPos.clone().sub(launchPoint).normalize()

      const altitudeOffset = fraction * 0.15
      const liftedPos = centerPos.clone().add(direction.multiplyScalar(altitudeOffset))

      const currentRadius = startRadius * (1 - fraction * 0.7)

      for (let j = 0; j < numRadialSegments; j++) {
        const angle = (j / numRadialSegments) * Math.PI * 2
        const perpX = Math.cos(angle)
        const perpY = Math.sin(angle)

        const perp = new THREE.Vector3(perpX, perpY, 0).normalize()
        const vertex = liftedPos.clone().add(perp.multiplyScalar(currentRadius))

        positions.push(vertex.x, vertex.y, vertex.z)
      }
    }

    for (let i = 0; i < path.length - 1; i++) {
      const baseA = i * verticesPerRing
      const baseB = (i + 1) * verticesPerRing

      for (let j = 0; j < verticesPerRing; j++) {
        const nextJ = (j + 1) % verticesPerRing
        indices.push(baseA + j, baseB + j, baseA + nextJ)
        indices.push(baseA + nextJ, baseB + j, baseB + nextJ)
      }
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3))
    geom.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
    geom.computeVertexNormals()
    return geom
  }, [path, width])

  if (!visible || !geometry) return null

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

// Hotspot markers
function HotspotMarker({
  hotspot,
  visible,
  onHover,
}: {
  hotspot: Hotspot
  visible: boolean
  onHover: (h: Hotspot | null) => void
}) {
  const position = useMemo(() => latLonToVector3(hotspot.lat, hotspot.lon, 2.05), [hotspot.lat, hotspot.lon])
  const [hovered, setHovered] = useState(false)
  const pulseRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (pulseRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3
      pulseRef.current.scale.setScalar(scale)
    }
  })

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setHovered(true)
      onHover(hotspot)
    },
    [hotspot, onHover]
  )

  const handlePointerOut = useCallback(() => {
    setHovered(false)
    onHover(null)
  }, [onHover])

  if (!visible) return null

  const size = 0.02 + hotspot.weight * 0.03
  const riskColor = hotspot.weight > 0.7 ? "#ef4444" : hotspot.weight > 0.4 ? "#f59e0b" : "#22c55e"

  return (
    <group position={position}>
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={riskColor} />
      </mesh>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[size * 1.5, 16, 16]} />
        <meshBasicMaterial color={riskColor} transparent opacity={0.3} />
      </mesh>
      {hovered && (
        <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
          <div className="rounded-md bg-card/95 px-3 py-2 text-xs font-sans text-card-foreground shadow-lg border border-border whitespace-nowrap backdrop-blur-sm">
            <div className="font-medium">{hotspot.label}</div>
            <div className="text-muted-foreground">
              Alt: {hotspot.altitudeBand} | Risk: {(hotspot.weight * 100).toFixed(0)}%
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Satellite/debris instanced point cloud
const SAT_COLORS: Record<string, string> = {
  active: "#3b82f6",
  debris: "#ef4444",
  station: "#ffffff",
  recent: "#22c55e",
}

function SatelliteLayer({ satellites, visible }: { satellites: SatellitePosition[]; visible: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const { matrices, colors, count } = useMemo(() => {
    if (!visible || !satellites || satellites.length === 0) {
      return { matrices: new Float32Array(0), colors: new Float32Array(0), count: 0 }
    }

    const cnt = satellites.length
    const mat = new Float32Array(cnt * 16)
    const col = new Float32Array(cnt * 3)
    const dummy = new THREE.Matrix4()
    const color = new THREE.Color()

    for (let i = 0; i < cnt; i++) {
      const sat = satellites[i]
      const altKm = Math.max(0, sat.altitudeKm || 0)
      const radius = 2.08 * (1 + altKm / EARTH_RADIUS_KM)
      const pos = latLonToVector3(sat.lat, sat.lon, radius)

      const size = sat.type === "station" ? 0.025 : sat.type === "debris" ? 0.012 : 0.015
      dummy.makeScale(size, size, size)
      dummy.setPosition(pos)
      dummy.toArray(mat, i * 16)

      color.set(SAT_COLORS[sat.type] || "#3b82f6")
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    return { matrices: mat, colors: col, count: cnt }
  }, [satellites, visible])

  useFrame(() => {
    if (!meshRef.current || count === 0) return
    const dummy = new THREE.Matrix4()
    for (let i = 0; i < count; i++) {
      dummy.fromArray(matrices, i * 16)
      meshRef.current.setMatrixAt(i, dummy)

      const color = new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2])
      meshRef.current.setColorAt(i, color)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  const satLength = satellites?.length ?? 0

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (e.instanceId !== undefined && e.instanceId < satLength) setHoveredIdx(e.instanceId)
    },
    [satLength]
  )

  const handlePointerOut = useCallback(() => setHoveredIdx(null), [])

  if (!visible || count === 0) return null

  const hoveredSat = hoveredIdx !== null ? satellites[hoveredIdx] : null

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} onPointerMove={handlePointerMove} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {hoveredSat && (
        (() => {
          const altKm = Math.max(0, hoveredSat.altitudeKm || 0)
          const satRadius = 2.1 * (1 + altKm / EARTH_RADIUS_KM)
          const hoverPos = latLonToVector3(hoveredSat.lat, hoveredSat.lon, satRadius + 0.03)
          return (
            <group position={hoverPos}>
              <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
                <div className="rounded-md bg-card/95 px-3 py-2 text-xs font-sans text-card-foreground shadow-lg border border-border whitespace-nowrap backdrop-blur-sm">
                  <div className="font-medium">{hoveredSat.name}</div>
                  <div className="text-muted-foreground flex gap-2">
                    <span>NORAD {hoveredSat.noradId}</span>
                    <span>Alt: {Math.round(hoveredSat.altitudeKm)} km</span>
                  </div>
                  <div className="text-muted-foreground capitalize">{hoveredSat.type}</div>
                </div>
              </Html>
            </group>
          )
        })()
      )}
    </group>
  )
}

// Main scene content
function GlobeScene({
  launchSite,
  corridorPath,
  corridorWidth,
  hotspots,
  showCorridor,
  showHotspots,
  showSatellites,
  satellites,
  compareCorridorPath,
  onHotspotHover,
}: {
  launchSite: { lat: number; lon: number; name: string } | null
  corridorPath: { lat: number; lon: number }[]
  corridorWidth: number
  hotspots: Hotspot[]
  showCorridor: boolean
  showHotspots: boolean
  showSatellites: boolean
  satellites: SatellitePosition[]
  compareCorridorPath?: { lat: number; lon: number }[]
  onHotspotHover: (h: Hotspot | null) => void
}) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 3, 10]} intensity={1.6} />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

      <Earth />
      <Atmosphere />

      <SatelliteLayer satellites={satellites} visible={showSatellites} />

      {launchSite && <LaunchSiteMarker lat={launchSite.lat} lon={launchSite.lon} name={launchSite.name} isActive />}

      <CorridorPath path={corridorPath} visible={showCorridor} />
      <CorridorBuffer path={corridorPath} width={corridorWidth} visible={showCorridor} />

      {compareCorridorPath && compareCorridorPath.length > 0 && (
        <>
          <CorridorPath path={compareCorridorPath} visible={showCorridor} color="#f59e0b" />
          <CorridorBuffer path={compareCorridorPath} width={corridorWidth} visible={showCorridor} color="#f59e0b" />
        </>
      )}

      {hotspots.map((h, i) => (
        <HotspotMarker key={`hotspot-${i}`} hotspot={h} visible={showHotspots} onHover={onHotspotHover} />
      ))}

      <OrbitControls enablePan={false} minDistance={2} maxDistance={100} enableDamping dampingFactor={0.05} />
    </>
  )
}

interface GlobeVisualizationProps {
  launchSite: { lat: number; lon: number; name: string } | null
  corridorPath: { lat: number; lon: number }[]
  corridorWidth: number
  hotspots: Hotspot[]
  showCorridor: boolean
  showHotspots: boolean
  showSatellites: boolean
  satellites: SatellitePosition[]
  compareCorridorPath?: { lat: number; lon: number }[]
}

export default function GlobeVisualization({
  launchSite,
  corridorPath,
  corridorWidth,
  hotspots,
  showCorridor,
  showHotspots,
  showSatellites,
  satellites,
  compareCorridorPath,
}: GlobeVisualizationProps) {
  const [, setHoveredHotspot] = useState<Hotspot | null>(null)

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 12], fov: 45, near: 0.1, far: 2000 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
        <Suspense fallback={null}>
          <GlobeScene
            launchSite={launchSite}
            corridorPath={corridorPath}
            corridorWidth={corridorWidth}
            hotspots={hotspots}
            showCorridor={showCorridor}
            showHotspots={showHotspots}
            showSatellites={showSatellites}
            satellites={satellites}
            compareCorridorPath={compareCorridorPath}
            onHotspotHover={setHoveredHotspot}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
