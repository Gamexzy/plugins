/*:
 * @target MZ
 * @plugindesc Carrega e descarrega tiles do mapa conforme a visão da câmera, com persistência usando GameSaver. Suporta mapas em looping. Gerencia coordenadas reais e envolvidas internamente.
 * @author [Seu Nome Aqui]
 * @version 0.5.3 // Versão: Adicionado parâmetro de Modo de Depuração.
 * @license MIT
 *
 * @param chunkWidth
 * @text Largura do Chunk
 * @type number
 * @desc Largura de cada chunk em tiles.
 * @default 16
 *
 * @param chunkHeight
 * @text Altura do Chunk
 * @type number
 * @desc Altura de cada chunk em tiles.
 * @default 16
 *
 * @param emptyTileId
 * @text ID do Tile Vazio
 * @type number
 * @desc ID do tile que será usado para "descarregar" os chunks e para vizinhanças fora dos limites do mapa base.
 * @default 0
 *
 * @param enableUnloading
 * @text Habilitar Descarregamento
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Ativa ou desativa o descarregamento de chunks fora da visão (pode ser desativado para exportação).
 * @default true
 *
 * @param debugMode
 * @text Modo de Depuração
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Ativa logs detalhados no console para depuração.
 * @default false
 */

(() => {
    const pluginName = "BasicChunkGenerator";
    const parameters = PluginManager.parameters(pluginName);

    const chunkWidth = Number(parameters['chunkWidth'] || 16);
    const chunkHeight = Number(parameters['chunkHeight'] || 16);
    const emptyTileId = Number(parameters['emptyTileId'] || 0);
    const enableUnloading = String(parameters['enableUnloading'] || 'true') === 'true';
    const debugMode = String(parameters['debugMode'] || 'false') === 'true'; // Novo parâmetro

    // <<<<< Variáveis de estado do plugin >>>>>
    const _modifiedChunks = new Set();
    let _managedChunks = new Set();
    let _previousChunkReal = null;
    let _currentChunkReal = null;
    globalThis._realPlayerX = 0;
    globalThis._realPlayerY = 0;
    let _playerPosLastFrame = { x: -1, y: -1 };
    let _cameraSizeInTiles = { width: 0, height: 0 };
    let _updateMoveCounter = 0;
    // <<<<< Fim Variáveis de estado >>>>>


    // <<<<< Variáveis globais expostas >>>>>
    globalThis.BasicChunkGenerator = globalThis.BasicChunkGenerator || {};
    globalThis.BasicChunkGenerator._modifiedChunks = _modifiedChunks;
    globalThis.chunkWidth = chunkWidth;
    globalThis.chunkHeight = chunkHeight;
    globalThis.emptyTileId = emptyTileId;
    // <<<<< Fim Variáveis globais expostas >>>>>


    // <<<<< Funções Auxiliares >>>>>

    /**
     * Converte coordenadas globais "reais" para coordenadas envolvidas (looping) no mapa base.
     * Retorna {x: 0, y: 0} e loga um aviso se $dataMap, suas dimensões ou as coordenadas de entrada não forem válidas.
     * @param {number} globalRealX - Coordenada X real.
     * @param {number} globalRealY - Coordenada Y real.
     * @param {number} mapBaseWidth - Largura do mapa base em tiles.
     * @param {number} mapBaseHeight - Altura do mapa base em tiles.
     * @returns {{x: number, y: number}} As coordenadas envolvidas (0 a mapBaseWidth-1, 0 a mapBaseHeight-1).
     */
    function getWrappedCoordinates(globalRealX, globalRealY, mapBaseWidth, mapBaseHeight) {
         if (!$dataMap || mapBaseWidth <= 0 || mapBaseHeight <= 0) {
             if (debugMode) console.warn(`${pluginName}: getWrappedCoordinates chamada antes de $dataMap ou suas dimensões (${mapBaseWidth}x${mapBaseHeight}) estarem disponíveis. Coordenadas reais: (${globalRealX}, ${globalRealY}).`);
             return {x: 0, y: 0};
         }

         if (typeof globalRealX !== 'number' || typeof globalRealY !== 'number' || !Number.isFinite(globalRealX) || !Number.isFinite(globalRealY)) {
              if (debugMode) console.warn(`${pluginName}: getWrappedCoordinates chamada com coordenadas reais inválidas: (${globalRealX}, ${globalRealY}).`);
              return {x: 0, y: 0};
         }

         const wrappedX = (globalRealX % mapBaseWidth + mapBaseWidth) % mapBaseWidth;
         const wrappedY = (globalRealY % mapBaseHeight + mapBaseHeight) % mapBaseHeight;
         return { x: wrappedX, y: wrappedY };
    }

    /**
     * Altera um tile específico no array de dados do mapa base ($dataMap.data).
     */
    function alterarTile(mapId, xWrapped, yWrapped, layer, newTileId) {
        if (!$gameMap || $gameMap.mapId() !== mapId || !$dataMap || !$dataMap.data) {
            if (debugMode) console.warn(`${pluginName}.alterarTile: Não foi possível alterar tile. Mapa ou dados do mapa indisponíveis ou ID do mapa incorreto.`);
            return;
        }
        const width = $dataMap.width;
        const height = $dataMap.height;
        const index = layer * width * height + yWrapped * width + xWrapped;

        if (xWrapped >= 0 && xWrapped < width && yWrapped >= 0 && yWrapped < height && layer >= 0 && layer < 4) {
                 if ($dataMap.data && index < $dataMap.data.length) {
                    $dataMap.data[index] = newTileId;
                 } else {
                    if (debugMode) console.warn(`${pluginName}: Tentativa de alterar tile fora dos limites do array data ($dataMap.data[${index}]).`);
                 }
        } else {
             if (debugMode) console.warn(`${pluginName}: Tentativa de alterar tile com coordenadas envolvidas fora dos limites do mapa base.`);
        }
    }
    // <<<<< Fim Funções Auxiliares >>>>>


    // <<<<< Funções de CARREGAMENTO e DESCARREGAMENTO de Chunk >>>>>

    /**
     * Carrega um chunk específico no mapa base.
     */
    function loadChunk(chunkXReal, chunkYReal) {
        const chunkKey = `${chunkXReal},${chunkYReal}`;
        if (_managedChunks.has(chunkKey)) {
            return;
        }

        const mapId = $gameMap.mapId();
        if (!$dataMap) {
             if (debugMode) console.warn(`${pluginName}.loadChunk: Não foi possível carregar chunk real (${chunkXReal},${chunkYReal}). $dataMap ainda não carregou.`);
             return;
        }
        const mapBaseWidth = $dataMap.width;
        const mapBaseHeight = $dataMap.height;

        _managedChunks.add(chunkKey);

        let loadedFromSave = false;
        if (window.GameSaver && window.GameSaver.loadTileChanges) {
             const savedChangesList = window.GameSaver.loadTileChanges(mapId, chunkXReal, chunkYReal);
             if (savedChangesList && savedChangesList.length > 0) {
                 loadedFromSave = true;
                 savedChangesList.forEach(change => {
                      const xLocal = change.xLocal;
                      const yLocal = change.yLocal;
                      const layer = change.layer;
                      const newTileId = change.tileId;
                      const xGlobalReal = chunkXReal * chunkWidth + xLocal;
                      const yGlobalReal = chunkYReal * chunkHeight + yLocal;
                      const { x: xWrapped, y: yWrapped } = getWrappedCoordinates(xGlobalReal, yGlobalReal, mapBaseWidth, mapBaseHeight);
                      alterarTile(mapId, xWrapped, yWrapped, layer, newTileId);
                 });
             } else {
                 loadedFromSave = false;
             }
        } else {
            if (debugMode) console.warn(`${pluginName}.loadChunk: GameSaver não disponível ou loadTileChanges não encontrado. Não será possível carregar alterações salvas.`);
        }

        if (!loadedFromSave) {
             if (globalThis.WorldGenerationCoordinator && globalThis.WorldGenerationCoordinator.getChunkTiles) {
                 globalThis.WorldGenerationCoordinator.getChunkTiles(mapId, chunkXReal, chunkYReal, (tilesDataList) => {
                     if (tilesDataList && tilesDataList.length > 0) {
                         tilesDataList.forEach(tileInfo => {
                             const xGlobalReal = tileInfo.x;
                             const yGlobalReal = tileInfo.y;
                             const layer = tileInfo.layer;
                             const newTileId = tileInfo.tileId;
                             const { x: xWrapped, y: yWrapped } = getWrappedCoordinates(xGlobalReal, yGlobalReal, mapBaseWidth, mapBaseHeight);
                             alterarTile(mapId, xWrapped, yWrapped, layer, newTileId);
                         });
                         $gameMap.requestRefresh();
                         if (enableUnloading && window.GameSaver && window.GameSaver.saveChunkBaseData) {
                              window.GameSaver.saveChunkBaseData(mapId, chunkXReal, chunkYReal, tilesDataList);
                         } else if (enableUnloading && !window.GameSaver) {
                             if (debugMode) console.warn(`${pluginName}.loadChunk: GameSaver não disponível para salvar dados base gerados.`);
                         }
                     } else {
                         if (debugMode) console.warn(`${pluginName}: WorldGenerationCoordinator retornou um chunk vazio para o chunk real (${chunkXReal},${chunkYReal}).`);
                     }
                 });
             } else if (!enableUnloading && $dataMap && $dataMap.data) {
                 if (debugMode) console.warn(`${pluginName}: Chunk real (${chunkXReal},${chunkYReal}) assumido no $dataMap.data (Coordinator indisponível, descarregamento desativado). Pode não funcionar corretamente com looping.`);
                 $gameMap.requestRefresh();
             } else {
                  if (debugMode) console.warn(`${pluginName}: Não foi possível carregar o chunk real (${chunkXReal},${chunkYReal}). Necessário GameSaver com dados, WorldGenerationCoordinator ou descarregamento desativado com $dataMap.data base.`);
             }
        } else {
             $gameMap.requestRefresh();
        }
    }


    /**
     * Descarrega um chunk específico do mapa base.
     */
    function unloadChunk(chunkXReal, chunkYReal) {
         if (!enableUnloading) {
             return;
         }

         const chunkKey = `${chunkXReal},${chunkYReal}`;
         if (!_managedChunks.has(chunkKey)) {
             return;
         }

         const mapId = $gameMap.mapId();
         if (!$dataMap) {
             if (debugMode) console.warn(`${pluginName}: Não foi possível descarregar chunk real (${chunkXReal},${chunkYReal}). $dataMap ainda não carregou.`);
             return;
         }
         const mapBaseWidth = $dataMap.width;
         const mapBaseHeight = $dataMap.height;

         const chunkXWrapped = (chunkXReal % (mapBaseWidth / chunkWidth) + (mapBaseWidth / chunkWidth)) % (mapBaseWidth / chunkWidth);
         const chunkYWrapped = (chunkYReal % (mapBaseHeight / chunkHeight) + (mapBaseHeight / chunkHeight)) % (mapBaseHeight / chunkHeight);
         const startXWrapped = chunkXWrapped * chunkWidth;
         const startYWrapped = chunkYWrapped * chunkHeight;

         if (globalThis.BasicChunkGenerator._modifiedChunks.has(chunkKey)) {
             if (window.GameSaver && window.GameSaver.saveTileChanges && globalThis.GameSaver._tileChanges) {
                  const mapKey = mapId;
                  const changesToSave = globalThis.GameSaver._tileChanges[mapKey]?.[chunkKey] || [];

                  window.GameSaver.saveTileChanges(mapId, chunkXReal, chunkYReal, changesToSave);

                 globalThis.BasicChunkGenerator._modifiedChunks.delete(chunkKey);
             } else {
                  if (debugMode) console.warn(`${pluginName}: GameSaver ou sua função saveTileChanges/_tileChanges não acessível. Alterações no chunk real (${chunkXReal},${chunkYReal}) podem não ser salvas.`);
             }
         }

         _managedChunks.delete(chunkKey);

         for (let y = 0; y < chunkHeight; y++) {
             for (let x = 0; x < chunkWidth; x++) {
                 for (let layer = 0; layer < 4; layer++) {
                     const tileXWrapped = startXWrapped + x;
                     const tileYWrapped = startYWrapped + y;
                      const index = layer * mapBaseWidth * mapBaseHeight + tileYWrapped * mapBaseWidth + tileXWrapped;
                      if ($dataMap.data && index < $dataMap.data.length) {
                          $dataMap.data[index] = emptyTileId;
                      }
                 }
             }
         }
          $gameMap.requestRefresh();
     }
    // <<<<< Fim Funções de CARREGAMENTO e DESCARREGAMENTO de Chunk >>>>>


    // <<<<< Funções de Gerenciamento de Chunks Visíveis >>>>>

     /**
      * Calcula as coordenadas do chunk "real" em que o jogador se encontra atualmente.
      */
     function getCurrentChunkCoordinates() {
         const chunkXReal = Math.floor(_realPlayerX / chunkWidth);
         const chunkYReal = Math.floor(_realPlayerY / chunkHeight);
         return { x: chunkXReal, y: chunkYReal };
     }

     /**
      * Calcula o tamanho da área visível da câmera em tiles.
      */
     function getCameraSizeInTiles() {
         const screenWidth = Graphics.width;
         const screenHeight = Graphics.height;
         const tileWidth = $gameMap.tileWidth();
         const tileHeight = $gameMap.tileHeight();
         const cameraWidthInTiles = Math.ceil(screenWidth / tileWidth);
         const cameraHeightInTiles = Math.ceil(screenHeight / tileHeight);
         return { width: cameraWidthInTiles, height: cameraHeightInTiles };
     }

     /**
      * Determina as coordenadas "reais" de todos os chunks que devem estar visíveis ou próximos o suficiente para carregar.
      */
     function getVisibleChunkCoordinates() {
         if (!$dataMap) {
            if (debugMode) console.warn(`${pluginName}.getVisibleChunkCoordinates: $dataMap não disponível. Retornando Set vazio.`);
            return new Set();
         }
         if (!_currentChunkReal) {
            if (debugMode) console.warn(`${pluginName}.getVisibleChunkCoordinates: _currentChunkReal não disponível. Retornando Set vazio.`);
            return new Set();
         }

         const centerChunkReal = _currentChunkReal;
         const cameraWidthInTiles = Graphics.width / $gameMap.tileWidth();
         const cameraHeightInTiles = Graphics.height / $gameMap.tileHeight();
         const cameraWidthInChunks = Math.ceil(cameraWidthInTiles / chunkWidth);
         const cameraHeightInChunks = Math.ceil(cameraHeightInTiles / chunkHeight);

         const radiusX = Math.floor(cameraWidthInChunks / 2) + 2;
         const radiusY = Math.floor(cameraHeightInChunks / 2) + 2;

         const visibleChunksReal = new Set();
         for (let y = centerChunkReal.y - radiusY; y <= centerChunkReal.y + radiusY; y++) {
             for (let x = centerChunkReal.x - radiusX; x <= centerChunkReal.x + radiusX; x++) {
                 visibleChunksReal.add(`${x},${y}`);
             }
         }
         return visibleChunksReal;
     }

     /**
      * Carrega todos os chunks que devem estar visíveis.
      */
     function loadVisibleChunks() {
         const visibleChunksReal = getVisibleChunkCoordinates();
         if (visibleChunksReal.size === 0) {
             if (debugMode) console.warn(`${pluginName}.loadVisibleChunks: Nenhuns chunks visíveis para carregar.`);
             return;
         }
         for (const chunkKey of visibleChunksReal) {
             const [chunkXReal, chunkYReal] = chunkKey.split(',').map(Number);
             loadChunk(chunkXReal, chunkYReal);
         }
     }

     /**
      * Descarrega todos os chunks que não estão mais visíveis.
      */
     function unloadInvisibleChunks() {
         if (!enableUnloading) {
             return;
         }

         const visibleChunksReal = getVisibleChunkCoordinates();
         const chunksToUnloadReal = [];
         for (const chunkKeyReal of _managedChunks) {
             if (!visibleChunksReal.has(chunkKeyReal)) {
                  if (enableUnloading) {
                     chunksToUnloadReal.push(chunkKeyReal);
                  }
             }
         }
         for (const chunkKeyReal of chunksToUnloadReal) {
             const [chunkXReal, chunkYReal] = chunkKeyReal.split(',').map(Number);
             unloadChunk(chunkXReal, chunkYReal);
         }
     }
    // <<<<< Fim Funções de Gerenciamento de Chunks Visíveis >>>>>


    // <<<<< Hooks do RPG Maker MZ >>>>>

    // Hook na inicialização da cena do mapa.
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);

        if (window.GameSaver && window.GameSaver.loadBasicChunkGeneratorState) {
            const savedState = window.GameSaver.loadBasicChunkGeneratorState();

            if (savedState) {
                _realPlayerX = savedState.realPlayerX;
                _realPlayerY = savedState.realPlayerY;
                _currentChunkReal = savedState.currentChunkReal || getCurrentChunkCoordinates();
                _previousChunkReal = savedState.previousChunkReal || _currentChunkReal;
                _playerPosLastFrame = savedState.playerPosLastFrame;
            } else {
                 _realPlayerX = $gamePlayer.x;
                 _realPlayerY = $gamePlayer.y;
                 _currentChunkReal = getCurrentChunkCoordinates();
                 _previousChunkReal = _currentChunkReal;
                 _playerPosLastFrame = { x: $gamePlayer.x, y: $gamePlayer.y };
            }
        } else {
             if (debugMode) console.warn(`${pluginName}: GameSaver não disponível para carregar estado. Estado inicializado (sem persistência entre cenas/saves). Real Player: (${_realPlayerX}, ${_realPlayerY}).`);
             _realPlayerX = $gamePlayer.x;
             _realPlayerY = $gamePlayer.y;
             _currentChunkReal = getCurrentChunkCoordinates();
             _previousChunkReal = _currentChunkReal;
             _playerPosLastFrame = { x: $gamePlayer.x, y: $gamePlayer.y };
        }

        const cameraSize = getCameraSizeInTiles();
        _cameraSizeInTiles = cameraSize;
        this._cameraSizeInTiles = cameraSize;

         _managedChunks = new Set();
         globalThis.BasicChunkGenerator._modifiedChunks.clear();

        loadVisibleChunks();
    };


    // Hook na função de atualização de movimento do jogador.
    const _Game_Player_updateMove = Game_Player.prototype.updateMove;
    Game_Player.prototype.updateMove = function() {
        _updateMoveCounter++;

        const playerXThisFrameWrapped = $gamePlayer.x;
        const playerYThisFrameWrapped = $gamePlayer.y;

        _Game_Player_updateMove.call(this);

        if (!$dataMap) {
             if (debugMode) console.warn(`${pluginName}: $dataMap não disponível em Game_Player.prototype.updateMove. Pulando atualização de posição real.`);
             return;
        }
        const mapBaseWidth = $dataMap.width;
        const mapBaseHeight = $dataMap.height;

        let deltaRealX = 0;
        let deltaRealY = 0;

        if ($gamePlayer.x !== _playerPosLastFrame.x) {
            if ($gameMap.isLoopHorizontal()) {
                const deltaXWrapped = $gamePlayer.x - _playerPosLastFrame.x;
                if (deltaXWrapped === -(mapBaseWidth - 1)) {
                    deltaRealX = 1;
                } else if (deltaXWrapped === (mapBaseWidth - 1)) {
                    deltaRealX = -1;
                } else {
                    deltaRealX = deltaXWrapped;
                }
            } else {
                deltaRealX = $gamePlayer.x - _playerPosLastFrame.x;
            }
        }

        if ($gamePlayer.y !== _playerPosLastFrame.y) {
             if ($gameMap.isLoopVertical()) {
                const deltaYWrapped = $gamePlayer.y - _playerPosLastFrame.y;
                if (deltaYWrapped === -(mapBaseHeight - 1)) {
                    deltaRealY = 1;
                } else if (deltaYWrapped === (mapBaseHeight - 1)) {
                    deltaRealY = -1;
                } else {
                    deltaRealY = deltaYWrapped;
                }
             } else {
                deltaRealY = $gamePlayer.y - _playerPosLastFrame.y;
             }
        }

        _realPlayerX += deltaRealX;
        _realPlayerY += deltaRealY;

        _currentChunkReal = getCurrentChunkCoordinates();

        if (_previousChunkReal === null || _currentChunkReal.x !== _previousChunkReal.x || _currentChunkReal.y !== _previousChunkReal.y) {
             if (debugMode) console.log(`${pluginName}.Game_Player.updateMove: Mudança de chunk real detectada de (${_previousChunkReal?.x}, ${_previousChunkReal?.y}) para (${_currentChunkReal.x}, ${_currentChunkReal.y}). Acionando atualização de chunks.`);
             unloadInvisibleChunks();
             loadVisibleChunks();
             _previousChunkReal = _currentChunkReal;
         }

        _playerPosLastFrame = { x: $gamePlayer.x, y: $gamePlayer.y };

        if (deltaRealX !== 0 || deltaRealY !== 0) {
             if (window.GameSaver && window.GameSaver.saveBasicChunkGeneratorState) {
                 const currentState = {
                     realPlayerX: _realPlayerX,
                     realPlayerY: _realPlayerY,
                     currentChunkReal: _currentChunkReal,
                     previousChunkReal: _previousChunkReal,
                     playerPosLastFrame: _playerPosLastFrame
                 };
                 window.GameSaver.saveBasicChunkGeneratorState(currentState);
             } else {
                  if (debugMode) console.warn(`${pluginName}: GameSaver não disponível para salvar o estado do BasicChunkGenerator.`);
             }
        }
    };
    // <<<<< Fim Hooks do RPG Maker MZ >>>>>


    // <<<<< Funções Globais Expostas >>>>>

    /**
     * Carrega todos os chunks que correspondem ao tamanho do mapa base atual.
     */
    globalThis.BasicChunkGenerator.loadAllChunks = function() {
          if (!$dataMap) {
             if (debugMode) console.warn(`${pluginName}: Não é possível carregar todos os chunks do MAPA BASE (para exportação?). $dataMap ainda não carregou.`);
             return;
          }
          const mapWidthInTiles = $dataMap.width;
          const mapHeightInTiles = $dataMap.height;
          const chunksXInBase = Math.ceil(mapWidthInTiles / chunkWidth);
          const chunksYInBase = Math.ceil(mapHeightInTiles / chunkHeight);

          if (debugMode) console.log(`${pluginName}.loadAllChunks: Iniciando carregamento de todos os chunks do MAPA BASE (como chunks reais 0 a N)...`);
          for (let cy = 0; cy < chunksYInBase; cy++) {
              for (let cx = 0; cx < chunksXInBase; cx++) {
                  loadChunk(cx, cy);
              }
          }
          $gameMap.requestRefresh();
          if (debugMode) console.log(`${pluginName}.loadAllChunks: Carregamento de todos os chunks do mapa base (como reais) solicitado.`);
     };

    /**
     * Retorna as coordenadas "reais" atuais do jogador.
     */
    globalThis.BasicChunkGenerator.getRealPlayerCoordinates = function() {
        return { x: _realPlayerX, y: _realPlayerY };
    };

     /**
      * Retorna as coordenadas do chunk "real" atual do jogador.
      */
    globalThis.BasicChunkGenerator.getRealChunkCoordinates = function() {
         return _currentChunkReal;
     };


    /**
     * Expõe a função auxiliar para converter coordenadas globais reais para envolvidas.
     * Esta função agora é gerenciada internamente pelo BasicChunkGenerator.
     */
    globalThis.BasicChunkGenerator.getWrappedCoordinates = function(globalRealX, globalRealY) {
         if (!$dataMap || $dataMap.width <= 0 || $dataMap.height <= 0) {
             if (debugMode) console.warn(`${pluginName}: BasicChunkGenerator.getWrappedCoordinates (global) chamada antes de $dataMap ou suas dimensões (${$dataMap?.width}x${$dataMap?.height}) estarem disponíveis. Coordenadas reais: (${globalRealX}, ${globalRealY}).`);
             return {x: 0, y: 0};
         }
         const mapBaseWidth = $dataMap.width;
         const mapBaseHeight = $dataMap.height;
         return getWrappedCoordinates(globalRealX, globalRealY, mapBaseWidth, mapBaseHeight);
    };
    // <<<<< Fim Funções Globais Expostas >>>>>


    if (debugMode) console.log(`${pluginName}: Plugin carregado.`);
})();
