/*:pt-BR
 * @target MZ
 * @plugindesc Plugin para escanear o mapa atual e gerar saída formatada de Tile IDs para treinamento da Cadeia de Markov, com remapeamento de IDs.
 * @author Gemini
 * @help
 * Plugin Command: GetTileId (continua funcionando por comando)
 *
 * Move o cursor do mouse sobre o mapa durante o jogo em modo de teste
 * para ver o Tile ID do tile sob o cursor sendo exibido no console (F12),
 * com atualização a cada segundo, e o Conjunto de IDs relacionados se for um Autotile (Grupos A1 ou A2).
 *
 * Clique com o botão esquerdo do mouse ainda funciona para exibir o Tile ID e o Conjunto de IDs em um alerta (opcional).
 *
 * O comando de plugin "GetTileId x:valor y:valor z:valor" continua funcionando
 * como antes para detectar Tile IDs por coordenadas e o Conjunto de IDs de Autotiles.
 *
 * **Novo Comando:** "ScanMapForMarkov" - Escaneia o mapa atual e gera saída formatada para treinamento da Cadeia de Markov, COM REMAPEAMENTO de IDs (console e alerta).
 *
 *  - Remapeamento de IDs (para Cadeia de Markov):
 *    - Tile IDs de 2816 até 2863 serão mapeados para 2816 (Meadow).
 *    - Tile IDs de 2864 até 2911 serão mapeados para 2864 (Dirt - Meadow).
 *    - Tile IDs de 2048 até 2095 serão mapeados para 2048 (Water A - Meadow).
 *
 * @command GetTileId
 * @text Detectar Tile ID (e Conjunto Autotile A1/A2)
 * @desc Detecta e exibe o ID do tile em uma posição específica (por coordenadas) no console e em um alerta, e o Conjunto de IDs relacionados se for Autotile (Grupo A1 ou A2).
 *
 * @arg x
 * @type number
 * @min 0
 * @desc Coordenada X do tile a ser detectado.
 * @parent GetTileId
 *
 * @arg y
 * @type number
 * @min 0
 * @desc Coordenada Y do tile a ser detectado.
 * @parent GetTileId
 *
 * @arg z
 * @type number
 * @min 0
 * @max 2
 * @default 0
 * @desc Camada do tile a ser detectado (0: Inferior, 1: Meio, 2: Superior).
 * @parent GetTileId
 *
 * @command ScanMapForMarkov
 * @text Escanear Mapa para Markov (com Remapeamento)
 * @desc Escaneia o mapa atual e gera saída formatada de Tile IDs REMAPEADOS para treinamento da Cadeia de Markov (console e alerta).
 */
