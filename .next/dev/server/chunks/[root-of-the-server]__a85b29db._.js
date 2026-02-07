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
"[project]/lib/launch-data.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALTITUDE_RANGE",
    ()=>ALTITUDE_RANGE,
    "CORRIDOR_WIDTH_RANGE",
    ()=>CORRIDOR_WIDTH_RANGE,
    "DEBRIS_DENSITY_BY_BAND",
    ()=>DEBRIS_DENSITY_BY_BAND,
    "HIGH_DENSITY_INCLINATIONS",
    ()=>HIGH_DENSITY_INCLINATIONS,
    "INCLINATION_PRESETS",
    ()=>INCLINATION_PRESETS,
    "LAUNCH_SITES",
    ()=>LAUNCH_SITES,
    "TIME_RISK_MODIFIERS",
    ()=>TIME_RISK_MODIFIERS
]);
const LAUNCH_SITES = [
    {
        name: "Cape Canaveral",
        lat: 28.3922,
        lon: -80.6077,
        code: "CC"
    },
    {
        name: "Vandenberg",
        lat: 34.7420,
        lon: -120.5724,
        code: "VB"
    },
    {
        name: "Baikonur",
        lat: 45.9650,
        lon: 63.3050,
        code: "BK"
    },
    {
        name: "Kourou",
        lat: 5.2360,
        lon: -52.7686,
        code: "KR"
    }
];
const INCLINATION_PRESETS = [
    {
        label: "Equatorial",
        value: 0
    },
    {
        label: "Cape Canaveral Min",
        value: 28.5
    },
    {
        label: "ISS",
        value: 51.6
    },
    {
        label: "Starlink",
        value: 53
    },
    {
        label: "Sun-synchronous",
        value: 97.4
    }
];
const ALTITUDE_RANGE = {
    min: 200,
    max: 1200
};
const CORRIDOR_WIDTH_RANGE = {
    min: 5,
    max: 100
};
const DEBRIS_DENSITY_BY_BAND = [
    {
        bandStart: 200,
        bandEnd: 250,
        density: 0.05
    },
    {
        bandStart: 250,
        bandEnd: 300,
        density: 0.08
    },
    {
        bandStart: 300,
        bandEnd: 350,
        density: 0.12
    },
    {
        bandStart: 350,
        bandEnd: 400,
        density: 0.18
    },
    {
        bandStart: 400,
        bandEnd: 450,
        density: 0.25
    },
    {
        bandStart: 450,
        bandEnd: 500,
        density: 0.35
    },
    {
        bandStart: 500,
        bandEnd: 550,
        density: 0.55
    },
    {
        bandStart: 550,
        bandEnd: 600,
        density: 0.72
    },
    {
        bandStart: 600,
        bandEnd: 650,
        density: 0.68
    },
    {
        bandStart: 650,
        bandEnd: 700,
        density: 0.58
    },
    {
        bandStart: 700,
        bandEnd: 750,
        density: 0.75
    },
    {
        bandStart: 750,
        bandEnd: 800,
        density: 0.92
    },
    {
        bandStart: 800,
        bandEnd: 850,
        density: 0.98
    },
    {
        bandStart: 850,
        bandEnd: 900,
        density: 0.85
    },
    {
        bandStart: 900,
        bandEnd: 950,
        density: 0.62
    },
    {
        bandStart: 950,
        bandEnd: 1000,
        density: 0.48
    },
    {
        bandStart: 1000,
        bandEnd: 1050,
        density: 0.35
    },
    {
        bandStart: 1050,
        bandEnd: 1100,
        density: 0.28
    },
    {
        bandStart: 1100,
        bandEnd: 1150,
        density: 0.20
    },
    {
        bandStart: 1150,
        bandEnd: 1200,
        density: 0.15
    }
];
const HIGH_DENSITY_INCLINATIONS = [
    {
        center: 51.6,
        width: 5,
        factor: 1.3,
        label: "ISS corridor"
    },
    {
        center: 53,
        width: 3,
        factor: 1.2,
        label: "Starlink band"
    },
    {
        center: 97.4,
        width: 4,
        factor: 1.4,
        label: "Sun-synch corridor"
    },
    {
        center: 82,
        width: 6,
        factor: 1.1,
        label: "Polar orbit zone"
    }
];
const TIME_RISK_MODIFIERS = {
    "0": 0.95,
    "1": 0.94,
    "2": 0.93,
    "3": 0.92,
    "4": 0.93,
    "5": 0.95,
    "6": 0.98,
    "7": 1.0,
    "8": 1.02,
    "9": 1.04,
    "10": 1.05,
    "11": 1.06,
    "12": 1.06,
    "13": 1.05,
    "14": 1.04,
    "15": 1.03,
    "16": 1.02,
    "17": 1.01,
    "18": 1.0,
    "19": 0.99,
    "20": 0.98,
    "21": 0.97,
    "22": 0.96,
    "23": 0.95
};
}),
"[project]/lib/risk-engine.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateRisk",
    ()=>calculateRisk
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$launch$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/launch-data.ts [app-route] (ecmascript)");
;
function toRad(deg) {
    return deg * Math.PI / 180;
}
function toDeg(rad) {
    return rad * 180 / Math.PI;
}
// Generate simplified corridor path (great circle arc from launch site)
function generateCorridorPath(lat, lon, inclination, targetAlt) {
    const points = [];
    const numPoints = 60;
    const azimuth = toRad(90 - inclination) // simplified: launch azimuth from inclination
    ;
    for(let i = 0; i <= numPoints; i++){
        const fraction = i / numPoints;
        const distance = fraction * (targetAlt / 100) // arc length proportional to altitude
        ;
        const angularDistance = toRad(distance);
        const lat1 = toRad(lat);
        const lon1 = toRad(lon);
        const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angularDistance) + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(azimuth));
        const lon2 = lon1 + Math.atan2(Math.sin(azimuth) * Math.sin(angularDistance) * Math.cos(lat1), Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2));
        points.push({
            lat: toDeg(lat2),
            lon: toDeg(lon2)
        });
    }
    return points;
}
// Calculate corridor width factor (wider corridor = more exposure)
function corridorWidthFactor(widthKm) {
    return 0.5 + widthKm / 100 * 0.5 // normalized 0.5-1.0
    ;
}
// Calculate inclination match factor
function inclinationFactor(inclination) {
    let factor = 1.0;
    for (const band of __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$launch$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HIGH_DENSITY_INCLINATIONS"]){
        const diff = Math.abs(inclination - band.center);
        if (diff <= band.width) {
            const closeness = 1 - diff / band.width;
            factor = Math.max(factor, 1 + (band.factor - 1) * closeness);
        }
    }
    return factor;
}
// Get time-of-day modifier
function timeFactor(datetime) {
    try {
        const date = new Date(datetime);
        const hour = date.getUTCHours().toString();
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$launch$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TIME_RISK_MODIFIERS"][hour] ?? 1.0;
    } catch  {
        return 1.0;
    }
}
function calculateRisk(profile) {
    const { launchSite, targetAltitudeKm, inclinationDeg, corridorWidthKm, launchDatetimeUtc } = profile;
    // Calculate per-band risk
    const cwFactor = corridorWidthFactor(corridorWidthKm);
    const incFactor = inclinationFactor(inclinationDeg);
    const tFactor = timeFactor(launchDatetimeUtc);
    // The launch traverses from 0 to targetAltitude, so we consider all bands up to target
    const relevantBands = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$launch$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEBRIS_DENSITY_BY_BAND"].filter((b)=>b.bandStart < targetAltitudeKm);
    const riskByAltitude = relevantBands.map((band)=>{
        // Higher risk for bands closer to target altitude (more time spent there)
        const altProximity = 1 - Math.abs(targetAltitudeKm - (band.bandStart + band.bandEnd) / 2) / targetAltitudeKm;
        const proximityWeight = 0.5 + altProximity * 0.5;
        const rawRisk = band.density * cwFactor * incFactor * tFactor * proximityWeight;
        return {
            bandStart: band.bandStart,
            bandEnd: band.bandEnd,
            risk: Math.min(rawRisk, 1)
        };
    });
    // Overall risk: weighted average of band risks
    const totalRisk = riskByAltitude.reduce((sum, b)=>sum + b.risk, 0) / Math.max(riskByAltitude.length, 1);
    const overallRisk = Math.min(Math.max(totalRisk, 0), 1);
    // Risk label
    let riskLabel = "LOW";
    if (overallRisk >= 0.6) riskLabel = "HIGH";
    else if (overallRisk >= 0.3) riskLabel = "MEDIUM";
    // Top risk drivers
    const drivers = [];
    // Find the peak density band
    const peakBand = [
        ...riskByAltitude
    ].sort((a, b)=>b.risk - a.risk)[0];
    if (peakBand) {
        drivers.push({
            description: `High density in ${peakBand.bandStart}-${peakBand.bandEnd} km band`,
            contribution: peakBand.risk
        });
    }
    // Check inclination factor
    const matchingIncBand = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$launch$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HIGH_DENSITY_INCLINATIONS"].find((b)=>Math.abs(inclinationDeg - b.center) <= b.width);
    if (matchingIncBand) {
        drivers.push({
            description: `Inclination matches ${matchingIncBand.label} (${matchingIncBand.center} deg)`,
            contribution: (incFactor - 1) * 0.5
        });
    }
    if (corridorWidthKm > 50) {
        drivers.push({
            description: `Wide corridor (${corridorWidthKm} km) increases exposure area`,
            contribution: cwFactor * 0.3
        });
    }
    if (targetAltitudeKm >= 700 && targetAltitudeKm <= 900) {
        drivers.push({
            description: `Target altitude ${targetAltitudeKm} km is in the high-density debris shell`,
            contribution: 0.4
        });
    }
    // Always show at least the altitude band driver, then pad with general ones
    if (drivers.length < 3) {
        drivers.push({
            description: `Traverses ${relevantBands.length} altitude bands (200-${targetAltitudeKm} km)`,
            contribution: relevantBands.length * 0.02
        });
    }
    // Top 3 drivers
    const topDrivers = drivers.sort((a, b)=>b.contribution - a.contribution).slice(0, 3);
    // Hotspots (top 5 risk bands mapped to geographic points along corridor)
    const corridorPath = generateCorridorPath(launchSite.lat, launchSite.lon, inclinationDeg, targetAltitudeKm);
    const sortedBands = [
        ...riskByAltitude
    ].sort((a, b)=>b.risk - a.risk);
    const hotspots = sortedBands.slice(0, 5).map((band, i)=>{
        const pathIndex = Math.min(Math.floor(band.bandStart / targetAltitudeKm * corridorPath.length), corridorPath.length - 1);
        const point = corridorPath[pathIndex];
        return {
            lat: point.lat + (Math.random() - 0.5) * 2,
            lon: point.lon + (Math.random() - 0.5) * 2,
            weight: band.risk,
            label: `Debris cluster at ${band.bandStart}-${band.bandEnd} km`,
            altitudeBand: `${band.bandStart}-${band.bandEnd} km`
        };
    });
    // Recommendations
    const recommendations = [];
    // Altitude tweak
    const lowerAlt = targetAltitudeKm - 30;
    if (lowerAlt >= 200) {
        const lowerBands = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$launch$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEBRIS_DENSITY_BY_BAND"].filter((b)=>b.bandStart < lowerAlt);
        const lowerDensity = lowerBands.reduce((s, b)=>s + b.density, 0) / lowerBands.length;
        const currentDensity = relevantBands.reduce((s, b)=>s + b.density, 0) / relevantBands.length;
        const delta = (currentDensity - lowerDensity) / currentDensity * 100;
        if (delta > 2) {
            recommendations.push({
                action: `Target ${lowerAlt} km instead of ${targetAltitudeKm} km`,
                benefit: `${delta.toFixed(0)}% less debris exposure`,
                delta: -Math.round(delta)
            });
        }
    }
    // Corridor width tweak
    if (corridorWidthKm > 20) {
        const narrowerWidth = Math.max(corridorWidthKm - 20, 5);
        const narrowerFactor = corridorWidthFactor(narrowerWidth);
        const delta = (cwFactor - narrowerFactor) / cwFactor * 100;
        recommendations.push({
            action: `Reduce corridor to ${narrowerWidth} km`,
            benefit: `${delta.toFixed(0)}% smaller exposure footprint`,
            delta: -Math.round(delta)
        });
    }
    // Time shift recommendation
    const currentHour = new Date(launchDatetimeUtc).getUTCHours();
    const bestHour = Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$launch$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TIME_RISK_MODIFIERS"]).sort(([, a], [, b])=>a - b)[0];
    if (bestHour && parseInt(bestHour[0]) !== currentHour) {
        const hourDiff = parseInt(bestHour[0]) - currentHour;
        const sign = hourDiff > 0 ? "+" : "";
        const delta = (tFactor - bestHour[1]) / tFactor * 100;
        if (delta > 1) {
            recommendations.push({
                action: `Shift launch time ${sign}${hourDiff}h UTC`,
                benefit: `${delta.toFixed(0)}% lower solar activity risk`,
                delta: -Math.round(delta)
            });
        }
    }
    return {
        overallRisk: Math.round(overallRisk * 1000) / 1000,
        riskLabel,
        topDrivers,
        riskByAltitude,
        hotspots,
        recommendations: recommendations.slice(0, 3),
        corridorPath
    };
}
}),
"[project]/app/api/compare/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$risk$2d$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/risk-engine.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const body = await request.json();
        if (!body.scenarioA || !body.scenarioB) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Both scenarios are required"
            }, {
                status: 400
            });
        }
        const resultA = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$risk$2d$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateRisk"])(body.scenarioA);
        const resultB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$risk$2d$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateRisk"])(body.scenarioB);
        const deltaRisk = resultB.overallRisk - resultA.overallRisk;
        const deltaPercent = resultA.overallRisk > 0 ? Math.round(deltaRisk / resultA.overallRisk * 100) : 0;
        // Generate comparison reasons
        const reasons = [];
        if (body.scenarioA.targetAltitudeKm !== body.scenarioB.targetAltitudeKm) {
            const diff = body.scenarioB.targetAltitudeKm - body.scenarioA.targetAltitudeKm;
            reasons.push(`Altitude ${diff > 0 ? "increase" : "decrease"} of ${Math.abs(diff)} km ${diff > 0 ? "raises" : "lowers"} debris exposure`);
        }
        if (body.scenarioA.inclinationDeg !== body.scenarioB.inclinationDeg) {
            reasons.push(`Inclination change from ${body.scenarioA.inclinationDeg} to ${body.scenarioB.inclinationDeg} deg affects orbital crossing patterns`);
        }
        if (body.scenarioA.corridorWidthKm !== body.scenarioB.corridorWidthKm) {
            const diff = body.scenarioB.corridorWidthKm - body.scenarioA.corridorWidthKm;
            reasons.push(`Corridor width ${diff > 0 ? "increase" : "decrease"} of ${Math.abs(diff)} km ${diff > 0 ? "expands" : "reduces"} exposure zone`);
        }
        if (body.scenarioA.launchSite.code !== body.scenarioB.launchSite.code) {
            reasons.push(`Different launch site changes the ground track and debris intersection geometry`);
        }
        if (reasons.length === 0) {
            reasons.push("Scenarios are identical or differ only in launch time");
        }
        const result = {
            scenarioA: resultA,
            scenarioB: resultB,
            deltaRisk: Math.round(deltaRisk * 1000) / 1000,
            deltaPercent,
            reasons
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
    } catch (error) {
        console.error("Compare error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to compare scenarios"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a85b29db._.js.map