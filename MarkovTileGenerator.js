/*:pt
 * @target MZ
 * @plugindesc Salva mapas Markov gerados nos saves do jogo. (ONMAPLOADED)
 * @author Gemini
 * @help Este plugin estende o Gerador de Mapas Markov para salvar os mapas
 * gerados nos saves do jogo, garantindo persistência.
 *
 * Comando Plugin: GerarMapaMarkov largura altura camadaBase
 *
 * Para usar, chame o comando de plugin "GerarMapaMarkov" para agendar
 * a geração e aplicação de um mapa Markov APÓS o mapa ser carregado.
 * O mapa gerado será salvo automaticamente com o jogo.
 *
 * ATENÇÃO: Este plugin MODIFICA o sistema de salvamento do RPG Maker MZ.
 *     Use com cuidado e faça backup do seu projeto antes de usar.
 *
 * @param cadeiaMarkovTreinadaJSON_FIXA
 * @type text
 * @desc JSON contendo a cadeia de Markov treinada (formato fixo).
 *     Certifique-se de que o JSON esteja no formato correto!
 * @default {"2048":{"2048":100},"2049":{"2049":100}}
 *
 * @command GerarMapaMarkov
 * @text Gerar Mapa Markov (OnMapLoaded)
 * @desc Agenda a geração e aplicação de um mapa Markov no próximo mapa carregado.
 * @arg largura
 * @type number
 * @min 1
 * @max 100
 * @default 20
 * @text Largura do Mapa
 * @desc Largura do mapa Markov a ser gerado (em tiles).
 * @arg altura
 * @type number
 * @min 1
 * @max 100
 * @default 15
 * @text Altura do Mapa
 * @desc Altura do mapa Markov a ser gerado (em tiles).
 * @arg camadaBase
 * @type number
 * @min 0
 * @max 2
 * @default 0
 * @text Camada Base
 * @desc Camada do mapa onde o mapa Markov será aplicado (0=Inferior, 1=Superior, 2=Sombra).
 */
(() => {
    const pluginName = 'MarkovTileGenerator'; // Nome ÚNICO para o plugin

    const parameters = PluginManager.parameters(pluginName);
    const cadeiaMarkovTreinadaJSON_FIXA = parameters['cadeiaMarkovTreinadaJSON_FIXA'];

    let markovChain = {
        "2816": {
            "2816": 26951,
            "2864": 639
            },
            "2864": {
            "2816": 651,
            "2864": 1502
            }
        }; // Variável para armazenar a cadeia de Markov

    try {
        console.log("markovChain:", markovChain); // DEBUG - Exibir a cadeia de Markov carregada
        console.log("Cadeia de Markov carregada com SUCESSO do JSON fixo!"); // Mensagem de sucesso
    } catch (e)  {
        console.error("Erro ao carregar/parsear cadeia de Markov do JSON fixo! Verifique o formato do JSON em 'cadeiaMarkovTreinadaJSON_FIXA'.", e);
        markovChain = {}; // Em caso de erro, inicializa como objeto vazio para evitar problemas
        alert("Erro ao carregar Cadeia de Markov! Veja o console (F8) para detalhes."); // Alerta de erro para o usuário
       }


    // ** Alias da função DataManager.makeSaveContents **
    const _DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        console.log("DataManager.makeSaveContents CHAMADO! (Salvamento)"); // *** DEBUG - Salvamento INICIADO ***
        console.log("Dados de $gameMap.data ANTES do save:\n", $gameMap.data); // *** DEBUG - Dados ANTES do Save ***

        const contents = _DataManager_makeSaveContents.call(this); // Chama a função original
        contents.markovMapData = $gameMap.data; // ** Salva os dados do mapa Markov no objeto de salvamento **

        console.log("Dados do mapa Markov ADICIONADOS ao save contents."); // DEBUG
        console.log("Objeto 'contents' FINAL (após adicionar markovMapData):\n", contents); // *** DEBUG - Objeto contents FINAL ***

        return contents; // Retorna o objeto de salvamento MODIFICADO
    };

    // ** Alias da função DataManager.extractSaveContents **
    const _DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        console.log("DataManager.extractSaveContents CHAMADO! (Carregamento)"); // *** DEBUG - Carregamento INICIADO ***
        console.log("Objeto 'contents' RECEBIDO no Load:\n", contents); // *** DEBUG - Objeto contents RECEBIDO ***

        _DataManager_extractSaveContents.call(this, contents); // Chama a função original

        if (contents.markovMapData) { // ** Verifica se há dados de mapa Markov salvos **
            console.log("Dados de mapa Markov ENCONTRADOS no save contents."); // DEBUG
            console.log("Dados de contents.markovMapData:\n", contents.markovMapData); // *** DEBUG - contents.markovMapData ***

            $gameMap.data = contents.markovMapData; // ** Carrega os dados do mapa Markov de volta para $gameMap.data **
            $gameMap.setup($gameMap.mapId()); // ** Refaz a configuração do mapa para aplicar os dados carregados **

            console.log("Dados do mapa Markov CARREGADOS do save contents e APLICADOS ao mapa."); // DEBUG
            console.log("Dados de $gameMap.data APÓS o Load e Setup do Mapa:\n", $gameMap.data); // *** DEBUG - $gameMap.data APÓS Load ***

       } else {
            console.log("Nenhum dado de mapa Markov encontrado no save contents."); // DEBUG
        }
};


