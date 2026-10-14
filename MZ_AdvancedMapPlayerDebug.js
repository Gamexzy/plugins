/*:
 * @plugindesc Plugin de Depuração Avançada para $dataMap e Coordenadas do Jogador.
 * @author Criação e persistência de mapas gerados proceduralmente no RPGMMZ
 *
 * @param Player Movement Log Frequency
 * @type select
 * @option Off
 * @option On Each Step (Tile Change)
 * @option On Each Frame
 * @default On Each Step (Tile Change)
 * @desc Define a frequência com que as coordenadas do jogador serão logadas.
 * 'Off': Desativa o log de movimento.
 * 'On Each Step (Tile Change)': Loga apenas quando o jogador muda de tile.
 * 'On Each Frame': Loga a cada frame do jogo (pode gerar muito spam).
 *
 * @param Log Camera Position
 * @type boolean
 * @on Ativar
 * @off Desativar
 * @default true
 * @desc Ativa ou desativa o log da posição da câmera do mapa.
 *
 * @help
 * Este plugin é uma ferramenta de depuração avançada.
 * Ele verifica o carregamento de $dataMap e suas propriedades,
 * e monitora as coordenadas do jogador e da câmera com opções de frequência.
 *
 * Integra conceitos do BasicChunkGenerator para:
 * - Coordenadas "reais" do jogador em um mundo potencialmente maior que o mapa base.
 * - Simulação de leitura/escrita de tiles em $dataMap.data.
 * - Demonstra como as coordenadas são gerenciadas em um sistema de chunks.
 *
 * Use os parâmetros para controlar o nível de detalhe dos logs.
 * Abra o console do desenvolvedor (F8) enquanto o jogo estiver rodando em um mapa.
 */

