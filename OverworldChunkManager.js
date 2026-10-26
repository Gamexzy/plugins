//=============================================================================
// RPG Maker MZ - OverworldChunkManager.js [v3.0.0]
// Streaming Toroidal Overworld (8192x4096), Autotiles 48-Shapes, Travessia por Qi,
// Reinos Secretos em 3 Camadas e Persistência Leve Delta-Save.
//=============================================================================

/*:
 * @target MZ
 * @plugindesc [v3.0.0] Gerenciador Toroidal do Mapa-Múndi (8192x4096), Autotiling 48-Shapes, Travessia por Cultivo/Qi, Reinos Secretos e Delta-Save.
 * @author Gabriel & Antigravity
 * @version 3.0.0
 * @license MIT
 * @help
 * ============================================================================
 * OverworldChunkManager.js — Streaming Planetário & Travessia Espiritual
 * ============================================================================
 * 1. Streaming Toroidal Contínuo:
 *    - Projeta o Mapa-Múndi de 8.192 x 4.096 tiles em um buffer físico toroidal
 *      de 128 x 128 tiles (`scrollType: 3`) em tempo real (< 1ms por chunk).
 *    - Mantém compatibilidade 100% transparente com `globalThis.BasicChunkGenerator`.
 *
 * 2. Autotile Bitmask 48-Shapes Embutido:
 *    - Calcula vizinhança de 8 direções para costas, rios, florestas, montanhas
 *      e desertos sem quadrados secos.
 *
 * 3. Passabilidade Hídrica Integrada ao Cultivo (`CultivationCore.js`):
 *    - Riacho Raso (`waterBodyType == 3`): Caminhável a pé por todos.
 *    - Rio Largo / Lago (`waterBodyType == 4, 6, 7`): Mortais precisam de Ponte;
 *      Estabelecimento de Fundação+ caminha sobre as águas (*Qinggong*, -0.8 Qi/passo);
 *      Formação de Núcleo+ sobrevoa livremente.
 *    - Oceano Aberto (`waterBodyType == 1, 2`): Mortais/Fundação precisam embarcar em
 *      Navio num Porto; Formação de Núcleo+ cruza os mares em Voo de Espada.
 *
 * 4. Persistência Leve (`Seed + Macro-Grid + Delta-Save` < 60 KB):
 *    - Salva apenas a `worldSeed`, posição em ambas as escalas, bitfield Base64
 *      de macro-células descobertas (16 KB), estado dos Reinos Secretos e deltas.
 *
 * @param chunkSize
 * @text Tamanho do Chunk (Tiles)
 * @type number
 * @default 16
 *
 * @param viewportSize
 * @text Tamanho do Buffer Toroidal
 * @type number
 * @default 128
 *
 * @param exploreScaleKey
 * @text Tecla de Escala (Overworld <-> 1:1)
 * @type string
 * @default E
 *
 * @param debugMode
 * @text Modo de Depuração
 * @type boolean
 * @default false
 */

