/*:
 * @target MZ
 * @plugindesc Altera uma área de tiles do mapa na inicialização de um novo jogo e persiste as alterações.
 * @author [Seu Nome Aqui]
 * @version 1.0.0
 * @license MIT
 *
 * @param chaveDeAtivacao
 * @text Chave de Ativação (Para Regenerar)
 * @type switch
 * @desc Chave do jogo que, quando ligada, ativa a regeneração da área de tiles (opcional). Defina como 0 para desativar a regeneração.
 * @default 0
 *
 * @param areaStartX
 * @text Coordenada X Inicial da Área
 * @type number
 * @desc Coordenada X do canto superior esquerdo da área a ser alterada (começa em 0).
 * @default 0
 *
 * @param areaStartY
 * @text Coordenada Y Inicial da Área
 * @type number
 * @desc Coordenada Y do canto superior esquerdo da área a ser alterada (começa em 0).
 * @default 0
 *
 * @param areaWidth
 * @text Largura da área a ser alterada (em tiles).
 * @default 5
 *
 * @param areaHeight
 * @text Altura da área a ser alterada (em tiles).
 * @default 5
 *
 * @param idTileMinimo
 * @text ID Mínimo do Tile
 * @type number
 * @desc ID mínimo do tile para alterar. Os IDs de tile devem corresponder aos definidos no seu tileset.
 * @default 2912
 *
 * @param idTileMaximo
 * @text ID Máximo do Tile
 * @type number
 * @desc ID máximo do tile para alterar. Os IDs de tile devem corresponder aos definidos no seu tileset.
 * @default 2960
 *
 * @param switchMapaGerado
 * @text Switch de Mapa Gerado
 * @type switch
 * @desc Switch que indica se o mapa já foi gerado (ligado = sim). Use um switch que não esteja sendo usado para outra finalidade.
 * @default 12
 *
 * @help
 * ============================================================================
 * Introdução
 * ============================================================================
 * Este plugin altera uma área específica de tiles no mapa atual na primeira vez
 * que um novo jogo é iniciado. As alterações são persistidas ao salvar e carregar
 * o jogo. Opcionalmente, você pode definir uma chave de ativação para regenerar
 * a área de tiles durante o jogo.
 *
 * ATENÇÃO: Este plugin MODIFICA o sistema de salvamento do RPG Maker MZ para
 * persistir as alterações nos tiles. Use com cuidado e faça backup do seu
 * projeto antes de usar.
 *
 * ============================================================================
 * Parâmetros
 * ============================================================================
 * chaveDeAtivacao: Define um switch do jogo que, quando ligado, fará com que a
 * área de tiles seja alterada novamente. Defina como 0 para desativar essa
 * funcionalidade, fazendo com que a alteração ocorra apenas no início de um
 * novo jogo.
 *
 * areaStartX: A coordenada X do tile no canto superior esquerdo da área que
 * será alterada. A contagem começa em 0.
 *
 * areaStartY: A coordenada Y do tile no canto superior esquerdo da área que
 * será alterada. A contagem começa em 0.
 *
 * areaWidth: A largura da área a ser alterada, em número de tiles.
 *
 * areaHeight: A altura da área a ser alterada, em número de tiles.
 *
 * idTileMinimo: O ID mínimo do tile que pode ser usado para substituir os
 * tiles na área especificada. O plugin escolherá um ID de tile aleatório
 * entre este valor e o ID máximo. Certifique-se de que este ID seja válido
 * no seu tileset.
 *
 * idTileMaximo: O ID máximo do tile que pode ser usado para substituir os
 * tiles na área especificada. Certifique-se de que este ID seja válido no
 * seu tileset e que seja maior ou igual ao ID mínimo.
 *
 * switchMapaGerado: O ID de um switch do jogo que será ligado automaticamente
 * após a geração inicial do mapa. Isso garante que a geração ocorra apenas
 * uma vez por novo jogo. Escolha um switch que não esteja sendo usado para
 * outra finalidade no seu jogo.
 *
 * ============================================================================
 * Instruções
 * ============================================================================
 * 1. Adicione este plugin ao seu projeto no RPG Maker MZ.
 * 2. Configure os parâmetros conforme a sua necessidade. Certifique-se de
 * escolher um valor apropriado para o "Switch de Mapa Gerado".
 * 3. Se desejar permitir a regeneração da área, defina um switch para o
 * parâmetro "Chave de Ativação (Para Regenerar)".
 *
 * ============================================================================
 * Notas
 * ============================================================================
 * - As alterações nos tiles são salvas automaticamente com o jogo.
 * - Certifique-se de que os IDs de tile definidos nos parâmetros "ID Mínimo
 * do Tile" e "ID Máximo do Tile" correspondem aos IDs de tiles válidos no
 * seu tileset atual. Caso contrário, você poderá ver tiles em branco ou
 * inesperados.
 * - Se você alterar os parâmetros do plugin após já ter iniciado um novo jogo,
 * as alterações em jogos salvos anteriormente podem não ser refletidas.
 *
 * ============================================================================
 * Fim da Ajuda
 * ============================================================================
 */

