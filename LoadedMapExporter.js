/*:
 * @target MZ
 * @plugindesc Exporta os dados do mapa atualmente carregado para o console no formato do editor (JSON com formatação de dados exata). Permite gerar todos os 256x256 tiles antes de exportar.
 * @author [Seu Nome Aqui]
 * @version 0.2.0 // Versão com geração completa de chunks (256x256 tiles) e auto-save
 * @license MIT
 * @help
 * Este plugin adiciona comandos para exportar os dados de tile
 * do mapa para o console do navegador e salvar em arquivo JSON:
 *
 * 1. ExportLoadedMapExactFormat:
 *    Exporta os tiles atualmente na memória do mapa.
 *
 * 2. GenerateAndExportFullMap:
 *    Gera proceduralmente TODOS os chunks do mapa inteiro (ex: 256x256 tiles = 65.536 tiles)
 *    e depois exporta o arquivo JSON completo formatado para o editor!
 *
 * ===========================================================================
 * Comandos de Console (F12)
 * ===========================================================================
 * Você pode simplesmente abrir o console (F12) e digitar:
 *   exportFullMap();            // Gera os 256x256 tiles e exporta/salva
 *   exportFullMap(true);        // Gera os 256x256 tiles centralizados no jogador
 *   exportLoadedMap();          // Exporta apenas os tiles já carregados
 *
 * @command ExportLoadedMapExactFormat
 * @text Exportar Mapa Carregado (Tiles Atuais)
 * @desc Exporta todos os dados do mapa atualmente carregado para o console e salva arquivo.
 *
 * @command GenerateAndExportFullMap
 * @text Gerar Mapa Inteiro e Exportar (256x256)
 * @desc Gera proceduralmente todos os chunks da grade completa do mapa e exporta o JSON inteiro.
 *
 * @arg centerOnPlayer
 * @text Centralizar no Jogador
 * @type boolean
 * @default false
 * @desc Se SIM, o mapa de 256x256 terá o jogador no centro. Se NÃO, gerará a partir das coordenadas mundiais (0,0).
 */
//=============================================================================

