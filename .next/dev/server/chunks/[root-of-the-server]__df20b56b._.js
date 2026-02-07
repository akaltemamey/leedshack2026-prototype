module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/celestrak/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$satellite$2e$js$40$6$2e$0$2e$2$2f$node_modules$2f$satellite$2e$js$2f$dist$2f$satellite$2e$es$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/satellite.js@6.0.2/node_modules/satellite.js/dist/satellite.es.js [app-route] (ecmascript)");
;
;
// Cache the fetched data for 10 minutes
let cache = {
    data: null,
    fetchedAt: 0
};
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
;
// Fetch the comprehensive TLE index from CelesTrak
async function fetchTleIndex() {
    const url = "https://celestrak.org/NORAD/elements/index.php?FORMAT=tle";
    const res = await fetch(url, {
        signal: AbortSignal.timeout(30000)
    });
    if (!res.ok) throw new Error("Failed to fetch TLE index");
    return res.text();
}
async function buildCelestrakData() {
    const now = new Date();
    // Fetch TLE index and parse into TLE triples
    const tleText = await fetchTleIndex();
    const lines = tleText.split(/\r?\n/).map((l)=>l.trim()).filter(Boolean);
    const tles = [];
    for(let i = 0; i < lines.length - 2; i++){
        const a = lines[i];
        const b = lines[i + 1];
        const c = lines[i + 2];
        if (b.startsWith("1 ") && c.startsWith("2 ")) {
            tles.push({
                name: a,
                line1: b,
                line2: c
            });
            i += 2;
        }
    }
    // Parse all TLEs and compute positions
    const satellites = [];
    for (const t of tles){
        try {
            const satrec = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$satellite$2e$js$40$6$2e$0$2e$2$2f$node_modules$2f$satellite$2e$js$2f$dist$2f$satellite$2e$es$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["twoline2satrec"](t.line1, t.line2);
            const posVel = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$satellite$2e$js$40$6$2e$0$2e$2$2f$node_modules$2f$satellite$2e$js$2f$dist$2f$satellite$2e$es$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["propagate"](satrec, now);
            if (!posVel.position || typeof posVel.position === 'boolean') continue;
            const gmst = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$satellite$2e$js$40$6$2e$0$2e$2$2f$node_modules$2f$satellite$2e$js$2f$dist$2f$satellite$2e$es$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gstime"](now);
            const geo = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$satellite$2e$js$40$6$2e$0$2e$2$2f$node_modules$2f$satellite$2e$js$2f$dist$2f$satellite$2e$es$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eciToGeodetic"](posVel.position, gmst);
            const lat = geo.latitude * 180 / Math.PI;
            const lon = geo.longitude * 180 / Math.PI;
            const altitudeKm = geo.height;
            if (!isFinite(lat) || !isFinite(lon) || altitudeKm < 0) continue;
            // Determine type from name
            const lname = (t.name || "").toLowerCase();
            let type = "active";
            if (lname.includes("debris") || lname.includes("deb")) type = "debris";
            else if (lname.includes("station") || lname.includes("iss")) type = "station";
            satellites.push({
                name: t.name,
                noradId: parseInt(t.line1.substring(2, 7).trim(), 10) || 0,
                lat,
                lon,
                altitudeKm,
                inclination: (satrec.inclo || 0) * (180 / Math.PI),
                type
            });
        } catch  {
        // Skip bad TLEs
        }
    }
    // Compute density bands from satellite altitudes (200-1200 km, 50 km bins)
    const bandSize = 50;
    const minAlt = 200;
    const maxAlt = 1200;
    const bands = [];
    for(let start = minAlt; start < maxAlt; start += bandSize){
        bands.push({
            bandStart: start,
            bandEnd: start + bandSize,
            objectCount: 0,
            density: 0
        });
    }
    for (const s of satellites){
        for (const band of bands){
            if (s.altitudeKm >= band.bandStart && s.altitudeKm < band.bandEnd) {
                band.objectCount++;
                break;
            }
        }
    }
    const maxCount = Math.max(...bands.map((b)=>b.objectCount), 1);
    for (const band of bands)band.density = band.objectCount / maxCount;
    const peakBand = bands.length > 0 ? bands.reduce((max, b)=>b.objectCount > max.objectCount ? b : max, bands[0]) : {
        bandStart: 0,
        bandEnd: 0,
        objectCount: 0,
        density: 0
    };
    const totalTracked = satellites.length;
    const activeSats = satellites.filter((s)=>s.type === "active").length;
    const debrisObjects = satellites.filter((s)=>s.type === "debris").length;
    const stationObjects = satellites.filter((s)=>s.type === "station").length;
    const avgAlt = Math.round(satellites.reduce((s, x)=>s + (x.altitudeKm || 0), 0) / Math.max(satellites.length, 1));
    return {
        satellites,
        densityBands: bands,
        stats: {
            totalTracked,
            activeSats,
            debrisObjects,
            stationObjects,
            recentLaunches: 0,
            avgAltitude: avgAlt,
            peakBand: `${peakBand.bandStart}-${peakBand.bandEnd} km`,
            peakCount: peakBand.objectCount
        },
        lastUpdated: now.toISOString()
    };
}
async function GET() {
    // Check cache
    if (cache.data && Date.now() - cache.fetchedAt < CACHE_TTL) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(cache.data);
    }
    try {
        const data = await buildCelestrakData();
        cache = {
            data,
            fetchedAt: Date.now()
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data);
    } catch (error) {
        // If we have stale cache, use it
        if (cache.data) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(cache.data);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch CelesTrak data"
        }, {
            status: 502
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__df20b56b._.js.map