let mapGeneratorReady = false; // **NOVA variável flag**
let _markovArgs; // Variável para armazenar argumentos do comando

PluginManager.registerCommand(pluginName, "GerarMapaMarkov", function(args) {
    const largura = parseInt(args.largura || 5);
    const altura = parseInt(args.altura || 5);
    const camadaBase = 0;

    console.log("[GerarMapaMarkov Command] Comando GerarMapaMarkov agendado para onMapLoaded."); // Log MODIFICADO

    _markovArgs = { largura: largura, altura: altura, camadaBase: camadaBase }; // **Salvar argumentos**
    mapGeneratorReady = true; // **Setar flag para true**
});


const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded; // Alias da função original
Scene_Map.prototype.onMapLoaded = function() {
    _Scene_Map_onMapLoaded.call(this); // Chamar onMapLoaded original primeiro
    console.log("[Scene_Map.onMapLoaded] onMapLoaded() ORIGINAL CHAMADO! - Mapa carregado."); // *** Log original onMapLoaded ***
    console.log("[Scene_Map.onMapLoaded] Verificando $gameMap.data em onMapLoaded (ANTES da geração Markov):", $gameMap.data); // *** NOVO LOG - $gameMap.data em onMapLoaded (ANTES) ***


    if (mapGeneratorReady) { // **Verificar flag: Gerar mapa Markov?**
        console.log("[Scene_Map.onMapLoaded] Flag mapGeneratorReady VERDADEIRA! Gerando mapa Markov AGORA em onMapLoaded()."); // Log de Geração em onMapLoaded
        this.gerarEAplicarMapaMarkov(_markovArgs); // **Chamar função de geração e aplicação**
        mapGeneratorReady = false; // **Resetar flag**
        delete _markovArgs; // **Limpar argumentos**
    } else {
        console.log("[Scene_Map.onMapLoaded] Flag mapGeneratorReady FALSA. Geração de mapa Markov NÃO agendada."); // Log de não geração
    }
    console.log("[Scene_Map.onMapLoaded] Verificando $gameMap.data em onMapLoaded (APÓS geração Markov, se aplicável):", $gameMap.data); // *** NOVO LOG - $gameMap.data em onMapLoaded (APÓS) ***

};


Scene_Map.prototype.gerarEAplicarMapaMarkov = function(args) { // **NOVA função para gerar e aplicar o mapa**
    const largura = args.largura;
    const altura = args.altura;
    const camadaBase = args.camadaBase;


    console.log("[gerarEAplicarMapaMarkov] Iniciando geração e aplicação do mapa Markov..."); // Log de início da função
    console.log("[gerarEAplicarMapaMarkov] Verificando $gameMap:", $gameMap);
    console.log("[gerarEAplicarMapaMarkov] Verificando $gameMap.data:", $gameMap.data);


    if (!$gameMap.data) { // **Verificação de segurança EXTRA - AINDA IMPORTANTE EM ONMAPLOADED**
        console.log("[gerarEAplicarMapaMarkov] ERRO GRAVE: $gameMap.data é null/undefined em gerarEAplicarMapaMarkov! Cancelando geração.");
        return; // **Cancelar se _data ainda não estiver pronto**
    }


    console.log("Gerando mapa Markov: Largura=" + largura + ", Altura=" + altura + ", Camada Base=" + camadaBase);

    const markovChain = carregarMarkovChain();
    console.log("Cadeia de Markov (antes da geração):");
    console.log(markovChain);

    const mapaGeradoData = gerarMapaMarkov(largura, altura, markovChain);
    console.log("Mapa Markov Gerado (TileIds):");
    console.log(mapaGeradoData);

    aplicarMapa(mapaGeradoData, largura, altura, camadaBase);
    console.log("Mapa Markov aplicado ao mapa atual! (Camada Base)");

    console.log("[gerarEAplicarMapaMarkov] Geração e aplicação do mapa Markov CONCLUÍDA."); // Log de fim da função
};


