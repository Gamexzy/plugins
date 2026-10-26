//=============================================================================
// RPG Maker MZ - WorldClimateEngine.js [v3.0.0]
// Motor Planetário determinístico de 8 Camadas (Macro-Grid 512x256 + Sub-Escala)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc [v3.0.0] Motor Planetário Xianxia Determinístico: Relevo, Sombra de Chuva, Veias de Dragão, Cataclismos Antigos, Hidrologia D8 Condicional e Biomas Whittaker+Wuxing.
 * @author Gabriel & Antigravity
 * @version 3.0.0
 * @license MIT
 * @help
 * ============================================================================
 * WorldClimateEngine.js — Pipeline Causal Planetário de 8 Camadas
 * ============================================================================
 * Gera em < 120ms um globo completo em malha macro de 512 x 256 células
 * (equivalente a 8.192 x 4.096 tiles no Overworld e 262.144 x 131.072 tiles
 * na Escala Local 1:1) com looping cilíndrico perfeito Leste-Oeste em X.
 *
 * Camadas geradas na ordem causal física e espiritual:
 * 1. Relevo Primordial & Placas Continentais (Domain Warping + Ridged Multifractal)
 * 2. Clima Físico de Base (Gradiente Latitudinal, Taxa Adiabática, Ventos e Sombra de Chuva)
 * 3. Malha Espiritual Primordial (Picos Ancestrais, Veias de Dragão A* e Elementos Wuxing)
 * 4. Cataclismos Históricos (Ravinas de Espada, Crateras de Palma Celestial e Sangue Divino)
 * 5. Hidrologia Pós-Cataclismo D8 (Priority-Flood, Acumulação de Fluxo, Cânions/Lagos Sagrados)
 * 6. Matriz de Biomas Whittaker + Wuxing + Mata Ciliar / Oásis
 * 7. Povoamento Estratégico (Cidades, Portos em Estuários, Seitas Ortodoxas/Demoníacas e Estradas A*)
 * 8. Reinos Secretos em 3 Camadas (Dongtian Cíclicos, Tumbas Seladas e Fendas Espaciais)
 *
 * @param defaultSeed
 * @text Semente Planetária (0 = Aleatória)
 * @type number
 * @default 948271635
 *
 * @param debugMode
 * @text Modo de Depuração
 * @type boolean
 * @default false
 */

