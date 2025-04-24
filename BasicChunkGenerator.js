/*:
* @target MZ
* @plugindesc Carrega e descarrega tiles do mapa conforme a visão da câmera, com persistência usando GameSaver.
* @author [Seu Nome Aqui]
* @version 0.2.0 // Updated version
* @license MIT
*
* @param chunkWidth
* @text Largura do Chunk
* @type number
* @desc Largura de cada chunk em tiles.
* @default 2
*
* @param chunkHeight
* @text Altura do Chunk
* @type number
* @desc Altura de cada chunk em tiles.
* @default 2
*
* @param emptyTileId
* @text ID do Tile Vazio
* @type number
* @desc ID do tile que será usado para "descarregar" os chunks.
* @default 0
*/

(() => {
    const pluginName = "BasicChunkGenerator";
    const chunkWidth = Number(PluginManager.parameters(pluginName)['chunkWidth'] || 2);
    const chunkHeight = Number(PluginManager.parameters(pluginName)['chunkHeight'] || 2);
    const emptyTileId = Number(PluginManager.parameters(pluginName)['emptyTileId'] || 0);
    const _modifiedChunks = new Set(); // Adicionamos um Set para rastrear chunks modificados

    // Tornar _modifiedChunks globalmente acessível para o GameSaver
    globalThis.BasicChunkGenerator = globalThis.BasicChunkGenerator || {};
    globalThis.BasicChunkGenerator._modifiedChunks = _modifiedChunks;
    globalThis.chunkWidth = chunkWidth; // Make chunkWidth globally accessible
    globalThis.chunkHeight = chunkHeight; // Make chunkHeight globally accessible

    let _managedChunks = new Set();
    let _previousChunk = null;
    let _cameraSizeInTiles = { width: 0, height: 0 };

    function alterarTile(mapId, x, y, layer, newTileId) {
        if (!$gameMap || $gameMap.mapId() !== mapId || !$dataMap || !$dataMap.data) return;

        const width = $dataMap.width;
        const height = $dataMap.height;
        const index = layer * width * height + y * width + x;

        if (x >= 0 && x < width && y >= 0 && y < height && layer >= 0 && layer < 4) {
            const originalTileId = $gameMap.tileId(x, y, layer);
            if (originalTileId !== newTileId) {
                $dataMap.data[index] = newTileId;
                $gameMap.requestRefresh();
                // Marcamos o chunk como modificado
                const chunkX = Math.floor(x / chunkWidth);
                const chunkY = Math.floor(y / chunkHeight);
                _modifiedChunks.add(`${chunkX},${chunkY}`);
            }
        }
    }

    function loadChunk(chunkX, chunkY) {
        const chunkKey = `${chunkX},${chunkY}`;
        if (_managedChunks.has(chunkKey)) {
            return;
        }

        // ** Nova verificação para limites do mapa (coordenadas não negativas) **
        if (chunkX < 0 || chunkY < 0) {
            // Opcional: adicionar um log para depuração
            console.log(`Tentativa de carregar chunk fora dos limites: (${chunkX}, ${chunkY})`);
            return; // Não carrega chunks com coordenadas negativas
        }

        const mapId = $gameMap.mapId();
        const startX = chunkX * chunkWidth;
        const startY = chunkY * chunkHeight;

        const loadedData = window.GameSaver.loadTileChanges(mapId, startX, startY, chunkWidth, chunkHeight);

        if (loadedData && loadedData.length > 0) {
            loadedData.forEach(change => {
                alterarTile(mapId, change.x, change.y, change.layer, change.tileId);
            });
            _managedChunks.add(chunkKey);
        } else {
            // Nenhum dado salvo encontrado, solicitar os tiles para o Coordinator
            if (globalThis.WorldGenerationCoordinator && globalThis.WorldGenerationCoordinator.getChunkTiles) {
                globalThis.WorldGenerationCoordinator.getChunkTiles(mapId, chunkX, chunkY, (tiles) => {
                    if (tiles && tiles.length > 0) {
                        // Aplicar os tiles recebidos
                        tiles.forEach(tileInfo => {
                            alterarTile(mapId, tileInfo.x, tileInfo.y, tileInfo.layer, tileInfo.tileId);
                        });
                        // Salvar o chunk agora que ele foi gerado
                        window.GameSaver.saveTileChanges(mapId, startX, startY, chunkWidth, chunkHeight);
                        _managedChunks.add(chunkKey);
                    } else {
                        console.warn(`WorldGenerationCoordinator retornou um chunk vazio para ${chunkKey}`);
                        // Mesmo que o Coordinator retorne vazio, podemos salvar para marcar como "gerado"
                        window.GameSaver.saveTileChanges(mapId, startX, startY, chunkWidth, chunkHeight);
                        _managedChunks.add(chunkKey);
                    }
                });
            } else {
                console.warn("WorldGenerationCoordinator não encontrado ou não possui a função getChunkTiles.");
                // Fallback: Salvar um chunk vazio se o Coordinator não estiver disponível
                window.GameSaver.saveTileChanges(mapId, startX, startY, chunkWidth, chunkHeight);
                _managedChunks.add(chunkKey);
            }
        }
    }

    function unloadChunk(chunkX, chunkY) {
        const chunkKey = `${chunkX},${chunkY}`;
        if (!_managedChunks.has(chunkKey)) {
            return;
        }

        const mapId = $gameMap.mapId();
        const startX = chunkX * chunkWidth;
        const startY = chunkY * chunkHeight;

        // Save tile changes using GameSaver before unloading - REMOVIDO DAQUI, MOVIDO PARA unloadInvisibleChunks
        // window.GameSaver.saveTileChanges(mapId, startX, startY, chunkWidth, chunkHeight);

        _managedChunks.delete(chunkKey);

        for (let y = 0; y < chunkHeight; y++) {
            for (let x = 0; x < chunkWidth; x++) {
                for (let layer = 0; layer < 4; layer++) {
                    const tileX = startX + x;
                    const tileY = startY + y;
                    alterarTile(mapId, tileX, tileY, layer, emptyTileId);
                }
            }
        }
    }

    function getCurrentChunkCoordinates() {
        const playerX = $gamePlayer.x;
        const playerY = $gamePlayer.y;
        const chunkX = Math.floor(playerX / chunkWidth);
        const chunkY = Math.floor(playerY / chunkHeight);
        return { x: chunkX, y: chunkY };
    }

    function getCameraSizeInTiles() {
        const screenWidth = Graphics.width;
        const screenHeight = Graphics.height;
        const tileWidth = $gameMap.tileWidth();
        const tileHeight = $gameMap.tileHeight();

        const cameraWidthInTiles = Math.ceil(screenWidth / tileWidth);
        const cameraHeightInTiles = Math.ceil(screenHeight / tileHeight);

        return { width: cameraWidthInTiles, height: cameraHeightInTiles };
    }

    function getVisibleChunkCoordinates() {
        const centerChunk = getCurrentChunkCoordinates();
        const cameraWidthInChunks = Math.ceil(_cameraSizeInTiles.width / chunkWidth);
        const cameraHeightInChunks = Math.ceil(_cameraSizeInTiles.height / chunkHeight);

        const halfWidth = Math.floor(cameraWidthInChunks / 2) + 1;
        const halfHeight = Math.floor(cameraHeightInChunks / 2) + 1;

        const visibleChunks = new Set();
        for (let y = centerChunk.y - halfHeight; y <= centerChunk.y + halfHeight; y++) {
            for (let x = centerChunk.x - halfWidth; x <= centerChunk.x + halfWidth; x++) {
                visibleChunks.add(`${x},${y}`);
            }
        }
        return visibleChunks;
    }

    function loadVisibleChunks() {
        const visibleChunks = getVisibleChunkCoordinates();
        for (const chunkKey of visibleChunks) {
            const [chunkX, chunkY] = chunkKey.split(',').map(Number);
            loadChunk(chunkX, chunkY);
        }
    }

    function unloadInvisibleChunks() {
        const visibleChunks = getVisibleChunkCoordinates();
        const chunksToUnload = [];

        for (const chunkKey of _managedChunks) {
            if (!visibleChunks.has(chunkKey)) {
                const [chunkX, chunkY] = chunkKey.split(',').map(Number);
                const mapId = $gameMap.mapId();
                const startX = chunkX * chunkWidth;
                const startY = chunkY * chunkHeight;

                // Salva apenas se o chunk foi modificado
                if (_modifiedChunks.has(chunkKey)) {
                    window.GameSaver.saveTileChanges(mapId, startX, startY, chunkWidth, chunkHeight);
                    _modifiedChunks.delete(chunkKey); // Remove do registro de modificados após salvar
                }

                chunksToUnload.push(chunkKey);
            }
        }

        for (const chunkKey of chunksToUnload) {
            const [chunkX, chunkY] = chunkKey.split(',').map(Number);
            unloadChunk(chunkX, chunkY);
        }
    }

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        const currentChunk = getCurrentChunkCoordinates();
        _previousChunk = currentChunk;

        const cameraSize = getCameraSizeInTiles();
        _cameraSizeInTiles = cameraSize;
        this._cameraSizeInTiles = cameraSize;

        loadVisibleChunks();
    };

    const _Game_Player_updateMove = Game_Player.prototype.updateMove;
    Game_Player.prototype.updateMove = function() {
        const currentChunk = getCurrentChunkCoordinates();
        if (_previousChunk === null || currentChunk.x !== _previousChunk.x || currentChunk.y !== _previousChunk.y) {
            unloadInvisibleChunks();
            loadVisibleChunks();
            _previousChunk = currentChunk;
        }
        _Game_Player_updateMove.call(this);
    };
})();