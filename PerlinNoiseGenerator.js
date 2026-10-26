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
 * @param -- Altura --
 * @text --- Altura ---
 *
 * @param Height Noise Scale
 * @text Escala Base do Ruído (Altura)
 * @type number
 * @decimals 4
 * @desc Controla o "zoom" da primeira octava da altura. Valores menores = feições maiores (continentes, oceanos).
 * @default 0.025
 *
 * @param Height Number of Octaves
 * @text Número de Octavas (Altura)
 * @type number
 * @decimals 2
 * @desc Quantas camadas de ruído combinar para detalhes da altura (montanhas, colinas).
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
 * @desc O valor mínimo para a altura escalada (ex: -100 para metros). Usado na lógica de bioma.
 * @default -100
 *
 * @param Max Height Value
 * @text Valor Máximo da Altura
 * @type number
 * @decimals 2
 * @desc O valor máximo para a altura escalada (ex: 1000 para metros). Usado na lógica de bioma.
 * @default 1000
 *
 * @param -- Temperatura --
 * @text --- Temperatura ---
 *
 * @param Temp Noise Scale
 * @text Escala Base do Ruído (Temperatura)
 * @type number
 * @decimals 4
 * @desc Escala do ruído para a temperatura.
 * @default 0.015
 *
 * @param Temp Number of Octaves
 * @text Número de Octavas (Temperatura)
 * @type number
 * @decimals 2
 * @desc Quantas camadas de ruído combinar para detalhes da temperatura.
 * @default 4
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
 * @desc O valor mínimo para a temperatura escalada (ex: -20 para °C). Usado na lógica de bioma.
 * @default -20
 *
 * @param Max Temp Value
 * @text Valor Máximo da Temperatura
 * @type number
 * @decimals 2
 * @desc O valor máximo para a temperatura escalada (ex: 100 para °C). Usado na lógica de bioma.
 * @default 100
 *
 * @param Temp Lapse Rate
 * @text Taxa de Lapso de Temperatura
 * @type number
 * @decimals 4
 * @desc Quanto a temperatura diminui por unidade de altura (ex: 0.0065 para 0.0065 °C/metro).
 * @default 0.065
 *
 * @param -- Umidade --
 * @text --- Umidade ---
 *
 * @param Humidity Noise Scale
 * @text Escala Base do Ruído (Umidade)
 * @type number
 * @decimals 4
 * @desc Escala do ruído para a umidade.
 * @default 0.02
 *
 * @param Humidity Number of Octaves
 * @text Número de Octavas (Umidade)
 * @type number
 * @decimals 2
 * @desc Quantas camadas de ruído combinar para detalhes da umidade.
 * @default 4
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
 * @desc O valor mínimo para a umidade escalada (ex: 0 para %). Usado na lógica de bioma.
 * @default 0
 *
 * @param Max Humidity Value
 * @text Valor Máximo da Umidade
 * @type number
 * @decimals 2
 * @desc O valor máximo para a umidade escalada (ex: 100 para %). Usado na lógica de bioma.
 * @default 100
 *
 * @param -- Biomas e Tiles --
 * @text --- Biomas e Tiles ---
 *
 * @param Sea Tile ID
 * @text ID do Tile (Mar)
 * @type number
 * @desc ID do tile para áreas de mar.
 * @default 2816
 *
 * @param Coast Tile ID
 * @text ID do Tile (Costa)
 * @type number
 * @desc ID do tile para áreas de costa.
 * @default 2817
 *
 * @param Land Tile ID
 * @text ID do Tile (Terra)
 * @type number
 * @desc ID do tile para áreas de terra.
 * @default 2818
 *
 * @param Mountain Tile ID
 * @text ID do Tile (Montanha)
 * @type number
 * @desc ID do tile para áreas de montanha.
 * @default 2819
 *
 * @param Desert Tile ID
 * @text ID do Tile (Deserto)
 * @type number
 * @desc ID do tile para áreas de deserto (quente e seco).
 * @default 2820
 *
 * @param Forest Tile ID
 * @text ID do Tile (Floresta)
 * @type number
 * @desc ID do tile para áreas de floresta (temperado e úmido).
 * @default 2821
 *
 * @param Snowy Tile ID
 * @text ID do Tile (Neve)
 * @type number
 * @desc ID do tile para áreas nevadas (frio e seco).
 * @default 2822
 *
 * @param Icy Water Tile ID
 * @text ID do Tile (Água Congelada)
 * @type number
 * @desc ID do tile para áreas de água congelada (muito frio).
 * @default 2823
 *
 * @param Swamp Tile ID
 * @text ID do Tile (Pântano)
 * @type number
 * @desc ID do tile para áreas de pântano (quente e úmido).
 * @default 2824
 *
 * @param Tundra Tile ID
 * @text ID do Tile (Tundra)
 * @type number
 * @desc ID do tile para áreas de tundra (frio e moderadamente úmido).
 * @default 2825
 *
 * @param Savanna Tile ID
 * @text ID do Tile (Savana)
 * @type number
 * @desc ID do tile para áreas de savana (quente e seco a moderado).
 * @default 2826
 *
 * @param Jungle Tile ID
 * @text ID do Tile (Selva)
 * @type number
 * @desc ID do tile para áreas de selva (quente e muito úmido).
 * @default 2827
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

    // --- Parâmetros de Ruído ---
    const heightNoiseScale = Number(parameters['Height Noise Scale']) || 0.025;
    const heightNumOctaves = Number(parameters['Height Number of Octaves']) || 4;
    const heightLacunarity = Number(parameters['Height Lacunarity']) || 2.0;
    const heightPersistence = Number(parameters['Height Persistence']) || 0.5;
    const minHeightValue = Number(parameters['Min Height Value']) || -100;
    const maxHeightValue = Number(parameters['Max Height Value']) || 1000;

    const tempNoiseScale = Number(parameters['Temp Noise Scale']) || 0.015;
    const tempNumOctaves = Number(parameters['Temp Number of Octaves']) || 4;
    const tempLacunarity = Number(parameters['Temp Lacunarity']) || 2.0;
    const tempPersistence = Number(parameters['Temp Persistence']) || 0.5;
    const minTempValue = Number(parameters['Min Temp Value']) || -20;
    const maxTempValue = Number(parameters['Max Temp Value']) || 100;
    const tempLapseRate = Number(parameters['Temp Lapse Rate']) || 0.065;

    const humidityNoiseScale = Number(parameters['Humidity Noise Scale']) || 0.02;
    const humidityNumOctaves = Number(parameters['Humidity Number of Octaves']) || 4;
    const humidityLacunarity = Number(parameters['Humidity Lacunarity']) || 2.0;
    const humidityPersistence = Number(parameters['Humidity Persistence']) || 0.5;
    const minHumidityValue = Number(parameters['Min Humidity Value']) || 0;
    const maxHumidityValue = Number(parameters['Max Humidity Value']) || 100;

    const debugMode = String(parameters['debugMode'] || 'false') === 'true';


    // --- IDs de Tiles ---
    const seaTileId = Number(parameters['Sea Tile ID']) || 2816;
    const coastTileId = Number(parameters['Coast Tile ID']) || 2817;
    const landTileId = Number(parameters['Land Tile ID']) || 2818;
    const mountainTileId = Number(parameters['Mountain Tile ID']) || 2819;
    const desertTileId = Number(parameters['Desert Tile ID']) || 2820;
    const forestTileId = Number(parameters['Forest Tile ID']) || 2821;
    const snowyTileId = Number(parameters['Snowy Tile ID']) || 2822;
    const icyWaterTileId = Number(parameters['Icy Water Tile ID']) || 2823;
    const swampTileId = Number(parameters['Swamp Tile ID']) || 2824;
    const tundraTileId = Number(parameters['Tundra Tile ID']) || 2825;
    const savannaTileId = Number(parameters['Savanna Tile ID']) || 2826;
    const jungleTileId = Number(parameters['Jungle Tile ID']) || 2827;


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

    // Tabela de Permutação (Inicializada uma vez)
    const p = (() => {
        const permutation = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            permutation[i] = i;
        }
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
        }
        const p = new Uint8Array(512);
        for (let i = 0; i < 256; i++) {
            p[i] = p[i + 256] = permutation[i];
        }
        return p;
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
     * @param {number} scaledHeight - Valor de altura escalado (ex: -100 a 1000).
     * @param {number} scaledTemp - Valor de temperatura escalado (ex: -20 a 100).
     * @param {number} scaledHumidity - Valor de umidade escalado (ex: 0 a 100).
     * @returns {number} O ID do tile apropriado.
     */
    function getTileIdFromBiomes(scaledHeight, scaledTemp, scaledHumidity) {
        // Lógica de bioma baseada nos valores escalados.
        // Os limites são baseados nos valores padrão dos parâmetros.

        // Condições de Altura
        if (scaledHeight < 0) { // Abaixo do "nível do mar"
            if (scaledTemp < 5) { // Água muito fria
                return icyWaterTileId;
            }
            return seaTileId;
        } else if (scaledHeight < 10) { // Altura baixa, próxima ao nível do mar
            return coastTileId;
        } else if (scaledHeight > 500) { // Altura elevada (Montanhas)
            // Montanhas podem ter neve no topo se for muito frio
            if (scaledTemp < 0) {
                return snowyTileId; // Neve em montanhas altas
            }
            return mountainTileId;
        } else { // Altura intermediária (terra)
            // Condições de Temperatura e Umidade para biomas terrestres

            // Tundra (Frio, umidade moderada)
            if (scaledTemp < 0 && scaledHumidity >= 30 && scaledHumidity <= 60) {
                return tundraTileId;
            }
            // Neve (Frio e geralmente mais seco)
            if (scaledTemp < 5) {
                 return snowyTileId;
            }
            // Deserto (Quente e seco)
            if (scaledTemp > 30 && scaledHumidity < 30) {
                return desertTileId;
            }
            // Savana (Quente, seco a moderado)
            if (scaledTemp > 25 && scaledHumidity >= 20 && scaledHumidity <= 50) {
                return savannaTileId;
            }
            // Pântano (Quente e muito úmido)
            if (scaledTemp > 20 && scaledHumidity > 70) {
                return swampTileId;
            }
            // Selva (Quente e extremamente úmido)
            if (scaledTemp > 25 && scaledHumidity > 80) {
                return jungleTileId;
            }
            // Floresta (Temperado e úmido)
            if (scaledTemp >= 5 && scaledTemp <= 20 && scaledHumidity > 50) {
                 return forestTileId;
            }
            // Padrão para terra se nenhum bioma específico for correspondido
            return landTileId;
        }
    }

    /**
     * Determina o NOME do bioma com base nos valores ESCALADOS de altura, temperatura e umidade.
     * Esta função é uma réplica da lógica de getTileIdFromBiomes, mas retorna o nome do bioma.
     * @param {number} scaledHeight - Valor de altura escalado.
     * @param {number} scaledTemp - Valor de temperatura escalado.
     * @param {number} scaledHumidity - Valor de umidade escalado.
     * @returns {string} O nome do bioma (ex: "Floresta", "Deserto").
     */
    function getBiomeNameFromEnvironmentalData(scaledHeight, scaledTemp, scaledHumidity) {
        // A lógica é a mesma de getTileIdFromBiomes, mas retornando o nome.
        if (scaledHeight < 0) {
            if (scaledTemp < 5) {
                return "Icy Water";
            }
            return "Sea";
        } else if (scaledHeight < 10) {
            return "Coast";
        } else if (scaledHeight > 500) {
            if (scaledTemp < 0) {
                return "Snowy"; // Snowy Mountain
            }
            return "Mountain";
        } else {
            if (scaledTemp < 0 && scaledHumidity >= 30 && scaledHumidity <= 60) {
                return "Tundra";
            }
            if (scaledTemp < 5) {
                 return "Snowy"; // Snowy Land
            }
            if (scaledTemp > 30 && scaledHumidity < 30) {
                return "Desert";
            }
            if (scaledTemp > 25 && scaledHumidity >= 20 && scaledHumidity <= 50) {
                return "Savanna";
            }
            if (scaledTemp > 20 && scaledHumidity > 70) {
                return "Swamp";
            }
            if (scaledTemp > 25 && scaledHumidity > 80) {
                return "Jungle";
            }
            if (scaledTemp >= 5 && scaledTemp <= 20 && scaledHumidity > 50) {
                 return "Forest";
            }
            return "Land"; // Default land biome
        }
    }


    // ==========================================================================
    // Função Principal de Geração de Chunk
    // ==========================================================================

    /**
     * Gera os dados de tile para um chunk específico.
     * Esta função é chamada pelo WorldGenerationCoordinator.
     * @param {Object} chunkData - O objeto chunkData a ser preenchido.
     * @returns {Object} O objeto chunkData preenchido.
     */
    function generateChunkData(chunkData) {
        const tiles = chunkData.tiles;
        const chunkWidth = chunkData.width;
        const chunkHeight = chunkData.height;
        const chunkXReal = chunkData.chunkX;
        const chunkYReal = chunkData.chunkY;

        for (let y = 0; y < chunkHeight; y++) {
            for (let x = 0; x < chunkWidth; x++) {
                const worldX = chunkXReal * chunkWidth + x;
                const worldY = chunkYReal * chunkHeight + y;

                // 1. Ruído de Altura e Escala
                const heightNoise = getFractalNoise(
                    worldX, worldY,
                    heightNoiseScale, heightNumOctaves, heightLacunarity, heightPersistence
                );
                const normalizedHeight = (heightNoise + 1) / 2; // Normaliza para 0-1
                let scaledHeight = minHeightValue + (maxHeightValue - minHeightValue) * normalizedHeight;

                // 2. Ruído de Temperatura e Escala INICIAL
                const tempNoise = getFractalNoise(
                    worldX, worldY,
                    tempNoiseScale, tempNumOctaves, tempLacunarity, tempPersistence
                );
                const normalizedTemp = (tempNoise + 1) / 2; // Normaliza para 0-1
                let scaledTemp = minTempValue + (maxTempValue - minTempValue) * normalizedTemp;

                // Ajusta a temperatura com base na altura
                if (scaledHeight > 0) {
                    scaledTemp -= scaledHeight * tempLapseRate;
                }
                scaledTemp = Math.max(minTempValue, Math.min(maxTempValue, scaledTemp));


                // 3. Ruído de Umidade e Escala
                const humidityNoise = getFractalNoise(
                    worldX, worldY,
                    humidityNoiseScale, humidityNumOctaves, humidityLacunarity, humidityPersistence
                );
                const normalizedHumidity = (humidityNoise + 1) / 2; // Normaliza para 0-1
                let scaledHumidity = minHumidityValue + (maxHumidityValue - minHumidityValue) * normalizedHumidity;

                const tileIdToApply = getTileIdFromBiomes(scaledHeight, scaledTemp, scaledHumidity);

                tiles[y][x] = tileIdToApply;
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
         const heightNoise = getFractalNoise(
            realX, realY,
            heightNoiseScale, heightNumOctaves, heightLacunarity, heightPersistence
         );
         const normalizedHeight = (heightNoise + 1) / 2;
         let scaledHeight = minHeightValue + (maxHeightValue - minHeightValue) * normalizedHeight;

         const tempNoise = getFractalNoise(
            realX, realY,
            tempNoiseScale, tempNumOctaves, tempLacunarity, tempPersistence
         );
         const normalizedTemp = (tempNoise + 1) / 2;
         let scaledTemp = minTempValue + (maxTempValue - minTempValue) * normalizedTemp;

         // Ajusta a temperatura com base na altura para o EnvironmentVariableUpdater também
         if (scaledHeight > 0) {
            scaledTemp -= scaledHeight * tempLapseRate;
         }
         scaledTemp = Math.max(minTempValue, Math.min(maxTempValue, scaledTemp));


         const humidityNoise = getFractalNoise(
            realX, realY,
            humidityNoiseScale, humidityNumOctaves, humidityLacunarity, humidityPersistence
         );
         const normalizedHumidity = (humidityNoise + 1) / 2;
         let scaledHumidity = minHumidityValue + (maxHumidityValue - minHumidityValue) * normalizedHumidity;


         return {
             height: scaledHeight,
             temp: scaledTemp,
             humidity: scaledHumidity
         };
    }

    /**
     * Retorna o NOME do bioma para uma coordenada global "real".
     * Usado pelo DynamicBiomeRenderer.
     * @param {number} realX - Coordenada X global "real".
     * @param {number} realY - Coordenada Y global "real".
     * @returns {string} O nome do bioma (ex: "Floresta", "Deserto").
     */
    function getBiomeNameForCoords(realX, realY) {
        const { height, temp, humidity } = getEnvironmentDataForCoords(realX, realY);
        return getBiomeNameFromEnvironmentalData(height, temp, humidity);
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
            sea: seaTileId,
            coast: coastTileId,
            land: landTileId,
            mountain: mountainTileId,
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
        getBiomeNameForCoords: getBiomeNameForCoords // Para DynamicBiomeRenderer
    };
    globalThis[pluginName] = window[pluginName];

    if (globalThis.EnvironmentVariableUpdater && globalThis.EnvironmentVariableUpdater.registerDataProvider) {
        globalThis.EnvironmentVariableUpdater.registerDataProvider(pluginName, globalThis[pluginName].getEnvironmentDataForCoords);
    } else {
        if (debugMode) console.warn(`${pluginName}: EnvironmentVariableUpdater não encontrado ou função registerDataProvider não disponível. Variáveis ambientais não serão atualizadas por este plugin.`);
    }


    if (debugMode) console.log(`${pluginName}: Plugin carregado.`);
})();
