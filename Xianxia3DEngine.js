/*:
 * @target MZ
 * @plugindesc [v1.0.0] Motor 3D Voxel, Relevo Procedural, Billboards HD-2D & Voo de Espada (Three.js + WebGL2 Isolado).
 * @author Antigravity (Xianxia 3D Engine)
 * @version 1.0.0
 * @license MIT
 *
 * @help
 * ============================================================================
 * Xianxia3DEngine.js - Motor 3D Voxel, Relevo Procedural & Billboards
 * ============================================================================
 * Transforma o RPG Maker MZ em um mundo 3D em tempo real com estética HD-2D /
 * Voxel de Relevo e Billboards Cilíndricos, integrado nativamente com:
 *   - Geradores Procedurais (WorldClimateEngine, OverworldChunkManager,
 *     LocalMapGenerator, PerlinNoiseGenerator, BasicChunkGenerator,
 *     ProceduralCityGenerator)
 *   - DayNightSystem.js (Sol/Lua 3D real, sombras suaves PCFSoftShadowMap,
 *     luzes pontuais e supressão automática de dupla escuridão 2D)
 *   - CultivationCore.js (Voo de Espada em 3 Dimensões com controle de
 *     altitude Z, consumo de Qi e travessia vertical de penhascos/ravinas)
 *
 * ----------------------------------------------------------------------------
 * CONTROLES EM JOGO:
 * ----------------------------------------------------------------------------
 * - Q / E ou Botão Direito do Mouse + Arrastar: Girar câmera em 360° (Yaw/Pitch)
 * - Roda do Mouse (Scroll): Zoom contínuo entre 3ª Pessoa e 1ª Pessoa (FOV)
 * - WASD / Setas: Movimentação relativa ao ângulo atual da câmera
 * - Clique Esquerdo no Chão: Raycasting 3D exato no bloco clicado
 * - F (ou tecla configurada): Ativar/Desativar Voo de Espada 3D
 *   - Durante o Voo: R / PageUp (Subir altitude Z), V / PageDown (Descer Z)
 * - F6 (ou tecla configurada): Alternar instantaneamente entre Modo 3D e 2D
 *
 * ----------------------------------------------------------------------------
 * NOTETAGS DE MAPA E EVENTOS:
 * ----------------------------------------------------------------------------
 * Mapas e Tilesets:
 *   <disable3D>          - Desativa o motor 3D neste mapa específico
 *   <elevationStep:0.5>  - Define a escala de cada degrau de altura no mapa
 *   <regionOffset:0>     - Offset subtraído do cálculo padrão de altura por Região
 *   <3d-regions: 1..20=0.5, 21..40=1.0> - Mapeia faixas de Region IDs para cotas Z
 *   <terrainTags: rampNS=1, rampEW=3, stairs=5, wall=6, bridge=7> - Configura Terrain Tags
 *
 * Eventos:
 *   <heightOffset:1.5>   - Eleva o evento em Z unidades acima do terreno
 *   <flatSprite>         - Renderiza o evento deitado no chão (ex: círculos mágicos)
 *   <noBillboardShadow>  - Desativa a projeção de sombra 3D deste evento
 *
 * @param enableByDefault
 * @text Ativar 3D por Padrão
 * @type boolean
 * @default true
 * @desc Inicia todos os mapas em modo 3D (a menos que o mapa tenha a notetag <disable3D>).
 *
 * @param cameraFov
 * @text Campo de Visão (FOV)
 * @type number
 * @min 35
 * @max 100
 * @default 55
 * @desc Ângulo de visão vertical da PerspectiveCamera em graus.
 *
 * @param defaultCameraDistance
 * @text Distância Padrão da Câmera
 * @type number
 * @decimals 1
 * @min 0
 * @max 28
 * @default 9.5
 * @desc Distância orbital inicial em unidades de tile (0 = 1ª Pessoa).
 *
 * @param defaultCameraPitch
 * @text Inclinação Inicial (Pitch Graus)
 * @type number
 * @min 10
 * @max 85
 * @default 42
 * @desc Ângulo vertical inicial da câmera em graus (ex: 42° para visão estilo Octopath/HD-2D).
 *
 * @param renderChunkRadius
 * @text Raio de Renderização (Chunks 16x16)
 * @type number
 * @min 2
 * @max 5
 * @default 3
 * @desc Raio de chunks 16x16 ativos ao redor do jogador (3 = grade 7x7 = 112x112 tiles).
 *
 * @param shadowMapResolution
 * @text Resolução de Sombras 3D
 * @type select
 * @option 1024x1024 (Desempenho)
 * @value 1024
 * @option 2048x2048 (Qualidade Equilibrada)
 * @value 2048
 * @option 4096x4096 (Ultra)
 * @value 4096
 * @default 2048
 * @desc Resolução do Shadow Map direcional do Sol/Lua.
 *
 * @param mouseSensitivity
 * @text Sensibilidade do Mouse
 * @type number
 * @decimals 2
 * @default 1.00
 * @desc Multiplicador de velocidade ao girar a câmera com o botão direito do mouse.
 *
 * @param toggle3DKey
 * @text Tecla Alternar 3D/2D
 * @type string
 * @default F6
 * @desc Tecla para ligar/desligar o motor 3D em tempo real.
 *
 * @param swordFlightKey
 * @text Tecla Voo de Espada 3D
 * @type string
 * @default f
 * @desc Tecla para ativar/desativar o Voo de Espada 3D.
 *
 * @param requireCultivationForFlight
 * @text Exigir Reino para Voo de Espada
 * @type boolean
 * @default false
 * @desc Se ativo, exige Estabelecimento de Fundação (Reino >= 2) no CultivationCore para voar.
 *
 * @command set3DMode
 * @text Definir Modo 3D
 * @desc Ativa ou desativa a renderização 3D no mapa atual.
 * @arg enabled
 * @type boolean
 * @default true
 *
 * @command setCameraAngles
 * @text Definir Câmera 3D
 * @desc Ajusta o azimute (yaw), inclinação (pitch) e distância da câmera 3D.
 * @arg yawDegrees
 * @type number
 * @default 0
 * @arg pitchDegrees
 * @type number
 * @default 42
 * @arg distance
 * @type number
 * @decimals 1
 * @default 9.5
 */

