/*:
 * @target MZ
 * @plugindesc [TESTE] Gera biomas simples (Snowy/Land) com base na coordenada X real para testar o DynamicBiomeRenderer.
 * @author Seu Nome Aqui
 * @version 1.0.0 // Versão: Gerador de biomas simples para teste.
 * @license MIT
 * @help
 * ===========================================================================
 * Introdução
 * ===========================================================================
 * Este plugin é uma versão simplificada de um gerador de biomas,
 * projetado especificamente para ser usado com o DynamicBiomeRenderer.js
 * para fins de teste.
 *
 * Ele define biomas com base em uma regra muito simples:
 * - Se a coordenada X real for menor que 0, o bioma é "Snowy".
 * - Se a coordenada X real for maior ou igual a 0, o bioma é "Land".
 *
 * Isso permite que você visualize rapidamente a troca de tilesets
 * ao se mover horizontalmente no mapa.
 *
 * ===========================================================================
 * Configuração
 * ===========================================================================
 * 1. Desative o plugin "PerlinNoiseGenerator.js" no seu Gerenciador de Plugins.
 * 2. Ative este plugin "SimpleBiomeTestGenerator.js".
 * 3. Certifique-se de que este plugin esteja posicionado ANTES de
 * "DynamicBiomeRenderer.js" na lista de plugins.
 * 4. No plugin "DynamicBiomeRenderer.js", configure o parâmetro
 * "Mapeamento de Biomas para Tilesets" para incluir "Snowy" e "Land",
 * apontando para os IDs de tilesets apropriados no seu banco de dados.
 * (Ex: "Snowy" -> ID do Tileset de Neve, "Land" -> ID do Tileset de Terra).
 *
 * @param debugMode
 * @text Modo de Depuração
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Ativa logs detalhados no console para depuração.
 * @default false
 */

(() => {
    const pluginName = "SimpleBiomeTestGenerator";
    const parameters = PluginManager.parameters(pluginName);

    const debugMode = String(parameters['debugMode'] || 'false') === 'true';

    // --- Funções Auxiliares ---

    /**
     * @function getBiomeNameForCoords
     * @description Retorna o nome do bioma com base nas coordenadas reais.
     * Esta é uma função de teste simplificada.
     * @param {number} realX - Coordenada X real do mundo.
     * @param {number} realY - Coordenada Y real do mundo.
     * @returns {string} O nome do bioma ("Snowy" ou "Land").
     */
    function getBiomeNameForCoords(realX, realY) {
        if (realX < 0) {
            return "Snowy";
        } else {
            return "Land";
        }
    }

    // --- Exposição Global ---

    // Expõe o objeto SimpleBiomeTestGenerator globalmente
    globalThis.SimpleBiomeTestGenerator = {
        getBiomeNameForCoords: getBiomeNameForCoords,
        version: '1.0.0 // Versão: Gerador de biomas simples para teste.'
    };

    // Opcional: Se o EnvironmentVariableUpdater estiver presente e configurado
    // para usar um provedor de dados, você pode registrar uma função aqui.
    // Para este teste simples, não é estritamente necessário, mas demonstra a integração.
    if (globalThis.EnvironmentVariableUpdater && globalThis.EnvironmentVariableUpdater.registerDataProvider) {
        globalThis.EnvironmentVariableUpdater.registerDataProvider(pluginName, (realX, realY) => {
            // Retorna dados ambientais básicos para teste
            const biome = getBiomeNameForCoords(realX, realY);
            let height = 0;
            let temp = 0;
            let humidity = 0;

            if (biome === "Snowy") {
                height = 500; // Exemplo: altura para neve
                temp = -10;  // Exemplo: temperatura fria
                humidity = 30; // Exemplo: umidade baixa
            } else if (biome === "Land") {
                height = 100; // Exemplo: altura para terra
                temp = 20;   // Exemplo: temperatura amena
                humidity = 60; // Exemplo: umidade moderada
            }
            return { height: height, temp: temp, humidity: humidity };
        });
    }

    if (debugMode) console.log(`${pluginName}: Plugin carregado.`);
})();
