//=============================================================================
// RPG Maker MZ - LocalMapGenerator.js [v3.0.0]
// Motor 1:1 Contínuo (262.144 x 131.072 tiles), Sub-Grid 1:32 Determinístico,
// Carimbo de Cidades/Seitas/Cicatrizes/Reinos Secretos e Transição Bidirecional.
//=============================================================================

/*:
 * @target MZ
 * @plugindesc [v3.0.0] Motor Contínuo de Escala Local 1:1 (1 Tile Overworld = 32x32 Tiles Locais): Biomas Sem Costura, Rios Bézier, Cidades, Seitas, Cicatrizes e Reinos Secretos.
 * @author Gabriel & Antigravity
 * @version 3.0.0
 * @license MIT
 * @help
 * ============================================================================
 * LocalMapGenerator.js — Continuidade Absoluta Overworld <-> Escala 1:1
 * ============================================================================
 * Garante que o jogador possa:
 * 1. Entrar automaticamente em Cidades, Portos, Seitas, Ravinas, Crateras ou
 *    Reinos Secretos ao pisar sobre eles no Overworld;
 * 2. Pressionar a tecla `E` em qualquer ponto do mundo para descer ao mapa 1:1
 *    exato daquela coordenada ou subir de volta ao Overworld (`Ox = floor(Lx/32)`);
 * 3. Caminhar indefinidamente na escala 1:1 por horas sem nunca voltar ao
 *    Overworld, cruzando fronteiras suaves de biomas, rios contínuos, pontes,
 *    Ravinas de Espada, Crateras de Palma e chegando a pé nos portões das
 *    Cidades e Seitas na posição exata correspondente ao Mapa-Múndi!
 *
 * @param chunkSize
 * @text Tamanho do Chunk Local
 * @type number
 * @default 16
 *
 * @param debugMode
 * @text Modo de Depuração
 * @type boolean
 * @default false
 */

