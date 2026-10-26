    /*:
     * @target MZ
     * @plugindesc [Core] Carrega e gerencia o estado de prontidão dos Bitmaps para tilesets de bioma.
     * @author Seu Nome Aqui
     * @version 1.0.1 // Versão: Lógica de contagem de bitmaps em checkAllBiomeBitmapsReady aprimorada.
     * @license MIT
     * @help
     * ===========================================================================
     * Introdução
     * ===========================================================================
     * Este plugin é um módulo de carregamento de recursos dedicado. Ele é
     * responsável por carregar todos os arquivos de imagem dos tilesets
     * associados aos biomas e garantir que eles estejam prontos para uso antes
     * que outros plugins (como o DynamicBiomeRenderer) tentem acessá-los.
     *
     * Ele expõe uma API global para que outros plugins possam verificar o
     * status de carregamento e obter os bitmaps carregados.
     *
     * ===========================================================================
     * Configuração
     * ===========================================================================
     * 1. Configure os mapeamentos de biomas para tilesets.
     * 2. Configure o caminho personalizado onde seus tilesets de bioma estão localizados.
     * 3. Certifique-se de que este plugin seja carregado ANTES de qualquer outro
     * plugin que dependa dos tilesets de bioma (ex: DynamicBiomeRenderer).
     *
     * @param biomeTilesetMappings
     * @text Mapeamento de Biomas para Tilesets
     * @type struct<BiomeMapping>[]
     * @desc Mapeia nomes de biomas para IDs de Tileset do banco de dados.
     * @default []
     *
     * @param customTilesetPath
     * @text Caminho Personalizado dos Tilesets
     * @type string
     * @desc Diretório base para carregar os arquivos de imagem dos tilesets (ex: img/my_biomas/). Não inclua o nome do arquivo, apenas o diretório.
     * @default img/tilesets/
     *
     * @param debugMode
     * @text Modo de Depuração
     * @type boolean
     * @on SIM
     * @off NÃO
     * @desc Ativa logs detalhados no console para depuração.
     * @default false
     */
    /*~struct~BiomeMapping:
     * @param biomeName
     * @text Nome do Bioma
     * @type string
     * @desc O nome único deste bioma (ex: "Snowy", "Tundra").
     * @default
     *
     * @param tilesetId
     * @text ID do Tileset do Banco de Dados
     * @type tileset
     * @desc O ID do Tileset configurado no banco de dados do RPG Maker MZ para este bioma.
     * @default 0
     */

    (() => {
        const pluginName = "BiomeTilesetLoader";
        const parameters = PluginManager.parameters(pluginName);

        // --- Parâmetros do Plugin ---
        const debugMode = Boolean(parameters['debugMode'] === 'true');
        const customTilesetPath = String(parameters['customTilesetPath'] || 'img/tilesets/');

        // Mapeamento configurado de nomes de biomas para IDs de tileset do banco de dados
        const _biomeTilesetMappings = {};

        // Armazenará os Bitmaps/Texturas carregados para cada tileset de bioma,
        // organizados por biomeName e depois por índice da sheet (A1, A2, etc.)
        const _loadedBiomeBitmaps = {};

        // Flag para indicar se TODOS os tilesets de bioma foram carregados e estão prontos
        let _allBiomeTilesetsReady = false;

        // Nomes das sheets de tileset (A1, A2, ..., E)
        const sheetNames = ['A1', 'A2', 'A3', 'A4', 'A5', 'B', 'C', 'D', 'E'];

        // --- Funções Auxiliares ---

        /**
         * @function parseBiomeMappings
         * @description Analisa o parâmetro 'biomeTilesetMappings' e popula _biomeTilesetMappings.
         * Esta função é chamada uma vez na inicialização do plugin.
         */
        function parseBiomeMappings() {
            try {
                const mappingsParam = parameters['biomeTilesetMappings'];
                const parsedMappings = mappingsParam ? JSON.parse(mappingsParam) : [];

                for (const mapping of parsedMappings) {
                    const mapData = JSON.parse(mapping);
                    if (mapData.biomeName && mapData.tilesetId !== undefined) {
                        _biomeTilesetMappings[mapData.biomeName] = Number(mapData.tilesetId);
                    }
                }
                if (debugMode) console.log(`${pluginName}: Mapeamentos de biomas para tilesets carregados:`, JSON.stringify(_biomeTilesetMappings));
            } catch (e) {
                console.error(`${pluginName}: Erro ao analisar o parâmetro 'biomeTilesetMappings':`, e);
            }
        }

        /**
         * @function checkAllBiomeBitmapsReady
         * @description Verifica o status de prontidão de todos os Bitmaps de tileset carregados.
         * Esta função é chamada a cada frame para monitorar o carregamento.
         */
        function checkAllBiomeBitmapsReady() {
            if (_allBiomeTilesetsReady) return; // Se já estiver pronto, não precisa verificar novamente

            let allReady = true;
            let totalExpectedBitmaps = 0;
            let totalReadyBitmaps = 0;

            for (const biomeName in _biomeTilesetMappings) {
                const tilesetId = _biomeTilesetMappings[biomeName];
                const tilesetData = $dataTilesets[tilesetId];
                
                // Se os dados do tileset ainda não foram carregados, não podemos prosseguir
                if (!tilesetData) {
                    allReady = false;
                    break;
                }

                const bitmapsForThisBiome = _loadedBiomeBitmaps[biomeName];
                if (!bitmapsForThisBiome) {
                    allReady = false; // Ainda não iniciou o carregamento para este bioma
                    break;
                }
                
                // Contar os bitmaps esperados e prontos
                const imageFileNames = [
                    String(tilesetData.meta['A1'] || tilesetData.tilesetNames[0] || ''),
                    String(tilesetData.meta['A2'] || tilesetData.tilesetNames[1] || ''),
                    String(tilesetData.meta['A3'] || tilesetData.tilesetNames[2] || ''),
                    String(tilesetData.meta['A4'] || tilesetData.tilesetNames[3] || ''),
                    String(tilesetData.meta['A5'] || tilesetData.tilesetNames[4] || ''),
                    String(tilesetData.meta['B'] || tilesetData.tilesetNames[5] || ''),
                    String(tilesetData.meta['C'] || tilesetData.tilesetNames[6] || ''),
                    String(tilesetData.meta['D'] || tilesetData.tilesetNames[7] || ''),
                    String(tilesetData.meta['E'] || tilesetData.tilesetNames[8] || '')
                ];

                for (let i = 0; i < sheetNames.length; i++) {
                    const filename = imageFileNames[i];
                    const bitmap = bitmapsForThisBiome[i];

                    if (filename) { // Apenas se houver um nome de arquivo para a sheet
                        totalExpectedBitmaps++;
                        if (bitmap && bitmap.isReady()) {
                            totalReadyBitmaps++;
                        } else {
                            allReady = false; // Um bitmap não está pronto
                            if (debugMode) console.log(`${pluginName}: Bitmap para bioma '${biomeName}' (sheet ${sheetNames[i]}, arquivo '${filename}') NÃO está pronto. URL: ${bitmap?.url || 'N/A'}`);
                            // Não quebra o loop aqui para continuar contando outros bitmaps que podem estar prontos
                        }
                    }
                }
                if (!allReady && totalReadyBitmaps < totalExpectedBitmaps) {
                    // Se allReady se tornou false e ainda não atingimos o total esperado,
                    // significa que há bitmaps pendentes. Quebra o loop externo.
                    break;
                }
            }
            
            // Se todos os bitmaps esperados estão prontos e a flag ainda não foi definida
            if (allReady && totalExpectedBitmaps > 0 && totalReadyBitmaps === totalExpectedBitmaps) {
                _allBiomeTilesetsReady = true;
                if (debugMode) console.log(`${pluginName}: TODOS os tilesets de bioma estão prontos!`);
                // Não força refresh do mapa aqui, isso será responsabilidade do DynamicBiomeRenderer
            } else if (!allReady && debugMode) {
                console.log(`${pluginName}: Tilesets de bioma ainda carregando... (${totalReadyBitmaps}/${totalExpectedBitmaps} prontos).`);
            }
        }

        /**
         * @function loadTilesetImagesForBiome
         * @description Inicia o carregamento de todos os arquivos de imagem para um tileset de bioma específico.
         * Os Bitmaps são armazenados em _loadedBiomeBitmaps.
         * @param {string} biomeName - O nome do bioma (chave no _loadedBiomeBitmaps).
         * @param {number} tilesetId - O ID do tileset no banco de dados do RPG Maker MZ.
         */
        function loadTilesetImagesForBiome(biomeName, tilesetId) {
            const tilesetData = $dataTilesets[tilesetId];
            if (!tilesetData) {
                console.error(`${pluginName}: Dados do tileset com ID ${tilesetId} não encontrados para o bioma '${biomeName}'. Verifique se o Tileset existe no banco de dados.`);
                return;
            }

            _loadedBiomeBitmaps[biomeName] = []; // Inicializa o array para este bioma

            const imageFileNames = [
                String(tilesetData.meta['A1'] || tilesetData.tilesetNames[0] || ''),
                String(tilesetData.meta['A2'] || tilesetData.tilesetNames[1] || ''),
                String(tilesetData.meta['A3'] || tilesetData.tilesetNames[2] || ''),
                String(tilesetData.meta['A4'] || tilesetData.tilesetNames[3] || ''),
                String(tilesetData.meta['A5'] || tilesetData.tilesetNames[4] || ''),
                String(tilesetData.meta['B'] || tilesetData.tilesetNames[5] || ''),
                String(tilesetData.meta['C'] || tilesetData.tilesetNames[6] || ''),
                String(tilesetData.meta['D'] || tilesetData.tilesetNames[7] || ''),
                String(tilesetData.meta['E'] || tilesetData.tilesetNames[8] || '')
            ];

            imageFileNames.forEach((filename, index) => {
                if (filename) {
                    const fullPath = customTilesetPath + filename;
                    const bitmap = ImageManager.loadBitmap(customTilesetPath, filename);
                    
                    if (debugMode) console.log(`${pluginName}: Tentando carregar '${fullPath}'. Bitmap retornado:`, bitmap);

                    if (bitmap instanceof Bitmap) {
                        _loadedBiomeBitmaps[biomeName][index] = bitmap;
                        if (debugMode) console.log(`${pluginName}: Bitmap para '${fullPath}' armazenado. URL: ${bitmap.url}`);
                    } else {
                        console.warn(`${pluginName}: ImageManager.loadBitmap retornou um valor inválido ou incompleto para '${fullPath}'. Não é uma instância de Bitmap. Tipo: ${typeof bitmap}.`);
                        _loadedBiomeBitmaps[biomeName][index] = null; // Garante que a posição não fique vazia
                    }
                } else {
                    _loadedBiomeBitmaps[biomeName][index] = null; // Representa uma sheet vazia
                    if (debugMode) console.log(`${pluginName}: Sheet ${sheetNames[index]} para bioma '${biomeName}' não possui arquivo.`);
                }
            });
        }

        // --- Hooks do Motor ---

        // Sobrescreve Scene_Boot.prototype.onDatabaseLoaded para iniciar o carregamento dos tilesets de bioma
        // Isso garante que $dataTilesets já está disponível.
        const _Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
        Scene_Boot.prototype.onDatabaseLoaded = function() {
            _Scene_Boot_onDatabaseLoaded.call(this); // Chama a função original

            parseBiomeMappings(); // Garante que os mapeamentos do plugin estejam prontos

            if (!$dataTilesets) {
                console.error(`${pluginName}: $dataTilesets não carregado. Não é possível iniciar o carregamento dos tilesets de bioma.`);
                return;
            }

            // Inicia o carregamento para cada bioma configurado
            for (const biomeName in _biomeTilesetMappings) {
                const tilesetId = _biomeTilesetMappings[biomeName];
                loadTilesetImagesForBiome(biomeName, tilesetId);
            }
            // Uma verificação inicial após todos os pedidos de carregamento serem enviados
            checkAllBiomeBitmapsReady();
        };

        // Hook no update de uma cena base para verificar o status de carregamento continuamente
        // Scene_Base.prototype.update é um bom lugar para verificações contínuas.
        const _Scene_Base_update = Scene_Base.prototype.update;
        Scene_Base.prototype.update = function() {
            _Scene_Base_update.call(this); // Chama a função original

            // Verifica o status de prontidão dos bitmaps a cada frame
            checkAllBiomeBitmapsReady();
        };

        // --- Funções Globais Expostas (API para outros plugins) ---
        globalThis.BiomeTilesetLoader = {
            /**
             * @method areAllBiomeTilesetsReady
             * @description Verifica se todos os tilesets de bioma necessários foram carregados e estão prontos.
             * @returns {boolean} True se todos os tilesets de bioma estiverem prontos.
             */
            areAllBiomeTilesetsReady: () => _allBiomeTilesetsReady,

            /**
             * @method getBitmapsForBiome
             * @description Retorna o array de objetos Bitmap para um bioma específico.
             * @param {string} biomeName - O nome do bioma.
             * @returns {Bitmap[]|null} Um array de objetos Bitmap (sheets A1, A2, etc.) para o bioma, ou null se não carregado.
             */
            getBitmapsForBiome: (biomeName) => _loadedBiomeBitmaps[biomeName] || null,

            /**
             * @method getBiomeTilesetId
             * @description Retorna o ID do tileset do banco de dados para um bioma específico.
             * @param {string} biomeName - O nome do bioma.
             * @returns {number|null} O ID do tileset, ou null se não encontrado.
             */
            getBiomeTilesetId: (biomeName) => _biomeTilesetMappings[biomeName] || null,

            version: '1.0.1 // Versão: Lógica de contagem de bitmaps em checkAllBiomeBitmapsReady aprimorada.'
        };

        if (debugMode) console.log(`${pluginName}: Plugin carregado.`);
    })();
    