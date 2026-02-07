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
"[project]/lib/orbital.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeAltitudes",
    ()=>computeAltitudes,
    "computeDensityBands",
    ()=>computeDensityBands,
    "ommToPosition",
    ()=>ommToPosition,
    "subsampleForGlobe",
    ()=>subsampleForGlobe
]);
// Orbital mechanics utilities for converting CelesTrak OMM data to positions
const MU = 398600.4418 // Earth gravitational parameter km³/s²
;
const RE = 6371.0 // Earth radius km
;
const TWO_PI = 2 * Math.PI;
// Convert mean motion (rev/day) to semi-major axis (km)
function meanMotionToSMA(meanMotion) {
    const n = meanMotion * TWO_PI / 86400.0 // rad/s
    ;
    if (n <= 0) return RE + 400 // fallback
    ;
    return Math.pow(MU / (n * n), 1 / 3);
}
function computeAltitudes(meanMotion, eccentricity) {
    const a = meanMotionToSMA(meanMotion);
    const perigee = a * (1 - eccentricity) - RE;
    const apogee = a * (1 + eccentricity) - RE;
    const mean = a - RE;
    return {
        perigee,
        apogee,
        mean
    };
}
// Solve Kepler's equation M = E - e*sin(E) for E using Newton-Raphson
function solveKepler(M, e, tol = 1e-8, maxIter = 50) {
    let E = M // initial guess
    ;
    for(let i = 0; i < maxIter; i++){
        const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        E -= dE;
        if (Math.abs(dE) < tol) break;
    }
    return E;
}
function ommToPosition(record, now) {
    const { MEAN_MOTION, ECCENTRICITY, INCLINATION, RA_OF_ASC_NODE, ARG_OF_PERICENTER, MEAN_ANOMALY, EPOCH } = record;
    const a = meanMotionToSMA(MEAN_MOTION);
    const alt = a - RE;
    // Time since epoch in seconds
    const epochDate = new Date(EPOCH);
    const dt = (now.getTime() - epochDate.getTime()) / 1000;
    // Propagate mean anomaly
    const n = MEAN_MOTION * TWO_PI / 86400.0;
    const M0 = MEAN_ANOMALY * Math.PI / 180;
    let M = M0 + n * dt;
    // Normalize M to [0, 2π]
    M = (M % TWO_PI + TWO_PI) % TWO_PI;
    // Solve Kepler's equation
    const E = solveKepler(M, ECCENTRICITY);
    // True anomaly
    const sinV = Math.sqrt(1 - ECCENTRICITY * ECCENTRICITY) * Math.sin(E) / (1 - ECCENTRICITY * Math.cos(E));
    const cosV = (Math.cos(E) - ECCENTRICITY) / (1 - ECCENTRICITY * Math.cos(E));
    const v = Math.atan2(sinV, cosV);
    // Argument of latitude
    const u = ARG_OF_PERICENTER * Math.PI / 180 + v;
    // Inclination and RAAN in radians
    const inc = INCLINATION * Math.PI / 180;
    const raan = RA_OF_ASC_NODE * Math.PI / 180;
    // Position in orbital plane to ECI
    const xECI = Math.cos(u) * Math.cos(raan) - Math.sin(u) * Math.sin(raan) * Math.cos(inc);
    const yECI = Math.cos(u) * Math.sin(raan) + Math.sin(u) * Math.cos(raan) * Math.cos(inc);
    const zECI = Math.sin(u) * Math.sin(inc);
    // Earth rotation: Greenwich sidereal time approximation
    const J2000 = new Date("2000-01-01T12:00:00Z");
    const daysSinceJ2000 = (now.getTime() - J2000.getTime()) / 86400000;
    const GMST = (280.46061837 + 360.98564736629 * daysSinceJ2000) % 360 * (Math.PI / 180);
    // Rotate ECI to ECEF
    const xECEF = xECI * Math.cos(GMST) + yECI * Math.sin(GMST);
    const yECEF = -xECI * Math.sin(GMST) + yECI * Math.cos(GMST);
    const zECEF = zECI;
    // ECEF to lat/lon
    const lat = Math.atan2(zECEF, Math.sqrt(xECEF * xECEF + yECEF * yECEF)) * (180 / Math.PI);
    const lon = Math.atan2(yECEF, xECEF) * (180 / Math.PI);
    return {
        lat,
        lon,
        altitudeKm: Math.max(alt, 100)
    };
}
function computeDensityBands(records, bandSize = 50, minAlt = 200, maxAlt = 1200) {
    const bands = [];
    for(let start = minAlt; start < maxAlt; start += bandSize){
        bands.push({
            bandStart: start,
            bandEnd: start + bandSize,
            objectCount: 0,
            density: 0
        });
    }
    for (const rec of records){
        const { perigee, apogee } = computeAltitudes(rec.MEAN_MOTION, rec.ECCENTRICITY);
        // Object passes through all bands between perigee and apogee
        for (const band of bands){
            if (perigee <= band.bandEnd && apogee >= band.bandStart) {
                band.objectCount++;
            }
        }
    }
    // Normalize density to 0-1 range
    const maxCount = Math.max(...bands.map((b)=>b.objectCount), 1);
    for (const band of bands){
        band.density = band.objectCount / maxCount;
    }
    return bands;
}
function subsampleForGlobe(records, maxPoints) {
    if (records.length <= maxPoints) return records;
    const step = Math.ceil(records.length / maxPoints);
    const result = [];
    for(let i = 0; i < records.length; i += step){
        result.push(records[i]);
    }
    return result;
}
}),
"[project]/app/api/celestrak/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$orbital$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/orbital.ts [app-route] (ecmascript)");
;
;
// Cache the fetched data for 10 minutes (CelesTrak updates ~every 8 hours)
let cache = {
    data: null,
    fetchedAt: 0
};
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
;
// Fetch a single CelesTrak group
async function fetchGroup(group, limit) {
    const url = new URL("https://celestrak.org/NORAD/elements/gp.php");
    url.searchParams.set("GROUP", group);
    url.searchParams.set("FORMAT", "json");
    if (limit) url.searchParams.set("LIMIT", limit.toString());
    try {
        const res = await fetch(url.toString(), {
            headers: {
                Accept: "application/json"
            },
            signal: AbortSignal.timeout(15000)
        });
        if (!res.ok) return [];
        const data = await res.json();
        if (!Array.isArray(data)) return [];
        return data;
    } catch  {
        return [];
    }
}
async function buildCelestrakData() {
    const now = new Date();
    // Fetch multiple groups in parallel
    const [stations, active, cosmos1408, fengyun1c, iridium33, recent] = await Promise.all([
        fetchGroup("stations"),
        fetchGroup("active", 1500),
        fetchGroup("cosmos-1408-debris", 300),
        fetchGroup("1999-025", 300),
        fetchGroup("iridium-33-debris", 200),
        fetchGroup("last-30-days", 200)
    ]);
    // Categorize and tag
    const allRecords = [];
    for (const r of stations)allRecords.push({
        record: r,
        type: "station"
    });
    for (const r of active)allRecords.push({
        record: r,
        type: "active"
    });
    for (const r of cosmos1408)allRecords.push({
        record: r,
        type: "debris"
    });
    for (const r of fengyun1c)allRecords.push({
        record: r,
        type: "debris"
    });
    for (const r of iridium33)allRecords.push({
        record: r,
        type: "debris"
    });
    for (const r of recent)allRecords.push({
        record: r,
        type: "recent"
    });
    // Deduplicate by NORAD ID
    const seen = new Set();
    const unique = allRecords.filter(({ record })=>{
        if (seen.has(record.NORAD_CAT_ID)) return false;
        seen.add(record.NORAD_CAT_ID);
        return true;
    });
    // Compute density bands from ALL records
    const allOmm = unique.map((u)=>u.record);
    const densityBands = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$orbital$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeDensityBands"])(allOmm);
    // Convert ALL unique records to positions (no subsampling)
    const satellites = [];
    for (const { record, type } of unique){
        try {
            const pos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$orbital$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ommToPosition"])(record, now);
            // Filter out objects that are clearly decayed or have bad data
            if (pos.altitudeKm < 100 || pos.altitudeKm > 50000) continue;
            if (Number.isNaN(pos.lat) || Number.isNaN(pos.lon)) continue;
            satellites.push({
                name: record.OBJECT_NAME,
                noradId: record.NORAD_CAT_ID,
                lat: pos.lat,
                lon: pos.lon,
                altitudeKm: pos.altitudeKm,
                inclination: record.INCLINATION,
                type
            });
        } catch  {
        // Skip records with bad orbital elements
        }
    }
    // Compute stats
    const debrisCount = cosmos1408.length + fengyun1c.length + iridium33.length;
    const altitudes = allOmm.map((r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$orbital$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeAltitudes"])(r.MEAN_MOTION, r.ECCENTRICITY).mean).filter((a)=>a > 0 && a < 50000);
    const avgAlt = altitudes.length > 0 ? altitudes.reduce((s, a)=>s + a, 0) / altitudes.length : 0;
    const peakBand = densityBands.reduce((max, b)=>b.objectCount > max.objectCount ? b : max, densityBands[0]);
    return {
        satellites,
        densityBands,
        stats: {
            totalTracked: unique.length,
            activeSats: active.length,
            debrisObjects: debrisCount,
            stationObjects: stations.length,
            recentLaunches: recent.length,
            avgAltitude: Math.round(avgAlt),
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

//# sourceMappingURL=%5Broot-of-the-server%5D__8417f4a7._.js.map