(() => {
    const pluginName = "LoadedMapExporter";

    // RPG Maker MZ usa 4 camadas de tiles visíveis no editor na propriedade 'data'
    // O array 'data' tem tamanho width * height * numberOfLayers
    const numberOfLayers = 4;

    // --- Registro dos Comandos de Plugin e Exposição Global ---
    PluginManager.registerCommand(pluginName, "ExportLoadedMapExactFormat", args => {
        exportLoadedMapDataExactFormat();
    });

    PluginManager.registerCommand(pluginName, "GenerateAndExportFullMap", args => {
        const centerOnPlayer = String(args.centerOnPlayer || "false") === "true";
        generateAndExportFullMap(centerOnPlayer);
    });

    window.LoadedMapExporter = {
        export: exportLoadedMapDataExactFormat,
        exportFullMap: generateAndExportFullMap,
        generateAndExport: generateAndExportFullMap
    };
    window.exportLoadedMap = exportLoadedMapDataExactFormat;
    window.exportFullMap = generateAndExportFullMap;

    // Registra atalho de teclado F7 para gerar o mapa todo e exportar
    Input.keyMapper[118] = "exportFullMapKey"; // F7

    const _Scene_Map_update_for_exporter = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update_for_exporter.call(this);
        if (Input.isTriggered("exportFullMapKey") && !$gameMessage.isBusy()) {
            if (typeof SoundManager !== "undefined" && SoundManager.playSave) {
                SoundManager.playSave();
            }
            generateAndExportFullMap(false);
        }
    };
    // --- Fim Registro e Exposição Global ---

    // Função para gerar todos os chunks do mapa completo e depois exportar
    function generateAndExportFullMap(centerOnPlayer = false) {
        if (!$gameMap || !$dataMap) {
            console.warn(`${pluginName}: Jogo ou dados do mapa não carregados.`);
            return;
        }

        const mapId = $gameMap.mapId();
        const mapWidth = $gameMap.width();
        const mapHeight = $gameMap.height();
        const chunkWidth = globalThis.chunkWidth || 4;
        const chunkHeight = globalThis.chunkHeight || 4;
        const chunksX = Math.ceil(mapWidth / chunkWidth);
        const chunksY = Math.ceil(mapHeight / chunkHeight);
        const totalChunks = chunksX * chunksY;

        console.log(`${pluginName}: Iniciando geração procedural completa do mapa (${mapWidth}x${mapHeight} tiles, ${chunksX}x${chunksY} = ${totalChunks} chunks)...`);

        let startChunkX = 0;
        let startChunkY = 0;

        if (centerOnPlayer) {
            const realCoords = globalThis.BasicChunkGenerator?.getRealPlayerCoordinates
                ? globalThis.BasicChunkGenerator.getRealPlayerCoordinates()
                : { x: $gamePlayer?.x || 0, y: $gamePlayer?.y || 0 };
            const playerChunkX = Math.floor(realCoords.x / chunkWidth);
            const playerChunkY = Math.floor(realCoords.y / chunkHeight);
            startChunkX = playerChunkX - Math.floor(chunksX / 2);
            startChunkY = playerChunkY - Math.floor(chunksY / 2);
            console.log(`${pluginName}: Centralizando no jogador. Chunk inicial: (${startChunkX}, ${startChunkY}).`);
        }

        if (!globalThis.WorldGenerationCoordinator || !globalThis.WorldGenerationCoordinator.getChunkTiles) {
            console.error(`${pluginName}: WorldGenerationCoordinator não encontrado. Impossível gerar chunks.`);
            return;
        }

        const startTime = Date.now();
        let chunksGenerated = 0;
        let tilesPlaced = 0;

        for (let cy = 0; cy < chunksY; cy++) {
            for (let cx = 0; cx < chunksX; cx++) {
                const chunkXReal = startChunkX + cx;
                const chunkYReal = startChunkY + cy;

                globalThis.WorldGenerationCoordinator.getChunkTiles(mapId, chunkXReal, chunkYReal, (tilesDataList) => {
                    if (tilesDataList && tilesDataList.length > 0) {
                        for (const tileInfo of tilesDataList) {
                            const xGlobalReal = tileInfo.x;
                            const yGlobalReal = tileInfo.y;
                            const layer = tileInfo.layer || 0;
                            const newTileId = tileInfo.tileId;

                            // Converte para coordenadas dentro da grade 0..mapWidth-1 e 0..mapHeight-1
                            const xWrapped = ((xGlobalReal % mapWidth) + mapWidth) % mapWidth;
                            const yWrapped = ((yGlobalReal % mapHeight) + mapHeight) % mapHeight;

                            const index = layer * mapWidth * mapHeight + yWrapped * mapWidth + xWrapped;
                            if (index >= 0 && index < $dataMap.data.length) {
                                $dataMap.data[index] = newTileId;
                                tilesPlaced++;
                            }
                        }
                    }
                });

                if (globalThis.ProceduralWorldMap && globalThis.ProceduralWorldMap.getExplorationManager) {
                    globalThis.ProceduralWorldMap.getExplorationManager().markChunkExplored(chunkXReal, chunkYReal);
                }

                chunksGenerated++;
            }
        }

        const elapsed = Date.now() - startTime;
        console.log(`${pluginName}: Concluído! ${chunksGenerated} chunks (${tilesPlaced} tiles) gerados com sucesso em ${elapsed}ms.`);

        if ($gameMap.requestRefresh) {
            $gameMap.requestRefresh();
        }

        // Agora exporta o mapa completo com todos os 256x256 tiles preenchidos
        exportLoadedMapDataExactFormat();
    }

    // Função para exportar os dados do mapa atualmente carregado com array 'data' formatado exatamente como o editor
    function exportLoadedMapDataExactFormat() {
        if (!$gameMap || !$dataMap) {
            console.warn(`${pluginName}: Jogo ou dados do mapa não carregados.`);
            return;
        }

        // Obtém as propriedades do mapa atualmente carregado
        const mapId = $gameMap.mapId();
        const mapWidth = $gameMap.width();
        const mapHeight = $gameMap.height();
        const tilesetId = $gameMap.tilesetId();
        const mapData = $gameMap.data(); // Obtém o array 1D de dados do mapa

        if (!mapData || mapData.length === 0) {
             console.warn(`${pluginName}: Dados do mapa atual estão vazios.`);
             return;
        }

        // --- Constrói manualmente a string do array 'data' com a formatação exata do editor ---
        const formattedDataString = buildFormattedDataArrayStringExact(mapData, mapWidth);
        // --- Fim construção string 'data' ---

        // Monta o objeto JSON completo, usando a string formatada do array 'data'
        let manualJsonOutput = "{\n";
        manualJsonOutput += ` "autoplayBgm": ${$dataMap.autoplayBgm},\n`;
        manualJsonOutput += ` "autoplayBgs": ${$dataMap.autoplayBgs},\n`;
        manualJsonOutput += ` "battleback1Name": ${JSON.stringify($dataMap.battleback1Name)},\n`; // Strings precisam de aspas
        manualJsonOutput += ` "battleback2Name": ${JSON.stringify($dataMap.battleback2Name)},\n`;
        manualJsonOutput += ` "bgm": ${JSON.stringify($dataMap.bgm)},\n`; // Stringify objetos internos
        manualJsonOutput += ` "bgs": ${JSON.stringify($dataMap.bgs)},\n`;
        manualJsonOutput += ` "disableDashing": ${$dataMap.disableDashing},\n`;
        manualJsonOutput += ` "displayName": ${JSON.stringify($dataMap.displayName)},\n`;
        manualJsonOutput += ` "encounterList": ${JSON.stringify($dataMap.encounterList)},\n`;
        manualJsonOutput += ` "encounterStep": ${$dataMap.encounterStep},\n`;
        manualJsonOutput += ` "height": ${mapHeight},\n`; // Usar mapHeight obtido
        manualJsonOutput += ` "meta": ${JSON.stringify($dataMap.meta)},\n`;
        manualJsonOutput += ` "note": ${JSON.stringify($dataMap.note)},\n`;
        manualJsonOutput += ` "parallaxLoopX": ${$dataMap.parallaxLoopX},\n`;
        manualJsonOutput += ` "parallaxLoopY": ${$dataMap.parallaxLoopY},\n`;
        manualJsonOutput += ` "parallaxName": ${JSON.stringify($dataMap.parallaxName)},\n`;
        manualJsonOutput += ` "parallaxShow": ${$dataMap.parallaxShow},\n`;
        manualJsonOutput += ` "parallaxSx": ${$dataMap.parallaxSx},\n`;
        manualJsonOutput += ` "parallaxSy": ${$dataMap.parallaxSy},\n`;
        manualJsonOutput += ` "scrollType": ${$dataMap.scrollType},\n`;
        manualJsonOutput += ` "specifyBattleback": ${$dataMap.specifyBattleback},\n`;
        manualJsonOutput += ` "tilesetId": ${tilesetId},\n`; // Usar tilesetId obtido
        manualJsonOutput += ` "width": ${mapWidth},\n`; // Usar mapWidth obtido
        manualJsonOutput += ` "events": ${JSON.stringify($dataMap.events, null, 2)},\n`; // Manter formatação para eventos, adicionar vírgula


        // Adiciona a propriedade 'data' com a string formatada manualmente (SEM AS QUOTES)
        manualJsonOutput += ` "data": ${formattedDataString}\n`;


        manualJsonOutput += "}"; // Fecha o objeto JSON


        // Exibe o JSON completo no console
        console.log(`${pluginName}: Dados do Mapa Carregado (ID ${mapId}, ${mapWidth}x${mapHeight} tiles) no formato JSON exato do Editor:`);
        console.log(manualJsonOutput);

        // Se estiver executando no NW.js (Desktop), salva automaticamente o arquivo no disco
        if (typeof Utils !== "undefined" && Utils.isNwjs && Utils.isNwjs()) {
            try {
                const fs = require("fs");
                const path = require("path");
                const fileName = `MapExported_${String(mapId).padStart(3, "0")}.json`;
                const filePath = path.join("data", fileName);
                fs.writeFileSync(filePath, manualJsonOutput, "utf8");
                console.log(`${pluginName}: ✅ Arquivo de mapa exportado salvo automaticamente em: ${filePath}`);
            } catch (err) {
                console.warn(`${pluginName}: Não foi possível salvar arquivo diretamente em disco:`, err);
            }
        }

        console.log(`${pluginName}: JSON do mapa completo gerado no console. Copie este texto e salve-o como um arquivo MapXXX.json.`);
        console.log(`${pluginName}: Lembre-se de renomear o arquivo para o formato MapXXX.json (onde XXX é o ID do mapa) e colocá-lo na pasta data/ do seu projeto RPG Maker MZ.`);
        console.log(`${pluginName}: Eventos e outras propriedades do mapa original foram incluídos.`);
    }

    // --- Nova Função Auxiliar: Constrói a string formatada exata para o array 'data' ---
    // Insere quebra de linha após cada 'width' elementos
    function buildFormattedDataArrayStringExact(dataArray, width) {
        if (!dataArray || dataArray.length === 0) {
            return "[]";
        }

        let dataString = "[\n"; // Inicia o array

        for (let i = 0; i < dataArray.length; i++) {
            // Adiciona a indentação antes de cada elemento
            dataString += "  "; // Indentação padrão de 2 espaços no editor para elementos

            dataString += dataArray[i]; // Adiciona o valor do tile ID

            if (i < dataArray.length - 1) {
                dataString += ","; // Adiciona vírgula entre os elementos
            }

            // Adiciona quebra de linha depois de cada 'width' elementos,
            // mas não após o último elemento do array.
            if ((i + 1) % width === 0 && i < dataArray.length - 1) {
                dataString += "\n"; // Adiciona quebra de linha
            }
             // Se não é o último elemento e não é o final de uma linha, adiciona um espaço para separar
             else if (i < dataArray.length - 1) {
                dataString += " ";
             }
        }

        dataString += "\n]"; // Fecha o array

        return dataString;
    }
    // --- Fim Nova Função Auxiliar ---

})();