/*:
* @target MZ
* @plugindesc Fornece funcionalidade para salvar e carregar alterações de tile em jogos salvos.
* @author [Seu Nome Aqui]
* @version 1.1.2 // Versão incrementada para refletir a adição do reset
* @license MIT
* @help
* ============================================================================
* Introdução
* ============================================================================
* Este plugin fornece funções para salvar e carregar as alterações feitas nos
* tiles do mapa. Outros plugins que modificam os tiles podem usar esta
* funcionalidade para garantir que as modificações de tile sejam persistidas ao salvar
* e carregar o jogo.
*
* ============================================================================
* Instruções
* ============================================================================
* 1. Adicione este plugin ao seu projeto no RPG Maker MZ. Certifique-se de que
* ele esteja posicionado ANTES de qualquer outro plugin que dependa dele para
* salvar ou carregar alterações de tile.
* 2. Outros plugins podem acessar as funções de salvamento e carregamento
* através do objeto global `window.TileChangeSaver`.
*
* ============================================================================
* Funções Disponíveis para Outros Plugins:
* ============================================================================
* window.TileChangeSaver.getSavedTileChanges():
* Retorna o objeto contendo as alterações de tile salvas.
*
* window.TileChangeSaver.setSavedTileChanges(data):
* Define o objeto contendo as alterações de tile a serem salvas.
* `data` deve ser um objeto onde as chaves são IDs de mapa e os valores
* são objetos de chunks, que contêm arrays de objetos com as
* propriedades `x`, `y`, `tileId`, e `layer`.
*
* window.TileChangeSaver.applySavedTileChanges():
* Aplica as alterações de tile salvas ao mapa atual quando ele é carregado.
*
* window.TileChangeSaver.saveTileChanges(mapId, startX, startY, width, height):
* Salva o estado atual dos tiles dentro de um chunk específico do mapa.
*
* window.TileChangeSaver.loadTileChanges(mapId, startX, startY, width, height):
* Carrega (aplica) as alterações de tile salvas para um chunk específico do mapa.
*
* ============================================================================
* Notas
* ============================================================================
* - Este plugin MODIFICA o sistema de salvamento do RPG Maker MZ. Use com
* cuidado e faça backup do seu projeto antes de usar.
* - Certifique-se de que este plugin esteja ativado no gerenciador de plugins.
*
* ============================================================================
* Fim da Ajuda
* ============================================================================
*/

