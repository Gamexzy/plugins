/*:
 * @target MZ
 * @plugindesc [Procedural] Minimapa em tempo real na tela com moldura metálica e Mapa Mundial explorável no menu com névoa de guerra.
 * @author Seu Nome Aqui
 * @version 2.0.0
 * @license MIT
 * @help
 * ===========================================================================
 * ProceduralWorldMap.js
 * ===========================================================================
 * Este plugin cria um sistema completo de exploração para mundos infinitos
 * e procedurais baseados em chunks:
 *
 * 1. Minimapa na Tela (HUD):
 *    - Posicionado no canto superior esquerdo com moldura metálica retangular.
 *    - Mostra o terreno explorado ao redor do jogador com névoa de guerra.
 *    - Marcador de direção do jogador no centro.
 *    - Renderização acelerada por buffer de memória (Uint32Array + ImageData).
 *
 * 2. Mapa Mundial no Menu e Tecla 'M':
 *    - Acessível pelo Menu Principal (opção "Mapa") ou pressionando 'M' no mapa.
 *    - Visualização grande e navegável em 60 FPS contínuos (arraste com o mouse ou use as setas).
 *    - Zoom configurável, alternância de Escala 1:1 / Múndi [E], Névoa [F] e botão de centralizar [Enter].
 *
 * 3. Persistência de Exploração:
 *    - As áreas descobertas são salvas automaticamente nos arquivos de save do jogo.
 *
 * 4. Extensibilidade de Cores de Terrenos:
 *    - Cores pré-definidas para biomas conhecidos e auto-cálculo com base nos
 *      dados ambientais (altura, temperatura, umidade) para qualquer bioma futuro!
 *
 * ===========================================================================
 * Parâmetros do Plugin
 * ===========================================================================
 *
 * @param Minimap X
 * @text Posição X do Minimapa
 * @type number
 * @desc Posição X do minimapa na tela (em pixels).
 * @default 20
 *
 * @param Minimap Y
 * @text Posição Y do Minimapa
 * @type number
 * @desc Posição Y do minimapa na tela (em pixels).
 * @default 20
 *
 * @param Minimap Width
 * @text Largura do Minimapa
 * @type number
 * @desc Largura do minimapa (em pixels).
 * @default 160
 *
 * @param Minimap Height
 * @text Altura do Minimapa
 * @type number
 * @desc Altura do minimapa (em pixels).
 * @default 120
 *
 * @param Exploration Radius
 * @text Raio de Visão (Chunks)
 * @type number
 * @desc Quantos chunks ao redor do jogador são revelados conforme ele explora.
 * @default 3
 *
 * @param Map Key
 * @text Tecla de Atalho do Mapa
 * @type string
 * @desc Tecla para abrir o mapa grande na tela (ex: M).
 * @default M
 *
 * @param Menu Command Text
 * @text Nome no Menu
 * @type string
 * @desc Texto exibido no Menu Principal para abrir o mapa.
 * @default Mapa
 *
 * @param debugMode
 * @text Modo de Depuração
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Ativa mensagens de log no console.
 * @default false
 */

