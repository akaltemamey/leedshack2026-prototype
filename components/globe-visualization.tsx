"use client"

import { Suspense, useRef, useMemo, useState } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Html, Stars, Line } from "@react-three/drei"
import * as THREE from "three"

// --- TYPES ---

export interface Hotspot {
  lat: number
  lon: number
  label: string
  weight: number // 0 to 1 (risk level)
  altitudeBand: string
}

export interface SatellitePosition {
  id: string
  name: string
  lat: number
  lon: number
  altitudeKm: number
  type: "active" | "debris" | "station" | "recent"
  noradId: number
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
  satelliteOpacity?: number
}

// --- MATH HELPERS ---

const EARTH_RADIUS = 2.0
const EARTH_RADIUS_KM = 6371

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  return new THREE.Vector3(x, y, z)
}

// --- SUB-COMPONENTS ---

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

  useMemo(() => {
    const setup = (t: THREE.Texture, isColor: boolean) => {
      t.anisotropy = 8
      if (isColor) (t as any).colorSpace = (THREE as any).SRGBColorSpace
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
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS - 0.01, 64, 64]} />
        <meshPhongMaterial
          map={dayMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.6, 0.6)}
          specularMap={specMap}
          specular={new THREE.Color("#2a5aa3")}
          shininess={15}
          emissiveMap={nightMap}
          emissive={new THREE.Color("#ffffff")}
          emissiveIntensity={0.85}
        />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[EARTH_RADIUS + 0.01, 64, 64]} />
        <meshPhongMaterial map={cloudsMap} transparent opacity={0.6} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[EARTH_RADIUS + 0.05, 64, 64]} />
        <meshBasicMaterial color="#66ccff" transparent opacity={0.05} />
      </mesh>
    </group>
  )
}

function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS + 0.08, 64, 64]} />
      <meshBasicMaterial color="#58c4ff" transparent opacity={0.05} side={THREE.BackSide} />
    </mesh>
  )
}

function Rocket({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const rocketRef = useRef<THREE.Group>(null)
  const flameRef = useRef<THREE.Mesh>(null)
  const SPEED = 0.15

  useFrame((state) => {
    if (!rocketRef.current || !curve) return
    const t = (state.clock.elapsedTime * SPEED) % 1
    const position = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t).normalize()

    rocketRef.current.position.copy(position)
    const up = new THREE.Vector3(0, 1, 0)
    rocketRef.current.quaternion.setFromUnitVectors(up, tangent)

    if (flameRef.current) {
      flameRef.current.scale.setScalar(0.8 + Math.random() * 0.4)
    }
  })

  return (
    <group ref={rocketRef}>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.015, 0.025, 0.1, 8]} />
        <meshStandardMaterial color="white" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.015, 0.05, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh ref={flameRef} position={[0, -0.04, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.01, 0.08, 8]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.9} />
      </mesh>
      <pointLight distance={0.5} intensity={2} color="#f59e0b" position={[0, -0.05, 0]} />
    </group>
  )
}

