/*:
* @target MZ
* @plugindesc Fornece funcionalidade para salvar e carregar alterações de tile e dados base de chunks, suportando coordenadas de chunk reais para mapas em looping.
* @author [Seu Nome Aqui]
* @version 1.4.0 // Versão: Adicionado parâmetro de Modo de Depuração e padronização global.
* @license MIT
* @help
* ============================================================================\
* Introdução
* ============================================================================\
* Este plugin armazena alterações feitas nos tiles do mapa por jogador/eventos
* e o estado base gerado dos chunks. Ele usa coordenadas de chunk "reais"
* para garantir que as modificações e a geração persistam em mapas com scroll
* tipo loop. **Agora também salva o estado de rastreamento de coordenadas do BasicChunkGenerator.**
*
* ============================================================================\
* Instruções
* ============================================================================\
* 1. Adicione este plugin ao seu projeto no RPG Maker MZ. Certifique-se de que
* ele esteja posicionado ANTES de BasicChunkGenerator.js.
* 2. BasicChunkGenerator.js e WorldGenerationCoordinator.js chamarão
* as funções save/load com coordenadas de chunk reais.
*
* ============================================================================\
* Funções Disponíveis para Outros Plugins (Principalmente BasicChunkGenerator):
* ============================================================================\
* globalThis.GameSaver.saveTileChanges(mapId, chunkXReal, chunkYReal, changeList): Salva alterações de tile para um chunk real.
* globalThis.GameSaver.loadTileChanges(mapId, chunkXReal, chunkYReal): Carrega alterações de tile para um chunk real.
* globalThis.GameSaver.saveChunkBaseData(mapId, chunkXReal, chunkYReal, chunkDataList): Salva estado base gerado para um chunk real.
* globalThis.GameSaver.loadChunkBaseData(mapId, chunkXReal, chunkYReal): Carrega estado base gerado para um chunk real.
* globalThis.GameSaver.registerTileChangeReal(mapId, xGlobalReal, yGlobalReal, layer, newTileId): Registra alteração de tile com coordenadas reais.
* globalThis.GameSaver.saveBasicChunkGeneratorState(state): Salva o estado interno do BasicChunkGenerator.
* globalThis.GameSaver.loadBasicChunkGeneratorState(): Carrega o estado interno do BasicChunkGenerator.
*
* @param debugMode
* @text Modo de Depuração
* @type boolean
* @on SIM
* @off NÃO
* @desc Ativa logs detalhados no console para depuração.
* @default false
*
* ============================================================================\
*/

