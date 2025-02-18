/*:pt-BR
 * @target MZ
 * @plugindesc Melhora o TileIdDetector para mostrar o Conjunto de IDs de Autotiles (Grupos A1 e A2) - Abordagem Simplificada.
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
 * Este plugin melhora a detecção de Tile IDs, mostrando continuamente sob o mouse
 * com atualização a cada segundo, identificando Autotiles (Grupos A1 e A2) e mostrando um Conjunto de IDs relacionados (simplificado),
 * e mantendo o comando "GetTileId" original e a detecção por clique (opcional).
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
 */
(() => {
  const pluginName = "TileIdDetector_AutotileSet_A2";

  PluginManager.registerCommand(pluginName, "GetTileId", function(args) {
    // Comando GetTileId original (por coordenadas) - SEM ALTERAÇÕES NA LÓGICA PRINCIPAL
    console.log("Comando GetTileId (por coordenadas) chamado!");

    const x = parseInt(args.x);
    const y = parseInt(args.y);
    const z = parseInt(args.z);

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      console.error("Argumentos inválidos para GetTileId. Use: GetTileId x:valor y:valor z:valor");
      return;
    }

    const index = Game_Map.prototype.calcIndex($dataMap, x, y, z);
    let tileId = -1; // Valor padrão caso o índice seja inválido
    let isAutotile = false; // Variável para verificar se é autotile
    let autotileIdSet = []; // Conjunto de IDs de autotile (inicialmente vazio)
    let autotileGroup = ""; // Grupo do autotile (A1 ou A2)

    if (index >= 0 && index < $dataMap.data.length) {
      tileId = $dataMap.data[index];
      isAutotile = Game_Map.prototype.isAutotile(tileId); // **Verificação de Autotile (A1 ou A2)**
      autotileGroup = Game_Map.prototype.getAutotileGroup(tileId); // **Obtém o grupo do Autotile (A1 ou A2)**


      if (isAutotile) {
        autotileIdSet = Game_Map.prototype.getAutotileIdSet(tileId); // **Obtém o conjunto de IDs**
      }

      let message = `Tile ID na posição X:${x}, Y:${y}, Z:${z} é: ${tileId}`;
      if (isAutotile) {
        message += ` (Autotile - Grupo ${autotileGroup}) Conjunto de IDs relacionados: [${autotileIdSet.join(", ")}]`; // Adiciona info de Autotile e conjunto de IDs
      }

      console.log(message);
      alert(message); // Alerta no jogo com info de Autotile e conjunto de IDs
    } else {
      console.error(`Índice ${index} fora dos limites do mapa. Verifique as coordenadas e o tamanho do mapa.`);
      alert(`Erro: Índice ${index} fora dos limites do mapa!`); // Alerta de erro
    }
  });

  // ** --- DETECÇÃO CONTÍNUA SOB O MOUSE (ATUALIZAÇÃO A CADA SEGUNDO) COM INFO AUTOTILE E CONJUNTO DE IDs --- **
  let frameCounter = 0; // Contador de frames
  const updateIntervalFrames = 60; // Atualizar a cada 60 frames (aproximadamente 1 segundo)

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    frameCounter++; // Incrementa o contador de frames a cada frame
    if (frameCounter >= updateIntervalFrames) { // Verifica se atingiu o intervalo de atualização
      frameCounter = 0; // Reseta o contador
      this.checkTileIdContinuousDetection(); // Chama a função de detecção contínua
    }
  };

  Scene_Map.prototype.checkTileIdContinuousDetection = function() {
    const x = $gameMap.canvasToMapX(TouchInput.x); // Converte X da tela para X do mapa
    const y = $gameMap.canvasToMapY(TouchInput.y); // Converte Y da tela para Y do mapa
    const z = 0; // Camada padrão para detecção contínua (você pode mudar se precisar)

    if (x >= 0 && y >= 0 && x < $gameMap.width() && y < $gameMap.height()) { // Mouse dentro do mapa
      const index = Game_Map.prototype.calcIndex($dataMap, x, y, z);
      const tileId = $dataMap.data[index];
      const isAutotile = Game_Map.prototype.isAutotile(tileId); // **Verificação de Autotile (A1 ou A2)**
      let autotileIdSet = []; // Conjunto de IDs de autotile (inicialmente vazio)
      let autotileGroup = ""; // Grupo do autotile (A1 ou A2)


      if (isAutotile) {
        autotileIdSet = Game_Map.prototype.getAutotileIdSet(tileId); // **Obtém o conjunto de IDs**
        autotileGroup = Game_Map.prototype.getAutotileGroup(tileId); // **Obtém o grupo do Autotile (A1 ou A2)**
      }

      let message = `[Mouse Over - Sec] Tile ID na posição X:${x}, Y:${y}, Z:${z} é: ${tileId}`;
      if (isAutotile) {
        message += ` (Autotile - Grupo ${autotileGroup}) Conjunto de IDs relacionados: [${autotileIdSet.join(", ")}]`; // Adiciona info de Autotile e conjunto de IDs
      }

      console.log(message);
      // Removido o alerta para detecção contínua para evitar muitos alertas
      // alert(`[Mouse Over] Tile ID na posição X:${x}, Y:${y}, Z:${z} é: ${tileId}`); // Alerta no jogo (opcional, pode descomentar se quiser)

    } // Não precisa de mensagem para fora do mapa na detecção contínua para evitar poluição do console
    // else {
    //   console.log("[Mouse Over - Sec] Mouse fora da área do mapa.");
    // }
  };

  // ** --- DETECÇÃO POR CLIQUE DO MOUSE (OPCIONAL) COM INFO AUTOTILE E CONJUNTO DE IDs --- **
  // Se você quiser manter a detecção por clique com alerta, descomente este bloco:
  /*
  Scene_Map.prototype.checkTileIdDetectionClick = function() {
    if (TouchInput.isTriggered() && TouchInput.mouseButton === 0) { // Botão esquerdo do mouse clicado
      const x = $gameMap.canvasToMapX(TouchInput.x); // Converte X da tela para X do mapa
      const y = $gameMap.canvasToMapY(TouchInput.y); // Converte Y da tela para Y do mapa
      const z = 0; // Camada padrão para detecção por clique (você pode mudar se precisar)

      if (x >= 0 && y >= 0 && x < $gameMap.width() && y < $gameMap.height()) { // Clicou dentro do mapa
        const index = Game_Map.prototype.calcIndex($dataMap, x, y, z);
        const tileId = $dataMap.data[index];
        const isAutotile = Game_Map.prototype.isAutotile(tileId); // **Verificação de Autotile (A1 ou A2)**
        let autotileIdSet = []; // Conjunto de IDs de autotile (inicialmente vazio)
        let autotileGroup = ""; // Grupo do autotile (A1 ou A2)

        if (isAutotile) {
          autotileIdSet = Game_Map.prototype.getAutotileIdSet(tileId); // **Obtém o conjunto de IDs**
          autotileGroup = Game_Map.prototype.getAutotileGroup(tileId); // **Obtém o grupo do Autotile (A1 ou A2)**
        }

        let message = `[Clique] Tile ID na posição X:${x}, Y:${y}, Z:${z} é: ${tileId}`;
        if (isAutotile) {
          message += ` (Autotile - Grupo ${autotileGroup}) Conjunto de IDs relacionados: [${autotileIdSet.join(", ")}]`; // Adiciona info de Autotile e conjunto de IDs
        }

        console.log(message);
        alert(message); // Alerta no jogo com info de Autotile e conjunto de IDs
      } else {
        console.log("[Clique] Clique fora da área do mapa.");
      }
    }
  };
  */


  // ** Função auxiliar para calcular o índice no array $dataMap.data **
  Game_Map.prototype.calcIndex = function(dataMap, x, y, z) {
    var w = dataMap.width;
    var h = dataMap.height;
    return (z * w * h) + (y * w) + x;
  };

  // ** Função para verificar se um Tile ID pertence ao grupo de Autotiles (Grupos A1 ou A2) - ATUALIZADA PARA A2 **
  Game_Map.prototype.isAutotile = function(tileId) {
    // Verifica se o Tile ID está na faixa de Autotiles A1 (2048-2815) OU A2 (2816-3840)
    if ((tileId >= 2048 && tileId < 2816) || (tileId >= 2816 && tileId < 3840)) {
      return true;
    }
    return false;
  };

  // ** Função para obter o Grupo do Autotile (A1 ou A2) - NOVA FUNÇÃO **
  Game_Map.prototype.getAutotileGroup = function(tileId) {
    if (tileId >= 2048 && tileId < 2816) {
      return "A1";
    } else if (tileId >= 2816 && tileId < 3840) {
      return "A2";
    }
    return ""; // Retorna vazio se não for A1 nem A2 (não deve acontecer se isAutotile() foi chamado antes)
  };


  // ** Função para retornar um conjunto de Tile IDs "relacionados" a um autotile - ABORDAGEM SIMPLIFICADA - SEM ALTERAÇÕES **
  Game_Map.prototype.getAutotileIdSet = function(tileId) {
    const baseId = tileId - (tileId % 48); // "ID Base" do autotile (início do bloco de 48 IDs) - ASSUMÇÃO!
    const idSet = [];
    for (let i = 0; i < 48; i++) { // Pega um bloco de 48 IDs a partir do ID base - ASSUMÇÃO!
      idSet.push(baseId + i);
    }
    return idSet;
  };

})();