(() => {
    "use strict";

    const pluginName = "OverworldChunkManager";
    const parameters = (typeof PluginManager !== "undefined" && PluginManager.parameters)
        ? PluginManager.parameters(pluginName)
        : {};

    const CHUNK_SIZE = Number(parameters["chunkSize"] || 16);
    const VIEWPORT_SIZE = Number(parameters["viewportSize"] || 128);
    const EXPLORE_KEY = String(parameters["exploreScaleKey"] || "E").toUpperCase();
    const debugMode = String(parameters["debugMode"] || "false") === "true";

    const OVERWORLD_W = 8192;
    const OVERWORLD_H = 4096;
    const LOCAL_W = 262144;
    const LOCAL_H = 131072;
    const MACRO_W = 512;
    const MACRO_H = 256;
    const MACRO_CELLS = MACRO_W * MACRO_H; // 131072

    // Registra tecla 'E' para alternar entre Overworld e Escala Local 1:1
    if (typeof Input !== "undefined" && Input.keyMapper) {
        const keyMap = { E: 69, Q: 81, R: 82, T: 84 };
        Input.keyMapper[keyMap[EXPLORE_KEY] || 69] = "toggleScaleExplore";
        // Mapeamento de Movimento Universal WASD
        Input.keyMapper[87] = "up";    // W
        Input.keyMapper[65] = "left";  // A
        Input.keyMapper[83] = "down";  // S
        Input.keyMapper[68] = "right"; // D
    }

    // =========================================================================
    // 1. RESOLVEDOR CANÔNICO DE AUTOTILES 48-SHAPES & 16-SHAPES (RPG MAKER MZ)
    // =========================================================================
    const AutotileBitmaskResolver = {
        getFloorShape(u, d, l, r, ul, ur, dl, dr) {
            if (!l && !r && !u && !d) return 46;
            if (l && r && u && d) {
                let code = 0;
                if (!ul) code |= 1;
                if (!ur) code |= 2;
                if (!dl) code |= 4;
                if (!dr) code |= 8;
                const cornerMap = [0, 1, 2, 3, 8, 9, 10, 11, 4, 5, 6, 7, 12, 13, 14, 15];
                return cornerMap[code];
            }
            if (!l && r && u && d) {
                const code = (ur ? 0 : 1) | (dr ? 0 : 2);
                return [16, 17, 18, 19][code];
            }
            if (l && !r && u && d) {
                const code = (ul ? 0 : 1) | (dl ? 0 : 2);
                return [24, 26, 25, 27][code];
            }
            if (l && r && !u && d) {
                const code = (dl ? 0 : 1) | (dr ? 0 : 2);
                return [20, 22, 21, 23][code];
            }
            if (l && r && u && !d) {
                const code = (ul ? 0 : 1) | (ur ? 0 : 2);
                return [28, 29, 30, 31][code];
            }
            if (!l && !r && u && d) return 32;
            if (l && r && !u && !d) return 33;
            if (!l && r && !u && d) return dr ? 34 : 35;
            if (l && !r && !u && d) return dl ? 36 : 37;
            if (!l && r && u && !d) return ur ? 40 : 41;
            if (l && !r && u && !d) return ul ? 38 : 39;
            if (!l && !r && !u && d) return 42;
            if (!l && r && !u && !d) return 43;
            if (!l && !r && u && !d) return 44;
            if (l && !r && !u && !d) return 45;
            return 0;
        },

        getWallShape(u, d, l, r) {
            let shape = 0;
            if (!l) shape |= 1;
            if (!u) shape |= 2;
            if (!r) shape |= 4;
            if (!d) shape |= 8;
            return shape;
        },

        getWaterfallShape(l, r) {
            return (!l ? 1 : 0) | (!r ? 2 : 0);
        },

        isWallAutotile(tileId) {
            if (typeof Tilemap !== "undefined" && typeof Tilemap.isWallTypeAutotile === "function") {
                return Tilemap.isWallTypeAutotile(tileId);
            }
            if (tileId >= 4352 && tileId < 5888) return true;
            if (tileId >= 5888 && tileId < 8192) {
                const kind = Math.floor((tileId - 2048) / 48);
                return (kind % 16) >= 8;
            }
            return false;
        },

        isWaterfallAutotile(tileId) {
            if (typeof Tilemap !== "undefined" && typeof Tilemap.isWaterfallTypeAutotile === "function") {
                return Tilemap.isWaterfallTypeAutotile(tileId);
            }
            if (tileId >= 2048 && tileId < 2816) {
                const kind = Math.floor((tileId - 2048) / 48);
                return (kind >= 4 && (kind % 2 === 1));
            }
            return false;
        },

        makeAutotileId(baseTileId, u, d, l, r, ul, ur, dl, dr) {
            if (!baseTileId || baseTileId < 2048) return baseTileId || 0;
            const kindBase = Math.floor((baseTileId - 2048) / 48) * 48 + 2048;
            let shape = 0;
            if (this.isWallAutotile(baseTileId)) {
                shape = this.getWallShape(u, d, l, r);
            } else if (this.isWaterfallAutotile(baseTileId)) {
                shape = this.getWaterfallShape(l, r);
            } else {
                shape = this.getFloorShape(u, d, l, r, ul, ur, dl, dr);
            }
            return kindBase + shape;
        }
    };

    // Tiles de Ícones de POIs e Estruturas no Overworld (World_B)
    const OVERWORLD_B_TILES = {
        BRIDGE: 25,          // Ponte caminhável
        PORT_DOCK: 24,       // Porto Marítimo
        MORTAL_CITY: 8,      // Cidade / Cidadela (Castelo no World_B)
        ORTHODOX_SECT: 36,   // Torre / Templo Imortal nas Montanhas
        DEMONIC_SECT: 38,    // Fortaleza / Altar Sombrio
        DONGTIAN_OPEN: 44,   // Reino Secreto Cíclico Aberto (Santuário Iluminado)
        DONGTIAN_CLOSED: 45, // Reino Cíclico Fechado
        SEALED_TOMB: 16,     // Tumba Selada / Caverna Espiritual (Caverna de pedra no World_B)
        SPATIAL_RIFT: 47     // Fenda Espacial / Vórtice
    };

    // =========================================================================
    // 2. BITFIELD DE NÉVOA DE GUERRA COMPACTO (131.072 bits = 16 KB em Base64)
    // =========================================================================
    class DiscoveredMacroBitfield {
        constructor() {
            this.bytes = new Uint8Array(MACRO_CELLS >> 3); // 16.384 bytes
        }

        clear() {
            this.bytes.fill(0);
        }

        markDiscovered(mx, my) {
            const wMx = ((mx % MACRO_W) + MACRO_W) % MACRO_W;
            const cMy = Math.max(0, Math.min(MACRO_H - 1, my));
            const bitIdx = cMy * MACRO_W + wMx;
            const byteIdx = bitIdx >> 3;
            const mask = 1 << (bitIdx & 7);
            const wasSet = (this.bytes[byteIdx] & mask) !== 0;
            this.bytes[byteIdx] |= mask;
            return !wasSet;
        }

        isDiscovered(mx, my) {
            const wMx = ((mx % MACRO_W) + MACRO_W) % MACRO_W;
            const cMy = Math.max(0, Math.min(MACRO_H - 1, my));
            const bitIdx = cMy * MACRO_W + wMx;
            return (this.bytes[bitIdx >> 3] & (1 << (bitIdx & 7))) !== 0;
        }

        toBase64() {
            if (typeof Buffer !== "undefined") {
                return Buffer.from(this.bytes).toString("base64");
            }
            let binary = "";
            for (let i = 0; i < this.bytes.length; i++) {
                binary += String.fromCharCode(this.bytes[i]);
            }
            return typeof btoa === "function" ? btoa(binary) : binary;
        }

        fromBase64(b64) {
            this.clear();
            if (!b64 || typeof b64 !== "string") return;
            try {
                if (typeof Buffer !== "undefined") {
                    const buf = Buffer.from(b64, "base64");
                    const len = Math.min(this.bytes.length, buf.length);
                    for (let i = 0; i < len; i++) this.bytes[i] = buf[i];
                    return;
                }
                if (typeof atob === "function") {
                    const bin = atob(b64);
                    const len = Math.min(this.bytes.length, bin.length);
                    for (let i = 0; i < len; i++) this.bytes[i] = bin.charCodeAt(i);
                }
            } catch (e) {
                console.warn("[OverworldChunkManager] Falha ao decodificar bitfield Base64:", e);
            }
        }
    }

    // =========================================================================
    // 3. CLASSE PRINCIPAL: OverworldChunkManager
    // =========================================================================
    class OverworldChunkManager {
        constructor() {
            this._worldSeed = 948271635;
            this._scaleMode = "overworld"; // "overworld" | "local"
            this._overworldPos = { x: 4096, y: 2048 };
            this._localPos = { x: 4096 * 32 + 16, y: 2048 * 32 + 16 };
            this._playerPosLastFrame = { x: -1, y: -1 };
            this._currentChunk = { x: -9999, y: -9999 };
            this._loadedChunks = new Set();

            this._discoveredCells = new DiscoveredMacroBitfield();
            this._secretRealmsState = {
                sealedTombsUnlocked: [],
                activeSpontaneousRifts: [],
                depletedNodes: {},
                lastNotifiedMoonPhase: -1
            };
            this._tileDeltas = {
                overworld: {},
                local: {}
            };

            this._isSailingShip = false;
            this._transferLockFrames = 0;
        }

        initNewWorld(seed = 0) {
            this._worldSeed = seed && seed !== 0 ? (Number(seed) >>> 0) : 948271635;
            if (globalThis.WorldClimateEngine) {
                globalThis.WorldClimateEngine.initWorld(this._worldSeed);
            }
            this._discoveredCells.clear();
            this._secretRealmsState = {
                sealedTombsUnlocked: [],
                activeSpontaneousRifts: [],
                depletedNodes: {},
                lastNotifiedMoonPhase: -1
            };
            this._tileDeltas = { overworld: {}, local: {} };
            this._scaleMode = "overworld";

            // Escolhe a primeira Cidade Mortal como ponto inicial seguro para o jogador
            const spawn = this._findIdealStartingPoint();
            this.setOverworldPosition(spawn.ox, spawn.oy);
            this._loadedChunks.clear();
        }

        _findIdealStartingPoint() {
            if (globalThis.WorldClimateEngine && globalThis.WorldClimateEngine.macroGrid) {
                const pois = globalThis.WorldClimateEngine.macroGrid.pois;
                const startCity = pois.find(p => p.type === 1) || pois[0];
                if (startCity) {
                    // Posiciona 1 tile ao sul da cidade para não disparar entrada automática no frame 0
                    return { ox: startCity.ox, oy: Math.min(OVERWORLD_H - 2, startCity.oy + 1) };
                }
            }
            return { ox: 4096, oy: 2048 };
        }

        getScaleMode() {
            return this._scaleMode;
        }

        setScaleMode(mode) {
            this._scaleMode = mode === "local" ? "local" : "overworld";
            this._loadedChunks.clear();
        }

        setOverworldPosition(ox, oy) {
            const wOx = ((Math.floor(ox) % OVERWORLD_W) + OVERWORLD_W) % OVERWORLD_W;
            const cOy = Math.max(0, Math.min(OVERWORLD_H - 1, Math.floor(oy)));
            this._overworldPos.x = wOx;
            this._overworldPos.y = cOy;
            this._localPos.x = wOx * 32 + 16;
            this._localPos.y = cOy * 32 + 16;
            globalThis._realPlayerX = wOx;
            globalThis._realPlayerY = cOy;
            this._revealAroundOverworld(wOx, cOy, 2);
        }

        setLocalPosition(lx, ly) {
            const wLx = ((Math.floor(lx) % LOCAL_W) + LOCAL_W) % LOCAL_W;
            const cLy = Math.max(0, Math.min(LOCAL_H - 1, Math.floor(ly)));
            this._localPos.x = wLx;
            this._localPos.y = cLy;
            this._overworldPos.x = Math.floor(wLx / 32) % OVERWORLD_W;
            this._overworldPos.y = Math.max(0, Math.min(OVERWORLD_H - 1, Math.floor(cLy / 32)));
            globalThis._realPlayerX = this._scaleMode === "local" ? wLx : this._overworldPos.x;
            globalThis._realPlayerY = this._scaleMode === "local" ? cLy : this._overworldPos.y;
            this._revealAroundOverworld(this._overworldPos.x, this._overworldPos.y, 1);
        }

        _revealAroundOverworld(ox, oy, macroRadius = 2) {
            const mx = Math.floor(ox / 16);
            const my = Math.floor(oy / 16);
            for (let dy = -macroRadius; dy <= macroRadius; dy++) {
                for (let dx = -macroRadius; dx <= macroRadius; dx++) {
                    this._discoveredCells.markDiscovered(mx + dx, my + dy);
                }
            }
        }

        getRealPlayerCoordinates() {
            if (this._scaleMode === "local") {
                return { x: this._localPos.x, y: this._localPos.y };
            }
            return { x: this._overworldPos.x, y: this._overworldPos.y };
        }

        getOverworldCoordinates() {
            return { x: this._overworldPos.x, y: this._overworldPos.y };
        }

        getLocalCoordinates() {
            return { x: this._localPos.x, y: this._localPos.y };
        }

        getWrappedCoordinates(realX, realY, mapWidth = VIEWPORT_SIZE, mapHeight = VIEWPORT_SIZE) {
            const w = (typeof $dataMap !== "undefined" && $dataMap && $dataMap.width > 0) ? $dataMap.width : mapWidth;
            const h = (typeof $dataMap !== "undefined" && $dataMap && $dataMap.height > 0) ? $dataMap.height : mapHeight;
            return {
                x: ((Math.floor(realX) % w) + w) % w,
                y: ((Math.floor(realY) % h) + h) % h
            };
        }

        // ---------------------------------------------------------------------
        // DELTA-SAVE: Registro e Aplicação de Alterações Esparsas de Tiles
        // ---------------------------------------------------------------------
        recordTileDelta(scaleMode, x, y, layer, newTileId) {
            const bucket = scaleMode === "local" ? this._tileDeltas.local : this._tileDeltas.overworld;
            const key = `${x},${y},${layer}`;
            bucket[key] = newTileId;
        }

        getTileDelta(scaleMode, x, y, layer) {
            const bucket = scaleMode === "local" ? this._tileDeltas.local : this._tileDeltas.overworld;
            const key = `${x},${y},${layer}`;
            return Object.prototype.hasOwnProperty.call(bucket, key) ? bucket[key] : undefined;
        }

        makeSavePayload() {
            return {
                worldSeed: this._worldSeed,
                scaleMode: this._scaleMode,
                overworldPos: { x: this._overworldPos.x, y: this._overworldPos.y },
                localPos: { x: this._localPos.x, y: this._localPos.y },
                discoveredMacroCells: this._discoveredCells.toBase64(),
                secretRealmsState: JSON.parse(JSON.stringify(this._secretRealmsState)),
                tileDeltas: {
                    overworld: Object.assign({}, this._tileDeltas.overworld),
                    local: Object.assign({}, this._tileDeltas.local)
                },
                isSailingShip: this._isSailingShip
            };
        }

        extractSavePayload(payload) {
            if (!payload || typeof payload !== "object") {
                this.initNewWorld(this._worldSeed);
                return;
            }
            this._worldSeed = Number(payload.worldSeed) || 948271635;
            if (globalThis.WorldClimateEngine) {
                globalThis.WorldClimateEngine.initWorld(this._worldSeed);
            }
            this._scaleMode = payload.scaleMode === "local" ? "local" : "overworld";
            if (payload.overworldPos) {
                this._overworldPos = { x: Number(payload.overworldPos.x) || 4096, y: Number(payload.overworldPos.y) || 2048 };
            }
            if (payload.localPos) {
                this._localPos = { x: Number(payload.localPos.x) || 131088, y: Number(payload.localPos.y) || 65552 };
            }
            this._discoveredCells.fromBase64(payload.discoveredMacroCells || "");
            if (payload.secretRealmsState) {
                this._secretRealmsState = Object.assign({
                    sealedTombsUnlocked: [],
                    activeSpontaneousRifts: [],
                    depletedNodes: {},
                    lastNotifiedMoonPhase: -1
                }, payload.secretRealmsState);
            }
            this._tileDeltas = {
                overworld: Object.assign({}, payload.tileDeltas?.overworld || {}),
                local: Object.assign({}, payload.tileDeltas?.local || {})
            };
            this._isSailingShip = Boolean(payload.isSailingShip);
            this._loadedChunks.clear();
        }

        // ---------------------------------------------------------------------
        // GERAÇÃO DE CHUNK OVERWORLD (16x16) COM AUTOTILE 48-SHAPES
        // ---------------------------------------------------------------------
        generateOverworldChunkData(chunkX, chunkY) {
            const engine = globalThis.WorldClimateEngine;
            engine.ensureInitialized();
            const catalog = engine.getBiomeCatalog();

            // Amostra 18x18 (com borda de 1 tile) para resolver autotiles de 8 vizinhos sem costura
            const padW = CHUNK_SIZE + 2;
            const padH = CHUNK_SIZE + 2;
            const grid = Array(padH);
            const startOx = chunkX * CHUNK_SIZE;
            const startOy = chunkY * CHUNK_SIZE;

            for (let py = 0; py < padH; py++) {
                grid[py] = Array(padW);
                const oy = engine.clampOverworldY(startOy + py - 1);
                for (let px = 0; px < padW; px++) {
                    const ox = engine.wrapOverworldX(startOx + px - 1);
                    const cell = engine.getOverworldDataAt(ox, oy);
                    const bMeta = catalog[cell.biomeId] || catalog[4];

                    let groundKindBase = bMeta.overworldGroundTile;
                    let upperKindBase = bMeta.overworldUpperTile;

                    // Rios, Cânions Fluviais e Lagos no Overworld usam água A1 (2048)
                    if (cell.waterBodyType >= 3 && cell.waterBodyType <= 7) {
                        groundKindBase = 2048;
                        if (cell.scarType !== 1) upperKindBase = 0;
                    } else if (cell.isRoad && groundKindBase >= 2816) {
                        groundKindBase = 2912; // Estrada no Overworld
                        upperKindBase = 0;
                    }

                    grid[py][px] = {
                        cell,
                        groundKindBase,
                        upperKindBase
                    };
                }
            }

            const resultTiles = [];
            for (let ly = 0; ly < CHUNK_SIZE; ly++) {
                const py = ly + 1;
                const oy = engine.clampOverworldY(startOy + ly);
                for (let lx = 0; lx < CHUNK_SIZE; lx++) {
                    const px = lx + 1;
                    const ox = engine.wrapOverworldX(startOx + lx);
                    const center = grid[py][px];
                    const cell = center.cell;

                    // Camada 0: Chão / Água com Autotile 48-Shapes
                    const gBase = center.groundKindBase;
                    const sameGround = (ny, nx) => {
                        const nb = grid[ny][nx].groundKindBase;
                        if (gBase === 2096) return nb === 2096;
                        if (gBase === 2048) return nb === 2048 || nb === 2096;
                        return nb === gBase;
                    };

                    let l0 = AutotileBitmaskResolver.makeAutotileId(
                        gBase,
                        sameGround(py - 1, px),
                        sameGround(py + 1, px),
                        sameGround(py, px - 1),
                        sameGround(py, px + 1),
                        sameGround(py - 1, px - 1),
                        sameGround(py - 1, px + 1),
                        sameGround(py + 1, px - 1),
                        sameGround(py + 1, px + 1)
                    );

                    // Camada 1: Floresta / Colina / Montanha / Duna com Autotile 48-Shapes
                    let l1 = 0;
                    const uBase = center.upperKindBase;
                    if (uBase > 0) {
                        const sameUpper = (ny, nx) => grid[ny][nx].upperKindBase === uBase;
                        l1 = AutotileBitmaskResolver.makeAutotileId(
                            uBase,
                            sameUpper(py - 1, px),
                            sameUpper(py + 1, px),
                            sameUpper(py, px - 1),
                            sameUpper(py, px + 1),
                            sameUpper(py - 1, px - 1),
                            sameUpper(py - 1, px + 1),
                            sameUpper(py + 1, px - 1),
                            sameUpper(py + 1, px + 1)
                        );
                    }

                    // Camada 2: Pontes e Ícones de POIs / Reinos Secretos / Fendas Espontâneas
                    let l2 = 0;
                    if (cell.isBridge) {
                        l2 = OVERWORLD_B_TILES.BRIDGE;
                    }
                    const riftAt = this.getSpontaneousRiftAt(ox, oy);
                    if (cell.poiType !== 0) {
                        l2 = this._getOverworldPoiTileId(cell.poiType, cell.poiData);
                    } else if (riftAt) {
                        l2 = OVERWORLD_B_TILES.SPATIAL_RIFT;
                    } else if ((cell.scarType === 1 || cell.scarType === 2) && (ox % 16 === 8) && (oy % 16 === 8)) {
                        // Marco de entrada na Ravina de Espada ou Cratera da Palma no centro da macro-célula
                        l2 = OVERWORLD_B_TILES.SEALED_TOMB;
                    }

                    // Camada 3: Aplica eventuais deltas salvos pelo jogador
                    const d0 = this.getTileDelta("overworld", ox, oy, 0);
                    const d1 = this.getTileDelta("overworld", ox, oy, 1);
                    const d2 = this.getTileDelta("overworld", ox, oy, 2);

                    resultTiles.push({
                        ox,
                        oy,
                        l0: d0 !== undefined ? d0 : l0,
                        l1: d1 !== undefined ? d1 : l1,
                        l2: d2 !== undefined ? d2 : l2,
                        l3: 0
                    });
                }
            }
            return resultTiles;
        }

        _getOverworldPoiTileId(poiType, poiData) {
            switch (poiType) {
                case 1: return OVERWORLD_B_TILES.MORTAL_CITY;
                case 2: return OVERWORLD_B_TILES.PORT_DOCK;
                case 3: return OVERWORLD_B_TILES.ORTHODOX_SECT;
                case 4: return OVERWORLD_B_TILES.DEMONIC_SECT;
                case 5: return this.isCyclicRealmOpen(poiData)
                    ? OVERWORLD_B_TILES.DONGTIAN_OPEN
                    : OVERWORLD_B_TILES.DONGTIAN_CLOSED;
                case 6: return OVERWORLD_B_TILES.SEALED_TOMB;
                case 7: return OVERWORLD_B_TILES.SPATIAL_RIFT;
                default: return 0;
            }
        }

        // ---------------------------------------------------------------------
        // SISTEMA DE REINOS SECRETOS EM 3 CAMADAS (Dongtian, Tumbas, Fendas)
        // ---------------------------------------------------------------------
        isCyclicRealmOpen(poiData) {
            let moonPhase = 4; // Se DayNightSystem não estiver ativo em teste, permite abertura padrão
            if (typeof $gameSystem !== "undefined" && $gameSystem && typeof $gameSystem.dayNightMoonPhase === "function") {
                moonPhase = $gameSystem.dayNightMoonPhase();
            }
            if (poiData && Array.isArray(poiData.openMoonPhases)) {
                return poiData.openMoonPhases.includes(moonPhase);
            }
            return moonPhase === 0 || moonPhase === 4;
        }

        isSealedTombUnlocked(tombId) {
            return this._secretRealmsState.sealedTombsUnlocked.includes(tombId);
        }

        unlockSealedTomb(tombId) {
            if (!this.isSealedTombUnlocked(tombId)) {
                this._secretRealmsState.sealedTombsUnlocked.push(tombId);
            }
        }

        getSpontaneousRiftAt(ox, oy) {
            const wOx = ((Math.floor(ox) % OVERWORLD_W) + OVERWORLD_W) % OVERWORLD_W;
            const cOy = Math.max(0, Math.min(OVERWORLD_H - 1, Math.floor(oy)));
            const rifts = this._secretRealmsState.activeSpontaneousRifts || [];
            for (let i = 0; i < rifts.length; i++) {
                const r = rifts[i];
                if (r.ox === wOx && r.oy === cOy) return r;
            }
            return null;
        }

        updateSpontaneousRifts(currentTotalHours) {
            if (!Array.isArray(this._secretRealmsState.activeSpontaneousRifts)) {
                this._secretRealmsState.activeSpontaneousRifts = [];
            }
            const rifts = this._secretRealmsState.activeSpontaneousRifts;
            let changed = false;

            // Remove fendas expiradas (duração de 6 a 12 horas de jogo)
            for (let i = rifts.length - 1; i >= 0; i--) {
                if (currentTotalHours >= rifts[i].expiresAtHour) {
                    rifts.splice(i, 1);
                    changed = true;
                }
            }

            // Mantém até 3 Fendas Espaciais Espontâneas ativas perto da região do jogador onde o Qi é instável
            if (rifts.length < 2) {
                const engine = globalThis.WorldClimateEngine;
                engine.ensureInitialized();
                const baseOx = this._overworldPos.x;
                const baseOy = this._overworldPos.y;
                const hourSeed = (Math.floor(currentTotalHours) * 2654435761 + this._worldSeed) >>> 0;

                for (let attempt = 0; attempt < 24 && rifts.length < 2; attempt++) {
                    const h = (hourSeed + attempt * 374761393) >>> 0;
                    const dx = ((h % 33) - 16);
                    const dy = (((h >>> 8) % 33) - 16);
                    if (Math.abs(dx) < 3 && Math.abs(dy) < 3) continue;

                    const candOx = engine.wrapOverworldX(baseOx + dx);
                    const candOy = engine.clampOverworldY(baseOy + dy);
                    const cell = engine.getOverworldDataAt(candOx, candOy);

                    // Surge onde a densidade de Qi é instável/intensa ou perto de cicatrizes e terras secas
                    if (cell.waterBodyType === 0 && cell.poiType === 0 && (cell.qiDensity >= 55 || cell.scarType !== 0 || attempt >= 18)) {
                        if (!this.getSpontaneousRiftAt(candOx, candOy)) {
                            const durationHours = 6 + (h % 7); // 6 a 12 horas
                            rifts.push({
                                id: 9000 + (h % 999),
                                type: 7,
                                typeName: "Fenda Espacial Espontânea",
                                name: `Fenda Efêmera do Vazio #${(h % 89) + 10}`,
                                ox: candOx,
                                oy: candOy,
                                spawnedAtHour: currentTotalHours,
                                expiresAtHour: currentTotalHours + durationHours,
                                durationHours
                            });
                            changed = true;
                        }
                    }
                }
            }

            if (changed) {
                this._loadedChunks.clear();
                this.streamVisibleChunksAroundPlayer();
            }
            return rifts;
        }

        getActiveWorldLightSources(timeTick = 0) {
            const lights = [];
            if (typeof $gameMap === "undefined" || !$gameMap) return lights;
            const engine = globalThis.WorldClimateEngine;
            if (!engine || !engine.macroGrid) return lights;

            const tileW = $gameMap.tileWidth ? $gameMap.tileWidth() : 48;
            const tileH = $gameMap.tileHeight ? $gameMap.tileHeight() : 48;
            const displayX = $gameMap.displayX ? $gameMap.displayX() : 0;
            const displayY = $gameMap.displayY ? $gameMap.displayY() : 0;
            const pulse = Math.sin(timeTick * 1.5) * 8;

            if (this._scaleMode === "overworld") {
                const centerOx = this._overworldPos.x;
                const centerOy = this._overworldPos.y;
                const pois = engine.macroGrid.pois || [];

                for (let i = 0; i < pois.length; i++) {
                    const p = pois[i];
                    if (p.type !== 5 && p.type !== 7) continue;
                    if (p.type === 5 && !this.isCyclicRealmOpen(p)) continue;

                    let dx = p.ox - centerOx;
                    if (dx > OVERWORLD_W / 2) dx -= OVERWORLD_W;
                    else if (dx < -OVERWORLD_W / 2) dx += OVERWORLD_W;
                    const dy = p.oy - centerOy;

                    if (Math.abs(dx) <= 18 && Math.abs(dy) <= 14) {
                        const wrapped = this.getWrappedCoordinates(p.ox, p.oy);
                        const sx = ($gameMap.adjustX ? $gameMap.adjustX(wrapped.x) : (wrapped.x - displayX)) * tileW + tileW / 2;
                        const sy = ($gameMap.adjustY ? $gameMap.adjustY(wrapped.y) : (wrapped.y - displayY)) * tileH + tileH / 2;
                        lights.push({
                            x: sx,
                            y: sy,
                            worldX: wrapped.x,
                            worldY: wrapped.y,
                            radius: (p.type === 5 ? 140 : 110) + pulse,
                            color: p.type === 5 ? "#ffd700" : "#a29bfe",
                            intensity: 1.1,
                            isPlayer: false
                        });
                    }
                }

                const rifts = this._secretRealmsState.activeSpontaneousRifts || [];
                for (let i = 0; i < rifts.length; i++) {
                    const r = rifts[i];
                    let dx = r.ox - centerOx;
                    if (dx > OVERWORLD_W / 2) dx -= OVERWORLD_W;
                    else if (dx < -OVERWORLD_W / 2) dx += OVERWORLD_W;
                    const dy = r.oy - centerOy;
                    if (Math.abs(dx) <= 18 && Math.abs(dy) <= 14) {
                        const wrapped = this.getWrappedCoordinates(r.ox, r.oy);
                        const sx = ($gameMap.adjustX ? $gameMap.adjustX(wrapped.x) : (wrapped.x - displayX)) * tileW + tileW / 2;
                        const sy = ($gameMap.adjustY ? $gameMap.adjustY(wrapped.y) : (wrapped.y - displayY)) * tileH + tileH / 2;
                        lights.push({
                            x: sx,
                            y: sy,
                            worldX: wrapped.x,
                            worldY: wrapped.y,
                            radius: 115 + pulse,
                            color: "#a29bfe",
                            intensity: 1.05,
                            isPlayer: false
                        });
                    }
                }
            } else {
                // Em escala Local 1:1, se estiver dentro de um Reino Secreto (Dongtian/Fenda) ou Seita, ilumina o altar central (sx=16, sy=16)
                const curOx = this._overworldPos.x;
                const curOy = this._overworldPos.y;
                const cell = engine.getOverworldDataAt(curOx, curOy);
                const rift = this.getSpontaneousRiftAt(curOx, curOy);
                if ((cell && cell.poiType >= 3) || rift) {
                    const altarLx = curOx * 32 + 16;
                    const altarLy = curOy * 32 + 16;
                    const wrapped = this.getWrappedCoordinates(altarLx, altarLy);
                    const sx = ($gameMap.adjustX ? $gameMap.adjustX(wrapped.x) : (wrapped.x - displayX)) * tileW + tileW / 2;
                    const sy = ($gameMap.adjustY ? $gameMap.adjustY(wrapped.y) : (wrapped.y - displayY)) * tileH + tileH / 2;
                    lights.push({
                        x: sx,
                        y: sy,
                        worldX: wrapped.x,
                        worldY: wrapped.y,
                        radius: 170 + pulse,
                        color: (cell && cell.poiType === 5) ? "#ffd700" : "#81ecec",
                        intensity: 1.15,
                        isPlayer: false
                    });
                }
            }

            return lights;
        }

        canEnterSecretRealm(poiData) {
            if (!poiData) return { allowed: true };
            const cs = (typeof $gameSystem !== "undefined" && $gameSystem && $gameSystem.cultivation)
                ? $gameSystem.cultivation()
                : null;

            // Categoria 1: Reino Cíclico (Dongtian) — exige Lua Cheia/Nova e respeita Limite de Reino
            if (poiData.type === 5) {
                if (!this.isCyclicRealmOpen(poiData)) {
                    return {
                        allowed: false,
                        reason: `🔒 O Reino Secreto [${poiData.name}] está oculto no vazio! Ele só se abre em noites de Lua Cheia ou Lua Nova.`
                    };
                }
                const maxRealm = poiData.maxRealmAllowed ?? 2;
                const playerRealm = cs ? cs.cultivation.qiRealmIndex : 1;
                if (playerRealm > maxRealm) {
                    return {
                        allowed: false,
                        reason: `⚡ [Repulsão Planar] As leis espaciais de [${poiData.name}] rejeitam cultivadores acima do Estabelecimento de Fundação!`
                    };
                }
                return {
                    allowed: true,
                    message: `✨ Você atravessou o portal luminoso para o Reino Secreto [${poiData.name}]!`
                };
            }

            // Categoria 2: Tumba / Mansão Selada — exige Chave/Pedra de Teste ou Perícia de Arranjos >= Nível X
            if (poiData.type === 6) {
                if (this.isSealedTombUnlocked(poiData.id)) {
                    return { allowed: true, message: `🗿 Você adentrou [${poiData.name}] (Selo já rompido).` };
                }
                const reqLevel = poiData.requiredArraySkill || 3;
                const arrayLevel = cs ? (cs.skills.arrays?.level || 1) : 1;
                const hasJadeKey = cs ? (cs.materials.arrayStones >= 2 || cs.materials.testingStones >= 1) : false;

                if (arrayLevel >= reqLevel) {
                    this.unlockSealedTomb(poiData.id);
                    if (cs) cs.addSkillExp("arrays", 80);
                    return {
                        allowed: true,
                        message: `☸️ Sua perícia em Arranjos (Nv.${arrayLevel}) decifrou e rompeu o selo ancestral de [${poiData.name}]!`
                    };
                }
                if (hasJadeKey && cs) {
                    if (cs.materials.testingStones >= 1) cs.materials.testingStones -= 1;
                    else cs.materials.arrayStones -= 2;
                    this.unlockSealedTomb(poiData.id);
                    return {
                        allowed: true,
                        message: `🔑 Seu Talismã/Pedra de Matriz ressoou com o monólito e destrancou [${poiData.name}]!`
                    };
                }
                return {
                    allowed: false,
                    reason: `🗿 [${poiData.name}] está protegida por uma Matriz Antiga! Exige Perícia [Arranjos Nv.${reqLevel}] ou 2x Pedras de Matriz.`
                };
            }

            // Categoria 3: Fenda Espacial Instável / Espontânea
            if (poiData.type === 7) {
                return {
                    allowed: true,
                    message: `🌌 Você mergulhou na [${poiData.name}]! Cuidado com as Tempestades do Vazio!`
                };
            }

            return { allowed: true };
        }

        // ---------------------------------------------------------------------
        // REGRAS DE PASSABILIDADE HÍDRICA E ESTRUTURAL (OVERWORLD & 1:1)
        // ---------------------------------------------------------------------
        /**
         * Avalia se o jogador pode atravessar a coordenada destino (água ou estrutura).
         * Retorna { canPass: boolean, mode: 'walk'|'wade'|'bridge'|'ship'|'qinggong'|'flight'|'blocked_wall', qiCost: number, reason?: string }
         */
        evaluateWaterTraversalAt(ox, oy) {
            const engine = globalThis.WorldClimateEngine;
            const isLocal = this._scaleMode === "local";
            const data = isLocal
                ? engine.getLocalDataAt(ox, oy)
                : engine.getOverworldDataAt(ox, oy);

            if (!data) {
                return { canPass: true, mode: "walk", qiCost: 0 };
            }

            // Em escala Local 1:1, verifica primeiro se há uma estrutura carimbada (Muralha, Parede, Telhado, Ponte, Doca)
            if (isLocal && globalThis.LocalPOITemplateStamp) {
                const effData = data;
                if (effData.poiType === 0) {
                    const rift = this.getSpontaneousRiftAt(effData.ox, effData.oy);
                    if (rift) effData.poiType = 7;
                }
                const stamp = globalThis.LocalPOITemplateStamp.evaluateStamp(effData);
                if (stamp) {
                    // Paredes, Telhados e Penhascos bloqueiam passagem terrestre (a menos que em Voo de Espada 3D)
                    if (stamp.upperBase > 0) {
                        const isFlying3D = Boolean(globalThis.Xianxia3DEngine && globalThis.Xianxia3DEngine.isFlying);
                        if (!isFlying3D) {
                            return { canPass: false, mode: "blocked_wall", qiCost: 0 };
                        }
                    }
                    // Pontes e Docas sobre água em POIs/Ravinas permitem caminhada seca
                    if (stamp.l2 === 82 || stamp.l2 === 83 || stamp.l2 === 1556) {
                        return { canPass: true, mode: "bridge", qiCost: 0 };
                    }
                    // Se o stamp colocou água (ex: fosso de Dongtian ou Lago Sagrado na Cratera), exige travessia hídrica
                    if (stamp.groundBase === 2048 || stamp.groundBase === 2096) {
                        if (data.waterBodyType === 0) {
                            data.waterBodyType = 6; // Trata como lago/fosso espiritual
                        }
                    } else if (stamp.groundBase >= 2816) {
                        return { canPass: true, mode: "walk", qiCost: 0 };
                    }
                }
            }

            if (data.waterBodyType === 0) {
                return { canPass: true, mode: "walk", qiCost: 0 };
            }

            if (data.isBridge) {
                return { canPass: true, mode: "bridge", qiCost: 0 };
            }

            // Riacho Raso (waterBodyType == 3) -> sempre caminhável a pé (velocidade levemente reduzida para mortais)!
            if (data.waterBodyType === 3) {
                return { canPass: true, mode: "wade", qiCost: 0 };
            }

            const cs = (typeof $gameSystem !== "undefined" && $gameSystem && $gameSystem.cultivation)
                ? $gameSystem.cultivation()
                : null;
            const qiRealm = cs ? cs.cultivation.qiRealmIndex : 0; // 0:Mortal, 1:Qi Refining, 2:Foundation, 3:Core Formation+
            const currentQi = cs ? cs.cultivation.currentQi : 0;

            // Voo de Espada ativo (Xianxia3DEngine) ou Formação de Núcleo+ (qiRealm >= 3)
            const isFlying3D = Boolean(globalThis.Xianxia3DEngine && globalThis.Xianxia3DEngine.isFlying);
            if (isFlying3D || qiRealm >= 3) {
                const flightCost = (data.waterBodyType === 1 || data.waterBodyType === 2) ? 0.5 : 0.2;
                if (!cs || currentQi >= flightCost) {
                    return { canPass: true, mode: "flight", qiCost: flightCost };
                }
            }

            // Rio Largo / Cânion Fluvial / Lago (waterBodyType == 4, 5, 6, 7)
            if (data.waterBodyType >= 4 && data.waterBodyType <= 7) {
                if (this._isSailingShip) {
                    return { canPass: true, mode: "ship", qiCost: 0 };
                }
                // Estabelecimento de Fundação (qiRealm >= 2) com Qi suficiente -> Passo sobre as Águas (Qinggong)
                if (qiRealm >= 2 && currentQi >= 0.8) {
                    return { canPass: true, mode: "qinggong", qiCost: 0.8 };
                }
                return {
                    canPass: false,
                    mode: "blocked_river",
                    qiCost: 0,
                    reason: "🌊 Rio Largo / Lago profundo! Use uma Ponte ou alcance o Estabelecimento de Fundação para usar [Passo sobre as Águas]."
                };
            }

            // Oceano Aberto / Mar Costeiro (waterBodyType == 1, 2)
            if (data.waterBodyType === 1 || data.waterBodyType === 2) {
                if (this._isSailingShip) {
                    return { canPass: true, mode: "ship", qiCost: 0 };
                }
                // Se o jogador estiver em um Porto (poiType == 2), embarca automaticamente em um Navio!
                const currentCoords = this.getOverworldCoordinates();
                const currentCell = engine.getOverworldDataAt(currentCoords.x, currentCoords.y);
                if (currentCell && (currentCell.poiType === 2 || currentCell.poiMacroType === 2)) {
                    this._isSailingShip = true;
                    if (cs) cs.addToast("⛵ Você embarcou em uma Barca Espiritual no Porto!", "#74b9ff");
                    return { canPass: true, mode: "ship", qiCost: 0 };
                }
                return {
                    canPass: false,
                    mode: "blocked_ocean",
                    qiCost: 0,
                    reason: "🌊 Oceano Aberto! Embarque em uma Cidade Portuária ou alcance a Formação de Núcleo para cruzar os mares voando."
                };
            }

            return { canPass: true, mode: "walk", qiCost: 0 };
        }

        // ---------------------------------------------------------------------
        // PROJEÇÃO TOROIDAL NO $dataMap (128x128 SCROLL LOOP) & SYNC DE TILEMAP
        // ---------------------------------------------------------------------
        ensureToroidalContainerMap() {
            if (typeof $dataMap === "undefined" || !$dataMap) return;

            const targetTileset = this._scaleMode === "overworld" ? 1 : 2;
            const needsResize = (
                $dataMap.width !== VIEWPORT_SIZE ||
                $dataMap.height !== VIEWPORT_SIZE ||
                $dataMap.scrollType !== 3 ||
                !$dataMap.data ||
                $dataMap.data.length !== VIEWPORT_SIZE * VIEWPORT_SIZE * 6
            );
            const tilesetChanged = ($dataMap.tilesetId !== targetTileset);

            if (needsResize || tilesetChanged) {
                $dataMap.width = VIEWPORT_SIZE;
                $dataMap.height = VIEWPORT_SIZE;
                $dataMap.scrollType = 3; // Loop Horizontal & Vertical
                $dataMap.tilesetId = targetTileset;
                if (needsResize) {
                    $dataMap.data = new Array(VIEWPORT_SIZE * VIEWPORT_SIZE * 6).fill(0);
                } else {
                    $dataMap.data.fill(0);
                }

                if (typeof $gameMap !== "undefined" && $gameMap) {
                    $gameMap._tilesetId = targetTileset;
                }

                // Sincroniza imediatamente o Tilemap do Spriteset_Map caso já tenha sido criado
                if (typeof SceneManager !== "undefined" && SceneManager._scene && SceneManager._scene._spriteset) {
                    const spriteset = SceneManager._scene._spriteset;
                    if (spriteset._tilemap) {
                        spriteset._tilemap.setData($dataMap.width, $dataMap.height, $dataMap.data);
                        spriteset._tilemap.horizontalWrap = true;
                        spriteset._tilemap.verticalWrap = true;
                    }
                    if (tilesetChanged && typeof spriteset.loadTileset === "function") {
                        spriteset.loadTileset();
                    }
                    if (spriteset._tilemap && typeof spriteset._tilemap.refresh === "function") {
                        spriteset._tilemap.refresh();
                    }
                }

                this._loadedChunks.clear();
            }
        }

        streamVisibleChunksAroundPlayer() {
            if (typeof $dataMap === "undefined" || !$dataMap || !$dataMap.data) return;
            this.ensureToroidalContainerMap();

            if (this._scaleMode === "local" && globalThis.LocalMapGenerator) {
                globalThis.LocalMapGenerator.streamLocalChunksAround(this._localPos.x, this._localPos.y);
                return;
            }

            const centerCx = Math.floor(this._overworldPos.x / CHUNK_SIZE);
            const centerCy = Math.floor(this._overworldPos.y / CHUNK_SIZE);
            const radius = 3; // 7x7 chunks de 16x16 = 112x112 tiles dentro da janela 128x128

            const activeKeys = new Set();
            let modified = false;

            for (let dy = -radius; dy <= radius; dy++) {
                const cy = centerCy + dy;
                if (cy < 0 || cy >= (OVERWORLD_H / CHUNK_SIZE)) continue;

                for (let dx = -radius; dx <= radius; dx++) {
                    const cx = ((centerCx + dx) % (OVERWORLD_W / CHUNK_SIZE) + (OVERWORLD_W / CHUNK_SIZE)) % (OVERWORLD_W / CHUNK_SIZE);
                    const key = `ow:${cx},${cy}`;
                    activeKeys.add(key);

                    if (!this._loadedChunks.has(key)) {
                        this._loadedChunks.add(key);
                        this._projectOverworldChunkToDataMap(cx, cy);
                        modified = true;
                    }
                }
            }

            for (const oldKey of this._loadedChunks) {
                if (!activeKeys.has(oldKey)) {
                    this._loadedChunks.delete(oldKey);
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

        _projectOverworldChunkToDataMap(chunkX, chunkY) {
            const tiles = this.generateOverworldChunkData(chunkX, chunkY);
            const w = $dataMap.width;
            const h = $dataMap.height;
            const area = w * h;

            for (let i = 0; i < tiles.length; i++) {
                const t = tiles[i];
                const wx = ((t.ox % w) + w) % w;
                const wy = ((t.oy % h) + h) % h;
                const baseIdx = wy * w + wx;

                $dataMap.data[baseIdx] = t.l0;
                $dataMap.data[area + baseIdx] = t.l1;
                $dataMap.data[area * 2 + baseIdx] = t.l2;
                $dataMap.data[area * 3 + baseIdx] = t.l3;
            }
        }

        onPlayerStepFinished() {
            if (this._transferLockFrames > 0) return;

            const engine = globalThis.WorldClimateEngine;
            const cs = (typeof $gameSystem !== "undefined" && $gameSystem && $gameSystem.cultivation)
                ? $gameSystem.cultivation()
                : null;

            // Atualiza Variáveis Ambientais (IDs 1, 2, 3) se EnvironmentVariableUpdater estiver presente
            if (globalThis.EnvironmentVariableUpdater && typeof globalThis.EnvironmentVariableUpdater.updateEnvironmentalVariables === "function") {
                globalThis.EnvironmentVariableUpdater.updateEnvironmentalVariables();
            }

            if (this._scaleMode === "overworld") {
                const ox = this._overworldPos.x;
                const oy = this._overworldPos.y;
                const cell = engine.getOverworldDataAt(ox, oy);
                const spontaneousRift = this.getSpontaneousRiftAt(ox, oy);

                // Se desembarcou em terra firme, encerra modo navio
                if (this._isSailingShip && cell.waterBodyType === 0) {
                    this._isSailingShip = false;
                    if (cs) cs.addToast("⚓ Você desembarcou em terra firme.", "#dfe6e9");
                }

                // Drena Qi se usou Passo sobre as Águas (Qinggong) ou Voo Oceânico
                const trav = this.evaluateWaterTraversalAt(ox, oy);
                if (trav.qiCost > 0 && cs) {
                    cs.cultivation.currentQi = Math.max(0, cs.cultivation.currentQi - trav.qiCost);
                }

                // Reduz levemente a velocidade de caminhada de Mortais ao vadear Riacho Raso (waterBodyType == 3)
                if (typeof $gamePlayer !== "undefined" && $gamePlayer && typeof $gamePlayer.setMoveSpeed === "function") {
                    const qiRealm = cs ? cs.cultivation.qiRealmIndex : 0;
                    if (trav.mode === "wade" && qiRealm === 0) {
                        $gamePlayer.setMoveSpeed(3.5);
                    } else if ($gamePlayer.moveSpeed && $gamePlayer.moveSpeed() === 3.5) {
                        $gamePlayer.setMoveSpeed(4);
                    }
                }

                // Entrada Automática em 1:1 ao pisar num POI (Cidade, Porto, Seita, Reino Secreto, Fenda Espontânea ou Marco de Cicatriz)
                const activePoi = cell.poiType !== 0 ? cell.poiData : spontaneousRift;
                const activePoiType = cell.poiType !== 0 ? cell.poiType : (spontaneousRift ? 7 : 0);
                const isScarCenter = (cell.scarType === 1 || cell.scarType === 2) && (ox % 16 === 8) && (oy % 16 === 8);

                if ((activePoiType !== 0 && activePoi && globalThis.LocalMapGenerator) || (isScarCenter && globalThis.LocalMapGenerator)) {
                    if (activePoiType >= 5 && activePoiType <= 7) {
                        const check = this.canEnterSecretRealm(activePoi);
                        if (!check.allowed) {
                            if (cs) cs.addToast(check.reason, "#ff7675");
                            return;
                        }
                        if (check.message && cs) {
                            cs.addToast(check.message, "#ffd700");
                        }
                    } else if (activePoi && cs) {
                        cs.addToast(`🏮 Entrando em [${activePoi.name}] (${activePoi.typeName})...`, "#55efc4");
                    } else if (isScarCenter && cs) {
                        cs.addToast(`⚔️ Adentrando [${cell.scarName}] em escala 1:1...`, "#fdcb6e");
                    }
                    this._transferLockFrames = 15;
                    globalThis.LocalMapGenerator.enterLocalScale(ox, oy, "poi_auto");
                }
            } else {
                // Em escala Local 1:1: efeitos passivos de Cicatrizes Antigas e Travessia Hídrica!
                const lx = this._localPos.x;
                const ly = this._localPos.y;
                const lData = engine.getLocalDataAt(lx, ly);
                const trav = this.evaluateWaterTraversalAt(lx, ly);

                if (trav.qiCost > 0 && cs) {
                    cs.cultivation.currentQi = Math.max(0, cs.cultivation.currentQi - trav.qiCost);
                }

                if (cs && lData) {
                    if (lData.scarType === 2) {
                        // Cratera da Palma Celestial: Gravidade 3x pesada tempera o Corpo a cada passo!
                        cs.addBodyExp(1.2);
                        cs.addSkillExp("bodyTempering", 0.35);
                    } else if (lData.scarType === 1) {
                        // Ravina de Intenção de Espada: Vento cortante de Metal tempera físico e espírito
                        cs.addSkillExp("soulPerception", 0.25);
                    }
                }
            }
        }

        updatePerFrame() {
            if (this._transferLockFrames > 0) {
                this._transferLockFrames--;
            }

            // Verifica abertura de Reinos Cíclicos (Dongtian) na Lua Cheia/Nova e gerencia Fendas Espontâneas (6-12h)
            if (typeof $gameSystem !== "undefined" && $gameSystem) {
                if (typeof $gameSystem.dayNightMoonPhase === "function") {
                    const mp = $gameSystem.dayNightMoonPhase();
                    if (mp !== this._secretRealmsState.lastNotifiedMoonPhase) {
                        this._secretRealmsState.lastNotifiedMoonPhase = mp;
                        if (mp === 4 || mp === 0) {
                            const cs = $gameSystem.cultivation ? $gameSystem.cultivation() : null;
                            const engine = globalThis.WorldClimateEngine;
                            const firstRealm = engine?.macroGrid?.pois?.find(p => p.type === 5);
                            if (cs && firstRealm) {
                                const phaseName = mp === 4 ? "Lua Cheia" : "Lua Nova";
                                cs.addToast(`✨ Os céus tremem na ${phaseName}! O Reino Secreto [${firstRealm.name}] se abriu em (${firstRealm.ox}, ${firstRealm.oy})!`, "#ffd700");
                            }
                            this._loadedChunks.clear();
                            this.streamVisibleChunksAroundPlayer();
                        }
                    }
                }

                if (typeof $gameSystem.dayNightTotalMinutes === "function") {
                    const totalHours = Math.floor($gameSystem.dayNightTotalMinutes() / 60);
                    if (totalHours !== this._lastSpontaneousRiftHourCheck) {
                        this._lastSpontaneousRiftHourCheck = totalHours;
                        this.updateSpontaneousRifts(totalHours);
                    }
                }
            }

            // Tecla 'E' para alternar livremente entre Overworld e Escala Local 1:1
            if (typeof Input !== "undefined" && Input.isTriggered && Input.isTriggered("toggleScaleExplore")) {
                if (typeof $gameMessage !== "undefined" && $gameMessage && $gameMessage.isBusy()) return;
                if (this._transferLockFrames > 0) return;

                if (globalThis.LocalMapGenerator) {
                    this._transferLockFrames = 15;
                    if (this._scaleMode === "overworld") {
                        globalThis.LocalMapGenerator.enterLocalScale(this._overworldPos.x, this._overworldPos.y, "manual_explore");
                    } else {
                        globalThis.LocalMapGenerator.returnToOverworld();
                    }
                }
            }
        }
    }

    const managerInstance = new OverworldChunkManager();

    // =========================================================================
    // 4. INTEGRAÇÃO COM RPG MAKER MZ & RETROCOMPATIBILIDADE BasicChunkGenerator / GameSaver
    // =========================================================================
    globalThis.OverworldChunkManager = managerInstance;
    globalThis.AutotileBitmaskResolver = AutotileBitmaskResolver;
    globalThis.chunkWidth = CHUNK_SIZE;
    globalThis.chunkHeight = CHUNK_SIZE;
    globalThis.emptyTileId = 0;

    // Namespace retrocompatível `BasicChunkGenerator`
    globalThis.BasicChunkGenerator = globalThis.BasicChunkGenerator || {};
    globalThis.BasicChunkGenerator._modifiedChunks = new Set();
    globalThis.BasicChunkGenerator.getRealPlayerCoordinates = () => managerInstance.getRealPlayerCoordinates();
    globalThis.BasicChunkGenerator.getRealChunkCoordinates = () => {
        const coords = managerInstance.getRealPlayerCoordinates();
        return { x: Math.floor(coords.x / CHUNK_SIZE), y: Math.floor(coords.y / CHUNK_SIZE) };
    };
    globalThis.BasicChunkGenerator.getWrappedCoordinates = (rx, ry) => managerInstance.getWrappedCoordinates(rx, ry);
    globalThis.BasicChunkGenerator.loadAllChunks = () => managerInstance.streamVisibleChunksAroundPlayer();

    // Shim retrocompatível `GameSaver` (substituído pelo Delta-Save < 60KB)
    globalThis.GameSaver = globalThis.GameSaver || {
        saveTileChange: (realX, realY, z, tileId) => {
            managerInstance.recordTileDelta(managerInstance.getScaleMode(), realX, realY, z, tileId);
        },
        saveChunkBaseData: () => {},
        getChunkBaseData: () => null
    };

    if (typeof DataManager !== "undefined") {
        const _DataManager_setupNewGame = DataManager.setupNewGame;
        DataManager.setupNewGame = function() {
            _DataManager_setupNewGame.call(this);
            managerInstance.initNewWorld(0);
            if (typeof $gamePlayer !== "undefined" && $gamePlayer) {
                const ow = managerInstance.getOverworldCoordinates();
                const wrapped = managerInstance.getWrappedCoordinates(ow.x, ow.y, VIEWPORT_SIZE, VIEWPORT_SIZE);
                // Define as coordenadas de destino para performTransfer() sem disparar locate() antecipado
                // (no setupNewGame o $dataMap ainda não foi carregado pelo Scene_Map)
                $gamePlayer._newX = wrapped.x;
                $gamePlayer._newY = wrapped.y;
                $gamePlayer._x = wrapped.x;
                $gamePlayer._y = wrapped.y;
                $gamePlayer._realX = wrapped.x;
                $gamePlayer._realY = wrapped.y;
                if (typeof $dataMap !== "undefined" && $dataMap) {
                    $gamePlayer.locate(wrapped.x, wrapped.y);
                }
                managerInstance._playerPosLastFrame = { x: wrapped.x, y: wrapped.y };
            }
        };

        const _DataManager_makeSaveContents = DataManager.makeSaveContents;
        DataManager.makeSaveContents = function() {
            const contents = _DataManager_makeSaveContents.call(this);
            contents.xianxiaPlanetSave = managerInstance.makeSavePayload();
            return contents;
        };

        const _DataManager_extractSaveContents = DataManager.extractSaveContents;
        DataManager.extractSaveContents = function(contents) {
            _DataManager_extractSaveContents.call(this, contents);
            if (contents && contents.xianxiaPlanetSave) {
                managerInstance.extractSavePayload(contents.xianxiaPlanetSave);
            }
        };
    }

    if (typeof Tilemap !== "undefined") {
        const _Tilemap_addAutotile = Tilemap.prototype._addAutotile;
        Tilemap.prototype._addAutotile = function(layer, tileId, dx, dy) {
            const kind = Tilemap.getAutotileKind(tileId);
            const shape = Tilemap.getAutotileShape(tileId);
            const ty = Math.floor(kind / 8);
            let autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
            if (Tilemap.isTileA1(tileId)) {
                if (kind > 3 && kind % 2 !== 0) {
                    autotileTable = Tilemap.WATERFALL_AUTOTILE_TABLE;
                }
            } else if (Tilemap.isTileA3(tileId)) {
                autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
            } else if (Tilemap.isTileA4(tileId)) {
                if (ty % 2 === 1) {
                    autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
                }
            }
            if (!autotileTable || !autotileTable[shape]) {
                const safeShape = (autotileTable && autotileTable.length > 0) ? (shape % autotileTable.length) : 0;
                const safeTileId = Tilemap.TILE_ID_A1 + kind * 48 + safeShape;
                return _Tilemap_addAutotile.call(this, layer, safeTileId, dx, dy);
            }
            return _Tilemap_addAutotile.apply(this, arguments);
        };
    }

    if (typeof Game_Map !== "undefined") {
        const _Game_Map_width = Game_Map.prototype.width;
        Game_Map.prototype.width = function() {
            return (typeof $dataMap !== "undefined" && $dataMap) ? $dataMap.width : 0;
        };

        const _Game_Map_height = Game_Map.prototype.height;
        Game_Map.prototype.height = function() {
            return (typeof $dataMap !== "undefined" && $dataMap) ? $dataMap.height : 0;
        };

        const _Game_Map_setup = Game_Map.prototype.setup;
        Game_Map.prototype.setup = function(mapId) {
            if (globalThis.WorldClimateEngine) {
                globalThis.WorldClimateEngine.ensureInitialized();
            }
            managerInstance.ensureToroidalContainerMap();
            _Game_Map_setup.call(this, mapId);
            managerInstance.streamVisibleChunksAroundPlayer();
        };

        const _Game_Map_checkPassage = Game_Map.prototype.checkPassage;
        Game_Map.prototype.checkPassage = function(x, y, bit) {
            if ($dataMap && $dataMap.width === VIEWPORT_SIZE && $dataMap.height === VIEWPORT_SIZE) {
                // No Overworld, a passabilidade é governada integralmente por evaluateWaterTraversalAt
                // para evitar que flags padrão de World_A2 (ex: 3104/3488/4016) bloqueiem biomas terrestres
                if (managerInstance.getScaleMode() === "overworld") {
                    return true;
                }
            }
            return _Game_Map_checkPassage.call(this, x, y, bit);
        };
    }

    if (typeof Scene_Map !== "undefined") {
        const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
        Scene_Map.prototype.onMapLoaded = function() {
            if (globalThis.WorldClimateEngine) {
                globalThis.WorldClimateEngine.ensureInitialized();
            }
            managerInstance.ensureToroidalContainerMap();
            _Scene_Map_onMapLoaded.call(this);
        };

        const _Scene_Map_start = Scene_Map.prototype.start;
        Scene_Map.prototype.start = function() {
            _Scene_Map_start.call(this);
            if (globalThis.WorldClimateEngine) {
                globalThis.WorldClimateEngine.ensureInitialized();
            }
            const realCoords = managerInstance.getRealPlayerCoordinates();
            const wrapped = managerInstance.getWrappedCoordinates(realCoords.x, realCoords.y);
            if ($gamePlayer) {
                $gamePlayer.locate(wrapped.x, wrapped.y);
                managerInstance._playerPosLastFrame = { x: $gamePlayer.x, y: $gamePlayer.y };
            }
            managerInstance.streamVisibleChunksAroundPlayer();
        };

        const _Scene_Map_update = Scene_Map.prototype.update;
        Scene_Map.prototype.update = function() {
            _Scene_Map_update.call(this);
            managerInstance.updatePerFrame();
        };
    }

    if (typeof Game_Player !== "undefined") {
        const _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
        Game_Player.prototype.performTransfer = function() {
            const wasTransferring = this.isTransferring();
            _Game_Player_performTransfer.call(this);
            if (wasTransferring) {
                const realCoords = managerInstance.getRealPlayerCoordinates();
                const wrapped = managerInstance.getWrappedCoordinates(realCoords.x, realCoords.y);
                this.locate(wrapped.x, wrapped.y);
                managerInstance._playerPosLastFrame = { x: this.x, y: this.y };
                managerInstance.streamVisibleChunksAroundPlayer();
            }
        };

        const _Game_Player_canPass = Game_Player.prototype.canPass;
        Game_Player.prototype.canPass = function(x, y, d) {
            if (this.isThrough() || this.isDebugThrough()) return true;

            const dx = d === 6 ? 1 : (d === 4 ? -1 : 0);
            const dy = d === 2 ? 1 : (d === 8 ? -1 : 0);
            const currReal = managerInstance.getRealPlayerCoordinates();
            const targetRealX = currReal.x + dx;
            const targetRealY = currReal.y + dy;

            // Clamping nos Polos Norte/Sul
            const maxH = managerInstance.getScaleMode() === "local" ? LOCAL_H : OVERWORLD_H;
            if (targetRealY < 0 || targetRealY >= maxH) {
                return false;
            }

            // Verifica travessia de corpos d'água ou estruturas 1:1 (Muralhas/Portões/Pontes/Qinggong/Voo)
            const waterCheck = managerInstance.evaluateWaterTraversalAt(targetRealX, targetRealY);
            if (!waterCheck.canPass) {
                if ($gameSystem && $gameSystem.cultivation && waterCheck.reason) {
                    $gameSystem.cultivation().addToast(waterCheck.reason, "#74b9ff");
                }
                return false;
            }
            if (waterCheck.mode !== "walk" || managerInstance.getScaleMode() === "overworld") {
                return true;
            }

            return _Game_Player_canPass.call(this, x, y, d);
        };

        const _Game_Player_updateMove = Game_Player.prototype.updateMove;
        Game_Player.prototype.updateMove = function() {
            _Game_Player_updateMove.call(this);
            if (!$dataMap) return;

            const w = $dataMap.width || VIEWPORT_SIZE;
            const h = $dataMap.height || VIEWPORT_SIZE;
            const last = managerInstance._playerPosLastFrame;

            if (last.x < 0 || last.y < 0) {
                managerInstance._playerPosLastFrame = { x: this.x, y: this.y };
                return;
            }

            let dx = this.x - last.x;
            let dy = this.y - last.y;
            if (dx === -(w - 1)) dx = 1;
            else if (dx === (w - 1)) dx = -1;
            if (dy === -(h - 1)) dy = 1;
            else if (dy === (h - 1)) dy = -1;

            if (dx !== 0 || dy !== 0) {
                managerInstance._playerPosLastFrame = { x: this.x, y: this.y };

                if (managerInstance.getScaleMode() === "local") {
                    const nextLx = managerInstance._localPos.x + dx;
                    const nextLy = managerInstance._localPos.y + dy;
                    managerInstance.setLocalPosition(nextLx, nextLy);
                } else {
                    const nextOx = managerInstance._overworldPos.x + dx;
                    const nextOy = managerInstance._overworldPos.y + dy;
                    managerInstance.setOverworldPosition(nextOx, nextOy);
                }

                const realNow = managerInstance.getRealPlayerCoordinates();
                const cx = Math.floor(realNow.x / CHUNK_SIZE);
                const cy = Math.floor(realNow.y / CHUNK_SIZE);
                if (cx !== managerInstance._currentChunk.x || cy !== managerInstance._currentChunk.y) {
                    managerInstance._currentChunk = { x: cx, y: cy };
                    managerInstance.streamVisibleChunksAroundPlayer();
                }

                managerInstance.onPlayerStepFinished();
            }
        };
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = {
            OverworldChunkManager: managerInstance,
            OverworldChunkManagerClass: OverworldChunkManager,
            AutotileBitmaskResolver,
            DiscoveredMacroBitfield,
            OVERWORLD_B_TILES
        };
    }
})();

