/*:
 * @target MZ
 * @plugindesc [Procedural] Renderiza dinamicamente tiles de diferentes tilesets com base no bioma, para um mundo contínuo sem fades.
 * @author Seu Nome Aqui
 * @version 1.5.0 // Versão: Corrigido carregamento assíncrono e troca nativa de tileset via $gameMap.changeTileset.
 * @license MIT
 * @help
 * ===========================================================================
 * Introdução
 * ===========================================================================
 * Este plugin permite que você tenha múltiplos tilesets (um por bioma) e os
 * renderize dinamicamente no mesmo mapa, criando um mundo contínuo sem
 * transições de tela ou carregamentos adicionais. Ele se integra com o
 * BasicChunkGenerator e o PerlinNoiseGenerator para determinar o bioma
 * nas coordenadas reais do jogador e aplicar o tileset correspondente.
 *
 * ===========================================================================
 * Configuração
 * ===========================================================================
 * 1. Crie seus tilesets no banco de dados do RPG Maker MZ para cada bioma.
 * Certifique-se de que os auto-tiles (A1 e A2) tenham layouts consistentes
 * entre todos os seus tilesets de bioma (mesmos padrões de conexão).
 * 2. Configure este plugin listando cada bioma e o ID do tileset
 * correspondente do banco de dados.
 * 3. Certifique-se de que este plugin seja carregado DEPOIS de
 * BasicChunkGenerator, WorldGenerationCoordinator e PerlinNoiseGenerator.
 *
 * @param biomeTilesetMappings
 * @text Mapeamento de Biomas para Tilesets
 * @type struct<BiomeMapping>[]
 * @desc Mapeia nomes de biomas (retornados pelo PerlinNoiseGenerator) para IDs de Tileset do banco de dados.
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
/*~struct~BiomeMapping:
 * @param biomeName
 * @text Nome do Bioma
 * @type string
 * @desc O nome único deste bioma (ex: "Floresta", "Deserto"). Deve corresponder ao nome retornado pelo seu PerlinNoiseGenerator.
 * @default
 *
 * @param tilesetId
 * @text ID do Tileset do Banco de Dados
 * @type tileset
 * @desc O ID do Tileset configurado no banco de dados do RPG Maker MZ para este bioma.
 * @default 0
 */

