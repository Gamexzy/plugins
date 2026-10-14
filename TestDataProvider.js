/*:
 * @target MZ
 * @plugindesc [Procedural] Plugin de Teste Simples para Registrar no EnvironmentVariableUpdater.
 * @author Seu Nome Aqui (Plugin de Teste)
 * @version 1.0.0
 * @license MIT
 * @help
 * Este é um plugin de teste básico projetado para funcionar com o
 * EnvironmentVariableUpdater (v2).
 *
 * Ele implementa a função getEnvironmentDataForCoords(realX, realY)
 * e se registra automaticamente no EnvironmentVariableUpdater ao carregar.
 *
 * Os dados que ele fornece são valores simples baseados nas coordenadas:
 * - Altura: Simplesmente o valor de realY para teste.
 * - Temperatura: Simplesmente o valor de realX para teste.
 * - Umidade: Um valor fixo ou baseado em realX + realY.
 *
 * Para usar:
 * 1. Certifique-se de que o EnvironmentVariableUpdater (v2) está ativo e
 * carregado ANTES deste plugin na lista de plugins.
 * 2. Certifique-se de que um plugin que fornece window._realPlayerX e
 * window._realPlayerY esteja ativo e carregado ANTES do EVU.
 * 3. Configure Variáveis do Jogo para Altura e Temperatura (e opcionalmente Umidade)
 * nos parâmetros do EnvironmentVariableUpdater (v2).
 * 4. Execute o jogo e mova o jogador. Verifique se as variáveis configuradas
 * estão sendo atualizadas com valores baseados na posição real.
 *
 * Este plugin não tem parâmetros próprios e serve apenas para testar a
 * integração com o EnvironmentVariableUpdater.
 */

(function() {
    const pluginName = "TestDataProvider"; // Nome interno do plugin

    // --- Implementação do Provedor de Dados Ambientais ---

    // Este objeto conterá as funções que o EnvironmentVariableUpdater espera
    const TestEnvironmentalDataProvider = {

        /**
         * Retorna dados ambientais simulados para as coordenadas reais fornecidas.
         * Esta função é chamada pelo EnvironmentVariableUpdater.
         * @param {number} realX A coordenada X real do jogador.
         * @param {number} realY A coordenada Y real do jogador.
         * @returns {object} Um objeto contendo dados ambientais (pelo menos um de height, temp, humidity).
         */
        getEnvironmentDataForCoords: function(realX, realY) {
            // Verifica se as coordenadas são números válidos
            if (typeof realX !== 'number' || typeof realY !== 'number') {
                console.warn(`${pluginName}: Recebeu coordenadas inválidas:`, realX, realY);
                // Retorna um objeto vazio ou padrão se as coordenadas forem inválidas
                return { height: 0, temp: 0, humidity: 0 };
            }

            // Gera dados de teste simples baseados nas coordenadas reais
            const testHeight = realY; // Exemplo: Altura aumenta com a coordenada Y
            const testTemp = realX;   // Exemplo: Temperatura aumenta com a coordenada X
            const testHumidity = (realX + realY) % 100; // Exemplo: Umidade cíclica

            // Retorna um objeto com os dados ambientais para o EnvironmentVariableUpdater
            return {
                height: testHeight,
                temp: testTemp,
                humidity: testHumidity
                // Adicione outros tipos de dados aqui se o EVU suportar e você quiser testar
            };
        }

        // Outras funções que seu plugin poderia ter, mas que o EVU não chamaria diretamente.
        // Por exemplo, uma função de inicialização específica deste plugin.
        // init: function() { console.log("TestDataProvider inicializado."); }
    };


    // --- Registro no EnvironmentVariableUpdater ---

    // Espera um pouco para garantir que o EnvironmentVariableUpdater já carregou.
    // Uma abordagem mais robusta seria usar um evento de plugin carregado,
    // mas para um plugin de teste simples, um setTimeout curto geralmente funciona.
    // Idealmente, o registro acontece logo após o plugin gerador ter definido
    // seu objeto principal e o EnvironmentVariableUpdater estar disponível.

    // Uma forma mais direta dentro do IIFE é verificar e registrar na hora:
    if (window.EnvironmentVariableUpdater && typeof window.EnvironmentVariableUpdater.registerEnvironmentDataProvider === 'function') {
        console.log(`${pluginName}: EnvironmentVariableUpdater encontrado. Tentando registrar como provedor de dados.`);
        // Chama a função de registro do EVU, passando nosso objeto provedor
        window.EnvironmentVariableUpdater.registerEnvironmentDataProvider(TestEnvironmentalDataProvider);
    } else {
        console.warn(`${pluginName}: EnvironmentVariableUpdater não encontrado ou função de registro ausente. Não foi possível registrar o provedor de teste. Certifique-se de que o plugin EnvironmentVariableUpdater está ativo e carregado ANTES deste.`);
    }


    // --- Expondo o objeto do plugin (Opcional para este teste, mas boa prática) ---
    // Se você precisar acessar este plugin de teste externamente (por exemplo,
    // para chamar TestDataProvider.getEnvironmentDataForCoords via script),
    // atribua-o à janela global. Para este teste simples, não é estritamente
    // necessário que outros plugins o chamem, apenas o EVU precisa.
    // window.TestDataProvider = TestEnvironmentalDataProvider;


    console.log(`${pluginName}: Plugin de teste carregado.`);


})();