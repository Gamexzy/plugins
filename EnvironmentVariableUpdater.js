/*:
 * @target MZ
 * @plugindesc [Procedural] Gerencia e atualiza Variáveis do Jogo com dados ambientais escalados fornecidos por plugins geradores de mundo.
 * @author Seu Nome Aqui
 * @version 2.3.0 // Versão: Adicionado parâmetro de Modo de Depuração.
 * @license MIT
 * @help
 * ===========================================================================
 * Introdução
 * ===========================================================================
 * Este plugin atua como um hub central para coletar dados ambientais escalados
 * (como Altura, Temperatura, Umidade) de plugins geradores de mundo
 * registrados e armazená-los em Variáveis do Jogo configuradas.
 * Ele detecta o movimento do jogador ou a atualização do mapa para acionar
 * as atualizações de variáveis.
 *
 * ===========================================================================
 * Integração com Outros Plugins (Provedores de Dados)
 * ===========================================================================
 * Outros plugins que geram dados ambientais (como PerlinNoiseGenerator)
 * devem implementar uma função pública (ex: getEnvironmentDataForCoords(realX, realY))
 * que retorna um objeto contendo os dados ambientais para as coordenadas
 * "reais" fornecidas (por exemplo: { height: valor, temp: valor, humidity: valor }).
 *
 * Esses plugins geradores devem, após sua inicialização, se registrar neste
 * EnvironmentVariableUpdater chamando:
 *
 * `globalThis.EnvironmentVariableUpdater.registerDataProvider('NomeDoSeuPlugin', suaFuncaoDeDadosAmbientais);`
 *
 * O 'NomeDoSeuPlugin' deve ser o mesmo nome registrado nos parâmetros deste plugin.
 * A função `suaFuncaoDeDadosAmbientais` deve receber `(realX, realY)` como argumentos
 * e retornar um objeto com chaves correspondentes aos nomes dos parâmetros
 * configurados aqui (ex: 'height', 'temp', 'humidity').
 *
 * ===========================================================================
 * Configuração
 * ===========================================================================
 * Configure as variáveis do jogo para cada tipo de dado ambiental que você
 * deseja rastrear. O plugin irá atualizar essas variáveis com os valores
 * mais recentes da localização do jogador.
 *
 * Para o 'Update Frequency', 'player_move' é recomendado para performance,
 * mas 'frame' pode ser usado para atualizações mais constantes (pode ser mais pesado).
 *
 * @param updateFrequency
 * @text Frequência de Atualização
 * @type select
 * @option Ao Mover Jogador (player_move)
 * @option Por Frame (frame)
 * @desc Define quando as variáveis ambientais serão atualizadas.
 * @default player_move
 *
 * @param heightVariableId
 * @text ID da Variável de Altura
 * @type variable
 * @desc Variável do Jogo para armazenar o valor da altura (ex: Altura do Terreno). Deixe 0 para desativar.
 * @default 0
 *
 * @param temperatureVariableId
 * @text ID da Variável de Temperatura
 * @type variable
 * @desc Variável do Jogo para armazenar o valor da temperatura. Deixe 0 para desativar.
 * @default 0
 *
 * @param humidityVariableId
 * @text ID da Variável de Umidade
 * @type variable
 * @desc Variável do Jogo para armazenar o valor da umidade. Deixe 0 para desativar.
 * @default 0
 *
 * @param realPlayerXVariableId
 * @text ID da Variável X do Jogador (Real)
 * @type variable
 * @desc Variável do Jogo para armazenar a coordenada X "real" do jogador (coordenada infinita). Deixe 0 para desativar.
 * @default 0
 *
 * @param realPlayerYVariableId
 * @text ID da Variável Y do Jogador (Real)
 * @type variable
 * @desc Variável do Jogo para armazenar a coordenada Y "real" do jogador (coordenada infinita). Deixe 0 para desativar.
 * @default 0
 *
 * @param dataProviders
 * @text Provedores de Dados Ambientais
 * @type struct<DataProvider>[]
 * @desc Lista de plugins que fornecem dados ambientais (altura, temperatura, umidade).
 * @default []
 *
 * @param debugMode
 * @text Modo de Depuração
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Ativa logs detalhados no console para depuração.
 * @default false
 */
