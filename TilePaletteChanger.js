/*:pt-BR
 * @target MZ
 * @plugindesc Plugin para trocar tiles em áreas usando paletas de tiles "IA-driven".
 * @author Gemini
 * @help
 * Comandos de Plugin:
 *
 * TrocarTile
 *   Troca um único tile em uma posição específica.
 *
 *   Argumentos do Comando TrocarTile:
 *     x:valor        - Coordenada X do tile a ser trocado (número).
 *     y:valor        - Coordenada Y do tile a ser trocado (número).
 *     z:valor        - Camada do tile a ser trocado (0, 1, 2, etc., número).
 *     newTileId:valor - ID do novo tile a ser colocado (número).
 *
 *   Exemplo de Comando de Plugin em Evento:
 *     TrocarTile x:7 y:3 z:0 newTileId:5
 *
 * TrocarTilesArea
 *   Preenche uma área retangular com um tile específico.
 *
 *   Argumentos do Comando TrocarTilesArea:
 *     x1:valor       - Coordenada X do canto superior esquerdo da área (número).
 *     y1:valor       - Coordenada Y do canto superior esquerdo da área (número).
 *     x2:valor       - Coordenada X do canto inferior direito da área (número).
 *     y2:valor       - Coordenada Y do canto inferior direito da área (número).
 *     z:valor        - Camada da área a ser preenchida (0, 1, 2, etc., número).
 *     tileId:valor   - ID do tile para preencher a área (número).
 *
 *   Exemplo de Comando de Plugin em Evento:
 *     TrocarTilesArea x1:5 y1:5 x2:15 y2:10 z:0 tileId:1
 *
 * TrocarTilesAreaIA (Área IA)
 *   Preenche uma área retangular com tiles escolhidos "inteligentemente" de uma paleta,
 *   baseado no tipo de ambiente especificado.
 *
 *   Argumentos do Comando TrocarTilesAreaIA:
 *     x1:valor       - Coordenada X do canto superior esquerdo da área (número).
 *     y1:valor       - Coordenada Y do canto superior esquerdo da área (número).
 *     x2:valor       - Coordenada X do canto inferior direito da área (número).
 *     y2:valor       - Coordenada Y do canto inferior direito da área (número).
 *     z:valor        - Camada da área a ser preenchida (0, 1, 2, etc., número).
 *     tipo:valor     - Tipo de ambiente para a paleta de tiles (texto, ex: "chao_masmorra").
 *
 *   Exemplo de Comando de Plugin em Evento:
 *     TrocarTilesAreaIA x1:5 y1:5 x2:15 y2:10 z:0 tipo:chao_masmorra
 *
 *
 * Este plugin adiciona os comandos "TrocarTile", "TrocarTilesArea" e "TrocarTilesAreaIA" para eventos.
 * Use estes comandos para mudar dinamicamente os tiles do mapa durante o jogo.
 *
 * Para o comando "TrocarTilesAreaIA", você precisa definir as paletas de tiles no código do plugin
 * (na seção 'tilePalettes' abaixo) e usar os 'tipos' de ambiente correspondentes nos comandos.
 *
 * @command TrocarTile
 * @text Trocar Tile (Único)
 * @desc Troca um único tile por outro em uma posição específica do mapa.
 *
 * @arg x
 * @type number
 * @min 0
 * @desc Coordenada X do tile a ser trocado.
 * @parent TrocarTile
 *
 * @arg y
 * @type number
 * @min 0
 * @desc Coordenada Y do tile a ser trocado.
 * @parent TrocarTile
 *
 * @arg z
 * @type number
 * @min 0
 * @max 2
 * @default 0
 * @desc Camada do tile (0: Inferior, 1: Meio, 2: Superior).
 * @parent TrocarTile
 *
 * @arg newTileId
 * @type number
 * @min 0
 * @desc ID do novo tile a ser colocado.
 * @parent TrocarTile
 *
 * @command TrocarTilesArea
 * @text Trocar Tiles em Área
 * @desc Preenche uma área retangular com um tile específico.
 *
 * @arg x1
 * @type number
 * @min 0
 * @desc Coordenada X do canto superior esquerdo da área.
 * @parent TrocarTilesArea
 *
 * @arg y1
 * @type number
 * @min 0
 * @desc Coordenada Y do canto superior esquerdo da área.
 * @parent TrocarTilesArea
 *
 * @arg x2
 * @type number
 * @min 0
 * @desc Coordenada X do canto inferior direito da área.
 * @parent TrocarTilesArea
 *
 * @arg y2
 * @type number
 * @min 0
 * @desc Coordenada Y do canto inferior direito da área.
 * @parent TrocarTilesArea
 *
 * @arg z
 * @type number
 * @min 0
 * @max 2
 * @default 0
 * @desc Camada da área a ser preenchida (0: Inferior, 1: Meio, 2: Superior).
 * @parent TrocarTilesArea
 *
 * @arg tileId
 * @type number
 * @min 0
 * @desc ID do tile para preencher a área.
 * @parent TrocarTilesArea
 *
 * @command TrocarTilesAreaIA
 * @text Trocar Tiles em Área (IA)
 * @desc Preenche uma área com tiles de uma paleta, baseado no tipo de ambiente.
 *
 * @arg x1
 * @type number
 * @min 0
 * @desc Coordenada X do canto superior esquerdo da área.
 * @parent TrocarTilesAreaIA
 *
 * @arg y1
 * @type number
 * @min 0
 * @desc Coordenada Y do canto superior esquerdo da área.
 * @parent TrocarTilesAreaIA
 *
 * @arg x2
 * @type number
 * @min 0
 * @desc Coordenada X do canto inferior direito da área.
 * @parent TrocarTilesAreaIA
 *
 * @arg y2
 * @type number
 * @min 0
 * @desc Coordenada Y do canto inferior direito da área.
 * @parent TrocarTilesAreaIA
 *
 * @arg z
 * @type number
 * @min 0
 * @max 2
 * @default 0
 * @desc Camada da área a ser preenchida (0: Inferior, 1: Meio, 2: Superior).
 * @parent TrocarTilesAreaIA
 *
 * @arg tipo
 * @type text
 * @desc Tipo de ambiente para a paleta de tiles (ex: "chao_masmorra", "parede_masmorra").
 * @parent TrocarTilesAreaIA
 */
