/*:
 * @target MZ
 * @plugindesc [Procedural] Renderiza dinamicamente tiles de diferentes tilesets com base no bioma, para um mundo contínuo sem fades.
 * @author Seu Nome Aqui
 * @version 1.4.2 // Versão: Adicionado log para verificar o estado de Tilemap._mapData.
 * @license MIT
 * @help
 * ===========================================================================
 * Introdução
 * ===========================================================================
 * Este plugin permite que você tenha múltiplos tilesets (um por bioma) e os
 * renderize dinamicamente no mesmo mapa, criando um mundo contínuo sem
 * transições de tela. Ele AGORA depende do plugin BiomeTilesetLoader.js
 * para carregar e gerenciar os bitmaps dos tilesets de bioma.
 *
 * Ele se integra com o BasicChunkGenerator e o PerlinNoiseGenerator para
 * determinar o bioma de cada tile e usar o tileset apropriado.
 *
 * ===========================================================================
 * Configuração
 * ===========================================================================
 * 1. Certifique-se de que o plugin BiomeTilesetLoader.js está instalado
 * e configurado (com os mapeamentos de biomas e o caminho personalizado).
 * 2. Certifique-se de que este plugin seja carregado DEPOIS de
 * BiomeTilesetLoader.js, BasicChunkGenerator, WorldGenerationCoordinator
 * e PerlinNoiseGenerator.
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
    const pluginName = "DynamicBiomeRenderer";
    const parameters = PluginManager.parameters(pluginName);

    // --- Parâmetros do Plugin ---
    const debugMode = Boolean(parameters['debugMode'] === 'true');

    // --- Funções para a API global (mover para o topo da IIFE) ---
    // Declarações de funções para perto do topo da IIFE
    function updateBiomeRenderLogic(tilemap) {
        if (!globalThis.BasicChunkGenerator || !globalThis.BasicChunkGenerator.getRealPlayerCoordinates || !$gamePlayer) {
            if (debugMode) console.warn(`${pluginName}: BasicChunkGenerator ou $gamePlayer não disponível para obter coordenadas reais do jogador.`);
            return;
        }

        const playerRealCoords = globalThis.BasicChunkGenerator.getRealPlayerCoordinates();
        if (debugMode) console.log(`${pluginName}: Posição Real do Jogador: (${playerRealCoords.x}, ${playerRealCoords.y})`);

        let biomeName = "Land"; // Padrão

        if (globalThis.SimpleBiomeTestGenerator && globalThis.SimpleBiomeTestGenerator.getBiomeNameForCoords) {
            biomeName = globalThis.SimpleBiomeTestGenerator.getBiomeNameForCoords(playerRealCoords.x, playerRealCoords.y);
        } else if (globalThis.PerlinNoiseGenerator && globalThis.PerlinNoiseGenerator.getBiomeNameForCoords) {
            biomeName = globalThis.PerlinNoiseGenerator.getBiomeNameForCoords(playerRealCoords.x, playerRealCoords.y);
        } else {
            if (debugMode) console.warn(`${pluginName}: Nenhum gerador de bioma (SimpleBiomeTestGenerator ou PerlinNoiseGenerator) disponível. Usando bioma padrão 'Land'.`);
        }
        if (debugMode) console.log(`${pluginName}: Bioma Determinado: ${biomeName}`);

        // Obtém os bitmaps do BiomeTilesetLoader
        const biomeBitmaps = globalThis.BiomeTilesetLoader.getBitmapsForBiome(biomeName);

        if (biomeBitmaps && biomeBitmaps.length > 0) {
            // <<<<< NOVO LOG: URLs dos Bitmaps sendo comparados >>>>>
            if (debugMode) {
                const currentBitmapUrl = tilemap._bitmaps[0]?.url || 'N/A';
                const newBitmapUrl = biomeBitmaps[0]?.url || 'N/A';
                console.log(`${pluginName}: Comparando Bitmaps. Atual: ${currentBitmapUrl}, Novo (para ${biomeName}): ${newBitmapUrl}`);

                // <<<<< NOVO LOG: Amostra do Tilemap._mapData >>>>>
                if (tilemap._mapData && tilemap._mapData.length > 0) {
                    const sampleSize = 10; // Tamanho da amostra
                    const sample = tilemap._mapData.slice(0, sampleSize);
                    const allZeros = sample.every(tileId => tileId === 0);
                    console.log(`${pluginName}: Amostra de Tilemap._mapData (primeiros ${sampleSize} elementos):`, sample, `(Todos zeros: ${allZeros})`);
                    
                    // Verificar se existe algum tile ID diferente de zero na amostra.
                    let hasNonZero = false;
                    for (let i = 0; i < tilemap._mapData.length; i++) {
                        if (tilemap._mapData[i] !== 0) {
                            hasNonZero = true;
                            break;
                        }
                    }
                    console.log(`${pluginName}: Tilemap._mapData Contém Tiles Não-Zero em algum lugar:`, hasNonZero);

                } else {
                    console.log(`${pluginName}: Tilemap._mapData está vazio ou não definido.`);
                }
            }

            if (tilemap._bitmaps !== biomeBitmaps) {
                if (debugMode) {
                    console.log(`${pluginName}: Trocando Tilemap._bitmaps para bioma ${biomeName}.`);
                }
                tilemap._bitmaps = biomeBitmaps;
                tilemap._needsRepaint = true;
                tilemap._needsBitmapsUpdate = true;
            } else {
                if (debugMode) console.log(`${pluginName}: Tilemap._bitmaps já é o correto para o bioma '${biomeName}'. Nenhuma troca necessária.`);
            }
        } else {
            if (debugMode) console.warn(`${pluginName}: Bitmaps para o bioma '${biomeName}' não disponíveis no BiomeTilesetLoader. Mantendo renderização atual.`);
        }
    }


    // --- Hooks do Motor ---

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);

        if (debugMode) {
            console.log(`[${pluginName}] Scene_Map.start: Spriteset:`, this._spriteset);
            console.log(`[${pluginName}] Scene_Map.start: Spriteset Tilemap:`, this._spriteset?._tilemap);
            if (this._spriteset?._tilemap && typeof this._spriteset._tilemap.update === 'function') {
                console.log(`[${pluginName}] Scene_Map.start: Tilemap update é uma função. URL do primeiro bitmap: ${this._spriteset._tilemap._bitmaps[0]?.url || 'N/A'}`);
            } else {
                console.error(`[${pluginName}] Scene_Map.start: Tilemap ou update não encontrado no spriteset!`);
            }
        }
    };

    const _Tilemap_update = Tilemap.prototype.update;
    Tilemap.prototype.update = function() {
        _Tilemap_update.call(this);

        // Verifica se o BiomeTilesetLoader está disponível e se todos os tilesets estão prontos
        if (globalThis.BiomeTilesetLoader && globalThis.BiomeTilesetLoader.areAllBiomeTilesetsReady()) {
            updateBiomeRenderLogic(this); // Passa 'this' (o objeto Tilemap) para a função
        } else {
            if (debugMode) console.warn(`${pluginName}: Renderização dinâmica adiada. BiomeTilesetLoader ainda carregando tilesets.`);
        }
    };

    // --- Funções Globais Expostas (APIs) ---
    globalThis.DynamicBiomeRenderer = {
        version: '1.4.2 // Versão: Adicionado log para verificar o estado de Tilemap._mapData.',
        // Exponha outras funções se necessário para outros plugins
    };

    if (debugMode) console.log(`${pluginName}: Plugin carregado.`);
})();