(() => {
    "use strict";

    const pluginName = "Xianxia3DEngine";
    const params = PluginManager.parameters(pluginName);

    const PARAM_ENABLE_DEFAULT = String(params["enableByDefault"] ?? "true") !== "false";
    const PARAM_CAMERA_FOV = Number(params["cameraFov"] || 55);
    const PARAM_DEFAULT_DIST = Number(params["defaultCameraDistance"] ?? 9.5);
    const PARAM_DEFAULT_PITCH = Number(params["defaultCameraPitch"] || 42) * (Math.PI / 180);
    const PARAM_CHUNK_RADIUS = Math.max(1, Math.min(5, Number(params["renderChunkRadius"] || 2)));
    const PARAM_SHADOW_RES = Number(params["shadowMapResolution"] || 2048);
    const PARAM_MOUSE_SENS = Number(params["mouseSensitivity"] || 1.0);
    const PARAM_TOGGLE_KEY = String(params["toggle3DKey"] || "F6").toUpperCase();
    const PARAM_FLIGHT_KEY = String(params["swordFlightKey"] || "f").toLowerCase();
    const PARAM_REQUIRE_REALM = String(params["requireCultivationForFlight"] ?? "false") === "true";

    const CHUNK_SIZE = 16;
    const MAX_LRU_CHUNKS = 121; // 11x11 máximo estrito para proteção de VRAM (Blindagem 5)
    const ATLAS_SIZE = 4096;
    const CELL_PX = 48;
    const HALF_PX = 24;
    const ATLAS_COLS = Math.floor(ATLAS_SIZE / CELL_PX); // 85 colunas (7225 células totais)
    const TEXEL_INSET = 0.25 / ATLAS_SIZE;

    // Registro de teclas customizadas no Input.keyMapper do RMMZ
    if (Input && Input.keyMapper) {
        if (!Input.keyMapper[82]) Input.keyMapper[82] = "flightUp";     // Tecla R
        if (!Input.keyMapper[86]) Input.keyMapper[86] = "flightDown";   // Tecla V
        if (!Input.keyMapper[70]) Input.keyMapper[70] = "swordFlight";  // Tecla F
        if (!Input.keyMapper[117]) Input.keyMapper[117] = "toggle3D";   // Tecla F6
    }

    // =========================================================================
    // SUBSISTEMA 1: RMMZ3DTilesetAtlas
    // Pré-baking determinístico 4096x4096 dos Autotiles A1..A4 (48/16/4 shapes)
    // + 3 frames de água/cachoeira e tiles normais A5..E em uma única textura GPU.
    // =========================================================================
    class RMMZ3DTilesetAtlas {
        constructor() {
            this.canvas = document.createElement("canvas");
            this.canvas.width = ATLAS_SIZE;
            this.canvas.height = ATLAS_SIZE;
            this.ctx = this.canvas.getContext("2d", { alpha: true });
            this.ctx.imageSmoothingEnabled = false;

            this.texture = null;
            this.material = null;
            this.waterUniforms = {
                uWaterFrame: { value: 0.0 },
                uWaterfallFrame: { value: 0.0 }
            };

            // Mapa de tileId -> { slot, animType }
            this._tileSlotMap = new Int32Array(Tilemap.TILE_ID_MAX);
            this._tileSlotMap.fill(-1);
            this._tileAnimType = new Uint8Array(Tilemap.TILE_ID_MAX);
            this._nextSlot = 1; // Slot 0 reservado para tile branco/fallback
            this._isBuilt = false;
            this._tilesetId = -1;
            this._bitmapsReadyMask = 0;

            this._initFallbackSlot();
        }

        _initFallbackSlot() {
            this.ctx.clearRect(0, 0, ATLAS_SIZE, ATLAS_SIZE);
            this.ctx.fillStyle = "#5a7d4c";
            this.ctx.fillRect(0, 0, CELL_PX, CELL_PX);
        }

        slotToPixelXY(slot) {
            const col = slot % ATLAS_COLS;
            const row = Math.floor(slot / ATLAS_COLS);
            return { dx: col * CELL_PX, dy: row * CELL_PX };
        }

        getTileUVRect(tileId) {
            if (tileId <= 0 || tileId >= Tilemap.TILE_ID_MAX) {
                return { u0: 0, v0: 0, u1: 0, v1: 0, animType: 0 };
            }
            let slot = this._tileSlotMap[tileId];
            if (slot < 0) {
                slot = this._bakeSingleTileId(tileId);
            }
            const col = slot % ATLAS_COLS;
            const row = Math.floor(slot / ATLAS_COLS);
            const u0 = (col * CELL_PX) / ATLAS_SIZE + TEXEL_INSET;
            const u1 = ((col + 1) * CELL_PX) / ATLAS_SIZE - TEXEL_INSET;
            // No Three.js CanvasTexture (flipY = true por padrão), v=1 é o topo (dy=0) e v=0 é a base
            const v1 = 1.0 - (row * CELL_PX) / ATLAS_SIZE - TEXEL_INSET;
            const v0 = 1.0 - ((row + 1) * CELL_PX) / ATLAS_SIZE + TEXEL_INSET;
            return {
                u0,
                v0,
                u1,
                v1,
                animType: this._tileAnimType[tileId] || 0
            };
        }

        checkAndBuild(tilesetId, bitmaps, flags) {
            this._flags = flags || [];
            let readyMask = 0;
            if (Array.isArray(bitmaps)) {
                for (let i = 0; i < bitmaps.length; i++) {
                    if (bitmaps[i] && bitmaps[i].isReady()) {
                        readyMask |= (1 << i);
                    }
                }
            }
            if (this._isBuilt && this._tilesetId === tilesetId && this._bitmapsReadyMask === readyMask) {
                return false;
            }
            this._tilesetId = tilesetId;
            this._bitmapsReadyMask = readyMask;
            this._bitmaps = bitmaps || [];
            this._rebuildFullAtlas();
            return true;
        }

        _rebuildFullAtlas() {
            this._tileSlotMap.fill(-1);
            this._tileAnimType.fill(0);
            this._nextSlot = 1;
            this._initFallbackSlot();

            // Pré-aloca e renderiza sob demanda ou em lote os tiles usados
            if (this.texture) {
                this.texture.needsUpdate = true;
            } else if (typeof THREE !== "undefined") {
                this.texture = new THREE.CanvasTexture(this.canvas);
                this.texture.magFilter = THREE.NearestFilter;
                this.texture.minFilter = THREE.NearestFilter;
                this.texture.generateMipmaps = false;
                this.texture.needsUpdate = true;
            }
            this._ensureMaterial();
            this._isBuilt = true;
        }

        _ensureMaterial() {
            if (this.material || typeof THREE === "undefined") return;
            const uniforms = this.waterUniforms;
            this.material = new THREE.MeshLambertMaterial({
                map: this.texture,
                alphaTest: 0.5,
                side: THREE.FrontSide
            });

            this.material.onBeforeCompile = (shader) => {
                shader.uniforms.uWaterFrame = uniforms.uWaterFrame;
                shader.uniforms.uWaterfallFrame = uniforms.uWaterfallFrame;

                shader.vertexShader =
                    `uniform float uWaterFrame;\n` +
                    `uniform float uWaterfallFrame;\n` +
                    `attribute float aAnimType;\n` +
                    shader.vertexShader;

                shader.vertexShader = shader.vertexShader.replace(
                    "#include <uv_vertex>",
                    `#include <uv_vertex>\n` +
                    `#ifdef USE_MAP\n` +
                    `  float frameShift = (aAnimType > 1.5) ? uWaterfallFrame : ((aAnimType > 0.5) ? uWaterFrame : 0.0);\n` +
                    `  vUv.x += frameShift * ${(CELL_PX / ATLAS_SIZE).toFixed(10)};\n` +
                    `#endif`
                );
            };
        }

        _bakeSingleTileId(tileId) {
            if (this._tileSlotMap[tileId] >= 0) {
                return this._tileSlotMap[tileId];
            }
            if (this._nextSlot + 3 >= ATLAS_COLS * ATLAS_COLS) {
                return 0;
            }

            if (Tilemap.isAutotile(tileId)) {
                const isA1 = Tilemap.isTileA1(tileId);
                const kind = Tilemap.getAutotileKind(tileId);
                const isAnimatedA1 = isA1 && !(kind === 2 || kind === 3);

                if (isAnimatedA1) {
                    const baseSlot = this._nextSlot;
                    this._nextSlot += 3;
                    const isWaterfall = Tilemap.isWaterfallTile(tileId);
                    this._tileAnimType[tileId] = isWaterfall ? 2 : 1;

                    for (let frame = 0; frame < 3; frame++) {
                        const { dx, dy } = this.slotToPixelXY(baseSlot + frame);
                        this._drawAutotileToAtlas(tileId, dx, dy, frame);
                    }
                    this._tileSlotMap[tileId] = baseSlot;
                    if (this.texture) this.texture.needsUpdate = true;
                    return baseSlot;
                } else {
                    const slot = this._nextSlot++;
                    this._tileAnimType[tileId] = 0;
                    const { dx, dy } = this.slotToPixelXY(slot);
                    this._drawAutotileToAtlas(tileId, dx, dy, 0);
                    this._tileSlotMap[tileId] = slot;
                    if (this.texture) this.texture.needsUpdate = true;
                    return slot;
                }
            } else {
                const slot = this._nextSlot++;
                this._tileAnimType[tileId] = 0;
                const { dx, dy } = this.slotToPixelXY(slot);
                this._drawNormalTileToAtlas(tileId, dx, dy);
                this._tileSlotMap[tileId] = slot;
                if (this.texture) this.texture.needsUpdate = true;
                return slot;
            }
        }

        _getBitmapSource(setNumber) {
            if (!this._bitmaps || !this._bitmaps[setNumber]) return null;
            const bmp = this._bitmaps[setNumber];
            if (!bmp.isReady()) return null;
            return bmp.canvas || bmp._image || null;
        }

        _drawNormalTileToAtlas(tileId, dx, dy) {
            let setNumber = 0;
            if (Tilemap.isTileA5(tileId)) {
                setNumber = 4;
            } else {
                setNumber = 5 + Math.floor(tileId / 256);
            }
            const source = this._getBitmapSource(setNumber);
            if (!source) {
                this._drawProceduralFallbackTile(tileId, dx, dy);
                return;
            }
            const w = CELL_PX;
            const h = CELL_PX;
            const sx = ((Math.floor(tileId / 128) % 2) * 8 + (tileId % 8)) * w;
            const sy = (Math.floor((tileId % 256) / 8) % 16) * h;
            this.ctx.clearRect(dx, dy, w, h);
            this.ctx.drawImage(source, sx, sy, w, h, dx, dy, w, h);
        }

        _drawAutotileToAtlas(tileId, dx, dy, animFrame) {
            const kind = Tilemap.getAutotileKind(tileId);
            const shape = Tilemap.getAutotileShape(tileId);
            const tx = kind % 8;
            const ty = Math.floor(kind / 8);
            let setNumber = 0;
            let bx = 0;
            let by = 0;
            let autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;

            if (Tilemap.isTileA1(tileId)) {
                const waterSurfaceIndex = animFrame % 3;
                setNumber = 0;
                if (kind === 0) {
                    bx = waterSurfaceIndex * 2;
                    by = 0;
                } else if (kind === 1) {
                    bx = waterSurfaceIndex * 2;
                    by = 3;
                } else if (kind === 2) {
                    bx = 6;
                    by = 0;
                } else if (kind === 3) {
                    bx = 6;
                    by = 3;
                } else {
                    bx = Math.floor(tx / 4) * 8;
                    by = ty * 6 + (Math.floor(tx / 2) % 2) * 3;
                    if (kind % 2 === 0) {
                        bx += waterSurfaceIndex * 2;
                    } else {
                        bx += 6;
                        autotileTable = Tilemap.WATERFALL_AUTOTILE_TABLE;
                        by += animFrame % 3;
                    }
                }
            } else if (Tilemap.isTileA2(tileId)) {
                setNumber = 1;
                bx = tx * 2;
                by = (ty - 2) * 3;
            } else if (Tilemap.isTileA3(tileId)) {
                setNumber = 2;
                bx = tx * 2;
                by = (ty - 6) * 2;
                autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
            } else if (Tilemap.isTileA4(tileId)) {
                setNumber = 3;
                bx = tx * 2;
                by = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0));
                if (ty % 2 === 1) {
                    autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
                }
            }

            const source = this._getBitmapSource(setNumber);
            if (!source) {
                this._drawProceduralFallbackTile(tileId, dx, dy, animFrame);
                return;
            }

            const safeShape = Math.max(0, Math.min(autotileTable.length - 1, shape));
            const table = autotileTable[safeShape];
            this.ctx.clearRect(dx, dy, CELL_PX, CELL_PX);

            for (let i = 0; i < 4; i++) {
                const qsx = table[i][0];
                const qsy = table[i][1];
                const sx1 = (bx * 2 + qsx) * HALF_PX;
                const sy1 = (by * 2 + qsy) * HALF_PX;
                const dx1 = dx + (i % 2) * HALF_PX;
                const dy1 = dy + Math.floor(i / 2) * HALF_PX;
                this.ctx.drawImage(source, sx1, sy1, HALF_PX, HALF_PX, dx1, dy1, HALF_PX, HALF_PX);
            }
        }

        _drawProceduralFallbackTile(tileId, dx, dy, animFrame = 0) {
            const kind = Tilemap.isAutotile(tileId) ? Tilemap.getAutotileKind(tileId) : 0;
            if (Tilemap.isWaterTile(tileId)) {
                const blues = ["#1e5799", "#2463ab", "#2b6cb8"];
                this.ctx.fillStyle = blues[animFrame % 3];
            } else if (Tilemap.isWallSideTile(tileId)) {
                this.ctx.fillStyle = "#5c5346";
            } else if (Tilemap.isWallTopTile(tileId)) {
                this.ctx.fillStyle = "#7a6f5d";
            } else {
                const greens = ["#4b7845", "#5c8a47", "#7c6f48", "#879164", "#d6c88f", "#cfdbe6"];
                this.ctx.fillStyle = greens[kind % greens.length];
            }
            this.ctx.fillRect(dx, dy, CELL_PX, CELL_PX);
            this.ctx.strokeStyle = "rgba(0,0,0,0.12)";
            this.ctx.strokeRect(dx + 0.5, dy + 0.5, CELL_PX - 1, CELL_PX - 1);
        }

        updateAnimationUniforms(frameCount) {
            const waterStep = Math.floor(frameCount / 20) % 4;
            this.waterUniforms.uWaterFrame.value = [0.0, 1.0, 2.0, 1.0][waterStep];
            this.waterUniforms.uWaterfallFrame.value = Number(Math.floor(frameCount / 15) % 3);
        }

        dispose() {
            if (this.texture) {
                this.texture.dispose();
                this.texture = null;
            }
            if (this.material) {
                this.material.dispose();
                this.material = null;
            }
            this._isBuilt = false;
        }
    }

    // =========================================================================
    // SUBSISTEMA 2: TopologyAndHeightProvider
    // Modelo Híbrido de Elevação:
    // - Modo A: Ingestão direta H(x,y) dos geradores procedurais
    // - Modo B: Cotas diretas por Region IDs (1 a 255) com precedência estrita
    // - Classificação Topológica via Terrain Tags (0 a 7):
    //   Plano, Rampas NS/EW com interpolação contínua, Escadarias submétricas,
    //   Paredes verticais forçadas e Pontes suspensas
    // - Bloco Semântico de Notetags de Mapa e Tileset (<3d-regions>, <elevationStep>, etc.)
    // =========================================================================
    const SHAPE_FLAT = 0;
    const SHAPE_RAMP_NORTH = 1;
    const SHAPE_RAMP_SOUTH = 2;
    const SHAPE_RAMP_EAST = 3;
    const SHAPE_RAMP_WEST = 4;
    const SHAPE_STAIRS = 5;
    const SHAPE_WALL = 6;
    const SHAPE_BRIDGE = 7;
    const SHAPE_RAMP_NS_AUTO = 8;
    const SHAPE_RAMP_EW_AUTO = 9;

    class TopologyAndHeightProvider {
        constructor() {
            this._staticHeightGrid = null;
            this._staticWallSideKindGrid = null;
            this._parsedMapId = -1;
            this._mapWidth = 0;
            this._mapHeight = 0;
            this._elevationStep = 0.5;
            this._regionOffset = 0.0;
            this._regionHeightMap = new Map();
            this._terrainTagConfig = {
                rampNS: 1,
                rampSouth: 2,
                rampEW: 3,
                rampWest: 4,
                stairs: 5,
                wall: 6,
                bridge: 7
            };
        }

        isProceduralMapActive() {
            if (globalThis.WorldClimateEngine && typeof globalThis.WorldClimateEngine.getElevationAt === "function") {
                return true;
            }
            if (globalThis.OverworldChunkManager && typeof globalThis.OverworldChunkManager.getHeightAt === "function") {
                return true;
            }
            if (globalThis.LocalMapGenerator && typeof globalThis.LocalMapGenerator.getHeightAt === "function") {
                return true;
            }
            // Verifica se PerlinNoiseGenerator está ativo nos plugins
            if (globalThis.PerlinNoiseGenerator && typeof globalThis.PerlinNoiseGenerator.getEnvironmentDataForCoords === "function") {
                const pEntry = typeof $plugins !== "undefined" && $plugins && $plugins.find(p => p.name === "PerlinNoiseGenerator" && p.status);
                if (pEntry) return true;
            }
            return false;
        }

        _parseNotetags() {
            this._elevationStep = 0.5;
            this._regionOffset = 0.0;
            this._regionHeightMap.clear();
            this._terrainTagConfig = {
                rampNS: 1,
                rampSouth: 2,
                rampEW: 3,
                rampWest: 4,
                stairs: 5,
                wall: 6,
                bridge: 7
            };

            const mapNote = ($dataMap && $dataMap.note) ? $dataMap.note : "";
            const tileset = ($gameMap && typeof $gameMap.tileset === "function")
                ? $gameMap.tileset()
                : (($dataTilesets && $dataMap && $dataMap.tilesetId) ? $dataTilesets[$dataMap.tilesetId] : null);
            const tilesetNote = (tileset && tileset.note) ? tileset.note : "";

            // Processa tileset primeiro, depois mapa (notetag de mapa tem precedência)
            const notesToProcess = [tilesetNote, mapNote];

            for (const note of notesToProcess) {
                if (!note) continue;

                // 1. elevationStep: ex <elevationStep: 0.5>, <elevation_step: 0.5>, <elevation-step: 0.5>, <elevationStep=0.5>
                const stepMatch = note.match(/<elevation[_-]?Step(?:\s*:|\s*=)\s*([\d.]+)>/i);
                if (stepMatch) {
                    this._elevationStep = Number(stepMatch[1]) || 0.5;
                }

                // 2. regionOffset: ex <regionOffset: 1.0>, <region_offset: 1.0>, <regionOffset=1.0>
                const offsetMatch = note.match(/<region[_-]?Offset(?:\s*:|\s*=)\s*(-?[\d.]+)>/i);
                if (offsetMatch) {
                    this._regionOffset = Number(offsetMatch[1]) || 0.0;
                }

                // 3. 3d-regions: ex <3d-regions: 1..20=0.5, 21..40=1.0, 50=2.5> or <3d-regions: 1-20=0.5, 50: 3.0> or <3d-regions = ...>
                const regBlockMatches = note.matchAll(/<3d-regions?\s*[:=]\s*([^>]+)>/gi);
                for (const m of regBlockMatches) {
                    const body = m[1];
                    const entries = body.split(/[,;\n]+/);
                    for (const entry of entries) {
                        const trimmed = entry.trim();
                        if (!trimmed) continue;
                        const rMatch = trimmed.match(/^(\d+)(?:\.\.(\d+)|\-(\d+))?\s*(?:=|\:)\s*(-?[\d.]+)$/);
                        if (rMatch) {
                            const start = parseInt(rMatch[1], 10);
                            const end = (rMatch[2] || rMatch[3]) ? parseInt(rMatch[2] || rMatch[3], 10) : start;
                            const height = parseFloat(rMatch[4]);
                            const minR = Math.min(start, end);
                            const maxR = Math.max(start, end);
                            for (let r = minR; r <= maxR; r++) {
                                this._regionHeightMap.set(r, height);
                            }
                        }
                    }
                }

                // 4. terrainTags bloco: ex <terrainTags: rampNS=1, rampEW=3, stairs=5, wall=6, bridge=7> ou com ":"
                const tagBlockMatch = note.match(/<(?:3d-)?terrainTags\s*[:=]\s*([^>]+)>/i);
                if (tagBlockMatch) {
                    const entries = tagBlockMatch[1].split(/[,;\n]+/);
                    for (const entry of entries) {
                        const parts = entry.trim().split(/\s*[:=]\s*/);
                        if (parts.length === 2) {
                            const key = parts[0].trim();
                            const val = parseInt(parts[1].trim(), 10);
                            if (!isNaN(val)) {
                                if (/rampNS|rampNorthSouth|rampNorth\b|^ramp$/i.test(key)) this._terrainTagConfig.rampNS = val;
                                else if (/rampSouth/i.test(key)) this._terrainTagConfig.rampSouth = val;
                                else if (/rampEW|rampEastWest|rampEast\b/i.test(key)) this._terrainTagConfig.rampEW = val;
                                else if (/rampWest/i.test(key)) this._terrainTagConfig.rampWest = val;
                                else if (/stairs|stair/i.test(key)) this._terrainTagConfig.stairs = val;
                                else if (/wall|cliff/i.test(key)) this._terrainTagConfig.wall = val;
                                else if (/bridge|platform/i.test(key)) this._terrainTagConfig.bridge = val;
                            }
                        }
                    }
                }

                // 5. Individual terrain tag notetags (suporta ":" ou "=")
                const rNSMatch = note.match(/<(?:rampNorthTag|rampNSTag)(?:\s*:|\s*=)\s*(\d+)>/i);
                if (rNSMatch) this._terrainTagConfig.rampNS = parseInt(rNSMatch[1], 10);
                const rSMatch = note.match(/<rampSouthTag(?:\s*:|\s*=)\s*(\d+)>/i);
                if (rSMatch) this._terrainTagConfig.rampSouth = parseInt(rSMatch[1], 10);
                const rEWMatch = note.match(/<(?:rampEastTag|rampEWTag)(?:\s*:|\s*=)\s*(\d+)>/i);
                if (rEWMatch) this._terrainTagConfig.rampEW = parseInt(rEWMatch[1], 10);
                const rWMatch = note.match(/<rampWestTag(?:\s*:|\s*=)\s*(\d+)>/i);
                if (rWMatch) this._terrainTagConfig.rampWest = parseInt(rWMatch[1], 10);
                const stMatch = note.match(/<stairsTag(?:\s*:|\s*=)\s*(\d+)>/i);
                if (stMatch) this._terrainTagConfig.stairs = parseInt(stMatch[1], 10);
                const wlMatch = note.match(/<wallTag(?:\s*:|\s*=)\s*(\d+)>/i);
                if (wlMatch) this._terrainTagConfig.wall = parseInt(wlMatch[1], 10);
                const brMatch = note.match(/<bridgeTag(?:\s*:|\s*=)\s*(\d+)>/i);
                if (brMatch) this._terrainTagConfig.bridge = parseInt(brMatch[1], 10);
            }
        }

        prepareForMap() {
            if (!$dataMap) return;
            const mapId = ($gameMap && typeof $gameMap.mapId === "function") ? $gameMap.mapId() : ($dataMap.mapId || 1);
            const w = $dataMap.width;
            const h = $dataMap.height;

            if (this._parsedMapId === mapId && this._mapWidth === w && this._mapHeight === h && this._staticHeightGrid) {
                return;
            }
            this._parseNotetags();
            this._parsedMapId = mapId;
            this._mapWidth = w;
            this._mapHeight = h;
            this._buildStaticTopologyGrid(w, h);
        }

        invalidateStaticCache() {
            this._parsedMapId = -1;
        }

        /**
         * R1: Retorna a cota de elevação Z correspondente a um Region ID (1 a 255).
         * Prioriza notetags semânticas (<3d-regions: ...>) e aplica offset customizado.
         */
        getRegionElevation(regionId) {
            if (regionId <= 0) return 0.0;
            if (this._regionHeightMap && this._regionHeightMap.has(regionId)) {
                return this._regionHeightMap.get(regionId);
            }
            return (regionId - this._regionOffset) * this._elevationStep;
        }

        /**
         * Modo B: Parser Topológico com precedência estrita de Region IDs (1 a 255)
         * sobre qualquer adivinhação topológica de tiles empilhados.
         */
        _buildStaticTopologyGrid(w, h) {
            const total = w * h;
            this._staticHeightGrid = new Float32Array(total);
            this._staticWallSideKindGrid = new Int16Array(total);
            this._staticWallSideKindGrid.fill(-1);

            if (!$dataMap || !$dataMap.data) return;
            const data = $dataMap.data;
            const step = this._elevationStep;

            const readTile = (x, y, z) => {
                if (x < 0 || x >= w || y < 0 || y >= h) return 0;
                return data[(z * h + y) * w + x] || 0;
            };

            const isWallSideAt = (x, y) => {
                const t0 = readTile(x, y, 0);
                const t1 = readTile(x, y, 1);
                return Tilemap.isWallSideTile(t0) || Tilemap.isWallSideTile(t1);
            };

            const getWallSideKindAt = (x, y) => {
                const t1 = readTile(x, y, 1);
                if (Tilemap.isWallSideTile(t1)) return Tilemap.getAutotileKind(t1);
                const t0 = readTile(x, y, 0);
                if (Tilemap.isWallSideTile(t0)) return Tilemap.getAutotileKind(t0);
                if (Tilemap.isWallTopTile(t0) || Tilemap.isRoofTile(t0)) {
                    return Tilemap.getAutotileKind(t0) + 8;
                }
                return -1;
            };

            // Varredura de cada coluna X do Sul (h - 1) para o Norte (0)
            for (let x = 0; x < w; x++) {
                let currentBaseZ = 0.0;
                let y = h - 1;
                while (y >= 0) {
                    const idx = y * w + x;
                    const t0 = readTile(x, y, 0);
                    const regionId = readTile(x, y, 5);

                    // PRECEDÊNCIA ESTRITA R1: Region ID dita diretamente a elevação
                    if (regionId > 0) {
                        const cellZ = this.getRegionElevation(regionId);
                        this._staticHeightGrid[idx] = cellZ;
                        currentBaseZ = cellZ;
                        const wk = getWallSideKindAt(x, y);
                        if (wk >= 0) this._staticWallSideKindGrid[idx] = wk;
                        y--;
                        continue;
                    }

                    if (isWallSideAt(x, y)) {
                        const yBottom = y;
                        const sideKind = getWallSideKindAt(x, y);
                        while (y >= 0 && isWallSideAt(x, y)) {
                            const regMid = readTile(x, y, 5);
                            if (regMid > 0) break;
                            y--;
                        }
                        const yTop = y + 1;
                        const stackHeightK = yBottom - yTop + 1;

                        for (let yk = yBottom; yk >= yTop; yk--) {
                            const kIdx = yk * w + x;
                            const regK = readTile(x, yk, 5);
                            if (regK > 0) {
                                this._staticHeightGrid[kIdx] = this.getRegionElevation(regK);
                            } else {
                                const stepIndex = yBottom - yk + 1;
                                const frac = stepIndex / (stackHeightK + 1);
                                this._staticHeightGrid[kIdx] = currentBaseZ + Number((stackHeightK * step * frac).toFixed(2));
                            }
                            this._staticWallSideKindGrid[kIdx] = sideKind;
                        }

                        currentBaseZ += stackHeightK * step;
                        continue;
                    }

                    if (currentBaseZ > 0 && !Tilemap.isWallTopTile(t0) && !Tilemap.isRoofTile(t0)) {
                        if (y + 1 < h && !isWallSideAt(x, y + 1) && !Tilemap.isWallTopTile(readTile(x, y + 1, 0))) {
                            currentBaseZ = 0.0;
                        }
                    }

                    let cellZ = currentBaseZ;
                    if (Tilemap.isWaterTile(t0) && !Tilemap.isWaterfallTile(t0)) {
                        cellZ -= 0.22;
                    }
                    this._staticHeightGrid[idx] = cellZ;
                    const wk = getWallSideKindAt(x, y);
                    if (wk >= 0) this._staticWallSideKindGrid[idx] = wk;
                    y--;
                }
            }
        }

        isLoopHorizontal() {
            return ($gameMap && typeof $gameMap.isLoopHorizontal === "function" && $gameMap.isLoopHorizontal()) || this.isProceduralMapActive();
        }

        isLoopVertical() {
            return ($gameMap && typeof $gameMap.isLoopVertical === "function" && $gameMap.isLoopVertical()) || this.isProceduralMapActive();
        }

        getWrappedXY(realX, realY) {
            if (!$dataMap) return { x: 0, y: 0 };
            const w = $dataMap.width || 1;
            const h = $dataMap.height || 1;
            const loopH = this.isLoopHorizontal();
            const loopV = this.isLoopVertical();
            const ix = Math.floor(realX);
            const iy = Math.floor(realY);
            const x = loopH ? (((ix % w) + w) % w) : Math.max(0, Math.min(w - 1, ix));
            const y = loopV ? (((iy % h) + h) % h) : Math.max(0, Math.min(h - 1, iy));
            return { x, y };
        }

        readMapTile(realX, realY, z) {
            if (!$dataMap || !$dataMap.data) return 0;
            const w = $dataMap.width;
            const h = $dataMap.height;
            const ix = Math.floor(realX);
            const iy = Math.floor(realY);
            if (this.isLoopHorizontal() || this.isLoopVertical()) {
                const wx = this.isLoopHorizontal() ? (((ix % w) + w) % w) : ix;
                const wy = this.isLoopVertical() ? (((iy % h) + h) % h) : iy;
                if (wx < 0 || wx >= w || wy < 0 || wy >= h) return 0;
                return $dataMap.data[(z * h + wy) * w + wx] || 0;
            } else {
                if (ix < 0 || ix >= w || iy < 0 || iy >= h) return 0;
                return $dataMap.data[(z * h + iy) * w + ix] || 0;
            }
        }

        /**
         * Retorna a elevação Z 3D exata para uma coordenada global real (realX, realY).
         */
        getElevationAt(realX, realY) {
            this.prepareForMap();
            const ix = Math.floor(realX);
            const iy = Math.floor(realY);
            const w = this._mapWidth || ($dataMap ? $dataMap.width : 0);
            const h = this._mapHeight || ($dataMap ? $dataMap.height : 0);
            if (!this.isLoopHorizontal() && (ix < 0 || ix >= w)) return 0.0;
            if (!this.isLoopVertical() && (iy < 0 || iy >= h)) return 0.0;

            const regId = this.readMapTile(realX, realY, 5);
            if (regId > 0) {
                return this.getRegionElevation(regId);
            }

            if (globalThis.LocalMapGenerator && typeof globalThis.LocalMapGenerator.getHeightAt === "function" && globalThis.LocalMapGenerator.isActive?.()) {
                const hLocal = globalThis.LocalMapGenerator.getHeightAt(realX, realY);
                return Math.round((hLocal / 8.0) * 2) * 0.5;
            }
            if (globalThis.OverworldChunkManager && typeof globalThis.OverworldChunkManager.getHeightAt === "function" && globalThis.OverworldChunkManager.isActive?.()) {
                const hOver = globalThis.OverworldChunkManager.getHeightAt(realX, realY);
                if (hOver < 0) return -0.25;
                return Math.floor(hOver / 140.0) * 0.5;
            }
            if (globalThis.WorldClimateEngine && typeof globalThis.WorldClimateEngine.sampleAt === "function" && globalThis.WorldClimateEngine.isActive?.()) {
                const sample = globalThis.WorldClimateEngine.sampleAt(realX, realY);
                if (sample) {
                    if (sample.scarType === 1) return -2.5;
                    if (sample.height < 0) return -0.25;
                    return Math.floor(sample.height / 140.0) * 0.5;
                }
            }

            if (this.isProceduralMapActive() && globalThis.PerlinNoiseGenerator && typeof globalThis.PerlinNoiseGenerator.getEnvironmentDataForCoords === "function") {
                const env = globalThis.PerlinNoiseGenerator.getEnvironmentDataForCoords(Math.floor(realX), Math.floor(realY));
                if (env) {
                    if (env.isRiver || env.height < 0) return -0.25;
                    if (typeof env.tier === "number") return env.tier * 0.75;
                    return Math.max(0, Math.floor(env.height / 160) * 0.5);
                }
            }

            this.prepareForMap();
            if (!this._staticHeightGrid || !this._mapWidth || !this._mapHeight) {
                return 0.0;
            }
            const { x, y } = this.getWrappedXY(realX, realY);
            return this._staticHeightGrid[y * this._mapWidth + x] || 0.0;
        }

        /**
         * R2: Lê a Terrain Tag (0 a 7) definida no Tileset para a célula (x, y).
         */
        getTerrainTagAt(realX, realY) {
            const ix = Math.floor(realX);
            const iy = Math.floor(realY);
            const w = ($dataMap ? $dataMap.width : this._mapWidth) || 1;
            const h = ($dataMap ? $dataMap.height : this._mapHeight) || 1;
            if (!this.isLoopHorizontal() && (ix < 0 || ix >= w)) return 0;
            if (!this.isLoopVertical() && (iy < 0 || iy >= h)) return 0;

            const { x, y } = this.getWrappedXY(realX, realY);
            if ($gameMap && typeof $gameMap.terrainTag === "function") {
                return $gameMap.terrainTag(x, y);
            }
            if ($dataMap && $dataMap.data) {
                const tileset = ($gameMap && typeof $gameMap.tileset === "function")
                    ? $gameMap.tileset()
                    : (($dataTilesets && $dataMap.tilesetId) ? $dataTilesets[$dataMap.tilesetId] : null);
                if (tileset && tileset.flags) {
                    for (let z = 3; z >= 0; z--) {
                        const tileId = $dataMap.data[(z * h + y) * w + x] || 0;
                        const tag = tileset.flags[tileId] >> 12;
                        if (tag > 0) return tag;
                    }
                }
            }
            return 0;
        }

        /**
         * Resolve as cotas de fronteira zStart e zEnd de uma extensão linear contínua de rampa ou escada.
         * Garante encaixe perfeito (zero vão) com platôs em qualquer altitude e bloqueio de penhascos.
         */
        _resolveRunBoundaries(zStartNeighbor, zEndNeighbor, L, nominalZ, hasExplicitRegion, isRisingTowardStart) {
            const step = this._elevationStep;
            const maxRunDelta = L * Math.max(0.5, step) * 2.0;

            let zStartBoundary;
            let zEndBoundary;

            if (zStartNeighbor === null && zEndNeighbor === null) {
                const base = nominalZ;
                zStartBoundary = isRisingTowardStart ? (base + step) : base;
                zEndBoundary = isRisingTowardStart ? base : (base + step);
            } else if (zStartNeighbor === null) {
                // Conectado apenas no End: o End DEVE manter a cota exata do vizinho zEndNeighbor!
                zEndBoundary = zEndNeighbor;
                zStartBoundary = isRisingTowardStart ? (zEndNeighbor + step) : (zEndNeighbor - step);
            } else if (zEndNeighbor === null) {
                // Conectado apenas no Start: o Start DEVE manter a cota exata do vizinho zStartNeighbor!
                zStartBoundary = zStartNeighbor;
                zEndBoundary = isRisingTowardStart ? (zStartNeighbor - step) : (zStartNeighbor + step);
            } else {
                const endpointDelta = Math.abs(zStartNeighbor - zEndNeighbor);
                if (endpointDelta <= maxRunDelta) {
                    if (zStartNeighbor === zEndNeighbor) {
                        const base = hasExplicitRegion ? nominalZ : zStartNeighbor;
                        zStartBoundary = isRisingTowardStart ? (base + step) : base;
                        zEndBoundary = isRisingTowardStart ? base : (base + step);
                    } else {
                        zStartBoundary = zStartNeighbor;
                        zEndBoundary = zEndNeighbor;
                    }
                } else {
                    // Desnível maior que a capacidade de transposição da rampa (ex: penhasco de 50m)
                    const diffStart = Math.abs(zStartNeighbor - nominalZ);
                    const diffEnd = Math.abs(zEndNeighbor - nominalZ);
                    if (diffStart <= maxRunDelta && diffEnd > maxRunDelta) {
                        zStartBoundary = zStartNeighbor;
                        zEndBoundary = isRisingTowardStart ? (zStartNeighbor - step) : (zStartNeighbor + step);
                    } else if (diffEnd <= maxRunDelta && diffStart > maxRunDelta) {
                        zEndBoundary = zEndNeighbor;
                        zStartBoundary = isRisingTowardStart ? (zEndNeighbor + step) : (zEndNeighbor - step);
                    } else {
                        const base = (zStartNeighbor < zEndNeighbor) ? zStartNeighbor : zEndNeighbor;
                        zStartBoundary = isRisingTowardStart ? (base + step) : base;
                        zEndBoundary = isRisingTowardStart ? base : (base + step);
                    }
                }
            }

            return { zStartBoundary, zEndBoundary };
        }

        /**
         * R2: Classificação Topológica de Formas e resolução dos 4 vértices do tile.
         */
        getCellGeometry(realX, realY) {
            this.prepareForMap();
            const maxW = ($dataMap ? $dataMap.width : this._mapWidth) || 1;
            const maxH = ($dataMap ? $dataMap.height : this._mapHeight) || 1;
            const ix = Math.floor(realX);
            const iy = Math.floor(realY);
            if (!this.isLoopHorizontal() && (ix < 0 || ix >= maxW)) {
                return {
                    tag: 0, baseZ: 0, zNW: 0, zNE: 0, zSE: 0, zSW: 0,
                    zLow: 0, zHigh: 0, isSlope: false, isSlopeNS: false, isSlopeEW: false,
                    isStairs: false, isStairsNS: false, isStairsEW: false, stairDir: "N",
                    isWall: false, isBridge: false
                };
            }
            if (!this.isLoopVertical() && (iy < 0 || iy >= maxH)) {
                return {
                    tag: 0, baseZ: 0, zNW: 0, zNE: 0, zSE: 0, zSW: 0,
                    zLow: 0, zHigh: 0, isSlope: false, isSlopeNS: false, isSlopeEW: false,
                    isStairs: false, isStairsNS: false, isStairsEW: false, stairDir: "N",
                    isWall: false, isBridge: false
                };
            }

            const { x: rx, y: ry } = this.getWrappedXY(realX, realY);
            const nominalZ = this.getElevationAt(rx, ry);
            const tag = this.getTerrainTagAt(rx, ry);
            const cfg = this._terrainTagConfig;

            let isSlope = false;
            let isSlopeNS = false;
            let isSlopeEW = false;
            let isStairs = false;
            let isStairsNS = false;
            let isStairsEW = false;
            let stairDir = "N";
            let isWall = false;
            let isBridge = false;

            let zNW = nominalZ;
            let zNE = nominalZ;
            let zSE = nominalZ;
            let zSW = nominalZ;
            let zLow = nominalZ;
            let zHigh = nominalZ;

            if (tag === cfg.wall) {
                isWall = true;
            } else if (tag === cfg.bridge) {
                isBridge = true;
            } else if (tag === cfg.stairs) {
                isStairs = true;
                const zN = (ry > 0 || this.isLoopVertical()) ? this.getElevationAt(rx, ry - 1) : nominalZ;
                const zS = (ry < maxH - 1 || this.isLoopVertical()) ? this.getElevationAt(rx, ry + 1) : nominalZ;
                const zE = (rx < maxW - 1 || this.isLoopHorizontal()) ? this.getElevationAt(rx + 1, ry) : nominalZ;
                const zW = (rx > 0 || this.isLoopHorizontal()) ? this.getElevationAt(rx - 1, ry) : nominalZ;

                if (Math.abs(zN - zS) >= Math.abs(zE - zW)) {
                    isStairsNS = true;
                    let yStart = ry;
                    while (yStart > 0) {
                        const prevTag = this.getTerrainTagAt(rx, yStart - 1);
                        if (prevTag === cfg.stairs) yStart--;
                        else break;
                    }
                    let yEnd = ry;
                    while (yEnd < maxH - 1) {
                        const nextTag = this.getTerrainTagAt(rx, yEnd + 1);
                        if (nextTag === cfg.stairs) yEnd++;
                        else break;
                    }

                    const zNorthNeighbor = (yStart > 0) ? this.getElevationAt(rx, yStart - 1) : null;
                    const zSouthNeighbor = (yEnd < maxH - 1) ? this.getElevationAt(rx, yEnd + 1) : null;
                    const hasExplicitRegion = (this.readMapTile(rx, ry, 5) > 0);
                    const L = yEnd - yStart + 1;
                    const isRisingNorth = (zNorthNeighbor !== null && zSouthNeighbor !== null)
                        ? (zNorthNeighbor >= zSouthNeighbor)
                        : (zNorthNeighbor !== null ? (zNorthNeighbor >= nominalZ) : (nominalZ >= zSouthNeighbor));

                    const { zStartBoundary: zNorthBoundary, zEndBoundary: zSouthBoundary } =
                        this._resolveRunBoundaries(zNorthNeighbor, zSouthNeighbor, L, nominalZ, hasExplicitRegion, isRisingNorth);
                    stairDir = (zNorthBoundary >= zSouthBoundary) ? "N" : "S";

                    const k = ry - yStart;
                    const cellZNorth = zNorthBoundary + (k / L) * (zSouthBoundary - zNorthBoundary);
                    const cellZSouth = zNorthBoundary + ((k + 1) / L) * (zSouthBoundary - zNorthBoundary);

                    zNW = cellZNorth; zNE = cellZNorth;
                    zSW = cellZSouth; zSE = cellZSouth;
                    zHigh = Math.max(cellZNorth, cellZSouth);
                    zLow = Math.min(cellZNorth, cellZSouth);
                } else {
                    isStairsEW = true;
                    let xStart = rx;
                    while (xStart > 0) {
                        const prevTag = this.getTerrainTagAt(xStart - 1, ry);
                        if (prevTag === cfg.stairs) xStart--;
                        else break;
                    }
                    let xEnd = rx;
                    while (xEnd < maxW - 1) {
                        const nextTag = this.getTerrainTagAt(xEnd + 1, ry);
                        if (nextTag === cfg.stairs) xEnd++;
                        else break;
                    }

                    const zWestNeighbor = (xStart > 0) ? this.getElevationAt(xStart - 1, ry) : null;
                    const zEastNeighbor = (xEnd < maxW - 1) ? this.getElevationAt(xEnd + 1, ry) : null;
                    const hasExplicitRegion = (this.readMapTile(rx, ry, 5) > 0);
                    const L = xEnd - xStart + 1;
                    const isRisingWest = (zWestNeighbor !== null && zEastNeighbor !== null)
                        ? (zWestNeighbor >= zEastNeighbor)
                        : (zWestNeighbor !== null ? (zWestNeighbor >= nominalZ) : (nominalZ >= zEastNeighbor));

                    const { zStartBoundary: zWestBoundary, zEndBoundary: zEastBoundary } =
                        this._resolveRunBoundaries(zWestNeighbor, zEastNeighbor, L, nominalZ, hasExplicitRegion, isRisingWest);
                    stairDir = (zEastBoundary >= zWestBoundary) ? "E" : "W";

                    const k = rx - xStart;
                    const cellZWest = zWestBoundary + (k / L) * (zEastBoundary - zWestBoundary);
                    const cellZEast = zWestBoundary + ((k + 1) / L) * (zEastBoundary - zWestBoundary);

                    zNW = cellZWest; zSW = cellZWest;
                    zNE = cellZEast; zSE = cellZEast;
                    zHigh = Math.max(cellZWest, cellZEast);
                    zLow = Math.min(cellZWest, cellZEast);
                }
            } else if (tag === cfg.rampNS || tag === cfg.rampSouth) {
                isSlope = true;
                isSlopeNS = true;

                let yStart = ry;
                while (yStart > 0) {
                    const prevTag = this.getTerrainTagAt(rx, yStart - 1);
                    if (prevTag === cfg.rampNS || prevTag === cfg.rampSouth) yStart--;
                    else break;
                }
                let yEnd = ry;
                while (yEnd < maxH - 1) {
                    const nextTag = this.getTerrainTagAt(rx, yEnd + 1);
                    if (nextTag === cfg.rampNS || nextTag === cfg.rampSouth) yEnd++;
                    else break;
                }

                const zNorthNeighbor = (yStart > 0) ? this.getElevationAt(rx, yStart - 1) : null;
                const zSouthNeighbor = (yEnd < maxH - 1) ? this.getElevationAt(rx, yEnd + 1) : null;
                const hasExplicitRegion = (this.readMapTile(rx, ry, 5) > 0);

                let slopesNorth = true;
                if (tag === cfg.rampSouth) {
                    slopesNorth = false;
                } else if (tag === cfg.rampNS) {
                    if (zSouthNeighbor !== null && zNorthNeighbor !== null) {
                        if (zSouthNeighbor > zNorthNeighbor) {
                            slopesNorth = false;
                        } else if (zSouthNeighbor === zNorthNeighbor) {
                            const zStartCell = this.getElevationAt(rx, yStart);
                            const zEndCell = this.getElevationAt(rx, yEnd);
                            if (zEndCell > zStartCell) slopesNorth = false;
                        }
                    } else if (zSouthNeighbor !== null) {
                        slopesNorth = (nominalZ >= zSouthNeighbor);
                    } else if (zNorthNeighbor !== null) {
                        slopesNorth = (zNorthNeighbor >= nominalZ);
                    }
                }

                const L = yEnd - yStart + 1;
                const { zStartBoundary: zNorthBoundary, zEndBoundary: zSouthBoundary } =
                    this._resolveRunBoundaries(zNorthNeighbor, zSouthNeighbor, L, nominalZ, hasExplicitRegion, slopesNorth);

                const k = ry - yStart;
                const cellZNorth = zNorthBoundary + (k / L) * (zSouthBoundary - zNorthBoundary);
                const cellZSouth = zNorthBoundary + ((k + 1) / L) * (zSouthBoundary - zNorthBoundary);

                zNW = cellZNorth; zNE = cellZNorth;
                zSW = cellZSouth; zSE = cellZSouth;
                zHigh = Math.max(cellZNorth, cellZSouth);
                zLow = Math.min(cellZNorth, cellZSouth);
            } else if (tag === cfg.rampEW || tag === cfg.rampWest) {
                isSlope = true;
                isSlopeEW = true;

                let xStart = rx;
                while (xStart > 0) {
                    const prevTag = this.getTerrainTagAt(xStart - 1, ry);
                    if (prevTag === cfg.rampEW || prevTag === cfg.rampWest) xStart--;
                    else break;
                }
                let xEnd = rx;
                while (xEnd < maxW - 1) {
                    const nextTag = this.getTerrainTagAt(xEnd + 1, ry);
                    if (nextTag === cfg.rampEW || nextTag === cfg.rampWest) xEnd++;
                    else break;
                }

                const zWestNeighbor = (xStart > 0) ? this.getElevationAt(xStart - 1, ry) : null;
                const zEastNeighbor = (xEnd < maxW - 1) ? this.getElevationAt(xEnd + 1, ry) : null;
                const hasExplicitRegion = (this.readMapTile(rx, ry, 5) > 0);

                let slopesEast = true;
                if (tag === cfg.rampWest) {
                    slopesEast = false;
                } else if (tag === cfg.rampEW) {
                    if (zWestNeighbor !== null && zEastNeighbor !== null) {
                        if (zWestNeighbor > zEastNeighbor) {
                            slopesEast = false;
                        } else if (zWestNeighbor === zEastNeighbor) {
                            const zStartCell = this.getElevationAt(xStart, ry);
                            const zEndCell = this.getElevationAt(xEnd, ry);
                            if (zStartCell > zEndCell) slopesEast = false;
                        }
                    } else if (zWestNeighbor !== null) {
                        slopesEast = (nominalZ >= zWestNeighbor);
                    } else if (zEastNeighbor !== null) {
                        slopesEast = (zEastNeighbor >= nominalZ);
                    }
                }

                const L = xEnd - xStart + 1;
                const isRisingWest = !slopesEast;
                const { zStartBoundary: zWestBoundary, zEndBoundary: zEastBoundary } =
                    this._resolveRunBoundaries(zWestNeighbor, zEastNeighbor, L, nominalZ, hasExplicitRegion, isRisingWest);

                const k = rx - xStart;
                const cellZWest = zWestBoundary + (k / L) * (zEastBoundary - zWestBoundary);
                const cellZEast = zWestBoundary + ((k + 1) / L) * (zEastBoundary - zWestBoundary);

                zNW = cellZWest; zSW = cellZWest;
                zNE = cellZEast; zSE = cellZEast;
                zHigh = Math.max(cellZWest, cellZEast);
                zLow = Math.min(cellZWest, cellZEast);
            }

            return {
                tag,
                baseZ: nominalZ,
                zNW, zNE, zSE, zSW,
                zLow, zHigh,
                isSlope, isSlopeNS, isSlopeEW,
                isStairs, isStairsNS, isStairsEW, stairDir,
                isWall, isBridge
            };
        }

        /**
         * R4: Interpolação contínua da cota Z dentro de uma célula em rampa ou escada.
         */
        getContinuousElevationAt(realX, realY) {
            const ix = Math.floor(realX);
            const iy = Math.floor(realY);
            const u = Math.max(0, Math.min(1, realX - ix));
            const v = Math.max(0, Math.min(1, realY - iy));

            const geom = this.getCellGeometry(ix, iy);
            if (!geom.isSlope && !geom.isStairs) {
                return geom.baseZ;
            }

            const zNorth = geom.zNW + u * (geom.zNE - geom.zNW);
            const zSouth = geom.zSW + u * (geom.zSE - geom.zSW);
            return zNorth + v * (zSouth - zNorth);
        }

        /**
         * R4: Cálculo de navegabilidade contínua em rampas e escadas.
         * Retorna true/false se a topologia dita a transposição, ou null para fallback 2D nativo.
         */
        checkPassability(x, y, nx, ny, d) {
            this.prepareForMap();
            const geomCurr = this.getCellGeometry(x, y);
            const geomNext = this.getCellGeometry(nx, ny);

            // 1. Parede vertical forçada
            if (geomNext.isWall) {
                return false;
            }

            // 2. Ponte suspensa
            if (geomCurr.isBridge || geomNext.isBridge) {
                const deltaBridge = Math.abs(geomCurr.baseZ - geomNext.baseZ);
                if (deltaBridge <= this._elevationStep * 1.01) {
                    return true;
                }
                return false;
            }

            // Determina a cota de saída de (x, y) e de entrada em (nx, ny)
            let exitH = geomCurr.baseZ;
            let entryH = geomNext.baseZ;

            if (d === 8) { // Norte
                exitH = (geomCurr.zNW + geomCurr.zNE) * 0.5;
                entryH = (geomNext.zSW + geomNext.zSE) * 0.5;
            } else if (d === 2) { // Sul
                exitH = (geomCurr.zSW + geomCurr.zSE) * 0.5;
                entryH = (geomNext.zNW + geomNext.zNE) * 0.5;
            } else if (d === 6) { // Leste
                exitH = (geomCurr.zNE + geomCurr.zSE) * 0.5;
                entryH = (geomNext.zNW + geomNext.zSW) * 0.5;
            } else if (d === 4) { // Oeste
                exitH = (geomCurr.zNW + geomCurr.zSW) * 0.5;
                entryH = (geomNext.zNE + geomNext.zSE) * 0.5;
            } else if (d === 7) { // Noroeste
                exitH = geomCurr.zNW;
                entryH = geomNext.zSE;
            } else if (d === 9) { // Nordeste
                exitH = geomCurr.zNE;
                entryH = geomNext.zSW;
            } else if (d === 1) { // Sudoeste
                exitH = geomCurr.zSW;
                entryH = geomNext.zNE;
            } else if (d === 3) { // Sudeste
                exitH = geomCurr.zSE;
                entryH = geomNext.zNW;
            }

            const boundaryDelta = Math.abs(exitH - entryH);
            const maxStepThreshold = Math.max(0.05, Math.min(0.35, this._elevationStep * 0.6));

            // Se o desnível na fronteira entre as células for maior que o degrau máximo, é penhasco: BLOQUEIA
            if (boundaryDelta > maxStepThreshold) {
                return false;
            }

            // Verificação de movimento lateral para fora de rampas ou escadas em desnível:
            // Rampa ou Escada NS com movimento Leste/Oeste (d=4 ou d=6)
            const isNS_Curr = geomCurr.isSlopeNS || geomCurr.isStairsNS;
            const isNS_Next = geomNext.isSlopeNS || geomNext.isStairsNS;
            if ((d === 4 || d === 6) && (isNS_Curr || isNS_Next)) {
                if (isNS_Curr && isNS_Next &&
                    Math.abs(geomCurr.zHigh - geomNext.zHigh) <= 0.05 &&
                    Math.abs(geomCurr.zLow - geomNext.zLow) <= 0.05) {
                    return true;
                }
                const slopeGeom = isNS_Curr ? geomCurr : geomNext;
                const otherGeom = isNS_Curr ? geomNext : geomCurr;
                const otherRef = (isNS_Curr && isNS_Next) ? otherGeom.zHigh : (typeof otherGeom.baseZ === "number" ? otherGeom.baseZ : otherGeom.zLow);
                const maxSideDelta = Math.max(
                    Math.abs(slopeGeom.zHigh - otherRef),
                    Math.abs(slopeGeom.zLow - otherRef)
                );
                if (maxSideDelta > this._elevationStep * 0.5) {
                    return false;
                }
            }

            // Rampa ou Escada EW com movimento Norte/Sul (d=2 ou d=8)
            const isEW_Curr = geomCurr.isSlopeEW || geomCurr.isStairsEW;
            const isEW_Next = geomNext.isSlopeEW || geomNext.isStairsEW;
            if ((d === 2 || d === 8) && (isEW_Curr || isEW_Next)) {
                if (isEW_Curr && isEW_Next &&
                    Math.abs(geomCurr.zHigh - geomNext.zHigh) <= 0.05 &&
                    Math.abs(geomCurr.zLow - geomNext.zLow) <= 0.05) {
                    return true;
                }
                const slopeGeom = isEW_Curr ? geomCurr : geomNext;
                const otherGeom = isEW_Curr ? geomNext : geomCurr;
                const otherRef = (isEW_Curr && isEW_Next) ? otherGeom.zHigh : (typeof otherGeom.baseZ === "number" ? otherGeom.baseZ : otherGeom.zLow);
                const maxSideDelta = Math.max(
                    Math.abs(slopeGeom.zHigh - otherRef),
                    Math.abs(slopeGeom.zLow - otherRef)
                );
                if (maxSideDelta > this._elevationStep * 0.5) {
                    return false;
                }
            }

            // Se uma das células for rampa ou escada e a cota na fronteira coincide perfeitamente,
            // a geometria contínua 3D garante a transponibilidade suave
            if (geomCurr.isSlope || geomNext.isSlope || geomCurr.isStairs || geomNext.isStairs) {
                return true;
            }

            // Para terrenos planos sem desnível, delega para a colisão nativa 2D do RMMZ
            return null;
        }

        getWallSideTileIdForStep(hx, hy, stepIndex, totalSteps) {
            const t0 = this.readMapTile(hx, hy, 0);
            const t1 = this.readMapTile(hx, hy, 1);

            if (Tilemap.isWaterfallTile(t0) || Tilemap.isWaterfallTile(t1)) {
                const wfTile = Tilemap.isWaterfallTile(t1) ? t1 : t0;
                const wfKind = Tilemap.getAutotileKind(wfTile);
                return Tilemap.makeAutotileId(wfKind, 0);
            }

            let sideKind = -1;
            if (Tilemap.isWallSideTile(t1)) {
                sideKind = Tilemap.getAutotileKind(t1);
            } else if (Tilemap.isWallSideTile(t0)) {
                sideKind = Tilemap.getAutotileKind(t0);
            } else if (Tilemap.isWallTopTile(t0) || Tilemap.isRoofTile(t0)) {
                sideKind = Tilemap.getAutotileKind(t0) + 8;
            } else if (Tilemap.isWallTopTile(t1) || Tilemap.isRoofTile(t1)) {
                sideKind = Tilemap.getAutotileKind(t1) + 8;
            } else if (this._staticWallSideKindGrid) {
                const { x, y } = this.getWrappedXY(hx, hy);
                sideKind = this._staticWallSideKindGrid[y * this._mapWidth + x];
            }

            if (sideKind < 0) {
                sideKind = Math.floor((Tilemap.TILE_ID_A4 - Tilemap.TILE_ID_A1) / 48) + 8;
            }

            let wallShape = 0;
            if (stepIndex === 0) wallShape |= 2;
            if (stepIndex === totalSteps - 1) wallShape |= 8;

            return Tilemap.makeAutotileId(sideKind, wallShape);
        }
    }

    // =========================================================================
    // SUBSISTEMA 3: VoxelChunkMeshBuilder
    // Construção de Chunks 16x16 no espaço cartesiano real (Cx_real, Cy_real),
    // face-culling, extração de árvores/objetos B..E e Cache LRU com dispose().
    // =========================================================================
    class VoxelChunkMeshBuilder {
        constructor(atlas, topology) {
            this.atlas = atlas;
            this.topology = topology;
            this.chunkCache = new Map(); // key "cx,cy" -> { cx, cy, mesh, propsGroup, lastUsedFrame }
            this._frameCounter = 0;
        }

        getPlayerRealCoords() {
            if (typeof globalThis._realPlayerX === "number" && typeof globalThis._realPlayerY === "number" &&
                (globalThis._realPlayerX !== 0 || globalThis._realPlayerY !== 0)) {
                // Preserva a parte fracionária do movimento suave do jogador
                const fracX = $gamePlayer ? ($gamePlayer._realX - Math.floor($gamePlayer._realX)) : 0;
                const fracY = $gamePlayer ? ($gamePlayer._realY - Math.floor($gamePlayer._realY)) : 0;
                return {
                    x: Math.floor(globalThis._realPlayerX) + fracX,
                    y: Math.floor(globalThis._realPlayerY) + fracY
                };
            }
            return {
                x: $gamePlayer ? $gamePlayer._realX : 0,
                y: $gamePlayer ? $gamePlayer._realY : 0
            };
        }

        updateActiveChunks(scene, radiusChunks, sunDir, cameraAzimuth) {
            if (!$dataMap || !$gameMap) return { originX: 0, originY: 0, terrainMeshes: [] };
            this._frameCounter++;

            const playerReal = this.getPlayerRealCoords();
            const centerCx = Math.floor(playerReal.x / CHUNK_SIZE);
            const centerCy = Math.floor(playerReal.y / CHUNK_SIZE);

            // Floating Origin ancorado no canto do chunk central do jogador
            const originX = centerCx * CHUNK_SIZE;
            const originY = centerCy * CHUNK_SIZE;

            const isLoopH = $gameMap.isLoopHorizontal() || this.topology.isProceduralMapActive();
            const isLoopV = $gameMap.isLoopVertical() || this.topology.isProceduralMapActive();
            const maxCx = Math.ceil($dataMap.width / CHUNK_SIZE);
            const maxCy = Math.ceil($dataMap.height / CHUNK_SIZE);

            const activeKeys = new Set();
            const terrainMeshes = [];

            for (let dy = -radiusChunks; dy <= radiusChunks; dy++) {
                for (let dx = -radiusChunks; dx <= radiusChunks; dx++) {
                    const cx = centerCx + dx;
                    const cy = centerCy + dy;

                    if (!isLoopH && (cx < 0 || cx >= maxCx)) continue;
                    if (!isLoopV && (cy < 0 || cy >= maxCy)) continue;

                    const key = `${cx},${cy}`;
                    activeKeys.add(key);

                    const currentSig = this._computeChunkSignature(cx, cy);
                    let entry = this.chunkCache.get(key);
                    if (entry && entry.tileSignature !== currentSig) {
                        this.disposeChunk(key, scene);
                        entry = null;
                    }
                    if (!entry) {
                        entry = this._buildChunkEntry(cx, cy, currentSig);
                        this.chunkCache.set(key, entry);
                        scene.add(entry.group);
                    } else {
                        // Reinsere no final do Map para manter a ordem LRU
                        this.chunkCache.delete(key);
                        this.chunkCache.set(key, entry);
                    }

                    entry.lastUsedFrame = this._frameCounter;
                    entry.group.visible = true;
                    entry.group.position.set(
                        cx * CHUNK_SIZE - originX,
                        0,
                        cy * CHUNK_SIZE - originY
                    );

                    // Atualiza orientação dos billboards de árvores/objetos B..E do chunk
                    this._updateChunkPropsOrientation(entry, cameraAzimuth, sunDir);
                    if (entry.terrainMesh) {
                        terrainMeshes.push(entry.terrainMesh);
                    }
                }
            }

            // Oculta chunks fora do raio imediato e executa despejo LRU com dispose() (Blindagem 5)
            for (const [key, entry] of this.chunkCache.entries()) {
                if (!activeKeys.has(key)) {
                    entry.group.visible = false;
                }
            }

            while (this.chunkCache.size > MAX_LRU_CHUNKS) {
                const oldestKey = this.chunkCache.keys().next().value;
                if (activeKeys.has(oldestKey)) break;
                this.disposeChunk(oldestKey, scene);
            }

            return { originX, originY, terrainMeshes };
        }

        _computeChunkSignature(cx, cy) {
            const bx = cx * CHUNK_SIZE;
            const by = cy * CHUNK_SIZE;
            const tA = this.topology.readMapTile(bx, by, 0);
            const tB = this.topology.readMapTile(bx + 8, by + 8, 0);
            const tC = this.topology.readMapTile(bx + 15, by + 15, 0);
            const tD = this.topology.readMapTile(bx + 4, by + 12, 1);
            const tE = this.topology.readMapTile(bx + 12, by + 4, 2);
            return ((tA * 31 + tB) * 31 + tC) * 31 + (tD ^ (tE << 4));
        }

        _buildChunkEntry(cx, cy, tileSignature = 0) {
            const positions = [];
            const normals = [];
            const uvs = [];
            const animTypes = [];
            const indices = [];
            let vertexCount = 0;

            const pushQuad = (
                x0, y0, z0,
                x1, y1, z1,
                x2, y2, z2,
                x3, y3, z3,
                nx, ny, nz,
                uvRect
            ) => {
                positions.push(
                    x0, y0, z0,
                    x1, y1, z1,
                    x2, y2, z2,
                    x3, y3, z3
                );
                normals.push(
                    nx, ny, nz,
                    nx, ny, nz,
                    nx, ny, nz,
                    nx, ny, nz
                );
                uvs.push(
                    uvRect.u0, uvRect.v1,
                    uvRect.u1, uvRect.v1,
                    uvRect.u1, uvRect.v0,
                    uvRect.u0, uvRect.v0
                );
                const aType = uvRect.animType || 0;
                animTypes.push(aType, aType, aType, aType);
                indices.push(
                    vertexCount, vertexCount + 2, vertexCount + 1,
                    vertexCount, vertexCount + 3, vertexCount + 2
                );
                vertexCount += 4;
            };

            const group = new THREE.Group();
            const propsList = [];
            const flags = $gameMap ? $gameMap.tilesetFlags() : [];
            const mapW = $dataMap.width;
            const mapH = $dataMap.height;
            const isLoopH = $gameMap.isLoopHorizontal() || this.topology.isProceduralMapActive();
            const isLoopV = $gameMap.isLoopVertical() || this.topology.isProceduralMapActive();

            for (let ly = 0; ly < CHUNK_SIZE; ly++) {
                for (let lx = 0; lx < CHUNK_SIZE; lx++) {
                    const rx = cx * CHUNK_SIZE + lx;
                    const ry = cy * CHUNK_SIZE + ly;

                    if (!isLoopH && (rx < 0 || rx >= mapW)) continue;
                    if (!isLoopV && (ry < 0 || ry >= mapH)) continue;

                    const geom = this.topology.getCellGeometry(rx, ry);
                    const zTop = geom.baseZ;
                    const t0 = this.topology.readMapTile(rx, ry, 0);
                    const t1 = this.topology.readMapTile(rx, ry, 1);
                    const t2 = this.topology.readMapTile(rx, ry, 2);
                    const t3 = this.topology.readMapTile(rx, ry, 3);
                    const baseTileId = t0 > 0 ? t0 : 2816;
                    const uv0 = this.atlas.getTileUVRect(baseTileId);

                    // 1. Face Superior: Degraus submétricos para escadarias, ou Quad inclinado/plano
                    if (geom.isStairs) {
                        const stairDir = geom.stairDir;
                        const nSteps = Math.max(2, Math.min(4, Math.round(Math.abs(geom.zHigh - geom.zLow) / 0.25))) || 2;
                        const deltaH = (geom.zHigh - geom.zLow) / nSteps;
                        const wallTileId = this.topology.getWallSideTileIdForStep(rx, ry, 0, nSteps);
                        const uvWall = this.atlas.getTileUVRect(wallTileId);

                        if (stairDir === "N") {
                            for (let k = 0; k < nSteps; k++) {
                                const yStart = ly + 1 - k / nSteps;
                                const yEnd = ly + 1 - (k + 1) / nSteps;
                                const hTread = geom.zLow + (k + 1) * deltaH;
                                const hRiserLow = geom.zLow + k * deltaH;
                                pushQuad(
                                    lx,     hTread, yEnd,
                                    lx + 1, hTread, yEnd,
                                    lx + 1, hTread, yStart,
                                    lx,     hTread, yStart,
                                    0, 1, 0,
                                    uv0
                                );
                                pushQuad(
                                    lx,     hTread,    yStart,
                                    lx + 1, hTread,    yStart,
                                    lx + 1, hRiserLow, yStart,
                                    lx,     hRiserLow, yStart,
                                    0, 0, 1,
                                    uvWall
                                );
                            }
                        } else if (stairDir === "S") {
                            for (let k = 0; k < nSteps; k++) {
                                const yStart = ly + k / nSteps;
                                const yEnd = ly + (k + 1) / nSteps;
                                const hTread = geom.zLow + (k + 1) * deltaH;
                                const hRiserLow = geom.zLow + k * deltaH;
                                pushQuad(
                                    lx,     hTread, yStart,
                                    lx + 1, hTread, yStart,
                                    lx + 1, hTread, yEnd,
                                    lx,     hTread, yEnd,
                                    0, 1, 0,
                                    uv0
                                );
                                pushQuad(
                                    lx + 1, hTread,    yStart,
                                    lx,     hTread,    yStart,
                                    lx,     hRiserLow, yStart,
                                    lx + 1, hRiserLow, yStart,
                                    0, 0, -1,
                                    uvWall
                                );
                            }
                        } else if (stairDir === "E") {
                            for (let k = 0; k < nSteps; k++) {
                                const xStart = lx + k / nSteps;
                                const xEnd = lx + (k + 1) / nSteps;
                                const hTread = geom.zLow + (k + 1) * deltaH;
                                const hRiserLow = geom.zLow + k * deltaH;
                                pushQuad(
                                    xStart, hTread, ly,
                                    xEnd,   hTread, ly,
                                    xEnd,   hTread, ly + 1,
                                    xStart, hTread, ly + 1,
                                    0, 1, 0,
                                    uv0
                                );
                                pushQuad(
                                    xStart, hTread,    ly,
                                    xStart, hTread,    ly + 1,
                                    xStart, hRiserLow, ly + 1,
                                    xStart, hRiserLow, ly,
                                    -1, 0, 0,
                                    uvWall
                                );
                            }
                        } else { // "W"
                            for (let k = 0; k < nSteps; k++) {
                                const xStart = lx + 1 - k / nSteps;
                                const xEnd = lx + 1 - (k + 1) / nSteps;
                                const hTread = geom.zLow + (k + 1) * deltaH;
                                const hRiserLow = geom.zLow + k * deltaH;
                                pushQuad(
                                    xEnd,   hTread, ly,
                                    xStart, hTread, ly,
                                    xStart, hTread, ly + 1,
                                    xEnd,   hTread, ly + 1,
                                    0, 1, 0,
                                    uv0
                                );
                                pushQuad(
                                    xStart, hTread,    ly + 1,
                                    xStart, hTread,    ly,
                                    xStart, hRiserLow, ly,
                                    xStart, hRiserLow, ly + 1,
                                    1, 0, 0,
                                    uvWall
                                );
                            }
                        }
                    } else {
                        // Normal geométrica exata para superfícies inclinadas ou planas
                        let nx = -(geom.zNE - geom.zNW);
                        let ny = 1.0;
                        let nz = -(geom.zSW - geom.zNW);
                        const nlen = Math.hypot(nx, ny, nz);
                        nx /= nlen; ny /= nlen; nz /= nlen;

                        pushQuad(
                            lx,     geom.zNW, ly,
                            lx + 1, geom.zNE, ly,
                            lx + 1, geom.zSE, ly + 1,
                            lx,     geom.zSW, ly + 1,
                            nx, ny, nz,
                            uv0
                        );

                        // 2. Sobreposição de Piso (Layer 1)
                        if (t1 > 0 && !Tilemap.isWallSideTile(t1)) {
                            const uv1 = this.atlas.getTileUVRect(t1);
                            pushQuad(
                                lx,     geom.zNW + 0.004, ly,
                                lx + 1, geom.zNE + 0.004, ly,
                                lx + 1, geom.zSE + 0.004, ly + 1,
                                lx,     geom.zSW + 0.004, ly + 1,
                                nx, ny, nz,
                                uv1
                            );
                        }
                    }

                    // 3. Objetos B..E nas camadas 2 e 3:
                    const propZ = this.topology.getContinuousElevationAt(rx + 0.5, ry + 0.92);
                    for (const upperTile of [t2, t3]) {
                        if (upperTile <= 0) continue;
                        const flag = flags[upperTile] || 0;
                        const isHigher = (flag & 0x10) !== 0;
                        const isImpassable = (flag & 0x0f) !== 0;

                        if (isHigher || isImpassable) {
                            const propObj = this._createPropBillboard(lx + 0.5, propZ, ly + 0.92, upperTile, isHigher);
                            if (propObj) {
                                group.add(propObj.group);
                                propsList.push(propObj);
                            }
                        } else {
                            const uvDecal = this.atlas.getTileUVRect(upperTile);
                            pushQuad(
                                lx,     geom.zNW + 0.008, ly,
                                lx + 1, geom.zNE + 0.008, ly,
                                lx + 1, geom.zSE + 0.008, ly + 1,
                                lx,     geom.zSW + 0.008, ly + 1,
                                0, 1, 0,
                                uvDecal
                            );
                        }
                    }

                    // 4. Paredes Verticais com Face-Culling e adaptação contínua de desnível
                    const neighbors = [
                        { nx: rx, ny: ry + 1, dir: "S" },
                        { nx: rx, ny: ry - 1, dir: "N" },
                        { nx: rx + 1, ny: ry, dir: "E" },
                        { nx: rx - 1, ny: ry, dir: "W" }
                    ];

                    for (const nb of neighbors) {
                        const geomNb = this.topology.getCellGeometry(nb.nx, nb.ny);
                        let hA0 = 0, hA1 = 0, hB0 = 0, hB1 = 0;

                        if (nb.dir === "S") {
                            hA0 = geom.zSW; hA1 = geom.zSE;
                            hB0 = geomNb.zNW; hB1 = geomNb.zNE;
                        } else if (nb.dir === "N") {
                            hA0 = geom.zNW; hA1 = geom.zNE;
                            hB0 = geomNb.zSW; hB1 = geomNb.zSE;
                        } else if (nb.dir === "E") {
                            hA0 = geom.zNE; hA1 = geom.zSE;
                            hB0 = geomNb.zNW; hB1 = geomNb.zSW;
                        } else if (nb.dir === "W") {
                            hA0 = geom.zNW; hA1 = geom.zSW;
                            hB0 = geomNb.zNE; hB1 = geomNb.zSE;
                        }

                        const dh0 = hA0 - hB0;
                        const dh1 = hA1 - hB1;
                        if (dh0 <= 0.01 && dh1 <= 0.01) continue;
                        if (geom.isBridge) continue; // Pontes suspensas não geram terra vertical abaixo

                        const maxDh = Math.max(dh0, dh1);
                        const steps = Math.max(1, Math.round(maxDh / 0.5));
                        for (let s = 0; s < steps; s++) {
                            const frac0 = s / steps;
                            const frac1 = (s + 1) / steps;
                            const y0_0 = hA0 - frac0 * dh0;
                            const y0_1 = hA1 - frac0 * dh1;
                            const y1_0 = hA0 - frac1 * dh0;
                            const y1_1 = hA1 - frac1 * dh1;

                            const wallTileId = this.topology.getWallSideTileIdForStep(rx, ry, s, steps);
                            const uvWall = this.atlas.getTileUVRect(wallTileId);

                            if (nb.dir === "S") {
                                pushQuad(
                                    lx,     y0_0, ly + 1,
                                    lx + 1, y0_1, ly + 1,
                                    lx + 1, y1_1, ly + 1,
                                    lx,     y1_0, ly + 1,
                                    0, 0, 1,
                                    uvWall
                                );
                            } else if (nb.dir === "N") {
                                pushQuad(
                                    lx + 1, y0_1, ly,
                                    lx,     y0_0, ly,
                                    lx,     y1_0, ly,
                                    lx + 1, y1_1, ly,
                                    0, 0, -1,
                                    uvWall
                                );
                            } else if (nb.dir === "E") {
                                pushQuad(
                                    lx + 1, y0_1, ly + 1,
                                    lx + 1, y0_0, ly,
                                    lx + 1, y1_0, ly,
                                    lx + 1, y1_1, ly + 1,
                                    1, 0, 0,
                                    uvWall
                                );
                            } else if (nb.dir === "W") {
                                pushQuad(
                                    lx, y0_0, ly,
                                    lx, y0_1, ly + 1,
                                    lx, y1_1, ly + 1,
                                    lx, y1_0, ly,
                                    -1, 0, 0,
                                    uvWall
                                );
                            }
                        }
                    }
                }
            }

            let terrainMesh = null;
            if (vertexCount > 0) {
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
                geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
                geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
                geometry.setAttribute("aAnimType", new THREE.Float32BufferAttribute(animTypes, 1));
                geometry.setIndex(indices);
                geometry.computeBoundingSphere();

                terrainMesh = new THREE.Mesh(geometry, this.atlas.material);
                terrainMesh.castShadow = false; // Otimização: Chão apenas recebe sombras (ganho brutal de fillrate)
                terrainMesh.receiveShadow = true;
                terrainMesh.userData.chunkCoords = { cx, cy };
                group.add(terrainMesh);
            }

            return {
                cx,
                cy,
                tileSignature,
                group,
                terrainMesh,
                propsList,
                lastUsedFrame: this._frameCounter
            };
        }

        /**
         * Cria um billboard 3D de duplo plano (visual + proxy de sombra solar)
         * para árvores, bambus, pilares, estátuas e rochas das folhas B..E (Blindagem 3).
         */
        _createPropBillboard(localX, localY, localZ, tileId, isHigher) {
            const uvRect = this.atlas.getTileUVRect(tileId);
            const geom = new THREE.PlaneGeometry(1, 1);
            // Pivô na base inferior do tile (y: 0 -> 1)
            geom.translate(0, 0.5, 0);

            const uvAttr = geom.attributes.uv;
            const uvArr = uvAttr.array;
            uvArr[0] = uvRect.u0; uvArr[1] = uvRect.v1;
            uvArr[2] = uvRect.u1; uvArr[3] = uvRect.v1;
            uvArr[4] = uvRect.u0; uvArr[5] = uvRect.v0;
            uvArr[6] = uvRect.u1; uvArr[7] = uvRect.v0;
            uvAttr.needsUpdate = true;

            const propGroup = new THREE.Group();
            // Peças de copa superior (*) que não têm bloqueio na base flutuam a +0.85 de altura
            const yOffset = isHigher ? 0.0 : 0.0;
            propGroup.position.set(localX, localY + yOffset, localZ);

            const visualMesh = new THREE.Mesh(geom, this.atlas.material);
            visualMesh.castShadow = false;
            visualMesh.receiveShadow = true;
            visualMesh.rotation.order = "YXZ";
            propGroup.add(visualMesh);

            if (!this._sharedPropShadowMat) {
                this._sharedPropShadowMat = new THREE.MeshBasicMaterial({
                    colorWrite: false,
                    depthWrite: false,
                    side: THREE.DoubleSide
                });
            }
            if (!this._sharedPropDepthMat) {
                this._sharedPropDepthMat = new THREE.MeshDepthMaterial({
                    depthPacking: THREE.RGBADepthPacking,
                    map: this.atlas.texture,
                    alphaTest: 0.5,
                    side: THREE.DoubleSide
                });
            }

            const shadowMesh = new THREE.Mesh(geom, this._sharedPropShadowMat);
            shadowMesh.castShadow = true;
            shadowMesh.receiveShadow = false;
            shadowMesh.customDepthMaterial = this._sharedPropDepthMat;
            shadowMesh.rotation.order = "YXZ";
            propGroup.add(shadowMesh);

            return {
                group: propGroup,
                geometry: geom,
                visualMesh,
                shadowMesh
            };
        }

        _updateChunkPropsOrientation(entry, cameraAzimuth, sunDir) {
            if (!entry.propsList || entry.propsList.length === 0) return;
            const sunAngle = Math.atan2(sunDir.x, sunDir.z);
            for (let i = 0; i < entry.propsList.length; i++) {
                const p = entry.propsList[i];
                p.visualMesh.rotation.y = cameraAzimuth;
                p.shadowMesh.rotation.y = sunAngle;
            }
        }

        disposeChunk(key, scene) {
            const entry = this.chunkCache.get(key);
            if (!entry) return;
            if (scene && entry.group) {
                scene.remove(entry.group);
            }
            if (entry.terrainMesh && entry.terrainMesh.geometry) {
                entry.terrainMesh.geometry.dispose();
            }
            if (entry.propsList) {
                for (const p of entry.propsList) {
                    if (p.geometry) p.geometry.dispose();
                }
            }
            this.chunkCache.delete(key);
        }

        disposeAll(scene) {
            for (const key of Array.from(this.chunkCache.keys())) {
                this.disposeChunk(key, scene);
            }
            if (this._sharedPropShadowMat) {
                this._sharedPropShadowMat.dispose();
                this._sharedPropShadowMat = null;
            }
            if (this._sharedPropDepthMat) {
                this._sharedPropDepthMat.dispose();
                this._sharedPropDepthMat = null;
            }
        }
    }

    // =========================================================================
    // SUBSISTEMA 4: CharacterBillboardManager
    // Duplo plano (visual encarando a câmera + shadowCaster encarando o Sol)
    // com BufferGeometry exclusiva por instância e atualização in-place de UVs.
    // =========================================================================
    class CharacterBillboard3D {
        constructor(character) {
            this.character = character;
            this.group = new THREE.Group();

            // BufferGeometry 1x1 dedicada para este personagem (Blindagem 3)
            this.geometry = new THREE.PlaneGeometry(1, 1);
            this.geometry.translate(0, 0.5, 0);

            this.texture = null;
            this.bitmapSource = null;
            this._characterName = "";
            this._tileId = 0;
            this._lastUvKey = "";

            this.visualMaterial = new THREE.MeshLambertMaterial({
                transparent: true,
                alphaTest: 0.5,
                side: THREE.DoubleSide
            });

            this.shadowCarrierMaterial = new THREE.MeshBasicMaterial({
                colorWrite: false,
                depthWrite: false,
                side: THREE.DoubleSide
            });

            this.customDepthMaterial = new THREE.MeshDepthMaterial({
                depthPacking: THREE.RGBADepthPacking,
                alphaTest: 0.5,
                side: THREE.DoubleSide
            });

            this.visualMesh = new THREE.Mesh(this.geometry, this.visualMaterial);
            this.visualMesh.castShadow = false;
            this.visualMesh.receiveShadow = true;
            this.visualMesh.rotation.order = "YXZ";

            this.shadowCasterMesh = new THREE.Mesh(this.geometry, this.shadowCarrierMaterial);
            this.shadowCasterMesh.castShadow = true;
            this.shadowCasterMesh.receiveShadow = false;
            this.shadowCasterMesh.customDepthMaterial = this.customDepthMaterial;
            this.shadowCasterMesh.rotation.order = "YXZ";

            this.group.add(this.visualMesh);
            this.group.add(this.shadowCasterMesh);

            // Montaria de Espada Voadora 3D (para o Jogador em Voo de Espada)
            this.swordMountGroup = null;
            this._heightOffset = 0;
            this._isFlatSprite = false;
            this._noShadow = false;
            this._parseEventNotetags();
        }

        _parseEventNotetags() {
            if (typeof Game_Event !== "undefined" && this.character instanceof Game_Event && typeof this.character.event === "function" && this.character.event()) {
                const note = this.character.event().note || "";
                const hMatch = note.match(/<heightOffset:\s*([-\d.]+)>/i);
                if (hMatch) this._heightOffset = Number(hMatch[1]);
                if (/<flatSprite>/i.test(note)) this._isFlatSprite = true;
                if (/<noBillboardShadow>/i.test(note)) {
                    this._noShadow = true;
                    this.shadowCasterMesh.castShadow = false;
                }
            }
        }

        _ensureSwordMountMesh() {
            if (this.swordMountGroup) return;
            this.swordMountGroup = new THREE.Group();

            // Lâmina espiritual brilhante em Jade/Ciano
            const bladeGeom = new THREE.BoxGeometry(0.22, 0.04, 1.35);
            const bladeMat = new THREE.MeshLambertMaterial({
                color: 0x81ecec,
                emissive: 0x00cec9,
                emissiveIntensity: 0.65
            });
            const bladeMesh = new THREE.Mesh(bladeGeom, bladeMat);

            // Guarda da espada em Ouro Imortal
            const guardGeom = new THREE.BoxGeometry(0.46, 0.06, 0.12);
            const guardMat = new THREE.MeshLambertMaterial({
                color: 0xf1c40f,
                emissive: 0xd4ac0d,
                emissiveIntensity: 0.3
            });
            const guardMesh = new THREE.Mesh(guardGeom, guardMat);
            guardMesh.position.set(0, 0, -0.42);

            this.swordMountGroup.add(bladeMesh);
            this.swordMountGroup.add(guardMesh);
            this.swordMountGroup.position.set(0, -0.02, 0);
            this.group.add(this.swordMountGroup);
        }

        update(topology, originX, originY, cameraAzimuth, sunDir, isFirstPersonPlayer) {
            const c = this.character;
            if (!c || (typeof c.isTransparent === "function" && c.isTransparent()) || (typeof c.opacity === "function" && c.opacity() === 0) || c._erased) {
                this.group.visible = false;
                return;
            }
            if (typeof Game_Follower !== "undefined" && c instanceof Game_Follower && typeof c.isVisible === "function" && !c.isVisible()) {
                this.group.visible = false;
                return;
            }
            if (typeof Game_Vehicle !== "undefined" && c instanceof Game_Vehicle && !c._driving && typeof $gameMap.mapId === "function" && c.mapId !== $gameMap.mapId()) {
                this.group.visible = false;
                return;
            }

            const tileId = c.tileId ? c.tileId() : 0;
            const charName = c.characterName ? c.characterName() : "";
            if (tileId <= 0 && !charName) {
                this.group.visible = false;
                return;
            }

            this._updateTextureSource(tileId, charName);
            if (!this.bitmapSource || !this.bitmapSource.isReady() || !this.texture) {
                this.group.visible = false;
                return;
            }

            this.group.visible = true;
            // Em 1ª pessoa, oculta a malha visual do próprio jogador para não bloquear a câmera,
            // mas mantém a shadowCasterMesh ativa para que o jogador veja sua própria sombra no chão!
            this.visualMesh.visible = !isFirstPersonPlayer;

            // Posição 3D no espaço Floating Origin
            let realX = c._realX;
            let realY = c._realY;
            if (c === $gamePlayer && typeof globalThis._realPlayerX === "number" &&
                (globalThis._realPlayerX !== 0 || globalThis._realPlayerY !== 0)) {
                const fracX = c._realX - Math.floor(c._realX);
                const fracY = c._realY - Math.floor(c._realY);
                realX = Math.floor(globalThis._realPlayerX) + fracX;
                realY = Math.floor(globalThis._realPlayerY) + fracY;
            } else if ($gameMap.isLoopHorizontal() || topology.isProceduralMapActive()) {
                // Desembrulha coordenadas de eventos/seguidores próximos ao jogador em mapas toroidais
                const pReal = Xianxia3DEngine._chunkBuilder ? Xianxia3DEngine._chunkBuilder.getPlayerRealCoords() : { x: $gamePlayer._realX, y: $gamePlayer._realY };
                const mapW = $dataMap.width;
                const mapH = $dataMap.height;
                let dx = ((realX - pReal.x) % mapW + mapW) % mapW;
                if (dx > mapW / 2) dx -= mapW;
                let dy = ((realY - pReal.y) % mapH + mapH) % mapH;
                if (dy > mapH / 2) dy -= mapH;
                realX = pReal.x + dx;
                realY = pReal.y + dy;
            }

            const groundZ = topology.getContinuousElevationAt(realX + 0.5, realY + 0.5);
            const jumpZ = c.jumpHeight ? (c.jumpHeight() / 48.0) : 0;
            const flightZ = (c === $gamePlayer) ? Xianxia3DEngine.getFlightAltitude() : 0;
            const finalZ = Math.max(groundZ, groundZ + flightZ) + jumpZ + this._heightOffset;

            this.group.position.set(
                realX + 0.5 - originX,
                finalZ,
                realY + 0.5 - originY
            );

            // Direção visual relativa ao azimute da câmera (4 quadrantes)
            const visualDir = this._computeCameraRelativeDirection(c.direction(), cameraAzimuth);
            this._updateUVsForFrame(c, tileId, charName, visualDir);

            // Orientação Cilíndrica da malha visual e Orientação Solar da sombra
            if (this._isFlatSprite) {
                this.visualMesh.rotation.set(-Math.PI / 2, 0, 0);
                this.shadowCasterMesh.visible = false;
            } else {
                this.visualMesh.rotation.set(0, cameraAzimuth, 0);
                this.shadowCasterMesh.rotation.set(0, Math.atan2(sunDir.x, sunDir.z), 0);
            }

            // Atualiza espada espiritual 3D sob os pés do jogador durante o Voo de Espada
            if (c === $gamePlayer && Xianxia3DEngine.isSwordFlightActive()) {
                this._ensureSwordMountMesh();
                this.swordMountGroup.visible = true;
                const charWorldAngle = this._dirToAngle(c.direction());
                this.swordMountGroup.rotation.y = charWorldAngle;
                this.swordMountGroup.position.y = 0.05 + Math.sin(Graphics.frameCount * 0.08) * 0.04;
            } else if (this.swordMountGroup) {
                this.swordMountGroup.visible = false;
            }
        }

        _dirToAngle(dir) {
            switch (dir) {
                case 2: return 0;               // Sul (+Z)
                case 6: return Math.PI / 2;     // Leste (+X)
                case 8: return Math.PI;         // Norte (-Z)
                case 4: return -Math.PI / 2;    // Oeste (-X)
                default: return 0;
            }
        }

        _computeCameraRelativeDirection(worldDir, cameraAzimuth) {
            if (this._tileId > 0 || this.character.isObjectCharacter?.()) {
                return worldDir;
            }
            const charAngle = this._dirToAngle(worldDir);
            const twoPi = Math.PI * 2;
            const delta = ((charAngle - cameraAzimuth + Math.PI / 4) % twoPi + twoPi) % twoPi;
            const quadrant = Math.floor(delta / (Math.PI / 2)) % 4;
            // Quadrante 0: olhando para a câmera (2=Frente), 1: Direita (6), 2: Costas (8), 3: Esquerda (4)
            return [2, 6, 8, 4][quadrant];
        }

        _updateTextureSource(tileId, charName) {
            if (this._tileId === tileId && this._characterName === charName && this.texture) {
                return;
            }
            this._tileId = tileId;
            this._characterName = charName;
            this._lastUvKey = "";

            if (typeof ImageManager !== "undefined") {
                if (tileId > 0) {
                    const tileset = ($gameMap && typeof $gameMap.tileset === "function") ? $gameMap.tileset() : null;
                    const setNumber = 5 + Math.floor(tileId / 256);
                    if (tileset && tileset.tilesetNames && typeof ImageManager.loadTileset === "function") {
                        this.bitmapSource = ImageManager.loadTileset(tileset.tilesetNames[setNumber]);
                    }
                } else if (typeof ImageManager.loadCharacter === "function") {
                    this.bitmapSource = ImageManager.loadCharacter(charName);
                }
            }

            if (this.bitmapSource && typeof this.bitmapSource.addLoadListener === "function") {
                this.bitmapSource.addLoadListener(() => {
                    if (this.texture && typeof this.texture.dispose === "function") this.texture.dispose();
                    const img = this.bitmapSource.canvas || this.bitmapSource._image;
                    if (!img || typeof THREE === "undefined") return;
                    this.texture = new THREE.Texture(img);
                    this.texture.magFilter = THREE.NearestFilter;
                    this.texture.minFilter = THREE.NearestFilter;
                    this.texture.generateMipmaps = false;
                    this.texture.needsUpdate = true;

                    this.visualMaterial.map = this.texture;
                    this.visualMaterial.needsUpdate = true;
                    this.customDepthMaterial.map = this.texture;
                    this.customDepthMaterial.needsUpdate = true;
                    this._lastUvKey = "";
                });
            }
        }

        _updateUVsForFrame(c, tileId, charName, visualDir) {
            const bw = this.bitmapSource.width;
            const bh = this.bitmapSource.height;
            if (bw <= 0 || bh <= 0) return;

            let sx = 0, sy = 0, pw = 48, ph = 48;
            if (tileId > 0) {
                pw = $gameMap.tileWidth();
                ph = $gameMap.tileHeight();
                sx = ((Math.floor(tileId / 128) % 2) * 8 + (tileId % 8)) * pw;
                sy = (Math.floor((tileId % 256) / 8) % 16) * ph;
                const isBig = (typeof ImageManager !== "undefined" && typeof ImageManager.isBigCharacter === "function")
                    ? ImageManager.isBigCharacter(charName)
                    : (charName ? charName.startsWith("$") : false);
                pw = isBig ? bw / 3 : bw / 12;
                ph = isBig ? bh / 4 : bh / 8;
                const index = (typeof c.characterIndex === "function") ? c.characterIndex() : 0;
                const blockX = isBig ? 0 : (index % 4) * 3;
                const blockY = isBig ? 0 : Math.floor(index / 4) * 4;
                const patternX = (typeof c.pattern === "function") ? c.pattern() : 1;
                const patternY = (visualDir - 2) / 2;
                sx = (blockX + patternX) * pw;
                sy = (blockY + patternY) * ph;
            }

            const uvKey = `${sx},${sy},${pw},${ph},${bw},${bh}`;
            if (this._lastUvKey === uvKey) return;
            this._lastUvKey = uvKey;

            // Escala proporcional do billboard em unidades de tile (48px = 1.0 unidade)
            const scaleW = pw / 48.0;
            const scaleH = ph / 48.0;
            this.visualMesh.scale.set(scaleW, scaleH, 1.0);
            this.shadowCasterMesh.scale.set(scaleW, scaleH, 1.0);

            const insetU = 0.2 / bw;
            const insetV = 0.2 / bh;
            const u0 = sx / bw + insetU;
            const u1 = (sx + pw) / bw - insetU;
            const v1 = 1.0 - sy / bh - insetV;
            const v0 = 1.0 - (sy + ph) / bh + insetV;

            const uvAttr = this.geometry.attributes.uv;
            const arr = uvAttr.array;
            arr[0] = u0; arr[1] = v1;
            arr[2] = u1; arr[3] = v1;
            arr[4] = u0; arr[5] = v0;
            arr[6] = u1; arr[7] = v0;
            uvAttr.needsUpdate = true;
        }

        dispose(scene) {
            if (scene && this.group) scene.remove(this.group);
            if (this.geometry) this.geometry.dispose();
            if (this.texture) this.texture.dispose();
            if (this.visualMaterial) this.visualMaterial.dispose();
            if (this.shadowCarrierMaterial) this.shadowCarrierMaterial.dispose();
            if (this.customDepthMaterial) this.customDepthMaterial.dispose();
        }
    }

    class CharacterBillboardManager {
        constructor() {
            this.billboards = new Map(); // Game_CharacterBase -> CharacterBillboard3D
        }

        update(scene, topology, originX, originY, cameraAzimuth, sunDir, isFirstPerson) {
            if (!$gameMap || !$gamePlayer) return;

            const activeChars = new Set();
            activeChars.add($gamePlayer);

            if (typeof $gamePlayer.followers === "function" && $gamePlayer.followers()) {
                const fData = $gamePlayer.followers().data();
                if (Array.isArray(fData)) {
                    for (const follower of fData) {
                        activeChars.add(follower);
                    }
                }
            }
            if (typeof $gameMap.vehicles === "function" && Array.isArray($gameMap.vehicles())) {
                for (const vehicle of $gameMap.vehicles()) {
                    activeChars.add(vehicle);
                }
            }
            if (typeof $gameMap.events === "function" && Array.isArray($gameMap.events())) {
                for (const event of $gameMap.events()) {
                    if (event && !event._erased) {
                        activeChars.add(event);
                    }
                }
            }

            for (const char of activeChars) {
                let bb = this.billboards.get(char);
                if (!bb) {
                    bb = new CharacterBillboard3D(char);
                    this.billboards.set(char, bb);
                    scene.add(bb.group);
                }
                const isFPPlayer = isFirstPerson && (char === $gamePlayer);
                bb.update(topology, originX, originY, cameraAzimuth, sunDir, isFPPlayer);
            }

            // Descarta billboards de eventos removidos
            for (const [char, bb] of this.billboards.entries()) {
                if (!activeChars.has(char)) {
                    bb.dispose(scene);
                    this.billboards.delete(char);
                }
            }
        }

        getCharacterWorldPosition(char) {
            const bb = this.billboards.get(char);
            if (bb && bb.group.visible) {
                return bb.group.position;
            }
            return null;
        }

        disposeAll(scene) {
            for (const bb of this.billboards.values()) {
                bb.dispose(scene);
            }
            this.billboards.clear();
        }
    }

    // =========================================================================
    // SUBSISTEMA 5: HybridCameraController
    // Câmera orbital 3ª pessoa <-> 1ª pessoa contínua no scroll do mouse,
    // rotação Q/E e botão direito do mouse, colisão de câmera e Céu 3D.
    // =========================================================================
    class HybridCameraController {
        constructor() {
            this.camera = new THREE.PerspectiveCamera(
                PARAM_CAMERA_FOV,
                Graphics.width / Graphics.height,
                0.15,
                220.0
            );
            this.yaw = 0.0;
            this.targetYaw = 0.0;
            this.pitch = PARAM_DEFAULT_PITCH;
            this.targetPitch = PARAM_DEFAULT_PITCH;
            this.distance = PARAM_DEFAULT_DIST;
            this.targetDistance = PARAM_DEFAULT_DIST;

            this._isRightDragging = false;
            this._lastMouseX = 0;
            this._lastMouseY = 0;

            this.focusPosition = new THREE.Vector3(0, 0.7, 0);
            this._bindMouseListeners();
        }

        _bindMouseListeners() {
            if (HybridCameraController._listenersBound) return;
            HybridCameraController._listenersBound = true;

            window.addEventListener("mousedown", (e) => {
                if (e.button === 2 && Xianxia3DEngine.isActive()) {
                    const ctrl = Xianxia3DEngine._cameraController;
                    if (ctrl) {
                        ctrl._isRightDragging = true;
                        ctrl._lastMouseX = e.clientX;
                        ctrl._lastMouseY = e.clientY;
                    }
                }
            });

            window.addEventListener("mousemove", (e) => {
                const ctrl = Xianxia3DEngine._cameraController;
                if (ctrl && ctrl._isRightDragging && Xianxia3DEngine.isActive()) {
                    const dx = e.clientX - ctrl._lastMouseX;
                    const dy = e.clientY - ctrl._lastMouseY;
                    ctrl._lastMouseX = e.clientX;
                    ctrl._lastMouseY = e.clientY;

                    ctrl.targetYaw -= dx * 0.0065 * PARAM_MOUSE_SENS;
                    const minPitch = ctrl.isFirstPerson() ? -1.15 : 0.15;
                    const maxPitch = ctrl.isFirstPerson() ? 1.15 : 1.42;
                    ctrl.targetPitch = Math.max(minPitch, Math.min(maxPitch, ctrl.targetPitch + dy * 0.0055 * PARAM_MOUSE_SENS));
                }
            });

            window.addEventListener("mouseup", (e) => {
                if (e.button === 2) {
                    const ctrl = Xianxia3DEngine._cameraController;
                    if (ctrl) ctrl._isRightDragging = false;
                }
            });

            window.addEventListener("wheel", (e) => {
                const ctrl = Xianxia3DEngine._cameraController;
                if (ctrl && Xianxia3DEngine.isActive() && SceneManager._scene instanceof Scene_Map) {
                    const delta = Math.sign(e.deltaY) * 1.15;
                    ctrl.targetDistance = Math.max(0.0, Math.min(24.0, ctrl.targetDistance + delta));
                    if (ctrl.targetDistance < 1.2 && delta < 0) {
                        ctrl.targetDistance = 0.0; // Snap suave para 1ª pessoa
                        ctrl.targetPitch = Math.min(ctrl.targetPitch, 0.25);
                    } else if (ctrl.targetDistance > 0 && ctrl.targetDistance < 1.6 && delta > 0) {
                        ctrl.targetDistance = 2.0;
                        if (ctrl.targetPitch < 0.25) ctrl.targetPitch = 0.45;
                    }
                }
            }, { passive: true });
        }

        isFirstPerson() {
            return this.distance < 0.45;
        }

        update(playerGroupPos, topology, originX, originY) {
            // Rotação via teclado Q (pageup) e E (pagedown) quando não estiver em menu
            if (SceneManager._scene instanceof Scene_Map && !$gameMessage.isBusy()) {
                const rotSpeed = 0.042;
                if (Input.isPressed("pageup")) {
                    this.targetYaw += rotSpeed;
                }
                if (Input.isPressed("pagedown")) {
                    this.targetYaw -= rotSpeed;
                }
            }

            // Interpolação amortecida
            this.yaw += (this.targetYaw - this.yaw) * 0.22;
            this.pitch += (this.targetPitch - this.pitch) * 0.22;
            this.distance += (this.targetDistance - this.distance) * 0.20;

            const eyeHeight = this.isFirstPerson() ? 0.72 : 0.65;
            this.focusPosition.set(
                playerGroupPos.x,
                playerGroupPos.y + eyeHeight,
                playerGroupPos.z
            );

            if (this.isFirstPerson()) {
                // Câmera em 1ª Pessoa na altura dos olhos do cultivador
                this.camera.position.copy(this.focusPosition);
                const lookDist = 10.0;
                const lookX = this.focusPosition.x - Math.sin(this.yaw) * Math.cos(this.pitch) * lookDist;
                const lookY = this.focusPosition.y - Math.sin(this.pitch) * lookDist;
                const lookZ = this.focusPosition.z - Math.cos(this.yaw) * Math.cos(this.pitch) * lookDist;
                this.camera.lookAt(lookX, lookY, lookZ);
            } else {
                // Câmera Orbital em 3ª Pessoa com prevenção de clipping contra montanhas
                let effDist = this.distance;
                const horizontalDist = Math.cos(this.pitch) * effDist;
                const verticalDist = Math.sin(this.pitch) * effDist;

                const camX = this.focusPosition.x + Math.sin(this.yaw) * horizontalDist;
                let camY = this.focusPosition.y + verticalDist;
                const camZ = this.focusPosition.z + Math.cos(this.yaw) * horizontalDist;

                // Verifica altura do terreno abaixo da câmera para nunca entrar dentro do chão/penhasco
                const camRealX = camX + originX;
                const camRealY = camZ + originY;
                const terrainUnderCam = topology.getElevationAt(Math.round(camRealX), Math.round(camRealY));
                if (camY < terrainUnderCam + 0.85) {
                    camY = terrainUnderCam + 0.85;
                }

                this.camera.position.set(camX, camY, camZ);
                this.camera.lookAt(this.focusPosition);
            }

            this.camera.updateMatrixWorld();
        }
    }

    // =========================================================================
    // SUBSISTEMA 7: DayNight3DBridge
    // Sincronização em tempo real com DayNightSystem.js, Sol/Lua 3D, SkyDome,
    // PCFSoftShadowMap e pool de PointLights sem dupla escuridão 2D.
    // =========================================================================
    class DayNight3DBridge {
        constructor(scene) {
            this.scene = scene;

            this.hemiLight = new THREE.HemisphereLight(0xdff9fb, 0x556b2f, 0.65);
            this.scene.add(this.hemiLight);

            this.dirLight = new THREE.DirectionalLight(0xfff4e0, 0.95);
            this.dirLight.castShadow = true;
            this.dirLight.shadow.mapSize.width = PARAM_SHADOW_RES;
            this.dirLight.shadow.mapSize.height = PARAM_SHADOW_RES;
            this.dirLight.shadow.camera.near = 1.0;
            this.dirLight.shadow.camera.far = 90.0;
            const d = 24;
            this.dirLight.shadow.camera.left = -d;
            this.dirLight.shadow.camera.right = d;
            this.dirLight.shadow.camera.top = d;
            this.dirLight.shadow.camera.bottom = -d;
            this.dirLight.shadow.bias = -0.0008;
            this.scene.add(this.dirLight);
            this.scene.add(this.dirLight.target);

            this.fog = new THREE.FogExp2(0x9ec5e8, 0.012);
            this.scene.fog = this.fog;

            this.sunDirection = new THREE.Vector3(0.35, 0.85, 0.4).normalize();

            // Pool de PointLights para tochas, cristais espirituais e lanterna/aura do jogador
            this.pointLights = [];
            for (let i = 0; i < 8; i++) {
                const pl = new THREE.PointLight(0xffaa55, 0, 12, 1.8);
                pl.visible = false;
                this.scene.add(pl);
                this.pointLights.push(pl);
            }

            this._createSkyCelestials();
        }

        _createSkyCelestials() {
            this.celestialGroup = new THREE.Group();
            const sunGeom = new THREE.SphereGeometry(3.2, 16, 16);
            const sunMat = new THREE.MeshBasicMaterial({ color: 0xffeaa7, fog: false });
            this.sunMesh = new THREE.Mesh(sunGeom, sunMat);

            const moonGeom = new THREE.SphereGeometry(2.6, 16, 16);
            const moonMat = new THREE.MeshBasicMaterial({ color: 0xdff9fb, fog: false });
            this.moonMesh = new THREE.Mesh(moonGeom, moonMat);

            this.celestialGroup.add(this.sunMesh);
            this.celestialGroup.add(this.moonMesh);
            this.scene.add(this.celestialGroup);
        }

        update(spriteset, playerPos3D, renderer) {
            // 1. Suprime os overlays 2D escuros e de sombras do DayNightSystem.js
            // para eliminar dupla escuridão e poupar 100% do Canvas2D de sombras!
            if (spriteset) {
                if (spriteset._dayNightTileShadowSprite) {
                    spriteset._dayNightTileShadowSprite.visible = false;
                }
                if (spriteset._dayNightOverlaySprite) {
                    spriteset._dayNightOverlaySprite.visible = false;
                }
                if (spriteset._dayNightBloomSprite) {
                    spriteset._dayNightBloomSprite.visible = false;
                }
            }

            // 2. Obtém horário e fase da lua do DayNightSystem.js (ou padrão 10:00 se ausente)
            let totalHours = 10.0;
            let moonPhase = 4;
            if (typeof $gameSystem !== "undefined" && $gameSystem && typeof $gameSystem.dayNightHour === "function") {
                totalHours = $gameSystem.dayNightHour() + ($gameSystem.dayNightMinute() / 60.0);
                if (typeof $gameSystem.dayNightMoonPhase === "function") {
                    moonPhase = $gameSystem.dayNightMoonPhase();
                }
            }

            // 3. Trajetória Esférica do Sol (06:00 -> 18:00) e da Lua (18:00 -> 06:00)
            const isDay = totalHours >= 5.5 && totalHours <= 18.5;
            let elevAngle = 1.0;
            let azimuth = 0.0;

            if (isDay) {
                const progress = (totalHours - 5.5) / 13.0; // 0 (nascer Leste) -> 1 (pôr Oeste)
                elevAngle = Math.max(0.18, Math.sin(progress * Math.PI) * 1.15);
                azimuth = (progress - 0.5) * Math.PI * 0.95; // Leste (+X) -> Sul (+Z) -> Oeste (-X)
            } else {
                const nightHours = totalHours > 18.5 ? (totalHours - 18.5) : (totalHours + 5.5);
                const progress = nightHours / 11.0;
                elevAngle = Math.max(0.22, Math.sin(progress * Math.PI) * 1.05);
                azimuth = (progress - 0.5) * Math.PI * 0.85;
            }

            this.sunDirection.set(
                -Math.sin(azimuth) * Math.cos(elevAngle),
                Math.sin(elevAngle),
                Math.cos(azimuth) * Math.cos(elevAngle)
            ).normalize();

            const lightDist = 35.0;
            this.dirLight.position.set(
                playerPos3D.x + this.sunDirection.x * lightDist,
                playerPos3D.y + this.sunDirection.y * lightDist,
                playerPos3D.z + this.sunDirection.z * lightDist
            );
            this.dirLight.target.position.copy(playerPos3D);
            this.dirLight.target.updateMatrixWorld();

            // Posiciona os astros no céu 3D
            this.celestialGroup.position.copy(playerPos3D);
            const skyRadius = 85.0;
            if (isDay) {
                this.sunMesh.visible = true;
                this.moonMesh.visible = false;
                this.sunMesh.position.copy(this.sunDirection).multiplyScalar(skyRadius);
            } else {
                this.sunMesh.visible = false;
                this.moonMesh.visible = true;
                this.moonMesh.position.copy(this.sunDirection).multiplyScalar(skyRadius);
            }

            // 4. Paleta Atmosférica 3D por período do dia
            const palette = this._computeAtmosphericPalette(totalHours, moonPhase);
            this.hemiLight.color.setHex(palette.skyLight);
            this.hemiLight.groundColor.setHex(palette.groundLight);
            this.hemiLight.intensity = palette.hemiIntensity;

            this.dirLight.color.setHex(palette.dirColor);
            this.dirLight.intensity = palette.dirIntensity;

            this.fog.color.setHex(palette.skyBg);
            this.fog.density = palette.fogDensity;

            if (renderer) {
                renderer.setClearColor(palette.skyBg, 1.0);
            }

            // 5. Luzes Pontuais 3D (Aura/Lanterna do Jogador + Eventos com Luz)
            this._updatePointLights(playerPos3D, isDay);
        }

        _computeAtmosphericPalette(h, moonPhase) {
            // Fase lunar modula o brilho noturno (Lua Cheia = 4 brilha mais que Lua Nova = 0)
            const moonFactor = 1.0 - Math.abs(moonPhase - 4) / 4.0;
            if (h >= 5.0 && h < 7.5) {
                // Alvorada Dourada / Púrpura Xianxia
                return {
                    skyBg: 0xd98a6c,
                    skyLight: 0xffc8a2,
                    groundLight: 0x4a4e69,
                    hemiIntensity: 0.58,
                    dirColor: 0xffaa77,
                    dirIntensity: 0.82,
                    fogDensity: 0.014
                };
            } else if (h >= 7.5 && h < 16.8) {
                // Dia Claro Celestial
                return {
                    skyBg: 0x8ecae6,
                    skyLight: 0xe0f7fa,
                    groundLight: 0x586f44,
                    hemiIntensity: 0.68,
                    dirColor: 0xfff8e7,
                    dirIntensity: 0.95,
                    fogDensity: 0.009
                };
            } else if (h >= 16.8 && h < 19.2) {
                // Crepúsculo Carmesim
                return {
                    skyBg: 0x9b4d6a,
                    skyLight: 0xff9a76,
                    groundLight: 0x2d3142,
                    hemiIntensity: 0.52,
                    dirColor: 0xff7b54,
                    dirIntensity: 0.78,
                    fogDensity: 0.015
                };
            } else {
                // Noite Estrelada & Luar Espiritual
                return {
                    skyBg: 0x0b132b,
                    skyLight: 0x3a506b,
                    groundLight: 0x141b2d,
                    hemiIntensity: 0.34 + moonFactor * 0.14,
                    dirColor: 0xa9d6e5,
                    dirIntensity: 0.35 + moonFactor * 0.28,
                    fogDensity: 0.016
                };
            }
        }

        _updatePointLights(playerPos3D, isDay) {
            let lightIdx = 0;

            // Luz de aura de meditação ou voo de espada do cultivador
            const isMeditating = globalThis.CultivationCore?.getSystem?.()?.isMeditating;
            const isFlying = Xianxia3DEngine.isSwordFlightActive();
            if (!isDay || isMeditating || isFlying) {
                const pl = this.pointLights[lightIdx++];
                pl.visible = true;
                pl.color.setHex(isFlying || isMeditating ? 0x48dbfb : 0xffbb66);
                pl.intensity = isFlying || isMeditating ? 1.35 : 0.95;
                pl.distance = 11.0;
                pl.position.set(playerPos3D.x, playerPos3D.y + 0.9, playerPos3D.z);
            }

            // Eventos com luz do DayNightSystem
            if ($gameMap && Xianxia3DEngine._billboardManager) {
                for (const event of $gameMap.events()) {
                    if (lightIdx >= this.pointLights.length) break;
                    if (!event || event._erased || typeof event.getDayNightLightData !== "function") continue;
                    const lData = event.getDayNightLightData();
                    if (!lData) continue;
                    const evPos = Xianxia3DEngine._billboardManager.getCharacterWorldPosition(event);
                    if (!evPos) continue;

                    const pl = this.pointLights[lightIdx++];
                    pl.visible = true;
                    pl.color.set(lData.color || "#ffaa55");
                    const flicker = lData.flicker ? (0.9 + Math.sin(Graphics.frameCount * 0.25 + event.eventId()) * 0.12) : 1.0;
                    pl.intensity = (lData.intensity || 1.0) * 1.2 * flicker;
                    pl.distance = Math.max(5.0, (lData.radius || 140) / 24.0);
                    pl.position.set(evPos.x, evPos.y + 0.85, evPos.z);
                }
            }

            for (let i = lightIdx; i < this.pointLights.length; i++) {
                this.pointLights[i].visible = false;
            }
        }
    }

    // =========================================================================
    // ORQUESTRADOR GLOBAL: Xianxia3DEngine
    // =========================================================================
    const Xianxia3DEngine = {
        _enabled: PARAM_ENABLE_DEFAULT,
        _mapAllowed: true,
        _swordFlightActive: false,
        _flightAltitude: 0.0,
        _targetFlightAltitude: 0.0,

        _atlas: null,
        _topology: new TopologyAndHeightProvider(),
        _chunkBuilder: null,
        _billboardManager: null,
        _cameraController: null,
        _dayNightBridge: null,
        _raycaster: typeof THREE !== "undefined" ? new THREE.Raycaster() : null,
        _projVec: typeof THREE !== "undefined" ? new THREE.Vector3() : null,

        _originX: 0,
        _originY: 0,
        _activeTerrainMeshes: [],
        _playerWorldPos: typeof THREE !== "undefined" ? new THREE.Vector3() : { x: 0, y: 0, z: 0 },

        isActive() {
            return (
                this._enabled &&
                this._mapAllowed &&
                typeof THREE !== "undefined" &&
                SceneManager._scene instanceof Scene_Map &&
                !!$dataMap &&
                !!$gameMap
            );
        },

        setEnabled(flag) {
            this._enabled = Boolean(flag);
            const spriteset = SceneManager._scene && SceneManager._scene._spriteset;
            if (spriteset) {
                spriteset.syncThreeViewportVisibility();
            }
        },

        toggle3DMode() {
            this.setEnabled(!this._enabled);
            const cs = globalThis.CultivationCore?.getSystem?.();
            if (cs && typeof cs.addToast === "function") {
                cs.addToast(
                    this._enabled ? "⛰️ Visão Espiritual 3D Ativada" : "📜 Visão Clássica 2D Ativada",
                    "#74b9ff"
                );
            }
        },

        isSwordFlightActive() {
            return this.isActive() && this._swordFlightActive;
        },

        getFlightAltitude() {
            return this._swordFlightActive ? this._flightAltitude : 0.0;
        },

        toggleSwordFlight() {
            if (!this.isActive()) return;
            const cs = globalThis.CultivationCore?.getSystem?.();

            if (!this._swordFlightActive) {
                if (PARAM_REQUIRE_REALM && cs && cs.cultivation && cs.cultivation.qiRealmIndex < 2) {
                    if (typeof cs.addToast === "function") {
                        cs.addToast("⚔️ Voo de Espada requer o Estabelecimento de Fundação!", "#ff7675");
                    }
                    SoundManager.playBuzzer();
                    return;
                }
                this._swordFlightActive = true;
                this._targetFlightAltitude = Math.max(1.2, this._flightAltitude + 1.2);
                SoundManager.playEquip();
                if (cs && typeof cs.addToast === "function") {
                    cs.addToast("🗡️ Voo de Espada Espiritual Ativado! (R: Subir | V: Descer)", "#81ecec");
                }
            } else {
                this._swordFlightActive = false;
                this._targetFlightAltitude = 0.0;
                this._flightAltitude = 0.0;
                SoundManager.playCancel();
                if (cs && typeof cs.addToast === "function") {
                    cs.addToast("🗡️ Você pousou da Espada Espiritual.", "#dfe6e9");
                }
            }
        },

        updateSwordFlight() {
            if (!this._swordFlightActive) {
                this._flightAltitude = 0.0;
                return;
            }
            if (Input.isPressed("flightUp")) {
                this._targetFlightAltitude = Math.min(18.0, this._targetFlightAltitude + 0.08);
            }
            if (Input.isPressed("flightDown")) {
                this._targetFlightAltitude = Math.max(0.25, this._targetFlightAltitude - 0.08);
            }
            this._flightAltitude += (this._targetFlightAltitude - this._flightAltitude) * 0.18;

            // Consumo leve de Qi no CultivationCore durante o voo
            const cs = globalThis.CultivationCore?.getSystem?.();
            if (cs && cs.cultivation && typeof cs.cultivation.currentQi === "number") {
                if (cs.cultivation.currentQi > 0.05) {
                    cs.cultivation.currentQi = Math.max(0, cs.cultivation.currentQi - 0.015);
                } else if (PARAM_REQUIRE_REALM) {
                    this.toggleSwordFlight();
                }
            }
        },

        /**
         * Transforma a direção do teclado (2=Baixo, 4=Esq, 6=Dir, 8=Cima na tela)
         * pelo quadrante azimutal atual da câmera (Gargalo #4).
         */
        transformInputDirByCamera(rawDir) {
            if (!this._cameraController || rawDir <= 0) return rawDir;
            const twoPi = Math.PI * 2;
            const yaw = ((this._cameraController.yaw % twoPi) + twoPi) % twoPi;
            const quadrant = Math.round(yaw / (Math.PI / 2)) % 4;
            if (quadrant === 0) return rawDir;

            // Anel horário de direções do RMMZ: Norte(8) -> Leste(6) -> Sul(2) -> Oeste(4)
            const cwRing = [8, 6, 2, 4];
            const idx = cwRing.indexOf(rawDir);
            if (idx < 0) return rawDir;
            // Quando a câmera gira no sentido anti-horário (+yaw), a frente da câmera gira para Oeste
            const rotatedIdx = (idx - quadrant + 4) % 4;
            return cwRing[rotatedIdx];
        },

        /**
         * Converte um clique de tela (x, y) em coordenadas de tile do mapa via THREE.Raycaster 3D.
         */
        raycastCanvasToMapCoords(canvasX, canvasY) {
            if (!this._cameraController || !this._raycaster) {
                return null;
            }
            const ndcX = (canvasX / Graphics.width) * 2 - 1;
            const ndcY = -(canvasY / Graphics.height) * 2 + 1;
            this._raycaster.setFromCamera({ x: ndcX, y: ndcY }, this._cameraController.camera);

            if (this._activeTerrainMeshes && this._activeTerrainMeshes.length > 0) {
                const hits = this._raycaster.intersectObjects(this._activeTerrainMeshes, false);
                if (hits.length > 0) {
                    const pt = hits[0].point;
                    const realX = Math.floor(pt.x + this._originX);
                    const realY = Math.floor(pt.z + this._originY);
                    if ($gameMap.isLoopHorizontal() || this._topology.isProceduralMapActive()) {
                        const wxy = this._topology.getWrappedXY(realX, realY);
                        return { x: wxy.x, y: wxy.y, z: pt.y, elevation: pt.y };
                    }
                    return { x: realX, y: realY, z: pt.y, elevation: pt.y };
                }
            }

            // Fallback: interseção com o plano horizontal na altura do jogador
            const ray = this._raycaster.ray;
            const planeY = this._playerWorldPos.y || 0;
            if (Math.abs(ray.direction.y) > 0.001) {
                const t = (planeY - ray.origin.y) / ray.direction.y;
                if (t > 0) {
                    const hitX = ray.origin.x + ray.direction.x * t;
                    const hitZ = ray.origin.z + ray.direction.z * t;
                    const contX = hitX + this._originX;
                    const contY = hitZ + this._originY;
                    const realX = Math.floor(contX);
                    const realY = Math.floor(contY);
                    const hitElev = this._topology.getContinuousElevationAt(contX, contY);
                    if ($gameMap.isLoopHorizontal() || this._topology.isProceduralMapActive()) {
                        const wxy = this._topology.getWrappedXY(realX, realY);
                        return { x: wxy.x, y: wxy.y, z: hitElev, elevation: hitElev };
                    }
                    return { x: realX, y: realY, z: hitElev, elevation: hitElev };
                }
            }
            return null;
        },

        /**
         * Projeta a posição 3D de um Game_CharacterBase para coordenadas de tela 2D (x, y)
         * com Frustum Clipping (z_ndc <= 1.0) para ancorar Balões e animações Effekseer (Blindagem 2).
         */
        projectCharacterToScreen(char) {
            if (!this._cameraController || !this._billboardManager || !this._projVec) {
                return null;
            }
            const worldPos = this._billboardManager.getCharacterWorldPosition(char);
            if (!worldPos) return null;

            this._projVec.set(worldPos.x, worldPos.y + 0.2, worldPos.z);
            this._projVec.project(this._cameraController.camera);

            // Se o ponto está atrás do plano da câmera (z_ndc > 1.0), descarta para evitar inversão
            if (this._projVec.z > 1.0 || this._projVec.z < -1.0) {
                return { x: -9999, y: -9999 };
            }

            const sx = Math.round(((this._projVec.x + 1.0) * 0.5) * Graphics.width);
            const sy = Math.round(((1.0 - this._projVec.y) * 0.5) * Graphics.height);
            return { x: sx, y: sy };
        },

        notifyChunkModified(cxReal, cyReal) {
            if (!this._chunkBuilder) return;
            const key = `${cxReal},${cyReal}`;
            const spriteset = SceneManager._scene && SceneManager._scene._spriteset;
            const scene3d = spriteset && spriteset._threeScene;
            this._chunkBuilder.disposeChunk(key, scene3d);
        }
    };

    Xianxia3DEngine.TopologyAndHeightProvider = TopologyAndHeightProvider;
    Xianxia3DEngine.VoxelChunkMeshBuilder = VoxelChunkMeshBuilder;
    Xianxia3DEngine.CharacterBillboardManager = CharacterBillboardManager;
    Xianxia3DEngine.CharacterBillboard3D = CharacterBillboard3D;
    Xianxia3DEngine.SHAPE_FLAT = SHAPE_FLAT;
    Xianxia3DEngine.SHAPE_RAMP_NORTH = SHAPE_RAMP_NORTH;
    Xianxia3DEngine.SHAPE_RAMP_SOUTH = SHAPE_RAMP_SOUTH;
    Xianxia3DEngine.SHAPE_RAMP_EAST = SHAPE_RAMP_EAST;
    Xianxia3DEngine.SHAPE_RAMP_WEST = SHAPE_RAMP_WEST;
    Xianxia3DEngine.SHAPE_STAIRS = SHAPE_STAIRS;
    Xianxia3DEngine.SHAPE_WALL = SHAPE_WALL;
    Xianxia3DEngine.SHAPE_BRIDGE = SHAPE_BRIDGE;

    globalThis.Xianxia3DEngine = Xianxia3DEngine;

    // =========================================================================
    // HOOKS RMMZ: Contexto Offscreen WebGL2, Desativação de CPU do Tilemap 2D,
    // Projeção Nativa screenX/Y, Raycasting e Cinemática Relativa à Câmera
    // =========================================================================

    // Blindagem 1: Neutraliza _paintAllTiles quando o 3D está ativo para cortar 100%
    // do gasto de CPU do Tilemap 2D, mantendo _tilemap vivo para Effekseer/Balões.
    const _Tilemap_paintAllTiles = Tilemap.prototype._paintAllTiles;
    Tilemap.prototype._paintAllTiles = function(startX, startY) {
        if (Xianxia3DEngine.isActive()) {
            return;
        }
        _Tilemap_paintAllTiles.call(this, startX, startY);
    };

    // Blindagem 2: Sobrescreve screenX e screenY com Frustum Clipping 3D
    // e suprime o desenho 2D redundante do corpo do Sprite_Character.
    const _Game_CharacterBase_screenX = Game_CharacterBase.prototype.screenX;
    Game_CharacterBase.prototype.screenX = function() {
        if (Xianxia3DEngine.isActive()) {
            const p = Xianxia3DEngine.projectCharacterToScreen(this);
            if (p) return p.x;
        }
        return _Game_CharacterBase_screenX.call(this);
    };

    const _Game_CharacterBase_screenY = Game_CharacterBase.prototype.screenY;
    Game_CharacterBase.prototype.screenY = function() {
        if (Xianxia3DEngine.isActive()) {
            const p = Xianxia3DEngine.projectCharacterToScreen(this);
            if (p) return p.y;
        }
        return _Game_CharacterBase_screenY.call(this);
    };

    const _Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function() {
        if (Xianxia3DEngine.isActive()) {
            Sprite.prototype.update.call(this);
            this.updatePosition();
            this.visible = false; // Oculta o sprite 2D; apenas x/y servem de âncora para Effekseer/Balões
            if (this._upperBody) this._upperBody.visible = false;
            if (this._lowerBody) this._lowerBody.visible = false;
            if (this._contactShadowSprite) this._contactShadowSprite.visible = false;
            if (this._sunShadowSprite) this._sunShadowSprite.visible = false;
            return;
        }
        this.visible = true;
        _Sprite_Character_update.call(this);
    };

    // Gargalo #4: Rotação de Input.dir4 pelo azimute da câmera
    const _Game_Player_getInputDirection = Game_Player.prototype.getInputDirection;
    Game_Player.prototype.getInputDirection = function() {
        const rawDir = _Game_Player_getInputDirection.call(this);
        if (rawDir > 0 && Xianxia3DEngine.isActive()) {
            return Xianxia3DEngine.transformInputDirByCamera(rawDir);
        }
        return rawDir;
    };

    // R4: Preservação de Navegabilidade em Rampas, Escadas e Voo de Espada
    // R4: Preservação de Navegabilidade em Rampas, Escadas e Voo de Espada
    const _Game_CharacterBase_isMapPassable = Game_CharacterBase.prototype.isMapPassable;
    Game_CharacterBase.prototype.isMapPassable = function(x, y, d) {
        if (this.isThrough && this.isThrough()) return true;
        if (Xianxia3DEngine.isActive() || Xianxia3DEngine._forceActiveForTesting) {
            const nx = $gameMap.roundXWithDirection(x, d);
            const ny = $gameMap.roundYWithDirection(y, d);
            if (!$gameMap.isValid(nx, ny)) return false;

            const topo = Xianxia3DEngine._topology;
            if (topo) {
                const passResult = topo.checkPassability(x, y, nx, ny, d);
                if (passResult !== null) {
                    return passResult;
                }
            }
        }
        return _Game_CharacterBase_isMapPassable ? _Game_CharacterBase_isMapPassable.call(this, x, y, d) : true;
    };

    const _Game_Player_isMapPassable = Game_Player.prototype.isMapPassable;
    Game_Player.prototype.isMapPassable = function(x, y, d) {
        if (this.isThrough && this.isThrough()) return true;
        if (Xianxia3DEngine.isSwordFlightActive() && Xianxia3DEngine.getFlightAltitude() > 0.45) {
            const nx = $gameMap.roundXWithDirection(x, d);
            const ny = $gameMap.roundYWithDirection(y, d);
            return $gameMap.isValid(nx, ny);
        }
        const vehicle = (typeof this.vehicle === "function") ? this.vehicle() : null;
        if (vehicle) {
            return vehicle.isMapPassable(x, y, d);
        }
        return Game_CharacterBase.prototype.isMapPassable.call(this, x, y, d);
    };

    // Gargalo #4: Substituição de canvasToMapX/Y por THREE.Raycaster 3D
    const _Game_Map_canvasToMapX = Game_Map.prototype.canvasToMapX;
    Game_Map.prototype.canvasToMapX = function(x) {
        if (Xianxia3DEngine.isActive()) {
            const hit = Xianxia3DEngine.raycastCanvasToMapCoords(x, TouchInput.y);
            if (hit) return hit.x;
        }
        return _Game_Map_canvasToMapX.call(this, x);
    };

    const _Game_Map_canvasToMapY = Game_Map.prototype.canvasToMapY;
    Game_Map.prototype.canvasToMapY = function(y) {
        if (Xianxia3DEngine.isActive()) {
            const hit = Xianxia3DEngine.raycastCanvasToMapCoords(TouchInput.x, y);
            if (hit) return hit.y;
        }
        return _Game_Map_canvasToMapY.call(this, y);
    };

    // Configuração de mapa ao carregar
    const _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.call(this, mapId);
        const note = ($dataMap && $dataMap.note) ? $dataMap.note : "";
        Xianxia3DEngine._mapAllowed = !/<disable3D>/i.test(note);
        Xianxia3DEngine._topology.invalidateStaticCache();
        Xianxia3DEngine._topology.prepareForMap();
    };

    // Integração com Spriteset_Map (Gargalo #1: Offscreen WebGL2 + PIXI.BaseTexture Blit)
    const _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _Spriteset_Map_createLowerLayer.call(this);
        if (typeof THREE !== "undefined") {
            this.createThreeViewport();
        }
    };

    Spriteset_Map.prototype.createThreeViewport = function() {
        // Cria Canvas Offscreen dedicado e Contexto WebGL2 isolado
        this._threeCanvas = document.createElement("canvas");
        this._threeCanvas.width = Graphics.width;
        this._threeCanvas.height = Graphics.height;

        this._threeRenderer = new THREE.WebGLRenderer({
            canvas: this._threeCanvas,
            alpha: false,
            antialias: false, // Otimização: O PixiJS já usa LINEAR filter na BaseTexture para tela cheia
            powerPreference: "high-performance",
            preserveDrawingBuffer: false,
            precision: "mediump"
        });
        this._threeRenderer.setSize(Graphics.width, Graphics.height, false);
        this._threeRenderer.shadowMap.enabled = true;
        this._threeRenderer.shadowMap.type = THREE.PCFShadowMap; // 3x mais rápido que PCFSoftShadowMap

        this._threeScene = new THREE.Scene();

        // Inicializa os 7 subsistemas internos
        Xianxia3DEngine._atlas = new RMMZ3DTilesetAtlas();
        Xianxia3DEngine._chunkBuilder = new VoxelChunkMeshBuilder(Xianxia3DEngine._atlas, Xianxia3DEngine._topology);
        Xianxia3DEngine._billboardManager = new CharacterBillboardManager();
        Xianxia3DEngine._cameraController = new HybridCameraController();
        Xianxia3DEngine._dayNightBridge = new DayNight3DBridge(this._threeScene);

        // Vincula ao grafo do PixiJS via PIXI.BaseTexture posicionado no índice do _tilemap
        this._threeBaseTexture = PIXI.BaseTexture.from(this._threeCanvas, {
            scaleMode: PIXI.SCALE_MODES.LINEAR
        });
        this._threeViewportSprite = new PIXI.Sprite(new PIXI.Texture(this._threeBaseTexture));

        const tilemapIndex = this._baseSprite.getChildIndex(this._tilemap);
        this._baseSprite.addChildAt(this._threeViewportSprite, tilemapIndex);

        this.syncThreeViewportVisibility();
    };

    Spriteset_Map.prototype.syncThreeViewportVisibility = function() {
        const active = Xianxia3DEngine.isActive();
        if (this._threeViewportSprite) {
            this._threeViewportSprite.visible = active;
        }
        if (this._tilemap) {
            if (this._tilemap._lowerLayer) this._tilemap._lowerLayer.visible = !active;
            if (this._tilemap._upperLayer) this._tilemap._upperLayer.visible = !active;
            if (!active) {
                this._tilemap.refresh();
            }
        }
        if (this._shadowSprite) {
            this._shadowSprite.visible = !active;
        }
        if (this._dayNightTileShadowSprite) this._dayNightTileShadowSprite.visible = !active;
        if (this._dayNightOverlaySprite) this._dayNightOverlaySprite.visible = !active;
        if (this._dayNightBloomSprite) this._dayNightBloomSprite.visible = !active;
    };

    const _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        if (Input.isTriggered("toggle3D")) {
            Xianxia3DEngine.toggle3DMode();
        }
        if (Input.isTriggered("swordFlight") && !$gameMessage.isBusy()) {
            Xianxia3DEngine.toggleSwordFlight();
        }

        _Spriteset_Map_update.call(this);

        if (Xianxia3DEngine.isActive() && this._threeRenderer && this._threeScene) {
            this.updateThreeEngine();
        }
    };

    Spriteset_Map.prototype.updateThreeEngine = function() {
        this.syncThreeViewportVisibility();

        // 1. Verifica prontidão dos bitmaps do Tileset e atualiza o Atlas 4096x4096
        const tilesetId = $gameMap.tilesetId();
        const bitmaps = this._tilemap ? this._tilemap._bitmaps : [];
        const flags = $gameMap.tilesetFlags();
        const rebuiltAtlas = Xianxia3DEngine._atlas.checkAndBuild(tilesetId, bitmaps, flags);
        if (rebuiltAtlas && Xianxia3DEngine._chunkBuilder) {
            Xianxia3DEngine._chunkBuilder.disposeAll(this._threeScene);
        }
        Xianxia3DEngine._atlas.updateAnimationUniforms(Graphics.frameCount);

        // 2. Atualiza Voo de Espada 3D
        Xianxia3DEngine.updateSwordFlight();

        // 3. Atualiza direção solar/lunar e iluminação atmosférica 3D antes dos proxies de sombra
        const camAzimuth = Xianxia3DEngine._cameraController.yaw;
        Xianxia3DEngine._dayNightBridge.update(
            this,
            Xianxia3DEngine._playerWorldPos,
            this._threeRenderer
        );
        const sunDir = Xianxia3DEngine._dayNightBridge.sunDirection;

        // 4. Atualiza Chunks Voxel 16x16 com Floating Origin e LRU Cache
        const chunkState = Xianxia3DEngine._chunkBuilder.updateActiveChunks(
            this._threeScene,
            PARAM_CHUNK_RADIUS,
            sunDir,
            camAzimuth
        );
        Xianxia3DEngine._originX = chunkState.originX;
        Xianxia3DEngine._originY = chunkState.originY;
        Xianxia3DEngine._activeTerrainMeshes = chunkState.terrainMeshes;

        // 5. Atualiza Billboards Cilíndricos e Proxies de Sombra Solar
        const isFP = Xianxia3DEngine._cameraController.isFirstPerson();
        Xianxia3DEngine._billboardManager.update(
            this._threeScene,
            Xianxia3DEngine._topology,
            chunkState.originX,
            chunkState.originY,
            camAzimuth,
            sunDir,
            isFP
        );

        // 6. Atualiza Câmera Híbrida e âncora do DirectionalLight no jogador
        const playerBBPos = Xianxia3DEngine._billboardManager.getCharacterWorldPosition($gamePlayer);
        if (playerBBPos) {
            Xianxia3DEngine._playerWorldPos.copy(playerBBPos);
            Xianxia3DEngine._dayNightBridge.update(
                this,
                Xianxia3DEngine._playerWorldPos,
                this._threeRenderer
            );
        }
        Xianxia3DEngine._cameraController.update(
            Xianxia3DEngine._playerWorldPos,
            Xianxia3DEngine._topology,
            chunkState.originX,
            chunkState.originY
        );

        // 6. Renderiza Cena 3D e sincroniza textura GPU-to-GPU no PixiJS
        this._threeRenderer.render(this._threeScene, Xianxia3DEngine._cameraController.camera);
        if (this._threeBaseTexture) {
            this._threeBaseTexture.update();
        }
    };

    // Blindagem 5: Liberação rigorosa de VRAM ao sair da Scene_Map
    const _Spriteset_Map_destroy = Spriteset_Map.prototype.destroy;
    Spriteset_Map.prototype.destroy = function(options) {
        if (Xianxia3DEngine._chunkBuilder && this._threeScene) {
            Xianxia3DEngine._chunkBuilder.disposeAll(this._threeScene);
        }
        if (Xianxia3DEngine._billboardManager && this._threeScene) {
            Xianxia3DEngine._billboardManager.disposeAll(this._threeScene);
        }
        if (Xianxia3DEngine._atlas) {
            Xianxia3DEngine._atlas.dispose();
        }
        if (this._threeBaseTexture) {
            this._threeBaseTexture.destroy();
            this._threeBaseTexture = null;
        }
        if (this._threeRenderer) {
            this._threeRenderer.dispose();
            this._threeRenderer = null;
        }
        _Spriteset_Map_destroy.call(this, options);
    };

    // Comandos de Plugin do RPG Maker MZ
    PluginManager.registerCommand(pluginName, "set3DMode", (args) => {
        Xianxia3DEngine.setEnabled(String(args.enabled) !== "false");
    });

    PluginManager.registerCommand(pluginName, "setCameraAngles", (args) => {
        const ctrl = Xianxia3DEngine._cameraController;
        if (!ctrl) return;
        if (args.yawDegrees !== undefined) {
            ctrl.targetYaw = Number(args.yawDegrees) * (Math.PI / 180);
        }
        if (args.pitchDegrees !== undefined) {
            ctrl.targetPitch = Number(args.pitchDegrees) * (Math.PI / 180);
        }
        if (args.distance !== undefined) {
            ctrl.targetDistance = Number(args.distance);
        }
    });

    console.log(`${pluginName} [v1.0.0]: Motor 3D Voxel, Relevo Procedural & Billboards carregado com sucesso.`);
})();