(() => {
    "use strict";

    const pluginName = "WorldClimateEngine";
    const parameters = (typeof PluginManager !== "undefined" && PluginManager.parameters)
        ? PluginManager.parameters(pluginName)
        : {};

    const defaultWorldSeed = Number(parameters["defaultSeed"] || 948271635);
    const debugMode = String(parameters["debugMode"] || "false") === "true";

    // Constantes Topológicas Multi-Resolução
    const MACRO_W = 512;
    const MACRO_H = 256;
    const MACRO_SIZE = MACRO_W * MACRO_H; // 131.072 células

    const OVERWORLD_TILE_PER_MACRO = 16;
    const OVERWORLD_W = MACRO_W * OVERWORLD_TILE_PER_MACRO; // 8192
    const OVERWORLD_H = MACRO_H * OVERWORLD_TILE_PER_MACRO; // 4096

    const LOCAL_TILE_PER_OVERWORLD = 32;
    const LOCAL_W = OVERWORLD_W * LOCAL_TILE_PER_OVERWORLD; // 262144
    const LOCAL_H = OVERWORLD_H * LOCAL_TILE_PER_OVERWORLD; // 131072

    // Direções D8: 0:L, 1:SE, 2:S, 3:SO, 4:O, 5:NO, 6:N, 7:NE
    const D8_DX = [1, 1, 0, -1, -1, -1, 0, 1];
    const D8_DY = [0, 1, 1, 1, 0, -1, -1, -1];
    const D8_DIST = [1.0, Math.SQRT2, 1.0, Math.SQRT2, 1.0, Math.SQRT2, 1.0, Math.SQRT2];
    const D8_OPPOSITE = [4, 5, 6, 7, 0, 1, 2, 3];

    // Limiares Hidrológicos
    const STREAM_FLUX_THRESHOLD = 115.0;
    const RIVER_FLUX_THRESHOLD = 310.0;

    // =========================================================================
    // 1. PRNG DETERMINÍSTICO (MULBERRY32) & SIMPLEX 3D CILÍNDRICO
    // =========================================================================
    class Mulberry32 {
        constructor(seed = 948271635) {
            this.reseed(seed);
        }

        reseed(seed) {
            let s = Number(seed);
            if (!Number.isFinite(s) || s === 0) s = 948271635;
            this._seed = (s >>> 0) || 948271635;
            this._state = this._seed;
        }

        next() {
            let t = (this._state += 0x6D2B79F5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }

        range(min, max) {
            return min + this.next() * (max - min);
        }

        int(min, max) {
            return Math.floor(this.range(min, max + 1));
        }
    }

    // Pré-computa tabelas trigonométricas de sub-pixel (4x resolução) para larguras padrão
    const TRIG_CACHE = new Map();
    function getTrigTable(totalWidth) {
        let entry = TRIG_CACHE.get(totalWidth);
        if (entry) return entry;
        if (totalWidth <= 8192) {
            const subSteps = totalWidth * 4;
            const mask = subSteps - 1; // totalWidth (512 ou 8192) é potência de 2!
            const cosArr = new Float32Array(subSteps);
            const sinArr = new Float32Array(subSteps);
            const radius = totalWidth / (2.0 * Math.PI);
            for (let s = 0; s < subSteps; s++) {
                const theta = (2.0 * Math.PI * s) / subSteps;
                cosArr[s] = Math.cos(theta) * radius;
                sinArr[s] = Math.sin(theta) * radius;
            }
            entry = { cosArr, sinArr, radius, mask };
            TRIG_CACHE.set(totalWidth, entry);
        }
        return entry;
    }

    // Simplex / Gradient 3D Noise rápido e 100% determinístico por semente
    class CylindricalNoise3D {
        constructor(seed = 948271635) {
            const rng = new Mulberry32(seed);
            this.p = new Uint8Array(512);
            this.permMod12 = new Uint8Array(512);
            const perm = new Uint8Array(256);
            for (let i = 0; i < 256; i++) perm[i] = i;
            for (let i = 255; i > 0; i--) {
                const j = Math.floor(rng.next() * (i + 1));
                const tmp = perm[i];
                perm[i] = perm[j];
                perm[j] = tmp;
            }
            for (let i = 0; i < 512; i++) {
                this.p[i] = perm[i & 255];
                this.permMod12[i] = this.p[i] % 12;
            }
        }

        noise3D(xin, yin, zin) {
            const grad3 = CylindricalNoise3D.GRAD3;
            const p = this.p;
            const permMod12 = this.permMod12;

            const F3 = 0.3333333333333333;
            const G3 = 0.16666666666666666;

            const s = (xin + yin + zin) * F3;
            const xs = xin + s;
            const ys = yin + s;
            const zs = zin + s;
            const i = xs >= 0 ? (xs | 0) : ((xs | 0) === xs ? (xs | 0) : (xs | 0) - 1);
            const j = ys >= 0 ? (ys | 0) : ((ys | 0) === ys ? (ys | 0) : (ys | 0) - 1);
            const k = zs >= 0 ? (zs | 0) : ((zs | 0) === zs ? (zs | 0) : (zs | 0) - 1);

            const t = (i + j + k) * G3;
            const x0 = xin - (i - t);
            const y0 = yin - (j - t);
            const z0 = zin - (k - t);

            let i1, j1, k1, i2, j2, k2;
            if (x0 >= y0) {
                if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
                else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
                else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
            } else {
                if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
                else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
                else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
            }

            const x1 = x0 - i1 + G3;
            const y1 = y0 - j1 + G3;
            const z1 = z0 - k1 + G3;
            const x2 = x0 - i2 + 2.0 * G3;
            const y2 = y0 - j2 + 2.0 * G3;
            const z2 = z0 - k2 + 2.0 * G3;
            const x3 = x0 - 1.0 + 3.0 * G3;
            const y3 = y0 - 1.0 + 3.0 * G3;
            const z3 = z0 - 1.0 + 3.0 * G3;

            const ii = i & 255;
            const jj = j & 255;
            const kk = k & 255;

            let n0 = 0, n1 = 0, n2 = 0, n3 = 0;

            let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
            if (t0 > 0) {
                const gi0 = permMod12[ii + p[jj + p[kk]]] * 3;
                t0 *= t0;
                n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
            }

            let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
            if (t1 > 0) {
                const gi1 = permMod12[ii + i1 + p[jj + j1 + p[kk + k1]]] * 3;
                t1 *= t1;
                n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
            }

            let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
            if (t2 > 0) {
                const gi2 = permMod12[ii + i2 + p[jj + j2 + p[kk + k2]]] * 3;
                t2 *= t2;
                n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
            }

            let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
            if (t3 > 0) {
                const gi3 = permMod12[ii + 1 + p[jj + 1 + p[kk + 1]]] * 3;
                t3 *= t3;
                n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
            }

            return 32.0 * (n0 + n1 + n2 + n3); // [-1, 1]
        }

        /**
         * Amostragem Cilíndrica Sem Costura (Looping Perfeito em X de 0 a totalWidth)
         */
        sampleLoop(x, y, totalWidth, freq, octaves = 1, lacunarity = 2.0, persistence = 0.5) {
            let cx, sx;
            const table = TRIG_CACHE.get(totalWidth);
            if (table) {
                const idx = (Math.round(x * 4.0) & table.mask);
                cx = table.cosArr[idx];
                sx = table.sinArr[idx];
            } else {
                const theta = (2.0 * Math.PI * x) / totalWidth;
                const radius = totalWidth / (2.0 * Math.PI);
                cx = Math.cos(theta) * radius;
                sx = Math.sin(theta) * radius;
            }

            if (octaves === 1) {
                return this.noise3D(cx * freq, sx * freq, y * freq);
            }

            let total = 0;
            let amp = 1.0;
            let maxAmp = 0;
            let f = freq;

            for (let o = 0; o < octaves; o++) {
                total += this.noise3D(cx * f, sx * f, y * f) * amp;
                maxAmp += amp;
                amp *= persistence;
                f *= lacunarity;
            }
            return total / maxAmp;
        }

        sampleRidgedLoop(x, y, totalWidth, freq, octaves = 2) {
            let cx, sx;
            const table = TRIG_CACHE.get(totalWidth);
            if (table) {
                const idx = (Math.round(x * 4.0) & table.mask);
                cx = table.cosArr[idx];
                sx = table.sinArr[idx];
            } else {
                const theta = (2.0 * Math.PI * x) / totalWidth;
                const radius = totalWidth / (2.0 * Math.PI);
                cx = Math.cos(theta) * radius;
                sx = Math.sin(theta) * radius;
            }

            let total = 0;
            let amp = 1.0;
            let maxAmp = 0;
            let f = freq;
            let weight = 1.0;

            for (let o = 0; o < octaves; o++) {
                let signal = 1.0 - Math.abs(this.noise3D(cx * f, sx * f, y * f));
                signal = signal * signal * signal * weight;
                weight = Math.max(0.0, Math.min(1.0, signal * 1.6));
                total += signal * amp;
                maxAmp += amp;
                amp *= 0.5;
                f *= 2.05;
            }
            return total / maxAmp; // [0, 1]
        }
    }

    CylindricalNoise3D.GRAD3 = new Float32Array([
        1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
        1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
        0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1
    ]);

    // =========================================================================
    // 2. ESTRUTURA DE DADOS PLANETÁRIA (PlanetaryMacroGrid 512x256)
    // =========================================================================
    class PlanetaryMacroGrid {
        constructor(width = MACRO_W, height = MACRO_H) {
            this.width = width;
            this.height = height;
            const size = width * height;
            this.size = size;

            this.elevation     = new Float32Array(size); // [-1000m a +3000m]
            this.temperature   = new Float32Array(size); // [-30°C a +45°C]
            this.precipitation = new Float32Array(size); // [0mm a 200mm]
            this.humidity      = new Float32Array(size); // [0% a 100%]
            this.qiDensity     = new Float32Array(size); // [0 a 100]
            this.wuxingElement = new Uint8Array(size);   // 0:Neutro, 1:Metal, 2:Madeira, 3:Água, 4:Fogo, 5:Terra, 6:Yin/Sangue, 7:Relâmpago
            this.scarType      = new Uint8Array(size);   // 0:Nenhum, 1:Ravina Espada, 2:Cratera Palma, 3:Sangue Divino, 4:Fenda Vazio
            this.scarIntensity = new Float32Array(size); // [0.0 a 1.0]
            this.flowDir       = new Int8Array(size);    // Direção D8 (0..7, -1 se mar/sumidouro)
            this.inflowMask    = new Uint8Array(size);   // Bitmask das direções D8 que deságuam nesta célula
            this.riverFlux     = new Float32Array(size); // Volume acumulado de drenagem
            this.waterBodyType = new Uint8Array(size);   // 0:Seco, 1:Oceano, 2:Costa, 3:Riacho, 4:Rio Largo, 5:Cânion Fluvial, 6:Lago, 7:Lago Sagrado Palma, 8:Fonte Espiritual
            this.biomeId       = new Uint8Array(size);   // 0..12 (Matriz Whittaker + Xianxia)
            this.poiType       = new Uint8Array(size);   // 0:Nenhum, 1:Cidade, 2:Porto, 3:Seita Ortodoxa, 4:Seita Demoníaca, 5:Reino Cíclico, 6:Tumba Jade, 7:Fenda Espacial
            this.roadMask      = new Uint8Array(size);   // Bitmask D8 de estradas imperiais / pontes

            // Metadados ricos de POIs, Cicatrizes e Veias
            this.spiritPeaks = [];
            this.dragonVeins = [];
            this.scars = [];
            this.pois = [];
            this.poiByMacroIndex = new Map();
        }

        reset() {
            this.elevation.fill(0);
            this.temperature.fill(0);
            this.precipitation.fill(0);
            this.humidity.fill(0);
            this.qiDensity.fill(0);
            this.wuxingElement.fill(0);
            this.scarType.fill(0);
            this.scarIntensity.fill(0);
            this.flowDir.fill(-1);
            this.inflowMask.fill(0);
            this.riverFlux.fill(0);
            this.waterBodyType.fill(0);
            this.biomeId.fill(0);
            this.poiType.fill(0);
            this.roadMask.fill(0);
            this.spiritPeaks.length = 0;
            this.dragonVeins.length = 0;
            this.scars.length = 0;
            this.pois.length = 0;
            this.poiByMacroIndex.clear();
        }

        wrapX(mx) {
            return ((mx % this.width) + this.width) % this.width;
        }

        clampY(my) {
            return Math.max(0, Math.min(this.height - 1, my));
        }

        idx(mx, my) {
            return this.clampY(my) * this.width + this.wrapX(mx);
        }

        cylindricalDist(x1, y1, x2, y2) {
            let dx = Math.abs(x1 - x2);
            if (dx > this.width / 2) dx = this.width - dx;
            const dy = y1 - y2;
            return Math.hypot(dx, dy);
        }
    }

    // =========================================================================
    // 3. TABELA DE BIOMAS WHITTAKER + WUXING E TILESETS (OVERWORLD & 1:1)
    // =========================================================================
    const BIOME_CATALOG = {
        0: {
            id: 0,
            key: "DeepOcean",
            name: "Oceano Profundo",
            overworldGroundTile: 2096, // World_A1 Deep Water
            overworldUpperTile: 0,
            localGroundTile: 2096,     // Outside_A1 Deep Water
            localWallTile: 0,
            localDecoTiles: [],
            color: "#102e54",
            resources: ["Pérola Espiritual Yin", "Escama de Besta Marinha"]
        },
        1: {
            id: 1,
            key: "CoastalWater",
            name: "Mar Costeiro & Águas Claras",
            overworldGroundTile: 2048, // World_A1 Shallow Water
            overworldUpperTile: 0,
            localGroundTile: 2048,     // Outside_A1 Water
            localWallTile: 0,
            localDecoTiles: [160],
            color: "#3890c8",
            resources: ["Lótus d'Água Espiritual", "Carpa de Jade"]
        },
        2: {
            id: 2,
            key: "PerpetualGlacier",
            name: "Geleira de Gelo Perpétuo",
            overworldGroundTile: 3968, // World_A2 Snow
            overworldUpperTile: 4016,  // World_A2 Ice Mountain
            localGroundTile: 3968,     // Outside_A2 Snow
            localWallTile: 7904,       // Outside_A4 Cliff
            localDecoTiles: [152, 153],
            color: "#eef6fa",
            resources: ["Lótus de Neve Milenar", "Cristal Medular Yin"]
        },
        3: {
            id: 3,
            key: "SpiritTundra",
            name: "Tundra Espiritual do Norte",
            overworldGroundTile: 3584, // World_A2 Cold Earth
            overworldUpperTile: 3680,  // World_A2 Pine Forest
            localGroundTile: 3584,     // Outside_A2 Tundra
            localWallTile: 7520,
            localDecoTiles: [152, 155],
            color: "#6b8c7b",
            resources: ["Ginseng de Gelo do Norte", "Minério de Ferro Frio"]
        },
        4: {
            id: 4,
            key: "MortalPlains",
            name: "Planície Mortal & Vales",
            overworldGroundTile: 2816, // World_A2 Meadow Grass
            overworldUpperTile: 0,
            localGroundTile: 2816,     // Outside_A2 Grass
            localWallTile: 7520,
            localDecoTiles: [160, 161, 162],
            color: "#4e8c40",
            resources: ["Erva de Condensação de Qi", "Orvalho Espiritual"]
        },
        5: {
            id: 5,
            key: "JadeBambooForest",
            name: "Floresta de Bambu de Jade",
            overworldGroundTile: 2816,
            overworldUpperTile: 2864,  // World_A2 Forest
            localGroundTile: 2816,
            localWallTile: 7520,
            localDecoTiles: [152, 153, 163],
            color: "#235c2b",
            resources: ["Broto de Bambu de Jade", "Fruto de Madeira Ancestral"]
        },
        6: {
            id: 6,
            key: "EarthFireDesert",
            name: "Deserto de Fogo Terrestre",
            overworldGroundTile: 3200, // World_A2 Sand
            overworldUpperTile: 3296,  // World_A2 Dunes/Mesa
            localGroundTile: 3200,     // Outside_A2 Sand
            localWallTile: 7904,
            localDecoTiles: [154],
            color: "#dfbd5f",
            resources: ["Grama Solar Yang", "Cristal de Fogo Terrestre"]
        },
        7: {
            id: 7,
            key: "MiasmaPoisonSwamp",
            name: "Pântano de Miasma & Veneno",
            overworldGroundTile: 3392, // World_A2 Swamp/Barren
            overworldUpperTile: 2480,  // World_A1 Poison Pool
            localGroundTile: 3392,
            localWallTile: 7520,
            localDecoTiles: [155, 243],
            color: "#43593e",
            resources: ["Orquídea Cadavérica Yin", "Núcleo de Miasma Venenoso"]
        },
        8: {
            id: 8,
            key: "SpiritMountain",
            name: "Montanha Espiritual (Ling Shan)",
            overworldGroundTile: 2816,
            overworldUpperTile: 3008,  // World_A2 Sacred Mountains
            localGroundTile: 2960,     // Stone / Plateau
            localWallTile: 7904,       // Outside_A4 Mountain Wall
            localDecoTiles: [162, 176],
            color: "#7a766e",
            resources: ["Minério Espiritual Puro", "Pedra de Matriz Celestial"]
        },
        9: {
            id: 9,
            key: "CelestialLightningSea",
            name: "Mar de Relâmpagos Celestiais",
            overworldGroundTile: 3584,
            overworldUpperTile: 3776,  // Dark Thunder Peaks
            localGroundTile: 3584,
            localWallTile: 7904,
            localDecoTiles: [234, 243],
            color: "#5f5278",
            resources: ["Ferro Magnético de Tribulação", "Essência de Relâmpago Roxo"]
        },
        10: {
            id: 10,
            key: "BloodYinBadlands",
            name: "Terras de Sangue Divino & Sha Qi",
            overworldGroundTile: 3392,
            overworldUpperTile: 3536,
            localGroundTile: 3392,
            localWallTile: 7904,
            localDecoTiles: [143, 144, 243],
            color: "#7a232e",
            resources: ["Fruta de Sangue Demoníaco", "Cristal de Sha Qi Ancestral"]
        },
        11: {
            id: 11,
            key: "SwordIntentGorge",
            name: "Ravina de Intenção de Espada",
            overworldGroundTile: 3584,
            overworldUpperTile: 3152,
            localGroundTile: 3008,
            localWallTile: 7904,
            localDecoTiles: [65, 234],
            color: "#8b9bb4",
            resources: ["Fragmento de Espada Imortal", "Pedra de Intenção Cortante"]
        },
        12: {
            id: 12,
            key: "CelestialPalmCrater",
            name: "Cratera da Palma Celestial",
            overworldGroundTile: 3200,
            overworldUpperTile: 3296,
            localGroundTile: 2960,
            localWallTile: 7904,
            localDecoTiles: [253, 254],
            color: "#b8864b",
            resources: ["Rocha de Gravidade Tripla", "Lótus Sagrado dos Cinco Dedos"]
        }
    };

    const WUXING_NAMES = [
        "Neutro",
        "Metal (Jin)",
        "Madeira (Mu)",
        "Água / Gelo (Shui)",
        "Fogo (Huo)",
        "Terra (Tu)",
        "Sangue / Yin (Sha)",
        "Relâmpago (Lei)"
    ];

    const SCAR_NAMES = [
        "Nenhum",
        "Ravina de Intenção de Espada",
        "Cratera da Palma Celestial",
        "Pântano de Sangue Divino",
        "Fenda do Vazio"
    ];

    const WATER_BODY_NAMES = [
        "Terra Seca",
        "Oceano Profundo",
        "Mar Costeiro",
        "Riacho Espiritual Raso",
        "Rio Largo",
        "Cânion Fluvial de Espada",
        "Lago Interior",
        "Lago Sagrado dos Cinco Dedos",
        "Fonte Espiritual"
    ];

    const POI_NAMES = [
        "Nenhum",
        "Cidade Mortal",
        "Cidade Portuária",
        "Seita Ortodoxa Imortal",
        "Seita Demoníaca",
        "Reino Secreto Cíclico (Dongtian)",
        "Tumba de Jade Selada",
        "Fenda Espacial Instável"
    ];

    // =========================================================================
    // 4. MIN-HEAP RÁPIDO PARA PRIORITY-FLOOD (PLANCHON-DARBOUX) E A*
    // =========================================================================
    class FastMinHeap {
        constructor(capacity = 65536) {
            this.keys = new Float64Array(capacity);
            this.vals = new Int32Array(capacity);
            this.length = 0;
        }

        clear() {
            this.length = 0;
        }

        push(key, val) {
            if (this.length >= this.keys.length) {
                const newCap = this.keys.length * 2;
                const nk = new Float64Array(newCap);
                const nv = new Int32Array(newCap);
                nk.set(this.keys);
                nv.set(this.vals);
                this.keys = nk;
                this.vals = nv;
            }
            let i = this.length++;
            this.keys[i] = key;
            this.vals[i] = val;
            while (i > 0) {
                const p = (i - 1) >> 1;
                if (this.keys[p] <= key) break;
                this.keys[i] = this.keys[p];
                this.vals[i] = this.vals[p];
                i = p;
            }
            this.keys[i] = key;
            this.vals[i] = val;
        }

        pop() {
            if (this.length === 0) return -1;
            const topVal = this.vals[0];
            const lastIdx = --this.length;
            if (lastIdx > 0) {
                const k = this.keys[lastIdx];
                const v = this.vals[lastIdx];
                let i = 0;
                const half = lastIdx >> 1;
                while (i < half) {
                    let left = (i << 1) + 1;
                    const right = left + 1;
                    if (right < lastIdx && this.keys[right] < this.keys[left]) {
                        left = right;
                    }
                    if (k <= this.keys[left]) break;
                    this.keys[i] = this.keys[left];
                    this.vals[i] = this.vals[left];
                    i = left;
                }
                this.keys[i] = k;
                this.vals[i] = v;
            }
            return topVal;
        }

        peekKey() {
            return this.length > 0 ? this.keys[0] : Infinity;
        }
    }

    // =========================================================================
    // 5. MOTOR PRINCIPAL: WorldClimateEngine
    // =========================================================================
    class WorldClimateEngine {
        constructor() {
            this._seed = defaultWorldSeed;
            this._initialized = false;
            this._rng = new Mulberry32(this._seed);
            this._noiseElev = null;
            this._noiseWarp = null;
            this._noiseTemp = null;
            this._noiseQi = null;
            this._noiseDetail = null;
            this.macroGrid = new PlanetaryMacroGrid(MACRO_W, MACRO_H);
            this._sharedHeap = new FastMinHeap(MACRO_SIZE + 1024);
            this._sharedOrder = new Int32Array(MACRO_SIZE);
            this._sharedVeinDistSq = new Float32Array(MACRO_SIZE);
            this._sharedFilledElev = new Float32Array(MACRO_SIZE);
            this._sharedVisited = new Uint8Array(MACRO_SIZE);
        }

        initWorld(seed = defaultWorldSeed) {
            getTrigTable(MACRO_W);
            getTrigTable(OVERWORLD_W);
            const t0 = (typeof performance !== "undefined") ? performance.now() : Date.now();
            this._seed = (Number(seed) >>> 0) || defaultWorldSeed;
            this._rng = new Mulberry32(this._seed);

            this._noiseElev = new CylindricalNoise3D(this._seed ^ 0x1A2B3C4D);
            this._noiseWarp = new CylindricalNoise3D(this._seed ^ 0x5E6F7A8B);
            this._noiseTemp = new CylindricalNoise3D(this._seed ^ 0x9C0D1E2F);
            this._noiseQi = new CylindricalNoise3D(this._seed ^ 0x3F4E5D6C);
            this._noiseDetail = new CylindricalNoise3D(this._seed ^ 0x7B8A9C0E);

            if (!this.macroGrid) {
                this.macroGrid = new PlanetaryMacroGrid(MACRO_W, MACRO_H);
            } else {
                this.macroGrid.reset();
            }

            // Executa o Pipeline Causal de 8 Camadas
            this._buildLayer1TectonicsAndRelief();
            this._buildLayer2ClimateAndRainShadow();
            this._buildLayer3DragonVeinsAndWuxing();
            this._buildLayer4AncientCataclysms();
            this._buildLayer5PostCataclysmHydrologyD8();
            this._buildLayer6WhittakerXianxiaBiomes();
            this._buildLayer7StrategicSettlementsAndRoads();
            this._buildLayer8SecretRealms();

            this._initialized = true;
            const elapsed = ((typeof performance !== "undefined") ? performance.now() : Date.now()) - t0;
            if (debugMode || typeof console !== "undefined") {
                console.log(`[WorldClimateEngine] Globo Xianxia ${MACRO_W}x${MACRO_H} (Overworld ${OVERWORLD_W}x${OVERWORLD_H}, Local ${LOCAL_W}x${LOCAL_H}) gerado em ${elapsed.toFixed(1)}ms (Seed: ${this._seed}).`);
            }
            return this.macroGrid;
        }

        ensureInitialized() {
            if (!this._initialized || !this.macroGrid) {
                this.initWorld(this._seed);
            }
        }

        getSeed() {
            return this._seed;
        }

        // ---------------------------------------------------------------------
        // CAMADA 1: Relevo Primordial & Placas Continentais
        // ---------------------------------------------------------------------
        _buildLayer1TectonicsAndRelief() {
            const g = this.macroGrid;
            const W = g.width;
            const H = g.height;
            const elevArr = g.elevation;
            const noiseWarp = this._noiseWarp;
            const noiseElev = this._noiseElev;
            const table = getTrigTable(W);
            const cosArr = table.cosArr;
            const sinArr = table.sinArr;
            const mask = table.mask;

            for (let my = 0; my < H; my++) {
                const poleDist = my < (H - 1 - my) ? my : (H - 1 - my);
                const polarTaper = poleDist < 10 ? (poleDist * 0.1) : 1.0;
                const rowOffset = my << 9;
                const wyBase = my * 0.0085;

                for (let mx = 0; mx < W; mx++) {
                    const i = rowOffset | mx;

                    // Domain Warping cilíndrico rápido (1 chamada 3D)
                    const idxW1 = (mx << 2) & mask;
                    const wx = noiseWarp.noise3D(cosArr[idxW1] * 0.0085, sinArr[idxW1] * 0.0085, wyBase);
                    const wy = noiseWarp.noise3D(sinArr[idxW1] * 0.0085, -cosArr[idxW1] * 0.0085, wyBase + 2.49);

                    const warpedX = mx + 24.0 * wx;
                    const warpedY = my + 24.0 * wy;

                    const idxC = (Math.round(warpedX * 4.0) & mask);
                    const cx = cosArr[idxC];
                    const sx = sinArr[idxC];

                    // Máscara Continental FBM 2 Oitavas [-1, 1]
                    const c0 = noiseElev.noise3D(cx * 0.0045, sx * 0.0045, warpedY * 0.0045);
                    const c1 = noiseElev.noise3D(cx * 0.0092, sx * 0.0092, warpedY * 0.0092) * 0.52;
                    const cont = (c0 + c1) * 0.6578947;

                    // Cinturões Orogênicos (Ridged Multifractal) [0, 1]
                    const idxR = (Math.round((warpedX + 53.0) * 4.0) & mask);
                    const rcx = cosArr[idxR];
                    const rsx = sinArr[idxR];
                    const ry = warpedY - 41.0;

                    let r0 = 1.0 - Math.abs(noiseElev.noise3D(rcx * 0.012, rsx * 0.012, ry * 0.012));
                    const ridge = r0 * r0;

                    // Combinação em metros [-1000m a +2600m]
                    let elev = 0;
                    const continentalSignal = (cont + 0.08) * polarTaper;

                    if (continentalSignal < 0) {
                        const absS = -continentalSignal * 1.45;
                        const depthNorm = absS > 1.0 ? 1.0 : absS;
                        elev = -8.0 - depthNorm * Math.sqrt(depthNorm) * 950.0 + ridge * 35.0;
                        if (elev >= -2.0) elev = -2.0;
                    } else {
                        const landBase = continentalSignal * 680.0;
                        const mountainBelt = ridge * ridge * (250.0 + continentalSignal * 1750.0);
                        elev = 8.0 + landBase + mountainBelt;
                    }

                    elevArr[i] = elev;
                }
            }
        }

        // ---------------------------------------------------------------------
        // CAMADA 2: Clima Físico de Base (Latitude, Altitude e Sombra de Chuva)
        // ---------------------------------------------------------------------
        _buildLayer2ClimateAndRainShadow() {
            const g = this.macroGrid;
            const W = g.width;
            const H = g.height;
            const halfH = H / 2; // 128 = Equador
            const elevArr = g.elevation;
            const tempArr = g.temperature;
            const precipArr = g.precipitation;
            const humArr = g.humidity;
            const noiseTemp = this._noiseTemp;
            const table = getTrigTable(W);
            const cosArr = table.cosArr;
            const sinArr = table.sinArr;
            const mask = table.mask;

            // 2.1 Temperatura Latitudinal + Taxa Adiabática (Lapse Rate)
            for (let my = 0; my < H; my++) {
                const phi = Math.abs(my - halfH) / halfH; // 0 no Equador, 1 nos Polos
                const tLat = 34.0 - 56.0 * Math.pow(phi, 1.35);
                const rowOffset = my << 9;
                const yFreq = my * 0.015;

                for (let mx = 0; mx < W; mx++) {
                    const i = rowOffset | mx;
                    const elev = elevArr[i];
                    const lapse = elev > 0 ? (0.0065 * elev) : 0.0;
                    const tIdx = (mx << 2) & mask;
                    const nTemp = noiseTemp.noise3D(cosArr[tIdx] * 0.015, sinArr[tIdx] * 0.015, yFreq);
                    tempArr[i] = tLat - lapse + 3.0 * nTemp;
                }
            }

            // 2.2 Advecção de Vapor e Chuva Orográfica (Sombra de Chuva Real)
            for (let my = 0; my < H; my++) {
                const phi = Math.abs(my - halfH) / halfH;
                const dirStep = (phi >= 0.33 && phi < 0.66) ? 1 : -1;
                const latMoistureFactor = 1.15 - 0.55 * phi;
                const rowOffset = my << 9;

                let vapor = 95.0 * latMoistureFactor;
                let startX = dirStep === 1 ? 0 : W - 1;

                // Duas voltas pelo paralelo cilíndrico para estabilizar o vapor na fronteira X=0 <-> X=511
                for (let pass = 0; pass < 2; pass++) {
                    for (let step = 0; step < W; step++) {
                        const mx = (startX + step * dirStep) & 511;
                        const prevMx = (mx - dirStep) & 511;
                        const i = rowOffset | mx;
                        const prevI = rowOffset | prevMx;

                        const hCurr = elevArr[i];
                        const hPrev = elevArr[prevI];

                        if (hCurr < 0) {
                            vapor += 14.0 * latMoistureFactor;
                            if (vapor > 165.0 * latMoistureFactor) vapor = 165.0 * latMoistureFactor;
                            if (pass === 1) {
                                precipArr[i] = 65.0 * latMoistureFactor;
                                humArr[i] = 92.0;
                            }
                        } else {
                            const basePrev = hPrev > 0 ? hPrev : 0;
                            const deltaH = hCurr > basePrev ? (hCurr - basePrev) : 0;
                            const downSlope = basePrev > hCurr ? (basePrev - hCurr) : 0;

                            const dRatio = deltaH / 260.0;
                            const oroFactor = 0.035 + 0.44 * (dRatio > 1.0 ? 1.0 : dRatio);
                            let rain = vapor * oroFactor;

                            if (downSlope > 45.0) {
                                rain *= 0.35;
                                vapor *= 0.78;
                                if (vapor < 4.0) vapor = 4.0;
                            } else {
                                vapor -= rain * 0.68;
                                if (vapor < 4.0) vapor = 4.0;
                            }

                            if (pass === 1) {
                                // Reaproveita a perturbação térmica já computada para evitar segunda chamada noise3D
                                const localWeatherNoise = ((tempArr[i] - (34.0 - 56.0 * Math.pow(phi, 1.35) - 0.0065 * hCurr)) / 6.0) + 0.5;
                                let finalPrecip = rain * 3.1 + localWeatherNoise * 18.0;
                                if (finalPrecip < 2.0) finalPrecip = 2.0;
                                else if (finalPrecip > 200.0) finalPrecip = 200.0;
                                precipArr[i] = finalPrecip;
                                let hum = finalPrecip * 0.62 + vapor * 0.25;
                                if (hum < 5.0) hum = 5.0;
                                else if (hum > 98.0) hum = 98.0;
                                humArr[i] = hum;
                            }
                        }
                    }
                }
            }
        }

        // ---------------------------------------------------------------------
        // CAMADA 3: Malha Espiritual Primordial (Veias de Dragão / Ling Mai)
        // ---------------------------------------------------------------------
        _buildLayer3DragonVeinsAndWuxing() {
            const g = this.macroGrid;
            const W = g.width;
            const H = g.height;

            // 3.1 Seleção dos ~28 maiores Picos Espirituais Ancestrais (H > 700m, separação >= 24)
            const candidates = [];
            for (let my = 8; my < H - 8; my += 2) {
                for (let mx = 0; mx < W; mx += 2) {
                    const i = (my << 9) | mx;
                    if (g.elevation[i] >= 680.0) {
                        candidates.push({ mx, my, elev: g.elevation[i] });
                    }
                }
            }
            candidates.sort((a, b) => b.elev - a.elev);

            const peaks = [];
            const minSep = 24;
            for (let c = 0; c < candidates.length && peaks.length < 28; c++) {
                const cand = candidates[c];
                let tooClose = false;
                for (let p = 0; p < peaks.length; p++) {
                    if (g.cylindricalDist(cand.mx, cand.my, peaks[p].mx, peaks[p].my) < minSep) {
                        tooClose = true;
                        break;
                    }
                }
                if (!tooClose) {
                    peaks.push({ id: peaks.length, mx: cand.mx, my: cand.my, elev: cand.elev });
                }
            }
            g.spiritPeaks = peaks;

            // Mapa de distância às Veias de Dragão (reutiliza buffer pré-alocado)
            const veinDistSq = this._sharedVeinDistSq;
            veinDistSq.fill(9999.0);

            const stampVeinPoint = (vx, vy, radius = 6) => {
                for (let dy = -radius; dy <= radius; dy++) {
                    const ny = vy + dy;
                    if (ny < 0 || ny >= H) continue;
                    const rowOff = ny << 9;
                    const dy2 = dy * dy;
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = (vx + dx) & 511;
                        const d2 = dx * dx + dy2;
                        const idx = rowOff | nx;
                        if (d2 < veinDistSq[idx]) {
                            veinDistSq[idx] = d2;
                        }
                    }
                }
            };

            // 3.2 Conecta cada Pico Ancestral aos seus 2 vizinhos mais próximos (Grafo de Veias de Dragão)
            for (let pIdx = 0; pIdx < peaks.length; pIdx++) {
                const p1 = peaks[pIdx];
                stampVeinPoint(p1.mx, p1.my, 8);

                const neighbors = [];
                for (let qIdx = 0; qIdx < peaks.length; qIdx++) {
                    if (pIdx === qIdx) continue;
                    const p2 = peaks[qIdx];
                    const d = g.cylindricalDist(p1.mx, p1.my, p2.mx, p2.my);
                    neighbors.push({ peak: p2, dist: d });
                }
                neighbors.sort((a, b) => a.dist - b.dist);

                const maxConn = Math.min(2, neighbors.length);
                for (let k = 0; k < maxConn; k++) {
                    const target = neighbors[k].peak;
                    if (target.id < p1.id) continue;

                    const steps = Math.max(16, Math.ceil(neighbors[k].dist * 1.5));
                    let dx = target.mx - p1.mx;
                    if (dx > W / 2) dx -= W;
                    if (dx < -W / 2) dx += W;
                    const dy = target.my - p1.my;

                    const veinPoints = [];
                    for (let s = 0; s <= steps; s++) {
                        const t = s / steps;
                        const wave = Math.sin(t * Math.PI * 2.0) * 3.5;
                        const px = (Math.round(p1.mx + dx * t - (dy / steps) * wave)) & 511;
                        const py = g.clampY(Math.round(p1.my + dy * t + (dx / steps) * wave));
                        stampVeinPoint(px, py, 6);
                        veinPoints.push({ mx: px, my: py });
                    }
                    g.dragonVeins.push({ from: p1.id, to: target.id, points: veinPoints });
                }
            }

            // 3.3 Calcula Qi Density e Polarização Elemental Wuxing
            const table = getTrigTable(W);
            const cosArr = table.cosArr;
            const sinArr = table.sinArr;
            const mask = table.mask;
            const noiseQi = this._noiseQi;
            const elevArr = g.elevation;
            const tempArr = g.temperature;
            const humArr = g.humidity;
            const precipArr = g.precipitation;
            const qiArr = g.qiDensity;
            const elemArr = g.wuxingElement;

            for (let my = 0; my < H; my++) {
                const rowOff = my << 9;
                const yFreq = my * 0.03;
                for (let mx = 0; mx < W; mx++) {
                    const i = rowOff | mx;
                    const d2 = veinDistSq[i];
                    const h = elevArr[i];
                    const temp = tempArr[i];
                    const hum = humArr[i];
                    const precip = precipArr[i];

                    const qIdx = (mx << 2) & mask;
                    const qiNoise = noiseQi.noise3D(cosArr[qIdx] * 0.03, sinArr[qIdx] * 0.03, yFreq);
                    const veinContribution = d2 < 120.0 ? (88.0 * Math.exp(-d2 / 18.0)) : 0.0;
                    const altContribution = h > 0 ? (0.0125 * h) : 0.0;
                    let qi = veinContribution + altContribution + 12.0 * qiNoise;
                    if (qi < 0.0) qi = 0.0;
                    else if (qi > 100.0) qi = 100.0;
                    qiArr[i] = qi;

                    const prevMx = (mx - 1) & 511;
                    const nextMx = (mx + 1) & 511;
                    const slope = Math.abs(h - elevArr[rowOff | prevMx]) + Math.abs(h - elevArr[rowOff | nextMx]);

                    let elem = 0;
                    if (h >= 650.0 && slope > 140.0 && precip > 75.0) {
                        elem = 7; // Relâmpago
                    } else if (temp > 25.0 && hum < 32.0) {
                        elem = 4; // Fogo
                    } else if (temp < -2.0 || h < 0) {
                        elem = 3; // Água / Gelo
                    } else if (hum > 62.0 && temp >= 10.0 && temp <= 28.0 && qi >= 40.0) {
                        elem = 2; // Madeira
                    } else if (h >= 550.0 && hum < 48.0) {
                        elem = 1; // Metal
                    } else if (h >= 240.0 && h < 550.0) {
                        elem = 5; // Terra
                    }
                    elemArr[i] = elem;
                }
            }
        }

        // ---------------------------------------------------------------------
        // CAMADA 4: Cataclismos Históricos & Cicatrizes de Batalhas Antigas
        // ---------------------------------------------------------------------
        _buildLayer4AncientCataclysms() {
            const g = this.macroGrid;
            const W = g.width;
            const H = g.height;
            const rng = this._rng;

            // 4.1 Ravina de Intenção de Espada (Sword Intent Gorge — 7 no mundo)
            const numSwordGorges = 7;
            let placedGorges = 0;
            for (let attempt = 0; attempt < 350 && placedGorges < numSwordGorges; attempt++) {
                const cx = rng.int(0, W - 1);
                const cy = rng.int(28, H - 29);
                const centerIdx = cy * W + cx;

                if (g.elevation[centerIdx] < 140.0) continue;
                if (this._isNearExistingScar(cx, cy, 32)) continue;

                const length = rng.range(20.0, 36.0);
                const angle = rng.range(-Math.PI * 0.42, Math.PI * 0.42);
                const halfL = length * 0.5;
                const dirX = Math.cos(angle);
                const dirY = Math.sin(angle);

                const x1 = cx - dirX * halfL;
                const y1 = cy - dirY * halfL;
                const x2 = cx + dirX * halfL;
                const y2 = cy + dirY * halfL;

                const gorgeRadius = 3.2;
                const gorgeDepth = 540.0;

                const minY = g.clampY(Math.floor(Math.min(y1, y2) - gorgeRadius - 2));
                const maxY = g.clampY(Math.ceil(Math.max(y1, y2) + gorgeRadius + 2));
                const spanX = Math.ceil(halfL + gorgeRadius + 3);

                for (let my = minY; my <= maxY; my++) {
                    for (let dx = -spanX; dx <= spanX; dx++) {
                        const mx = g.wrapX(cx + dx);
                        const px = cx + dx;
                        const py = my;

                        const vx = x2 - x1;
                        const vy = y2 - y1;
                        const wx = px - x1;
                        const wy = py - y1;
                        const c1 = wx * vx + wy * vy;
                        const c2 = vx * vx + vy * vy;
                        const t = Math.max(0.0, Math.min(1.0, c1 / (c2 || 1.0)));
                        const projX = x1 + t * vx;
                        const projY = y1 + t * vy;
                        const dPerp = Math.hypot(px - projX, py - projY);

                        const endTaper = Math.sin(t * Math.PI);
                        const effectiveRadius = gorgeRadius * (0.45 + 0.55 * endTaper);

                        if (dPerp <= effectiveRadius) {
                            const cellIdx = my * W + mx;
                            const profile = Math.pow(1.0 - dPerp / effectiveRadius, 0.6);
                            g.elevation[cellIdx] = Math.max(12.0, g.elevation[cellIdx] - gorgeDepth * profile);
                            g.scarType[cellIdx] = 1; // Ravina de Espada
                            g.scarIntensity[cellIdx] = Math.max(g.scarIntensity[cellIdx], profile);
                            g.wuxingElement[cellIdx] = 1; // Metal / Espada
                            g.qiDensity[cellIdx] = Math.min(100.0, g.qiDensity[cellIdx] + 28.0 * profile);
                        }
                    }
                }

                g.scars.push({
                    type: 1,
                    name: "Ravina de Intenção de Espada",
                    mx: cx,
                    my: cy,
                    angle,
                    length
                });
                placedGorges++;
            }

            // 4.2 Cratera de Palma Celestial (Palm Print Basin — 6 no mundo)
            const numPalmCraters = 6;
            let placedPalms = 0;
            for (let attempt = 0; attempt < 450 && placedPalms < numPalmCraters; attempt++) {
                const cx = rng.int(0, W - 1);
                const cy = rng.int(30, H - 31);
                const centerIdx = cy * W + cx;

                if (g.elevation[centerIdx] < 35.0) continue;
                if (this._isNearExistingScar(cx, cy, 30)) continue;

                const wantWet = (placedPalms % 2 === 0);
                // Relaxa o filtro climático após 150 tentativas para garantir colocação em qualquer semente
                if (attempt < 180) {
                    if (wantWet && g.precipitation[centerIdx] < 35.0) continue;
                    if (!wantWet && g.precipitation[centerIdx] > 48.0) continue;
                }

                const palmRadius = 4.6;
                const baseAngle = rng.range(-Math.PI, Math.PI);
                const scanR = 11;

                for (let dy = -scanR; dy <= scanR; dy++) {
                    const my = cy + dy;
                    if (my < 2 || my >= H - 2) continue;
                    for (let dx = -scanR; dx <= scanR; dx++) {
                        const mx = g.wrapX(cx + dx);
                        const cellIdx = my * W + mx;

                        const cosA = Math.cos(-baseAngle);
                        const sinA = Math.sin(-baseAngle);
                        const rx = dx * cosA - dy * sinA;
                        const ry = dx * sinA + dy * cosA;

                        const dPalm = Math.hypot(rx / (palmRadius * 1.15), (ry - 1.2) / palmRadius);
                        let minNormDist = dPalm;

                        for (let f = -2; f <= 2; f++) {
                            const fAngle = -Math.PI * 0.5 + (f * 22.0 * Math.PI) / 180.0;
                            const fx1 = Math.cos(fAngle) * (palmRadius * 0.75);
                            const fy1 = Math.sin(fAngle) * (palmRadius * 0.75);
                            const fingerLen = f === 0 ? 5.2 : (Math.abs(f) === 1 ? 4.6 : 3.8);
                            const fx2 = Math.cos(fAngle) * (palmRadius * 0.75 + fingerLen);
                            const fy2 = Math.sin(fAngle) * (palmRadius * 0.75 + fingerLen);

                            const vfx = fx2 - fx1;
                            const vfy = fy2 - fy1;
                            const wfx = rx - fx1;
                            const wfy = ry - fy1;
                            const t = Math.max(0.0, Math.min(1.0, (wfx * vfx + wfy * vfy) / (vfx * vfx + vfy * vfy || 1.0)));
                            const pfx = fx1 + t * vfx;
                            const pfy = fy1 + t * vfy;
                            const dFinger = Math.hypot(rx - pfx, ry - pfy) / 1.35;
                            if (dFinger < minNormDist) minNormDist = dFinger;
                        }

                        if (minNormDist <= 1.0) {
                            const depthProfile = Math.pow(1.0 - minNormDist, 0.55);
                            g.elevation[cellIdx] = Math.max(5.0, g.elevation[cellIdx] - 420.0 * depthProfile);
                            g.scarType[cellIdx] = 2; // Cratera de Palma
                            g.scarIntensity[cellIdx] = Math.max(g.scarIntensity[cellIdx], depthProfile);
                            g.wuxingElement[cellIdx] = 5; // Terra / Gravidade Pesada
                            g.qiDensity[cellIdx] = Math.min(100.0, g.qiDensity[cellIdx] + 24.0 * depthProfile);
                        } else if (minNormDist <= 1.32) {
                            const rimFactor = Math.sin(((minNormDist - 1.0) / 0.32) * Math.PI);
                            g.elevation[cellIdx] += 75.0 * rimFactor;
                        }
                    }
                }

                g.scars.push({
                    type: 2,
                    name: "Cratera da Palma Celestial",
                    mx: cx,
                    my: cy,
                    angle: baseAngle,
                    isWetTarget: wantWet
                });
                placedPalms++;
            }

            // 4.3 Zona de Sangue Divino / Queda Demoníaca (Divine Blood Marsh — 7 no mundo)
            const numBloodZones = 7;
            let placedBlood = 0;
            for (let attempt = 0; attempt < 250 && placedBlood < numBloodZones; attempt++) {
                const cx = rng.int(0, W - 1);
                const cy = rng.int(24, H - 25);
                const centerIdx = cy * W + cx;

                if (g.elevation[centerIdx] < 10.0 || g.elevation[centerIdx] > 600.0) continue;
                if (this._isNearExistingScar(cx, cy, 30)) continue;

                const radius = rng.range(8.0, 12.0);
                const scanR = Math.ceil(radius + 2);

                for (let dy = -scanR; dy <= scanR; dy++) {
                    const my = cy + dy;
                    if (my < 2 || my >= H - 2) continue;
                    for (let dx = -scanR; dx <= scanR; dx++) {
                        const mx = g.wrapX(cx + dx);
                        const n = this._noiseQi.sampleLoop(mx * 3, my * 3, W, 0.08, 1);
                        const dist = Math.hypot(dx, dy) / (radius * (0.85 + 0.25 * n));
                        if (dist <= 1.0) {
                            const cellIdx = my * W + mx;
                            const intensity = Math.pow(1.0 - dist, 0.7);
                            g.elevation[cellIdx] = Math.max(8.0, g.elevation[cellIdx] * (1.0 - 0.55 * intensity));
                            g.scarType[cellIdx] = 3; // Sangue Divino
                            g.scarIntensity[cellIdx] = Math.max(g.scarIntensity[cellIdx], intensity);
                            g.wuxingElement[cellIdx] = 6; // Sha Qi / Sangue Yin
                            g.qiDensity[cellIdx] = Math.min(100.0, Math.max(60.0, g.qiDensity[cellIdx] + 20.0 * intensity));
                        }
                    }
                }

                g.scars.push({
                    type: 3,
                    name: "Pântano de Sangue Divino",
                    mx: cx,
                    my: cy,
                    radius
                });
                placedBlood++;
            }
        }

        _isNearExistingScar(mx, my, minDist) {
            const g = this.macroGrid;
            for (let i = 0; i < g.scars.length; i++) {
                const s = g.scars[i];
                if (g.cylindricalDist(mx, my, s.mx, s.my) < minDist) return true;
            }
            return false;
        }

        // ---------------------------------------------------------------------
        // CAMADA 5: Hidrologia Pós-Cataclismo D8 & Condicionalidade nas Cicatrizes
        // ---------------------------------------------------------------------
        _buildLayer5PostCataclysmHydrologyD8() {
            const g = this.macroGrid;
            const W = g.width;
            const H = g.height;
            const size = g.size;
            const elevArr = g.elevation;
            const precipArr = g.precipitation;
            const fluxArr = g.riverFlux;
            const flowDirArr = g.flowDir;
            const inflowArr = g.inflowMask;
            const wbArr = g.waterBodyType;
            const scarArr = g.scarType;
            const humArr = g.humidity;

            // 5.1 Priority-Flood Pit Filling (Planchon-Darboux com Min-Heap)
            const filledElev = this._sharedFilledElev;
            const visited = this._sharedVisited;
            visited.fill(0);
            const order = this._sharedOrder;
            let popCount = 0;
            const heap = this._sharedHeap;
            heap.clear();

            for (let i = 0; i < size; i++) {
                const e = elevArr[i];
                fluxArr[i] = e >= 0 ? (precipArr[i] * 0.38) : 0.0;
                if (e < 0) {
                    filledElev[i] = e;
                    visited[i] = 1;
                    order[popCount++] = i;
                } else {
                    filledElev[i] = 1e9;
                }
            }

            // Enfileira apenas as células costeiras (terra firme adjacente ao mar) e bordas polares na Min-Heap!
            for (let my = 0; my < H; my++) {
                const rowOff = my << 9;
                const isPolar = (my === 0 || my === H - 1);
                for (let mx = 0; mx < W; mx++) {
                    const i = rowOff | mx;
                    if (visited[i]) continue;
                    let isBorder = isPolar;
                    if (!isBorder) {
                        if (elevArr[rowOff | ((mx + 1) & 511)] < 0 ||
                            elevArr[rowOff | ((mx - 1) & 511)] < 0 ||
                            elevArr[((my + 1) << 9) | mx] < 0 ||
                            elevArr[((my - 1) << 9) | mx] < 0) {
                            isBorder = true;
                        }
                    }
                    if (isBorder) {
                        filledElev[i] = elevArr[i];
                        visited[i] = 1;
                        heap.push(filledElev[i], i);
                    }
                }
            }

            const EPS = 0.005;
            while (heap.length > 0) {
                const currIdx = heap.pop();
                order[popCount++] = currIdx;
                const currH = filledElev[currIdx];
                const cy = currIdx >> 9;
                const cx = currIdx & 511;

                for (let dir = 0; dir < 8; dir++) {
                    const ny = cy + D8_DY[dir];
                    if (ny < 0 || ny >= H) continue;
                    const nx = (cx + D8_DX[dir]) & 511;
                    const nIdx = (ny << 9) | nx;
                    if (visited[nIdx]) continue;

                    visited[nIdx] = 1;
                    const origH = elevArr[nIdx];
                    const nextH = origH <= currH + EPS ? (currH + EPS) : origH;
                    filledElev[nIdx] = nextH;
                    heap.push(nextH, nIdx);
                }
            }

            // 5.2 Direção de Fluxo D8 sobre a superfície hidrológica resolvida
            flowDirArr.fill(-1);
            inflowArr.fill(0);

            for (let my = 0; my < H; my++) {
                const rowOffset = my << 9;
                for (let mx = 0; mx < W; mx++) {
                    const i = rowOffset | mx;
                    if (elevArr[i] < 0) continue;

                    let bestDir = -1;
                    let maxSlope = 0;
                    const h0 = filledElev[i];

                    for (let dir = 0; dir < 8; dir++) {
                        const ny = my + D8_DY[dir];
                        if (ny < 0 || ny >= H) continue;
                        const nx = (mx + D8_DX[dir]) & 511;
                        const nIdx = (ny << 9) | nx;
                        const drop = h0 - filledElev[nIdx];
                        if (drop > 0) {
                            const slope = drop / D8_DIST[dir];
                            if (slope > maxSlope) {
                                maxSlope = slope;
                                bestDir = dir;
                            }
                        }
                    }
                    flowDirArr[i] = bestDir;
                }
            }

            // 5.3 Acumulação de Fluxo em Ordem Topológica Reversa (Maior para Menor Cota)
            for (let k = popCount - 1; k >= 0; k--) {
                const u = order[k];
                const dir = flowDirArr[u];
                if (dir < 0) continue;

                const uy = u >> 9;
                const ux = u & 511;
                const vy = uy + D8_DY[dir];
                if (vy < 0 || vy >= H) continue;
                const vx = (ux + D8_DX[dir]) & 511;
                const v = (vy << 9) | vx;

                fluxArr[v] += fluxArr[u];
                if (fluxArr[u] >= STREAM_FLUX_THRESHOLD) {
                    inflowArr[v] |= (1 << D8_OPPOSITE[dir]);
                }
            }

            // 5.4 Classificação Condicional dos Corpos d'Água e Cicatrizes
            for (let i = 0; i < size; i++) {
                const origH = elevArr[i];
                const waterLevel = filledElev[i];
                const pitDepth = waterLevel - origH;
                const flux = fluxArr[i];
                const scar = scarArr[i];

                if (origH < -80.0) {
                    wbArr[i] = 1; // Oceano Profundo
                } else if (origH < 0.0) {
                    wbArr[i] = 2; // Mar Costeiro
                } else if (scar === 1) {
                    wbArr[i] = (flux >= RIVER_FLUX_THRESHOLD * 0.75) ? 5 : 0;
                } else if (scar === 2) {
                    wbArr[i] = ((pitDepth > 18.0 && precipArr[i] >= 35.0) || flux >= STREAM_FLUX_THRESHOLD * 1.1) ? 7 : 0;
                } else if (pitDepth > 28.0 && precipArr[i] >= 42.0 && flux >= STREAM_FLUX_THRESHOLD * 0.8) {
                    wbArr[i] = 6; // Lago Natural Interior
                } else if (flux >= RIVER_FLUX_THRESHOLD) {
                    wbArr[i] = 4; // Rio Largo
                } else if (flux >= STREAM_FLUX_THRESHOLD) {
                    wbArr[i] = 3; // Riacho Caminhável
                } else {
                    wbArr[i] = 0; // Seco
                }
            }

            // Garante que pelo menos 1 Ravina tenha Cânion Fluvial e 1 seja Seca, e 1 Palma tenha Lago Sagrado e 1 seja Seca
            this._enforceConditionalScarShowcase(filledElev);

            // 5.5 Feedback Rápido de Umidade Ciliar (Matas Ciliares e Oásis ao redor de Rios/Lagos)
            for (let my = 1; my < H - 1; my++) {
                const rowOff = my << 9;
                for (let mx = 0; mx < W; mx++) {
                    const i = rowOff | mx;
                    const wb = wbArr[i];
                    if (wb >= 3 && wb <= 8) {
                        humArr[i] = 100.0;
                        for (let dy = -2; dy <= 2; dy++) {
                            const rOff = (my + dy) << 9;
                            for (let dx = -2; dx <= 2; dx++) {
                                const nIdx = rOff | ((mx + dx) & 511);
                                if (elevArr[nIdx] >= 0) {
                                    const boost = (dx === 0 && dy === 0) ? 35.0 : 18.0;
                                    const nh = humArr[nIdx] + boost;
                                    humArr[nIdx] = nh > 100.0 ? 100.0 : nh;
                                }
                            }
                        }
                    }
                }
            }
        }

        /**
         * Garante que no mundo gerado coexistam:
         * - Ravinas de Espada com Cânion Fluvial (waterBodyType=5) E Ravinas Secas (waterBodyType=0)
         * - Crateras de Palma com Lago Sagrado (waterBodyType=7) E Crateras Secas (waterBodyType=0)
         */
        _enforceConditionalScarShowcase() {
            const g = this.macroGrid;
            const gorges = g.scars.filter(s => s.type === 1);
            const palms = g.scars.filter(s => s.type === 2);

            if (gorges.length >= 2) {
                const wetGorge = gorges[0];
                this._applyScarWaterState(wetGorge.mx, wetGorge.my, 22, 1, 5, RIVER_FLUX_THRESHOLD * 1.4);
                const dryGorge = gorges[1];
                this._applyScarWaterState(dryGorge.mx, dryGorge.my, 22, 1, 0, 15.0);
            }

            if (palms.length >= 2) {
                const wetPalm = palms[0];
                this._applyScarWaterState(wetPalm.mx, wetPalm.my, 12, 2, 7, RIVER_FLUX_THRESHOLD);
                const dryPalm = palms[1];
                this._applyScarWaterState(dryPalm.mx, dryPalm.my, 12, 2, 0, 10.0);
            }
        }

        _applyScarWaterState(cx, cy, radius, targetScarType, waterType, fluxValue) {
            const g = this.macroGrid;
            const W = g.width;
            const H = g.height;
            for (let dy = -radius; dy <= radius; dy++) {
                const my = cy + dy;
                if (my < 0 || my >= H) continue;
                for (let dx = -radius; dx <= radius; dx++) {
                    const mx = g.wrapX(cx + dx);
                    const idx = my * W + mx;
                    if (g.scarType[idx] === targetScarType && g.scarIntensity[idx] >= 0.32) {
                        g.waterBodyType[idx] = waterType;
                        g.riverFlux[idx] = fluxValue;
                    }
                }
            }
        }

        // ---------------------------------------------------------------------
        // CAMADA 6: Matriz de Biomas Whittaker + Wuxing
        // ---------------------------------------------------------------------
        _buildLayer6WhittakerXianxiaBiomes() {
            const g = this.macroGrid;
            const size = g.size;

            for (let i = 0; i < size; i++) {
                const h = g.elevation[i];
                const temp = g.temperature[i];
                const hum = g.humidity[i];
                const qi = g.qiDensity[i];
                const elem = g.wuxingElement[i];
                const scar = g.scarType[i];
                const wb = g.waterBodyType[i];

                let biome = 4; // Planície Mortal (Default)

                if (h < -80.0 || wb === 1) {
                    biome = 0; // Oceano Profundo
                } else if (h < 0.0 || wb === 2) {
                    biome = 1; // Mar Costeiro
                } else if (scar === 1) {
                    biome = 11; // Ravina de Intenção de Espada (Seca ou Cânion Fluvial)
                } else if (scar === 2) {
                    biome = 12; // Cratera de Palma Gigante (Seca ou Lago Sagrado)
                } else if (scar === 3 || elem === 6) {
                    biome = 10; // Terras de Sangue & Yin (Sha Qi)
                } else if (h >= 650.0 && elem === 7) {
                    biome = 9; // Mar de Relâmpagos Celestiais
                } else if (temp < -3.0) {
                    biome = 2; // Geleira de Gelo Perpétuo
                } else if (h >= 550.0) {
                    biome = 8; // Montanha Espiritual (Ling Shan)
                } else if (temp < 6.0) {
                    biome = 3; // Tundra Espiritual
                } else if (h < 115.0 && hum > 76.0 && temp > 14.0) {
                    biome = 7; // Pântano de Miasma & Veneno
                } else if (temp > 21.0 && hum < 32.0) {
                    biome = 6; // Deserto de Fogo Terrestre (Sombra de Chuva)
                } else if (hum >= 56.0 && temp >= 10.0 && (qi >= 42.0 || elem === 2)) {
                    biome = 5; // Floresta de Bambu de Jade
                } else {
                    biome = 4; // Planície Mortal & Vales
                }

                g.biomeId[i] = biome;
            }
        }

        // ---------------------------------------------------------------------
        // CAMADA 7: Povoamento Estratégico (Cidades, Portos, Seitas e Estradas A*)
        // ---------------------------------------------------------------------
        _buildLayer7StrategicSettlementsAndRoads() {
            const g = this.macroGrid;
            const W = g.width;
            const H = g.height;

            const cityNames = [
                "Cidade do Rio de Jade", "Bastilha da Fênix Dourada", "Vila das Nuvens Brancas",
                "Cidade Imperial de Tianjing", "Forte do Dragão Adormecido", "Cidade do Lótus Carmesim",
                "Mercado das Nove Pontes", "Cidade da Lua Crescente", "Vale do Cinábrio",
                "Cidade da Brisa de Outono", "Cidadela do Bambu Celeste", "Vila das Águas Claras"
            ];
            const portNames = [
                "Porto da Maré Imortal", "Baía das Pérolas Espirituais", "Cais do Dragão do Mar",
                "Estuário das Sete Velas", "Porto da Estrela do Sul", "Enseada da Tartaruga Negra"
            ];
            const orthodoxSectNames = [
                "Seita da Espada do Céu Azul", "Pico do Lótus de Jade", "Pavilhão das Nuvens Celestes",
                "Seita do Trovão Primordial", "Montanha da Imortalidade Pura", "Ordem do Sol Nascente"
            ];
            const demonicSectNames = [
                "Culto do Sangue Abissal", "Seita do Demônio Celestial", "Vale dos Dez Mil Venenos",
                "Palácio das Sombras Yin", "Clã da Chama Negra", "Altar dos Ossos Brancos"
            ];

            const placePOIs = (typeId, targetCount, minSep, scoreFn, nameList) => {
                const candidates = [];
                for (let my = 16; my < H - 16; my += 3) {
                    for (let mx = 0; mx < W; mx += 3) {
                        const s = scoreFn(mx, my);
                        if (s > 0) {
                            candidates.push({ mx, my, score: s });
                        }
                    }
                }
                candidates.sort((a, b) => b.score - a.score);

                let count = 0;
                for (let c = 0; c < candidates.length && count < targetCount; c++) {
                    const cand = candidates[c];
                    let tooClose = false;
                    for (let p = 0; p < g.pois.length; p++) {
                        const existing = g.pois[p];
                        const reqDist = existing.type === typeId ? minSep : 8;
                        if (g.cylindricalDist(cand.mx, cand.my, existing.mx, existing.my) < reqDist) {
                            tooClose = true;
                            break;
                        }
                    }
                    if (!tooClose) {
                        const idx = cand.my * W + cand.mx;
                        g.poiType[idx] = typeId;
                        const poiObj = {
                            id: `poi_${typeId}_${count}`,
                            type: typeId,
                            typeName: POI_NAMES[typeId],
                            name: nameList[count % nameList.length] + (count >= nameList.length ? ` ${count + 1}` : ""),
                            mx: cand.mx,
                            my: cand.my,
                            ox: cand.mx * OVERWORLD_TILE_PER_MACRO + 8,
                            oy: cand.my * OVERWORLD_TILE_PER_MACRO + 8
                        };
                        g.pois.push(poiObj);
                        g.poiByMacroIndex.set(idx, poiObj);
                        count++;
                    }
                }
            };

            // 1. Cidades Portuárias (Estuários onde Rios deságuam no Oceano / Costa)
            placePOIs(2, 18, 22, (mx, my) => {
                const i = (my << 9) | mx;
                const h = g.elevation[i];
                if (h < 2.0 || h > 95.0) return -1;
                let hasSeaNeighbor = false;
                let maxRiverFlux = g.riverFlux[i];
                for (let d = 0; d < 8; d++) {
                    const ny = my + D8_DY[d];
                    if (ny < 0 || ny >= H) continue;
                    const nx = (mx + D8_DX[d]) & 511;
                    const ni = (ny << 9) | nx;
                    if (g.elevation[ni] < 0) hasSeaNeighbor = true;
                    if (g.riverFlux[ni] > maxRiverFlux) maxRiverFlux = g.riverFlux[ni];
                }
                if (!hasSeaNeighbor) return -1;
                const temp = g.temperature[i];
                if (temp < 0.0 || temp > 34.0) return -1;
                return 50.0 + Math.min(200.0, maxRiverFlux * 0.4);
            }, portNames);

            // 2. Cidades Mortais & Vilarejos (45 no globo, próximas a rios e planícies férteis)
            placePOIs(1, 45, 16, (mx, my) => {
                const i = (my << 9) | mx;
                const h = g.elevation[i];
                const temp = g.temperature[i];
                const qi = g.qiDensity[i];
                if (h < 10.0 || h > 230.0) return -1;
                if (temp < 6.0 || temp > 30.0) return -1;
                if (g.scarType[i] !== 0) return -1;

                let nearRiver = (g.waterBodyType[i] === 3 || g.waterBodyType[i] === 4 || g.waterBodyType[i] === 6);
                if (!nearRiver) {
                    for (let d = 0; d < 8; d++) {
                        const ni = g.idx(mx + D8_DX[d], my + D8_DY[d]);
                        if (g.waterBodyType[ni] >= 3 && g.waterBodyType[ni] <= 6) {
                            nearRiver = true;
                            break;
                        }
                    }
                }
                if (!nearRiver) return -1;
                return 100.0 - Math.abs(qi - 38.0) + g.humidity[i] * 0.4;
            }, cityNames);

            // 3. Seitas Ortodoxas Imortais (15 no globo, no topo de Ling Shan com Qi >= 70 ou bordas de Ravina)
            placePOIs(3, 15, 24, (mx, my) => {
                const i = (my << 9) | mx;
                const h = g.elevation[i];
                const qi = g.qiDensity[i];
                if (g.scarType[i] === 1 && qi >= 60.0) {
                    return 130.0 + qi; // Seita de Espada na borda da Ravina!
                }
                if (h < 550.0 || qi < 68.0) return -1;
                return qi * 1.5 + (h / 20.0);
            }, orthodoxSectNames);

            // 4. Seitas Demoníacas & Clãs Ocultos (10 no globo, em Terras de Sangue, Pântanos ou Desertos)
            placePOIs(4, 10, 26, (mx, my) => {
                const i = (my << 9) | mx;
                const b = g.biomeId[i];
                if (b !== 10 && b !== 7 && b !== 6) return -1;
                return (b === 10 ? 150.0 : 90.0) + g.qiDensity[i];
            }, demonicSectNames);

            // 5. Estradas Imperiais conectando Cidades e Portos próximos no mesmo continente
            const civilPOIs = g.pois.filter(p => p.type === 1 || p.type === 2);
            for (let i = 0; i < civilPOIs.length; i++) {
                const pA = civilPOIs[i];
                const near = [];
                for (let j = 0; j < civilPOIs.length; j++) {
                    if (i === j) continue;
                    const pB = civilPOIs[j];
                    const dist = g.cylindricalDist(pA.mx, pA.my, pB.mx, pB.my);
                    if (dist <= 28) near.push({ poi: pB, dist, idx: j });
                }
                near.sort((a, b) => a.dist - b.dist);
                const maxRoads = Math.min(2, near.length);
                for (let r = 0; r < maxRoads; r++) {
                    if (near[r].idx < i) continue;
                    this._traceMacroRoad(pA.mx, pA.my, near[r].poi.mx, near[r].poi.my);
                }
            }
        }

        _traceMacroRoad(x1, y1, x2, y2) {
            const g = this.macroGrid;
            const W = g.width;
            let cx = x1;
            let cy = y1;
            const maxSteps = 64;

            for (let step = 0; step < maxSteps; step++) {
                if (cx === x2 && cy === y2) break;

                let dx = x2 - cx;
                if (dx > W / 2) dx -= W;
                if (dx < -W / 2) dx += W;
                const dy = y2 - cy;

                let bestDir = -1;
                let bestCost = Infinity;

                for (let dir = 0; dir < 8; dir++) {
                    const nx = g.wrapX(cx + D8_DX[dir]);
                    const ny = cy + D8_DY[dir];
                    if (ny < 2 || ny >= g.height - 2) continue;

                    const ni = ny * W + nx;
                    const h = g.elevation[ni];
                    // Evita oceanos abertos; permite atravessar rios (criará pontes!)
                    if (h < -5.0) continue;

                    let remDx = x2 - nx;
                    if (remDx > W / 2) remDx -= W;
                    if (remDx < -W / 2) remDx += W;
                    const remDy = y2 - ny;
                    const distToGoal = Math.hypot(remDx, remDy);

                    const slopePenalty = Math.max(0, (h - 350.0) * 0.015);
                    const riverPenalty = (g.waterBodyType[ni] === 4) ? 0.6 : 0.0;
                    const cost = distToGoal + slopePenalty + riverPenalty;

                    if (cost < bestCost) {
                        bestCost = cost;
                        bestDir = dir;
                    }
                }

                if (bestDir < 0) break;
                const currIdx = cy * W + cx;
                const nextX = g.wrapX(cx + D8_DX[bestDir]);
                const nextY = cy + D8_DY[bestDir];
                const nextIdx = nextY * W + nextX;

                g.roadMask[currIdx] |= (1 << bestDir);
                g.roadMask[nextIdx] |= (1 << D8_OPPOSITE[bestDir]);

                cx = nextX;
                cy = nextY;
            }
        }

        // ---------------------------------------------------------------------
        // CAMADA 8: Sistema de Reinos Secretos em 3 Camadas
        // ---------------------------------------------------------------------
        _buildLayer8SecretRealms() {
            const g = this.macroGrid;
            const W = g.width;
            const H = g.height;

            const dongtianNames = [
                "Jardim Imortal da Lua Cheia", "Palácio Submerso do Dragão Azul",
                "Paraíso da Flor de Pêssego Milenar", "Domínio Estelar do Vazio Antigo",
                "Gruta Celestial dos Nove Sóis", "Santuário da Fênix de Gelo"
            ];
            const tombNames = [
                "Tumba Selada do Imperador da Espada", "Mansão Subterrânea do Alquimista",
                "Cripta Rúnica do Monarca de Jade", "Mausoléu do Santo das Matrizes",
                "Câmara Ancestral do Demônio de Sangue", "Relicário do Soberano Trovão"
            ];
            const riftNames = [
                "Fenda Espacial da Tempestade do Vazio", "Rasgo Dimensional de Qi Caótico",
                "Abismo Planar das Estrelas Partidas", "Fenda de Éter Primordial"
            ];

            // 1. Reinos Cíclicos (Dongtian — poiType = 5)
            let dongtianCount = 0;
            for (let my = 20; my < H - 20 && dongtianCount < 10; my += 18) {
                for (let mx = 10; mx < W && dongtianCount < 10; mx += 47) {
                    const cmx = g.wrapX(mx + this._rng.int(-6, 6));
                    const cmy = g.clampY(my + this._rng.int(-4, 4));
                    const idx = cmy * W + cmx;
                    if (g.elevation[idx] > 20 && g.poiType[idx] === 0 && g.qiDensity[idx] >= 48) {
                        g.poiType[idx] = 5;
                        const poiObj = {
                            id: `dongtian_${cmx}_${cmy}`,
                            type: 5,
                            typeName: POI_NAMES[5],
                            name: dongtianNames[dongtianCount % dongtianNames.length],
                            mx: cmx,
                            my: cmy,
                            ox: cmx * OVERWORLD_TILE_PER_MACRO + 8,
                            oy: cmy * OVERWORLD_TILE_PER_MACRO + 8,
                            maxRealmAllowed: 2, // Apenas até Estabelecimento de Fundação (índice <= 2)
                            openMoonPhases: [0, 4], // Lua Nova ou Lua Cheia
                            heritageReward: ["true_dragon", "cosmic_phoenix", "qilin_sacred", "immortal_emperor"][dongtianCount % 4]
                        };
                        g.pois.push(poiObj);
                        g.poiByMacroIndex.set(idx, poiObj);
                        dongtianCount++;
                    }
                }
            }

            // 2. Tumbas & Mansões Seladas (poiType = 6)
            let tombCount = 0;
            for (let my = 28; my < H - 28 && tombCount < 10; my += 20) {
                for (let mx = 25; mx < W && tombCount < 10; mx += 51) {
                    const cmx = g.wrapX(mx + this._rng.int(-5, 5));
                    const cmy = g.clampY(my + this._rng.int(-5, 5));
                    const idx = cmy * W + cmx;
                    if (g.elevation[idx] > 80 && g.poiType[idx] === 0) {
                        g.poiType[idx] = 6;
                        const poiObj = {
                            id: `tomb_${cmx}_${cmy}`,
                            type: 6,
                            typeName: POI_NAMES[6],
                            name: tombNames[tombCount % tombNames.length],
                            mx: cmx,
                            my: cmy,
                            ox: cmx * OVERWORLD_TILE_PER_MACRO + 8,
                            oy: cmy * OVERWORLD_TILE_PER_MACRO + 8,
                            requiredArraySkill: 3 + (tombCount % 4)
                        };
                        g.pois.push(poiObj);
                        g.poiByMacroIndex.set(idx, poiObj);
                        tombCount++;
                    }
                }
            }

            // 3. Fendas Espaciais Espontâneas (poiType = 7)
            let riftCount = 0;
            for (let my = 35; my < H - 35 && riftCount < 8; my += 24) {
                for (let mx = 38; mx < W && riftCount < 8; mx += 61) {
                    const cmx = g.wrapX(mx + this._rng.int(-5, 5));
                    const cmy = g.clampY(my + this._rng.int(-5, 5));
                    const idx = cmy * W + cmx;
                    if (g.elevation[idx] > 0 && g.poiType[idx] === 0) {
                        g.poiType[idx] = 7;
                        const poiObj = {
                            id: `rift_${cmx}_${cmy}`,
                            type: 7,
                            typeName: POI_NAMES[7],
                            name: riftNames[riftCount % riftNames.length],
                            mx: cmx,
                            my: cmy,
                            ox: cmx * OVERWORLD_TILE_PER_MACRO + 8,
                            oy: cmy * OVERWORLD_TILE_PER_MACRO + 8
                        };
                        g.pois.push(poiObj);
                        g.poiByMacroIndex.set(idx, poiObj);
                        riftCount++;
                    }
                }
            }
        }

        // ---------------------------------------------------------------------
        // CONSULTA DE DADOS EM ESCALA OVERWORLD (8192 x 4096)
        // ---------------------------------------------------------------------
        wrapOverworldX(ox) {
            return ((Math.floor(ox) % OVERWORLD_W) + OVERWORLD_W) % OVERWORLD_W;
        }

        clampOverworldY(oy) {
            return Math.max(0, Math.min(OVERWORLD_H - 1, Math.floor(oy)));
        }

        wrapLocalX(lx) {
            return ((Math.floor(lx) % LOCAL_W) + LOCAL_W) % LOCAL_W;
        }

        clampLocalY(ly) {
            return Math.max(0, Math.min(LOCAL_H - 1, Math.floor(ly)));
        }

        /**
         * Interpola suavemente os campos escalares do Macro-Grid (512x256) para o tile Overworld (ox, oy)
         * e resolve rios contínuos, estradas, pontes, cicatrizes e POIs.
         */
        getOverworldDataAt(ox, oy) {
            this.ensureInitialized();
            const g = this.macroGrid;
            const W = g.width;

            const wOx = this.wrapOverworldX(ox);
            const cOy = this.clampOverworldY(oy);

            const fx = wOx / OVERWORLD_TILE_PER_MACRO - 0.5;
            const fy = cOy / OVERWORLD_TILE_PER_MACRO - 0.5;

            const mx0 = Math.floor(fx);
            const my0 = Math.floor(fy);
            const u = fx - mx0;
            const v = fy - my0;

            // Smoothstep para interpolação sem quinas
            const su = u * u * (3.0 - 2.0 * u);
            const sv = v * v * (3.0 - 2.0 * v);

            const x0 = g.wrapX(mx0);
            const x1 = g.wrapX(mx0 + 1);
            const y0 = g.clampY(my0);
            const y1 = g.clampY(my0 + 1);

            const i00 = y0 * W + x0;
            const i10 = y0 * W + x1;
            const i01 = y1 * W + x0;
            const i11 = y1 * W + x1;

            const bilerp = (arr) => {
                const top = arr[i00] + su * (arr[i10] - arr[i00]);
                const bot = arr[i01] + su * (arr[i11] - arr[i01]);
                return top + sv * (bot - top);
            };

            // Ruído de detalhe de alta frequência (sem costura em X)
            const detail = this._noiseDetail.sampleLoop(wOx, cOy, OVERWORLD_W, 0.045, 2, 2.0, 0.5);

            const cellMx = g.wrapX(Math.floor(wOx / OVERWORLD_TILE_PER_MACRO));
            const cellMy = g.clampY(Math.floor(cOy / OVERWORLD_TILE_PER_MACRO));
            const cellIdx = cellMy * W + cellMx;
            const lx = wOx % OVERWORLD_TILE_PER_MACRO; // 0..15
            const ly = cOy % OVERWORLD_TILE_PER_MACRO; // 0..15

            let height = bilerp(g.elevation) + detail * 18.0;
            const temperature = bilerp(g.temperature) + detail * 0.8;
            const humidity = Math.max(0, Math.min(100, bilerp(g.humidity) + detail * 4.0));
            const qiDensity = Math.max(0, Math.min(100, bilerp(g.qiDensity) + detail * 3.0));

            const scarType = g.scarType[cellIdx];
            const scarIntensity = g.scarIntensity[cellIdx];
            const wuxingElement = g.wuxingElement[cellIdx];

            // Geometria sub-macro de Rios e Estradas dentro do bloco 16x16 do Overworld
            const macroWaterType = g.waterBodyType[cellIdx];
            const macroFlux = g.riverFlux[cellIdx];
            const flowDir = g.flowDir[cellIdx];
            const inflowMask = g.inflowMask[cellIdx];
            const roadMask = g.roadMask[cellIdx];

            let waterBodyType = 0;
            let distToRiverCenter = 99.0;

            if (height < -80.0) {
                waterBodyType = 1; // Oceano Profundo
            } else if (height < 0.0) {
                waterBodyType = 2; // Mar Costeiro
            } else if (macroWaterType === 6 || macroWaterType === 7) {
                // Lago ou Lago Sagrado da Palma ocupa o centro da macro-célula
                const dc = Math.hypot(lx - 7.5, ly - 7.5) + detail * 1.4;
                if (dc <= 6.2) {
                    waterBodyType = macroWaterType;
                    distToRiverCenter = 0;
                }
            }

            if (waterBodyType === 0 && (macroWaterType === 3 || macroWaterType === 4 || macroWaterType === 5)) {
                distToRiverCenter = this._distanceToMacroChannel(lx, ly, flowDir, inflowMask);
                const riverHalfWidth = macroWaterType === 5 ? 1.8 : (macroWaterType === 4 ? 1.45 : 0.85);
                if (distToRiverCenter <= riverHalfWidth) {
                    waterBodyType = macroWaterType;
                }
            }

            // Verifica Estrada Imperial e Ponte Automática
            let isRoad = false;
            let isBridge = false;
            if (roadMask !== 0 && height >= -2.0) {
                const distRoad = this._distanceToBitmaskSegments(lx, ly, roadMask);
                if (distRoad <= 0.85) {
                    isRoad = true;
                    if (waterBodyType >= 3 && waterBodyType <= 5) {
                        isBridge = true;
                    }
                }
            }

            // POI ancorado no centro (lx=8, ly=8) da macro-célula
            let poiType = 0;
            let poiData = null;
            if (g.poiType[cellIdx] !== 0) {
                poiData = g.poiByMacroIndex.get(cellIdx) || null;
                if (lx === 8 && ly === 8) {
                    poiType = g.poiType[cellIdx];
                }
            }

            // Resolve Bioma Final no ponto interpolado
            let biomeId = g.biomeId[cellIdx];
            if (waterBodyType === 1) {
                biomeId = 0;
            } else if (waterBodyType === 2) {
                biomeId = 1;
            } else if (scarType === 1) {
                biomeId = 11;
            } else if (scarType === 2) {
                biomeId = 12;
            } else if (scarType === 3 || wuxingElement === 6) {
                biomeId = 10;
            } else if (height >= 650.0 && wuxingElement === 7) {
                biomeId = 9;
            } else if (temperature < -3.0) {
                biomeId = 2;
            } else if (height >= 550.0) {
                biomeId = 8;
            } else if (temperature < 6.0) {
                biomeId = 3;
            } else if (height < 115.0 && humidity > 76.0 && temperature > 14.0) {
                biomeId = 7;
            } else if (temperature > 21.0 && humidity < 32.0) {
                biomeId = 6;
            } else if (humidity >= 56.0 && temperature >= 10.0 && (qiDensity >= 42.0 || wuxingElement === 2)) {
                biomeId = 5;
            } else {
                biomeId = 4;
            }

            const biomeMeta = BIOME_CATALOG[biomeId] || BIOME_CATALOG[4];

            return {
                ox: wOx,
                oy: cOy,
                mx: cellMx,
                my: cellMy,
                height,
                temp: temperature,        // Alias retrocompatível com EnvironmentVariableUpdater
                temperature,
                humidity,
                qiDensity,
                wuxingElement,
                wuxingName: WUXING_NAMES[wuxingElement] || "Neutro",
                scarType,
                scarName: SCAR_NAMES[scarType] || "Nenhum",
                scarIntensity,
                waterBodyType,
                waterBodyName: WATER_BODY_NAMES[waterBodyType] || "Terra Seca",
                riverFlux: macroFlux,
                flowDir,
                inflowMask,
                distToRiverCenter,
                isRoad,
                isBridge,
                biomeId,
                biomeKey: biomeMeta.key,
                biomeName: biomeMeta.name,
                poiType,
                poiMacroType: g.poiType[cellIdx],
                poiData
            };
        }

        _distanceToMacroChannel(lx, ly, outDir, inflowMask) {
            const cx = 7.5;
            const cy = 7.5;
            let minDist = Math.hypot(lx - cx, ly - cy);

            const edgeCoord = (dir) => {
                return [
                    cx + D8_DX[dir] * 8.0,
                    cy + D8_DY[dir] * 8.0
                ];
            };

            if (outDir >= 0 && outDir < 8) {
                const [ex, ey] = edgeCoord(outDir);
                minDist = Math.min(minDist, this._pointToSegmentDist(lx, ly, cx, cy, ex, ey));
            }

            for (let d = 0; d < 8; d++) {
                if (inflowMask & (1 << d)) {
                    const [ix, iy] = edgeCoord(d);
                    minDist = Math.min(minDist, this._pointToSegmentDist(lx, ly, ix, iy, cx, cy));
                }
            }
            return minDist;
        }

        _distanceToBitmaskSegments(lx, ly, mask) {
            const cx = 7.5;
            const cy = 7.5;
            let minDist = 99.0;
            for (let d = 0; d < 8; d++) {
                if (mask & (1 << d)) {
                    const ex = cx + D8_DX[d] * 8.0;
                    const ey = cy + D8_DY[d] * 8.0;
                    minDist = Math.min(minDist, this._pointToSegmentDist(lx, ly, cx, cy, ex, ey));
                }
            }
            return minDist;
        }

        _pointToSegmentDist(px, py, x1, y1, x2, y2) {
            const vx = x2 - x1;
            const vy = y2 - y1;
            const wx = px - x1;
            const wy = py - y1;
            const c2 = vx * vx + vy * vy;
            if (c2 <= 1e-6) return Math.hypot(px - x1, py - y1);
            const t = Math.max(0.0, Math.min(1.0, (wx * vx + wy * vy) / c2));
            return Math.hypot(px - (x1 + t * vx), py - (y1 + t * vy));
        }

        // ---------------------------------------------------------------------
        // CONSULTA DE DADOS EM ESCALA LOCAL 1:1 (262.144 x 131.072)
        // ---------------------------------------------------------------------
        /**
         * Sub-interpola continuamente a escala 1:1 (1 tile Overworld = 32x32 tiles Locais)
         * garantindo fronteiras de bioma orgânicas sem cortes retos e rios em curvas suaves.
         */
        getLocalDataAt(lx, ly) {
            this.ensureInitialized();
            const wLx = this.wrapLocalX(lx);
            const cLy = this.clampLocalY(ly);

            const ox0 = Math.floor(wLx / LOCAL_TILE_PER_OVERWORLD);
            const oy0 = Math.floor(cLy / LOCAL_TILE_PER_OVERWORLD);
            const sx = wLx % LOCAL_TILE_PER_OVERWORLD; // 0..31
            const sy = cLy % LOCAL_TILE_PER_OVERWORLD; // 0..31

            // Pesos bilineares dentro do bloco 32x32
            const u = sx / LOCAL_TILE_PER_OVERWORLD;
            const v = sy / LOCAL_TILE_PER_OVERWORLD;

            // Perturbação orgânica para eliminar linhas retas de transição de bioma 1:1
            const jitterX = this._noiseDetail.sampleLoop(wLx, cLy, LOCAL_W, 0.08, 2) * 0.28;
            const jitterY = this._noiseDetail.sampleLoop(wLx + 911, cLy - 547, LOCAL_W, 0.08, 2) * 0.28;

            const sampleOx = this.wrapOverworldX(Math.floor((wLx + jitterX * 32.0) / LOCAL_TILE_PER_OVERWORLD));
            const sampleOy = this.clampOverworldY(Math.floor((cLy + jitterY * 32.0) / LOCAL_TILE_PER_OVERWORLD));

            const baseOw = this.getOverworldDataAt(ox0, oy0);
            const jitterOw = (sampleOx === ox0 && sampleOy === oy0)
                ? baseOw
                : this.getOverworldDataAt(sampleOx, sampleOy);

            const d01 = this.getOverworldDataAt(ox0 + 1, oy0);
            const d10 = this.getOverworldDataAt(ox0, oy0 + 1);
            const d11 = this.getOverworldDataAt(ox0 + 1, oy0 + 1);

            const lerp4 = (k) => {
                const top = baseOw[k] + u * (d01[k] - baseOw[k]);
                const bot = d10[k] + u * (d11[k] - d10[k]);
                return top + v * (bot - top);
            };

            const height = lerp4("height");
            const temperature = lerp4("temperature");
            const humidity = lerp4("humidity");
            const qiDensity = lerp4("qiDensity");

            // Curva de Rio Contínua dentro do bloco 32x32 caso o Overworld possua rio
            let localWaterType = 0;
            let localRiverDist = 99.0;
            let localIsBridge = false;
            let localIsRoad = false;

            if (height < -80.0) {
                localWaterType = 1;
            } else if (height < 0.0) {
                localWaterType = 2;
            } else if (baseOw.waterBodyType >= 3 && baseOw.waterBodyType <= 7) {
                if (baseOw.waterBodyType === 6 || baseOw.waterBodyType === 7) {
                    // Lago / Lago Sagrado em escala 1:1
                    localWaterType = baseOw.waterBodyType;
                    localRiverDist = 0;
                } else {
                    // Curva senoidal suave atravessando o bloco 32x32 na direção do fluxo
                    const cx = 15.5;
                    const cy = 15.5;
                    const dir = baseOw.flowDir >= 0 ? baseOw.flowDir : 2;
                    const opp = D8_OPPOSITE[dir];
                    const xIn = cx + D8_DX[opp] * 16.0;
                    const yIn = cy + D8_DY[opp] * 16.0;
                    const xOut = cx + D8_DX[dir] * 16.0;
                    const yOut = cy + D8_DY[dir] * 16.0;

                    const bend = Math.sin((sx + sy) * 0.2) * 2.2;
                    const d1 = this._pointToSegmentDist(sx, sy, xIn, yIn, cx + bend, cy - bend);
                    const d2 = this._pointToSegmentDist(sx, sy, cx + bend, cy - bend, xOut, yOut);
                    localRiverDist = Math.min(d1, d2);

                    const halfW = baseOw.waterBodyType === 5 ? 5.5 : (baseOw.waterBodyType === 4 ? 4.2 : 1.6);
                    if (localRiverDist <= halfW) {
                        localWaterType = baseOw.waterBodyType;
                    }
                }
            }

            if (baseOw.isRoad) {
                const roadDist = Math.min(Math.abs(sx - 16), Math.abs(sy - 16));
                if (roadDist <= 2) {
                    localIsRoad = true;
                    if (localWaterType >= 3 && localWaterType <= 5) {
                        localIsBridge = true;
                    }
                }
            }

            const biomeId = localWaterType === 1 ? 0 : (localWaterType === 2 ? 1 : jitterOw.biomeId);
            const biomeMeta = BIOME_CATALOG[biomeId] || BIOME_CATALOG[4];

            return {
                lx: wLx,
                ly: cLy,
                ox: ox0,
                oy: oy0,
                sx,
                sy,
                height,
                temp: temperature,
                temperature,
                humidity,
                qiDensity,
                wuxingElement: jitterOw.wuxingElement,
                wuxingName: jitterOw.wuxingName,
                scarType: baseOw.scarType || jitterOw.scarType,
                scarName: baseOw.scarName || jitterOw.scarName,
                scarIntensity: Math.max(baseOw.scarIntensity, jitterOw.scarIntensity),
                waterBodyType: localWaterType,
                waterBodyName: WATER_BODY_NAMES[localWaterType] || "Terra Seca",
                riverFlux: baseOw.riverFlux,
                distToRiverCenter: localRiverDist,
                isRoad: localIsRoad,
                isBridge: localIsBridge,
                biomeId,
                biomeKey: biomeMeta.key,
                biomeName: biomeMeta.name,
                poiType: baseOw.poiType,
                poiMacroType: baseOw.poiMacroType,
                poiData: baseOw.poiData
            };
        }

        /**
         * Alias retrocompatível para EnvironmentVariableUpdater.js, CultivationCore.js e ProceduralWorldMap.js
         */
        getEnvironmentDataForCoords(x, y) {
            const isLocal = (globalThis.OverworldChunkManager && globalThis.OverworldChunkManager.getScaleMode() === "local");
            if (isLocal) {
                return this.getLocalDataAt(x, y);
            }
            return this.getOverworldDataAt(x, y);
        }

        getBiomeNameForCoords(x, y) {
            const data = this.getEnvironmentDataForCoords(x, y);
            return data ? data.biomeName : "Planície Mortal & Vales";
        }

        getBiomeCatalog() {
            return BIOME_CATALOG;
        }
    }

    // Instância Singleton Global
    const engineInstance = new WorldClimateEngine();

    globalThis.WorldClimateEngine = engineInstance;
    globalThis.PlanetaryMacroGrid = PlanetaryMacroGrid;
    globalThis.Mulberry32 = Mulberry32;
    globalThis.CylindricalNoise3D = CylindricalNoise3D;

    if (typeof window !== "undefined") {
        window.WorldClimateEngine = engineInstance;
    }

    // Retrocompatibilidade transparente com plugins que consultam globalThis.PerlinNoiseGenerator
    globalThis.PerlinNoiseGenerator = globalThis.PerlinNoiseGenerator || {};
    globalThis.PerlinNoiseGenerator.getEnvironmentDataForCoords = (x, y) => engineInstance.getEnvironmentDataForCoords(x, y);
    globalThis.PerlinNoiseGenerator.getBiomeNameForCoords = (x, y) => engineInstance.getBiomeNameForCoords(x, y);
    globalThis.PerlinNoiseGenerator.getLayersAt = (x, y) => {
        const d = engineInstance.getOverworldDataAt(x, y);
        const cat = BIOME_CATALOG[d.biomeId] || BIOME_CATALOG[4];
        return {
            baseTile: (d.waterBodyType >= 3 && d.waterBodyType <= 7) ? 2048 : cat.overworldGroundTile,
            upperTile: cat.overworldUpperTile
        };
    };

    // Registra no EnvironmentVariableUpdater se já estiver carregado ou quando solicitado
    engineInstance.registerWithEnvironmentUpdater = function() {
        if (globalThis.EnvironmentVariableUpdater && typeof globalThis.EnvironmentVariableUpdater.registerDataProvider === "function") {
            globalThis.EnvironmentVariableUpdater.registerDataProvider("WorldClimateEngine", (x, y) => engineInstance.getEnvironmentDataForCoords(x, y));
            globalThis.EnvironmentVariableUpdater.registerDataProvider("PerlinNoiseGenerator", (x, y) => engineInstance.getEnvironmentDataForCoords(x, y));
            return true;
        }
        return false;
    };
    engineInstance.registerWithEnvironmentUpdater();

    if (typeof module !== "undefined" && module.exports) {
        module.exports = {
            WorldClimateEngine: engineInstance,
            WorldClimateEngineClass: WorldClimateEngine,
            PlanetaryMacroGrid,
            Mulberry32,
            CylindricalNoise3D,
            BIOME_CATALOG,
            MACRO_W,
            MACRO_H,
            OVERWORLD_W,
            OVERWORLD_H,
            LOCAL_W,
            LOCAL_H
        };
    }
})();