(() => {
    "use strict";

    const pluginName = "LocalMapGenerator";
    const parameters = (typeof PluginManager !== "undefined" && PluginManager.parameters)
        ? PluginManager.parameters(pluginName)
        : {};

    const CHUNK_SIZE = Number(parameters["chunkSize"] || 16);
    const debugMode = String(parameters["debugMode"] || "false") === "true";

    const LOCAL_W = 262144;
    const LOCAL_H = 131072;
    const VIEWPORT_SIZE = 128;

    // Tiles Canônicos de Exterior 1:1 (Tileset ID 2 - Outside)
    const LOCAL_TILES = {
        DEEP_WATER: 2096,
        WATER: 2048,
        ICY_WATER: 2528,
        POISON_WATER: 2240,
        GRASS: 2816,
        FOREST_FLOOR: 2864,
        ROAD: 2912,
        COBBLE_PLAZA: 2960,
        STONE_FLOOR: 3008,
        SAND: 3200,
        MESA_FLOOR: 3296,
        DEAD_EARTH: 3392,
        TUNDRA_EARTH: 3584,
        SNOW: 3968,

        // Telhados e Paredes (A3 / A4)
        ROOF_RED: 4352,
        ROOF_GOLD: 4448,
        ROOF_JADE: 5120,
        ROOF_DARK: 4688,
        WALL_PLASTER: 4784,
        WALL_STONE: 4736,
        WALL_TEMPLE: 5552,
        WALL_CASTLE: 5888,
        CLIFF_ROCK: 7904,
        CLIFF_EARTH: 7520,

        // Pavimentos A5
        WOOD_DOCK: 1556,
        STONE_SLAB: 1560,
        STAIRS_UP: 1544,

        // Props Camada B (Outside_B)
        LAMP_POST: 24,
        SWORD_MONUMENT: 65,
        SIGN_BOARD: 70,
        BRIDGE_H: 83,
        BRIDGE_V: 82,
        WELL_BASE: 147,
        TREE_PINE: 152,
        TREE_OAK: 153,
        CACTUS: 154,
        DEAD_TREE: 155,
        FLOWER_A: 160,
        FLOWER_B: 161,
        BOULDER: 162,
        BAMBOO_CLUMP: 163,
        ORE_CRYSTAL: 234,
        MIASMA_SKULL: 243,
        RUNE_MONOLITH: 253,
        PORTAL_ALTAR: 254
    };

    // =========================================================================
    // 1. TEMPLATES DETERMINÍSTICOS DE POIS & CICATRIZES NA ESCALA 1:1 (32x32)
    // =========================================================================
    class LocalPOITemplateStamp {
        /**
         * Verifica se o sub-tile (sx, sy) dentro de um bloco 32x32 de Overworld (ox, oy)
         * faz parte de uma estrutura de POI ou Cicatriz em escala 1:1.
         * Retorna null se for terreno natural, ou { l0, l1, l2, isWall } se carimbado.
         */
        static evaluateStamp(localData) {
            const { ox, oy, sx, sy, poiType, poiMacroType, scarType, waterBodyType } = localData;

            // 1. Se este tile exato de Overworld contém um POI (Cidade, Porto, Seita, Reino)
            if (poiType !== 0) {
                switch (poiType) {
                    case 1: return this._stampMortalCity(sx, sy, false);
                    case 2: return this._stampMortalCity(sx, sy, true);
                    case 3: return this._stampSectCompound(sx, sy, false);
                    case 4: return this._stampSectCompound(sx, sy, true);
                    case 5: return this._stampCyclicDongtian(sx, sy);
                    case 6: return this._stampSealedTomb(sx, sy);
                    case 7: return this._stampSpatialRift(sx, sy);
                }
            }

            // 2. Se estiver em uma Ravina de Intenção de Espada (scarType == 1)
            if (scarType === 1) {
                return this._stampSwordGorge1to1(sx, sy, waterBodyType === 5, ox, oy);
            }

            // 3. Se estiver em uma Cratera da Palma Celestial (scarType == 2)
            if (scarType === 2) {
                return this._stampPalmCrater1to1(sx, sy, waterBodyType === 7, ox, oy);
            }

            return null;
        }

        // Template 1:1 de Cidade Mortal / Cidade Portuária (32x32)
        static _stampMortalCity(sx, sy, isPort) {
            // Muralha perimetral (sx, sy entre 2 e 29) com 4 Portões (N, S, L, O em 14..17)
            const inGateX = (sx >= 14 && sx <= 17);
            const inGateY = (sy >= 14 && sy <= 17);

            // Docas marítimas ao sul/leste se for Cidade Portuária
            if (isPort && sy >= 29 && sx >= 8 && sx <= 24) {
                return {
                    groundBase: LOCAL_TILES.WATER,
                    upperBase: 0,
                    l2: (sx % 3 === 0 || sy === 30) ? LOCAL_TILES.WOOD_DOCK : 0,
                    isStructure: true
                };
            }

            // Avenidas principais em cruz conectando os 4 portões
            if (inGateX || inGateY) {
                // Fonte Espiritual no centro da Praça (15..16, 15..16)
                if ((sx === 15 || sx === 16) && (sy === 15 || sy === 16)) {
                    return {
                        groundBase: LOCAL_TILES.COBBLE_PLAZA,
                        upperBase: 0,
                        l2: sx === 15 && sy === 15 ? LOCAL_TILES.WELL_BASE : LOCAL_TILES.LAMP_POST,
                        isStructure: true
                    };
                }
                return {
                    groundBase: LOCAL_TILES.ROAD,
                    upperBase: 0,
                    l2: ((sx === 14 || sx === 17) && sy % 6 === 0) ? LOCAL_TILES.LAMP_POST : 0,
                    isStructure: true
                };
            }

            // Muralha Externa
            if (sx === 2 || sx === 29 || sy === 2 || sy === 29) {
                if (sx >= 2 && sx <= 29 && sy >= 2 && sy <= 29) {
                    return {
                        groundBase: LOCAL_TILES.STONE_FLOOR,
                        upperBase: LOCAL_TILES.WALL_CASTLE,
                        l2: 0,
                        isStructure: true
                    };
                }
            }

            // Fora dos muros: campina limpa
            if (sx < 2 || sx > 29 || sy < 2 || sy > 29) {
                return null;
            }

            // Praça Central (10..21, 10..21)
            if (sx >= 10 && sx <= 21 && sy >= 10 && sy <= 21) {
                return {
                    groundBase: LOCAL_TILES.COBBLE_PLAZA,
                    upperBase: 0,
                    l2: (sx === 11 && sy === 11) ? LOCAL_TILES.SIGN_BOARD : 0,
                    isStructure: true
                };
            }

            // 4 Quarteirões de Pavilhões Xianxia (Estalagem, Alquimia, Forja, Salão do Lorde)
            const inBldNW = (sx >= 4 && sx <= 9 && sy >= 4 && sy <= 8);
            const inBldNE = (sx >= 22 && sx <= 27 && sy >= 4 && sy <= 8);
            const inBldSW = (sx >= 4 && sx <= 9 && sy >= 22 && sy <= 26);
            const inBldSE = (sx >= 22 && sx <= 27 && sy >= 22 && sy <= 26);

            if (inBldNW || inBldNE || inBldSW || inBldSE) {
                const isFrontWall = (sy === 8 || sy === 26);
                const isDoor = isFrontWall && (sx === 6 || sx === 24);
                if (isDoor) {
                    return {
                        groundBase: LOCAL_TILES.COBBLE_PLAZA,
                        upperBase: 0,
                        l2: LOCAL_TILES.SIGN_BOARD,
                        isStructure: true
                    };
                }
                return {
                    groundBase: LOCAL_TILES.STONE_FLOOR,
                    upperBase: isFrontWall ? LOCAL_TILES.WALL_PLASTER : LOCAL_TILES.ROOF_RED,
                    l2: 0,
                    isStructure: true
                };
            }

            return {
                groundBase: LOCAL_TILES.COBBLE_PLAZA,
                upperBase: 0,
                l2: 0,
                isStructure: true
            };
        }

        // Template 1:1 de Seita Ortodoxa / Seita Demoníaca (32x32)
        static _stampSectCompound(sx, sy, isDemonic) {
            const roofTile = isDemonic ? LOCAL_TILES.ROOF_DARK : LOCAL_TILES.ROOF_JADE;
            const wallTile = isDemonic ? LOCAL_TILES.WALL_STONE : LOCAL_TILES.WALL_TEMPLE;

            // Escadaria Monumental Sul (Shanmen) subindo do portão (sy 22..31, sx 14..17)
            if (sx >= 14 && sx <= 17 && sy >= 18) {
                return {
                    groundBase: LOCAL_TILES.STONE_FLOOR,
                    upperBase: 0,
                    l2: (sy % 2 === 0) ? LOCAL_TILES.STAIRS_UP : 0,
                    isStructure: true
                };
            }

            // Portão da Montanha (Shanmen) em sy === 22
            if (sy === 22 && sx >= 10 && sx <= 21) {
                return {
                    groundBase: LOCAL_TILES.STONE_FLOOR,
                    upperBase: wallTile,
                    l2: (sx === 12 || sx === 19) ? LOCAL_TILES.SWORD_MONUMENT : 0,
                    isStructure: true
                };
            }

            // Grande Salão do Patriarca no Norte (sx 9..22, sy 4..10)
            if (sx >= 9 && sx <= 22 && sy >= 4 && sy <= 10) {
                const isDoor = (sy === 10 && sx >= 15 && sx <= 16);
                if (isDoor) {
                    return {
                        groundBase: LOCAL_TILES.STONE_FLOOR,
                        upperBase: 0,
                        l2: LOCAL_TILES.PORTAL_ALTAR,
                        isStructure: true
                    };
                }
                return {
                    groundBase: LOCAL_TILES.STONE_FLOOR,
                    upperBase: sy === 10 ? wallTile : roofTile,
                    l2: 0,
                    isStructure: true
                };
            }

            // Pátio de Treinamento e Poço da Veia de Dragão (sx 8..23, sy 11..21)
            if (sx >= 8 && sx <= 23 && sy >= 11 && sy <= 21) {
                let prop = 0;
                if (sx === 15 && sy === 15) prop = LOCAL_TILES.PORTAL_ALTAR; // Nó de Meditação Q=100
                else if ((sx === 10 || sx === 21) && (sy === 13 || sy === 18)) {
                    prop = isDemonic ? LOCAL_TILES.MIASMA_SKULL : LOCAL_TILES.SWORD_MONUMENT;
                }
                return {
                    groundBase: LOCAL_TILES.COBBLE_PLAZA,
                    upperBase: 0,
                    l2: prop,
                    isStructure: true
                };
            }

            return null;
        }

        // Template 1:1 de Reino Secreto Cíclico (Dongtian)
        static _stampCyclicDongtian(sx, sy) {
            const dist = Math.hypot(sx - 15.5, sy - 15.5);
            if (dist <= 3.0) {
                return {
                    groundBase: LOCAL_TILES.COBBLE_PLAZA,
                    upperBase: 0,
                    l2: (sx === 16 && sy === 16) ? LOCAL_TILES.PORTAL_ALTAR : LOCAL_TILES.RUNE_MONOLITH,
                    isStructure: true
                };
            }
            if (dist <= 7.5) {
                return {
                    groundBase: LOCAL_TILES.WATER,
                    upperBase: 0,
                    l2: ((sx + sy) % 5 === 0) ? LOCAL_TILES.FLOWER_A : 0,
                    isStructure: true
                };
            }
            if (dist <= 11.5) {
                return {
                    groundBase: LOCAL_TILES.GRASS,
                    upperBase: 0,
                    l2: ((sx * 3 + sy) % 4 === 0) ? LOCAL_TILES.BAMBOO_CLUMP : LOCAL_TILES.FLOWER_B,
                    isStructure: true
                };
            }
            return null;
        }

        // Template 1:1 de Tumba de Jade Selada
        static _stampSealedTomb(sx, sy) {
            if (sx >= 11 && sx <= 20 && sy >= 10 && sy <= 20) {
                const isEntrance = (sy === 20 && (sx === 15 || sx === 16));
                if (isEntrance) {
                    return {
                        groundBase: LOCAL_TILES.STONE_FLOOR,
                        upperBase: 0,
                        l2: LOCAL_TILES.RUNE_MONOLITH,
                        isStructure: true
                    };
                }
                const isBorder = (sx === 11 || sx === 20 || sy === 10 || sy === 20);
                return {
                    groundBase: LOCAL_TILES.STONE_FLOOR,
                    upperBase: isBorder ? LOCAL_TILES.CLIFF_ROCK : 0,
                    l2: (sx === 15 && sy === 14) ? LOCAL_TILES.PORTAL_ALTAR : 0,
                    isStructure: true
                };
            }
            return null;
        }

        // Template 1:1 de Fenda Espacial Instável
        static _stampSpatialRift(sx, sy) {
            const d = Math.hypot((sx - 16) * 0.7, (sy - 16) * 1.4);
            if (d <= 6.5) {
                return {
                    groundBase: LOCAL_TILES.TUNDRA_EARTH,
                    upperBase: 0,
                    l2: d <= 2.2 ? LOCAL_TILES.PORTAL_ALTAR : LOCAL_TILES.ORE_CRYSTAL,
                    isStructure: true
                };
            }
            return null;
        }

        // Template 1:1 de Ravina de Intenção de Espada (Desfiladeiro em V + Espadas Gigantes Cravadas)
        static _stampSwordGorge1to1(sx, sy, isRiverCanyon, ox, oy) {
            // Diagonal principal do corte de espada atravessando o bloco 32x32
            const distDiag = Math.abs((sx - 16) * 0.75 + (sy - 16) * 0.65);

            // Centro do Abismo / Cânion Fluvial
            if (distDiag <= 3.5) {
                if (isRiverCanyon) {
                    return {
                        groundBase: LOCAL_TILES.WATER,
                        upperBase: 0,
                        l2: (sy === 16 && sx >= 14 && sx <= 18) ? LOCAL_TILES.BRIDGE_H : 0,
                        isStructure: true
                    };
                }
                const hasRelicSword = ((sx * 7 + sy * 13 + ox + oy) % 19 === 0);
                return {
                    groundBase: LOCAL_TILES.STONE_FLOOR,
                    upperBase: 0,
                    l2: hasRelicSword ? LOCAL_TILES.SWORD_MONUMENT : 0,
                    isStructure: true
                };
            }

            // Paredões rasgados do desfiladeiro (com passagens para caminhada)
            if (distDiag > 3.5 && distDiag <= 6.2 && sy !== 15 && sy !== 16 && sx !== 15 && sx !== 16) {
                return {
                    groundBase: LOCAL_TILES.STONE_FLOOR,
                    upperBase: LOCAL_TILES.CLIFF_ROCK,
                    l2: 0,
                    isStructure: true
                };
            }

            return null;
        }

        // Template 1:1 de Cratera da Palma Celestial (5 Vales Radiais + Gravidade 3x / Lago Sagrado)
        static _stampPalmCrater1to1(sx, sy, isSacredLake, ox, oy) {
            const dx = sx - 15.5;
            const dy = sy - 15.5;
            const dist = Math.hypot(dx, dy);

            if (dist <= 9.5) {
                if (isSacredLake && dist <= 6.5) {
                    return {
                        groundBase: LOCAL_TILES.WATER,
                        upperBase: 0,
                        l2: (Math.abs(dx) < 1.2 && Math.abs(dy) < 1.2) ? LOCAL_TILES.PORTAL_ALTAR : 0,
                        isStructure: true
                    };
                }
                const hasGravityStone = ((sx * 11 + sy * 5 + ox) % 23 === 0);
                return {
                    groundBase: LOCAL_TILES.COBBLE_PLAZA,
                    upperBase: 0,
                    l2: hasGravityStone ? LOCAL_TILES.RUNE_MONOLITH : 0,
                    isStructure: true
                };
            }

            // Anel rochoso da borda da palma (com aberturas nos 4 pontos cardeais)
            if (dist > 9.5 && dist <= 11.8 && Math.abs(dx) > 2.2 && Math.abs(dy) > 2.2) {
                return {
                    groundBase: LOCAL_TILES.MESA_FLOOR,
                    upperBase: LOCAL_TILES.CLIFF_ROCK,
                    l2: 0,
                    isStructure: true
                };
            }

            return null;
        }
    }

    // =========================================================================
    // 2. GERADOR E STREAMER CONTÍNUO DE CHUNKS 1:1 (`LocalMapGenerator`)
    // =========================================================================
    class LocalMapGenerator {
        constructor() {
            this._loadedLocalChunks = new Set();
        }

        /**
         * Transfere o jogador do Overworld (ox, oy) para a Escala Local 1:1 (lx, ly).
         */
        enterLocalScale(ox, oy, entryType = "manual_explore") {
            const mgr = globalThis.OverworldChunkManager;
            if (!mgr) return;

            const wOx = ((Math.floor(ox) % 8192) + 8192) % 8192;
            const cOy = Math.max(0, Math.min(4095, Math.floor(oy)));

            // Se entrou automaticamente por POI, posiciona no portão sul (sy=28); se manual, no centro (sy=16)
            const targetLx = wOx * 32 + 16;
            const targetLy = cOy * 32 + (entryType === "poi_auto" ? 28 : 16);

            mgr.setScaleMode("local");
            mgr.setLocalPosition(targetLx, targetLy);
            this._loadedLocalChunks.clear();

            if (typeof $dataMap !== "undefined" && $dataMap) {
                mgr.ensureToroidalContainerMap();
                this.streamLocalChunksAround(targetLx, targetLy);
            }

            if (typeof $gamePlayer !== "undefined" && $gamePlayer) {
                const wrapped = mgr.getWrappedCoordinates(targetLx, targetLy, VIEWPORT_SIZE, VIEWPORT_SIZE);
                $gamePlayer.locate(wrapped.x, wrapped.y);
                mgr._playerPosLastFrame = { x: $gamePlayer.x, y: $gamePlayer.y };
            }

            if (typeof $gameSystem !== "undefined" && $gameSystem && $gameSystem.cultivation && entryType === "manual_explore") {
                const lData = globalThis.WorldClimateEngine.getLocalDataAt(targetLx, targetLy);
                $gameSystem.cultivation().addToast(
                    `🔍 Escala Local 1:1 [${lData.biomeName}] — Posição (${targetLx}, ${targetLy}) | Pressione [${EXPLORE_KEY_LABEL()}] para voltar ao Mapa-Múndi.`,
                    "#81ecec"
                );
            }
        }

        /**
         * Sobe da Escala Local 1:1 de volta ao Overworld sincronizando a coordenada exata caminhanda (`Ox = floor(Lx/32)`).
         */
        returnToOverworld() {
            const mgr = globalThis.OverworldChunkManager;
            if (!mgr) return;

            const localCoords = mgr.getLocalCoordinates();
            const syncedOx = Math.floor(localCoords.x / 32) % 8192;
            const syncedOy = Math.max(0, Math.min(4095, Math.floor(localCoords.y / 32)));

            mgr.setScaleMode("overworld");
            mgr.setOverworldPosition(syncedOx, syncedOy);
            this._loadedLocalChunks.clear();

            if (typeof $dataMap !== "undefined" && $dataMap) {
                mgr.ensureToroidalContainerMap();
                mgr.streamVisibleChunksAroundPlayer();
            }

            if (typeof $gamePlayer !== "undefined" && $gamePlayer) {
                const wrapped = mgr.getWrappedCoordinates(syncedOx, syncedOy, VIEWPORT_SIZE, VIEWPORT_SIZE);
                $gamePlayer.locate(wrapped.x, wrapped.y);
                mgr._playerPosLastFrame = { x: $gamePlayer.x, y: $gamePlayer.y };
            }

            if (typeof $gameSystem !== "undefined" && $gameSystem && $gameSystem.cultivation) {
                $gameSystem.cultivation().addToast(
                    `🗺️ Mapa-Múndi Planetário — Coordenada Sincronizada (${syncedOx}, ${syncedOy}).`,
                    "#ffd700"
                );
            }
        }

        /**
         * Gera os 16x16 tiles na Escala Local 1:1 para o chunk (chunkLx, chunkLy)
         */
        generateLocalChunkData(chunkLx, chunkLy) {
            const engine = globalThis.WorldClimateEngine;
            engine.ensureInitialized();
            const catalog = engine.getBiomeCatalog();
            const resolver = globalThis.AutotileBitmaskResolver;
            const mgr = globalThis.OverworldChunkManager;

            const padW = CHUNK_SIZE + 2;
            const padH = CHUNK_SIZE + 2;
            const grid = Array(padH);

            const startLx = chunkLx * CHUNK_SIZE;
            const startLy = chunkLy * CHUNK_SIZE;

            for (let py = 0; py < padH; py++) {
                grid[py] = Array(padW);
                const ly = engine.clampLocalY(startLy + py - 1);
                for (let px = 0; px < padW; px++) {
                    const lx = engine.wrapLocalX(startLx + px - 1);
                    const lData = engine.getLocalDataAt(lx, ly);
                    if (lData.poiType === 0 && mgr && typeof mgr.getSpontaneousRiftAt === "function") {
                        const rift = mgr.getSpontaneousRiftAt(lData.ox, lData.oy);
                        if (rift) {
                            lData.poiType = 7;
                            lData.poiData = rift;
                        }
                    }
                    const bMeta = catalog[lData.biomeId] || catalog[4];

                    const stamp = LocalPOITemplateStamp.evaluateStamp(lData);

                    let groundBase = bMeta.localGroundTile;
                    let upperBase = 0;
                    let l2 = 0;

                    if (stamp) {
                        groundBase = stamp.groundBase;
                        upperBase = stamp.upperBase || 0;
                        l2 = stamp.l2 || 0;
                    } else {
                        // Terreno natural 1:1 com rios contínuos, pontes, matas ciliares e vegetação
                        if (lData.waterBodyType === 1) {
                            groundBase = LOCAL_TILES.DEEP_WATER;
                        } else if (lData.waterBodyType >= 2 && lData.waterBodyType <= 7) {
                            groundBase = lData.biomeId === 2 ? LOCAL_TILES.ICY_WATER
                                : (lData.biomeId === 7 ? LOCAL_TILES.POISON_WATER : LOCAL_TILES.WATER);
                        } else if (lData.isRoad) {
                            groundBase = LOCAL_TILES.ROAD;
                        } else if (lData.distToRiverCenter <= 7.0 && groundBase === LOCAL_TILES.SAND) {
                            // Mata Ciliar / Oásis verde às margens de rios que cortam desertos!
                            groundBase = LOCAL_TILES.GRASS;
                        }

                        if (lData.isBridge) {
                            l2 = LOCAL_TILES.BRIDGE_H;
                        } else if (lData.waterBodyType === 0 && !lData.isRoad) {
                            // Decoração determinística 1:1 (árvores, bambus, cristais, rochas)
                            const hash = ((lx * 374761393) ^ (ly * 668265263) ^ engine.getSeed()) >>> 0;
                            if (bMeta.localDecoTiles && bMeta.localDecoTiles.length > 0 && (hash % 17 === 0)) {
                                l2 = bMeta.localDecoTiles[hash % bMeta.localDecoTiles.length];
                            }
                        }
                    }

                    grid[py][px] = {
                        lx,
                        ly,
                        lData,
                        groundBase,
                        upperBase,
                        l2
                    };
                }
            }

            const outTiles = [];
            for (let sy = 0; sy < CHUNK_SIZE; sy++) {
                const py = sy + 1;
                for (let sx = 0; sx < CHUNK_SIZE; sx++) {
                    const px = sx + 1;
                    const center = grid[py][px];
                    const gBase = center.groundBase;

                    const sameGround = (ny, nx) => {
                        const nb = grid[ny][nx].groundBase;
                        if (gBase === LOCAL_TILES.WATER) return nb === LOCAL_TILES.WATER || nb === LOCAL_TILES.DEEP_WATER;
                        return nb === gBase;
                    };

                    const l0 = resolver ? resolver.makeAutotileId(
                        gBase,
                        sameGround(py - 1, px),
                        sameGround(py + 1, px),
                        sameGround(py, px - 1),
                        sameGround(py, px + 1),
                        sameGround(py - 1, px - 1),
                        sameGround(py - 1, px + 1),
                        sameGround(py + 1, px - 1),
                        sameGround(py + 1, px + 1)
                    ) : gBase;

                    let l1 = 0;
                    const uBase = center.upperBase;
                    if (uBase > 0) {
                        const sameUpper = (ny, nx) => grid[ny][nx].upperBase === uBase;
                        l1 = resolver ? resolver.makeAutotileId(
                            uBase,
                            sameUpper(py - 1, px),
                            sameUpper(py + 1, px),
                            sameUpper(py, px - 1),
                            sameUpper(py, px + 1),
                            sameUpper(py - 1, px - 1),
                            sameUpper(py - 1, px + 1),
                            sameUpper(py + 1, px - 1),
                            sameUpper(py + 1, px + 1)
                        ) : uBase;
                    }

                    let l2 = center.l2;
                    let l3 = 0;

                    if (mgr) {
                        const d0 = mgr.getTileDelta("local", center.lx, center.ly, 0);
                        const d1 = mgr.getTileDelta("local", center.lx, center.ly, 1);
                        const d2 = mgr.getTileDelta("local", center.lx, center.ly, 2);
                        const d3 = mgr.getTileDelta("local", center.lx, center.ly, 3);
                        if (d0 !== undefined) outTiles.push({ lx: center.lx, ly: center.ly, l0: d0, l1: d1 ?? l1, l2: d2 ?? l2, l3: d3 ?? l3 });
                        else outTiles.push({ lx: center.lx, ly: center.ly, l0, l1: d1 ?? l1, l2: d2 ?? l2, l3: d3 ?? l3 });
                    } else {
                        outTiles.push({ lx: center.lx, ly: center.ly, l0, l1, l2, l3 });
                    }
                }
            }
            return outTiles;
        }

        streamLocalChunksAround(centerLx, centerLy) {
            if (typeof $dataMap === "undefined" || !$dataMap || !$dataMap.data) return;

            const centerCx = Math.floor(centerLx / CHUNK_SIZE);
            const centerCy = Math.floor(centerLy / CHUNK_SIZE);
            const radius = 3;
            const totalChunksX = LOCAL_W / CHUNK_SIZE;
            const totalChunksY = LOCAL_H / CHUNK_SIZE;

            const activeKeys = new Set();
            let modified = false;

            for (let dy = -radius; dy <= radius; dy++) {
                const cy = centerCy + dy;
                if (cy < 0 || cy >= totalChunksY) continue;
                for (let dx = -radius; dx <= radius; dx++) {
                    const cx = ((centerCx + dx) % totalChunksX + totalChunksX) % totalChunksX;
                    const key = `loc:${cx},${cy}`;
                    activeKeys.add(key);

                    if (!this._loadedLocalChunks.has(key)) {
                        this._loadedLocalChunks.add(key);
                        this._projectLocalChunkToDataMap(cx, cy);
                        modified = true;
                    }
                }
            }

            for (const oldKey of this._loadedLocalChunks) {
                if (!activeKeys.has(oldKey)) {
                    this._loadedLocalChunks.delete(oldKey);
                }
            }

            if (modified && typeof $gameMap !== "undefined" && $gameMap) {
                $gameMap.requestRefresh();
                if (typeof SceneManager !== "undefined" && SceneManager._scene && SceneManager._scene._spriteset && SceneManager._scene._spriteset._tilemap) {
                    const tm = SceneManager._scene._spriteset._tilemap;
                    if (tm._mapData !== $dataMap.data || tm._mapWidth !== $dataMap.width) {
                        tm.setData($dataMap.width, $dataMap.height, $dataMap.data);
                    }
                    if (typeof tm.refresh === "function") tm.refresh();
                }
            }
        }

        _projectLocalChunkToDataMap(chunkLx, chunkLy) {
            const tiles = this.generateLocalChunkData(chunkLx, chunkLy);
            const w = $dataMap.width;
            const h = $dataMap.height;
            const area = w * h;

            for (let i = 0; i < tiles.length; i++) {
                const t = tiles[i];
                const wx = ((t.lx % w) + w) % w;
                const wy = ((t.ly % h) + h) % h;
                const baseIdx = wy * w + wx;

                $dataMap.data[baseIdx] = t.l0;
                $dataMap.data[area + baseIdx] = t.l1;
                $dataMap.data[area * 2 + baseIdx] = t.l2;
                $dataMap.data[area * 3 + baseIdx] = t.l3;
            }
        }
    }

    function EXPLORE_KEY_LABEL() {
        return "E";
    }

    const localGenInstance = new LocalMapGenerator();
    globalThis.LocalMapGenerator = localGenInstance;
    globalThis.LocalPOITemplateStamp = LocalPOITemplateStamp;

    if (typeof window !== "undefined") {
        window.LocalMapGenerator = localGenInstance;
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = {
            LocalMapGenerator: localGenInstance,
            LocalMapGeneratorClass: LocalMapGenerator,
            LocalPOITemplateStamp,
            LOCAL_TILES
        };
    }
})();
