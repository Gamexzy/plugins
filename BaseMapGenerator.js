/*:
 * @plugindesc Gerador de Mapa Base Markov para Chunks.
 * @author Gemini (Adaptado)
 */

(() => {
    const pluginName = "BaseMapGenerator";

    // Tenta obter a cadeia de Markov do plugin MarkovTileGenerator
    const markovChain = (() => {
        try {
            const params = PluginManager.parameters('MarkovTileGenerator');
            const jsonStr = params['cadeiaMarkovTreinadaJSON_FIXA'];
            if (jsonStr) {
                return JSON.parse(jsonStr);
            } else {
                console.warn("Aviso: Parâmetro 'cadeiaMarkovTreinadaJSON_FIXA' não definido no MarkovTileGenerator. Usando cadeia de Markov de exemplo.");
                return {
                    "2816": { "2816": 26951, "2864": 639 },
                    "2864": { "2816": 651, "2864": 1502 }
                };
            }
        } catch (e) {
            console.error("Erro ao carregar cadeia de Markov do MarkovTileGenerator:", e);
            return {
                "2816": { "2816": 26951, "2864": 639 },
                "2864": { "2816": 651, "2864": 1502 }
            }; // Cadeia de Markov de exemplo como fallback
        }
    })();

    window.BaseMapGenerator = window.BaseMapGenerator || {};

    window.BaseMapGenerator.generate = function(chunkData) {
        const { chunkX, chunkY, mapId, width, height } = chunkData;
        const tiles = Array(height).fill(null).map(() => Array(width).fill(0)); // Inicializa com tiles vazios

        if (Object.keys(markovChain).length === 0) {
            console.warn("Aviso: Cadeia de Markov não carregada no BaseMapGenerator.");
            return chunkData; // Retorna chunkData original se a cadeia estiver vazia
        }

        const novoMapaData = []; // Array 1D para armazenar os IDs dos tiles gerados

        // Escolher um Tile inicial aleatório da cadeia de Markov
        const tileIdsDisponiveis = Object.keys(markovChain);
        if (tileIdsDisponiveis.length === 0) {
            console.warn("Aviso: Cadeia de Markov vazia. Não é possível gerar mapa base.");
            return chunkData;
        }
        const indiceTileInicialAleatorio = Math.floor(Math.random() * tileIdsDisponiveis.length);
        const tileInicial = tileIdsDisponiveis[indiceTileInicialAleatorio];
        let tileAnterior = parseInt(tileInicial, 10);

        for (let y = 0; y < height; y++) {
            let tileAcima = (y > 0 && x < novoMapaData.length) ? parseInt(novoMapaData[(y - 1) * width + x], 10) : null;
            let tileEsquerdaAcima = (y > 0 && x > 0 && (y - 1) * width + (x - 1) < novoMapaData.length) ? parseInt(novoMapaData[(y - 1) * width + (x - 1)], 10) : null;
            let tileDireitaAcima = (y > 0 && x < width - 1 && (y - 1) * width + (x + 1) < novoMapaData.length) ? parseInt(novoMapaData[(y - 1) * width + (x + 1)], 10) : null;
            let tileEsquerdaAbaixo = (y > 1 && x > 0 && (y - 2) * width + (x - 1) < novoMapaData.length) ? parseInt(novoMapaData[(y - 2) * width + (x - 1)], 10) : null;
            let tileDireitaAbaixo = (y > 1 && x < width - 1 && (y - 2) * width + (x + 1) < novoMapaData.length) ? parseInt(novoMapaData[(y - 2) * width + (x + 1)], 10) : null;

            for (let x = 0; x < width; x++) {
                let proximoTileId;
                let transicoesPossiveis = {};

                if (markovChain[tileAnterior]) {
                    Object.assign(transicoesPossiveis, markovChain[tileAnterior]);
                }
                if (tileAcima !== null && markovChain[tileAcima]) {
                    Object.assign(transicoesPossiveis, markovChain[tileAcima]);
                }
                if (tileEsquerdaAcima !== null && markovChain[tileEsquerdaAcima]) {
                    Object.assign(transicoesPossiveis, markovChain[tileEsquerdaAcima]);
                }
                if (tileDireitaAcima !== null && markovChain[tileDireitaAcima]) {
                    Object.assign(transicoesPossiveis, markovChain[tileDireitaAcima]);
                }
                if (tileEsquerdaAbaixo !== null && markovChain[tileEsquerdaAbaixo]) {
                    Object.assign(transicoesPossiveis, markovChain[tileEsquerdaAbaixo]);
                }
                if (tileDireitaAbaixo !== null && markovChain[tileDireitaAbaixo]) {
                    Object.assign(transicoesPossiveis, markovChain[tileDireitaAbaixo]);
                }

                if (Object.keys(transicoesPossiveis).length > 0) {
                    const tilesVizinhos = Object.keys(transicoesPossiveis);
                    const proximoTileIdStr = tilesVizinhos[Math.floor(Math.random() * tilesVizinhos.length)];
                    proximoTileId = parseInt(proximoTileIdStr, 10);
                } else {
                    proximoTileId = 2048; // Tile padrão caso não haja transição
                }

                novoMapaData.push(proximoTileId);
                tiles[y][x] = proximoTileId;

                tileDireitaAbaixo = tileDireitaAcima;
                tileEsquerdaAbaixo = tileEsquerdaAcima;
                tileDireitaAcima = tileAcima;
                tileEsquerdaAcima = tileAnterior;
                tileAcima = proximoTileId;
                tileAnterior = proximoTileId;
            }
        }

        chunkData.tiles = tiles;
        return chunkData;
    };
})();