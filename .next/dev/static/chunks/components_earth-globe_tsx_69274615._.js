(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/earth-globe.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EarthGlobe
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.182.0/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.182.0/node_modules/three/build/three.module.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$globe$40$2$2e$45$2e$0_three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2d$globe$2f$dist$2f$three$2d$globe$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three-globe@2.45.0_three@0.182.0/node_modules/three-globe/dist/three-globe.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$examples$2f$jsm$2f$controls$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.182.0/node_modules/three/examples/jsm/controls/OrbitControls.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function EarthGlobe({ launchSite, hotspots = null, satellites = [] }) {
    _s();
    const mountRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const globeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const animRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EarthGlobe.useEffect": ()=>{
            if (!mountRef.current) return;
            const scene = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scene"]();
            const camera = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PerspectiveCamera"](45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
            camera.position.z = 300;
            const renderer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["WebGLRenderer"]({
                antialias: true,
                alpha: true
            });
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            mountRef.current.innerHTML = "";
            mountRef.current.appendChild(renderer.domElement);
            // lights
            scene.add(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AmbientLight"](0xbbbbbb));
            const dir = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DirectionalLight"](0xffffff, 0.6);
            dir.position.set(5, 3, 5);
            scene.add(dir);
            // three-globe
            const globe = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$2d$globe$40$2$2e$45$2e$0_three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2d$globe$2f$dist$2f$three$2d$globe$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]();
            globe.globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg');
            globe.showAtmosphere(true);
            globe.atmosphereColor('#3fb0ff');
            globe.atmosphereAltitude(0.25);
            globe.pointsData([]);
            scene.add(globe);
            globeRef.current = globe;
            // controls
            const controls = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$examples$2f$jsm$2f$controls$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrbitControls"](camera, renderer.domElement);
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.25;
            controls.enablePan = false;
            const handleResize = {
                "EarthGlobe.useEffect.handleResize": ()=>{
                    if (!mountRef.current) return;
                    const w = mountRef.current.clientWidth;
                    const h = mountRef.current.clientHeight;
                    camera.aspect = w / h;
                    camera.updateProjectionMatrix();
                    renderer.setSize(w, h);
                }
            }["EarthGlobe.useEffect.handleResize"];
            window.addEventListener('resize', handleResize);
            const animate = {
                "EarthGlobe.useEffect.animate": ()=>{
                    controls.update();
                    renderer.render(scene, camera);
                    animRef.current = requestAnimationFrame(animate);
                }
            }["EarthGlobe.useEffect.animate"];
            animate();
            return ({
                "EarthGlobe.useEffect": ()=>{
                    if (animRef.current) cancelAnimationFrame(animRef.current);
                    window.removeEventListener('resize', handleResize);
                    controls.dispose();
                    renderer.dispose();
                    scene.clear();
                    if (mountRef.current) mountRef.current.innerHTML = '';
                }
            })["EarthGlobe.useEffect"];
        }
    }["EarthGlobe.useEffect"], []);
    // update points when satellites or hotspots change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EarthGlobe.useEffect": ()=>{
            const globe = globeRef.current;
            if (!globe) return;
            // prepare satellite points
            const satPoints = (satellites ?? []).map({
                "EarthGlobe.useEffect.satPoints": (s)=>({
                        lat: s.lat,
                        lng: s.lon,
                        size: Math.max(0.2, Math.min(1.5, ((s.altitudeKm ?? 400) - 200) / 1000)),
                        color: s.type === 'debris' ? 'rgba(255,120,80,0.95)' : s.type === 'station' ? 'rgba(120,200,255,0.95)' : 'rgba(120,220,120,0.9)',
                        name: s.name
                    })
            }["EarthGlobe.useEffect.satPoints"]);
            // prepare hotspots as points too (different color/size)
            const hotPoints = (hotspots ?? []).map({
                "EarthGlobe.useEffect.hotPoints": (h)=>({
                        lat: h.lat,
                        lng: h.lon,
                        size: Math.max(0.4, Math.min(2.0, (h.weight ?? 0.2) * 2)),
                        color: h.weight && h.weight > 0.7 ? 'rgba(255,60,60,0.95)' : 'rgba(255,200,60,0.9)',
                        name: h.label
                    })
            }["EarthGlobe.useEffect.hotPoints"]);
            // combine and set as pointsData
            const points = [
                ...satPoints,
                ...hotPoints
            ];
            globe.pointsData(points).pointLat({
                "EarthGlobe.useEffect": (d)=>d.lat
            }["EarthGlobe.useEffect"]).pointLng({
                "EarthGlobe.useEffect": (d)=>d.lng
            }["EarthGlobe.useEffect"]).pointColor({
                "EarthGlobe.useEffect": (d)=>d.color
            }["EarthGlobe.useEffect"]).pointAltitude({
                "EarthGlobe.useEffect": (d)=>0.002 + (d.size || 0.5) * 0.001
            }["EarthGlobe.useEffect"]).pointRadius({
                "EarthGlobe.useEffect": (d)=>(d.size || 0.5) * 0.45
            }["EarthGlobe.useEffect"]);
        }
    }["EarthGlobe.useEffect"], [
        satellites,
        hotspots
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: mountRef,
        style: {
            width: '100%',
            height: 600,
            maxHeight: '80vh',
            borderRadius: 8,
            overflow: 'hidden'
        }
    }, void 0, false, {
        fileName: "[project]/components/earth-globe.tsx",
        lineNumber: 131,
        columnNumber: 5
    }, this);
}
_s(EarthGlobe, "nPuMUTvyxkEZQgMbmiMJbVlx7RA=");
_c = EarthGlobe;
var _c;
__turbopack_context__.k.register(_c, "EarthGlobe");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_earth-globe_tsx_69274615._.js.map