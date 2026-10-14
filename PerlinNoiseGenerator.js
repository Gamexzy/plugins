/*:
 * @target MZ
 * @plugindesc Gera um mapa base orgânico usando múltiplas camadas de Ruído Perlin Fratal (Altura, Temperatura, Umidade) para o WorldGenerationCoordinator, mapeando para tiles A1 e A2. A implementação real do Ruído Perlin está ativa.
 * @author [Seu Nome Aqui]
 * @version 0.9.8 // Versão: Adicionada função getBiomeNameForCoords para obter o nome do bioma.
 * @license MIT
 * @help
 * Este plugin utiliza a implementação completa do Ruído Perlin Fratal para simular
 * diferentes fatores ambientais como elevação, temperatura e umidade. Os valores
 * de ruído normalizados são escalados para intervalos definidos nos parâmetros
 * e podem ser armazenados em variáveis do jogo para uso em eventos e scripts.
 *
 * @param -- Semente do Mundo --
 * @text --- Semente do Mundo ---
 *
 * @param World Seed
 * @text Semente do Mundo (Seed)
 * @type number
 * @desc Semente numérica para geração determinística (0 = aleatório a cada sessão).
 * @default 12345
 *
 * @param -- Altura --
 * @text --- Altura ---
 *
 * @param Height Noise Scale
 * @text Escala Base do Ruído (Altura)
 * @type number
 * @decimals 4
 * @desc Controla o zoom da altura. Valores menores = massas continentais e planícies maiores.
 * @default 0.0120
 *
 * @param Height Number of Octaves
 * @text Número de Octavas (Altura)
 * @type number
 * @decimals 2
 * @desc Quantas camadas de ruído combinar para relevo (montanhas, colinas).
 * @default 4
 *
 * @param Height Lacunarity
 * @text Lacunaridade (Altura)
 * @type number
 * @decimals 2
 * @desc Fator de aumento da frequência para cada octava da altura.
 * @default 2.0
 *
 * @param Height Persistence
 * @text Persistência (Altura)
 * @type number
 * @decimals 2
 * @desc Fator de diminuição da amplitude para cada octava da altura.
 * @default 0.5
 *
 * @param Min Height Value
 * @text Valor Mínimo da Altura
 * @type number
 * @decimals 2
 * @desc O valor mínimo para a altura escalada (ex: -320 para oceanos naturais).
 * @default -320
 *
 * @param Max Height Value
 * @text Valor Máximo da Altura
 * @type number
 * @decimals 2
 * @desc O valor máximo para a altura escalada (ex: 480 para montanhas).
 * @default 480
 *
 * @param -- Temperatura --
 * @text --- Temperatura ---
 *
 * @param Temp Noise Scale
 * @text Escala Base do Ruído (Temperatura)
 * @type number
 * @decimals 4
 * @desc Escala do ruído de temperatura. Valores menores = faixas climáticas contínuas e amplas.
 * @default 0.0070
 *
 * @param Temp Number of Octaves
 * @text Número de Octavas (Temperatura)
 * @type number
 * @decimals 2
 * @desc Quantas camadas de ruído combinar para temperatura.
 * @default 2
 *
 * @param Temp Lacunarity
 * @text Lacunaridade (Temperatura)
 * @type number
 * @decimals 2
 * @desc Fator de aumento da frequência para cada octava da temperatura.
 * @default 2.0
 *
 * @param Temp Persistence
 * @text Persistência (Temperatura)
 * @type number
 * @decimals 2
 * @desc Fator de diminuição da amplitude para cada octava da temperatura.
 * @default 0.5
 *
 * @param Min Temp Value
 * @text Valor Mínimo da Temperatura
 * @type number
 * @decimals 2
 * @desc O valor mínimo de temperatura em °C.
 * @default -5
 *
 * @param Max Temp Value
 * @text Valor Máximo da Temperatura
 * @type number
 * @decimals 2
 * @desc O valor máximo de temperatura em °C.
 * @default 48
 *
 * @param Temp Lapse Rate
 * @text Taxa de Lapso de Temperatura
 * @type number
 * @decimals 4
 * @desc Queda de temperatura por metro de altitude (resfria montanhas sem congelar o mundo).
 * @default 0.022
 *
 * @param -- Umidade --
 * @text --- Umidade ---
 *
 * @param Humidity Noise Scale
 * @text Escala Base do Ruído (Umidade)
 * @type number
 * @decimals 4
 * @desc Escala do ruído de umidade. Valores menores = biomas de chuva coesos e orgânicos.
 * @default 0.0100
 *
 * @param Humidity Number of Octaves
 * @text Número de Octavas (Umidade)
 * @type number
 * @decimals 2
 * @desc Quantas camadas de ruído combinar para umidade.
 * @default 2
 *
 * @param Humidity Lacunarity
 * @text Lacunaridade (Umidade)
 * @type number
 * @decimals 2
 * @desc Fator de aumento da frequência por octava.
 * @default 2.0
 *
 * @param Humidity Persistence
 * @text Persistência (Umidade)
 * @type number
 * @decimals 2
 * @desc Fator de diminuição da amplitude por octava.
 * @default 0.5
 *
 * @param Min Humidity Value
 * @text Valor Mínimo da Umidade
 * @type number
 * @decimals 2
 * @desc O valor mínimo para a umidade escalada (0 a 100%).
 * @default 0
 *
 * @param Max Humidity Value
 * @text Valor Máximo da Umidade
 * @type number
 * @decimals 2
 * @desc O valor máximo para a umidade escalada (0 a 100%).
 * @default 100
 *
 * @param -- Biomas e Desniveis 1:1 --
 * @text --- Biomas e Desníveis 1:1 ---
 *
 * @param River Tile ID
 * @text ID do Tile (Rio/Água)
 * @type number
 * @desc ID do tile para rios e cursos de água (Exterior Outside_A1: 2048).
 * @default 2048
 *
 * @param Tier 0 Tile ID
 * @text ID do Andar 0 (Vale/Planície)
 * @type number
 * @desc ID do tile para o chão plano mais baixo (Outside_A2 Meadow: 2816).
 * @default 2816
 *
 * @param Tier 1 Tile ID
 * @text ID do Andar 1 (Platô Médio)
 * @type number
 * @desc ID do tile para a superfície do primeiro platô (Outside_A2 Dark Meadow: 2864).
 * @default 2864
 *
 * @param Tier 2 Tile ID
 * @text ID do Andar 2 (Platô Alto/Montanha)
 * @type number
 * @desc ID do tile para a superfície do platô mais elevado (Outside_A2 Dirt/Stone: 2912).
 * @default 2912
 *
 * @param Cliff 1 Tile ID
 * @text ID Paredão Desnível 1
 * @type number
 * @desc ID do paredão vertical para o desnível do Andar 1 (Outside_A4 Ledge A Face: 8000).
 * @default 8000
 *
 * @param Cliff 2 Tile ID
 * @text ID Paredão Desnível 2
 * @type number
 * @desc ID do paredão vertical para o desnível do Andar 2 (Outside_A4 Ledge B Face: 8048).
 * @default 8048
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
    const pluginName = "PerlinNoiseGenerator";
    const parameters = PluginManager.parameters(pluginName);

    // --- Semente do Mundo ---
    const worldSeed = Number(parameters['World Seed'] !== undefined ? parameters['World Seed'] : 12345);

    // --- Parâmetros de Ruído (Calibrados para Continentes Orgânicos & Vastas Planícies) ---
    const heightNoiseScale = Number(parameters['Height Noise Scale']) || 0.0120;
    const heightNumOctaves = Number(parameters['Height Number of Octaves']) || 4;
    const heightLacunarity = Number(parameters['Height Lacunarity']) || 2.0;
    const heightPersistence = Number(parameters['Height Persistence']) || 0.5;
    const minHeightValue = Number(parameters['Min Height Value'] !== undefined ? parameters['Min Height Value'] : -320);
    const maxHeightValue = Number(parameters['Max Height Value'] !== undefined ? parameters['Max Height Value'] : 480);

    const tempNoiseScale = Number(parameters['Temp Noise Scale']) || 0.0070;
    const tempNumOctaves = Number(parameters['Temp Number of Octaves']) || 2;
    const tempLacunarity = Number(parameters['Temp Lacunarity']) || 2.0;
    const tempPersistence = Number(parameters['Temp Persistence']) || 0.5;
    const minTempValue = Number(parameters['Min Temp Value'] !== undefined ? parameters['Min Temp Value'] : -5);
    const maxTempValue = Number(parameters['Max Temp Value'] !== undefined ? parameters['Max Temp Value'] : 48);
    const tempLapseRate = Number(parameters['Temp Lapse Rate'] !== undefined ? parameters['Temp Lapse Rate'] : 0.022);

    const humidityNoiseScale = Number(parameters['Humidity Noise Scale']) || 0.0100;
    const humidityNumOctaves = Number(parameters['Humidity Number of Octaves']) || 2;
    const humidityLacunarity = Number(parameters['Humidity Lacunarity']) || 2.0;
    const humidityPersistence = Number(parameters['Humidity Persistence']) || 0.5;
    const minHumidityValue = Number(parameters['Min Humidity Value'] !== undefined ? parameters['Min Humidity Value'] : 0);
    const maxHumidityValue = Number(parameters['Max Humidity Value'] !== undefined ? parameters['Max Humidity Value'] : 100);

    const debugMode = String(parameters['debugMode'] || 'false') === 'true';

    // --- IDs de Tiles (Escala 1:1 com Desníveis: Tileset 2 Exterior) ---
    const riverTileId = Number(parameters['River Tile ID']) || 2048; // Rio / Água (Outside_A1)
    const tier0TileId = Number(parameters['Tier 0 Tile ID']) || 2816; // Andar 0: Grama de Vale (Outside_A2 Meadow)
    const tier1TileId = Number(parameters['Tier 1 Tile ID']) || 2864; // Andar 1: Platô 1 (Outside_A2 Dark Meadow)
    const tier2TileId = Number(parameters['Tier 2 Tile ID']) || 2912; // Andar 2: Platô Alto (Outside_A2 Dirt/Stone)
    const cliff1TileId = Number(parameters['Cliff 1 Tile ID']) || 8000; // Paredão Desnível 1 (Outside_A4 Ledge A Face)
    const cliff2TileId = Number(parameters['Cliff 2 Tile ID']) || 8048; // Paredão Desnível 2 (Outside_A4 Ledge B Face)

    // Aliases e compatibilidade
    const seaTileId = riverTileId;
    const coastTileId = riverTileId;
    const landTileId = tier0TileId;
    const hillsTileId = tier1TileId;
    const mountainTileId = tier2TileId;
    const snowPeakTileId = tier2TileId;
    const beachTileId = tier0TileId;
    const desertTileId = 3200;
    const forestTileId = 2864;
    const snowyTileId = 3296;
    const icyWaterTileId = 2048;
    const swampTileId = 2864;
    const tundraTileId = 2912;
    const savannaTileId = tier1TileId;
    const jungleTileId = 2864;


    // ==========================================================================
    // Funções Auxiliares do Ruído Perlin
    // ==========================================================================

    /**
     * Função de atenuação (smoothing) para interpolação.
     * @param {number} t - Valor de entrada (0 a 1).
     * @returns {number} Valor atenuado.
     */
    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Interpolação linear entre dois valores.
     * @param {number} a - Primeiro valor.
     * @param {number} b - Segundo valor.
     * @param {number} t - Fator de interpolação (0 a 1).
     * @returns {number} O valor interpolado.
     */
    function lerp(a, b, t) {
        return a + t * (b - a);
    }

    /**
     * Calcula o produto escalar entre um vetor gradiente pseudo-aleatório e um vetor de deslocamento.
     * @param {number} hash - Valor de hash do ponto de grade.
     * @param {number} x - Componente X do vetor de deslocamento.
     * @param {number} y - Componente Y do vetor de deslocamento.
     * @returns {number} O produto escalar.
     */
    function grad(hash, x, y) {
        const h = hash & 15;
        switch (h) {
            case 0x0: return x + y;
            case 0x1: return -x + y;
            case 0x2: return x - y;
            case 0x3: return -x - y;
            case 0x4: return x;
            case 0x5: return -x;
            case 0x6: return y;
            case 0x7: return -y;
            case 0x8: return x + y;
            case 0x9: return -x + y;
            case 0xA: return x - y;
            case 0xB: return -x - y;
            case 0xC: return x;
            case 0xD: return -x;
            case 0xE: return y;
            case 0xF: return -y;
            default: return 0;
        }
    }

    // Tabela de Permutação (Inicializada uma vez, com suporte a World Seed determinístico)
    const p = (() => {
        let seed = worldSeed;
        function seededRandom() {
            if (worldSeed <= 0) return Math.random();
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        }

        const permutation = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            permutation[i] = i;
        }
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(seededRandom() * (i + 1));
            [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
        }
        const pTable = new Uint8Array(512);
        for (let i = 0; i < 256; i++) {
            pTable[i] = pTable[i + 256] = permutation[i];
        }
        return pTable;
    })();

    // ==========================================================================
    // Função Principal de Ruído Perlin (Ativa)
    // ==========================================================================

    /**
     * Calcula o valor do Ruído Perlin para as coordenadas (x, y).
     * @param {number} x - Coordenada X no espaço do ruído.
     * @param {number} y - Coordenada Y no espaço do ruído.
     * @returns {number} O valor do ruído (entre -1 e 1).
     */
    function getPerlinNoise(x, y) {
        let X = Math.floor(x) & 255;
        let Y = Math.floor(y) & 255;

        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);

        const u = fade(xf);
        const v = fade(yf);

        const aa = p[p[X] + Y];
        const ab = p[p[X] + Y + 1];
        const ba = p[p[X + 1] + Y];
        const bb = p[p[X + 1] + Y + 1];

        const g1 = grad(p[aa], xf, yf);
        const g2 = grad(p[ba], xf - 1, yf);
        const g3 = grad(p[ab], xf, yf - 1);
        const g4 = grad(p[bb], xf - 1, yf - 1);

        const x1 = lerp(g1, g2, u);
        const x2 = lerp(g3, g4, u);

        return lerp(x1, x2, v);
    }


    // ==========================================================================
    // Função de Ruído Fratal (Octavas) - Usa getPerlinNoise
    // ==========================================================================

    /**
     * Gera ruído fratal combinando múltiplas octavas de Ruído Perlin.
     * @param {number} x - Coordenada X.
     * @param {number} y - Coordenada Y.
     * @param {number} baseScale - Escala da primeira octava.
     * @param {number} numOctaves - Número de octavas a combinar.
     * @param {number} lacunarity - Fator de aumento da frequência por octava.
     * @param {number} persistence - Fator de diminuição da amplitude por octava.
     * @returns {number} O valor do ruído fratal (entre -1 e 1).
     */
    function getFractalNoise(x, y, baseScale, numOctaves, lacunarity, persistence) {
        let total = 0;
        let amplitude = 1.0;
        let frequency = baseScale;
        let maxAmplitude = 0;

        for (let i = 0; i < numOctaves; i++) {
            total += getPerlinNoise(x * frequency, y * frequency) * amplitude;

            maxAmplitude += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxAmplitude;
    }

    /**
     * Determina o ID do tile com base nos valores ESCALADOS de altura, temperatura e umidade.
     * @param {number} scaledHeight - Valor de altura escalado (ex: -320 a 480).
     * @param {number} scaledTemp - Valor de temperatura escalado (ex: -5 a 48).
     * @param {number} scaledHumidity - Valor de umidade escalado (0 a 100).
     * @returns {number} O ID do tile apropriado.
     */
    function getTileIdFromBiomes(scaledHeight, scaledTemp, scaledHumidity) {
        // 1. Corpos d'água (Abaixo do nível do mar)
        if (scaledHeight < 0) {
            if (scaledTemp < 0) {
                return icyWaterTileId; // Água congelada / banquisa polar
            }
            return seaTileId; // Mar / Oceano
        }

        // 2. Linha de Costa / Litoral (Transição terra-mar)
        if (scaledHeight < 20) {
            return coastTileId; // Praia / Costa
        }

        // 3. Montanhas e Cumes Elevados
        if (scaledHeight > 220) {
            if (scaledTemp < 10) {
                return snowyTileId; // Cumes gelados com neve
            }
            return mountainTileId; // Montanhas rochosas
        }

        // 4. Biomas Terrestres Continentais
        // - Zonas de Frio Extremo
        if (scaledTemp < 5) {
            return snowyTileId; // Planícies gélidas
        }
        // - Zonas Subpolares / Frias (Taiga / Tundra)
        if (scaledTemp < 13) {
            return scaledHumidity > 52 ? forestTileId : tundraTileId;
        }

        // - Zonas Áridas e Quentes (Deserto e Savana)
        if (scaledTemp > 24 && scaledHumidity < 38) {
            return desertTileId; // Deserto arenoso
        }
        if (scaledTemp > 18 && scaledHumidity < 46) {
            return savannaTileId; // Savana / estepe quente
        }

        // - Zonas Úmidas e Tropicais
        if (scaledHumidity > 70) {
            return scaledTemp > 20 ? swampTileId : forestTileId; // Pântano ou floresta densa
        }
        if (scaledHumidity > 50) {
            return forestTileId; // Floresta temperada
        }

        // - Planície Temperada (Plains / Land)
        // Espaço aberto dominante (~35-40% do continente), perfeito para vilas, estradas e exploração.
        return landTileId;
    }

    /**
     * Determina o NOME do bioma com base nos valores ESCALADOS de altura, temperatura e umidade.
     * Esta função é uma réplica exata da lógica de getLayersAt, retornando o nome do bioma.
     * @param {number} scaledHeight - Valor de altura escalado.
     * @param {number} scaledTemp - Valor de temperatura escalado.
     * @param {number} scaledHumidity - Valor de umidade escalado.
     * @param {boolean} isRiver - Se o ponto é parte de um leito de rio meandroso.
     * @returns {string} O nome do bioma (ex: "Plains", "Hills", "Mountain", "River").
     */
    function getBiomeNameFromEnvironmentalData(scaledHeight, scaledTemp, scaledHumidity, isRiver = false, level = 0, isCliff = false) {
        if (isRiver || scaledHeight < 0) return "River";
        if (isCliff) return "Cliff";
        switch (level) {
            case 0: return "Plains";
            case 1: return "Plateau1";
            case 2: return "Plateau2";
            default: return "Plains";
        }
    }


    // ==========================================================================
    // Funções do Polidor Determinístico de Autotiles (Bitmask 47-Blob Solver)
    // ==========================================================================

    let _shapeMap = null;
    function initShapeMap() {
        if (_shapeMap) return;
        _shapeMap = new Map();
        const table = (typeof Tilemap !== 'undefined' && Tilemap.FLOOR_AUTOTILE_TABLE) ? Tilemap.FLOOR_AUTOTILE_TABLE : null;
        if (table) {
            for (let i = 0; i < table.length; i++) {
                const key = table[i].map(q => q.join(',')).join('|');
                _shapeMap.set(key, i);
            }
        }
    }

    /**
     * Calcula o shape exato (0 a 47) com base na presença dos 8 vizinhos.
     */
    function getAutotileShape(n, s, e, w, nw, ne, sw, se) {
        if (!n && !s && !e && !w) return 47; // Ilha isolada 1x1
        initShapeMap();

        const tl = (n && w) ? (nw ? [2, 4] : [2, 0]) : (!n && w) ? [2, 2] : (n && !w) ? [0, 4] : [0, 2];
        const tr = (n && e) ? (ne ? [1, 4] : [3, 0]) : (!n && e) ? [1, 2] : (n && !e) ? [3, 4] : [3, 2];
        const bl = (s && w) ? (sw ? [2, 3] : [2, 1]) : (!s && w) ? [2, 5] : (s && !w) ? [0, 3] : [0, 5];
        const br = (s && e) ? (se ? [1, 3] : [3, 1]) : (!s && e) ? [1, 5] : (s && !e) ? [3, 3] : [3, 5];

        const key = [tl, tr, bl, br].map(q => q.join(',')).join('|');
        return _shapeMap ? (_shapeMap.get(key) || 0) : 0;
    }

    // Mapa de prioridades de sobreposição para a Camada 0 (Chão Base: Vales e Platôs)
    const _priorityBase = {
        [tier2TileId]: 30,
        [tier1TileId]: 20,
        [tier0TileId]: 10,
        [riverTileId]: 0
    };

    function isWaterTile(tileId) {
        return tileId === riverTileId;
    }

    function isLandTile(tileId) {
        return tileId >= 2816 && tileId < 4352;
    }

    function isWallAutotile(tileId) {
        if (!tileId || tileId < 2048) return false;
        const kind = Math.floor((tileId - 2048) / 48);
        if (tileId >= 4352 && tileId < 5888) return true;
        if (tileId >= 5888 && tileId < 8192) {
            const ty = Math.floor(kind / 8);
            return (ty % 2 === 1);
        }
        return false;
    }

    function getWallAutotileShape(n, s, e, w) {
        let shape = 0;
        if (!w) shape += 1;
        if (!n) shape += 2;
        if (!e) shape += 4;
        if (!s) shape += 8;
        return shape; // 0 a 15 estritamente garantido
    }

    /**
     * Conectividade nativa para a Camada 0 (Chão Base).
     * Platôs mais altos cobrem o chão de baixo suavemente.
     */
    function isConnectableBase(centerBaseId, neighborBaseId) {
        if (centerBaseId === neighborBaseId) return true;

        const isWaterC = isWaterTile(centerBaseId);
        const isWaterN = isWaterTile(neighborBaseId);
        if (isWaterC && isWaterN) return true;
        if (isWaterC !== isWaterN) return false;

        const cp = _priorityBase[centerBaseId] ?? 0;
        const np = _priorityBase[neighborBaseId] ?? 0;
        return np >= cp;
    }

    /**
     * Conectividade nativa para a Camada 1 (Paredões de Desnível / Falésias).
     */
    function isConnectableUpper(centerUpperId, neighborUpperId) {
        if (!centerUpperId || !neighborUpperId) return false;
        const cBase = Math.floor((centerUpperId - 2048) / 48) * 48 + 2048;
        const nBase = Math.floor((neighborUpperId - 2048) / 48) * 48 + 2048;
        return cBase === nBase;
    }

    // Mantém compatibilidade com chamadas externas
    function isConnectable(centerBaseId, neighborBaseId) {
        return isConnectableBase(centerBaseId, neighborBaseId);
    }

    // Parâmetros Topográficos de Escala 1:1 com Desníveis
    const MACRO_SCALE = 0.0080;
    const RIDGE_SCALE = 0.0160;
    const RIVER_SCALE = 0.0110;
    const RAMP_SCALE  = 0.0400; // Frequência de rampas naturais transitáveis

    /**
     * Amostra a elevação física contínua.
     */
    function getRawElevation(wx, wy) {
        const baseN = getFractalNoise(wx, wy, MACRO_SCALE, 3, 2.0, 0.5);
        if (baseN < -0.22) {
            return (baseN + 0.22) * 300; // Depressão / Rio
        }
        const ridgeN = 1.0 - Math.abs(getFractalNoise(wx + 600, wy + 300, RIDGE_SCALE, 3, 2.0, 0.5));
        const ground = 20 + (baseN + 0.22) * 150;
        const mountain = Math.pow(Math.max(0, ridgeN - 0.48) / 0.52, 2.0) * 700;
        return ground + mountain;
    }

    /**
     * Converte elevação contínua em patamares de desnível (Andares/Platôs):
     * Andar 0: Vale baixo (Grama)
     * Andar 1: Platô elevado 1
     * Andar 2: Platô alto 2 (Montanha)
     */
    function getRawLevel(elev) {
        if (elev < 0) return -1; // Água
        if (elev < 180) return 0; // Vale baixo
        if (elev < 400) return 1; // Platô 1
        return 2; // Platô 2 (Alto)
    }

    /**
     * Amostra os dados ambientais físicos ({ height, temp, humidity, isRiver, level, isCliff, cliffTile }) para uma coordenada.
     */
    function sampleEnvironmentData(worldX, worldY) {
        const elev = getRawElevation(worldX, worldY);

        // Rio meandroso orgânico
        let isRiver = false;
        if (elev >= 15 && elev <= 400) {
            const rN = Math.abs(getPerlinNoise((worldX + 550) * RIVER_SCALE, (worldY + 880) * RIVER_SCALE));
            isRiver = (rN < 0.020);
        }

        const level = isRiver ? -1 : getRawLevel(elev);

        // Desnível (Falésia / Ledge Face) e Rampas Naturais
        let isCliff = false;
        let cliffTile = 0;
        if (level >= 0) {
            const northElev = getRawElevation(worldX, worldY - 1);
            const northLvl = getRawLevel(northElev);
            if (northLvl > level) {
                // Verifica ruído de rampa natural
                const rampN = Math.abs(getPerlinNoise(worldX * RAMP_SCALE, worldY * RAMP_SCALE));
                if (rampN >= 0.12) {
                    isCliff = true;
                    cliffTile = (northLvl >= 2) ? cliff2TileId : cliff1TileId;
                }
            }
        }

        const tempNoise = (getFractalNoise(worldX + 1200, worldY + 600, 0.0050, 2, 2.0, 0.5) + 1) / 2;
        let scaledTemp = 18 + tempNoise * 18;
        if (elev > 0) scaledTemp -= elev * 0.0065;

        const humNoise = (getFractalNoise(worldX + 2400, worldY + 1500, 0.0070, 2, 2.0, 0.5) + 1) / 2;
        const scaledHumidity = humNoise * 100;

        return {
            height: elev,
            temp: scaledTemp,
            humidity: scaledHumidity,
            isRiver: isRiver,
            level: level,
            isCliff: isCliff,
            cliffTile: cliffTile
        };
    }

    /**
     * Amostra os biomas nas duas camadas para Escala 1:1 com Desníveis.
     * Camada 0: Chão transitável do patamar.
     * Camada 1: Paredão de falésia (Outside_A4) onde há desnível abrupto (bloqueado para passagem).
     */
    function getLayersAt(worldX, worldY) {
        const env = sampleEnvironmentData(worldX, worldY);
        let baseTile = 0;
        let upperTile = 0;

        if (env.isRiver || env.height < 0) {
            baseTile = riverTileId;
        } else {
            if (env.level === 0) baseTile = tier0TileId;
            else if (env.level === 1) baseTile = tier1TileId;
            else baseTile = tier2TileId;

            // Se este ponto é o paredão de desnível contra o platô norte:
            if (env.isCliff) {
                upperTile = env.cliffTile;
            }
        }

        return { baseTile, upperTile };
    }

    /**
     * Retorna o ID base (Shape 0) do tile gerado proceduralmente nas coordenadas globais.
     */
    function getBaseTileAt(worldX, worldY) {
        const layers = getLayersAt(worldX, worldY);
        return layers.upperTile || layers.baseTile;
    }

    // ==========================================================================
    // Função Principal de Geração de Chunk com Polimento Automático Nativo
    // ==========================================================================

    /**
     * Gera os dados de tile para um chunk específico com autotiling perfeitamente calculado no padrão nativo do MZ.
     */
    function generateChunkData(chunkData) {
        const tiles = chunkData.tiles;
        if (!chunkData.upperTiles) {
            chunkData.upperTiles = Array(chunkData.height).fill(null).map(() => Array(chunkData.width).fill(0));
        }
        const upperTiles = chunkData.upperTiles;

        const chunkWidth = chunkData.width;
        const chunkHeight = chunkData.height;
        const chunkXReal = chunkData.chunkX;
        const chunkYReal = chunkData.chunkY;

        // 1. Pré-calcula a grade de terrenos base e sobreposição com margem de 1 tile ao redor
        const baseGrid = [];
        const upperGrid = [];
        for (let dy = -1; dy <= chunkHeight; dy++) {
            baseGrid[dy + 1] = [];
            upperGrid[dy + 1] = [];
            for (let dx = -1; dx <= chunkWidth; dx++) {
                const wx = chunkXReal * chunkWidth + dx;
                const wy = chunkYReal * chunkHeight + dy;
                const sample = getLayersAt(wx, wy);
                baseGrid[dy + 1][dx + 1] = sample.baseTile;
                upperGrid[dy + 1][dx + 1] = sample.upperTile;
            }
        }

        // 2. Calcula o shape exato (0 a 47 para chão, 0 a 15 para paredes)
        for (let y = 0; y < chunkHeight; y++) {
            for (let x = 0; x < chunkWidth; x++) {
                const gy = y + 1;
                const gx = x + 1;

                // --- LAYER 0 (Base: Chão e Rios) ---
                const centerBase = baseGrid[gy][gx];
                const n0  = isConnectableBase(centerBase, baseGrid[gy - 1][gx]);
                const s0  = isConnectableBase(centerBase, baseGrid[gy + 1][gx]);
                const e0  = isConnectableBase(centerBase, baseGrid[gy][gx + 1]);
                const w0  = isConnectableBase(centerBase, baseGrid[gy][gx - 1]);
                const nw0 = isConnectableBase(centerBase, baseGrid[gy - 1][gx - 1]);
                const ne0 = isConnectableBase(centerBase, baseGrid[gy - 1][gx + 1]);
                const sw0 = isConnectableBase(centerBase, baseGrid[gy + 1][gx - 1]);
                const se0 = isConnectableBase(centerBase, baseGrid[gy + 1][gx + 1]);

                const shape0 = getAutotileShape(n0, s0, e0, w0, nw0, ne0, sw0, se0);
                tiles[y][x] = centerBase >= 2048 ? (centerBase + shape0) : centerBase;

                // --- LAYER 1 (Sobreposição: Paredões de Desnível) ---
                const centerUpper = upperGrid[gy][gx];
                if (centerUpper > 0) {
                    if (isWallAutotile(centerUpper)) {
                        const nw = isConnectableUpper(centerUpper, upperGrid[gy][gx - 1]);
                        const ne = isConnectableUpper(centerUpper, upperGrid[gy][gx + 1]);
                        const nn = isConnectableUpper(centerUpper, upperGrid[gy - 1][gx]);
                        const ns = isConnectableUpper(centerUpper, upperGrid[gy + 1][gx]);
                        const shapeWall = getWallAutotileShape(nn, ns, ne, nw);
                        upperTiles[y][x] = centerUpper + shapeWall;
                    } else {
                        const n1  = isConnectableUpper(centerUpper, upperGrid[gy - 1][gx]);
                        const s1  = isConnectableUpper(centerUpper, upperGrid[gy + 1][gx]);
                        const e1  = isConnectableUpper(centerUpper, upperGrid[gy][gx + 1]);
                        const w1  = isConnectableUpper(centerUpper, upperGrid[gy][gx - 1]);
                        const nw1 = isConnectableUpper(centerUpper, upperGrid[gy - 1][gx - 1]);
                        const ne1 = isConnectableUpper(centerUpper, upperGrid[gy - 1][gx + 1]);
                        const sw1 = isConnectableUpper(centerUpper, upperGrid[gy + 1][gx - 1]);
                        const se1 = isConnectableUpper(centerUpper, upperGrid[gy + 1][gx + 1]);

                        const shape1 = getAutotileShape(n1, s1, e1, w1, nw1, ne1, sw1, se1);
                        upperTiles[y][x] = centerUpper >= 2048 ? (centerUpper + shape1) : centerUpper;
                    }
                } else {
                    upperTiles[y][x] = 0;
                }
            }
        }
        return chunkData;
    }

    // ==========================================================================
    // Função para Prover Dados Ambientais (para EnvironmentVariableUpdater e DynamicBiomeRenderer)
    // ==========================================================================

    /**
     * Retorna os dados ambientais escalados para uma coordenada global "real".
     * Usado pelo EnvironmentVariableUpdater e DynamicBiomeRenderer.
     * @param {number} realX - Coordenada X global "real".
     * @param {number} realY - Coordenada Y global "real".
     * @returns {Object} Um objeto contendo os valores ambientais escalados ({ height, temp, humidity }).
     */
    function getEnvironmentDataForCoords(realX, realY) {
        return sampleEnvironmentData(realX, realY);
    }

    /**
     * Retorna o NOME do bioma para uma coordenada global "real".
     * Usado pelo DynamicBiomeRenderer.
     * @param {number} realX - Coordenada X global "real".
     * @param {number} realY - Coordenada Y global "real".
     * @returns {string} O nome do bioma (ex: "Floresta", "Deserto").
     */
    function getBiomeNameForCoords(realX, realY) {
        const { height, temp, humidity, isRiver, tier, isShadow } = getEnvironmentDataForCoords(realX, realY);
        return getBiomeNameFromEnvironmentalData(height, temp, humidity, isRiver, tier, isShadow);
    }


    // ==========================================================================
    // Registro e Exposição
    // ==========================================================================

    // Registra a função de geração de chunk no WorldGenerationCoordinator
    if (globalThis.WorldGenerationCoordinator && globalThis.WorldGenerationCoordinator.registerGenerator) {
        globalThis.WorldGenerationCoordinator.registerGenerator(pluginName, generateChunkData);
    } else {
        console.error(`${pluginName}: WorldGenerationCoordinator não encontrado ou função registerGenerator não disponível. A geração de chunks por este plugin não funcionará.`);
    }

    window[pluginName] = {
        tileIds: { // IDs de tiles que o PerlinNoiseGenerator usa para gerar o $dataMap.data
            tier0: tier0TileId,
            tier1: tier1TileId,
            tier2: tier2TileId,
            cliff1: cliff1TileId,
            cliff2: cliff2TileId,
            river: riverTileId,
            sea: seaTileId,
            coast: coastTileId,
            beach: beachTileId,
            land: landTileId,
            hills: hillsTileId,
            mountain: mountainTileId,
            snowPeak: snowPeakTileId,
            desert: desertTileId,
            forest: forestTileId,
            snowy: snowyTileId,
            icyWater: icyWaterTileId,
            swamp: swampTileId,
            tundra: tundraTileId,
            savanna: savannaTileId,
            jungle: jungleTileId
        },
        getEnvironmentDataForCoords: getEnvironmentDataForCoords, // Para EnvironmentVariableUpdater
        getBiomeNameForCoords: getBiomeNameForCoords, // Para DynamicBiomeRenderer
        getAutotileShape: getAutotileShape,
        isConnectable: isConnectable,
        getBaseTileAt: getBaseTileAt,
        getLayersAt: getLayersAt
    };
    globalThis[pluginName] = window[pluginName];

    if (globalThis.EnvironmentVariableUpdater && globalThis.EnvironmentVariableUpdater.registerDataProvider) {
        globalThis.EnvironmentVariableUpdater.registerDataProvider(pluginName, globalThis[pluginName].getEnvironmentDataForCoords);
    } else {
        if (debugMode) console.warn(`${pluginName}: EnvironmentVariableUpdater não encontrado ou função registerDataProvider não disponível. Variáveis ambientais não serão atualizadas por este plugin.`);
    }


    if (debugMode) console.log(`${pluginName}: Plugin carregado.`);
})();
