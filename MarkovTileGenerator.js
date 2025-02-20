/*:
 * @target MZ
 * @plugindesc [PT-BR] Markov Tile Generator - Geração de mapas usando Cadeia de Markov (Dados Pré-treinados Fixos)
 * @author [SEU NOME AQUI] (Opcional)
 * @url https://github.com/SEU_GITHUB_AQUI/MarkovTileGenerator (Opcional - Link para seu repositório)
 *
 * @help
 * [PT-BR] Plugin MarkovTileGenerator (Versão com Dados Pré-treinados Fixos)
 *
 * Este plugin gera mapas de tile aleatórios usando um modelo de Cadeia de Markov pré-treinado,
 * cujos dados estão embutidos diretamente no código do plugin.
 *
 * Comandos do Plugin:
 *
 *   DesenharTileTeste x:valor y:valor z:valor tileId:valor
 *     - Desenha um Tile ID específico nas coordenadas X, Y, Z no mapa atual para teste.
 *     - x: Coordenada X do tile.
 *     - y: Coordenada Y do tile.
 *     - z: Camada do tile (0 para camada inferior, 1 para camada superior, 2 para sombras).
 *     - tileId: ID do Tile a ser desenhado.
 *     Exemplo: DesenharTileTeste x:10 y:8 z:0 tileId:2048
 *
 *   GerarMapaMarkov largura:valor altura:valor camadaBase:valor
 *     - Gera um novo mapa usando a Cadeia de Markov pré-treinada e aplica ao mapa atual.
 *     - largura: Largura do mapa a ser gerado (em tiles). Padrão: 20.
 *     - altura: Altura do mapa a ser gerado (em tiles). Padrão: 15.
 *     - camadaBase: Camada base para aplicar o mapa gerado (0, 1 ou 2). Padrão: 0 (Inferior).
 *     Exemplo: GerarMapaMarkov largura:30 altura:20 camadaBase:0
 *
 *   TreinarMarkov dadosTreinamento:JSON_STRING (COMANDO INATIVO NESTA VERSÃO)
 *     - Comando TreinarMarkov mantido para compatibilidade ou debug, mas **NÃO FUNCIONA** nesta versão fixa.
 *     - Os dados de treinamento são fixos e embutidos no código do plugin.
 *     - Este comando é apenas para referência e não terá efeito na geração de mapas nesta versão.
 *
 * Notas:
 *
 * - Esta versão do plugin utiliza uma cadeia de Markov pré-treinada, cujos dados
 *   estão diretamente incorporados no código-fonte do plugin (na variável 'cadeiaMarkovTreinadaJSON_FIXA').
 * - Para gerar mapas com estilos diferentes, é necessário treinar uma nova cadeia de Markov
 *   e substituir os dados JSON embutidos no código do plugin.
 * - Os comandos "SalvarMarkov" e "CarregarMarkov" foram removidos desta versão, pois o
 *   plugin agora utiliza dados de treinamento fixos.
 *
 * Termos de Uso:
 *
 * - [ESCREVA AQUI SEUS TERMOS DE USO - Ex: Livre para uso comercial e não comercial, etc.]
 * - Exemplo:  MIT License - Livre para uso comercial e não comercial, modificar e distribuir,
 *              desde que a atribuição original seja mantida.
 *
 * @version 1.0.0 (Versão com Dados Pré-treinados Fixos)
 * @date 2025-02-20
 *
 *
 * @command DesenharTileTeste
 * @text Desenhar Tile Teste
 * @desc Desenha um tile específico no mapa para testes.
 * @arg x
 *   @text X
 *   @type number
 *   @desc Coordenada X do tile.
 *   @default 0
 * @arg y
 *   @text Y
 *   @type number
 *   @desc Coordenada Y do tile.
 *   @default 0
 * @arg z
 *   @text Z (Camada)
 *   @type number
 *   @desc Camada do tile (0=Inferior, 1=Superior, 2=Sombra).
 *   @default 0
 * @arg tileId
 *   @text Tile ID
 *   @type number
 *   @desc ID do Tile a ser desenhado.
 *   @default 0
 *
 * @command GerarMapaMarkov
 * @text Gerar Mapa Markov
 * @desc Gera e aplica um mapa Markov ao mapa atual.
 * @arg largura
 *   @text Largura
 *   @type number
 *   @desc Largura do mapa gerado (em tiles).
 *   @default 20
 * @arg altura
 *   @text Altura
 *   @type number
 *   @desc Altura do mapa gerado (em tiles).
 *   @default 15
 * @arg camadaBase
 *   @text Camada Base
 *   @type number
 *   @desc Camada base para aplicar o mapa gerado (0, 1 ou 2).
 *   @default 0
 *
 * @command TreinarMarkov
 * @text Treinar Markov (INATIVO)
 * @desc Comando Treinar Markov (INATIVO nesta versão).
 * @arg dadosTreinamento
 *   @text Dados de Treinamento (INATIVO)
 *   @type text
 *   @desc Dados de treinamento para a Cadeia de Markov (INATIVO nesta versão).
 *   @default  (Comando TreinarMarkov INATIVO nesta versão)
 *
 */
