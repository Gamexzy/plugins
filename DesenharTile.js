/*:pt-BR
 * @target MZ
 * @plugindesc Adiciona um comando de plugin para desenhar tiles individuais no mapa usando código.
 * @author Gemini
 * @help
 * Comando de Plugin: DesenharTile
 *
 * Argumentos do Comando DesenharTile:
 *   x:valor     - Coordenada X do tile a ser desenhado (número).
 *   y:valor     - Coordenada Y do tile a ser desenhado (número).
 *   z:valor     - Camada do tile a ser desenhado (0, 1, 2, etc., número).
 *   tileId:valor - ID do tile a ser desenhado (número).
 *
 * Exemplo de Comando de Plugin em Evento:
 *   DesenharTile x:10 y:5 z:0 tileId:3
 *
 * Este comando permite que você desenhe tiles programaticamente no mapa.
 * Você precisa saber o ID do Tile e as coordenadas X, Y e Z desejadas.
 * Para encontrar os IDs dos Tiles, selecione um tile no editor e olhe na barra de status inferior.
 *
 * @command DesenharTile
 * @text Desenhar Tile
 * @desc Desenha um tile em uma localização específica no mapa.
 *
 * @arg x
 * @type number
 * @min 0
 * @desc Coordenada X do tile.
 * @parent DesenharTile
 *
 * @arg y
 * @type number
 * @min 0
 * @desc Coordenada Y do tile.
 * @parent DesenharTile
 *
 * @arg z
 * @type number
 * @min 0
 * @max 2
 * @default 0
 * @desc Camada do tile (0: Inferior, 1: Meio, 2: Superior).
 * @parent DesenharTile
 *
 * @arg tileId
 * @type number
 * @min 0
 * @desc ID do tile a ser desenhado.
 * @parent DesenharTile
 */

var pluginName = 'DesenharTile';

PluginManager.registerCommand(pluginName, "DesenharTile", function(args) {
  console.log("Comando DesenharTile chamado!");

  const x = parseInt(args.x);     // Coordenada X (lida como string, converter para número)
  const y = parseInt(args.y);     // Coordenada Y
  const z = parseInt(args.z);     // Camada (0, 1, 2, etc.)
  const tileId = parseInt(args.tileId); // ID do tile que você quer desenhar

  if (isNaN(x) || isNaN(y) || isNaN(z) || isNaN(tileId)) {
    console.error("Argumentos inválidos para DesenharTile. Use: DesenharTile x:valor y:valor z:valor tileId:valor");
    return; // Sair se os argumentos forem inválidos
  }

  const index = $gameMap.calcIndex($dataMap, x, y, z); // Calcula o índice no array $dataMap.data

  if (index >= 0 && index < $dataMap.data.length) { // Verifica se o índice é válido
    $dataMap.data[index] = tileId; // Define o ID do tile no array $dataMap.data
    $gameMap.requestRefresh();      // Força a atualização visual do mapa
    console.log(`Tile ID ${tileId} desenhado em X:${x}, Y:${y}, Z:${z}`);
    alert(`Tile ID ${tileId} desenhado em X:${x}, Y:${y}, Z:${z}`); // Alerta de confirmação
  } else {
    console.error(`Índice ${index} fora dos limites do mapa. Verifique as coordenadas e o tamanho do mapa.`);
    alert(`Erro: Índice ${index} fora dos limites do mapa!`); // Alerta de erro
  }
});