(() => {
    const pluginName = "PersistentAreaTileChanger";
    const chaveDeAtivacao = Number(PluginManager.parameters(pluginName)['chaveDeAtivacao'] || 0);
    const areaStartX = Number(PluginManager.parameters(pluginName)['areaStartX'] || 0);
    const areaStartY = Number(PluginManager.parameters(pluginName)['areaStartY'] || 0);
    const areaWidth = Number(PluginManager.parameters(pluginName)['areaWidth'] || 5);
    const areaHeight = Number(PluginManager.parameters(pluginName)['areaHeight'] || 5);
    const idTileMinimo = Number(PluginManager.parameters(pluginName)['idTileMinimo'] || 2912);
    const idTileMaximo = Number(PluginManager.parameters(pluginName)['idTileMaximo'] || 2960);
    const switchMapaGerado = Number(PluginManager.parameters(pluginName)['switchMapaGerado'] || 12);

    function runTileChangerPlugin() {
        let _areaAlterada = false;
        let _savedTileChanges = {};
        let _mapaGerado = false;

        function getRandomTileId() {
            return Math.floor(Math.random() * (idTileMaximo - idTileMinimo + 1)) + idTileMinimo;
        }

        function alterarTile(mapId, x, y, newTileId) {
            if (!$gameMap || $gameMap.mapId() !== mapId || !$dataMap || !$dataMap.data) return;

            const width = $dataMap.width;
            const height = $dataMap.height;
            const layer0Index = y * width + x;
            const layer1Index = width * height + layer0Index;
            const layer2Index = 2 * width * height + layer0Index;

            if (x >= 0 && x < width && y >= 0 && y < height) {
                $dataMap.data[layer0Index] = newTileId;
                $dataMap.data[layer1Index] = newTileId;
                $dataMap.data[layer2Index] = newTileId;
            }
        }

        const gerarMapa = () => {
            const currentMapId = $gameMap.mapId();
            const changes = [];
            for (let y = 0; y < areaHeight; y++) {
                for (let x = 0; x < areaWidth; x++) {
                    const tileX = areaStartX + x;
                    const tileY = areaStartY + y;
                    const newTileId = getRandomTileId();
                    alterarTile(currentMapId, tileX, tileY, newTileId);
                    changes.push({ x: tileX, y: tileY, tileId: newTileId });
                }
            }
            if (!_savedTileChanges[currentMapId]) {
                _savedTileChanges[currentMapId] = [];
            }
            _savedTileChanges[currentMapId] = changes;

            if (SceneManager._scene && SceneManager._scene._spriteset && SceneManager._scene._spriteset.refreshTilemap) {
                SceneManager._scene._spriteset.refreshTilemap();
            }
            $gameSwitches.setValue(switchMapaGerado, true);
            _mapaGerado = true;
        };

        const _Scene_Map_update = Scene_Map.prototype.update;
        Scene_Map.prototype.update = function() {
            _Scene_Map_update.call(this);
            if (chaveDeAtivacao > 0 && $gameSwitches.value(chaveDeAtivacao) && !_areaAlterada) {
                _areaAlterada = true;
                gerarMapa();
            }
        };

        const _Scene_Map_start = Scene_Map.prototype.start;
        Scene_Map.prototype.start = function() {
            _Scene_Map_start.call(this);
            _areaAlterada = false;
            this.carregarAlteracoesDeTile();

            if (!$gameSwitches.value(switchMapaGerado) && !_mapaGerado) {
                gerarMapa();
            }
        };

        Scene_Map.prototype.carregarAlteracoesDeTile = function() {
            const mapId = $gameMap.mapId();
            if (_savedTileChanges[mapId] && $gameMap && $dataMap && $dataMap.data) {
                _savedTileChanges[mapId].forEach(change => {
                    alterarTile(mapId, change.x, change.y, change.tileId);
                });
                if (this._spriteset && this._spriteset.refreshTilemap) {
                    this._spriteset.refreshTilemap();
                }
            }
        };

        const _DataManager_makeSaveContents = DataManager.makeSaveContents;
        DataManager.makeSaveContents = function() {
            const contents = _DataManager_makeSaveContents.call(this);
            contents.persistentTileChanges = _savedTileChanges;
            return contents;
        };

        const _DataManager_extractSaveContents = DataManager.extractSaveContents;
        DataManager.extractSaveContents = function(contents) {
            _DataManager_extractSaveContents.call(this, contents);
            if (contents.persistentTileChanges) {
                _savedTileChanges = contents.persistentTileChanges;
            }
        };

        const _DataManager_setupNewGame = DataManager.setupNewGame;
        DataManager.setupNewGame = function() {
            _DataManager_setupNewGame.call(this);
            _areaAlterada = false;
            _savedTileChanges = {};
            $gameSwitches.setValue(switchMapaGerado, false);
            _mapaGerado = false;
        };
    }

    runTileChangerPlugin();
})();