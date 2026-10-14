/*:
 * @target MZ
 * @plugindesc [Procedural] Minimapa em tempo real na tela com moldura metálica e Mapa Mundial explorável no menu com névoa de guerra.
 * @author Seu Nome Aqui
 * @version 1.0.0
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
 *
 * 2. Mapa Mundial no Menu e Tecla 'M':
 *    - Acessível pelo Menu Principal (opção "Mapa") ou pressionando 'M' no mapa.
 *    - Visualização grande e navegável (arraste com o mouse ou use as setas).
 *    - Zoom configurável, botão de centralizar no jogador e painel com coordenadas
 *      reais (X, Y) e nome do bioma.
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
    const parameters = PluginManager.parameters(pluginName);

    const minimapX = Number(parameters['Minimap X'] || 20);
    const minimapY = Number(parameters['Minimap Y'] || 20);
    const minimapWidth = Number(parameters['Minimap Width'] || 160);
    const minimapHeight = Number(parameters['Minimap Height'] || 120);
    const explorationRadius = Number(parameters['Exploration Radius'] || 3);
    const mapKeyName = String(parameters['Map Key'] || 'M').toUpperCase();
    const menuCommandText = String(parameters['Menu Command Text'] || 'Mapa');
    const enableFogOfWar = String(parameters['Enable Fog of War'] || 'false') === 'true';
    const debugMode = String(parameters['debugMode'] || 'false') === 'true';

    // Registra a tecla de atalho no Input do RPG Maker MZ
    const keyCodes = {
        'M': 77, 'N': 78, 'B': 66, 'V': 86, 'C': 67, 'X': 88, 'Z': 90,
        'TAB': 9, 'SPACE': 32, 'F': 70
    };
    const targetKeyCode = keyCodes[mapKeyName] || 77;
    Input.keyMapper[targetKeyCode] = 'worldMapKey';
    Input.keyMapper[70] = 'fogToggleKey';

    // =========================================================================
    // 1. Tabela e Gerenciamento de Cores por Tile ID e Biomas
    // =========================================================================

    // Mapeamento direto de ID de Autotile base (Shape 0) para sua cor visual real no tileset 1:1
    const _tileIdColors = {
        2048: '#87ceeb', // River / Water (Azul claro límpido)
        2096: '#143864', // Deep Sea (Mar aberto)
        2528: '#5c90b8', // Icy Water (Água gelada polar)
        2816: '#3a783a', // Tier 0: Plains / Grama verde de vale
        2864: '#2d5e2d', // Forest / Grama escura
        2912: '#c29a64', // Tier 1: Low Hills / Encosta suave bege-areia
        2960: '#8b3a1a', // Tier 2: High Plateau / Platô alto terracota
        3008: '#7d7d7d', // Tier 3: Peak / Cume de pedra cinza
        3104: '#c29a64', // Hills
        3152: '#7d7d7d', // Mountain
        3200: '#dfbd5f', // Sand
        3296: '#eef5f8', // Snow
        3440: '#d5bb7e', // Beach
        4016: '#f0f6fa', // Snow Peak
        4352: '#111111'  // Cliff Shadow / Paredão de sombra de relevo
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
        'Swamp': '#43593e'
    };

    /**
     * Determina a cor visual do tile pelo seu Tile ID (resolvendo blocos de autotiles de 48 variações).
     */
    function getColorForTileId(tileId) {
        if (!tileId || tileId <= 0) return null;
        // Identifica o tile base (shape 0 do autotile)
        const baseAutotileId = Math.floor((tileId - 2048) / 48) * 48 + 2048;
        if (_tileIdColors[baseAutotileId]) {
            return _tileIdColors[baseAutotileId];
        }
        // Fallback por tipo de autotile
        const kind = Math.floor((tileId - 2048) / 48);
        if (kind === 0) return _tileIdColors[2048]; // Coast
        if (kind === 1) return _tileIdColors[2096]; // Sea
        if (kind === 10) return _tileIdColors[2528]; // Icy Water
        if (kind === 16) return _tileIdColors[2816]; // Plains
        if (kind === 18) return _tileIdColors[2912]; // Mountain
        if (kind === 19) return _tileIdColors[2960]; // Snowy
        if (kind === 20) return _tileIdColors[3008]; // Forest
        if (kind === 26) return _tileIdColors[3296]; // Savanna
        if (kind === 32) return _tileIdColors[3584]; // Desert
        if (kind === 34) return _tileIdColors[3680]; // Swamp
        if (kind === 40) return _tileIdColors[3968]; // Tundra
        return null;
    }

    /**
     * Retorna a cor hexadecimal para um tile ou bioma, com auto-cálculo inteligente para novos biomas.
     */
    function getTileColor(biomeName, envData) {
        if (_customTileColors[biomeName]) {
            return _customTileColors[biomeName];
        }

        // Se o bioma ainda não foi cadastrado manualmente, calcula uma cor natural baseada no ambiente
        if (envData) {
            const h = envData.height ?? 0;
            const temp = envData.temp ?? 20;
            const hum = envData.humidity ?? 50;

            if (h < -70) return '#143864'; // Mar aberto
            if (h < 0) return '#3890c8'; // Costa / água rasa
            if (h > 220) return (temp < 10) ? '#eef5f8' : '#757169'; // Neve alta ou Rocha

            if (temp < 0) return '#eef5f8'; // Neve
            if (temp < 8) return '#688775'; // Frio/Tundra

            if (temp > 24 && hum < 38) return '#dfbd5f'; // Deserto
            if (temp > 18 && hum < 46) return '#a2944b'; // Savana
            if (hum > 70) return (temp > 20) ? '#43593e' : '#235028'; // Pântano / Floresta densa
            if (hum > 50) return '#235028'; // Floresta
            return '#568b44'; // Planície padrão
        }

        return '#568b44';
    }

    // =========================================================================
    // 2. ExplorationManager (Rastreamento de Descoberta & Save)
    // =========================================================================

    class ExplorationManager {
        constructor() {
            this._exploredChunks = new Set(); // Armazena "chunkX,chunkY"
            this._exploredTilesCache = new Map(); // Cache de cores por tile para renderização instantânea
        }

        clear() {
            this._exploredChunks.clear();
            this._exploredTilesCache.clear();
        }

        isChunkExplored(chunkX, chunkY) {
            return this._exploredChunks.has(`${chunkX},${chunkY}`);
        }

        markChunkExplored(chunkX, chunkY) {
            const key = `${chunkX},${chunkY}`;
            if (!this._exploredChunks.has(key)) {
                this._exploredChunks.add(key);
                return true;
            }
            return false;
        }

        updateExplorationAround(realX, realY) {
            const cWidth = globalThis.chunkWidth || 4;
            const cHeight = globalThis.chunkHeight || 4;
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

        getTileColorAt(worldX, worldY) {
            const key = `${worldX},${worldY}`;
            if (this._exploredTilesCache.has(key)) {
                return this._exploredTilesCache.get(key);
            }

            let color = null;

            // 1. Se estiver dentro dos limites do mapa atual carregado, lê diretamente o tile real desenhado
            if (typeof $dataMap !== 'undefined' && $dataMap && $dataMap.data) {
                const w = $dataMap.width;
                const h = $dataMap.height;
                if (worldX >= 0 && worldX < w && worldY >= 0 && worldY < h) {
                    const tileL0 = $dataMap.data[worldY * w + worldX] || 0;
                    const tileL1 = $dataMap.data[w * h + worldY * w + worldX] || 0;
                    const activeTile = (tileL1 > 0) ? tileL1 : tileL0;
                    if (activeTile > 0) {
                        color = getColorForTileId(activeTile);
                    }
                }
            }

            // 2. Se não encontrou no $dataMap (fora do mapa ou mapa infinito), consulta as camadas do PerlinNoiseGenerator
            if (!color && globalThis.PerlinNoiseGenerator) {
                if (typeof globalThis.PerlinNoiseGenerator.getLayersAt === 'function') {
                    const layers = globalThis.PerlinNoiseGenerator.getLayersAt(worldX, worldY);
                    const activeTile = layers.upperTile || layers.baseTile;
                    if (activeTile) {
                        color = getColorForTileId(activeTile);
                    }
                } else if (typeof globalThis.PerlinNoiseGenerator.getBaseTileAt === 'function') {
                    const activeTile = globalThis.PerlinNoiseGenerator.getBaseTileAt(worldX, worldY);
                    if (activeTile) {
                        color = getColorForTileId(activeTile);
                    }
                }
            }

            // 3. Fallback inteligente usando dados de clima/ambiente se o Perlin não tiver retornado tileId
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

            this._exploredTilesCache.set(key, color);
            return color;
        }

        getTotalExploredChunks() {
            return this._exploredChunks.size;
        }

        saveData() {
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
    const _DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        const contents = _DataManager_makeSaveContents.call(this);
        contents.proceduralWorldMapExploration = _explorationManager.saveData();
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

    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        _explorationManager.clear();
    };

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

        // 2. Borda externa escura metálica de 2px nos 4 lados
        ctx.fillStyle = '#22252a';
        ctx.fillRect(x, y, w, 2);                      // Topo
        ctx.fillRect(x, y + h - 2, w, 2);              // Base
        ctx.fillRect(x, y + 2, 2, h - 4);              // Esquerda
        ctx.fillRect(x + w - 2, y + 2, 2, h - 4);      // Direita

        ctx.shadowColor = 'transparent';

        // 3. Gradiente metálico chanfrado (Aço escovado) nas 4 faixas de borda
        const grad = ctx.createLinearGradient(x, y, x + w, y + h);
        grad.addColorStop(0, '#555b63');
        grad.addColorStop(0.3, '#7d848e');
        grad.addColorStop(0.5, '#484d54');
        grad.addColorStop(0.8, '#828a96');
        grad.addColorStop(1, '#3b4046');

        ctx.fillStyle = grad;
        ctx.fillRect(x + 2, y + 2, w - 4, bw - 2);              // Faixa superior
        ctx.fillRect(x + 2, y + h - bw, w - 4, bw - 2);          // Faixa inferior
        ctx.fillRect(x + 2, y + bw, bw - 2, h - bw * 2);          // Faixa esquerda
        ctx.fillRect(x + w - bw, y + bw, bw - 2, h - bw * 2);      // Faixa direita

        // 4. Friso chanfrado interno de 1px (contorno do interior, sem preencher o centro)
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
    // 4. Sprite_Minimap (HUD na Tela do Mapa)
    // =========================================================================

    class Sprite_Minimap extends Sprite {
        constructor() {
            super();
            this.x = minimapX;
            this.y = minimapY;
            this._lastPlayerRealX = null;
            this._lastPlayerRealY = null;
            this._lastPlayerDir = null;
            this._visibleState = true;

            this.createBitmaps();
        }

        createBitmaps() {
            this.bitmap = new Bitmap(minimapWidth, minimapHeight);
            this.setFrame(0, 0, minimapWidth, minimapHeight);

            // Renderiza imediatamente com as coordenadas atuais do jogador
            const realCoords = globalThis.BasicChunkGenerator?.getRealPlayerCoordinates
                ? globalThis.BasicChunkGenerator.getRealPlayerCoordinates()
                : { x: $gamePlayer?.x || 0, y: $gamePlayer?.y || 0 };
            const dir = $gamePlayer?.direction ? $gamePlayer.direction() : 2;

            _explorationManager.updateExplorationAround(realCoords.x, realCoords.y);
            this._lastPlayerRealX = realCoords.x;
            this._lastPlayerRealY = realCoords.y;
            this._lastPlayerDir = dir;
            this.renderMinimap(realCoords.x, realCoords.y, dir);
            console.log(`${pluginName}: Minimapa HUD inicializado em (${realCoords.x}, ${realCoords.y}).`);
        }

        update() {
            super.update();
            if (!this._visibleState || !$gamePlayer) return;

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
            const ctx = this.bitmap.context;
            const innerMargin = 7;
            const innerW = minimapWidth - innerMargin * 2;
            const innerH = minimapHeight - innerMargin * 2;

            // Limpa o interior do minimapa com névoa de fundo escura
            ctx.fillStyle = '#0a0c0e';
            ctx.fillRect(innerMargin, innerMargin, innerW, innerH);

            const scale = 3; // 3 pixels por tile
            const viewTileRadiusX = Math.ceil(innerW / (scale * 2));
            const viewTileRadiusY = Math.ceil(innerH / (scale * 2));
            const centerX = innerMargin + Math.floor(innerW / 2);
            const centerY = innerMargin + Math.floor(innerH / 2);

            const cWidth = globalThis.chunkWidth || 4;
            const cHeight = globalThis.chunkHeight || 4;

            // Clip para garantir que nada transborde da janela interna
            ctx.save();
            ctx.beginPath();
            ctx.rect(innerMargin, innerMargin, innerW, innerH);
            ctx.clip();

            // Renderiza os tiles visíveis dentro da janela do minimapa
            for (let dy = -viewTileRadiusY; dy <= viewTileRadiusY; dy++) {
                for (let dx = -viewTileRadiusX; dx <= viewTileRadiusX; dx++) {
                    const targetX = playerX + dx;
                    const targetY = playerY + dy;
                    const chunkX = Math.floor(targetX / cWidth);
                    const chunkY = Math.floor(targetY / cHeight);

                    // Só desenha se o chunk já foi explorado (Névoa de Guerra)
                    if (_explorationManager.isChunkExplored(chunkX, chunkY)) {
                        ctx.fillStyle = _explorationManager.getTileColorAt(targetX, targetY);
                        const px = centerX + dx * scale;
                        const py = centerY + dy * scale;
                        ctx.fillRect(px, py, scale, scale);
                    }
                }
            }

            // Marcador do Jogador (Seta dourada com borda indicando direção)
            this.drawPlayerMarker(ctx, centerX, centerY, playerDir);
            ctx.restore();

            // Desenha a moldura metálica vazada por cima das bordas
            drawMetallicFrame(ctx, 0, 0, minimapWidth, minimapHeight, '', innerMargin);
            this.bitmap._baseTexture.update();
        }

        drawPlayerMarker(ctx, cx, cy, dir) {
            ctx.save();
            ctx.translate(cx + 1, cy + 1);

            let angle = 0;
            if (dir === 8) angle = -Math.PI / 2; // Cima
            else if (dir === 2) angle = Math.PI / 2; // Baixo
            else if (dir === 4) angle = Math.PI; // Esquerda
            else if (dir === 6) angle = 0; // Direita

            ctx.rotate(angle);

            // Sombra do marcador
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.beginPath();
            ctx.moveTo(6, 1);
            ctx.lineTo(-4, 5);
            ctx.lineTo(-2, 1);
            ctx.lineTo(-4, -3);
            ctx.closePath();
            ctx.fill();

            // Seta dourada
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

        // Tecla de atalho para abrir o mapa mundial diretamente
        if (Input.isTriggered('worldMapKey') && !$gameMessage.isBusy()) {
            SoundManager.playCursor();
            SceneManager.push(Scene_WorldMap);
        }
    };

    // =========================================================================
    // 6. Integração com o Menu Principal (Window_MenuCommand & Scene_Menu)
    // =========================================================================

    const _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function() {
        _Window_MenuCommand_addOriginalCommands.call(this);
        this.addCommand(menuCommandText, 'worldMap', true);
    };

    const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler('worldMap', this.commandWorldMap.bind(this));
    };

    Scene_Menu.prototype.commandWorldMap = function() {
        SceneManager.push(Scene_WorldMap);
    };

    // =========================================================================
    // 7. Scene_WorldMap (Cena Completa do Mapa Mundial)
    // =========================================================================

    class Scene_WorldMap extends Scene_MenuBase {
        create() {
            super.create();
            this.createMapViewport();
            this.createInfoWindow();
        }

        createBackground() {
            super.createBackground();
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

            // Adiciona antes do _windowLayer para que as janelas fiquem sempre acima
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

            // Configurações de Navegação
            const realCoords = globalThis.BasicChunkGenerator?.getRealPlayerCoordinates
                ? globalThis.BasicChunkGenerator.getRealPlayerCoordinates()
                : { x: $gamePlayer?.x || 0, y: $gamePlayer?.y || 0 };

            this._camRealX = realCoords.x;
            this._camRealY = realCoords.y;
            this._zoomScale = 3; // 3px por tile no mapa grande
            this._isDragging = false;
            this._dragStartX = 0;
            this._dragStartY = 0;
            this._fogOfWar = enableFogOfWar;

            // Garante que o terreno ao redor da posição atual já está descoberto
            _explorationManager.updateExplorationAround(realCoords.x, realCoords.y);

            this.renderWorldMap();
        }

        createInfoWindow() {
            const rect = new Rectangle(16, Graphics.boxHeight - 86, Graphics.boxWidth - 32, 70);
            this._infoWindow = new Window_Base(rect);
            this.addWindow(this._infoWindow);
            this.updateInfoText();
        }

        updateInfoText() {
            if (!this._infoWindow) return;
            this._infoWindow.contents.clear();

            const realCoords = globalThis.BasicChunkGenerator?.getRealPlayerCoordinates
                ? globalThis.BasicChunkGenerator.getRealPlayerCoordinates()
                : { x: $gamePlayer?.x || 0, y: $gamePlayer?.y || 0 };

            let currentBiome = "Land";
            if (globalThis.PerlinNoiseGenerator && typeof globalThis.PerlinNoiseGenerator.getBiomeNameForCoords === 'function') {
                currentBiome = globalThis.PerlinNoiseGenerator.getBiomeNameForCoords(realCoords.x, realCoords.y);
            }

            const totalExplored = _explorationManager.getTotalExploredChunks();
            const fogText = this._fogOfWar ? "Ativa" : "Desativada";

            this._infoWindow.changeTextColor(ColorManager.systemColor());
            this._infoWindow.drawText("Posição Atual:", 10, 0, 120);
            this._infoWindow.drawText("Bioma:", 230, 0, 60);
            this._infoWindow.drawText("Chunks:", 420, 0, 70);
            this._infoWindow.drawText("Névoa:", 580, 0, 60);

            this._infoWindow.resetTextColor();
            this._infoWindow.drawText(`(${realCoords.x}, ${realCoords.y})`, 130, 0, 90);
            this._infoWindow.drawText(currentBiome, 290, 0, 120);
            this._infoWindow.drawText(`${totalExplored}`, 490, 0, 80);
            this._infoWindow.drawText(fogText, 640, 0, 100);

            this._infoWindow.changeTextColor(ColorManager.textColor(7));
            this._infoWindow.drawText("[F]: Alternar Névoa | [Scroll]: Zoom | [Setas/Mouse]: Mover | [Espaço]: Centralizar | [Esc]: Voltar", 10, 28, Graphics.boxWidth - 60);
        }

        update() {
            super.update();
            this.handleInput();
        }

        handleInput() {
            let moved = false;
            const scrollSpeed = 3;

            if (Input.isPressed('left')) { this._camRealX -= scrollSpeed; moved = true; }
            if (Input.isPressed('right')) { this._camRealX += scrollSpeed; moved = true; }
            if (Input.isPressed('up')) { this._camRealY -= scrollSpeed; moved = true; }
            if (Input.isPressed('down')) { this._camRealY += scrollSpeed; moved = true; }

            // Alternar Névoa de Guerra com a tecla 'F'
            if (Input.isTriggered('fogToggleKey')) {
                SoundManager.playCursor();
                this._fogOfWar = !this._fogOfWar;
                moved = true;
                this.updateInfoText();
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

            // Centralizar no jogador
            if (Input.isTriggered('ok')) {
                const realCoords = globalThis.BasicChunkGenerator?.getRealPlayerCoordinates
                    ? globalThis.BasicChunkGenerator.getRealPlayerCoordinates()
                    : { x: $gamePlayer?.x || 0, y: $gamePlayer?.y || 0 };
                this._camRealX = realCoords.x;
                this._camRealY = realCoords.y;
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
                    this._camRealX -= Math.floor(dx / this._zoomScale);
                    this._camRealY -= Math.floor(dy / this._zoomScale);
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
                this.renderWorldMap();
            }
        }

        renderWorldMap() {
            const ctx = this._mapBitmap.context;
            const w = this._mapWidth;
            const h = this._mapHeight;
            const borderWidth = 8;
            const innerMargin = borderWidth;
            const innerW = w - innerMargin * 2;
            const innerH = h - innerMargin * 2;

            // Fundo escuro de névoa de guerra no interior do mapa
            ctx.fillStyle = '#080a0c';
            ctx.fillRect(innerMargin, innerMargin, innerW, innerH);

            // Clip para garantir que a renderização fique contida dentro da moldura
            ctx.save();
            ctx.beginPath();
            ctx.rect(innerMargin, innerMargin, innerW, innerH);
            ctx.clip();

            const scale = this._zoomScale;
            const viewRadiusX = Math.ceil(innerW / (scale * 2));
            const viewRadiusY = Math.ceil(innerH / (scale * 2));
            const centerX = innerMargin + Math.floor(innerW / 2);
            const centerY = innerMargin + Math.floor(innerH / 2);

            const cWidth = globalThis.chunkWidth || 4;
            const cHeight = globalThis.chunkHeight || 4;

            // Renderiza terrenos (com ou sem névoa)
            for (let dy = -viewRadiusY; dy <= viewRadiusY; dy++) {
                for (let dx = -viewRadiusX; dx <= viewRadiusX; dx++) {
                    const worldX = this._camRealX + dx;
                    const worldY = this._camRealY + dy;
                    const chunkX = Math.floor(worldX / cWidth);
                    const chunkY = Math.floor(worldY / cHeight);

                    const isExplored = !this._fogOfWar || _explorationManager.isChunkExplored(chunkX, chunkY);

                    if (isExplored) {
                        ctx.fillStyle = _explorationManager.getTileColorAt(worldX, worldY);
                        ctx.fillRect(centerX + dx * scale, centerY + dy * scale, scale, scale);
                    }
                }
            }

            // Marcador da posição do Jogador
            const realCoords = globalThis.BasicChunkGenerator?.getRealPlayerCoordinates
                ? globalThis.BasicChunkGenerator.getRealPlayerCoordinates()
                : { x: $gamePlayer?.x || 0, y: $gamePlayer?.y || 0 };

            const playerScreenX = centerX + (realCoords.x - this._camRealX) * scale;
            const playerScreenY = centerY + (realCoords.y - this._camRealY) * scale;

            if (playerScreenX >= innerMargin && playerScreenX <= innerMargin + innerW &&
                playerScreenY >= innerMargin && playerScreenY <= innerMargin + innerH) {
                ctx.save();
                ctx.shadowColor = '#ffff00';
                ctx.shadowBlur = 6;
                ctx.fillStyle = '#ff2222';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(playerScreenX + scale / 2, playerScreenY + scale / 2, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
            ctx.restore();

            // Moldura metálica externa na tela inteira do mapa (vazada)
            drawMetallicFrame(ctx, 0, 0, w, h, 'MAPA MUNDIAL', borderWidth);
            this._mapBitmap._baseTexture.update();
        }
    }

    // =========================================================================
    // 8. APIs Globais Expostas
    // =========================================================================

    globalThis.ProceduralWorldMap = {
        getExplorationManager: () => _explorationManager,
        registerTileColor: (biomeOrTileName, hexColor) => {
            _customTileColors[biomeOrTileName] = hexColor;
        },
        openWorldMap: () => {
            SceneManager.push(Scene_WorldMap);
        },
        version: '1.0.0'
    };

    console.log(`${pluginName}: Plugin carregado.`);
})();