(() => {
    // const pluginName = "GameSaver"; // Removido pois não é mais usado sem logs
    let _savedGameData = {
        tileChanges: {},
        proceduralEvents: {} // Usaremos isso para todos os eventos procedurais (incluindo personagens)
    };

    window.GameSaver = {
        getSavedData: () => {
            return _savedGameData;
        },
        setSavedData: (data) => {
            _savedGameData = data || { tileChanges: {}, eventData: {}, characterData: {} };
        },
        applySavedData: () => {
            window.GameSaver.applySavedTileChanges();
            window.GameSaver.applySavedProceduralEvents(); // Chamada para aplicar eventos procedurais salvos
            // Aplicação de eventos virá depois
        },
        saveTileChanges: (mapId, startX, startY, width, height) => {
            if (!$gameMap || !$dataMap || !$dataMap.data || typeof globalThis.chunkWidth === 'undefined' || typeof globalThis.chunkHeight === 'undefined') {
                return;
            }
            const mapWidth = $dataMap.width;
            const mapHeight = $dataMap.height;
            const chunkX = Math.floor(startX / globalThis.chunkWidth);
            const chunkY = Math.floor(startY / globalThis.chunkHeight);
            const chunkKey = `${chunkX},${chunkY}`;

            if (!_savedGameData.tileChanges[mapId]) {
                _savedGameData.tileChanges[mapId] = {};
            }

            const changesForMap = _savedGameData.tileChanges[mapId];
            const changesForChunk = [];

            for (let y = startY; y < startY + height; y++) {
                for (let x = startX; x < startX + width; x++) {
                    if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
                        for (let layer = 0; layer < 4; layer++) {
                            const currentTileId = $gameMap.tileId(x, y, layer);
                            changesForChunk.push({ x: x, y: y, tileId: currentTileId, layer: layer });
                        }
                    }
                }
            }

            changesForMap[chunkKey] = changesForChunk;
        },
        loadTileChanges: (mapId, startX, startY, width, height) => {
            if (!_savedGameData.tileChanges[mapId]) {
                return null;
            }
            if (!$gameMap || !$dataMap || !$dataMap.data || typeof globalThis.chunkWidth === 'undefined' || typeof globalThis.chunkHeight === 'undefined') {
                return null;
            }

            const mapWidth = $dataMap.width;
            const mapHeight = $dataMap.height;
            const chunkX = Math.floor(startX / globalThis.chunkWidth);
            const chunkY = Math.floor(startY / globalThis.chunkHeight);
            const chunkKey = `${chunkX},${chunkY}`;
            const changesForMap = _savedGameData.tileChanges[mapId];
            let tilesLoadedCount = 0;
            const loadedChanges = [];

            if (changesForMap && changesForMap[chunkKey]) {
                const changesInChunk = changesForMap[chunkKey];
                changesInChunk.forEach(change => {
                    if (change.x >= 0 && change.x < mapWidth && change.y >= 0 && change.y < mapHeight && change.layer >= 0 && change.layer < 4) {
                        const index = change.layer * mapWidth * mapHeight + change.y * mapWidth + change.x;
                        $dataMap.data[index] = change.tileId;
                        tilesLoadedCount++;
                        loadedChanges.push(change);
                    }
                });

                if (tilesLoadedCount > 0) {
                    $gameMap.requestRefresh();
                }
            }
            return loadedChanges; // Retorna as alterações carregadas
        },
        saveProceduralEventData: (mapId, chunkX, chunkY, events) => {
            if (!_savedGameData.proceduralEvents[mapId]) {
                _savedGameData.proceduralEvents[mapId] = {};
            }
            const chunkKey = `${chunkX},${chunkY}`;
            const eventDataToSave = events.map(event => ({
                eventId: event.eventId, // ID do evento na base de dados ($dataMap.events)
                xInChunk: event.x - (chunkX * globalThis.chunkWidth), // Posição X relativa ao chunk
                yInChunk: event.y - (chunkY * globalThis.chunkHeight)
                // Podemos adicionar mais propriedades aqui se necessário
            }));
            _savedGameData.proceduralEvents[mapId][chunkKey] = eventDataToSave;
        },
        loadProceduralEventData: (mapId, chunkX, chunkY) => {
            if (!_savedGameData.proceduralEvents[mapId]) {
                return null;
            }
            const chunkKey = `${chunkX},${chunkY}`;
            return _savedGameData.proceduralEvents[mapId][chunkKey] || null;
        },
        applySavedTileChanges: () => {
            const mapId = $gameMap.mapId();
            if (_savedGameData.tileChanges[mapId] && $gameMap && $dataMap && $dataMap.data) {
                const mapChanges = _savedGameData.tileChanges[mapId];
                const width = $dataMap.width;
                const height = $dataMap.height;
                let changesApplied = 0;

                for (const chunkKey in mapChanges) {
                    if (mapChanges.hasOwnProperty(chunkKey)) {
                        const changesInChunk = mapChanges[chunkKey];
                        changesInChunk.forEach(change => {
                            if (change.x >= 0 && change.x < width && change.y >= 0 && change.y < height && change.layer >= 0 && change.layer < 4) {
                                const index = change.layer * width * height + change.y * width + change.x;
                                $dataMap.data[index] = change.tileId;
                                changesApplied++;
                            }
                        });
                    }
                }
            }
        },
        applySavedProceduralEvents: () => {
            const mapId = $gameMap.mapId();
            if (_savedGameData.proceduralEvents[mapId] && $gameMap) {
                for (const chunkKey in _savedGameData.proceduralEvents[mapId]) {
                    if (_savedGameData.proceduralEvents[mapId].hasOwnProperty(chunkKey)) {
                        const [chunkXStr, chunkYStr] = chunkKey.split(',');
                        const chunkX = parseInt(chunkXStr);
                        const chunkY = parseInt(chunkYStr);
                        const eventsInChunk = _savedGameData.proceduralEvents[mapId][chunkKey];
                        const startX = chunkX * globalThis.chunkWidth;
                        const startY = chunkY * globalThis.chunkHeight;

                        eventsInChunk.forEach(eventData => {
                            let eventX = startX + eventData.xInChunk;
                            let eventY = startY + eventData.yInChunk;
                            let newEventId = $gameMap._events.length > 0 ? Math.max(...$gameMap._events.map(e => e ? e._eventId : 0)) + 1 : 1; // Simple way to get a new event ID

                            if (eventData.eventId) {
                                const originalEventData = $dataMap.events[eventData.eventId];
                                if (originalEventData) {
                                    const newEvent = new Game_Event($gameMap.mapId(), newEventId);
                                    newEvent.setPosition(eventX, eventY);
                                    newEvent.copyFrom(originalEventData); // Copia as propriedades do evento original
                                    $gameMap._events[newEventId] = newEvent;
                                } else {
                                    console.warn(`Evento com ID ${eventData.eventId} não encontrado na base de dados.`);
                                }
                            }
                        });
                    }
                }
                $gameMap.requestRefresh(); // Solicita um refresh do mapa para mostrar os novos eventos
            }
        },
        resetSavedData: () => { // Adicionamos a função para resetar os dados
            _savedGameData = { tileChanges: {}, proceduralEvents: {} };
        }
    };

    // --- Integração com o Sistema de Save/Load ---

    const _DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        const contents = _DataManager_makeSaveContents.call(this);
        contents.gameSaverData = JSON.parse(JSON.stringify(window.GameSaver.getSavedData()));
        return contents;
    };

    const _DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _DataManager_extractSaveContents.call(this, contents);
        if (contents.gameSaverData) {
            window.GameSaver.setSavedData(JSON.parse(JSON.stringify(contents.gameSaverData)));
        } else {
            window.GameSaver.setSavedData({ tileChanges: {}, eventData: {}, characterData: {} });
        }
    };

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        window.GameSaver.applySavedData();
    };

    // Hook na função de novo jogo para resetar os dados do GameSaver
    const _DataManager_setupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function() {
        _DataManager_setupNewGame.call(this);
        window.GameSaver.resetSavedData();
    };

})();