(() => {
  const pluginName = "TilePaletteChanger";

  // ** --- PALETAS DE TILES --- **
  // Defina suas paletas de tiles aqui!
  // Use os Tile IDs corretos do seu tileset "Calabouço".
  const tilePalettes = {
    "chao_masmorra": [3216, 3217, 3218, 3219, 3220, 3221, 3222, 3223, 3224, 3225, 3226, 3227, 3228, 3229, 3230, 3231, 3232, 3233, 3234, 3235, 3236, 3237, 3238, 3239, 3240, 3241, 3242, 3243, 3244, 3245, 3246, 3247, 3248, 3249, 3250, 3251, 3252, 3253, 3254, 3255, 3256, 3257, 3258, 3259, 3260, 3261, 3262, 3263], // Exemplo: Tiles de chão de pedra da masmorra
    "parede_masmorra": [5959, 6331],         // Exemplo: Tiles de parede de pedra da masmorra
    "detalhe_masmorra": [3264, 3265, 3266, 3267],   // Exemplo: Tiles de detalhes de masmorra (rochas, etc.)
    "agua_masmorra": [2528, 2529, 2530, 2531, 2532, 2533, 2534, 2535, 2536, 2537, 2538, 2539, 2540, 2541, 2542, 2543, 2544, 2545, 2546, 2547, 2548, 2549, 2550, 2551, 2552, 2553, 2554, 2555, 2556, 2557, 2558, 2559, 2560, 2561, 2562, 2563, 2564, 2565, 2566, 2567, 2568, 2569, 2570, 2571, 2572, 2573, 2574, 2575],     // Exemplo: Tiles de água da masmorra
    // Adicione mais paletas para outros tipos de ambiente, se quiser!
    // Exemplo: "grama_floresta": [ ...lista de IDs de tiles de grama e terra... ],
    //          "agua_rio": [ ...lista de IDs de tiles de água e margem... ],
  };

  PluginManager.registerCommand(pluginName, "TrocarTile", function(args) {
    // ... (comando TrocarTile existente, sem alterações) ...
    console.log("Comando TrocarTile chamado!");

    const x = parseInt(args.x);
    const y = parseInt(args.y);
    const z = parseInt(args.z);
    const newTileId = parseInt(args.newTileId);

    if (isNaN(x) || isNaN(y) || isNaN(z) || isNaN(newTileId)) {
      console.error("Argumentos inválidos para TrocarTile. Use: TrocarTile x:valor y:valor z:valor newTileId:valor");
      return;
    }

    const index = Game_Map.prototype.calcIndex($dataMap, x, y, z);

    if (index >= 0 && index < $dataMap.data.length) {
      $dataMap.data[index] = newTileId;
      $gameMap.requestRefresh();
      console.log(`Tile na posição X:${x}, Y:${y}, Z:${z} trocado para Tile ID ${newTileId}`);
      alert(`Tile na posição X:${x}, Y:${y}, Z:${z} trocado para Tile ID ${newTileId}`); // Alerta de confirmação
    } else {
      console.error(`Índice ${index} fora dos limites do mapa. Verifique as coordenadas e o tamanho do mapa.`);
      alert(`Erro: Índice ${index} fora dos limites do mapa!`); // Alerta de erro
    }
  });

  PluginManager.registerCommand(pluginName, "TrocarTilesArea", function(args) {
    // ... (comando TrocarTilesArea existente, sem alterações) ...
    console.log("Comando TrocarTilesArea chamado!");

    const x1 = parseInt(args.x1);
    const y1 = parseInt(args.y1);
    const x2 = parseInt(args.x2);
    const y2 = parseInt(args.y2);
    const z = parseInt(args.z);
    const tileId = parseInt(args.tileId);

    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) || isNaN(z) || isNaN(tileId)) {
      console.error("Argumentos inválidos para TrocarTilesArea. Use: TrocarTilesArea x1:valor y1:valor x2:valor y2:valor z:valor tileId:valor");
      return;
    }

    if (x2 < x1 || y2 < y1) {
      console.error("Coordenadas inválidas para TrocarTilesArea: x2 e y2 devem ser maiores ou iguais a x1 e y1.");
      alert("Erro: Coordenadas inválidas para TrocarTilesArea!");
      return;
    }

    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        const index = Game_Map.prototype.calcIndex($dataMap, x, y, z);
        if (index >= 0 && index < $dataMap.data.length) {
          $dataMap.data[index] = tileId;
        } else {
          console.warn(`Coordenada (X:${x}, Y:${y}) fora dos limites do mapa, pulando.`);
        }
      }
    }

    $gameMap.requestRefresh();
    console.log(`Área retangular de X:${x1},Y:${y1} até X:${x2},Y:${y2}, Z:${z} preenchida com Tile ID ${tileId}`);
    alert(`Área preenchida com Tile ID ${tileId}`); // Alerta de confirmação
  });


  PluginManager.registerCommand(pluginName, "TrocarTilesAreaIA", function(args) {
    console.log("Comando TrocarTilesAreaIA chamado!");

    const x1 = parseInt(args.x1);
    const y1 = parseInt(args.y1);
    const x2 = parseInt(args.x2);
    const y2 = parseInt(args.y2);
    const z = parseInt(args.z);
    const environmentType = args.tipo; // Pega o tipo de ambiente do argumento 'tipo'

    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) || isNaN(z) || !environmentType) {
      console.error("Argumentos inválidos para TrocarTilesAreaIA. Use: TrocarTilesAreaIA x1:valor y1:valor x2:valor y2:valor z:valor tipo:tipo_ambiente");
      return;
    }

    if (x2 < x1 || y2 < y1) {
      console.error("Coordenadas inválidas para TrocarTilesAreaIA: x2 e y2 devem ser maiores ou iguais a x1 e y1.");
      alert("Erro: Coordenadas inválidas para TrocarTilesAreaIA!");
      return;
    }

    const palette = tilePalettes[environmentType]; // Busca a paleta de tiles pelo tipo de ambiente

    if (!palette) {
      console.error(`Paleta de tiles não encontrada para o tipo de ambiente: ${environmentType}. Verifique a configuração do plugin.`);
      alert(`Erro: Paleta de tiles não encontrada para: ${environmentType}!`);
      return;
    }

    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        const index = Game_Map.prototype.calcIndex($dataMap, x, y, z);
        if (index >= 0 && index < $dataMap.data.length) {
          const randomTileId = palette[Math.floor(Math.random() * palette.length)]; // Escolhe um tile aleatório da paleta
          $dataMap.data[index] = randomTileId;
          console.log(`Tile ID ${randomTileId} (paleta '${environmentType}') desenhado em X:${x}, Y:${y}, Z:${z}`);
        } else {
          console.warn(`Coordenada (X:${x}, Y:${y}) fora dos limites do mapa, pulando.`);
        }
      }
    }

    $gameMap.requestRefresh();
    console.log(`Área retangular de X:${x1},Y:${y1} até X:${x2},Y:${y2}, Z:${z} preenchida com tiles da paleta '${environmentType}'`);
    alert(`Área preenchida com tiles da paleta '${environmentType}'`); // Alerta de confirmação
  });


  // ** Função auxiliar para calcular o índice no array $dataMap.data **
  Game_Map.prototype.calcIndex = function(dataMap, x, y, z) {
    var w = dataMap.width;
    var h = dataMap.height;
    return (z * w * h) + (y * w) + x;
  };

})();
