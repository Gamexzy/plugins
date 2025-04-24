/*:
 * @plugindesc Gera mapas base usando uma cadeia de Markov para o WorldGenerationCoordinator.
 * @author Gemini (Refeito para WorldGeneration)
 * @help Este plugin gera um mapa base para chunks utilizando uma cadeia de Markov.
 * Ele é projetado para ser usado com o WorldGenerationCoordinator.
 *
 * @param cadeiaMarkovJSON
 * @type text
 * @desc JSON contendo a cadeia de Markov treinada. Certifique-se de que o JSON esteja no formato correto!
 * @default
 */
//=============================================================================

(() => {
    const pluginName = 'MarkovWorldGenerator';

    const parameters = PluginManager.parameters(pluginName);
    const cadeiaMarkovJSON = parameters['cadeiaMarkovJSON'];

    let markovChain = {}; // Variável para armazenar a cadeia de Markov

    try {
        if (cadeiaMarkovJSON) {
            markovChain = JSON.parse(cadeiaMarkovJSON);
            console.log("MarkovWorldGenerator: Cadeia de Markov carregada com sucesso do parâmetro.");
        } else {
            console.warn("MarkovWorldGenerator: Nenhum JSON de cadeia de Markov fornecido. O gerador pode não funcionar corretamente.");
            markovChain = { // Cadeia de Markov de exemplo como fallback
                "2816": { "2816": 26951, "2864": 639 },
                "2864": { "2816": 651, "2864": 1502 }
            };
        }
        console.log("MarkovWorldGenerator: Cadeia de Markov:", markovChain); // DEBUG
    } catch (e) {
        console.error("MarkovWorldGenerator: Erro ao carregar/parsear cadeia de Markov do parâmetro! Verifique o formato do JSON.", e);
        markovChain = {}; // Inicializa como objeto vazio em caso de erro
        alert("MarkovWorldGenerator: Erro ao carregar Cadeia de Markov! Veja o console (F8) para detalhes.");
    }

    window.MarkovWorldGenerator = window.MarkovWorldGenerator || {};

    window.MarkovWorldGenerator.generate = function(chunkData) {
        const { width, height } = chunkData;
        const tiles = Array(height).fill(null).map(() => Array(width).fill(0)); // Inicializa com tiles vazios

        if (Object.keys(markovChain).length === 0) {
            console.warn("MarkovWorldGenerator: Cadeia de Markov vazia. Não é possível gerar mapa.");
            return chunkData; // Retorna chunkData original se a cadeia estiver vazia
        }

        const novoMapaData = []; // Array 1D para armazenar os IDs dos tiles gerados

        // Escolher um Tile inicial aleatório da cadeia de Markov
        const tileIdsDisponiveis = Object.keys(markovChain);
        if (tileIdsDisponiveis.length === 0) {
            console.warn("MarkovWorldGenerator: Cadeia de Markov vazia. Não é possível gerar mapa base.");
            return chunkData;
        }
        const indiceTileInicialAleatorio = Math.floor(Math.random() * tileIdsDisponiveis.length);
        const tileInicial = tileIdsDisponiveis[indiceTileInicialAleatorio];
        let tileAnterior = parseInt(tileInicial, 10);

        for (let y = 0; y < height; y++) {
            let tileAcima = null;
            let tileEsquerdaAcima = null;
            let tileDireitaAcima = null;
            let tileEsquerdaAbaixo = null;
            let tileDireitaAbaixo = null;

            if (y > 0) {
                tileAcima = parseInt(novoMapaData[(y - 1) * width + 0], 10);
                if (0 > 0) tileEsquerdaAcima = parseInt(novoMapaData[(y - 1) * width + (0 - 1)], 10);
                if (0 < width - 1) tileDireitaAcima = parseInt(novoMapaData[(y - 1) * width + (0 + 1)], 10);
                if (y > 1 && 0 > 0) tileEsquerdaAbaixo = parseInt(novoMapaData[(y - 2) * width + (0 - 1)], 10);
                if (y > 1 && 0 < width - 1) tileDireitaAbaixo = parseInt(novoMapaData[(y - 2) * width + (0 + 1)], 10);
            }


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