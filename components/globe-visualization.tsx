"use client"

import React, { useRef, useMemo, useState, useCallback, useLayoutEffect } from "react"
import { Canvas, useFrame, type ThreeEvent, useLoader } from "@react-three/fiber"
import { OrbitControls, Html, Stars } from "@react-three/drei"
import * as THREE from "three"
import type { Hotspot } from "@/lib/types" 
import type { SatellitePosition } from "@/lib/orbital" 

// --- 1. UTILITIES ---

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  return new THREE.Vector3(x, y, z)
}

// --- 2. EARTH COMPONENTS ---

function Earth() {
  // Load texture. Fallback to blue color if texture fails or loads slowly.
  const [colorMap] = useLoader(THREE.TextureLoader, [
    "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
  ])

  return (
    <group>
      <mesh rotation={[0, 0, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          color="#ffffff" // Base color if map fails
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
    </group>
  )
}

function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[2.05, 64, 64]} />
      <meshBasicMaterial 
        color="#3b82f6" 
        transparent 
        opacity={0.12} 
        side={THREE.BackSide} 
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// --- 3. MARKERS & PATHS ---

function LaunchSiteMarker({ lat, lon, name, isActive }: { lat: number; lon: number; name: string; isActive: boolean }) {
  const position = useMemo(() => latLonToVector3(lat, lon, 2.02), [lat, lon])
  const [hovered, setHovered] = useState(false)

  return (
    <group position={position}>
      <mesh onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[isActive ? 0.04 : 0.025, 16, 16]} />
        <meshBasicMaterial color={isActive ? "#22d3ee" : "#94a3b8"} transparent opacity={isActive ? 1 : 0.8} />
      </mesh>
      {isActive && (
        <mesh>
          <ringGeometry args={[0.06, 0.08, 32]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
      {hovered && (
        <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
          <div className="rounded-md bg-black/90 px-2 py-1 text-xs font-sans text-white shadow-lg border border-white/20 whitespace-nowrap backdrop-blur-sm">
            {name}
          </div>
        </Html>
      )}
    </group>
  )
}

function CorridorPath({ path, visible, color = "#22d3ee" }: { path: { lat: number; lon: number }[]; visible: boolean; color?: string }) {
  const points = useMemo(() => path.map((p) => latLonToVector3(p.lat, p.lon, 2.03)), [path])
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  if (!visible || points.length === 0) return null

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={2} transparent opacity={0.8} />
    </line>
  )
}

function CorridorBuffer({ path, width, visible, color = "#22d3ee" }: { path: { lat: number; lon: number }[]; width: number; visible: boolean; color?: string }) {
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
      <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

function HotspotMarker({ hotspot, visible, onHover }: { hotspot: Hotspot; visible: boolean; onHover: (h: Hotspot | null) => void }) {
  const position = useMemo(() => latLonToVector3(hotspot.lat, hotspot.lon, 2.05), [hotspot.lat, hotspot.lon])
  const [hovered, setHovered] = useState(false)
  const pulseRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.3)
    }
  })

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setHovered(true)
      onHover(hotspot)
    }, [hotspot, onHover])

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
          <div className="rounded-md bg-black/90 px-3 py-2 text-xs font-sans text-white shadow-lg border border-white/20 whitespace-nowrap backdrop-blur-sm">
            <div className="font-medium">{hotspot.label}</div>
            <div className="text-gray-300">Alt: {hotspot.altitudeBand} | Risk: {(hotspot.weight * 100).toFixed(0)}%</div>
          </div>
        </Html>
      )}
    </group>
  )
}

// --- 4. SATELLITE LAYER (FIXED) ---

const SAT_COLORS: Record<string, string> = {
  active: "#3b82f6", // Blue
  debris: "#ef4444", // Red
  station: "#ffffff", // White
  recent: "#22c55e", // Green
}

function SatelliteLayer({ satellites }: { satellites: SatellitePosition[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  // Use LayoutEffect to ensure matrices are updated BEFORE the next paint
  useLayoutEffect(() => {
    if (!meshRef.current || !satellites || satellites.length === 0) return

    const tempObject = new THREE.Object3D()
    const color = new THREE.Color()

    for (let i = 0; i < satellites.length; i++) {
      const sat = satellites[i]
      
      // Calculate Position
      const normAlt = Math.min(sat.altitudeKm / 2000, 1)
      const radius = 2.1 + normAlt * 0.4 // Lifted off surface
      const pos = latLonToVector3(sat.lat, sat.lon, radius)
      
      tempObject.position.copy(pos)
      
      // Calculate Scale (make them visible)
      const scale = sat.type === "station" ? 0.04 : sat.type === "debris" ? 0.015 : 0.02
      tempObject.scale.setScalar(scale)
      
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)

      // Calculate Color
      color.set(SAT_COLORS[sat.type] || "#3b82f6")
      meshRef.current.setColorAt(i, color)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true

  }, [satellites])

  const satLength = satellites?.length ?? 0

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.instanceId !== undefined && e.instanceId < satLength) {
      setHoveredIdx(e.instanceId)
    }
  }, [satLength])

  const handlePointerOut = useCallback(() => {
    setHoveredIdx(null)
  }, [])

  if (!satellites || satellites.length === 0) return null
  const hoveredSat = hoveredIdx !== null ? satellites[hoveredIdx] : null

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, satellites.length]}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      
      {/* Tooltip */}
      {hoveredSat && (
        <group position={latLonToVector3(hoveredSat.lat, hoveredSat.lon, 2.15 + Math.min(hoveredSat.altitudeKm / 2000, 1) * 0.4)}>
          <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
            <div className="rounded-md bg-black/90 px-3 py-2 text-xs font-sans text-white shadow-lg border border-white/20 whitespace-nowrap backdrop-blur-sm z-50">
              <div className="font-medium text-blue-300">{hoveredSat.name}</div>
              <div className="text-gray-300 flex gap-2">
                <span>NORAD {hoveredSat.noradId}</span>
                <span>Alt: {Math.round(hoveredSat.altitudeKm)} km</span>
              </div>
              <div className="text-gray-400 capitalize">{hoveredSat.type}</div>
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}

// --- 5. MAIN SCENE ---

function GlobeScene({
  launchSite,
  corridorPath,
  corridorWidth,
  hotspots,
  showCorridor,
  showHotspots,
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
  satellites: SatellitePosition[]
  compareCorridorPath?: { lat: number; lon: number }[]
  onHotspotHover: (h: Hotspot | null) => void
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 5, 5]} intensity={2} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      {/* Textured Earth */}
      <Earth />
      <Atmosphere />

      {/* Satellites - Always Visible */}
      <SatelliteLayer satellites={satellites} />

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
        maxDistance={9}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}

// --- 6. EXPORTED COMPONENT ---

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
  showSatellites, // Ignored: Satellites are always shown now
  satellites,
  compareCorridorPath,
}: GlobeVisualizationProps) {
  const [, setHoveredHotspot] = useState<Hotspot | null>(null)

  return (
    <div className="w-full h-full relative bg-slate-950">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <React.Suspense fallback={null}>
            <GlobeScene
            launchSite={launchSite}
            corridorPath={corridorPath}
            corridorWidth={corridorWidth}
            hotspots={hotspots}
            showCorridor={showCorridor}
            showHotspots={showHotspots}
            satellites={satellites}
            compareCorridorPath={compareCorridorPath}
            onHotspotHover={setHoveredHotspot}
            />
        </React.Suspense>
      </Canvas>
    </div>
  )
}