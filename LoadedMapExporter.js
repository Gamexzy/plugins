/*:
 * @target MZ
 * @plugindesc Exporta os dados do mapa atualmente carregado para o console no formato do editor (JSON com formatação de dados exata).
 * @author [Seu Nome Aqui]
 * @version 0.1.3 // Versão atualizada com formatação exata do array 'data'
 * @license MIT
 * @help
 * Este plugin adiciona um comando de plugin para exportar os dados de tile
 * do mapa atualmente carregado no jogo para o console do navegador.
 * Os dados são formatados como um arquivo de mapa JSON do RPG Maker MZ,
 * com o array 'data' formatado com quebras de linha a cada 'width' elementos,
 * replicando o formato do editor.
 *
 * Use o comando de plugin: ExportLoadedMapExactFormat
 *
 * @command ExportLoadedMapExactFormat
 * @text Exportar Mapa Carregado (Formato Exato)
 * @desc Exporta todos os dados do mapa atualmente carregado para o console, formatando o array 'data' como o editor.
 */
//=============================================================================

(() => {
    const pluginName = "LoadedMapExporter";

    // RPG Maker MZ usa 4 camadas de tiles visíveis no editor na propriedade 'data'
    // O array 'data' tem tamanho width * height * numberOfLayers
    const numberOfLayers = 4;

    // --- Registro do Comando de Plugin ---
    PluginManager.registerCommand(pluginName, "ExportLoadedMapExactFormat", args => {
        exportLoadedMapDataExactFormat();
    });
    // --- Fim Registro do Comando de Plugin ---

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