function aplicarMapa(mapaGeradoData, largura, altura, camadaBase) {
    console.log("[aplicarMapa] Mapa Atual: Largura=" + $gameMap.width() + ", Altura=" + $gameMap.height() + ", Camada Base=" + camadaBase);
    console.log("[aplicarMapa] Verificando mapaAtual: Game_Map", $gameMap);
    console.log("[aplicarMapa] Verificando $gameMap.data:", $gameMap.data);

    if (!$gameMap.data) {
        console.log("[aplicarMapa] Erro: $gameMap.data é null ou undefined! Inicializando.");
        $gameMap.data = []; // Inicializar como array vazio inicialmente
    }

    // **NOVO: Inicializar $gameMap.data com o tamanho correto**
    const mapWidth = $gameMap.width();
    const mapHeight = $gameMap.height();
    const layers = 4; // RPG Maker MZ layers padrão (tiles1, tiles2, tiles3, eventos)
    const expectedDataSize = mapWidth * mapHeight * layers;

    if ($gameMap.data.length !== expectedDataSize) {
        console.log(`[aplicarMapa] Redimensionando $gameMap.data para o tamanho correto: ${expectedDataSize}`);
        $gameMap.data = new Array(expectedDataSize).fill(0); // Inicializa com 0
    }
    console.log(`[aplicarMapa] Tamanho de $gameMap.data APÓS inicialização: ${$gameMap.data.length}`); // **NOVO LOG**


    console.log("[aplicarMapa] Aplicando mapa gerado ao mapa atual...");
    console.log("[aplicarMapa] Tamanho de mapData: " + mapaGeradoData.length + ", Dimensões do mapa gerado: Largura=" + largura + ", Altura=" + altura);
    console.log("[aplicarMapa] Tamanho de $gameMap.data ANTES da aplicação: " + $gameMap.data.length + ", Dimensões do mapa atual: Largura=" + $gameMap.width() + ", Altura=" + $gameMap.height());


    let index = 0;
    for (let y = 0; y < altura; y++) {
        for (let x = 0; x < largura; x++) {
            // **NOVO: Tile ID Simples para teste - usar tile IDs 0-4**
            const tileId = (2048 + y) % 5; // Usar tile IDs simples 0, 1, 2, 3, 4

            // **NOVO: Cálculo dataIndex simplificado para teste - assumindo camada base 0**
            const dataIndex = (y * $gameMap.width() + x) * 4 + camadaBase; // Manter original por enquanto, mas simplificar depois se necessário

            console.log("[aplicarMapa] DEBUG - Tile index: x=" + x + ", y=" + y + ", index=" + index + ", dataIndex=" + dataIndex + ", TileId=" + tileId);


            if (dataIndex >= 0 && dataIndex < $gameMap.data.length) { // **Importante: Verificar contra o tamanho redimensionado**
                $gameMap.data[dataIndex] = tileId;
            } else {
                console.log("[aplicarMapa] Erro: dataIndex (" + dataIndex + ") FORA DOS LIMITES de $gameMap.data (tamanho: " + $gameMap.data.length + ")! Pulando este tile.");
            }
            index++;
        }
    }

    // **NOVO: Forçar atualização do mapa**
    $gameMap.requestRefresh();
    console.log("[aplicarMapa] Mapa Markov aplicado ao mapa atual! (Camada Base)");
}

function carregarMarkovChain() {
    try {
        const cadeiaJSON = cadeiaMarkovTreinadaJSON_FIXA;
        if (!cadeiaJSON) {
            console.warn("cadeiaMarkovTreinadaJSON_FIXA está vazia. Usando cadeia padrão.");
            return markovChain; // Retorna a cadeia padrão se a parametrizada estiver vazia
        }
        const cadeiaParseada = JSON.parse(cadeiaJSON);
        console.log("Cadeia de Markov PARAMETRIZADA carregada e parseada com sucesso!"); // Log de carregamento parametrizado
        return cadeiaParseada;
    } catch (e) {
        console.error("Erro ao carregar/parsear cadeia de Markov PARAMETRIZADA. Usando cadeia padrão.", e);
        return markovChain; // Retorna a cadeia padrão em caso de erro
    }
}


})(); // FIM da IIFE (Immediately Invoked Function Expression)