(() => {
    const pluginName = "DynamicBiomeRenderer";
    const parameters = PluginManager.parameters(pluginName);

    // --- Parâmetros do Plugin ---
    const debugMode = parameters['debugMode'] === 'true' || true; // Ativado para depuração

    const _biomeTilesetMappings = {};
    const _loadedBiomeBitmaps = {};
    let _allBiomeTilesetsReady = false;
    const sheetNames = ['A1', 'A2', 'A3', 'A4', 'A5', 'B', 'C', 'D', 'E'];

    // --- Variáveis de Otimização ---
    let lastRealX = null;
    let lastRealY = null;
    let currentBiomeName = null;

    // --- Declarações de Funções ---
    function parseBiomeMappings() {
        try {
            const mappingsParam = parameters['biomeTilesetMappings'];
            const parsedMappings = mappingsParam ? JSON.parse(mappingsParam) : [];

            for (const mapping of parsedMappings) {
                const mapData = typeof mapping === 'string' ? JSON.parse(mapping) : mapping;
                if (mapData.biomeName && mapData.tilesetId !== undefined) {
                    _biomeTilesetMappings[mapData.biomeName] = Number(mapData.tilesetId);
                }
            }
            if (debugMode) console.log(`${pluginName}: Mapeamentos de biomas para tilesets carregados:`, JSON.stringify(_biomeTilesetMappings));
        } catch (e) {
            console.error(`${pluginName}: Erro ao analisar o parâmetro 'biomeTilesetMappings':`, e);
        }
    }

    function checkAllBiomesLoaded() {
        if (!$dataTilesets) return;

        let allReady = true;
        let totalExpectedBitmaps = 0;
        let totalReadyBitmaps = 0;

        for (const biomeName in _biomeTilesetMappings) {
            const tilesetId = _biomeTilesetMappings[biomeName];
            const tilesetData = $dataTilesets[tilesetId];
            if (!tilesetData) {
                allReady = false;
                if (debugMode) console.warn(`${pluginName}: Dados do tileset com ID ${tilesetId} para bioma '${biomeName}' não encontrados.`);
                break;
            }

            const bitmapsForThisBiome = _loadedBiomeBitmaps[biomeName];
            if (!bitmapsForThisBiome) {
                allReady = false;
                break;
            }

            for (let i = 0; i < sheetNames.length; i++) {
                const filename = tilesetData.tilesetNames[i];
                const bitmap = bitmapsForThisBiome[i];

                if (filename) {
                    totalExpectedBitmaps++;
                    if (bitmap && bitmap.isReady()) {
                        totalReadyBitmaps++;
                    } else {
                        allReady = false;
                    }
                }
            }
            if (!allReady) break;
        }

        if (allReady && totalReadyBitmaps === totalExpectedBitmaps && totalExpectedBitmaps > 0) {
            if (!_allBiomeTilesetsReady) {
                _allBiomeTilesetsReady = true;
                if (debugMode) console.log(`${pluginName}: TODOS os tilesets de bioma estão prontos! (${totalReadyBitmaps}/${totalExpectedBitmaps})`);
            }
            updateBiomeTileset(true);
        } else if (debugMode) {
            console.log(`${pluginName}: Tilesets de bioma ainda carregando... (${totalReadyBitmaps}/${totalExpectedBitmaps} prontos).`);
        }
    }

    function loadTilesetImagesForBiome(biomeName, tilesetId) {
        const tilesetData = $dataTilesets[tilesetId];
        if (!tilesetData) {
            console.error(`${pluginName}: Dados do tileset com ID ${tilesetId} não encontrados para o bioma '${biomeName}'.`);
            return;
        }

        _loadedBiomeBitmaps[biomeName] = [];

        const imageFileNames = [
            String(tilesetData.meta?.['A1'] || tilesetData.tilesetNames[0] || ''),
            String(tilesetData.meta?.['A2'] || tilesetData.tilesetNames[1] || ''),
            String(tilesetData.meta?.['A3'] || tilesetData.tilesetNames[2] || ''),
            String(tilesetData.meta?.['A4'] || tilesetData.tilesetNames[3] || ''),
            String(tilesetData.meta?.['A5'] || tilesetData.tilesetNames[4] || ''),
            String(tilesetData.meta?.['B'] || tilesetData.tilesetNames[5] || ''),
            String(tilesetData.meta?.['C'] || tilesetData.tilesetNames[6] || ''),
            String(tilesetData.meta?.['D'] || tilesetData.tilesetNames[7] || ''),
            String(tilesetData.meta?.['E'] || tilesetData.tilesetNames[8] || '')
        ];

        imageFileNames.forEach((filename, index) => {
            if (filename) {
                const bitmap = ImageManager.loadTileset(filename);
                _loadedBiomeBitmaps[biomeName][index] = bitmap;

                if (bitmap instanceof Bitmap) {
                    if (bitmap.isReady()) {
                        checkAllBiomesLoaded();
                    } else if (typeof bitmap.addLoadListener === 'function') {
                        bitmap.addLoadListener(() => {
                            if (debugMode) console.log(`${pluginName}: Carregado ${sheetNames[index]} (${filename}) para bioma '${biomeName}'.`);
                            checkAllBiomesLoaded();
                        });
                    }
                }
            } else {
                _loadedBiomeBitmaps[biomeName][index] = null;
            }
        });
    }

    function getBitmapsForBiome(biomeName) {
        return _loadedBiomeBitmaps[biomeName] || null;
    }

    function updateBiomeTileset(force = false) {
        if (!$gameMap || !$gamePlayer) return;

        let playerRealCoords = { x: $gamePlayer.x, y: $gamePlayer.y };
        if (globalThis.BasicChunkGenerator && typeof globalThis.BasicChunkGenerator.getRealPlayerCoordinates === 'function') {
            playerRealCoords = globalThis.BasicChunkGenerator.getRealPlayerCoordinates();
        }

        let biome = "Land";
        if (globalThis.SimpleBiomeTestGenerator && typeof globalThis.SimpleBiomeTestGenerator.getBiomeNameForCoords === 'function') {
            biome = globalThis.SimpleBiomeTestGenerator.getBiomeNameForCoords(playerRealCoords.x, playerRealCoords.y);
        } else if (globalThis.PerlinNoiseGenerator && typeof globalThis.PerlinNoiseGenerator.getBiomeNameForCoords === 'function') {
            biome = globalThis.PerlinNoiseGenerator.getBiomeNameForCoords(playerRealCoords.x, playerRealCoords.y);
        }

        // Se o bioma não estiver diretamente mapeado, faz fallback inteligente (ex: Snowy/Mountain -> Snowy, ou padrão Land)
        let targetTilesetId = _biomeTilesetMappings[biome];
        if (!targetTilesetId) {
            if (biome.includes("Snow") && _biomeTilesetMappings["Snowy"]) {
                targetTilesetId = _biomeTilesetMappings["Snowy"];
            } else if (biome.includes("Tundra") && _biomeTilesetMappings["Tundra"]) {
                targetTilesetId = _biomeTilesetMappings["Tundra"];
            } else {
                targetTilesetId = _biomeTilesetMappings["Land"] || 9;
            }
        }

        if (force || currentBiomeName !== biome || $gameMap.tilesetId() !== targetTilesetId) {
            currentBiomeName = biome;
            if ($gameMap.tilesetId() !== targetTilesetId) {
                if (debugMode) {
                    console.log(`${pluginName}: Bioma detectado '${biome}' nas coords reais (${playerRealCoords.x}, ${playerRealCoords.y}). Trocando tileset de ${$gameMap.tilesetId()} para ${targetTilesetId}.`);
                }
                $gameMap.changeTileset(targetTilesetId);
            }
        }
    }

    // --- Hooks do Motor ---

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);

        if (!$dataTilesets) {
            console.error(`${pluginName}: $dataTilesets não carregado.`);
            return;
        }

        parseBiomeMappings();

        for (const biomeName in _biomeTilesetMappings) {
            const tilesetId = _biomeTilesetMappings[biomeName];
            loadTilesetImagesForBiome(biomeName, tilesetId);
        }
        checkAllBiomesLoaded();
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);

        if ($gamePlayer) {
            let playerRealCoords = { x: $gamePlayer.x, y: $gamePlayer.y };
            if (globalThis.BasicChunkGenerator && typeof globalThis.BasicChunkGenerator.getRealPlayerCoordinates === 'function') {
                playerRealCoords = globalThis.BasicChunkGenerator.getRealPlayerCoordinates();
            }

            if (lastRealX !== playerRealCoords.x || lastRealY !== playerRealCoords.y) {
                lastRealX = playerRealCoords.x;
                lastRealY = playerRealCoords.y;
                updateBiomeTileset();
            }
        }
    };

    // --- Funções Globais Expostas (APIs) ---
    globalThis.DynamicBiomeRenderer = {
        getLoadedBiomeBitmaps: () => _loadedBiomeBitmaps,
        getBiomeTilesetId: (biomeName) => _biomeTilesetMappings[biomeName],
        updateBiomeTileset: updateBiomeTileset,
        version: '1.5.0 // Versão: Troca nativa instantânea de tileset sem reloads ou fades.'
    };

    if (debugMode) console.log(`${pluginName}: Plugin carregado.`);
})();