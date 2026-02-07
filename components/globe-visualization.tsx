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
}

// --- MATH HELPERS ---

const EARTH_RADIUS = 2.0

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

function Trajectory({ path, visible }: { path: { lat: number; lon: number }[]; visible: boolean }) {
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
        color="#22d3ee"
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
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} />
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

function SatelliteLayer({ satellites, visible }: { satellites: SatellitePosition[]; visible: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const { matrices, colors, count } = useMemo(() => {
    if (!satellites || satellites.length === 0) {
      return { matrices: new Float32Array(0), colors: new Float32Array(0), count: 0 }
    }
    const cnt = satellites.length
    const mat = new Float32Array(cnt * 16)
    const col = new Float32Array(cnt * 3)
    const dummy = new THREE.Matrix4()
    const color = new THREE.Color()

    for (let i = 0; i < cnt; i++) {
      const sat = satellites[i]
      const normAlt = Math.max(0.1, Math.min(sat.altitudeKm / 5000, 1.5))
      const radius = EARTH_RADIUS + normAlt
      
      const pos = latLonToVector3(sat.lat, sat.lon, radius)
      const size = sat.type === "station" ? 0.04 : sat.type === "debris" ? 0.012 : 0.018
      
      dummy.makeScale(size, size, size)
      dummy.setPosition(pos)
      dummy.toArray(mat, i * 16)

      const c = SAT_COLORS[sat.type] || "#3b82f6"
      color.set(c)
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    return { matrices: mat, colors: col, count: cnt }
  }, [satellites])

  useFrame(() => {
    if (!meshRef.current || count === 0 || !visible) return
    for (let i = 0; i < count; i++) {
      const matrix = new THREE.Matrix4().fromArray(matrices, i * 16)
      meshRef.current.setMatrixAt(i, matrix)
      meshRef.current.setColorAt(i, new THREE.Color(colors[i*3], colors[i*3+1], colors[i*3+2]))
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  if (!visible) return null

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        onPointerMove={(e) => { e.stopPropagation(); if (e.instanceId !== undefined) setHoveredIdx(e.instanceId); }}
        onPointerOut={() => setHoveredIdx(null)}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {hoveredIdx !== null && satellites[hoveredIdx] && (
         <Html position={latLonToVector3(satellites[hoveredIdx].lat, satellites[hoveredIdx].lon, EARTH_RADIUS + 0.5)} distanceFactor={10} style={{ pointerEvents: 'none' }}>
           <div className="px-2 py-1 bg-black/80 text-white text-xs rounded border border-gray-600 whitespace-nowrap backdrop-blur-md">
             <div className="font-bold">{satellites[hoveredIdx].name}</div>
             <div className="text-[10px] text-gray-300">Alt: {satellites[hoveredIdx].altitudeKm.toFixed(0)}km</div>
           </div>
         </Html>
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

          <SatelliteLayer satellites={satellites} visible={showSatellites} />

          {launchSite && (
            <LaunchSiteMarker lat={launchSite.lat} lon={launchSite.lon} name={launchSite.name} />
          )}

          <Trajectory 
            path={corridorPath} 
            visible={showCorridor} 
          />

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