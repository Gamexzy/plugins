/*:
 * @target MZ
 * @plugindesc Coordena a geração de chunks do mundo, utilizando múltiplos geradores registrados. Suporta mapas em looping. Utiliza BasicChunkGenerator.js para conversão de coordenadas.
 * @author [Seu Nome Aqui]
 * @version 0.5.4 // Versão: Adicionado parâmetro de Modo de Depuração.
 * @license MIT
 * @help
 * Este plugin gerencia o processo de geração de chunks do mundo em um mapa com scroll tipo loop.
 * Ele orquestra a chamada de diversas funções de geração de outros plugins que se registram nele.
 * Aceita coordenadas de chunk "reais" do BasicChunkGenerator e lida com o envolvimento do mapa base.
 * Fornece a função getWorldTileId para geradores acessarem tiles globais reais, convertendo para coordenadas envolvidas usando BasicChunkGenerator.js.
 *
 * @param Initial Chunk Tile ID
 * @text ID do Tile Inicial do Chunk
 * @type number
 * @desc O ID do tile com o qual os novos chunks serão preenchidos ANTES de os geradores rodarem. Escolha um tile comum do seu treinamento.
 * @default 2816 // Sugestão: Mude este padrão para algo como 2816 (Grama)
 *
 * @param Generation Functions Order
 * @text Ordem das Funções de Geração
 * @type text[]
 * @desc Nomes dos plugins geradores registrados, na ordem em que suas funções serão executadas (Ex: ["PerlinNoiseGenerator", "MarkovWorldGenerator"]).
 * @default ["PerlinNoiseGenerator","MarkovWorldGenerator"]
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
    const pluginName = "WorldGenerationCoordinator";
    const parameters = PluginManager.parameters(pluginName);

    const initialChunkTileId = Number(parameters['Initial Chunk Tile ID'] || (globalThis.emptyTileId !== undefined ? globalThis.emptyTileId : 0));
    const debugMode = String(parameters['debugMode'] || 'false') === 'true'; // Novo parâmetro

    const _registeredGenerators = [];

    let generationOrder = ["PerlinNoiseGenerator","MarkovWorldGenerator"];
    try {
        const genOrderParam = parameters['Generation Functions Order'];
        if (genOrderParam) {
            generationOrder = JSON.parse(genOrderParam);
        }
    } catch (e) {
        console.error(`${pluginName}: Erro ao parsear o parâmetro 'Generation Functions Order'. Usando padrão.`, e);
    }

    /**
     * Registra uma função de geração de chunk de outro plugin.
     */
    function registerGenerator(generatorName, generateFunction) {
        if (debugMode) console.log(`${pluginName}.registerGenerator: Tentando registrar gerador "${generatorName}".`);
        if (typeof generatorName !== 'string' || typeof generateFunction !== 'function') {
            console.error(`${pluginName}: Tentativa de registrar gerador com nome ou função inválidos.`);
            return;
        }
        if (_registeredGenerators.some(gen => gen.name === generatorName)) {
            if (debugMode) console.warn(`${pluginName}: Gerador com o nome "${generatorName}" já registrado.`);
            return;
        }
        _registeredGenerators.push({ name: generatorName, generateFunction: generateFunction });
        if (debugMode) console.log(`${pluginName}: Gerador "${generatorName}" registrado com sucesso. Total de geradores: ${_registeredGenerators.length}.`);
    }


    /**
     * Cria o objeto inicial chunkData para ser passado aos geradores.
     * Inclui a função getWorldTileId que usa BasicChunkGenerator.getWrappedCoordinates.
     */
    function createInitialChunkData(chunkXReal, chunkYReal, mapId, chunkWidth, chunkHeight, fillTileId) {
        const tiles = Array(chunkHeight).fill(null).map(() => Array(chunkWidth).fill(fillTileId));

        const chunkData = {
            chunkX: chunkXReal,
            chunkY: chunkYReal,
            width: chunkWidth,
            height: chunkHeight,
            mapId: mapId,
            tiles: tiles,

            /**
             * Retorna o ID do tile em uma coordenada global "real" e camada,
             * consultando o mapa base e lidando com o envolvimento usando BasicChunkGenerator.getWrappedCoordinates.
             */
            getWorldTileId: function(worldXReal, worldYReal, layer) {
                const emptyTile = globalThis.emptyTileId !== undefined ? globalThis.emptyTileId : 0;

                if (globalThis.BasicChunkGenerator && globalThis.BasicChunkGenerator.getWrappedCoordinates) {
                    const { x: xWrapped, y: yWrapped } = globalThis.BasicChunkGenerator.getWrappedCoordinates(worldXReal, worldYReal);

                    if (!$dataMap) {
                        if (debugMode) console.warn(`${pluginName}: getWorldTileId (dentro de chunkData) $dataMap não disponível.`);
                        return emptyTile;
                    }

                    if (xWrapped < 0 || yWrapped < 0 || layer < 0 || layer >= 4 || xWrapped >= $dataMap.width || yWrapped >= $dataMap.height) {
                        return emptyTile;
                    }

                    const index = layer * $dataMap.width * $dataMap.height + yWrapped * $dataMap.width + xWrapped;

                    if ($dataMap.data && index < $dataMap.data.length) {
                        return $dataMap.data[index];
                    } else {
                        return emptyTile;
                    }
                } else {
                    console.error(`${pluginName}: BasicChunkGenerator.getWrappedCoordinates não disponível em getWorldTileId (dentro de chunkData).`);
                    return emptyTile;
                }
            }
        };
        return chunkData;
    }

    /**
     * Gera os dados de tile para um chunk específico, orquestrando os geradores registrados.
     * Chamada pelo BasicChunkGenerator.
     */
    window.WorldGenerationCoordinator = window.WorldGenerationCoordinator || {};
    window.WorldGenerationCoordinator.getChunkTiles = function(mapId, chunkXReal, chunkYReal, callback) {
        if (debugMode) console.log(`${pluginName}.getChunkTiles: Chamado para chunk real (${chunkXReal},${chunkYReal}).`);

        const chunkWidth = globalThis.chunkWidth !== undefined ? globalThis.chunkWidth : 16;
        const chunkHeight = globalThis.chunkHeight !== undefined ? globalThis.chunkHeight : 16;

        const startXReal = chunkXReal * chunkWidth;
        const startYReal = chunkYReal * chunkHeight;

        let chunkData = createInitialChunkData(chunkXReal, chunkYReal, mapId, chunkWidth, chunkHeight, initialChunkTileId);

        const orderedGenerators = generationOrder
            .map(name => _registeredGenerators.find(gen => gen.name === name))
            .filter(gen => gen !== undefined);

        if (debugMode) console.log(`${pluginName}.getChunkTiles: Geradores ordenados para este chunk: ${orderedGenerators.map(g => g.name).join(', ')}`);

        if (orderedGenerators.length === 0) {
            if (debugMode) console.warn(`${pluginName}.getChunkTiles: Nenhuns geradores encontrados ou registrados na ordem especificada. O chunk será preenchido apenas com o tile inicial.`);
        }

        for (const generatorInfo of orderedGenerators) {
            try {
                if (debugMode) console.log(`${pluginName}.getChunkTiles: Executando gerador "${generatorInfo.name}" para chunk real (${chunkXReal},${chunkYReal}).`);
                chunkData = generatorInfo.generateFunction(chunkData);
            } catch (error) {
                console.error(`${pluginName}: Erro ao executar a função geradora "${generatorInfo.name}" para chunk real (${chunkXReal},${chunkYReal}):`, error);
            }
        }

        const generatedTilesList = [];
        const baseLayerTiles = chunkData.tiles;

        for(let y = 0; y < chunkData.height; y++) {
            for(let x = 0; x < chunkData.width; x++) {
                const xGlobalReal = startXReal + x;
                const yGlobalReal = startYReal + y;

                if (baseLayerTiles[y] !== undefined && baseLayerTiles[y][x] !== undefined) {
                    generatedTilesList.push({
                        x: xGlobalReal,
                        y: yGlobalReal,
                        layer: 0,
                        tileId: baseLayerTiles[y][x]
                    });
                }
            }
        }
        if (debugMode) console.log(`${pluginName}.getChunkTiles: ${generatedTilesList.length} tiles gerados para chunk real (${chunkXReal},${chunkYReal}).`);


        if (callback && typeof callback === 'function') {
            callback(generatedTilesList);
        } else {
            if (debugMode) console.warn(`${pluginName}: Callback não fornecido ou não é uma função para getChunkTiles.`);
        }
    };


    // <<<<< EXPOSIÇÃO GLOBAL >>>>>
    globalThis.WorldGenerationCoordinator = globalThis.WorldGenerationCoordinator || {};
    globalThis.WorldGenerationCoordinator.registerGenerator = registerGenerator;
    globalThis.WorldGenerationCoordinator.getChunkTiles = window.WorldGenerationCoordinator.getChunkTiles;

    /**
     * Expõe a função getWorldTileId globalmente.
     * Agora chama a função do BasicChunkGenerator.js internamente.
     */
     globalThis.WorldGenerationCoordinator.getWorldTileId = function(worldXReal, worldYReal, layer) {
         const emptyTile = globalThis.emptyTileId !== undefined ? globalThis.emptyTileId : 0;

         if (globalThis.BasicChunkGenerator && globalThis.BasicChunkGenerator.getWrappedCoordinates) {
             const { x: xWrapped, y: yWrapped } = globalThis.BasicChunkGenerator.getWrappedCoordinates(worldXReal, worldYReal);

             if (!$dataMap) {
                if (debugMode) console.warn(`${pluginName}: getWorldTileId (global) $dataMap não disponível.`);
                return emptyTile;
             }

             if (xWrapped < 0 || yWrapped < 0 || layer < 0 || layer >= 4 || xWrapped >= $dataMap.width || yWrapped >= $dataMap.height) {
                 return emptyTile;
             }

             const index = layer * $dataMap.width * $dataMap.height + yWrapped * $dataMap.width + xWrapped;

             if ($dataMap.data && index < $dataMap.data.length) {
                  return $dataMap.data[index];
             } else {
                  return emptyTile;
             }
         } else {
             console.error(`${pluginName}: BasicChunkGenerator.getWrappedCoordinates não disponível em getWorldTileId (global).`);
             return emptyTile;
         }
     };
    // <<<<< Fim EXPOSIÇÃO GLOBAL >>>>>


    if (debugMode) console.log(`${pluginName}: Plugin carregado.`);
})();