(() => {
    const pluginName = "ProceduralWorldMap";
    const parameters = (typeof PluginManager !== "undefined" && PluginManager.parameters)
        ? PluginManager.parameters(pluginName)
        : {};

    const minimapX = Number(parameters['Minimap X'] || 20);
    const minimapY = Number(parameters['Minimap Y'] || 20);
    const minimapWidth = Number(parameters['Minimap Width'] || 160);
    const minimapHeight = Number(parameters['Minimap Height'] || 120);
    const explorationRadius = Number(parameters['Exploration Radius'] || 3);
    const mapKeyName = String(parameters['Map Key'] || 'M').toUpperCase();
    const menuCommandText = String(parameters['Menu Command Text'] || 'Mapa');
    const enableFogOfWar = String(parameters['Enable Fog of War'] || 'false') === 'true';
    const debugMode = String(parameters['debugMode'] || 'false') === 'true';

    // Registra teclas de atalho no Input do RPG Maker MZ
    if (typeof Input !== "undefined" && Input.keyMapper) {
        const keyCodes = {
            'M': 77, 'N': 78, 'B': 66, 'V': 86, 'C': 67, 'X': 88, 'Z': 90,
            'TAB': 9, 'SPACE': 32, 'F': 70, 'E': 69
        };
        const targetKeyCode = keyCodes[mapKeyName] || 77;
        Input.keyMapper[targetKeyCode] = 'worldMapKey';
        Input.keyMapper[70] = 'fogToggleKey';
        Input.keyMapper[69] = 'exploreScaleKey';
    }

    // =========================================================================
    // 1. Tabela e Gerenciamento de Cores por Tile ID e Biomas (RGBA Uint32)
    // =========================================================================

    function hexToUint32(hex) {
        if (!hex) return 0xFF000000;
        if (hex.charCodeAt(0) === 35) hex = hex.slice(1);
        let r = 0, g = 0, b = 0, a = 255;
        if (hex.length === 6) {
            r = parseInt(hex.slice(0, 2), 16) || 0;
            g = parseInt(hex.slice(2, 4), 16) || 0;
            b = parseInt(hex.slice(4, 6), 16) || 0;
        } else if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16) || 0;
            g = parseInt(hex[1] + hex[1], 16) || 0;
            b = parseInt(hex[2] + hex[2], 16) || 0;
        }
        return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
    }

    const _tileIdColors = {
        2048: '#87ceeb', // River / Water
        2096: '#143864', // Deep Sea
        2528: '#5c90b8', // Icy Water
        2816: '#3a783a', // Tier 0: Plains
        2864: '#2d5e2d', // Forest
        2912: '#c29a64', // Tier 1: Low Hills
        2960: '#8b3a1a', // Tier 2: High Plateau
        3008: '#7d7d7d', // Tier 3: Peak
        3104: '#c29a64', // Hills
        3152: '#7d7d7d', // Mountain
        3200: '#dfbd5f', // Sand
        3296: '#eef5f8', // Snow
        3440: '#d5bb7e', // Beach
        4016: '#f0f6fa', // Snow Peak
        4352: '#111111'  // Cliff Shadow
    };

    const _customTileColors = {
        'Sea': '#143864',
        'Coast': '#87ceeb',
        'River': '#87ceeb',
        'Beach': '#d5bb7e',
        'Icy Water': '#5c90b8',
        'Snowy': '#eef5f8',
        'SnowPeak': '#f0f6fa',
        'Tundra': '#688775',
        'Land': '#3a783a',
        'Plains': '#3a783a',
        'LowHills': '#c29a64',
        'Hills': '#c29a64',
        'HighPlateau': '#8b3a1a',
        'Peak': '#7d7d7d',
        'Mountain': '#7d7d7d',
        'CliffShadow': '#111111',
        'Forest': '#2d5e2d',
        'Jungle': '#1d481f',
        'Desert': '#dfbd5f',
        'Savanna': '#c29a64',
        'Swamp': '#43593e',
        'Oceano Profundo': '#102e54',
        'Mar Costeiro & Águas Claras': '#3890c8',
        'Geleira de Gelo Perpétuo': '#eef6fa',
        'Tundra Espiritual do Norte': '#6b8c7b',
        'Planície Mortal & Vales': '#4e8c40',
        'Floresta de Bambu de Jade': '#235c2b',
        'Deserto de Fogo Terrestre': '#dfbd5f',
        'Pântano de Miasma & Veneno': '#43593e',
        'Montanha Espiritual (Ling Shan)': '#7a766e',
        'Mar de Relâmpagos Celestiais': '#5f5278',
        'Terras de Sangue Divino & Sha Qi': '#7a232e',
        'Ravina de Intenção de Espada': '#8b9bb4',
        'Cratera da Palma Celestial': '#b8864b'
    };

    // Precomputa Uint32 para desempenho máximo em hardware (evita parsing em tempo real)
    const _tileIdUint32 = {};
    for (const id in _tileIdColors) {
        _tileIdUint32[id] = hexToUint32(_tileIdColors[id]);
    }

    const _customTileUint32 = {};
    for (const name in _customTileColors) {
        _customTileUint32[name] = hexToUint32(_customTileColors[name]);
    }

    // Cores especiais Uint32 estáticas
    const U32_FOG            = hexToUint32('#080a0c');
    const U32_POLAR          = hexToUint32('#eef6fa');
    const U32_DEFAULT_LAND   = hexToUint32('#4e8c40');
    const U32_POI_CITY       = hexToUint32('#ffd700');
    const U32_POI_ORTHODOX   = hexToUint32('#00cec9');
    const U32_POI_DEMONIC    = hexToUint32('#ff4757');
    const U32_POI_SECRET     = hexToUint32('#a29bfe');
    const U32_BRIDGE         = hexToUint32('#d35400');
    const U32_ROAD           = hexToUint32('#c8a45d');
    const U32_WATER          = hexToUint32('#48dbfb');

    function getColorForTileId(tileId) {
        if (!tileId || tileId <= 0) return null;
        const baseAutotileId = Math.floor((tileId - 2048) / 48) * 48 + 2048;
        if (_tileIdColors[baseAutotileId]) {
            return _tileIdColors[baseAutotileId];
        }
        const kind = Math.floor((tileId - 2048) / 48);
        if (kind === 0) return _tileIdColors[2048];
        if (kind === 1) return _tileIdColors[2096];
        if (kind === 10) return _tileIdColors[2528];
        if (kind === 16) return _tileIdColors[2816];
        if (kind === 18) return _tileIdColors[2912];
        if (kind === 19) return _tileIdColors[2960];
        if (kind === 20) return _tileIdColors[3008];
        if (kind === 26) return _tileIdColors[3296];
        if (kind === 32) return _tileIdColors[3584];
        if (kind === 34) return _tileIdColors[3680];
        if (kind === 40) return _tileIdColors[3968];
        return null;
    }

    function getTileColor(biomeName, envData) {
        if (_customTileColors[biomeName]) {
            return _customTileColors[biomeName];
        }
        if (envData) {
            const h = envData.height ?? 0;
            const temp = envData.temp ?? 20;
            const hum = envData.humidity ?? 50;

            if (h < -70) return '#143864';
            if (h < 0) return '#3890c8';
            if (h > 220) return (temp < 10) ? '#eef5f8' : '#757169';

            if (temp < 0) return '#eef5f8';
            if (temp < 8) return '#688775';

            if (temp > 24 && hum < 38) return '#dfbd5f';
            if (temp > 18 && hum < 46) return '#a2944b';
            if (hum > 70) return (temp > 20) ? '#43593e' : '#235028';
            if (hum > 50) return '#235028';
            return '#568b44';
        }
        return '#568b44';
    }

    // =========================================================================
    // 2. ExplorationManager (Rastreamento de Descoberta & Cache de Alta Performance)
    // =========================================================================

    class ExplorationManager {
        constructor() {
            this._exploredChunks = new Set();
            this._chunkColorCache = new Map(); // key -> Uint32Array(256)
            this._exploredTilesCache = new Map();
            this._maxChunkCache = 4096; // Suporta mais de 1.000.000 tiles em cache quente
        }

        clear() {
            this._exploredChunks.clear();
            this._chunkColorCache.clear();
            this._exploredTilesCache.clear();
        }

        clearCache() {
            this._chunkColorCache.clear();
            this._exploredTilesCache.clear();
        }

        isChunkExplored(chunkX, chunkY) {
            if (globalThis.OverworldChunkManager && globalThis.OverworldChunkManager._discoveredCells) {
                const isLocal = globalThis.OverworldChunkManager.getScaleMode && globalThis.OverworldChunkManager.getScaleMode() === "local";
                const mx = isLocal ? Math.floor(chunkX / 32) : chunkX;
                const my = isLocal ? Math.floor(chunkY / 32) : chunkY;
                if (globalThis.OverworldChunkManager._discoveredCells.isDiscovered(mx, my)) {
                    return true;
                }
            }
            return this._exploredChunks.has(`${chunkX},${chunkY}`);
        }

        markChunkExplored(chunkX, chunkY) {
            if (globalThis.OverworldChunkManager && globalThis.OverworldChunkManager._discoveredCells) {
                const isLocal = globalThis.OverworldChunkManager.getScaleMode && globalThis.OverworldChunkManager.getScaleMode() === "local";
                const mx = isLocal ? Math.floor(chunkX / 32) : chunkX;
                const my = isLocal ? Math.floor(chunkY / 32) : chunkY;
                return globalThis.OverworldChunkManager._discoveredCells.markDiscovered(mx, my);
            }
            const key = `${chunkX},${chunkY}`;
            if (!this._exploredChunks.has(key)) {
                this._exploredChunks.add(key);
                return true;
            }
            return false;
        }

        updateExplorationAround(realX, realY) {
            const cWidth = 16;
            const cHeight = 16;
            const currentChunkX = Math.floor(realX / cWidth);
            const currentChunkY = Math.floor(realY / cHeight);

            let newlyDiscovered = false;
            for (let dy = -explorationRadius; dy <= explorationRadius; dy++) {
                for (let dx = -explorationRadius; dx <= explorationRadius; dx++) {
                    const cx = currentChunkX + dx;
                    const cy = currentChunkY + dy;
                    if (this.markChunkExplored(cx, cy)) {
                        newlyDiscovered = true;
                    }
                }
            }
            return newlyDiscovered;
        }

        /**
         * Retorna o buffer Uint32Array(256) de cores de um chunk 16x16 com cache quente contínuo.
         */
        getChunkColorBuffer(cx, cy, scaleMode = "overworld") {
            const modePrefix = (scaleMode === "local") ? "L:" : "O:";
            const cacheKey = modePrefix + cx + "," + cy;
            const cached = this._chunkColorCache.get(cacheKey);
            if (cached) return cached;

            const buffer = new Uint32Array(256);
            const baseX = cx * 16;
            const baseY = cy * 16;

            if (globalThis.WorldClimateEngine) {
                const wce = globalThis.WorldClimateEngine;
                const cat = (typeof wce.getBiomeCatalog === "function") ? wce.getBiomeCatalog() : null;

                if (scaleMode === "local" && typeof wce.getLocalDataAt === "function") {
                    for (let dy = 0; dy < 16; dy++) {
                        const wy = baseY + dy;
                        const rowOffset = dy * 16;
                        for (let dx = 0; dx < 16; dx++) {
                            const wx = baseX + dx;
                            const env = wce.getLocalDataAt(wx, wy);
                            buffer[rowOffset + dx] = this._resolveEnvironmentUint32(env, cat);
                        }
                    }
                } else if (typeof wce.getOverworldDataAt === "function") {
                    for (let dy = 0; dy < 16; dy++) {
                        const wy = baseY + dy;
                        const rowOffset = dy * 16;
                        for (let dx = 0; dx < 16; dx++) {
                            const wx = baseX + dx;
                            const env = wce.getOverworldDataAt(wx, wy);
                            buffer[rowOffset + dx] = this._resolveEnvironmentUint32(env, cat);
                        }
                    }
                }
            } else {
                // Fallback para PerlinNoiseGenerator ou padrão
                for (let dy = 0; dy < 16; dy++) {
                    const wy = baseY + dy;
                    const rowOffset = dy * 16;
                    for (let dx = 0; dx < 16; dx++) {
                        const wx = baseX + dx;
                        const colStr = this.getTileColorAt(wx, wy);
                        buffer[rowOffset + dx] = hexToUint32(colStr);
                    }
                }
            }

            // Gerencia eviction inteligente sem limpar todo o cache (LRU leve)
            if (this._chunkColorCache.size >= this._maxChunkCache) {
                let toRemove = 500;
                for (const key of this._chunkColorCache.keys()) {
                    this._chunkColorCache.delete(key);
                    if (--toRemove <= 0) break;
                }
            }
            this._chunkColorCache.set(cacheKey, buffer);
            return buffer;
        }

        _resolveEnvironmentUint32(env, cat) {
            if (!env) return U32_DEFAULT_LAND;
            if (env.poiType === 1 || env.poiType === 2) return U32_POI_CITY;
            if (env.poiType === 3) return U32_POI_ORTHODOX;
            if (env.poiType === 4) return U32_POI_DEMONIC;
            if (env.poiType >= 5) return U32_POI_SECRET;
            if (env.isBridge) return U32_BRIDGE;
            if (env.isRoad) return U32_ROAD;
            if (env.waterBodyType >= 3 && env.waterBodyType <= 7) return U32_WATER;
            if (cat && cat[env.biomeId] && cat[env.biomeId].color) {
                const hex = cat[env.biomeId].color;
                return _customTileUint32[hex] || hexToUint32(hex);
            }
            if (_customTileUint32[env.biomeName]) {
                return _customTileUint32[env.biomeName];
            }
            return U32_DEFAULT_LAND;
        }

        getTileColorAt(worldX, worldY) {
            const scaleTag = (globalThis.OverworldChunkManager && globalThis.OverworldChunkManager.getScaleMode)
                ? globalThis.OverworldChunkManager.getScaleMode()
                : "overworld";
            const key = `${scaleTag}:${worldX},${worldY}`;
            if (this._exploredTilesCache.has(key)) {
                return this._exploredTilesCache.get(key);
            }

            let color = null;
            if (globalThis.WorldClimateEngine && typeof globalThis.WorldClimateEngine.getEnvironmentDataForCoords === 'function') {
                const env = globalThis.WorldClimateEngine.getEnvironmentDataForCoords(worldX, worldY);
                if (env) {
                    const riftAt = (scaleTag === "overworld" && globalThis.OverworldChunkManager && typeof globalThis.OverworldChunkManager.getSpontaneousRiftAt === "function")
                        ? globalThis.OverworldChunkManager.getSpontaneousRiftAt(worldX, worldY)
                        : null;
                    if (env.poiType === 1 || env.poiType === 2) color = '#ffd700';
                    else if (env.poiType === 3) color = '#00cec9';
                    else if (env.poiType === 4) color = '#ff4757';
                    else if (env.poiType >= 5 || riftAt) color = '#a29bfe';
                    else if (env.isBridge) color = '#d35400';
                    else if (env.isRoad) color = '#c8a45d';
                    else if (env.waterBodyType >= 3 && env.waterBodyType <= 7) color = '#48dbfb';
                    else {
                        const cat = globalThis.WorldClimateEngine.getBiomeCatalog();
                        if (cat && cat[env.biomeId]) {
                            color = cat[env.biomeId].color;
                        } else {
                            color = getTileColor(env.biomeName, env);
                        }
                    }
                }
            }

            if (!color && globalThis.PerlinNoiseGenerator) {
                if (typeof globalThis.PerlinNoiseGenerator.getLayersAt === 'function') {
                    const layers = globalThis.PerlinNoiseGenerator.getLayersAt(worldX, worldY);
                    const activeTile = layers.upperTile || layers.baseTile;
                    if (activeTile) color = getColorForTileId(activeTile);
                } else if (typeof globalThis.PerlinNoiseGenerator.getBaseTileAt === 'function') {
                    const activeTile = globalThis.PerlinNoiseGenerator.getBaseTileAt(worldX, worldY);
                    if (activeTile) color = getColorForTileId(activeTile);
                }
            }

            if (!color) {
                let biomeName = "Land";
                let envData = null;
                if (globalThis.PerlinNoiseGenerator) {
                    if (typeof globalThis.PerlinNoiseGenerator.getBiomeNameForCoords === 'function') {
                        biomeName = globalThis.PerlinNoiseGenerator.getBiomeNameForCoords(worldX, worldY);
                    }
                    if (typeof globalThis.PerlinNoiseGenerator.getEnvironmentDataForCoords === 'function') {
                        envData = globalThis.PerlinNoiseGenerator.getEnvironmentDataForCoords(worldX, worldY);
                    }
                }
                color = getTileColor(biomeName, envData);
            }

            if (this._exploredTilesCache.size > 20000) {
                let removeCount = 4000;
                for (const k of this._exploredTilesCache.keys()) {
                    this._exploredTilesCache.delete(k);
                    if (--removeCount <= 0) break;
                }
            }
            this._exploredTilesCache.set(key, color);
            return color;
        }

        getTotalExploredChunks() {
            return this._exploredChunks.size;
        }

        saveData() {
            if (globalThis.OverworldChunkManager && globalThis.OverworldChunkManager._discoveredCells) {
                return [];
            }
            return Array.from(this._exploredChunks);
        }

        loadData(data) {
            this.clear();
            if (Array.isArray(data)) {
                for (const key of data) {
                    this._exploredChunks.add(key);
                }
            }
        }
    }

    const _explorationManager = new ExplorationManager();

    // Integração com DataManager (Save / Load)
    if (typeof DataManager !== "undefined") {
        const _DataManager_makeSaveContents = DataManager.makeSaveContents;
        DataManager.makeSaveContents = function() {
            const contents = _DataManager_makeSaveContents.call(this);
            if (!globalThis.OverworldChunkManager) {
                contents.proceduralWorldMapExploration = _explorationManager.saveData();
            }
            return contents;
        };

        const _DataManager_extractSaveContents = DataManager.extractSaveContents;
        DataManager.extractSaveContents = function(contents) {
            _DataManager_extractSaveContents.call(this, contents);
            if (contents.proceduralWorldMapExploration) {
                _explorationManager.loadData(contents.proceduralWorldMapExploration);
            } else {
                _explorationManager.clear();
            }
        };
    }

    if (typeof Game_System !== "undefined") {
        const _Game_System_initialize = Game_System.prototype.initialize;
        Game_System.prototype.initialize = function() {
            _Game_System_initialize.call(this);
            _explorationManager.clear();
        };
    }

    // =========================================================================
    // 3. Utilitário de Desenho: Moldura Metálica Estilizada (Vazada)
    // =========================================================================

    function drawMetallicFrame(ctx, x, y, w, h, titleText = '', borderWidth = 7) {
        ctx.save();
        const bw = borderWidth;

        // 1. Sombra externa na borda
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // 2. Borda externa escura metálica de 2px
        ctx.fillStyle = '#22252a';
        ctx.fillRect(x, y, w, 2);
        ctx.fillRect(x, y + h - 2, w, 2);
        ctx.fillRect(x, y + 2, 2, h - 4);
        ctx.fillRect(x + w - 2, y + 2, 2, h - 4);

        ctx.shadowColor = 'transparent';

        // 3. Gradiente metálico chanfrado
        const grad = ctx.createLinearGradient(x, y, x + w, y + h);
        grad.addColorStop(0, '#555b63');
        grad.addColorStop(0.3, '#7d848e');
        grad.addColorStop(0.5, '#484d54');
        grad.addColorStop(0.8, '#828a96');
        grad.addColorStop(1, '#3b4046');

        ctx.fillStyle = grad;
        ctx.fillRect(x + 2, y + 2, w - 4, bw - 2);
        ctx.fillRect(x + 2, y + h - bw, w - 4, bw - 2);
        ctx.fillRect(x + 2, y + bw, bw - 2, h - bw * 2);
        ctx.fillRect(x + w - bw, y + bw, bw - 2, h - bw * 2);

        // 4. Friso chanfrado interno
        ctx.strokeStyle = '#181a1d';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + bw - 0.5, y + bw - 0.5, w - bw * 2 + 1, h - bw * 2 + 1);

        // 5. Parafusos/rebites prateados nos 4 cantos
        const rivetOffset = Math.max(3, Math.floor(bw / 2) + 1);
        const rivets = [
            [x + rivetOffset, y + rivetOffset],
            [x + w - rivetOffset, y + rivetOffset],
            [x + rivetOffset, y + h - rivetOffset],
            [x + w - rivetOffset, y + h - rivetOffset]
        ];
        for (const [rx, ry] of rivets) {
            ctx.fillStyle = '#1c1e22';
            ctx.beginPath();
            ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#c5ccd6';
            ctx.beginPath();
            ctx.arc(rx - 0.5, ry - 0.5, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // 6. Título opcional na moldura
        if (titleText) {
            ctx.fillStyle = '#e0e4ea';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(titleText, x + w / 2, y + 2);
        }

        ctx.restore();
    }

    // =========================================================================
    // 4. Sprite_Minimap (HUD na Tela do Mapa - 60 FPS Acelerado por TypedArray)
    // =========================================================================

    class Sprite_Minimap extends (typeof Sprite !== "undefined" ? Sprite : Object) {
        constructor() {
            super();
            this.x = minimapX;
            this.y = minimapY;
            this._lastPlayerRealX = null;
            this._lastPlayerRealY = null;
            this._lastPlayerDir = null;
            this._visibleState = true;

            this._bufferCanvas = null;
            this._bufferCtx = null;
            this._imageData = null;
            this._pixels32 = null;
            this._frameCanvas = null;

            this.createBitmaps();
        }

        ensureTileBuffer(tileW, tileH) {
            if (!this._bufferCanvas || this._bufferW !== tileW || this._bufferH !== tileH) {
                this._bufferW = tileW;
                this._bufferH = tileH;
                if (!this._bufferCanvas && typeof document !== "undefined") {
                    this._bufferCanvas = document.createElement('canvas');
                    this._bufferCtx = this._bufferCanvas.getContext('2d', { willReadFrequently: true });
                }
                if (this._bufferCanvas) {
                    this._bufferCanvas.width = tileW;
                    this._bufferCanvas.height = tileH;
                    this._imageData = this._bufferCtx.createImageData(tileW, tileH);
                    this._pixels32 = new Uint32Array(this._imageData.data.buffer);
                }
            }
        }

        drawCachedFrame(ctx, w, h, titleText = '', borderWidth = 7) {
            if (!this._frameCanvas && typeof document !== "undefined") {
                this._frameCanvas = document.createElement('canvas');
                this._frameCanvas.width = w;
                this._frameCanvas.height = h;
                const fCtx = this._frameCanvas.getContext('2d');
                drawMetallicFrame(fCtx, 0, 0, w, h, titleText, borderWidth);
            }
            if (this._frameCanvas) {
                ctx.drawImage(this._frameCanvas, 0, 0);
            } else {
                drawMetallicFrame(ctx, 0, 0, w, h, titleText, borderWidth);
            }
        }

        createBitmaps() {
            if (typeof Bitmap === "undefined") return;
            this.bitmap = new Bitmap(minimapWidth, minimapHeight);
            this.setFrame(0, 0, minimapWidth, minimapHeight);

            const realCoords = globalThis.BasicChunkGenerator?.getRealPlayerCoordinates
                ? globalThis.BasicChunkGenerator.getRealPlayerCoordinates()
                : { x: $gamePlayer?.x || 0, y: $gamePlayer?.y || 0 };
            const dir = $gamePlayer?.direction ? $gamePlayer.direction() : 2;

            _explorationManager.updateExplorationAround(realCoords.x, realCoords.y);
            this._lastPlayerRealX = realCoords.x;
            this._lastPlayerRealY = realCoords.y;
            this._lastPlayerDir = dir;
            this.renderMinimap(realCoords.x, realCoords.y, dir);
        }

        update() {
            if (super.update) super.update();
            if (!this._visibleState || (typeof $gamePlayer === "undefined" || !$gamePlayer)) return;

            const realCoords = globalThis.BasicChunkGenerator?.getRealPlayerCoordinates
                ? globalThis.BasicChunkGenerator.getRealPlayerCoordinates()
                : { x: $gamePlayer.x, y: $gamePlayer.y };

            const dir = $gamePlayer.direction();

            if (this._lastPlayerRealX !== realCoords.x || 
                this._lastPlayerRealY !== realCoords.y || 
                this._lastPlayerDir !== dir) {
                
                this._lastPlayerRealX = realCoords.x;
                this._lastPlayerRealY = realCoords.y;
                this._lastPlayerDir = dir;

                _explorationManager.updateExplorationAround(realCoords.x, realCoords.y);
                this.renderMinimap(realCoords.x, realCoords.y, dir);
            }
        }

        renderMinimap(playerX, playerY, playerDir) {
            if (!this.bitmap) return;
            const ctx = this.bitmap.context;
            const innerMargin = 7;
            const innerW = minimapWidth - innerMargin * 2;
            const innerH = minimapHeight - innerMargin * 2;

            const scale = 3;
            const tileW = Math.max(1, Math.ceil(innerW / scale));
            const tileH = Math.max(1, Math.ceil(innerH / scale));

            this.ensureTileBuffer(tileW, tileH);
            if (!this._pixels32) return;

            const pixels32 = this._pixels32;
            const fogColorU32 = U32_FOG;

            const startX = playerX - Math.floor(tileW / 2);
            const startY = playerY - Math.floor(tileH / 2);

            const scaleMode = (globalThis.OverworldChunkManager && globalThis.OverworldChunkManager.getScaleMode)
                ? globalThis.OverworldChunkManager.getScaleMode()
                : "overworld";

            const totalChunksX = (scaleMode === "local") ? 16384 : 512;
            const totalChunksY = (scaleMode === "local") ? 8192 : 256;

            const minChunkX = Math.floor(startX / 16);
            const maxChunkX = Math.floor((startX + tileW - 1) / 16);
            const minChunkY = Math.floor(startY / 16);
            const maxChunkY = Math.floor((startY + tileH - 1) / 16);

            for (let cy = minChunkY; cy <= maxChunkY; cy++) {
                const chunkTop = cy * 16;
                const chunkBottom = chunkTop + 15;
                const yStartInTile = Math.max(0, chunkTop - startY);
                const yEndInTile = Math.min(tileH - 1, chunkBottom - startY);

                const isOutOfPolarBounds = (cy < 0 || cy >= totalChunksY);
                const wrappedCy = Math.max(0, Math.min(totalChunksY - 1, cy));

                for (let cx = minChunkX; cx <= maxChunkX; cx++) {
                    const chunkLeft = cx * 16;
                    const chunkRight = chunkLeft + 15;
                    const xStartInTile = Math.max(0, chunkLeft - startX);
                    const xEndInTile = Math.min(tileW - 1, chunkRight - startX);

                    const wrappedCx = ((cx % totalChunksX) + totalChunksX) % totalChunksX;
                    const isExplored = !enableFogOfWar || _explorationManager.isChunkExplored(wrappedCx, wrappedCy);

                    if (isOutOfPolarBounds || !isExplored) {
                        const fillCol = isOutOfPolarBounds ? U32_POLAR : fogColorU32;
                        for (let ty = yStartInTile; ty <= yEndInTile; ty++) {
                            const rowOffset = ty * tileW;
                            for (let tx = xStartInTile; tx <= xEndInTile; tx++) {
                                pixels32[rowOffset + tx] = fillCol;
                            }
                        }
                    } else {
                        const chunkColors = _explorationManager.getChunkColorBuffer(wrappedCx, wrappedCy, scaleMode);
                        for (let ty = yStartInTile; ty <= yEndInTile; ty++) {
                            const chunkY = (startY + ty) & 15;
                            const srcRow = chunkY * 16;
                            const dstRow = ty * tileW;
                            for (let tx = xStartInTile; tx <= xEndInTile; tx++) {
                                const chunkX = (startX + tx) & 15;
                                pixels32[dstRow + tx] = chunkColors[srcRow + chunkX];
                            }
                        }
                    }
                }
            }

            this._bufferCtx.putImageData(this._imageData, 0, 0);

            ctx.save();
            ctx.beginPath();
            ctx.rect(innerMargin, innerMargin, innerW, innerH);
            ctx.clip();

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this._bufferCanvas, 0, 0, tileW, tileH, innerMargin, innerMargin, innerW, innerH);

            const centerX = innerMargin + Math.floor(innerW / 2);
            const centerY = innerMargin + Math.floor(innerH / 2);
            this.drawPlayerMarker(ctx, centerX, centerY, playerDir);
            ctx.restore();

            this.drawCachedFrame(ctx, minimapWidth, minimapHeight, '', innerMargin);
            if (this.bitmap._baseTexture) this.bitmap._baseTexture.update();
        }

        drawPlayerMarker(ctx, cx, cy, dir) {
            ctx.save();
            ctx.translate(cx + 1, cy + 1);

            let angle = 0;
            if (dir === 8) angle = -Math.PI / 2;
            else if (dir === 2) angle = Math.PI / 2;
            else if (dir === 4) angle = Math.PI;
            else if (dir === 6) angle = 0;

            ctx.rotate(angle);

            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.beginPath();
            ctx.moveTo(6, 1);
            ctx.lineTo(-4, 5);
            ctx.lineTo(-2, 1);
            ctx.lineTo(-4, -3);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffcc00';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(5, 0);
            ctx.lineTo(-4, 4);
            ctx.lineTo(-2, 0);
            ctx.lineTo(-4, -4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }
    }

    // =========================================================================
    // 5. Hooks no Scene_Map para Minimapa e Atalho 'M'
    // =========================================================================

    if (typeof Scene_Map !== "undefined") {
        const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
        Scene_Map.prototype.createAllWindows = function() {
            _Scene_Map_createAllWindows.call(this);
            this.createMinimapHUD();
        };

        Scene_Map.prototype.createMinimapHUD = function() {
            this._minimapSprite = new Sprite_Minimap();
            this.addChild(this._minimapSprite);
        };

        const _Scene_Map_update = Scene_Map.prototype.update;
        Scene_Map.prototype.update = function() {
            _Scene_Map_update.call(this);

            if (Input.isTriggered('worldMapKey') && (typeof $gameMessage === "undefined" || !$gameMessage.isBusy())) {
                if (typeof SoundManager !== "undefined") SoundManager.playCursor();
                SceneManager.push(Scene_WorldMap);
            }
        };
    }

    // =========================================================================
    // 6. Integração com o Menu Principal (Window_MenuCommand & Scene_Menu)
    // =========================================================================

    if (typeof Window_MenuCommand !== "undefined") {
        const _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
        Window_MenuCommand.prototype.addOriginalCommands = function() {
            _Window_MenuCommand_addOriginalCommands.call(this);
            this.addCommand(menuCommandText, 'worldMap', true);
        };
    }

    if (typeof Scene_Menu !== "undefined") {
        const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
        Scene_Menu.prototype.createCommandWindow = function() {
            _Scene_Menu_createCommandWindow.call(this);
            this._commandWindow.setHandler('worldMap', this.commandWorldMap.bind(this));
        };

        Scene_Menu.prototype.commandWorldMap = function() {
            SceneManager.push(Scene_WorldMap);
        };
    }

    // =========================================================================
    // 7. Scene_WorldMap (Cena Completa do Mapa Mundial - 60 FPS Sem Travações)
    // =========================================================================

    class Scene_WorldMap extends (typeof Scene_MenuBase !== "undefined" ? Scene_MenuBase : Object) {
        create() {
            super.create();
            this.createMapViewport();
            this.createInfoWindow();
        }

        createBackground() {
            super.createBackground();
            if (typeof Sprite === "undefined" || typeof Bitmap === "undefined") return;
            this._bgOverlay = new Sprite();
            this._bgOverlay.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
            this._bgOverlay.bitmap.fillAll('#101216');
            this.addChild(this._bgOverlay);
        }

        createMapViewport() {
            const margin = 16;
            const viewWidth = Graphics.boxWidth - margin * 2;
            const viewHeight = Graphics.boxHeight - 110;

            this._mapContainer = new Sprite();
            this._mapContainer.x = margin;
            this._mapContainer.y = margin;
            this._mapWidth = viewWidth;
            this._mapHeight = viewHeight;

            this._mapBitmap = new Bitmap(viewWidth, viewHeight);
            this._mapContainer.bitmap = this._mapBitmap;
            this._mapContainer.setFrame(0, 0, viewWidth, viewHeight);

            if (this._windowLayer) {
                const idx = this.children.indexOf(this._windowLayer);
                if (idx >= 0) {
                    this.addChildAt(this._mapContainer, idx);
                } else {
                    this.addChild(this._mapContainer);
                }
            } else {
                this.addChild(this._mapContainer);
            }

            this._displayMode = (globalThis.OverworldChunkManager && globalThis.OverworldChunkManager.getScaleMode)
                ? globalThis.OverworldChunkManager.getScaleMode()
                : "overworld";

            const coords = this.getPlayerMapCoordinates(this._displayMode);
            this._camRealX = coords.x;
            this._camRealY = coords.y;
            this._zoomScale = 3;
            this._isDragging = false;
            this._dragStartX = 0;
            this._dragStartY = 0;
            this._fogOfWar = enableFogOfWar;
            this._needsRedraw = false;

            this._tileBufferCanvas = null;
            this._tileBufferCtx = null;
            this._tileImageData = null;
            this._tilePixels32 = null;
            this._frameCanvas = null;

            _explorationManager.updateExplorationAround(coords.x, coords.y);
            this.renderWorldMap();
        }

        ensureTileBuffer(tileW, tileH) {
            if (!this._tileBufferCanvas || this._tileBufferW !== tileW || this._tileBufferH !== tileH) {
                this._tileBufferW = tileW;
                this._tileBufferH = tileH;
                if (!this._tileBufferCanvas && typeof document !== "undefined") {
                    this._tileBufferCanvas = document.createElement('canvas');
                    this._tileBufferCtx = this._tileBufferCanvas.getContext('2d', { willReadFrequently: true });
                }
                if (this._tileBufferCanvas) {
                    this._tileBufferCanvas.width = tileW;
                    this._tileBufferCanvas.height = tileH;
                    this._tileImageData = this._tileBufferCtx.createImageData(tileW, tileH);
                    this._tilePixels32 = new Uint32Array(this._tileImageData.data.buffer);
                }
            }
        }

        drawCachedFrame(ctx, w, h, titleText = '', borderWidth = 8) {
            if (!this._frameCanvas && typeof document !== "undefined") {
                this._frameCanvas = document.createElement('canvas');
                this._frameCanvas.width = w;
                this._frameCanvas.height = h;
                const fCtx = this._frameCanvas.getContext('2d');
                drawMetallicFrame(fCtx, 0, 0, w, h, titleText, borderWidth);
            }
            if (this._frameCanvas) {
                ctx.drawImage(this._frameCanvas, 0, 0);
            } else {
                drawMetallicFrame(ctx, 0, 0, w, h, titleText, borderWidth);
            }
        }

        getPlayerMapCoordinates(scaleMode) {
            if (globalThis.OverworldChunkManager) {
                if (scaleMode === "local") {
                    const lPos = globalThis.OverworldChunkManager._localPos;
                    if (lPos) return { x: lPos.x, y: lPos.y };
                } else {
                    const oPos = globalThis.OverworldChunkManager._overworldPos;
                    if (oPos) return { x: oPos.x, y: oPos.y };
                }
            }
            if (globalThis.BasicChunkGenerator?.getRealPlayerCoordinates) {
                return globalThis.BasicChunkGenerator.getRealPlayerCoordinates();
            }
            return { x: $gamePlayer?.x || 0, y: $gamePlayer?.y || 0 };
        }

        createInfoWindow() {
            if (typeof Window_Base === "undefined" || typeof Rectangle === "undefined") return;
            const rect = new Rectangle(16, Graphics.boxHeight - 86, Graphics.boxWidth - 32, 70);
            this._infoWindow = new Window_Base(rect);
            this.addWindow(this._infoWindow);
            this.updateInfoText();
        }

        updateInfoText() {
            if (!this._infoWindow) return;
            this._infoWindow.contents.clear();

            const scaleMode = this._displayMode || "overworld";
            const coords = this.getPlayerMapCoordinates(scaleMode);

            let currentBiome = "Planície Mortal";
            if (globalThis.WorldClimateEngine) {
                if (scaleMode === "local" && typeof globalThis.WorldClimateEngine.getLocalDataAt === 'function') {
                    const env = globalThis.WorldClimateEngine.getLocalDataAt(coords.x, coords.y);
                    if (env) currentBiome = env.biomeName;
                } else if (typeof globalThis.WorldClimateEngine.getOverworldDataAt === 'function') {
                    const env = globalThis.WorldClimateEngine.getOverworldDataAt(coords.x, coords.y);
                    if (env) currentBiome = env.biomeName;
                }
            }

            const scaleModeText = scaleMode === "local" ? "Local 1:1" : "Múndi";
            const fogText = this._fogOfWar ? "Ativa" : "Desativada";

            this._infoWindow.changeTextColor(ColorManager.systemColor());
            this._infoWindow.drawText("Posição:", 10, 0, 80);
            this._infoWindow.drawText("Bioma:", 215, 0, 60);
            this._infoWindow.drawText("Escala:", 485, 0, 65);
            this._infoWindow.drawText("Névoa:", 625, 0, 55);

            this._infoWindow.resetTextColor();
            this._infoWindow.drawText(`(${coords.x}, ${coords.y})`, 85, 0, 125);
            this._infoWindow.drawText(currentBiome, 275, 0, 205);
            this._infoWindow.drawText(scaleModeText, 550, 0, 70);
            this._infoWindow.drawText(fogText, 680, 0, 85);

            this._infoWindow.changeTextColor(ColorManager.textColor(7));
            this._infoWindow.drawText("[E]: Escala 1:1/Múndi | [F]: Névoa | [Scroll]: Zoom | [Setas/Mouse]: Mover | [Esc]: Voltar", 10, 28, Graphics.boxWidth - 60);
        }

        update() {
            super.update();
            this.handleInput();

            if (this._needsRedraw) {
                this._needsRedraw = false;
                this.renderWorldMap();
                this.updateInfoText();
            }
        }

        handleInput() {
            let moved = false;
            const scrollSpeed = Math.max(1, Math.round(5 / this._zoomScale)) * (this._displayMode === "local" ? 16 : 3);

            if (Input.isPressed('left')) { this._camRealX -= scrollSpeed; moved = true; }
            if (Input.isPressed('right')) { this._camRealX += scrollSpeed; moved = true; }
            if (Input.isPressed('up')) { this._camRealY -= scrollSpeed; moved = true; }
            if (Input.isPressed('down')) { this._camRealY += scrollSpeed; moved = true; }

            // Alternar Escala 1:1 / Múndi com a tecla 'E'
            if (Input.isTriggered('exploreScaleKey')) {
                SoundManager.playCursor();
                this._displayMode = (this._displayMode === "local") ? "overworld" : "local";
                const coords = this.getPlayerMapCoordinates(this._displayMode);
                this._camRealX = coords.x;
                this._camRealY = coords.y;
                moved = true;
            }

            // Alternar Névoa de Guerra com a tecla 'F'
            if (Input.isTriggered('fogToggleKey')) {
                SoundManager.playCursor();
                this._fogOfWar = !this._fogOfWar;
                moved = true;
            }

            // Zoom com roda do mouse
            if (TouchInput.wheelY < 0) {
                if (this._zoomScale < 8) {
                    this._zoomScale += 1;
                    moved = true;
                }
            } else if (TouchInput.wheelY > 0) {
                if (this._zoomScale > 1) {
                    this._zoomScale -= 1;
                    moved = true;
                }
            }

            // Centralizar no jogador com OK / Enter
            if (Input.isTriggered('ok')) {
                const coords = this.getPlayerMapCoordinates(this._displayMode);
                this._camRealX = coords.x;
                this._camRealY = coords.y;
                moved = true;
            }

            // Arrastar com mouse / touch
            if (TouchInput.isTriggered()) {
                this._isDragging = true;
                this._dragStartX = TouchInput.x;
                this._dragStartY = TouchInput.y;
            } else if (TouchInput.isPressed() && this._isDragging) {
                const dx = TouchInput.x - this._dragStartX;
                const dy = TouchInput.y - this._dragStartY;
                if (Math.abs(dx) >= this._zoomScale || Math.abs(dy) >= this._zoomScale) {
                    const stepFactor = this._displayMode === "local" ? 4 : 1;
                    this._camRealX -= Math.floor(dx / this._zoomScale) * stepFactor;
                    this._camRealY -= Math.floor(dy / this._zoomScale) * stepFactor;
                    this._dragStartX = TouchInput.x;
                    this._dragStartY = TouchInput.y;
                    moved = true;
                }
            } else if (TouchInput.isReleased()) {
                this._isDragging = false;
            }

            // Cancelar / Fechar mapa
            if (Input.isTriggered('cancel') || Input.isTriggered('worldMapKey') || TouchInput.isCancelled()) {
                SoundManager.playCancel();
                this.popScene();
                return;
            }

            if (moved) {
                this._needsRedraw = true;
            }
        }

        renderWorldMap() {
            if (!this._mapBitmap) return;
            const ctx = this._mapBitmap.context;
            const w = this._mapWidth;
            const h = this._mapHeight;
            const borderWidth = 8;
            const innerMargin = borderWidth;
            const innerW = w - innerMargin * 2;
            const innerH = h - innerMargin * 2;

            const scale = this._zoomScale;
            const tileW = Math.max(1, Math.ceil(innerW / scale));
            const tileH = Math.max(1, Math.ceil(innerH / scale));

            this.ensureTileBuffer(tileW, tileH);
            if (!this._tilePixels32) return;

            const pixels32 = this._tilePixels32;
            const fogColorU32 = U32_FOG;

            const startX = this._camRealX - Math.floor(tileW / 2);
            const startY = this._camRealY - Math.floor(tileH / 2);

            const scaleMode = this._displayMode || "overworld";
            const totalChunksX = (scaleMode === "local") ? 16384 : 512;
            const totalChunksY = (scaleMode === "local") ? 8192 : 256;

            const minChunkX = Math.floor(startX / 16);
            const maxChunkX = Math.floor((startX + tileW - 1) / 16);
            const minChunkY = Math.floor(startY / 16);
            const maxChunkY = Math.floor((startY + tileH - 1) / 16);

            for (let cy = minChunkY; cy <= maxChunkY; cy++) {
                const chunkTop = cy * 16;
                const chunkBottom = chunkTop + 15;
                const yStartInTile = Math.max(0, chunkTop - startY);
                const yEndInTile = Math.min(tileH - 1, chunkBottom - startY);

                const isOutOfPolarBounds = (cy < 0 || cy >= totalChunksY);
                const wrappedCy = Math.max(0, Math.min(totalChunksY - 1, cy));

                for (let cx = minChunkX; cx <= maxChunkX; cx++) {
                    const chunkLeft = cx * 16;
                    const chunkRight = chunkLeft + 15;
                    const xStartInTile = Math.max(0, chunkLeft - startX);
                    const xEndInTile = Math.min(tileW - 1, chunkRight - startX);

                    const wrappedCx = ((cx % totalChunksX) + totalChunksX) % totalChunksX;
                    const isExplored = !this._fogOfWar || _explorationManager.isChunkExplored(wrappedCx, wrappedCy);

                    if (isOutOfPolarBounds || !isExplored) {
                        const fillCol = isOutOfPolarBounds ? U32_POLAR : fogColorU32;
                        for (let ty = yStartInTile; ty <= yEndInTile; ty++) {
                            const rowOffset = ty * tileW;
                            for (let tx = xStartInTile; tx <= xEndInTile; tx++) {
                                pixels32[rowOffset + tx] = fillCol;
                            }
                        }
                    } else {
                        const chunkColors = _explorationManager.getChunkColorBuffer(wrappedCx, wrappedCy, scaleMode);
                        for (let ty = yStartInTile; ty <= yEndInTile; ty++) {
                            const chunkY = (startY + ty) & 15;
                            const srcRow = chunkY * 16;
                            const dstRow = ty * tileW;
                            for (let tx = xStartInTile; tx <= xEndInTile; tx++) {
                                const chunkX = (startX + tx) & 15;
                                pixels32[dstRow + tx] = chunkColors[srcRow + chunkX];
                            }
                        }
                    }
                }
            }

            this._tileBufferCtx.putImageData(this._tileImageData, 0, 0);

            ctx.save();
            ctx.beginPath();
            ctx.rect(innerMargin, innerMargin, innerW, innerH);
            ctx.clip();

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this._tileBufferCanvas, 0, 0, tileW, tileH, innerMargin, innerMargin, innerW, innerH);

            // Marcador do Jogador
            const realCoords = this.getPlayerMapCoordinates(scaleMode);
            const pScreenX = innerMargin + (realCoords.x - startX) * scale;
            const pScreenY = innerMargin + (realCoords.y - startY) * scale;

            if (pScreenX >= innerMargin - scale && pScreenX <= innerMargin + innerW + scale &&
                pScreenY >= innerMargin - scale && pScreenY <= innerMargin + innerH + scale) {
                ctx.save();
                ctx.shadowColor = '#ffff00';
                ctx.shadowBlur = 6;
                ctx.fillStyle = '#ff2222';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(pScreenX + scale / 2, pScreenY + scale / 2, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

            ctx.restore();

            this.drawCachedFrame(ctx, w, h, 'MAPA MUNDIAL', borderWidth);
            if (this._mapBitmap._baseTexture) this._mapBitmap._baseTexture.update();
        }
    }

    // =========================================================================
    // 8. APIs Globais Expostas
    // =========================================================================

    globalThis.Scene_WorldMap = Scene_WorldMap;
    globalThis.ProceduralWorldMap = {
        getExplorationManager: () => _explorationManager,
        registerTileColor: (biomeOrTileName, hexColor) => {
            _customTileColors[biomeOrTileName] = hexColor;
            _customTileUint32[biomeOrTileName] = hexToUint32(hexColor);
            _explorationManager.clearCache();
        },
        openWorldMap: () => {
            if (typeof SceneManager !== "undefined" && typeof Scene_WorldMap !== "undefined") {
                SceneManager.push(Scene_WorldMap);
            }
        },
        version: '2.0.0'
    };
})();