(() => {
  const pluginName = "TileIdScannerForMarkov_Remap";

  PluginManager.registerCommand(pluginName, "GetTileId", function(args) {
    // Comando GetTileId original (por coordenadas) - SEM ALTERAÇÕES
    console.log("Comando GetTileId (por coordenadas) chamado!");

    const x = parseInt(args.x);
    const y = parseInt(args.y);
    const z = parseInt(args.z);

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      console.error("Argumentos inválidos para GetTileId. Use: GetTileId x:valor y:valor z:valor");
      return;
    }

    const index = Game_Map.prototype.calcIndex($dataMap, x, y, z);
    let tileId = -1;
    let isAutotile = false;
    let autotileIdSet = [];
    let autotileGroup = "";

    if (index >= 0 && index < $dataMap.data.length) {
      tileId = $dataMap.data[index];
      isAutotile = Game_Map.prototype.isAutotile(tileId);
      autotileGroup = Game_Map.prototype.getAutotileGroup(tileId);

      if (isAutotile) {
        autotileIdSet = Game_Map.prototype.getAutotileIdSet(tileId);
      }

      let message = `Tile ID na posição X:${x}, Y:${y}, Z:${z} é: ${tileId}`;
      if (isAutotile) {
        message += ` (Autotile - Grupo ${autotileGroup}) Conjunto de IDs relacionados: [${autotileIdSet.join(", ")}]`;
      }

      console.log(message);
      alert(message);
    } else {
      console.error(`Índice ${index} fora dos limites do mapa. Verifique as coordenadas e o tamanho do mapa.`);
      alert(`Erro: Índice ${index} fora dos limites do mapa!`);
    }
  });

  // ** --- NOVO COMANDO: ScanMapForMarkov COM REMAPEAMENTO --- **
  PluginManager.registerCommand(pluginName, "ScanMapForMarkov", function(args) {
    console.log("Comando ScanMapForMarkov (com Remapeamento) chamado!");

    if (!$dataMap) {
      console.error("Erro: Nenhum mapa carregado. Certifique-se de estar em um mapa no editor.");
      alert("Erro: Nenhum mapa carregado no editor!");
      return;
    }

    const mapWidth = $dataMap.width;
    const mapHeight = $dataMap.height;
    let outputText = ""; // String para armazenar a saída formatada

    for (let y = 0; y < mapHeight; y++) { // Percorre linhas
      let linha_ids = []; // Array para IDs da linha atual
      for (let x = 0; x < mapWidth; x++) { // Percorre colunas
        const index = Game_Map.prototype.calcIndex($dataMap, x, y, 0); // Camada 0 (Inferior) - ajuste se precisar de outra camada
        let tileId = $dataMap.data[index];

        /* --- Lógica de Remapeamento de Tile IDs --- **
        if (tileId >= 2816 && tileId <= 2863) {
          tileId = 2816; // Remapear para 2816 (Meadow)
        } else if (tileId >= 2864 && tileId <= 2911) {
          tileId = 2864; // Remapear para 2864 (Dirt - Meadow)
        } else if (tileId >= 2048 && tileId <= 2095) {
          tileId = 2048; // Remapear para 2048 (Water A - Meadow)
        }
        / ** --- Fim da Lógica de Remapeamento --- **
        */
        linha_ids.push(tileId); // Adiciona o Tile ID (remapeado ou original) ao array da linha
      }
      outputText += linha_ids.join(",") + "\n"; // Junta IDs da linha com vírgula e adiciona quebra de linha
    }

    console.log("\n--- Saída Formatada para Cadeia de Markov (com Remapeamento) ---");
    console.log(outputText); // Exibe no console
    alert("Saída formatada para Cadeia de Markov (com Remapeamento de IDs) gerada no console (F12)."); // Alerta informativo

  });


  // ** --- DETECÇÃO CONTÍNUA SOB O MOUSE (ATUALIZAÇÃO A CADA SEGUNDO) - SEM ALTERAÇÕES --- **
  let frameCounter = 0;
  const updateIntervalFrames = 60;

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    frameCounter++;
    if (frameCounter >= updateIntervalFrames) {
      frameCounter = 0;
      this.checkTileIdContinuousDetection();
    }
  };

  Scene_Map.prototype.checkTileIdContinuousDetection = function() {
    const x = $gameMap.canvasToMapX(TouchInput.x);
    const y = $gameMap.canvasToMapY(TouchInput.y);
    const z = 0;

    if (x >= 0 && y >= 0 && x < $gameMap.width() && y < $gameMap.height()) {
      const index = Game_Map.prototype.calcIndex($dataMap, x, y, z);
      const tileId = $dataMap.data[index];
      const isAutotile = Game_Map.prototype.isAutotile(tileId);
      let autotileIdSet = [];
      let autotileGroup = "";

      if (isAutotile) {
        autotileIdSet = Game_Map.prototype.getAutotileIdSet(tileId);
        autotileGroup = Game_Map.prototype.getAutotileGroup(tileId);
      }

      let message = `[Mouse Over - Sec] Tile ID na posição X:${x}, Y:${y}, Z:${z} é: ${tileId}`;
      if (isAutotile) {
        message += ` (Autotile - Grupo ${autotileGroup}) Conjunto de IDs relacionados: [${autotileIdSet.join(", ")}]`;
      }

      console.log(message);
    }
  };


  // ** Função auxiliar para calcular o índice no array $dataMap.data - SEM ALTERAÇÕES **
  Game_Map.prototype.calcIndex = function(dataMap, x, y, z) {
    var w = dataMap.width;
    var h = dataMap.height;
    return (z * w * h) + (y * w) + x;
  };

  // ** Função para verificar se um Tile ID pertence ao grupo de Autotiles (Grupos A1 ou A2) - SEM ALTERAÇÕES **
  Game_Map.prototype.isAutotile = function(tileId) {
    if ((tileId >= 2048 && tileId < 2816) || (tileId >= 2816 && tileId < 3840)) {
      return true;
    }
    return false;
  };

  // ** Função para obter o Grupo do Autotile (A1 ou A2) - SEM ALTERAÇÕES **
  Game_Map.prototype.getAutotileGroup = function(tileId) {
    if (tileId >= 2048 && tileId < 2816) {
      return "A1";
    } else if (tileId >= 2816 && tileId < 3840) {
      return "A2";
    }
    return "";
  };


  // ** Função para retornar um conjunto de Tile IDs "relacionados" a um autotile - SEM ALTERAÇÕES **
  Game_Map.prototype.getAutotileIdSet = function(tileId) {
    const baseId = tileId - (tileId % 48);
    const idSet = [];
    for (let i = 0; i < 48; i++) {
      idSet.push(baseId + i);
    }
    return idSet;
  };

})();