(() => {
  const pluginName = "MarkovTileGenerator";

  // ** CADEIA DE MARKOV TREINADA EMBUTIDA NO PLUGIN (JSON STRING) -  SUBSTITUA COM SEU JSON TREINADO! **
  const cadeiaMarkovTreinadaJSON_FIXA = `{
  "2816": {
    "2816": 26951,
    "2864": 639
  },
  "2864": {
    "2816": 651,
    "2864": 1502
  }
  }`;

  // ** Variável para armazenar a cadeia de Markov (agora carregada do JSON fixo) **
  let markovChain = {};

  // ** Inicializar a cadeia de Markov ao carregar o plugin **
  try {
    markovChain = JSON.parse(cadeiaMarkovTreinadaJSON_FIXA);
    console.log("Cadeia de Markov pré-treinada carregada com sucesso do código do plugin.");
  } catch (e) {
    console.error("Erro ao analisar JSON da cadeia de Markov pré-treinada no código:", e);
    markovChain = {}; // Em caso de erro, inicializa com uma cadeia vazia (ou trate de outra forma)
  }


  PluginManager.registerCommand(pluginName, "DesenharTileTeste", function(args) {
      console.log("Comando DesenharTileTeste chamado!");

      const x = parseInt(args.x);
      const y = parseInt(args.y);
      const z = parseInt(args.z);
      const tileId = parseInt(args.tileId);

      console.log(`DesenharTileTeste: x=${x}, y=${y}, z=${z}, tileId=${tileId}`); // DEBUG - Argumentos

      if (isNaN(x) || isNaN(y) || isNaN(z) || isNaN(tileId)) {
          console.error("Argumentos inválidos para DesenharTileTeste. Use: DesenharTileTeste x:valor y:valor z:valor tileId:valor");
          alert("Argumentos inválidos para DesenharTileTeste. Veja o console para detalhes.");
          return;
      }

      const mapaAtual = $gameMap; // Pega o mapa atual do jogo
      const dataMapaAtual = mapaAtual.data(); // Pega os dados do mapa atual

      // ** Calcula o índice do tile **
      const index = Game_Map.prototype.calcIndex($dataMap, x, y, z);

      dataMapaAtual[index] = tileId; // Define o TileId no índice calculado
      mapaAtual.requestRefresh(); // Pede para o mapa ser redesenhado
      console.log(`Tile ID ${tileId} desenhado em X:${x}, Y:${y}, Z:${z}, index=${index}`); // DEBUG - Tile desenhado
      alert(`Tile ID ${tileId} desenhado em X:${x}, Y:${y}, Z:${z}!`); // Alerta de sucesso
  });

  PluginManager.registerCommand(pluginName, "TreinarMarkov", function(args) {
      console.log("Comando TreinarMarkov chamado! (COMANDO MANTIDO, MAS PODE NÃO SER NECESSÁRIO NA VERSÃO FINAL)");
      alert("Comando TreinarMarkov mantido para compatibilidade/debug, mas esta versão usa dados pré-treinados fixos.");
      // ** Você pode manter a lógica de treinamento aqui SE quiser, mas ela NÃO será usada para a geração de mapas nesta versão FIXA. **
      // ** Se você quiser remover completamente o treinamento, pode remover este comando. **
  });


  PluginManager.registerCommand(pluginName, "GerarMapaMarkov", function(args) {
      console.log("Comando GerarMapaMarkov chamado!");

      const largura = parseInt(args.largura, 10) || 20; // Largura padrão: 20 tiles
      const altura = parseInt(args.altura, 10) || 15;  // Altura padrão: 15 tiles
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
            let tileAcima = null;             // N
            let tileEsquerdaAcima = null;      // NW
            let tileDireitaAcima = null;       // NE
            let tileAbaixo = null;            // S  (Na verdade, será da linha anterior, diagonal inferior esquerdo)
            let tileEsquerdaAbaixo = null;     // SW (Na verdade, será da linha anterior, diagonal inferior esquerdo)
            let tileDireitaAbaixo = null;      // SE (Na verdade, será da linha anterior, diagonal inferior direito)


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
                 // ** Vizinho ESQUERDA-ABAIXO (SW - Diagonal Inferior Esquerda -  LINHA ANTERIOR!) **
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
                tileDireitaAcima = tileAcima;      // NE = N  (Linha anterior)
                tileEsquerdaAcima = tileAnterior;   // NW = W  (Linha atual)
                tileAcima = proximoTileId;         // N = Tile atual
                tileAnterior = proximoTileId;       // W = Tile atual


                console.log(`DEBUG - Gerando Tile: x=${x}, y=${y}, TileId=${proximoTileId}, Tile Anterior (W)=${tileAnterior}, Tile Acima (N)=${tileAcima}, Tile EsqAcima (NW)=${tileEsquerdaAcima}, Tile DirAcima (NE)=${tileDireitaAcima}, Tile EsqAbaixo (SW)=${tileEsquerdaAbaixo}, Tile DirAbaixo (SE)=${tileDireitaAbaixo}`); // DEBUG - Tile Gerado (com 8 vizinhos)
            }
        }

          console.log("Mapa Markov Gerado (TileIds):\n", novoMapaData); // Exibe os TileIds gerados no console

          // ** 3. Aplicar os TileIds gerados AO MAPA ATUAL **
          const mapaAtual = $gameMap; // Pega o mapa atual do jogo
          const dataMapaAtual = mapaAtual.data(); // Pega os dados do mapa atual (array de TileIds)
          const larguraMapaAtual = mapaAtual.width(); // Largura do mapa atual
          const alturaMapaAtual = mapaAtual.height(); // Altura do mapa atual

          console.log(`Mapa Atual: Largura=${larguraMapaAtual}, Altura=${alturaMapaAtual}`); // DEBUG - Tamanho Mapa Atual

          if (!mapaAtual) {
              console.error("Erro: mapaAtual é null ou undefined!");
              return; // Impede de continuar se mapaAtual for inválido
          }

          console.log("Aplicando mapa gerado ao mapa atual..."); // DEBUG - Iniciando aplicação

          for (let y = 0; y < altura; y++) {
              for (let x = 0; x < largura; x++) {
                  // ** Tentando USAR $dataMap de novo no calcIndex, como no TileChanger **
                  const index = Game_Map.prototype.calcIndex.call(mapaAtual, $dataMap, x, y, camadaBase); // Calcula o índice no array do mapa (USANDO $dataMap de novo)
                  dataMapaAtual[index] = novoMapaData[y * largura + x]; // Aplica o TileId gerado na posição correta da CAMADA BASE
                  console.log(`DEBUG - Tile Aplicado: x=${x}, y=${y}, index=${index}, TileId=${novoMapaData[y * largura + x]}`); // DEBUG - Tile Aplicado
              }
          }

          mapaAtual.requestRefresh(); // Pede para o mapa ser redesenhado para mostrar as mudanças

          console.log("Mapa Markov aplicado ao mapa atual! (Camada Base)"); // DEBUG - Mapa Aplicado
          alert("Mapa Markov Gerado e aplicado ao mapa atual! (Camada Base)"); // Alerta de conclusão

                alert("Mapa Markov Gerado e aplicado ao mapa atual! (Camada Base)"); // Alerta de conclusão

        // ** 4. SALVAR O MAPA GERADO NOS DADOS DO JOGO SALVO **
        $gameMap._data = novoMapaData; // ** Substitui os dados do mapa atual pelos dados gerados **
        $gameMap.setup($gameMap.mapId()); // ** Refaz a configuração do mapa para aplicar as mudanças **

        // ** 5. SOLICITAR SALVAMENTO DO JOGO (opcional, mas recomendado para persistência imediata) **
        DataManager.saveGame(0); // ** Salva no slot de salvamento 0 (pode ser ajustado/parametrizado) **
        console.log("Mapa Markov SALVO nos dados do jogo! (Slot 0)"); // Mensagem de confirmação no console
        alert("Mapa Markov gerado e SALVO com sucesso! O mapa será persistido mesmo após sair do jogo."); // Feedback para o usuário (pode ser removido em jogo final)
      };

      gerarMapaMarkov(); // Chama a função para gerar e aplicar o mapa
  });

  // ** Função auxiliar calcIndex **
  Game_Map.prototype.calcIndex = function(dataMap, x, y, z) {
      var w = this.width(); // Usando this.width() para pegar a largura CORRETAMENTE
      var h = this.height(); // Usando this.height() para pegar a altura CORRETAMENTE
      return (z * w * h) + (y * w) + x;
  };

})();