/*~struct~DataProvider:
 * @param name
 * @text Nome do Provedor (Plugin)
 * @type string
 * @desc O nome do plugin que fornece os dados (ex: "PerlinNoiseGenerator").
 * @default
 */

(() => {
    const pluginName = "EnvironmentVariableUpdater";
    const parameters = PluginManager.parameters(pluginName);

    // --- Parâmetros ---
    const updateFrequency = String(parameters['updateFrequency'] || 'player_move');
    const heightVariableId = Number(parameters['heightVariableId'] || 0);
    const temperatureVariableId = Number(parameters['temperatureVariableId'] || 0);
    const humidityVariableId = Number(parameters['humidityVariableId'] || 0);
    const realPlayerXVariableId = Number(parameters['realPlayerXVariableId'] || 0);
    const realPlayerYVariableId = Number(parameters['realPlayerYVariableId'] || 0);
    const debugMode = String(parameters['debugMode'] || 'false') === 'true'; // Novo parâmetro

    // Parse dataProviders array, ensure default is an empty array if parsing fails
    let dataProvidersParam = parameters['dataProviders'];
    const configuredDataProviders = dataProvidersParam ? JSON.parse(dataProvidersParam).map(JSON.parse) : [];

    // Mapeamento interno de qual provedor é responsável por qual tipo de dado,
    // e qual variável do jogo deve ser atualizada.
    // Isso é mais flexível se tivéssemos múltiplos provedores para o mesmo tipo.
    // Por enquanto, usaremos um mapeamento simples.
    const _variableMapping = [];
    if (heightVariableId > 0) _variableMapping.push({ key: 'height', variableId: heightVariableId });
    if (temperatureVariableId > 0) _variableMapping.push({ key: 'temp', variableId: temperatureVariableId });
    if (humidityVariableId > 0) _variableMapping.push({ key: 'humidity', variableId: humidityVariableId });
    if (realPlayerXVariableId > 0) _variableMapping.push({ key: 'playerX', variableId: realPlayerXVariableId });
    if (realPlayerYVariableId > 0) _variableMapping.push({ key: 'playerY', variableId: realPlayerYVariableId });

    // Armazenar as funções de provedores de dados
    // { "NomeDoProvedor": funcaoDeDadosAmbientais(realX, realY) }
    const _registeredDataProviders = new Map();

    /**
     * @function registerDataProvider
     * @description Registra uma função provedora de dados ambientais.
     * A função deve receber (realX, realY) e retornar um objeto
     * { height: num, temp: num, humidity: num, ... }.
     * @param {string} name - O nome do plugin provedor (deve ser único).
     * @param {Function} func - A função que fornece os dados ambientais.
     */
    function registerDataProvider(name, func) {
        if (!name || typeof name !== 'string') {
            console.error(`${pluginName}: Tentativa de registrar provedor sem nome válido.`);
            return;
        }
        if (typeof func !== 'function') {
            console.error(`${pluginName}: Tentativa de registrar provedor '${name}' com função inválida.`);
            return;
        }
        if (_registeredDataProviders.has(name)) {
            if (debugMode) console.warn(`${pluginName}: Provedor '${name}' já registrado. Substituindo.`);
        }

        // Verifica se o provedor está na lista de provedores configurados do plugin
        const isConfigured = configuredDataProviders.some(provider => provider.name === name);
        if (!isConfigured) {
            if (debugMode) console.warn(`${pluginName}: Provedor '${name}' registrado, mas não configurado nos parâmetros do plugin. Ele não será utilizado.`);
        }

        _registeredDataProviders.set(name, func);
        if (debugMode) console.log(`${pluginName}: Provedor de dados ambientais '${name}' registrado com sucesso.`);
    }

    /**
     * @function updateEnvironmentalVariables
     * @description Atualiza as variáveis do jogo com os dados ambientais atuais.
     */
    function updateEnvironmentalVariables() {
        if (!$gamePlayer || !globalThis.BasicChunkGenerator) {
            // Não atualiza se o jogador ou BasicChunkGenerator não estiverem prontos
            return;
        }

        const { x: realX, y: realY } = globalThis.BasicChunkGenerator.getRealPlayerCoordinates();
        let currentEnvironmentalData = {}; // Objeto para coletar todos os dados

        // Coleta dados de todos os provedores registrados que estão na configuração
        for (const configProvider of configuredDataProviders) {
            const providerFunc = _registeredDataProviders.get(configProvider.name);
            if (providerFunc) {
                try {
                    const data = providerFunc(realX, realY);
                    if (data && typeof data === 'object') {
                        Object.assign(currentEnvironmentalData, data);
                    } else {
                        if (debugMode) console.warn(`${pluginName}: Provedor '${configProvider.name}' retornou dados inválidos.`);
                    }
                } catch (e) {
                    console.error(`${pluginName}: Erro ao obter dados do provedor '${configProvider.name}':`, e);
                }
            } else {
                // if (debugMode) console.warn(`${pluginName}: Provedor '${configProvider.name}' configurado, mas não registrado.`);
            }
        }

        // Atualiza as variáveis do jogo
        _variableMapping.forEach(mapping => {
            if (mapping.key === 'playerX') {
                if ($gameVariables.value(mapping.variableId) !== realX) {
                    $gameVariables.setValue(mapping.variableId, realX);
                }
            } else if (mapping.key === 'playerY') {
                if ($gameVariables.value(mapping.variableId) !== realY) {
                    $gameVariables.setValue(mapping.variableId, realY);
                }
            } else if (currentEnvironmentalData.hasOwnProperty(mapping.key)) {
                const value = currentEnvironmentalData[mapping.key];
                // Só atualiza se o valor mudou para evitar eventos desnecessários
                if ($gameVariables.value(mapping.variableId) !== value) {
                    $gameVariables.setValue(mapping.variableId, value);
                }
            }
        });
    }

    // ==========================================================================
    // Hooks de Atualização
    // ==========================================================================

    if (updateFrequency === 'player_move') {
        // Hook quando o jogador se move e completa a transferência
        const _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
        Game_Player.prototype.performTransfer = function() {
            _Game_Player_performTransfer.call(this);
            // Garante que as variáveis sejam atualizadas após uma transferência de mapa
            updateEnvironmentalVariables();
        };

        // Hook para o movimento do jogador (garantir atualização após cada passo)
        const _Game_Player_update = Game_Player.prototype.update;
        Game_Player.prototype.update = function(sceneActive) {
            const wasMoving = this.isMoving();
            _Game_Player_update.apply(this, arguments);
            // Atualiza apenas se o jogador estava se movendo ou se moveu
            if (wasMoving || this.isMoving()) {
                updateEnvironmentalVariables();
            }
        };

    } else if (updateFrequency === 'frame') {
        const _Scene_Map_update_for_EVU = Scene_Map.prototype.update;
        Scene_Map.prototype.update = function() {
            _Scene_Map_update_for_EVU.call(this);
            updateEnvironmentalVariables();
        };
    }

    // ==========================================================================
    // Exposição Global
    // ==========================================================================

    // Exponha o objeto EnvironmentVariableUpdater globalmente para registro de provedores
    globalThis.EnvironmentVariableUpdater = {
        registerDataProvider: registerDataProvider,
        updateEnvironmentalVariables: updateEnvironmentalVariables,
        _registeredDataProviders: _registeredDataProviders
    };

    // Auto-registra WorldClimateEngine / PerlinNoiseGenerator caso tenham sido carregados antes deste plugin
    if (globalThis.WorldClimateEngine && typeof globalThis.WorldClimateEngine.getEnvironmentDataForCoords === "function") {
        registerDataProvider("WorldClimateEngine", (x, y) => globalThis.WorldClimateEngine.getEnvironmentDataForCoords(x, y));
        registerDataProvider("PerlinNoiseGenerator", (x, y) => globalThis.WorldClimateEngine.getEnvironmentDataForCoords(x, y));
    } else if (globalThis.PerlinNoiseGenerator && typeof globalThis.PerlinNoiseGenerator.getEnvironmentDataForCoords === "function") {
        registerDataProvider("PerlinNoiseGenerator", (x, y) => globalThis.PerlinNoiseGenerator.getEnvironmentDataForCoords(x, y));
    }

    if (debugMode) console.log(`${pluginName}: Plugin carregado.`);
})();
