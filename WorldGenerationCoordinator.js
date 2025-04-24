/*:
* @target MZ
* @plugindesc Coordena a geração de chunks do mundo, utilizando múltiplos geradores.
* @author [Seu Nome Aqui]
* @version 0.1.0
* @license MIT
* @help
* Este plugin gerencia o processo de geração de chunks do mundo.
* Ele orquestra a chamada de diversas funções de geração de outros plugins
* em uma ordem definida para criar o conteúdo de cada chunk conforme necessário.
*/
(() => {
    const pluginName = "WorldGenerationCoordinator";
    const parameters = PluginManager.parameters(pluginName);
    const processingFunctionName = parameters['Nome da Função de Processamento'] || 'processChunk';
    const initialTileId = Number(parameters['Estado Inicial do Chunk'] || 0);

    const generationFunctions = [
        "MarkovWorldGenerator.generate", // Gerador da base do mapa
        // Adicione ou reordene os nomes das funções aqui
    ];

    function createInitialChunkData(chunkX, chunkY, mapId, chunkWidth, chunkHeight) {
        const tiles = Array(chunkHeight).fill(null).map(() => Array(chunkWidth).fill(initialTileId));
        return {
            chunkX: chunkX,
            chunkY: chunkY,
            mapId: mapId,
            width: chunkWidth,
            height: chunkHeight,
            tiles: tiles
        };
    }

    window.WorldGenerationCoordinator = {
        generateChunk: function(chunkX, chunkY, mapId, chunkWidth, chunkHeight) {
            let chunkData = createInitialChunkData(chunkX, chunkY, mapId, chunkWidth, chunkHeight);

            for (const functionName of generationFunctions) {
                const parts = functionName.split('.');
                const objectName = parts[0];
                const methodName = parts[1];

                if (window[objectName] && window[objectName][methodName] && typeof window[objectName][methodName] === 'function') {
                    chunkData = window[objectName][methodName](chunkData);
                } else {
                    console.error(`Função ${functionName} não encontrada.`);
                }
            }

            return chunkData;
        },

        getChunkTiles: function(mapId, chunkX, chunkY, callback) {
            const chunkWidth = globalThis.chunkWidth || 32;
            const chunkHeight = globalThis.chunkHeight || 24;
            const chunkData = this.generateChunk(chunkX, chunkY, mapId, chunkWidth, chunkHeight);
            const tiles = [];

            if (chunkData && chunkData.tiles) {
                for (let y = 0; y < chunkHeight; y++) {
                    for (let x = 0; x < chunkWidth; x++) {
                        for (let layer = 0; layer < 4; layer++) { // Assumindo 4 camadas (0 a 3)
                            const tileId = chunkData.tiles[y][x]; // Assumindo que chunkData.tiles[y][x] contém o ID do tile
                            tiles.push({
                                x: chunkX * chunkWidth + x,
                                y: chunkY * chunkHeight + y,
                                layer: layer,
                                tileId: tileId
                            });
                        }
                    }
                }
            }

            callback(tiles);
        }
    };
})();