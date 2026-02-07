"use client"

import { useRef, useMemo, useState, useCallback } from "react"
import { Canvas, useFrame, type ThreeEvent, useLoader } from "@react-three/fiber"
import { OrbitControls, Html, Stars } from "@react-three/drei"
import * as THREE from "three"
import type { Hotspot } from "@/lib/types"
import type { SatellitePosition } from "@/lib/orbital"

// Convert lat/lon to 3D position on sphere
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  return new THREE.Vector3(x, y, z)
}

// Procedural Earth (no external texture needed)
function Earth() {
  const wireRef = useRef<THREE.LineSegments>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  // Create a wireframe globe with latitude/longitude lines
  const wireGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(2, 36, 18)
    return new THREE.WireframeGeometry(geo)
  }, [])

  useFrame((state) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.06 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02
    }
  })

  return (
    <group>
      {/* Solid dark sphere base */}
      <mesh>
        <sphereGeometry args={[1.99, 64, 64]} />
        <meshStandardMaterial color="#0c1a2e" roughness={0.9} />
      </mesh>
      {/* Wireframe grid */}
      <lineSegments ref={wireRef} geometry={wireGeometry}>
        <lineBasicMaterial color="#1e3a5f" transparent opacity={0.35} />
      </lineSegments>
      {/* Subtle inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.01, 64, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.06} />
      </mesh>
    </group>
  )
}

// Atmosphere glow
function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[2.05, 64, 64]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.08} side={THREE.BackSide} />
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
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[isActive ? 0.04 : 0.025, 16, 16]} />
        <meshBasicMaterial
          color={isActive ? "#22d3ee" : "#94a3b8"}
          transparent
          opacity={isActive ? 1 : 0.6}
        />
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
  const points = useMemo(() => {
    return path.map((p) => latLonToVector3(p.lat, p.lon, 2.03))
  }, [path])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [points])

  if (!visible || points.length === 0) return null

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={2} transparent opacity={0.9} />
    </line>
  )
}

// Corridor buffer (translucent tube)
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
  const tubeGeometry = useMemo(() => {
    if (path.length < 2) return null
    const points = path.map((p) => latLonToVector3(p.lat, p.lon, 2.03))
    const curve = new THREE.CatmullRomCurve3(points)
    const radius = Math.max(0.005, (width / 100) * 0.06)
    return new THREE.TubeGeometry(curve, 64, radius, 8, false)
  }, [path, width])

  if (!visible || !tubeGeometry) return null

  return (
    <mesh geometry={tubeGeometry}>
      <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
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
  const position = useMemo(
    () => latLonToVector3(hotspot.lat, hotspot.lon, 2.05),
    [hotspot.lat, hotspot.lon]
  )
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
  const riskColor =
    hotspot.weight > 0.7 ? "#ef4444" : hotspot.weight > 0.4 ? "#f59e0b" : "#22c55e"

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

function SatelliteLayer({
  satellites,
  visible,
}: {
  satellites: SatellitePosition[]
  visible: boolean
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  // Group satellites by type and build instance matrices + colors
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
      // Place on sphere at slightly higher radius based on normalized altitude
      const normAlt = Math.min(sat.altitudeKm / 2000, 1)
      const radius = 2.08 + normAlt * 0.3
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

  // Apply instance data
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
      if (e.instanceId !== undefined && e.instanceId < satLength) {
        setHoveredIdx(e.instanceId)
      }
    },
    [satLength]
  )

  const handlePointerOut = useCallback(() => {
    setHoveredIdx(null)
  }, [])

  if (!visible || count === 0) return null

  const hoveredSat = hoveredIdx !== null ? satellites[hoveredIdx] : null

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {hoveredSat && (
        <group position={latLonToVector3(hoveredSat.lat, hoveredSat.lon, 2.1 + Math.min(hoveredSat.altitudeKm / 2000, 1) * 0.3)}>
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
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

      <Earth />
      <Atmosphere />

      <SatelliteLayer satellites={satellites} visible={showSatellites} />

      {launchSite && (
        <LaunchSiteMarker
          lat={launchSite.lat}
          lon={launchSite.lon}
          name={launchSite.name}
          isActive
        />
      )}

      <CorridorPath path={corridorPath} visible={showCorridor} />
      <CorridorBuffer path={corridorPath} width={corridorWidth} visible={showCorridor} />

      {compareCorridorPath && compareCorridorPath.length > 0 && (
        <>
          <CorridorPath path={compareCorridorPath} visible={showCorridor} color="#f59e0b" />
          <CorridorBuffer
            path={compareCorridorPath}
            width={corridorWidth}
            visible={showCorridor}
            color="#f59e0b"
          />
        </>
      )}

      {hotspots.map((h, i) => (
        <HotspotMarker key={`hotspot-${i}`} hotspot={h} visible={showHotspots} onHover={onHotspotHover} />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        enableDamping
        dampingFactor={0.05}
      />
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
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
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
      </Canvas>
    </div>
  )
}
