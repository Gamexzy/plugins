/*:pt
* @plugindesc Salva mapas Markov gerados nos saves do jogo.
* @author Gemini
* @help Este plugin estende o Gerador de Mapas Markov para salvar os mapas
* gerados nos saves do jogo, garantindo persistência.
*
* Comando Plugin: GerarMapaMarkov largura altura camadaBase
*
* Para usar, chame o comando de plugin "GerarMapaMarkov" para gerar e aplicar
* um mapa Markov. O mapa gerado será salvo automaticamente com o jogo.
*
* ATENÇÃO: Este plugin MODIFICA o sistema de salvamento do RPG Maker MZ.
*          Use com cuidado e faça backup do seu projeto antes de usar.
*
* @param cadeiaMarkovTreinadaJSON_FIXA
* @type text
* @desc JSON contendo a cadeia de Markov treinada (formato fixo).
*          Certifique-se de que o JSON esteja no formato correto!
* @default {"2048":{"2048":100},"2049":{"2049":100}}
*
* @command GerarMapaMarkov
* @text Gerar Mapa Markov
* @desc Gera e aplica um mapa Markov no mapa atual.
* @arg largura
* @type number
* @min 1
* @max 100
* @default 20
* @text Largura do Mapa
* @desc Largura do mapa Markov a ser gerado (em tiles).
* @arg altura
* @type number
* @min 1
* @max 100
* @default 15
* @text Altura do Mapa
* @desc Altura do mapa Markov a ser gerado (em tiles).
* @arg camadaBase
* @type number
* @min 0
* @max 2
* @default 0
* @text Camada Base
* @desc Camada do mapa onde o mapa Markov será aplicado (0=Inferior, 1=Superior, 2=Sombra).
*/
(() => {
         const pluginName = 'MarkovTileGenerator'; // Nome ÚNICO para o plugin (para evitar conflitos)
        
            const parameters = PluginManager.parameters(pluginName);
            const cadeiaMarkovTreinadaJSON_FIXA = parameters['cadeiaMarkovTreinadaJSON_FIXA'];
        
            let markovChain = {
                "2816": {
                    "2816": 26951,
                    "2864": 639
                  },
                  "2864": {
                    "2816": 651,
                    "2864": 1502
                  }
            }; // Variável para armazenar a cadeia de Markov
        
            try {
                console.log("markovChain:", markovChain); // DEBUG - Exibir a cadeia de Markov carregada
                console.log("Cadeia de Markov carregada com SUCESSO do JSON fixo!"); // Mensagem de sucesso
            } catch (e) {
                console.error("Erro ao carregar/parsear cadeia de Markov do JSON fixo! Verifique o formato do JSON em 'cadeiaMarkovTreinadaJSON_FIXA'.", e);
                markovChain = {}; // Em caso de erro, inicializa como objeto vazio para evitar problemas
                alert("Erro ao carregar Cadeia de Markov! Veja o console (F8) para detalhes."); // Alerta de erro para o usuário
            }
        
        
            // ** Alias da função DataManager.makeSaveContents **
            const _DataManager_makeSaveContents = DataManager.makeSaveContents;
            DataManager.makeSaveContents = function() {
                console.log("DataManager.makeSaveContents CHAMADO! (Salvamento)"); // *** DEBUG - Salvamento INICIADO ***
                console.log("Dados de $gameMap._data ANTES do save:\n", $gameMap._data); // *** DEBUG - Dados ANTES do Save ***
        
                const contents = _DataManager_makeSaveContents.call(this); // Chama a função original
                contents.markovMapData = $gameMap._data; // ** Salva os dados do mapa Markov no objeto de salvamento **
        
                console.log("Dados do mapa Markov ADICIONADOS ao save contents."); // DEBUG
                console.log("Objeto 'contents' FINAL (após adicionar markovMapData):\n", contents); // *** DEBUG - Objeto contents FINAL ***
        
                return contents; // Retorna o objeto de salvamento MODIFICADO
            };
        
            // ** Alias da função DataManager.extractSaveContents **
            const _DataManager_extractSaveContents = DataManager.extractSaveContents;
            DataManager.extractSaveContents = function(contents) {
                console.log("DataManager.extractSaveContents CHAMADO! (Carregamento)"); // *** DEBUG - Carregamento INICIADO ***
                console.log("Objeto 'contents' RECEBIDO no Load:\n", contents); // *** DEBUG - Objeto contents RECEBIDO ***
        
                _DataManager_extractSaveContents.call(this, contents); // Chama a função original
        
                if (contents.markovMapData) { // ** Verifica se há dados de mapa Markov salvos **
                    console.log("Dados de mapa Markov ENCONTRADOS no save contents."); // DEBUG
                    console.log("Dados de contents.markovMapData:\n", contents.markovMapData); // *** DEBUG - contents.markovMapData ***
        
                    $gameMap._data = contents.markovMapData; // ** Carrega os dados do mapa Markov de volta para $gameMap._data **
                    $gameMap.setup($gameMap.mapId()); // ** Refaz a configuração do mapa para aplicar os dados carregados **
        
                    console.log("Dados do mapa Markov CARREGADOS do save contents e APLICADOS ao mapa."); // DEBUG
                    console.log("Dados de $gameMap._data APÓS o Load e Setup do Mapa:\n", $gameMap._data); // *** DEBUG - $gameMap._data APÓS Load ***
        
          } else {
                    console.log("Nenhum dado de mapa Markov encontrado no save contents."); // DEBUG
                }
};
        
        
            PluginManager.registerCommand(pluginName, "GerarMapaMarkov", function(args) {
                console.log("Comando GerarMapaMarkov chamado!");
        
                const largura = parseInt(args.largura, 10) || 20; // Largura padrão: 20 tiles
                const altura = parseInt(args.altura, 10) || 15;  // Altura padrão: 15 tiles
                const camadaBase = parseInt(args.camadaBase, 10) || 0; // Camada base padrão: 0 (Inferior)
        
                console.log(`Gerando mapa Markov: Largura=${largura}, Altura=${altura}, Camada Base=${camadaBase}`); // DEBUG - Argumentos
        
                if (Object.keys(markovChain).length === 0) {
                    console.warn("Aviso: Cadeia de Markov NÃO CARREGADA. Verifique se o JSON em 'cadeiaMarkovTreinadaJSON_FIXA' está correto.");
                    alert("Aviso: Cadeia de Markov NÃO CARREGADA! Veja o console para mais detalhes.");
                    return;
                }
        
                console.log("Cadeia de Markov (antes da geração):\n", markovChain); // DEBUG - Cadeia de Markov
        
                // ** Função para gerar um mapa usando a Cadeia de Markov **
                const gerarMapaMarkov = () => {
                    const novoMapaData = []; // Array para armazenar os TileIds do novo mapa
        
                     // ** 1. Escolher um Tile inicial ALEATÓRIO da cadeia de Markov **
                    const tileIdsDisponiveis = Object.keys(markovChain); // Obtém um array de todos os TileIds na cadeia
                    if (tileIdsDisponiveis.length === 0) {
                        console.warn("Aviso: Cadeia de Markov vazia. Não é possível gerar mapa.");
                        alert("Aviso: Cadeia de Markov vazia. Treine a cadeia primeiro.");
                        return; // Sai da função se a cadeia estiver vazia
                    }
                    const indiceTileInicialAleatorio = Math.floor(Math.random() * tileIdsDisponiveis.length); // Escolhe um índice aleatório
                    const tileInicial = tileIdsDisponiveis[indiceTileInicialAleatorio]; // Pega o TileId correspondente ao índice aleatório
                    let tileAnterior = parseInt(tileInicial, 10);
        
                    console.log("DEBUG - Tile inicial para geração (ALEATÓRIO):", tileInicial, "(TileId Number:", tileAnterior, ")"); // DEBUG - Tile Inicial Aleatório
                     // ** 2. Gerar o mapa iterando por linhas e colunas **
                    for (let y = 0; y < altura; y++) {
                        let tileAcima = null;             // N
                        let tileEsquerdaAcima = null;      // NW
                        let tileDireitaAcima = null;       // NE
                        let tileAbaixo = null;            // S  (Na verdade, será da linha anterior, diagonal inferior esquerdo)
                        let tileEsquerdaAbaixo = null;     // SW (Na verdade, será da linha anterior, diagonal inferior esquerdo)
                        let tileDireitaAbaixo = null;      // SE (Na verdade, será da linha anterior, diagonal inferior direito)
        
        
                        for (let x = 0; x < largura; x++) {
                            let proximoTileId;
        
                            // ** Lógica de Transição Markov APRIMORADA (8 Vizinhos) **
                            let transicoesPossiveis = {}; // Objeto para armazenar transições combinadas
        
                            // ** Vizinho ESQUERDA (W - Horizontal Anterior) **
                            if (markovChain[tileAnterior]) {
                                Object.assign(transicoesPossiveis, markovChain[tileAnterior]);
                            }
                            // ** Vizinho ACIMA (N - Vertical Superior) **
                            if (y > 0 && tileAcima !== null && markovChain[tileAcima]) {
                                Object.assign(transicoesPossiveis, markovChain[tileAcima]);
                            }
                            // ** Vizinho ESQUERDA-ACIMA (NW - Diagonal Superior Esquerda) **
                            if (y > 0 && x > 0 && tileEsquerdaAcima !== null && markovChain[tileEsquerdaAcima]) {
                                Object.assign(transicoesPossiveis, markovChain[tileEsquerdaAcima]);
                            }
                            // ** Vizinho DIREITA-ACIMA (NE - Diagonal Superior Direita) **
                            if (y > 0 && x < largura - 1 && tileDireitaAcima !== null && tileDireitaAcima !== undefined && markovChain[tileDireitaAcima]) {
                                Object.assign(transicoesPossiveis, markovChain[tileDireitaAcima]);
                            }
                             // ** Vizinho ESQUERDA-ABAIXO (SW - Diagonal Inferior Esquerda -  LINHA ANTERIOR!) **
                            if (y > 0 && x > 0 && tileEsquerdaAbaixo !== null && markovChain[tileEsquerdaAbaixo]) {
                                Object.assign(transicoesPossiveis, markovChain[tileEsquerdaAbaixo]);
                            }
                            // ** Vizinho DIREITA-ABAIXO (SE - Diagonal Inferior Direita - LINHA ANTERIOR!) **
                            if (y > 0 && x < largura - 1 && tileDireitaAbaixo !== null && tileDireitaAbaixo !== undefined && markovChain[tileDireitaAbaixo]) {
                                Object.assign(transicoesPossiveis, markovChain[tileDireitaAbaixo]);
                            }
        
        
                            if (Object.keys(transicoesPossiveis).length > 0) {
                                // ** Se houver transições combinadas, escolhe um tile aleatório entre elas **
                                const tilesVizinhos = Object.keys(transicoesPossiveis);
                                const proximoTileIdStr = tilesVizinhos[Math.floor(Math.random() * tilesVizinhos.length)];
                                proximoTileId = parseInt(proximoTileIdStr, 10);
                            } else {
                                // ** Se não houver transições para nenhum dos vizinhos, usa o Tile padrão **
                                proximoTileId = 2048;
                                console.warn(`Aviso: Sem transições para vizinhos em x=${x}, y=${y}. Usando Tile padrão ${proximoTileId}. Tile Anterior (W): ${tileAnterior}, Tile Acima (N): ${tileAcima}, Tile EsqAcima (NW): ${tileEsquerdaAcima}, Tile DirAcima (NE): ${tileDireitaAcima}, Tile EsqAbaixo (SW): ${tileEsquerdaAbaixo}, Tile DirAbaixo (SE): ${tileDireitaAbaixo}`);
                            }
        
                            novoMapaData.push(proximoTileId);
        
                            // ** Atualiza os tiles de referência para a PRÓXIMA iteração **
                            tileDireitaAbaixo = tileDireitaAcima; // SE = NE (Linha anterior)
                            tileEsquerdaAbaixo = tileEsquerdaAcima; // SW = NW (Linha anterior)
                            tileDireitaAcima = tileAcima;      // NE = N  (Linha anterior)
                            tileEsquerdaAcima = tileAnterior;   // NW = W  (Linha atual)
                            tileAcima = proximoTileId;         // N = Tile atual
                            tileAnterior = proximoTileId;       // W = Tile atual
        
        
                            console.log(`DEBUG - Gerando Tile: x=${x}, y=${y}, TileId=${proximoTileId}, Tile Anterior (W)=${tileAnterior}, Tile Acima (N)=${tileAcima}, Tile EsqAcima (NW)=${tileEsquerdaAcima}, Tile DirAcima (NE)=${tileDireitaAcima}, Tile EsqAbaixo (SW)=${tileEsquerdaAbaixo}, Tile DirAbaixo (SE)=${tileDireitaAbaixo}`); // DEBUG - Tile Gerado (com 8 vizinhos)
                        }
                    }
        
                    console.log("Mapa Markov Gerado (TileIds):\n", novoMapaData); // Exibe os TileIds gerados no console
                    return novoMapaData; // ** Retorna novoMapaData para fora da função gerarMapaMarkov() **
                };
        
                const mapaGeradoData = gerarMapaMarkov(); // ** Captura o mapa gerado **
        
                if (!mapaGeradoData) { // Verifica se o mapa foi gerado com sucesso
                    return; // Sai se a geração falhou (por exemplo, cadeia de Markov vazia)
                }
        
                // ** 3. Aplicar o mapa gerado (usando mapaGeradoData) **
                aplicarMapa(mapaGeradoData, largura, altura, camadaBase);
                console.log("Mapa Markov aplicado ao mapa atual! (Camada Base)");
        
                alert("Mapa Markov Gerado e aplicado ao mapa atual! (Camada Base)"); // Alerta de conclusão - REMOVIDO o salvamento daqui!
        
            
            }); // ** FIM DO COMANDO PluginManager.registerCommand(...)
               
        
    function aplicarMapa(mapData, largura, altura, camadaBase) {
        const mapaAtual = $gameMap; // Pega o mapa atual do jogo
        const larguraMapaAtual = mapaAtual.width(); // Largura do mapa atual
        const alturaMapaAtual = mapaAtual.height(); // Altura do mapa atual
    
        console.log(`[aplicarMapa] Mapa Atual: Largura=${larguraMapaAtual}, Altura=${alturaMapaAtual}, Camada Base=${camadaBase}`); // DEBUG - Tamanho Mapa Atual
        console.log("[aplicarMapa] Verificando mapaAtual:", mapaAtual); // DEBUG - Check mapaAtual
        console.log("[aplicarMapa] Verificando $gameMap._data:", $gameMap._data); // DEBUG - Check $gameMap._data
    
        if (!mapaAtual) {
            console.error("[aplicarMapa] Erro: mapaAtual é null ou undefined!");
            return; // Impede de continuar se mapaAtual for inválido
        }
    
        if (!$gameMap._data) {
            console.error("[aplicarMapa] Erro: $gameMap._data é null ou undefined! Inicializando com array vazio.");
            $gameMap._data = []; // Initialize if undefined - WORKAROUND, but investigate root cause!
            // return; // For now, try to initialize and continue, but root cause needs investigation!
        }
    
    
        console.log("[aplicarMapa] Aplicando mapa gerado ao mapa atual..."); // DEBUG - Iniciando aplicação
        console.log(`[aplicarMapa] Tamanho de mapData: ${mapData.length}, Dimensões do mapa gerado: Largura=${largura}, Altura=${altura}`);
        console.log(`[aplicarMapa] Tamanho de $gameMap._data ANTES da aplicação: ${$gameMap._data.length}, Dimensões do mapa atual: Largura=${larguraMapaAtual}, Altura=${alturaMapaAtual}`);
    
    
        // ** Acesso direto a $gameMap._data e iteração **
        for (let y = 0; y < altura; y++) {
            for (let x = 0; x < largura; x++) {
                const index = y * largura + x;
                const dataIndex = index + camadaBase * larguraMapaAtual * alturaMapaAtual; // Índice CALCULADO
    
                console.log(`[aplicarMapa] DEBUG - Tile index: x=${x}, y=${y}, index=${index}, dataIndex=${dataIndex}, TileId=${mapData[y * largura + x]}`); // DEBUG - Index calculation
    
                if (dataIndex < 0 || dataIndex >= $gameMap._data.length) {
                    console.error(`[aplicarMapa] Erro: dataIndex (${dataIndex}) FORA DOS LIMITES de $gameMap._data (tamanho: ${$gameMap._data.length})! Pulando este tile.`);
                    continue; // Pula este tile se o índice estiver fora dos limites
                }
    
    
                // ** APLICAÇÃO DIRETA em $gameMap._data **
                try {
                    $gameMap._data[dataIndex] = mapData[index]; // Use dataIndex here
                    console.log(`[aplicarMapa] DEBUG - Tile Aplicado: x=${x}, y=${y}, index=${index}, dataIndex=${dataIndex}, TileId=${mapData[y * largura + x]}`);
                } catch (e) {
                    console.error(`[aplicarMapa] Erro ao aplicar tile em dataIndex ${dataIndex}:`, e);
                    continue; // Pula para o próximo tile em caso de erro ao setar
                }
            }
        }
    
        mapaAtual.requestRefresh(); // Pede para o mapa ser redesenhado para mostrar as mudanças
    
        console.log("[aplicarMapa] Mapa Markov aplicado ao mapa atual! (Camada Base)"); // DEBUG - Mapa Aplicado
    }
        
        
        })(); // FIM da IIFE (Immediately Invoked Function Expression)