(() => {
    const pluginName = "GameSaver";
    const parameters = PluginManager.parameters(pluginName);

    const debugMode = String(parameters['debugMode'] || 'false') === 'true'; // Novo parâmetro

    let _tileChanges = {};
    let _chunkBaseData = {};
    let _bcgState = null;

    const SAVE_KEY_DATA = 'proceduralChunkData';


    // --- Integração com o Sistema de Save/Load do RMMZ ---

    const _DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        const contents = _DataManager_makeSaveContents.call(this);
        contents[SAVE_KEY_DATA] = {
            tileChanges: _tileChanges,
            chunkBaseData: _chunkBaseData,
            basicChunkGeneratorState: _bcgState
        };
        if (debugMode) console.log(`${pluginName}: Dados de save (alterações de tile, base de chunk, BCG State) preparados.`);
        return contents;
    };

    const _DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _DataManager_extractSaveContents.call(this, contents);
        if (contents[SAVE_KEY_DATA]) {
            _tileChanges = contents[SAVE_KEY_DATA].tileChanges || {};
            _chunkBaseData = contents[SAVE_KEY_DATA].chunkBaseData || {};
            _bcgState = contents[SAVE_KEY_DATA].basicChunkGeneratorState || null;
            if (debugMode) console.log(`${pluginName}: Dados de save (alterações de tile, base de chunk, BCG State) carregados.`);
        } else {
            _tileChanges = {};
            _chunkBaseData = {};
            _bcgState = null;
            if (debugMode) console.log(`${pluginName}: Nenhum dado de save encontrado para chunks/BCG. Inicializando.`);
        }
    };

    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        _tileChanges = {};
        _chunkBaseData = {};
        _bcgState = null;
        if (debugMode) console.log(`${pluginName}: Dados de save de chunks/BCG inicializados para novo jogo.`);
    };


    // --- Funções de Salvar e Carregar Chamadas pelo BasicChunkGenerator ---

    const GameSaver = {}; // Objeto local para as funções antes de expor

    GameSaver.saveTileChanges = function(mapId, chunkXReal, chunkYReal, changeList) {
        const chunkKey = `${chunkXReal},${chunkYReal}`;
        const mapKey = mapId;

        if (!_tileChanges[mapKey]) {
            _tileChanges[mapKey] = {};
        }

        if (changeList && changeList.length > 0) {
            _tileChanges[mapKey][chunkKey] = changeList;
            if (debugMode) console.log(`${pluginName}: Salvando ${changeList.length} alterações para chunk real (${chunkXReal},${chunkYReal}).`);
        } else {
            if (_tileChanges[mapKey]) {
                delete _tileChanges[mapKey][chunkKey];
                if (debugMode) console.log(`${pluginName}: Removendo entrada de alterações vazias para chunk real (${chunkXReal},${chunkYReal}).`);
            }
        }
    };

    GameSaver.loadTileChanges = function(mapId, chunkXReal, chunkYReal) {
        const chunkKey = `${chunkXReal},${chunkYReal}`;
        const mapKey = mapId;

        if (_tileChanges[mapKey] && _tileChanges[mapKey][chunkKey]) {
            if (debugMode) console.log(`${pluginName}: Carregando ${_tileChanges[mapKey][chunkKey].length} alterações para chunk real (${chunkXReal},${chunkYReal}).`);
            return _tileChanges[mapKey][chunkKey];
        } else {
            return [];
        }
    };

    GameSaver.saveChunkBaseData = function(mapId, chunkXReal, chunkYReal, chunkDataList) {
        const chunkKey = `${chunkXReal},${chunkYReal}`;
        const mapKey = mapId;

        if (!_chunkBaseData[mapKey]) {
            _chunkBaseData[mapKey] = {};
        }

        if (chunkDataList && chunkDataList.length > 0) {
            _chunkBaseData[mapKey][chunkKey] = chunkDataList;
            if (debugMode) console.log(`${pluginName}: Salvando ${chunkDataList.length} tiles como base para chunk real (${chunkXReal},${chunkYReal}).`);
        } else {
            if (_chunkBaseData[mapKey]) {
                delete _chunkBaseData[mapKey][chunkKey];
                if (debugMode) console.log(`${pluginName}: Removendo entrada de dados base vazia para chunk real (${chunkXReal},${chunkYReal}).`);
            }
        }
    };

    GameSaver.loadChunkBaseData = function(mapId, chunkXReal, chunkYReal) {
        const chunkKey = `${chunkXReal},${chunkYReal}`;
        const mapKey = mapId;

        if (_chunkBaseData[mapKey] && _chunkBaseData[mapKey][chunkKey]) {
            if (debugMode) console.log(`${pluginName}: Carregando dados base para chunk real (${chunkXReal},${chunkYReal}).`);
            return _chunkBaseData[mapKey][chunkKey];
        } else {
            return null;
        }
    };

    GameSaver.registerTileChangeReal = function(mapId, xGlobalReal, yGlobalReal, layer, newTileId) {
        const chunkWidth = globalThis.chunkWidth !== undefined ? globalThis.chunkWidth : 16;
        const chunkHeight = globalThis.chunkHeight !== undefined ? globalThis.chunkHeight : 16;

        const chunkXReal = Math.floor(xGlobalReal / chunkWidth);
        const chunkYReal = Math.floor(yGlobalReal / chunkHeight);

        const chunkKey = `${chunkXReal},${chunkYReal}`;
        const mapKey = mapId;

        const xLocal = (xGlobalReal % chunkWidth + chunkWidth) % chunkWidth;
        const yLocal = (yGlobalReal % chunkHeight + chunkHeight) % chunkHeight;

        if (!_tileChanges[mapKey]) {
            _tileChanges[mapKey] = {};
        }
        if (!_tileChanges[mapKey][chunkKey]) {
            _tileChanges[mapKey][chunkKey] = [];
        }

        _tileChanges[mapKey][chunkKey] = _tileChanges[mapKey][chunkKey].filter(change =>
            !(change.xLocal === xLocal && change.yLocal === yLocal && change.layer === layer)
        );

        _tileChanges[mapKey][chunkKey].push({
            xLocal: xLocal,
            yLocal: yLocal,
            layer: layer,
            tileId: newTileId
        });

        if (globalThis.BasicChunkGenerator && globalThis.BasicChunkGenerator._modifiedChunks) {
            globalThis.BasicChunkGenerator._modifiedChunks.add(chunkKey);
        } else {
            if (debugMode) console.warn(`${pluginName}: BasicChunkGenerator ou _modifiedChunks não acessível. A alteração pode não ser marcada como modificada.`);
        }
    };

    GameSaver.saveBasicChunkGeneratorState = function(state) {
        _bcgState = state;
        if (debugMode) console.log(`${pluginName}: Estado do BasicChunkGenerator salvo.`);
    };

    GameSaver.loadBasicChunkGeneratorState = function() {
        if (debugMode) console.log(`${pluginName}: Carregando estado do BasicChunkGenerator.`);
        return _bcgState;
    };


    // <<<<< EXPOSIÇÃO GLOBAL >>>>>
    // Expõe o objeto GameSaver globalmente
    window.GameSaver = GameSaver;
    globalThis.GameSaver = GameSaver;

    if (debugMode) console.log(`${pluginName}: Plugin carregado.`);
})();