(function() {

    // --- Parâmetros do Plugin ---
    const pluginName = "MZ_AdvancedMapPlayerDebug"; // Garanta que este nome corresponda ao nome do seu arquivo .js
    const parameters = PluginManager.parameters(pluginName);

    const playerMovementLogFrequency = String(parameters['Player Movement Log Frequency'] || 'On Each Step (Tile Change)');
    const logCameraPosition = String(parameters['Log Camera Position']) === 'true';

    // --- Variáveis Globais (simulando a abordagem do BCG para coordenadas "reais") ---
    // Estas variáveis rastreiam a posição do jogador em um "mundo conceitual"
    // que pode ser maior que o mapa base do RPG Maker (especialmente em mapas em loop).
    let _realPlayerX = 0;
    let _realPlayerY = 0;

    // Variáveis para armazenar a última posição conhecida do jogador (para 'On Each Step')
    let _lastPlayerTileX = -1;
    let _lastPlayerTileY = -1;
    let _lastCameraDisplayX = -1;
    let _lastCameraDisplayY = -1;


    // --- Funções Auxiliares inspiradas no BCG ---

    /**
     * Retorna as coordenadas de tile no mapa base, lidando com o wrapping (loop) do mapa.
     * Essencial para sistemas de chunks que usam mapas em loop.
     * @param {number} globalRealX - Coordenada X "real" no mundo.
     * @param {number} globalRealY - Coordenada Y "real" no mundo.
     * @returns {{x: number, y: number}} - Coordenadas X e Y no mapa base (0 a width/height - 1).
     */
    function getWrappedCoordinates(globalRealX, globalRealY) {
        if (!$dataMap) {
            console.warn("getWrappedCoordinates: $dataMap não está carregado. Retornando (0,0).");
            return { x: 0, y: 0 };
        }
        const mapBaseWidth = $dataMap.width;
        const mapBaseHeight = $dataMap.height;

        let wrappedX = globalRealX % mapBaseWidth;
        if (wrappedX < 0) {
            wrappedX += mapBaseWidth;
        }
        let wrappedY = globalRealY % mapBaseHeight;
        if (wrappedY < 0) {
            wrappedY += mapBaseHeight;
        }
        return { x: wrappedX, y: wrappedY };
    }

    /**
     * Simula a leitura de um tile em uma coordenada do mapa.
     * No BCG, isso seria uma leitura de `$dataMap.data`.
     * @param {number} x - Coordenada X do tile no mapa base.
     * @param {number} y - Coordenada Y do tile no mapa base.
     * @param {number} z - Camada do tile (0: Ground, 1: Additive, 2: Shadow/Bush, 3: Counter, 4: Events).
     * @returns {number | undefined} O ID do tile ou undefined se os dados não estiverem disponíveis.
     */
    function simulateReadTile(x, y, z = 0) {
        if (!$dataMap || !$dataMap.data) {
            console.warn("simulateReadTile: $dataMap.data não está disponível.");
            return undefined;
        }
        // $dataMap.data é um array 1D. O cálculo do índice é:
        // x + y * width + z * width * height
        const index = x + y * $dataMap.width + z * $dataMap.width * $dataMap.height;
        return $dataMap.data[index];
    }

    /**
     * Simula a escrita de um tile em uma coordenada do mapa.
     * No BCG, isso é o que acontece para carregar chunks no `$dataMap.data`.
     * @param {number} x - Coordenada X do tile no mapa base.
     * @param {number} y - Coordenada Y do tile no mapa base.
     * @param {number} z - Camada do tile.
     * @param {number} tileId - O ID do tile a ser escrito.
     * @returns {boolean} True se a escrita foi bem-sucedida, False caso contrário.
     */
    function simulateWriteTile(x, y, z = 0, tileId) {
        if (!$dataMap || !$dataMap.data) {
            console.warn("simulateWriteTile: $dataMap.data não está disponível para escrita.");
            return false;
        }
        if (x < 0 || x >= $dataMap.width || y < 0 || y >= $dataMap.height) {
            console.warn(`simulateWriteTile: Coordenadas (${x},${y}) fora dos limites do mapa.`);
            return false;
        }

        const index = x + y * $dataMap.width + z * $dataMap.width * $dataMap.height;
        if (index >= $dataMap.data.length || index < 0) {
            console.warn(`simulateWriteTile: Índice calculado (${index}) fora dos limites do array $dataMap.data.`);
            return false;
        }
        $dataMap.data[index] = tileId;
        // No BCG, após escrever, é necessário um refresh do mapa para renderizar as mudanças.
        // $gameMap.requestRefresh();
        return true;
    }


    // --- Sobrescritas de Funções do Motor ---

    // Sobrescreve a função Scene_Map.prototype.start para adicionar a verificação inicial
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this); // Chama a função original Scene_Map.prototype.start

        console.log("--- DEBUG: Início da Cena do Mapa ---");

        if ($dataMap) {
            console.log("$dataMap carregado:");
            console.log(`  ID do Mapa: ${$gameMap.mapId()}`);
            console.log(`  Nome do Mapa: ${($dataMap.displayName || "Sem Nome")}`);
            console.log(`  Largura: ${$dataMap.width} tiles, Altura: ${$dataMap.height} tiles`);
            console.log(`  Tamanho de $dataMap.data: ${$dataMap.data ? $dataMap.data.length : 'N/A'}`);

            // Exemplo de uso de simulateReadTile
            if ($dataMap.width > 0 && $dataMap.height > 0) {
                const sampleTile = simulateReadTile(0, 0, 0); // Tile na posição (0,0) na camada 0
                console.log(`  Exemplo de Tile (0,0,Camada0): ${sampleTile}`);
            }

        } else {
            console.error("$dataMap NÃO está carregado ao iniciar a cena do mapa!");
        }

        // Inicializa as coordenadas de rastreamento
        if ($gamePlayer) {
            _realPlayerX = $gamePlayer.x;
            _realPlayerY = $gamePlayer.y;
            _lastPlayerTileX = $gamePlayer.x;
            _lastPlayerTileY = $gamePlayer.y;
            _lastCameraDisplayX = $gameMap.displayX();
            _lastCameraDisplayY = $gameMap.displayY();

            console.log(`Posição Inicial do Jogador (Tile): (${$gamePlayer.x}, ${$gamePlayer.y})`);
            console.log(`Posição Inicial do Jogador (Real): (${_realPlayerX}, ${_realPlayerY})`);
            const wrappedCoords = getWrappedCoordinates(_realPlayerX, _realPlayerY);
            console.log(`Posição Inicial do Jogador (Wrapped/Base Map): (${wrappedCoords.x}, ${wrappedCoords.y})`);
            if (logCameraPosition) {
                console.log(`Posição Inicial da Câmera (Display): (${_lastCameraDisplayX.toFixed(2)}, ${_lastCameraDisplayY.toFixed(2)})`);
            }
        } else {
            console.warn("$gamePlayer ainda não está disponível ou não foi inicializado.");
        }

        console.log("---------------------------------------");
    };

    // Adiciona uma verificação no DataManager para quando os dados do mapa são carregados
    const _DataManager_onLoad = DataManager.onLoad;
    DataManager.onLoad = function(object) {
        _DataManager_onLoad.call(this, object);
        if (object === $dataMap) {
            console.log("DEBUG: DataManager: $dataMap foi carregado com sucesso!");
        }
    };

    // Sobrescreve a função Game_Player.prototype.performTransfer para capturar mudança de mapa
    const _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
    Game_Player.prototype.performTransfer = function() {
        _Game_Player_performTransfer.call(this);
        console.log("--- DEBUG: Transferência de Mapa Concluída ---");
        console.log(`Novo ID do Mapa: ${$gameMap.mapId()}`);
        if ($gamePlayer) {
            // Re-inicializa as coordenadas após uma transferência de mapa
            _realPlayerX = $gamePlayer.x;
            _realPlayerY = $gamePlayer.y;
            _lastPlayerTileX = $gamePlayer.x;
            _lastPlayerTileY = $gamePlayer.y;
            _lastCameraDisplayX = $gameMap.displayX();
            _lastCameraDisplayY = $gameMap.displayY();

            console.log(`Nova Posição do Jogador (Tile): (${$gamePlayer.x}, ${$gamePlayer.y})`);
            console.log(`Nova Posição do Jogador (Real): (${_realPlayerX}, ${_realPlayerY})`);
            const wrappedCoords = getWrappedCoordinates(_realPlayerX, _realPlayerY);
            console.log(`Nova Posição do Jogador (Wrapped/Base Map): (${wrappedCoords.x}, ${wrappedCoords.y})`);
            if (logCameraPosition) {
                console.log(`Nova Posição da Câmera (Display): (${_lastCameraDisplayX.toFixed(2)}, ${_lastCameraDisplayY.toFixed(2)})`);
            }
        }
        console.log("---------------------------------------");
    };

    // Sobrescreve funções de movimento para atualizar _realPlayerX/_realPlayerY
    // Isso é essencial para simular o rastreamento de posição "real" do BCG
    const _Game_Player_moveStraight = Game_Player.prototype.moveStraight;
    Game_Player.prototype.moveStraight = function(d) {
        const oldX = this.x;
        const oldY = this.y;
        _Game_Player_moveStraight.call(this, d);
        if (this.x !== oldX || this.y !== oldY) {
            // A posição real pode ser diferente da posição do tile no mapa base se o mapa fizer loop
            _realPlayerX += (this.x - oldX);
            _realPlayerY += (this.y - oldY);
        }
    };

    const _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        _Game_Player_update.call(this, sceneActive);

        // --- Log da Posição do Jogador ---
        switch (playerMovementLogFrequency) {
            case 'On Each Step (Tile Change)':
                if ($gamePlayer && ($gamePlayer.x !== _lastPlayerTileX || $gamePlayer.y !== _lastPlayerTileY)) {
                    console.log("--- DEBUG: Movimento do Jogador Detectado ---");
                    console.log(`  Posição Anterior (Tile):     (${_lastPlayerTileX}, ${_lastPlayerTileY})`);
                    console.log(`  Posição Atual (Tile):        (${$gamePlayer.x}, ${$gamePlayer.y})`);
                    console.log(`  Posição Real no Mundo:     (${_realPlayerX}, ${_realPlayerY})`);
                    const wrappedCoords = getWrappedCoordinates(_realPlayerX, _realPlayerY);
                    console.log(`  Posição Wrapped (Mapa Base): (${wrappedCoords.x}, ${wrappedCoords.y})`);
                    _lastPlayerTileX = $gamePlayer.x;
                    _lastPlayerTileY = $gamePlayer.y;
                }
                break;
            case 'On Each Frame':
                if ($gamePlayer) {
                    console.log(`DEBUG: Pos Jogador (Frame) (Tile): (${$gamePlayer.x}, ${$gamePlayer.y}) | (Real): (${_realPlayerX}, ${_realPlayerY})`);
                }
                break;
            case 'Off':
                // Não faz nada
                break;
        }

        // --- Log da Posição da Câmera ---
        if (logCameraPosition && $gameMap) {
            const currentDisplayX = $gameMap.displayX();
            const currentDisplayY = $gameMap.displayY();
            // Verifica se a câmera se moveu (pode ser sub-tile)
            if (currentDisplayX.toFixed(2) !== _lastCameraDisplayX.toFixed(2) || currentDisplayY.toFixed(2) !== _lastCameraDisplayY.toFixed(2)) {
                console.log(`DEBUG: Posição da Câmera (Display): (${currentDisplayX.toFixed(2)}, ${currentDisplayY.toFixed(2)})`);
                _lastCameraDisplayX = currentDisplayX;
                _lastCameraDisplayY = currentDisplayY;
            }
        }
    };

    // --- Exemplo de função global para depuração manual ---
    // Você pode chamar isso diretamente do console (F8)
    globalThis.debugMapData = function() {
        console.log("--- DEBUG: Informações Atuais do Mapa e Jogador ---");
        if ($dataMap) {
            console.log("$dataMap carregado:");
            console.log(`  ID do Mapa: ${$gameMap.mapId()}`);
            console.log(`  Largura: ${$dataMap.width}, Altura: ${$dataMap.height}`);
            console.log(`  Primeiro Tile (0,0,0): ${simulateReadTile(0,0,0)}`);
            // Exemplo de modificação de tile (mudar o tile na pos 0,0,0 para ID 100)
            // console.log("Simulando escrita no tile (0,0,0) para 100...");
            // simulateWriteTile(0,0,0, 100);
            // console.log(`  Novo Tile (0,0,0): ${simulateReadTile(0,0,0)}`);
            // $gameMap.requestRefresh(); // Necessário para ver a mudança no jogo
        } else {
            console.warn("$dataMap não está carregado.");
        }
        if ($gamePlayer) {
            console.log(`Pos Jogador (Tile): (${$gamePlayer.x}, ${$gamePlayer.y})`);
            console.log(`Pos Jogador (Real): (${_realPlayerX}, ${_realPlayerY})`);
            const wrappedCoords = getWrappedCoordinates(_realPlayerX, _realPlayerY);
            console.log(`Pos Jogador (Wrapped/Base Map): (${wrappedCoords.x}, ${wrappedCoords.y})`);
        } else {
            console.warn("$gamePlayer não está disponível.");
        }
        if ($gameMap) {
             console.log(`Pos Câmera (Display): (${$gameMap.displayX().toFixed(2)}, ${$gameMap.displayY().toFixed(2)})`);
        }
        console.log("-----------------------------------------------");
    };

})();