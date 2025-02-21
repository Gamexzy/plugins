/*:
* @target MZ
* @plugindesc Script de Teste para Comandos $gameMap
* @author Gemini
* @help Este plugin adiciona um comando para testar e exibir
* informações do objeto $gameMap no console.
*
* Comando Plugin: TestarGameMap
*
* @command TestarGameMap
* @text Testar GameMap
* @desc Exibe informações do objeto $gameMap no console.
*
* Para usar, chame o comando de plugin "TestarGameMap" no jogo.
* As informações de $gameMap serão exibidas no console (F8).
*/
(() => {
    const pluginName = 'GameMapTestScript';

    PluginManager.registerCommand(pluginName, "TestarGameMap", function() {
        console.log("--- Teste do Comando $gameMap Iniciado ---");

        if ($gameMap) {
            console.log("$gameMap existe e é um objeto:", $gameMap);

            // Obter e exibir informações do mapa
            const mapId = $gameMap.mapId();
            const mapWidth = $gameMap.width();
            const mapHeight = $gameMap.height();

            console.log("ID do Mapa Atual:", mapId);
            console.log("Largura do Mapa:", mapWidth);
            console.log("Altura do Mapa:", mapHeight);

            // Obter informações de tile na posição do jogador (se o jogador existir)
            if ($gamePlayer) {
                const playerX = $gamePlayer.x;
                const playerY = $gamePlayer.y;
                const tileId = $gameMap.tileId(playerX, playerY, 0); // Camada inferior (0)
                const regionId = $gameMap.regionId(playerX, playerY);

                console.log("Posição do Jogador (X, Y):", playerX, playerY);
                console.log("Tile ID na Posição do Jogador (Camada Inferior):", tileId);
                console.log("Region ID na Posição do Jogador:", regionId);
            } else {
                console.warn("$gamePlayer não existe. Informações de tile na posição do jogador não disponíveis.");
            }

        } else {
            console.error("$gameMap é undefined! O objeto $gameMap não está disponível.");
        }

        console.log("--- Teste do Comando $gameMap Finalizado ---");
        alert("Teste do comando $gameMap concluído. Verifique o console (F8) para os resultados.");
    });

})();