function Trajectory({ path, visible, color = "#22d3ee" }: { path: { lat: number; lon: number }[]; visible: boolean; color?: string }) {
  const { curve, linePoints } = useMemo(() => {
    if (path.length < 2) return { curve: null, linePoints: [] }
    const points: THREE.Vector3[] = []
    
    // UPDATED: Lower altitude (0.4 = 20% of Earth Radius) for realistic LEO look
    const MAX_ALTITUDE = 0.4 

    path.forEach((p, i) => {
      const progress = i / (path.length - 1)
      
      // UPDATED MATH: "Ease Out Quartic"
      // This creates a "Gravity Turn": 
      // 1. Rises very fast vertically at the start (launch)
      // 2. Quickly pitches over to horizontal
      // 3. Stays flat at max altitude for the rest of the path (orbit)
      const altitudeCurve = 1 - Math.pow(1 - progress, 4)
      
      const currentAltitude = EARTH_RADIUS + (altitudeCurve * MAX_ALTITUDE)
      
      points.push(latLonToVector3(p.lat, p.lon, currentAltitude))
    })

    const curve = new THREE.CatmullRomCurve3(points)
    curve.curveType = "catmullrom"
    curve.tension = 0.5
    const linePoints = curve.getPoints(60)

    return { curve, linePoints }
  }, [path])

  if (!visible || !curve) return null

  return (
    <group>
      <Line
        points={linePoints}
        color={color}
        opacity={0.6}
        transparent
        lineWidth={2}
        dashed
        dashScale={8}
        dashSize={0.4}
        gapSize={0.2}
      />
      <Rocket curve={curve} />
      <mesh position={linePoints[linePoints.length - 1]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

function LaunchSiteMarker({ lat, lon, name }: { lat: number; lon: number; name: string }) {
  const position = useMemo(() => latLonToVector3(lat, lon, EARTH_RADIUS + 0.02), [lat, lon])
  const [hovered, setHovered] = useState(false)

  return (
    <group position={position}>
      <mesh onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.06, 0.08, 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      {hovered && (
        <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
          <div className="rounded bg-black/80 px-2 py-1 text-xs text-white border border-gray-700 whitespace-nowrap backdrop-blur-md">
            {name}
          </div>
        </Html>
      )}
    </group>
  )
}

function HotspotMarker({ hotspot, visible, onHover }: { hotspot: Hotspot; visible: boolean; onHover: (h: Hotspot | null) => void }) {
  const position = useMemo(() => latLonToVector3(hotspot.lat, hotspot.lon, EARTH_RADIUS + 0.05), [hotspot.lat, hotspot.lon])
  const [hovered, setHovered] = useState(false)
  const pulseRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (pulseRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3
      pulseRef.current.scale.setScalar(scale)
    }
  })

  if (!visible) return null
  const size = 0.02 + hotspot.weight * 0.03
  const color = hotspot.weight > 0.7 ? "#ef4444" : hotspot.weight > 0.4 ? "#f59e0b" : "#22c55e"

  return (
    <group position={position}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(hotspot); }}
        onPointerOut={() => { setHovered(false); onHover(null); }}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[size * 1.5, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      {hovered && (
        <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
          <div className="rounded bg-black/80 px-3 py-2 text-xs text-white border border-gray-700 whitespace-nowrap backdrop-blur-md">
            <div className="font-bold">{hotspot.label}</div>
            <div className="text-gray-300">
              Alt: {hotspot.altitudeBand} | Risk: {(hotspot.weight * 100).toFixed(0)}%
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

const SAT_COLORS: Record<string, string> = {
  active: "#3b82f6", debris: "#ef4444", station: "#ffffff", recent: "#22c55e",
}

function createSatelliteGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const vertices: number[] = []
  const colors: number[] = []
  const indices: number[] = []
  let indexOffset = 0

  // Helper to add vertices for a box and get color for solar panels
  const addBoxVertices = (x: number, y: number, z: number, w: number, h: number, d: number, isPanel: boolean) => {
    const hx = w / 2, hy = h / 2, hz = d / 2
    const color = isPanel ? [0.98, 0.75, 0.14] : [0.19, 0.17, 0.22] // Gold for panels, dark gray for body
    
    const boxVertices = [
      x - hx, y - hy, z - hz, x + hx, y - hy, z - hz, x + hx, y + hy, z - hz, x - hx, y + hy, z - hz,
      x - hx, y - hy, z + hz, x + hx, y - hy, z + hz, x + hx, y + hy, z + hz, x - hx, y + hy, z + hz
    ]
    
    boxVertices.forEach(() => {
      colors.push(...color)
    })
    
    vertices.push(...boxVertices)
    
    const baseIdx = indexOffset
    const boxIndices = [
      baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3,
      baseIdx + 4, baseIdx + 6, baseIdx + 5, baseIdx + 4, baseIdx + 7, baseIdx + 6,
      baseIdx, baseIdx + 4, baseIdx + 5, baseIdx, baseIdx + 5, baseIdx + 1,
      baseIdx + 2, baseIdx + 6, baseIdx + 7, baseIdx + 2, baseIdx + 7, baseIdx + 3
    ]
    indices.push(...boxIndices)
    indexOffset += 8
  }

  // Central body
  addBoxVertices(0, 0, 0, 1, 1.4, 1, false)
  
  // Left solar panel
  addBoxVertices(-2.5, 0, 0, 4, 0.3, 2.5, true)
  
  // Right solar panel
  addBoxVertices(2.5, 0, 0, 4, 0.3, 2.5, true)

  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
  geometry.computeVertexNormals()
  
  return geometry
}

function createDebrisGeometry(): THREE.BufferGeometry {
  // Create a jagged rock-like shape using icosahedron with random vertex displacement
  const baseGeometry = new THREE.IcosahedronGeometry(1, 3)
  const positions = baseGeometry.attributes.position.array as Float32Array
  const colors: number[] = []

  // Randomly displace vertices to create jagged appearance
  for (let i = 0; i < positions.length; i += 3) {
    const displacement = (Math.random() - 0.5) * 0.4
    positions[i] += displacement
    positions[i + 1] += displacement
    positions[i + 2] += displacement
    
    // Rock color: brownish-gray
    colors.push(0.4, 0.35, 0.3)
  }

  baseGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
  baseGeometry.computeVertexNormals()
  
  return baseGeometry
}

function SatelliteLayer({ satellites, visible, opacity = 1 }: { satellites: SatellitePosition[]; visible: boolean; opacity?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const debrisRef = useRef<THREE.InstancedMesh>(null)
  const glowRef = useRef<THREE.InstancedMesh>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const { satMatrices, debrisMatrices, colors, satCount, debrisCount } = useMemo(() => {
    if (!satellites || satellites.length === 0) {
      return { satMatrices: new Float32Array(0), debrisMatrices: new Float32Array(0), colors: new Float32Array(0), satCount: 0, debrisCount: 0 }
    }
    
    const satMat: number[] = []
    const debrisMat: number[] = []
    const col: number[] = []
    const dummy = new THREE.Matrix4()
    const color = new THREE.Color()
    let satIdx = 0
    let debrisIdx = 0

    for (let i = 0; i < satellites.length; i++) {
      const sat = satellites[i]
      const normAlt = Math.max(0.1, Math.min(sat.altitudeKm / 5000, 1.5))
      const radius = EARTH_RADIUS + normAlt
      
      const pos = latLonToVector3(sat.lat, sat.lon, radius)
      const size = sat.type === "station" ? 0.012 : sat.type === "debris" ? 0.006 : 0.008
      
      dummy.makeScale(size, size, size)
      dummy.setPosition(pos)
      
      const c = SAT_COLORS[sat.type] || "#3b82f6"
      color.set(c)
      
      if (sat.type === "debris") {
        dummy.toArray(debrisMat, debrisIdx * 16)
        debrisIdx++
      } else {
        dummy.toArray(satMat, satIdx * 16)
        satIdx++
      }
      
      col.push(color.r, color.g, color.b)
    }
    
    return { 
      satMatrices: new Float32Array(satMat),
      debrisMatrices: new Float32Array(debrisMat),
      colors: new Float32Array(col),
      satCount: satIdx,
      debrisCount: debrisIdx
    }
  }, [satellites])

  const satGeometryRef = useRef<THREE.BufferGeometry | null>(null)
  const debrisGeometryRef = useRef<THREE.BufferGeometry | null>(null)
  
  if (!satGeometryRef.current) {
    satGeometryRef.current = createSatelliteGeometry()
  }
  
  if (!debrisGeometryRef.current) {
    debrisGeometryRef.current = createDebrisGeometry()
  }

  useFrame(() => {
    if (!visible) return
    
    // Update satellites
    if (meshRef.current && satCount > 0) {
      for (let i = 0; i < satCount; i++) {
        const matrix = new THREE.Matrix4().fromArray(satMatrices, i * 16)
        meshRef.current.setMatrixAt(i, matrix)
      }
      meshRef.current.instanceMatrix.needsUpdate = true
    }
    
    // Update debris
    if (debrisRef.current && debrisCount > 0) {
      for (let i = 0; i < debrisCount; i++) {
        const matrix = new THREE.Matrix4().fromArray(debrisMatrices, i * 16)
        debrisRef.current.setMatrixAt(i, matrix)
      }
      debrisRef.current.instanceMatrix.needsUpdate = true
    }
    
    // Update glow effect
    if (glowRef.current && satCount + debrisCount > 0) {
      const allCount = satCount + debrisCount
      for (let i = 0; i < allCount; i++) {
        const sourceMatrices = i < satCount ? satMatrices : debrisMatrices
        const sourceIdx = i < satCount ? i : i - satCount
        const matrix = new THREE.Matrix4().fromArray(sourceMatrices, sourceIdx * 16)
        // Scale up slightly for glow halo
        const scale = new THREE.Vector3()
        matrix.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale)
        matrix.scale(new THREE.Vector3(1.15, 1.15, 1.15))
        glowRef.current.setMatrixAt(i, matrix)
      }
      glowRef.current.instanceMatrix.needsUpdate = true
    }
  })

  if (!visible) return null

  return (
    <group>
      {/* Satellite mesh */}
      {satCount > 0 && (
        <instancedMesh ref={meshRef} args={[satGeometryRef.current || undefined, undefined, satCount]} onPointerMove={(e) => { e.stopPropagation(); if (e.instanceId !== undefined) setHoveredIdx(e.instanceId); }} onPointerOut={() => setHoveredIdx(null)}>
          <meshStandardMaterial toneMapped={false} metalness={0.7} roughness={0.3} transparent opacity={opacity} vertexColors side={THREE.DoubleSide} />
        </instancedMesh>
      )}
      
      {/* Debris mesh */}
      {debrisCount > 0 && (
        <instancedMesh ref={debrisRef} args={[debrisGeometryRef.current || undefined, undefined, debrisCount]}>
          <meshStandardMaterial toneMapped={false} metalness={0.5} roughness={0.7} transparent opacity={opacity} vertexColors side={THREE.DoubleSide} />
        </instancedMesh>
      )}
      
      {/* Glow effect for all objects - same shape as satellite */}
      {satCount + debrisCount > 0 && (
        <instancedMesh ref={glowRef} args={[satGeometryRef.current || undefined, undefined, satCount + debrisCount]}>
          <meshBasicMaterial color={0x00ffff} transparent opacity={opacity * 0.65} />
        </instancedMesh>
      )}
      
      {hoveredIdx !== null && satellites[hoveredIdx] && (
        (() => {
          const sat = satellites[hoveredIdx]
          const altKm = Math.max(0, sat.altitudeKm || 0)
          const satRadius = EARTH_RADIUS * (1 + altKm / EARTH_RADIUS_KM)
          const hoverPos = latLonToVector3(sat.lat, sat.lon, satRadius + 0.05)
          return (
            <Html position={hoverPos} distanceFactor={6} style={{ pointerEvents: 'none' }}>
              <div className="rounded-md bg-card/95 px-3 py-2 text-xs font-sans text-card-foreground shadow-lg border border-border whitespace-nowrap backdrop-blur-sm">
                <div className="font-medium">{sat.name}</div>
                <div className="text-muted-foreground flex gap-2">
                  <span>NORAD {sat.noradId}</span>
                  <span>Alt: {Math.round(sat.altitudeKm)} km</span>
                </div>
                <div className="text-muted-foreground capitalize">{sat.type}</div>
              </div>
            </Html>
          )
        })()
      )}
    </group>
  )
}

// --- MAIN COMPONENT ---

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
  satelliteOpacity = 1,
}: GlobeVisualizationProps) {
  const [, setHoveredHotspot] = useState<Hotspot | null>(null)

  return (
    <div className="w-full h-full relative" style={{ minHeight: '500px' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={["#000005"]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 5, 5]} intensity={1.5} />
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

          <Earth />
          <Atmosphere />

          <SatelliteLayer satellites={satellites} visible={showSatellites} opacity={satelliteOpacity} />

          {launchSite && (
            <LaunchSiteMarker lat={launchSite.lat} lon={launchSite.lon} name={launchSite.name} />
          )}

          <Trajectory 
            path={corridorPath} 
            visible={showCorridor} 
            color="#22d3ee"
          />

          {compareCorridorPath && (
            <Trajectory 
              path={compareCorridorPath} 
              visible={showCorridor}
              color="#f59e0b"
            />
          )}

          {hotspots.map((h, i) => (
            <HotspotMarker 
              key={`hotspot-${i}`} 
              hotspot={h} 
              visible={showHotspots} 
              onHover={setHoveredHotspot} 
            />
          ))}

          <OrbitControls 
            enablePan={false} 
            minDistance={3.5} 
            maxDistance={12} 
            enableDamping 
            dampingFactor={0.05} 
          />
        </Suspense>
      </Canvas>
    </div>
  )
}