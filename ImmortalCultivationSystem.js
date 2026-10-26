//=============================================================================
// RPG Maker MZ - ImmortalCultivationSystem.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc [v1.0.0] Sistema Completo de Cultivo Imortal (Xianxia/Wuxia): 9 Reinos, Meditação com Matriz Bagua, Veios Espirituais, Dantian Interativo e Tribulação Celestial de Raios.
 * @author Antigravity (DeepMind Pair Programming)
 *
 * @help
 * ============================================================================
 *                   IMMORTAL CULTIVATION SYSTEM (XIANXIA / WUXIA)
 * ============================================================================
 * Um sistema completo e visualmente deslumbrante de Cultivo Espiritual que se
 * integra nativamente com:
 *   - DayNightSystem.js (Horário do dia, Fases da Lua e Iluminação de Aura)
 *   - PerlinNoiseGenerator.js / Mapa Procedural (Biomas, Elevação e Rios)
 *   - BasicChunkGenerator.js (Coordenadas reais em mundos infinitos)
 *
 * ----------------------------------------------------------------------------
 * ATALHOS NO MAPA:
 * ----------------------------------------------------------------------------
 *   [C] - Iniciar / Encerrar Meditação em Postura de Lótus no Mapa
 *   [B] - Romper Gargalo / Iniciar Tribulação Celestial (quando Qi = 100%)
 *   [V] - Abrir a Tela do Dantian, Meridianos e Sutras (também no Menu)
 *
 * ----------------------------------------------------------------------------
 * MECÂNICAS PRINCIPAIS:
 * ----------------------------------------------------------------------------
 * 1. 9 GRANDES REINOS DE CULTIVO (Com 4 Camadas/Estágios cada):
 *    - Corpo Mortal -> Refinamento Corporal -> Condensação de Qi ->
 *      Estabelecimento da Fundação -> Formação do Núcleo (Jindan) ->
 *      Alma Nascente (Yuanying) -> Transformação Divina ->
 *      Fusão do Vazio -> Grande Ascensão Imortal (Mahayana).
 *    - Cada avanço concede bônus permanentes reais de HP, MP, ATK, DEF,
 *      MAT, MDF, AGI, LUK e Regeneração Vital/Espiritual!
 *
 * 2. DENSIDADE DE QI AMBIENTAL & VEIOS ESPIRITUAIS PROCEDURAIS:
 *    - A velocidade de absorção de Qi depende da elevação (Picos e Platôs têm
 *      Qi mais puro), proximidade de Rios, Hora do Dia (Aurora Púrpura,
 *      Zênite Yang, Meia-Noite Yin) e Fase da Lua (Lua Cheia amplifica o Qi).
 *    - O mundo possui "Veios Espirituais" (Nodos de Qi Terrestres e Celestiais)
 *      gerados determinísticamente! A Bússola Espiritual no HUD aponta a
 *      direção e distância até o Veio Espiritual mais próximo, que emite
 *      partículas místicas no chão do mapa.
 *
 * 3. RAÍZES ESPIRITUAIS & SUTRAS DE RESPIRAÇÃO:
 *    - 8 Raízes Espirituais com afinidades elementais e climáticas únicas.
 *    - 4 Sutras de Cultivo alternáveis (Equilíbrio, Dragão Devorador,
 *      Lótus Imaculada e Forja do Trovão Divino).
 *
 * 4. PUREZA DA FUNDAÇÃO & TRIBULAÇÃO CELESTIAL:
 *    - Ao atingir 100% de Qi no Ápice de um Reino, romper para o próximo
 *      Grande Reino invoca a TRIBULAÇÃO CELESTIAL no próprio mapa!
 *    - Nuvens negras se formam e Raios Celestiais ramificados caem dos céus.
 *    - Purifique sua Fundação na tela do Dantian [V] para aumentar sua
 *      resistência aos raios e garantir uma ascensão perfeita!
 *
 * ============================================================================
 *
 * @param --- Configurações de HUD ---
 * @default
 *
 * @param ShowCultivationHud
 * @text Exibir HUD de Cultivo no Mapa
 * @parent --- Configurações de HUD ---
 * @type boolean
 * @on SIM
 * @off NÃO
 * @default true
 *
 * @param HudX
 * @text Posição X do HUD
 * @parent --- Configurações de HUD ---
 * @type number
 * @default 20
 *
 * @param HudY
 * @text Posição Y do HUD
 * @parent --- Configurações de HUD ---
 * @type number
 * @default 210
 *
 * @param MenuCommandText
 * @text Nome no Menu Principal
 * @parent --- Configurações de HUD ---
 * @type string
 * @default Cultivo
 *
 * @param --- Atalhos de Teclado ---
 * @default
 *
 * @param MeditateKey
 * @text Tecla para Meditar no Mapa
 * @parent --- Atalhos de Teclado ---
 * @type string
 * @default C
 *
 * @param BreakthroughKey
 * @text Tecla para Romper Reino
 * @parent --- Atalhos de Teclado ---
 * @type string
 * @default B
 *
 * @param CultivationMenuKey
 * @text Tecla da Tela de Dantian
 * @parent --- Atalhos de Teclado ---
 * @type string
 * @default V
 *
 * @param --- Balanceamento de Qi ---
 * @default
 *
 * @param BaseQiGainPerPulse
 * @text Ganho Base de Qi por Pulso
 * @parent --- Balanceamento de Qi ---
 * @type number
 * @min 1
 * @default 15
 *
 * @param PulseIntervalFrames
 * @text Intervalo do Pulso de Respiração (Frames)
 * @parent --- Balanceamento de Qi ---
 * @type number
 * @min 20
 * @default 75
 *
 * @param PassiveQiRatio
 * @text Taxa de Qi Passivo Andando (%)
 * @parent --- Balanceamento de Qi ---
 * @type number
 * @min 0
 * @max 100
 * @default 15
 *
 * @param SyncRealmVariableId
 * @text Variável para Salvar ID do Reino
 * @parent --- Balanceamento de Qi ---
 * @type variable
 * @default 0
 *
 * @command addQi
 * @text Adicionar / Remover Qi
 * @desc Adiciona (ou remove) Qi espiritual do cultivador (ex: uso de Pílulas Espirituais).
 * @arg amount
 * @text Quantidade de Qi
 * @type number
 * @min -999999
 * @max 999999
 * @default 100
 * @arg purityBonus
 * @text Bônus de Pureza (%)
 * @type number
 * @min -100
 * @max 100
 * @default 5
 *
 * @command setRealm
 * @text Definir Reino de Cultivo
 * @desc Define diretamente o Reino (0 a 8) e a Camada/Estágio (0 a 3) do jogador.
 * @arg realmIndex
 * @text Índice do Reino (0-8)
 * @type number
 * @min 0
 * @max 8
 * @default 1
 * @arg stageIndex
 * @text Estágio / Camada (0-3)
 * @type number
 * @min 0
 * @max 3
 * @default 0
 *
 * @command triggerBreakthrough
 * @text Forçar Rompimento / Tribulação
 * @desc Inicia imediatamente a tentativa de rompimento ou Tribulação Celestial no mapa.
 *
 * @command openCultivationScene
 * @text Abrir Tela do Dantian
 * @desc Abre a cena interativa de Cultivo e Meridianos.
 */

(() => {
    "use strict";

    const pluginName = "ImmortalCultivationSystem";
    const parameters = PluginManager.parameters(pluginName);

    const showCultivationHud = String(parameters["ShowCultivationHud"] !== undefined ? parameters["ShowCultivationHud"] : "true") === "true";
    const hudX = Number(parameters["HudX"] !== undefined ? parameters["HudX"] : 20);
    const hudY = Number(parameters["HudY"] !== undefined ? parameters["HudY"] : 210);
    const menuCommandText = String(parameters["MenuCommandText"] || "Cultivo");

    const meditateKeyChar = String(parameters["MeditateKey"] || "C").toUpperCase();
    const breakthroughKeyChar = String(parameters["BreakthroughKey"] || "B").toUpperCase();
    const cultMenuKeyChar = String(parameters["CultivationMenuKey"] || "V").toUpperCase();

    const baseQiGainPerPulse = Math.max(1, Number(parameters["BaseQiGainPerPulse"] || 15));
    const pulseIntervalFrames = Math.max(20, Number(parameters["PulseIntervalFrames"] || 75));
    const passiveQiRatio = Math.max(0, Math.min(100, Number(parameters["PassiveQiRatio"] !== undefined ? parameters["PassiveQiRatio"] : 15))) / 100;
    const syncRealmVarId = Number(parameters["SyncRealmVariableId"] || 0);

    // Mapeamento seguro de teclas sem colidir com M (77) e F (70) do ProceduralWorldMap
    const KEY_MAP = {
        "C": 67, "B": 66, "V": 86, "N": 78, "G": 71, "H": 72, "J": 74, "K": 75, "L": 76, "P": 80, "R": 82, "T": 84, "Y": 89
    };
    if (KEY_MAP[meditateKeyChar]) Input.keyMapper[KEY_MAP[meditateKeyChar]] = "cultivateMeditate";
    if (KEY_MAP[breakthroughKeyChar]) Input.keyMapper[KEY_MAP[breakthroughKeyChar]] = "cultivateBreakthrough";
    if (KEY_MAP[cultMenuKeyChar]) Input.keyMapper[KEY_MAP[cultMenuKeyChar]] = "cultivateScene";

    // =========================================================================
    // 1. DEFINIÇÃO DOS 9 REINOS IMORTAIS, RAÍZES ESPIRITUAIS E SUTRAS
    // =========================================================================

    const CULTIVATION_REALMS = [
        {
            id: 0,
            name: "Corpo Mortal",
            title: "Mortal Comum",
            color: "#adb5bd",
            glowColor: "#ced4da",
            rgb: [173, 181, 189],
            baseMaxQi: 100,
            stageMultiplier: 1.0,
            tribulationWaves: 0,
            statBonus: { mhp: 0, mmp: 0, atk: 0, def: 0, mat: 0, mdf: 0, agi: 0, luk: 0 },
            regenHp: 0.00,
            regenMp: 0.00,
            desc: "Um vaso mortal cujos meridianos ainda estão obstruídos pelas impurezas mundanas."
        },
        {
            id: 1,
            name: "Refinamento Corporal",
            title: "Discípulo Marcial",
            color: "#e6994c",
            glowColor: "#ffc078",
            rgb: [230, 153, 76],
            baseMaxQi: 220,
            stageMultiplier: 1.45,
            tribulationWaves: 1,
            statBonus: { mhp: 120, mmp: 30, atk: 12, def: 12, mat: 8, mdf: 8, agi: 6, luk: 5 },
            regenHp: 0.01,
            regenMp: 0.01,
            desc: "Tempera a pele, músculos, tendões e medula óssea com energia vital bruta."
        },
        {
            id: 2,
            name: "Condensação de Qi",
            title: "Cultivador de Qi",
            color: "#38d9a9",
            glowColor: "#63e6be",
            rgb: [56, 217, 169],
            baseMaxQi: 550,
            stageMultiplier: 1.55,
            tribulationWaves: 2,
            statBonus: { mhp: 350, mmp: 120, atk: 28, def: 25, mat: 32, mdf: 28, agi: 16, luk: 12 },
            regenHp: 0.02,
            regenMp: 0.03,
            desc: "Abre o Mar de Qi no Dantian Inferior, absorvendo a essência espiritual do Céu e da Terra."
        },
        {
            id: 3,
            name: "Estabelecimento da Fundação",
            title: "Mestre do Dao",
            color: "#4dabf7",
            glowColor: "#74c0fc",
            rgb: [77, 171, 247],
            baseMaxQi: 1400,
            stageMultiplier: 1.65,
            tribulationWaves: 3,
            statBonus: { mhp: 850, mmp: 320, atk: 65, def: 60, mat: 75, mdf: 68, agi: 35, luk: 25 },
            regenHp: 0.03,
            regenMp: 0.04,
            desc: "Liquefaz o Qi gasoso em um Pilar Dao inabalável, transcendendo a longevidade mortal."
        },
        {
            id: 4,
            name: "Formação do Núcleo",
            title: "Grão-Mestre Jindan",
            color: "#ffd43b",
            glowColor: "#ffec99",
            rgb: [255, 212, 59],
            baseMaxQi: 3600,
            stageMultiplier: 1.75,
            tribulationWaves: 4,
            statBonus: { mhp: 2100, mmp: 800, atk: 150, def: 140, mat: 180, mdf: 160, agi: 75, luk: 55 },
            regenHp: 0.04,
            regenMp: 0.06,
            desc: "Cristaliza todo o cultivo em um Núcleo Dourado Imortal que pulsa em harmonia com o cosmos."
        },
        {
            id: 5,
            name: "Alma Nascente",
            title: "Ancestral Yuanying",
            color: "#b197fc",
            glowColor: "#d0bfff",
            rgb: [177, 151, 252],
            baseMaxQi: 9000,
            stageMultiplier: 1.85,
            tribulationWaves: 5,
            statBonus: { mhp: 5000, mmp: 2000, atk: 340, def: 310, mat: 420, mdf: 380, agi: 150, luk: 110 },
            regenHp: 0.06,
            regenMp: 0.08,
            desc: "O Núcleo Dourado se rompe para dar à luz uma Alma Nascente divina capaz de existir além da carne."
        },
        {
            id: 6,
            name: "Transformação Divina",
            title: "Soberano Espiritual",
            color: "#ff6b6b",
            glowColor: "#ffa8a8",
            rgb: [255, 107, 107],
            baseMaxQi: 22000,
            stageMultiplier: 1.95,
            tribulationWaves: 6,
            statBonus: { mhp: 12000, mmp: 5000, atk: 750, def: 680, mat: 920, mdf: 840, agi: 300, luk: 220 },
            regenHp: 0.08,
            regenMp: 0.10,
            desc: "A consciência divina funde-se às Leis da Natureza; cada gesto comanda a força primordial do mundo."
        },
        {
            id: 7,
            name: "Fusão do Vazio",
            title: "Monarca do Vazio",
            color: "#748ffc",
            glowColor: "#bac8ff",
            rgb: [116, 143, 252],
            baseMaxQi: 55000,
            stageMultiplier: 2.05,
            tribulationWaves: 7,
            statBonus: { mhp: 28000, mmp: 12000, atk: 1600, def: 1500, mat: 2000, mdf: 1850, agi: 600, luk: 450 },
            regenHp: 0.10,
            regenMp: 0.12,
            desc: "Compreende o Grande Vazio Espacial, dobrando o tecido da realidade sob sua vontade imortal."
        },
        {
            id: 8,
            name: "Grande Ascensão",
            title: "Imortal Celestial",
            color: "#fff3bf",
            glowColor: "#ffffff",
            rgb: [255, 243, 191],
            baseMaxQi: 150000,
            stageMultiplier: 2.20,
            tribulationWaves: 9,
            statBonus: { mhp: 65000, mmp: 30000, atk: 3800, def: 3500, mat: 4500, mdf: 4200, agi: 1200, luk: 999 },
            regenHp: 0.15,
            regenMp: 0.15,
            desc: "Ápice do mundo mortal. Os portões do Reino Imortal se abrem perante sua presença."
        }
    ];

    const STAGE_NAMES = [
        "1ª Camada (Inicial)",
        "4ª Camada (Intermediário)",
        "7ª Camada (Avançado)",
        "9ª Camada (Grande Perfeição)"
    ];

    const SPIRITUAL_ROOTS = [
        {
            id: "wood",
            name: "Raiz da Madeira Primordial",
            element: "Madeira / Vida",
            color: "#51cf66",
            favoredBiomes: ["Plains", "Land", "Forest", "Jungle"],
            favoredTime: "dawn",
            qiMultiplier: 1.20,
            tribulationResist: 0.10,
            statScale: { mhp: 1.25, mmp: 1.10, atk: 1.00, def: 1.10, mat: 1.10, mdf: 1.15, agi: 1.05, luk: 1.10 },
            desc: "Ressonância suprema com florestas, planícies e a vitalidade da aurora (+25% HP, +Purificação)."
        },
        {
            id: "fire",
            name: "Raiz do Fogo Solar (Yang)",
            element: "Fogo / Yang",
            color: "#ff6b6b",
            favoredBiomes: ["Desert", "Savanna", "Plateau1", "Plateau2"],
            favoredTime: "noon",
            qiMultiplier: 1.25,
            tribulationResist: 0.08,
            statScale: { mhp: 1.05, mmp: 1.05, atk: 1.30, def: 0.95, mat: 1.30, mdf: 1.00, agi: 1.15, luk: 1.00 },
            desc: "Ferve com o poder explosivo do Sol a pino (+30% ATK/MAT, absorção acelerada durante o dia)."
        },
        {
            id: "water",
            name: "Raiz da Água Abissal (Yin)",
            element: "Água / Yin",
            color: "#339af0",
            favoredBiomes: ["River", "Sea", "Coast", "Swamp", "Icy Water"],
            favoredTime: "night",
            qiMultiplier: 1.25,
            tribulationResist: 0.15,
            statScale: { mhp: 1.10, mmp: 1.35, atk: 0.95, def: 1.05, mat: 1.25, mdf: 1.25, agi: 1.10, luk: 1.10 },
            desc: "Profunda e serena como o abismo oceânico. Amplificada perto de rios e sob a Lua Cheia (+35% MP)."
        },
        {
            id: "earth",
            name: "Raiz da Montanha Imortal",
            element: "Terra / Rocha",
            color: "#fcc419",
            favoredBiomes: ["Plateau1", "Plateau2", "Cliff", "Mountain", "Hills", "LowHills", "HighPlateau"],
            favoredTime: "dusk",
            qiMultiplier: 1.18,
            tribulationResist: 0.30,
            statScale: { mhp: 1.30, mmp: 1.00, atk: 1.10, def: 1.35, mat: 0.95, mdf: 1.25, agi: 0.90, luk: 1.05 },
            desc: "Inabalável como as cordilheiras ancestrais. Concede enorme defesa e +30% resistência à Tribulação."
        },
        {
            id: "thunder",
            name: "Raiz Celestial do Trovão",
            element: "Trovão (Mutada)",
            color: "#cc5de8",
            favoredBiomes: ["Peak", "Plateau2", "Cliff", "Mountain"],
            favoredTime: "storm",
            qiMultiplier: 1.35,
            tribulationResist: 0.45,
            statScale: { mhp: 1.05, mmp: 1.15, atk: 1.35, def: 1.00, mat: 1.35, mdf: 1.10, agi: 1.35, luk: 1.10 },
            desc: "Raiz mutada rara das alturas. Absorve a fúria dos céus (+45% resistência a Raios da Tribulação)."
        },
        {
            id: "chaos",
            name: "Corpo do Caos Primordial",
            element: "Yin-Yang / Caos",
            color: "#ffd43b",
            favoredBiomes: ["ALL"],
            favoredTime: "all",
            qiMultiplier: 1.40,
            tribulationResist: 0.25,
            statScale: { mhp: 1.20, mmp: 1.20, atk: 1.20, def: 1.20, mat: 1.20, mdf: 1.20, agi: 1.20, luk: 1.25 },
            desc: "Constituição lendária que harmoniza Yin e Yang em qualquer bioma ou horário (+20% em tudo)."
        }
    ];

    const BREATHING_SUTRAS = [
        {
            id: "celestial_harmony",
            name: "Sutra da Harmonia Celestial",
            style: "Equilíbrio Ortodoxo",
            color: "#63e6be",
            qiRateMult: 1.15,
            purityPerPulse: 0.8,
            tribulationShield: 0.15,
            statMod: { atk: 1.05, def: 1.05, mat: 1.05, mdf: 1.05, agi: 1.05 },
            desc: "Técnica ancestral equilibrada. Aumenta a absorção de Qi (+15%) e refina a Fundação suavemente."
        },
        {
            id: "devouring_dragon",
            name: "Escritura do Dragão Devorador",
            style: "Supremacia Ofensiva",
            color: "#ff6b6b",
            qiRateMult: 1.45,
            purityPerPulse: -0.3,
            tribulationShield: 0.00,
            statMod: { atk: 1.25, def: 0.95, mat: 1.25, mdf: 0.95, agi: 1.15 },
            desc: "Devora o Qi ambiental com ferocidade (+45% velocidade de Qi, +25% ATK/MAT), mas gera leves impurezas."
        },
        {
            id: "immaculate_lotus",
            name: "Mantra da Lótus Imaculada",
            style: "Purificação & Cura",
            color: "#74c0fc",
            qiRateMult: 1.00,
            purityPerPulse: 2.5,
            tribulationShield: 0.25,
            statMod: { atk: 0.95, def: 1.20, mat: 1.10, mdf: 1.25, agi: 1.00 },
            desc: "Purifica o Dantian rapidamente (+2.5% Pureza/pulso), regenera muita vida e protege na Tribulação."
        },
        {
            id: "primordial_thunder",
            name: "Arte da Forja do Trovão Divino",
            style: "Temperamento Celestial",
            color: "#ffd43b",
            qiRateMult: 1.20,
            purityPerPulse: 1.0,
            tribulationShield: 0.40,
            statMod: { atk: 1.15, def: 1.15, mat: 1.15, mdf: 1.15, agi: 1.25 },
            desc: "Usa arcos voltaicos espirituais para temperar os meridianos. Reduz em 40% o dano da Tribulação."
        }
    ];

    // =========================================================================
    // 2. SISTEMA DE VEIOS ESPIRITUAIS PROCEDURAIS & DENSIDADE DE QI AMBIENTAL
    // =========================================================================

    function hash2D(x, y, seed = 777) {
        let h = Math.imul(x ^ seed, 374761393) + Math.imul(y ^ (seed * 13), 668265263);
        h = (h ^ (h >>> 13)) * 1274126177;
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }

    /**
     * Cada célula de grade de 16x16 tiles possui exatamente 1 Nodo/Veio Espiritual determinístico.
     */
    function getSpiritVeinInCell(cellX, cellY) {
        const mapId = (typeof $gameMap !== "undefined" && $gameMap) ? $gameMap.mapId() : 1;
        const r1 = hash2D(cellX, cellY, mapId * 131 + 17);
        const r2 = hash2D(cellX, cellY, mapId * 257 + 89);
        const r3 = hash2D(cellX, cellY, mapId * 521 + 33);

        const localX = Math.floor(r1 * 14) + 1;
        const localY = Math.floor(r2 * 14) + 1;
        const veinX = cellX * 16 + localX;
        const veinY = cellY * 16 + localY;

        let grade = 1;
        let name = "Nodo Espiritual Menor";
        let multiplier = 1.85;
        let color = "#63e6be";

        if (r3 > 0.90) {
            grade = 3;
            name = "Olho Espiritual Celestial";
            multiplier = 3.50;
            color = "#ffd43b";
        } else if (r3 > 0.60) {
            grade = 2;
            name = "Veio Espiritual Terrestre";
            multiplier = 2.50;
            color = "#74c0fc";
        }

        return { x: veinX, y: veinY, grade, name, multiplier, color };
    }

    function getRealPlayerCoords() {
        if (globalThis.BasicChunkGenerator && typeof globalThis.BasicChunkGenerator.getRealPlayerCoordinates === "function") {
            const coords = globalThis.BasicChunkGenerator.getRealPlayerCoordinates();
            if (coords && typeof coords.x === "number" && !isNaN(coords.x)) {
                return coords;
            }
        }
        if (typeof $gamePlayer !== "undefined" && $gamePlayer) {
            return { x: $gamePlayer.x, y: $gamePlayer.y };
        }
        return { x: 0, y: 0 };
    }

    function findNearestSpiritVein(realX, realY) {
        const baseCellX = Math.floor(realX / 16);
        const baseCellY = Math.floor(realY / 16);
        let best = null;
        let minDist = Infinity;

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const vein = getSpiritVeinInCell(baseCellX + dx, baseCellY + dy);
                const dist = Math.hypot(vein.x - realX, vein.y - realY);
                if (dist < minDist) {
                    minDist = dist;
                    best = { ...vein, distance: dist, dx: vein.x - realX, dy: vein.y - realY };
                }
            }
        }
        return best;
    }

    function getDirectionLabel(dx, dy) {
        if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return "AQUI";
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle >= -22.5 && angle < 22.5) return "Leste →";
        if (angle >= 22.5 && angle < 67.5) return "Sudeste ↘";
        if (angle >= 67.5 && angle < 112.5) return "Sul ↓";
        if (angle >= 112.5 && angle < 157.5) return "Sudoeste ↙";
        if (angle >= 157.5 || angle < -157.5) return "Oeste ←";
        if (angle >= -157.5 && angle < -112.5) return "Noroeste ↖";
        if (angle >= -112.5 && angle < -67.5) return "Norte ↑";
        return "Nordeste ↗";
    }

    /**
     * Analisa o ambiente completo no tile atual (Bioma, Elevação, Hora do Dia, Fase da Lua e Veio Espiritual).
     */
    function analyzeEnvironmentAt(realX, realY) {
        let biomeName = "Plains";
        let biomeLabel = "Planície Verdejante";
        let elevationBonus = 1.0;

        // 1. Leitura direta do Tile no $dataMap (funciona em mapas estáticos exportados e dinâmicos)
        if (typeof $gameMap !== "undefined" && $gameMap && typeof $dataMap !== "undefined" && $dataMap && $dataMap.data) {
            const w = $dataMap.width;
            const h = $dataMap.height;
            const mx = ((realX % w) + w) % w;
            const my = ((realY % h) + h) % h;
            const t0 = $dataMap.data[my * w + mx] || 0;
            const t1 = $dataMap.data[(h + my) * w + mx] || 0;

            const base0 = t0 >= 2048 ? Math.floor((t0 - 2048) / 48) * 48 + 2048 : t0;
            const base1 = t1 >= 2048 ? Math.floor((t1 - 2048) / 48) * 48 + 2048 : t1;

            if (base1 >= 8000 || base0 === 4352) {
                biomeName = "Cliff";
                biomeLabel = "Escarpa Espiritual";
                elevationBonus = 1.35;
            } else if (base0 === 2048 || base0 === 2096 || base0 === 2528) {
                biomeName = "River";
                biomeLabel = "Margem de Águas Espirituais";
                elevationBonus = 1.25;
            } else if (base0 === 3008 || base0 === 3152 || base0 === 4016) {
                biomeName = "Peak";
                biomeLabel = "Cume Celestial";
                elevationBonus = 1.50;
            } else if (base0 === 2960) {
                biomeName = "Plateau2";
                biomeLabel = "Platô Superior";
                elevationBonus = 1.35;
            } else if (base0 === 2912 || base0 === 3104) {
                biomeName = "Plateau1";
                biomeLabel = "Colinas Elevadas";
                elevationBonus = 1.20;
            } else if (base0 === 2864) {
                biomeName = "Forest";
                biomeLabel = "Bosque Antigo";
                elevationBonus = 1.15;
            }
        }

        // Complemento do PerlinNoiseGenerator se estiver ativo
        if (globalThis.PerlinNoiseGenerator && typeof globalThis.PerlinNoiseGenerator.getEnvironmentDataForCoords === "function") {
            try {
                const env = globalThis.PerlinNoiseGenerator.getEnvironmentDataForCoords(realX, realY);
                if (env) {
                    if (env.isRiver) {
                        biomeName = "River";
                        biomeLabel = "Leito de Rio Espiritual";
                        elevationBonus = Math.max(elevationBonus, 1.25);
                    } else if (env.level >= 2) {
                        biomeName = "Plateau2";
                        biomeLabel = "Platô Elevado";
                        elevationBonus = Math.max(elevationBonus, 1.40);
                    } else if (env.level === 1) {
                        biomeName = "Plateau1";
                        biomeLabel = "Terraço Espiritual";
                        elevationBonus = Math.max(elevationBonus, 1.20);
                    }
                }
            } catch (e) { /* Fallback seguro */ }
        }

        // 2. Integração com DayNightSystem (Hora do Dia e Fase da Lua)
        let timeMultiplier = 1.0;
        let timePhenomenon = "Fluxo Qi Normal";
        let timeKey = "day";

        if (typeof $gameSystem !== "undefined" && $gameSystem && typeof $gameSystem.dayNightHour === "function") {
            const hour = $gameSystem.dayNightHour();
            const moonPhase = typeof $gameSystem.dayNightMoonPhase === "function" ? $gameSystem.dayNightMoonPhase() : 2;
            const moonName = typeof $gameSystem.dayNightMoonName === "function" ? $gameSystem.dayNightMoonName() : "Lua";

            if (hour >= 5 && hour <= 7) {
                timeMultiplier = 1.35;
                timePhenomenon = "Qi Púrpura do Leste (Aurora)";
                timeKey = "dawn";
            } else if (hour >= 11 && hour <= 13) {
                timeMultiplier = 1.30;
                timePhenomenon = "Zênite Yang Solar";
                timeKey = "noon";
            } else if (hour >= 17 && hour <= 19) {
                timeMultiplier = 1.15;
                timePhenomenon = "Crepúsculo Dourado";
                timeKey = "dusk";
            } else if (hour >= 20 || hour <= 4) {
                timeKey = "night";
                if (moonPhase === 4) {
                    timeMultiplier = 1.60;
                    timePhenomenon = "Maré Yin de Lua Cheia";
                } else if (moonPhase === 0) {
                    timeMultiplier = 1.25;
                    timePhenomenon = "Vazio Yin de Lua Nova";
                } else {
                    timeMultiplier = 1.20;
                    timePhenomenon = `Serenidade Noturna (${moonName})`;
                }
            }
        }

        // 3. Proximidade de Veio Espiritual
        const nearestVein = findNearestSpiritVein(realX, realY);
        let veinBonus = 1.0;
        let activeVein = null;

        if (nearestVein) {
            if (nearestVein.distance <= 1.5) {
                veinBonus = nearestVein.multiplier;
                activeVein = nearestVein;
            } else if (nearestVein.distance <= 3.5) {
                veinBonus = 1.0 + (nearestVein.multiplier - 1.0) * 0.45;
                activeVein = nearestVein;
            }
        }

        const totalDensity = +(elevationBonus * timeMultiplier * veinBonus).toFixed(2);

        return {
            biomeName,
            biomeLabel,
            elevationBonus,
            timeMultiplier,
            timePhenomenon,
            timeKey,
            nearestVein,
            activeVein,
            veinBonus,
            totalDensity
        };
    }

    // =========================================================================
    // 3. ESTADO DE CULTIVO NO GAME_SYSTEM E BÔNUS REAIS NO GAME_ACTOR
    // =========================================================================

    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this.initCultivationData();
    };

    Game_System.prototype.initCultivationData = function() {
        if (this._cultivationData) return;
        this._cultivationData = {
            realmIndex: 1,         // Começa em Refinamento Corporal (1ª Camada) para já sentir o poder místico
            stageIndex: 0,         // 0 a 3
            currentQi: 0,
            foundationPurity: 75,  // 0 a 100%
            rootIndex: 0,          // Índice em SPIRITUAL_ROOTS
            sutraIndex: 0,         // Índice em BREATHING_SUTRAS
            totalBreakthroughs: 0,
            meditating: false
        };
    };

    Game_System.prototype.cultivation = function() {
        this.initCultivationData();
        return this._cultivationData;
    };

    Game_System.prototype.currentRealmObj = function() {
        const c = this.cultivation();
        return CULTIVATION_REALMS[Math.max(0, Math.min(CULTIVATION_REALMS.length - 1, c.realmIndex))];
    };

    Game_System.prototype.currentStageName = function() {
        const c = this.cultivation();
        if (c.realmIndex === 0) return "Estágio Único";
        return STAGE_NAMES[Math.max(0, Math.min(STAGE_NAMES.length - 1, c.stageIndex))];
    };

    Game_System.prototype.currentSpiritualRoot = function() {
        const c = this.cultivation();
        return SPIRITUAL_ROOTS[Math.max(0, Math.min(SPIRITUAL_ROOTS.length - 1, c.rootIndex))];
    };

    Game_System.prototype.currentSutra = function() {
        const c = this.cultivation();
        return BREATHING_SUTRAS[Math.max(0, Math.min(BREATHING_SUTRAS.length - 1, c.sutraIndex))];
    };

    Game_System.prototype.maxQiForCurrentStage = function() {
        const c = this.cultivation();
        const realm = this.currentRealmObj();
        if (c.realmIndex === 0) return realm.baseMaxQi;
        return Math.round(realm.baseMaxQi * Math.pow(realm.stageMultiplier, c.stageIndex));
    };

    Game_System.prototype.isBottleneckReached = function() {
        const c = this.cultivation();
        return c.currentQi >= this.maxQiForCurrentStage();
    };

    Game_System.prototype.isMajorRealmBottleneck = function() {
        const c = this.cultivation();
        if (c.realmIndex >= CULTIVATION_REALMS.length - 1 && c.stageIndex >= 3) return false;
        return c.realmIndex === 0 || c.stageIndex >= 3;
    };

    Game_System.prototype.gainCultivationQi = function(amount, purityDelta = 0) {
        const c = this.cultivation();
        const maxQi = this.maxQiForCurrentStage();
        c.currentQi = Math.max(0, Math.min(maxQi, Math.round(c.currentQi + amount)));
        if (purityDelta !== 0) {
            c.foundationPurity = Math.max(10, Math.min(100, +(c.foundationPurity + purityDelta).toFixed(1)));
        }
        if (syncRealmVarId > 0 && typeof $gameVariables !== "undefined" && $gameVariables) {
            $gameVariables.setValue(syncRealmVarId, c.realmIndex);
        }
    };

    Game_System.prototype.calculateCultivationStatBonus = function(paramId, realmIdx, stageIdx, purity) {
        const realm = CULTIVATION_REALMS[Math.max(0, Math.min(CULTIVATION_REALMS.length - 1, realmIdx))];
        const root = this.currentSpiritualRoot();
        const sutra = this.currentSutra();

        const keys = ["mhp", "mmp", "atk", "def", "mat", "mdf", "agi", "luk"];
        const key = keys[paramId];
        if (!key || !realm.statBonus[key]) return 0;

        // Progressão por sub-estágio (1.0x, 1.25x, 1.55x, 1.90x do bônus base do Reino)
        const stageScale = realmIdx === 0 ? 1.0 : (1.0 + stageIdx * 0.28);
        const purityScale = 0.85 + (Math.max(0, Math.min(100, purity)) / 100) * 0.30;
        const rootScale = (root.statScale && root.statScale[key]) ? root.statScale[key] : 1.0;
        const sutraScale = (sutra.statMod && sutra.statMod[key]) ? sutra.statMod[key] : 1.0;

        return Math.round(realm.statBonus[key] * stageScale * purityScale * rootScale * sutraScale);
    };

    // Integração com os atributos reais do Jogador / Líder do Grupo
    const _Game_Actor_paramPlus = Game_Actor.prototype.paramPlus;
    Game_Actor.prototype.paramPlus = function(paramId) {
        let value = _Game_Actor_paramPlus.call(this, paramId);
        if (typeof $gameSystem !== "undefined" && $gameSystem && typeof $gameParty !== "undefined" && $gameParty) {
            if (this === $gameParty.leader() || this.actorId() === 1) {
                const c = $gameSystem.cultivation();
                value += $gameSystem.calculateCultivationStatBonus(paramId, c.realmIndex, c.stageIndex, c.foundationPurity);
            }
        }
        return value;
    };

    const _Game_Actor_xparam = Game_Actor.prototype.xparam;
    Game_Actor.prototype.xparam = function(xparamId) {
        let value = _Game_Actor_xparam.call(this, xparamId);
        if (typeof $gameSystem !== "undefined" && $gameSystem && (this.actorId() === 1 || (typeof $gameParty !== "undefined" && $gameParty && this === $gameParty.leader()))) {
            const realm = $gameSystem.currentRealmObj();
            const sutra = $gameSystem.currentSutra();
            // 7 = HRG (HP Regen), 8 = MRG (MP Regen)
            if (xparamId === 7) {
                value += realm.regenHp * (sutra.id === "immaculate_lotus" ? 1.5 : 1.0);
            } else if (xparamId === 8) {
                value += realm.regenMp * (sutra.id === "immaculate_lotus" ? 1.5 : 1.0);
            }
        }
        return value;
    };

    // =========================================================================
    // 4. INTEGRAÇÃO DE LUZ COM DAYNIGHTSYSTEM & BLOQUEIO DE MOVIMENTO NA MEDITAÇÃO
    // =========================================================================

    const _Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        if (typeof $gameSystem !== "undefined" && $gameSystem && $gameSystem.cultivation().meditating) {
            return false;
        }
        if (CultivationManager.isTribulationActive()) {
            return false;
        }
        return _Game_Player_canMove.call(this);
    };

    // Injeta halo de luz espiritual colorido no DayNightSystem quando meditando ou em tribulação à noite!
    if (typeof Spriteset_Map !== "undefined" && Spriteset_Map.prototype.updateDayNightLighting) {
        const _Spriteset_Map_updateDayNightLighting = Spriteset_Map.prototype.updateDayNightLighting;
        Spriteset_Map.prototype.updateDayNightLighting = function() {
            _Spriteset_Map_updateDayNightLighting.call(this);
            if (!this._dayNightOverlayBitmap || typeof $gameSystem === "undefined" || !$gameSystem) return;

            const isMed = $gameSystem.cultivation().meditating;
            const isTrib = CultivationManager.isTribulationActive();
            if (!isMed && !isTrib) return;

            const ctx = this._dayNightOverlayBitmap.context;
            const px = $gamePlayer.screenX();
            const py = $gamePlayer.screenY() - 16;
            const realm = $gameSystem.currentRealmObj();
            const pulse = 1.0 + Math.sin((Graphics.frameCount || 0) * 0.08) * 0.15;
            const radius = (isTrib ? 220 : 145) * pulse;

            ctx.save();
            ctx.globalCompositeOperation = "destination-out";
            if (typeof this.drawSoftLightHole === "function") {
                this.drawSoftLightHole(ctx, px, py, radius, 0.85);
            }
            ctx.restore();

            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            if (typeof this.drawColorLightAura === "function") {
                this.drawColorLightAura(ctx, px, py, radius * 1.15, realm.color, isTrib ? 1.6 : 1.1);
            }
            ctx.restore();
            this._dayNightOverlayBitmap._baseTexture.update();
        };
    }

    // =========================================================================
    // 5. GERENCIADOR DE MEDITAÇÃO, POPUPS FLUTUANTES E TRIBULAÇÃO CELESTIAL
    // =========================================================================

    function playSafeSe(name, volume = 80, pitch = 100) {
        try {
            AudioManager.playSe({ name, volume, pitch, pan: 0 });
        } catch (e) { /* Ignora se áudio ausente */ }
    }

    class CultivationManager {
        static _pulseTimer = 0;
        static _floatingTexts = [];
        static _shockwaves = [];
        static _lightningBolts = [];
        static _ascensionPillar = null;
        static _bannerData = null;
        static _tribulationState = null;

        static isTribulationActive() {
            return !!this._tribulationState;
        }

        static addFloatingText(text, color = "#63e6be", offsetY = -42, scale = 1.0) {
            if (typeof $gamePlayer === "undefined" || !$gamePlayer) return;
            this._floatingTexts.push({
                text,
                color,
                worldX: $gamePlayer._realX,
                worldY: $gamePlayer._realY,
                offsetY,
                alpha: 1.0,
                scale,
                age: 0,
                maxAge: 75
            });
        }

        static triggerShockwave(color = "#63e6be", maxRadius = 110, duration = 40) {
            if (typeof $gamePlayer === "undefined" || !$gamePlayer) return;
            this._shockwaves.push({
                worldX: $gamePlayer._realX,
                worldY: $gamePlayer._realY,
                color,
                radius: 8,
                maxRadius,
                age: 0,
                maxAge: duration
            });
        }

        static toggleMeditation() {
            if (!($gameSystem && $gamePlayer)) return;
            if (this.isTribulationActive()) return;

            const c = $gameSystem.cultivation();
            c.meditating = !c.meditating;
            this._pulseTimer = 0;

            if (c.meditating) {
                $gamePlayer.setDirection(2); // Olha para frente em postura de lótus
                const realm = $gameSystem.currentRealmObj();
                playSafeSe("Bell1", 75, 110);
                this.triggerShockwave(realm.color, 85, 35);
                this.addFloatingText("Postura de Lótus: Meditando", realm.glowColor, -48, 1.05);
            } else {
                playSafeSe("Wind7", 60, 120);
                this.addFloatingText("Meditação Encerrada", "#ced4da", -42, 0.95);
            }
        }

        static updateMapCultivation() {
            if (typeof $gameSystem === "undefined" || !$gameSystem || typeof $gamePlayer === "undefined" || !$gamePlayer) return;

            // 1. Atualiza estado de Tribulação Celestial se ativo
            if (this._tribulationState) {
                this.updateTribulation();
                return;
            }

            const c = $gameSystem.cultivation();

            // Se o jogador apertar direcionais ou Esc enquanto medita, sai da meditação suavemente
            if (c.meditating && (Input.isTriggered("cancel") || Input.isTriggered("ok") || Input.dir4 !== 0)) {
                if (Input.isTriggered("cancel")) {
                    this.toggleMeditation();
                    return;
                }
            }

            // 2. Pulso de Respiração de Qi (Ativo na Meditação ou Passivo caminhando)
            this._pulseTimer++;
            const interval = c.meditating ? pulseIntervalFrames : Math.round(pulseIntervalFrames * 2.2);

            if (this._pulseTimer >= interval) {
                this._pulseTimer = 0;
                this.executeBreathingPulse(c.meditating);
            }
        }

        static executeBreathingPulse(isMeditating) {
            const c = $gameSystem.cultivation();
            const root = $gameSystem.currentSpiritualRoot();
            const sutra = $gameSystem.currentSutra();
            const realm = $gameSystem.currentRealmObj();
            const coords = getRealPlayerCoords();
            const env = analyzeEnvironmentAt(coords.x, coords.y);

            // Bônus de afinidade da Raiz Espiritual com o Bioma e Horário atuais
            let rootEnvBonus = root.qiMultiplier;
            if (root.favoredBiomes.includes("ALL") || root.favoredBiomes.includes(env.biomeName)) {
                rootEnvBonus += 0.25;
            }
            if (root.favoredTime === "all" || root.favoredTime === env.timeKey) {
                rootEnvBonus += 0.20;
            }

            const modeRatio = isMeditating ? 1.0 : passiveQiRatio;
            if (modeRatio <= 0) return;

            const realmScale = 1.0 + c.realmIndex * 0.65 + c.stageIndex * 0.20;
            const rawGain = baseQiGainPerPulse * realmScale * env.totalDensity * rootEnvBonus * sutra.qiRateMult * modeRatio;
            const finalGain = Math.max(1, Math.round(rawGain));

            const wasAtBottleneck = $gameSystem.isBottleneckReached();
            const purityDelta = isMeditating ? sutra.purityPerPulse : 0;

            $gameSystem.gainCultivationQi(finalGain, purityDelta);

            // Regeneração extra durante a meditação
            const leader = $gameParty ? $gameParty.leader() : null;
            if (isMeditating && leader) {
                const hpHeal = Math.max(1, Math.round(leader.mhp * (0.03 + realm.regenHp)));
                const mpHeal = Math.max(1, Math.round(leader.mmp * (0.04 + realm.regenMp)));
                leader.gainHp(hpHeal);
                leader.gainMp(mpHeal);
            }

            if (isMeditating) {
                if (!$gameSystem.isBottleneckReached()) {
                    const veinTag = env.activeVein ? ` [${env.activeVein.name}]` : "";
                    this.addFloatingText(`+${finalGain} Qi${veinTag}`, realm.glowColor, -42, 1.0);
                    this.triggerShockwave(realm.color, 64, 30);
                } else if (!wasAtBottleneck) {
                    playSafeSe("Chime2", 85, 110);
                    this.triggerShockwave("#ffd43b", 120, 45);
                    this.addFloatingText("Gargalo Atingido! Pressione [B] para Romper!", "#ffd43b", -54, 1.15);
                } else if (c.foundationPurity < 100 && sutra.purityPerPulse > 0) {
                    this.addFloatingText(`Fundação Purificada: ${c.foundationPurity.toFixed(0)}%`, "#74c0fc", -42, 0.95);
                }
            }
        }

        static attemptBreakthrough() {
            if (!($gameSystem && $gamePlayer)) return;
            if (this.isTribulationActive()) return;

            const c = $gameSystem.cultivation();
            if (c.realmIndex >= CULTIVATION_REALMS.length - 1 && c.stageIndex >= 3) {
                playSafeSe("Bell3", 80, 100);
                this.addFloatingText("Você já alcançou o Ápice Imortal!", "#ffd43b", -48, 1.1);
                return;
            }

            if (!$gameSystem.isBottleneckReached()) {
                const needed = $gameSystem.maxQiForCurrentStage() - c.currentQi;
                playSafeSe("Buzzer1", 70, 100);
                this.addFloatingText(`Qi Insuficiente! Faltam ${needed} Qi`, "#ff8787", -44, 1.0);
                return;
            }

            // Encerra meditação para iniciar o rompimento
            c.meditating = false;

            if ($gameSystem.isMajorRealmBottleneck()) {
                // Grande Rompimento de Reino -> Inicia Tribulação Celestial!
                this.startHeavenlyTribulation();
            } else {
                // Avanço de Camada / Sub-estágio dentro do mesmo Reino
                c.currentQi = 0;
                c.stageIndex++;
                c.totalBreakthroughs++;

                const realm = $gameSystem.currentRealmObj();
                const stageName = $gameSystem.currentStageName();
                if ($gameParty && $gameParty.leader()) {
                    $gameParty.leader().refresh();
                    $gameParty.leader().recoverAll();
                }

                playSafeSe("Powerup", 85, 115);
                this.triggerShockwave(realm.color, 150, 45);
                this.addFloatingText(`Avanço! ${realm.name} • ${stageName}`, "#ffd43b", -56, 1.2);
                this.showAscensionBanner(realm.name, stageName, realm.color, "Meridianos Expandidos!");
            }
        }

        static startHeavenlyTribulation() {
            const c = $gameSystem.cultivation();
            const nextRealmIndex = Math.min(CULTIVATION_REALMS.length - 1, c.realmIndex + 1);
            const nextRealm = CULTIVATION_REALMS[nextRealmIndex];
            const totalWaves = Math.max(1, nextRealm.tribulationWaves || 3);

            this._tribulationState = {
                targetRealmIndex: nextRealmIndex,
                nextRealm,
                totalWaves,
                currentWave: 0,
                timer: 0,
                phase: "gathering" // gathering -> striking -> ascension
            };

            playSafeSe("Wind1", 85, 70);
            this.addFloatingText(`TRIBULAÇÃO CELESTIAL: ${nextRealm.name.toUpperCase()}!`, "#ffec99", -60, 1.25);
            this.triggerShockwave("#cc5de8", 180, 50);
        }

        static updateTribulation() {
            const st = this._tribulationState;
            if (!st) return;
            st.timer++;

            if (st.phase === "gathering") {
                if (st.timer === 30) {
                    this.addFloatingText("As Nuvens da Tribulação se condensam nos Céus...", "#d0bfff", -52, 1.05);
                }
                if (st.timer >= 75) {
                    st.phase = "striking";
                    st.timer = 0;
                }
            } else if (st.phase === "striking") {
                if (st.timer === 1) {
                    st.currentWave++;
                    this.executeTribulationStrike(st.currentWave, st.totalWaves, st.nextRealm);
                }
                if (st.timer >= 70) {
                    // Verifica se sobreviveu
                    const leader = $gameParty ? $gameParty.leader() : null;
                    if (leader && leader.hp <= 1 && st.currentWave < st.totalWaves && $gameSystem.cultivation().foundationPurity < 40) {
                        // Falha na Tribulação (Recuo de Qi, mas sobrevive com temperamento corporal)
                        this.failTribulation();
                        return;
                    }

                    if (st.currentWave >= st.totalWaves) {
                        st.phase = "ascension";
                        st.timer = 0;
                    } else {
                        st.timer = 0;
                    }
                }
            } else if (st.phase === "ascension") {
                if (st.timer === 1) {
                    this.completeMajorRealmAscension(st.targetRealmIndex, st.nextRealm);
                }
                if (st.timer >= 95) {
                    this._tribulationState = null;
                }
            }
        }

        static executeTribulationStrike(wave, totalWaves, nextRealm) {
            const c = $gameSystem.cultivation();
            const root = $gameSystem.currentSpiritualRoot();
            const sutra = $gameSystem.currentSutra();
            const leader = $gameParty ? $gameParty.leader() : null;

            // Som de Trovão Celestial e Screen Shake
            playSafeSe("Thunder9", 95, 90 + Math.min(40, wave * 5));
            if ($gameScreen) {
                $gameScreen.startShake(6 + wave, 8, 20);
                $gameScreen.startFlash([220, 190, 255, 170], 18);
            }

            // Cria o Raio Ramificado Procedural caindo do céu sobre o jogador
            const boltColor = wave === totalWaves ? "#ffd43b" : nextRealm.color;
            this.spawnLightningBolt($gamePlayer.screenX(), $gamePlayer.screenY() - 18, boltColor);
            this.triggerShockwave(boltColor, 140 + wave * 15, 35);

            // Cálculo de Dano Mitigado pela Pureza da Fundação, Raiz Espiritual e Sutra
            if (leader) {
                const baseDamageRatio = 0.16 + (wave / totalWaves) * 0.12;
                const purityMitigation = (c.foundationPurity / 100) * 0.45;
                const totalMitigation = Math.min(0.85, purityMitigation + root.tribulationResist + sutra.tribulationShield);
                const damage = Math.max(1, Math.round(leader.mhp * baseDamageRatio * (1.0 - totalMitigation)));

                const newHp = Math.max(1, leader.hp - damage);
                leader.setHp(newHp);

                this.addFloatingText(
                    `${wave}º Raio Celestial! (-${damage} HP | Escudo Dao: ${Math.round(totalMitigation * 100)}%)`,
                    wave === totalWaves ? "#ffd43b" : "#ffa8a8",
                    -56,
                    1.1
                );
            }
        }

        static failTribulation() {
            const c = $gameSystem.cultivation();
            c.currentQi = Math.floor(c.currentQi * 0.70);
            c.foundationPurity = Math.min(100, c.foundationPurity + 12);
            this._tribulationState = null;

            playSafeSe("Collapse1", 80, 95);
            this.addFloatingText("Recuo de Qi! Fundação temperada (+12% Pureza)", "#ff8787", -54, 1.1);
        }

        static completeMajorRealmAscension(targetRealmIndex, nextRealm) {
            const c = $gameSystem.cultivation();
            c.realmIndex = targetRealmIndex;
            c.stageIndex = 0;
            c.currentQi = 0;
            c.foundationPurity = Math.min(100, Math.max(75, c.foundationPurity + 10));
            c.totalBreakthroughs++;

            if (syncRealmVarId > 0 && typeof $gameVariables !== "undefined" && $gameVariables) {
                $gameVariables.setValue(syncRealmVarId, c.realmIndex);
            }

            if ($gameParty && $gameParty.leader()) {
                $gameParty.leader().refresh();
                $gameParty.leader().recoverAll();
            }

            playSafeSe("Saint5", 95, 100);
            playSafeSe("Up1", 90, 105);

            this._ascensionPillar = {
                color: nextRealm.color,
                glowColor: nextRealm.glowColor,
                age: 0,
                maxAge: 90
            };

            this.triggerShockwave("#ffd43b", 240, 60);
            this.triggerShockwave(nextRealm.color, 180, 45);
            this.showAscensionBanner(
                `ASCENSÃO IMORTAL: ${nextRealm.name.toUpperCase()}`,
                `Título Conquistado: ${nextRealm.title}`,
                nextRealm.color,
                "Todos os Atributos, Longevidade e Dantian Foram Multiplicados!"
            );
        }

        static spawnLightningBolt(targetX, targetY, color) {
            const segments = [];
            let currX = targetX + (Math.random() - 0.5) * 90;
            let currY = -20;
            const steps = 12;
            const stepY = (targetY - currY) / steps;

            for (let i = 1; i <= steps; i++) {
                const nextY = currY + stepY;
                const nextX = (i === steps)
                    ? targetX
                    : currX + (targetX - currX) * (1 / (steps - i + 1)) + (Math.random() - 0.5) * 48;
                segments.push({ x1: currX, y1: currY, x2: nextX, y2: nextY, main: true });

                // Ramificações secundárias do raio
                if (Math.random() < 0.55 && i < steps - 1) {
                    const branchDir = Math.random() < 0.5 ? -1 : 1;
                    let bx = nextX;
                    let by = nextY;
                    for (let b = 0; b < 3; b++) {
                        const nbx = bx + branchDir * (14 + Math.random() * 22);
                        const nby = by + stepY * (0.7 + Math.random() * 0.5);
                        segments.push({ x1: bx, y1: by, x2: nbx, y2: nby, main: false });
                        bx = nbx;
                        by = nby;
                    }
                }
                currX = nextX;
                currY = nextY;
            }

            this._lightningBolts.push({
                segments,
                color,
                age: 0,
                maxAge: 24
            });
        }

        static showAscensionBanner(title, subtitle, color, footer) {
            this._bannerData = {
                title,
                subtitle,
                color,
                footer,
                age: 0,
                maxAge: 180
            };
        }
    }

    globalThis.CultivationManager = CultivationManager;

    // =========================================================================
    // 6. EFEITOS VISUAIS NO MAPA (MATRIZ BAGUA, PARTÍCULAS QI, VEIOS E RAIOS)
    // =========================================================================

    class Sprite_CultivationMapEffects extends Sprite {
        initialize() {
            super.initialize();
            this.bitmap = new Bitmap(Graphics.width, Graphics.height);
            this.z = 9;
            this._qiParticles = [];
            this._veinParticles = [];
            this._baguaAngle = 0;
        }

        update() {
            super.update();
            if (typeof $gameSystem === "undefined" || !$gameSystem || typeof $gamePlayer === "undefined" || !$gamePlayer) return;

            const c = $gameSystem.cultivation();
            const isTrib = CultivationManager.isTribulationActive();
            const coords = getRealPlayerCoords();
            const nearestVein = findNearestSpiritVein(coords.x, coords.y);
            const veinVisible = nearestVein && nearestVein.distance <= 9;

            const hasActiveEffects =
                c.meditating ||
                isTrib ||
                veinVisible ||
                CultivationManager._floatingTexts.length > 0 ||
                CultivationManager._shockwaves.length > 0 ||
                CultivationManager._lightningBolts.length > 0 ||
                !!CultivationManager._ascensionPillar ||
                !!CultivationManager._bannerData ||
                this._qiParticles.length > 0;

            if (!hasActiveEffects) {
                if (this._wasDirty) {
                    this.bitmap.clear();
                    this.bitmap._baseTexture.update();
                    this._wasDirty = false;
                }
                return;
            }

            this._wasDirty = true;
            this.bitmap.clear();
            const ctx = this.bitmap.context;

            const px = $gamePlayer.screenX();
            const py = $gamePlayer.screenY();
            const realm = $gameSystem.currentRealmObj();

            // 1. Partículas de Veio Espiritual no chão do mapa (para guiar o jogador visualmente!)
            if (veinVisible) {
                this.updateAndDrawSpiritVein(ctx, nearestVein, coords);
            }

            // 2. Matriz Bagua / Array Dao sob os pés do jogador durante Meditação ou Tribulação
            if (c.meditating || isTrib) {
                this._baguaAngle += isTrib ? 0.045 : 0.018;
                this.drawBaguaArray(ctx, px, py - 6, isTrib ? 72 : 54, realm.color, realm.glowColor);
            }

            // 3. Vórtice de Partículas de Qi convergindo para o Dantian
            this.updateAndDrawQiParticles(ctx, px, py - 18, c.meditating || isTrib, realm);

            // 4. Ondas de Choque Espirituais (Shockwaves)
            this.updateAndDrawShockwaves(ctx);

            // 5. Pilar Dourado de Ascensão Imortal
            if (CultivationManager._ascensionPillar) {
                this.updateAndDrawAscensionPillar(ctx, px, py);
            }

            // 6. Nuvens de Tribulação e Raios Celestiais Ramificados
            if (isTrib) {
                this.drawTribulationClouds(ctx, CultivationManager._tribulationState);
            }
            this.updateAndDrawLightningBolts(ctx);

            // 7. Textos Flutuantes de Ganho de Qi
            this.updateAndDrawFloatingTexts(ctx);

            // 8. Banner Majestoso de Ascensão de Reino
            if (CultivationManager._bannerData) {
                this.updateAndDrawBanner(ctx);
            }

            this.bitmap._baseTexture.update();
        }

        updateAndDrawSpiritVein(ctx, vein, playerRealCoords) {
            const tileW = $gameMap.tileWidth();
            const tileH = $gameMap.tileHeight();
            const vx = $gamePlayer.screenX() + (vein.x - playerRealCoords.x) * tileW;
            const vy = $gamePlayer.screenY() - 12 + (vein.y - playerRealCoords.y) * tileH;

            if (vx < -100 || vx > Graphics.width + 100 || vy < -100 || vy > Graphics.height + 100) return;

            const t = (Graphics.frameCount || 0) * 0.05;
            const pulse = 0.75 + Math.sin(t * 1.5) * 0.25;

            ctx.save();
            ctx.translate(vx, vy);
            ctx.scale(1.0, 0.55);

            const radius = (28 + vein.grade * 10) * pulse;
            const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, radius);
            grad.addColorStop(0.0, vein.color);
            grad.addColorStop(0.5, `${vein.color}66`);
            grad.addColorStop(1.0, "rgba(0,0,0,0)");

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = vein.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.65, t, t + Math.PI * 1.4);
            ctx.stroke();
            ctx.restore();

            // Emite fagulhas ascendentes no Veio Espiritual
            if (Math.random() < 0.35) {
                this._veinParticles.push({
                    x: vx + (Math.random() - 0.5) * 36,
                    y: vy + (Math.random() - 0.5) * 16,
                    vy: -0.6 - Math.random() * 0.8,
                    size: 1.8 + Math.random() * 2.2,
                    color: vein.color,
                    age: 0,
                    maxAge: 45
                });
            }

            ctx.save();
            for (let i = this._veinParticles.length - 1; i >= 0; i--) {
                const p = this._veinParticles[i];
                p.age++;
                p.y += p.vy;
                p.x += Math.sin(p.age * 0.12) * 0.35;
                if (p.age >= p.maxAge) {
                    this._veinParticles.splice(i, 1);
                    continue;
                }
                const alpha = 1.0 - p.age / p.maxAge;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        drawBaguaArray(ctx, x, y, radius, color, glowColor) {
            const pulse = 0.92 + Math.sin((Graphics.frameCount || 0) * 0.08) * 0.08;
            const r = radius * pulse;

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(1.0, 0.52); // Perspectiva isométrica no chão do mapa
            ctx.rotate(this._baguaAngle);

            // Brilho de fundo do Array
            const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, r * 1.25);
            grad.addColorStop(0.0, `${color}55`);
            grad.addColorStop(0.6, `${color}22`);
            grad.addColorStop(1.0, "rgba(0,0,0,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = glowColor;
            ctx.lineWidth = 2.0;

            // Anel Externo e Interno
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
            ctx.stroke();

            // Octógono Sagrado do Bagua
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (i * Math.PI) / 4;
                const ox = Math.cos(a) * (r * 0.86);
                const oy = Math.sin(a) * (r * 0.86);
                if (i === 0) ctx.moveTo(ox, oy);
                else ctx.lineTo(ox, oy);
            }
            ctx.closePath();
            ctx.stroke();

            // Estrela de 8 pontas interna (2 quadrados rotacionados)
            for (let sq = 0; sq < 2; sq++) {
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    const a = (i * Math.PI) / 2 + (sq * Math.PI) / 4;
                    const sx = Math.cos(a) * (r * 0.72);
                    const sy = Math.sin(a) * (r * 0.72);
                    if (i === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
                ctx.closePath();
                ctx.stroke();
            }

            // Símbolo Taiji (Yin-Yang estilizado) no núcleo
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }

        updateAndDrawQiParticles(ctx, centerX, centerY, spawnNew, realm) {
            if (spawnNew && this._qiParticles.length < 42) {
                for (let s = 0; s < 2; s++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 55 + Math.random() * 55;
                    this._qiParticles.push({
                        angle,
                        dist,
                        maxDist: dist,
                        speed: 0.045 + Math.random() * 0.035,
                        radialSpeed: 1.1 + Math.random() * 0.8,
                        size: 2.0 + Math.random() * 2.5,
                        color: Math.random() < 0.5 ? realm.color : realm.glowColor,
                        yOffset: (Math.random() - 0.5) * 24
                    });
                }
            }

            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            for (let i = this._qiParticles.length - 1; i >= 0; i--) {
                const p = this._qiParticles[i];
                p.angle += p.speed;
                p.dist -= p.radialSpeed;

                if (p.dist <= 4) {
                    this._qiParticles.splice(i, 1);
                    continue;
                }

                const x = centerX + Math.cos(p.angle) * p.dist;
                const y = centerY + Math.sin(p.angle) * (p.dist * 0.55) + p.yOffset * (p.dist / p.maxDist);
                const alpha = Math.min(1.0, (1.0 - p.dist / p.maxDist) * 1.6);

                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        updateAndDrawShockwaves(ctx) {
            const tileW = $gameMap.tileWidth();
            const tileH = $gameMap.tileHeight();

            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            for (let i = CultivationManager._shockwaves.length - 1; i >= 0; i--) {
                const sw = CultivationManager._shockwaves[i];
                sw.age++;
                if (sw.age >= sw.maxAge) {
                    CultivationManager._shockwaves.splice(i, 1);
                    continue;
                }
                const progress = sw.age / sw.maxAge;
                const currRadius = sw.radius + (sw.maxRadius - sw.radius) * (1 - Math.pow(1 - progress, 2));
                const alpha = (1.0 - progress) * 0.85;

                const sx = ($gameMap.adjustX(sw.worldX) + 0.5) * tileW;
                const sy = ($gameMap.adjustY(sw.worldY) + 0.5) * tileH;

                ctx.save();
                ctx.translate(sx, sy);
                ctx.scale(1.0, 0.55);
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = sw.color;
                ctx.lineWidth = 3.5 * (1.0 - progress * 0.6);
                ctx.beginPath();
                ctx.arc(0, 0, currRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            ctx.restore();
        }

        updateAndDrawAscensionPillar(ctx, px, py) {
            const pil = CultivationManager._ascensionPillar;
            pil.age++;
            if (pil.age >= pil.maxAge) {
                CultivationManager._ascensionPillar = null;
                return;
            }

            const progress = pil.age / pil.maxAge;
            const alpha = progress < 0.2 ? progress / 0.2 : 1.0 - (progress - 0.2) / 0.8;
            const width = 68 * Math.sin(progress * Math.PI);

            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = alpha * 0.85;

            const grad = ctx.createLinearGradient(px - width, 0, px + width, 0);
            grad.addColorStop(0.0, "rgba(255, 255, 255, 0)");
            grad.addColorStop(0.25, pil.color);
            grad.addColorStop(0.5, "#ffffff");
            grad.addColorStop(0.75, pil.color);
            grad.addColorStop(1.0, "rgba(255, 255, 255, 0)");

            ctx.fillStyle = grad;
            ctx.fillRect(px - width, 0, width * 2, py + 12);
            ctx.restore();
        }

        drawTribulationClouds(ctx, st) {
            ctx.save();
            const grad = ctx.createLinearGradient(0, 0, 0, Graphics.height * 0.45);
            grad.addColorStop(0.0, "rgba(10, 5, 24, 0.88)");
            grad.addColorStop(0.6, "rgba(22, 12, 48, 0.55)");
            grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, Graphics.width, Graphics.height * 0.45);

            ctx.font = "bold 18px 'GameFont', sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "#ffec99";
            ctx.shadowColor = "#000000";
            ctx.shadowBlur = 6;
            const waveText = st.phase === "gathering"
                ? `⚡ NUVENS DE TRIBULAÇÃO CELESTIAL SE FORMANDO (${st.nextRealm.name}) ⚡`
                : `⚡ TRIBULAÇÃO CELESTIAL: ONDA ${st.currentWave} / ${st.totalWaves} ⚡`;
            ctx.fillText(waveText, Graphics.width / 2, 36);
            ctx.restore();
        }

        updateAndDrawLightningBolts(ctx) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            for (let i = CultivationManager._lightningBolts.length - 1; i >= 0; i--) {
                const bolt = CultivationManager._lightningBolts[i];
                bolt.age++;
                if (bolt.age >= bolt.maxAge) {
                    CultivationManager._lightningBolts.splice(i, 1);
                    continue;
                }
                const alpha = 1.0 - bolt.age / bolt.maxAge;
                ctx.globalAlpha = alpha;

                for (let s = 0; s < bolt.segments.length; s++) {
                    const seg = bolt.segments[s];
                    // Halo externo colorido do raio
                    ctx.strokeStyle = bolt.color;
                    ctx.lineWidth = seg.main ? 6.0 : 3.0;
                    ctx.beginPath();
                    ctx.moveTo(seg.x1, seg.y1);
                    ctx.lineTo(seg.x2, seg.y2);
                    ctx.stroke();

                    // Núcleo branco incandescente
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = seg.main ? 2.2 : 1.0;
                    ctx.beginPath();
                    ctx.moveTo(seg.x1, seg.y1);
                    ctx.lineTo(seg.x2, seg.y2);
                    ctx.stroke();
                }
            }
            ctx.restore();
        }

        updateAndDrawFloatingTexts(ctx) {
            const tileW = $gameMap.tileWidth();
            const tileH = $gameMap.tileHeight();

            ctx.save();
            for (let i = CultivationManager._floatingTexts.length - 1; i >= 0; i--) {
                const ft = CultivationManager._floatingTexts[i];
                ft.age++;
                ft.offsetY -= 0.55;
                if (ft.age >= ft.maxAge) {
                    CultivationManager._floatingTexts.splice(i, 1);
                    continue;
                }

                const alpha = ft.age < 10 ? ft.age / 10 : 1.0 - Math.pow((ft.age - 10) / (ft.maxAge - 10), 2);
                const sx = ($gameMap.adjustX(ft.worldX) + 0.5) * tileW;
                const sy = ($gameMap.adjustY(ft.worldY) + 1.0) * tileH + ft.offsetY;

                ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
                const fontSize = Math.round(14 * (ft.scale || 1.0));
                ctx.font = `bold ${fontSize}px 'GameFont', sans-serif`;
                ctx.textAlign = "center";
                ctx.lineWidth = 3.5;
                ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
                ctx.strokeText(ft.text, sx, sy);
                ctx.fillStyle = ft.color;
                ctx.fillText(ft.text, sx, sy);
            }
            ctx.restore();
        }

        updateAndDrawBanner(ctx) {
            const b = CultivationManager._bannerData;
            b.age++;
            if (b.age >= b.maxAge) {
                CultivationManager._bannerData = null;
                return;
            }

            let alpha = 1.0;
            if (b.age < 20) alpha = b.age / 20;
            else if (b.age > b.maxAge - 30) alpha = (b.maxAge - b.age) / 30;

            const w = Math.min(560, Graphics.width - 40);
            const h = 92;
            const x = (Graphics.width - w) / 2;
            const y = 70;

            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

            const bgGrad = ctx.createLinearGradient(x, y, x + w, y);
            bgGrad.addColorStop(0.0, "rgba(10, 12, 22, 0.0)");
            bgGrad.addColorStop(0.15, "rgba(12, 16, 28, 0.92)");
            bgGrad.addColorStop(0.85, "rgba(12, 16, 28, 0.92)");
            bgGrad.addColorStop(1.0, "rgba(10, 12, 22, 0.0)");
            ctx.fillStyle = bgGrad;
            ctx.fillRect(x, y, w, h);

            ctx.strokeStyle = b.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 40, y);
            ctx.lineTo(x + w - 40, y);
            ctx.moveTo(x + 40, y + h);
            ctx.lineTo(x + w - 40, y + h);
            ctx.stroke();

            ctx.textAlign = "center";
            ctx.font = "bold 20px 'GameFont', sans-serif";
            ctx.fillStyle = b.color;
            ctx.fillText(b.title, Graphics.width / 2, y + 30);

            ctx.font = "bold 15px 'GameFont', sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(b.subtitle, Graphics.width / 2, y + 54);

            ctx.font = "13px 'GameFont', sans-serif";
            ctx.fillStyle = "#ffd43b";
            ctx.fillText(b.footer, Graphics.width / 2, y + 76);

            ctx.restore();
        }
    }

    // =========================================================================
    // 7. HUD DE CULTIVO IMORTAL NO MAPA (ABAIXO DO RELÓGIO DO DAYNIGHTSYSTEM)
    // =========================================================================

    class Sprite_CultivationHUD extends Sprite {
        initialize() {
            super.initialize();
            this.bitmap = new Bitmap(228, 108);
            this.x = hudX;
            this.y = hudY;
            this._lastStateKey = "";
            this._pulsePhase = 0;
        }

        update() {
            super.update();
            if (typeof $gameSystem === "undefined" || !$gameSystem || typeof $gamePlayer === "undefined" || !$gamePlayer) return;

            this.visible = showCultivationHud && !$gameMessage.isBusy();
            if (!this.visible) return;

            const c = $gameSystem.cultivation();
            const maxQi = $gameSystem.maxQiForCurrentStage();
            const bottleneck = $gameSystem.isBottleneckReached();
            const coords = getRealPlayerCoords();

            if (bottleneck || c.meditating) {
                this._pulsePhase = (this._pulsePhase + 1) % 60;
            }

            const pulseBucket = (bottleneck || c.meditating) ? Math.floor(this._pulsePhase / 6) : 0;
            const stateKey = `${c.realmIndex}_${c.stageIndex}_${c.currentQi}_${maxQi}_${Math.round(c.foundationPurity)}_${c.meditating}_${coords.x}_${coords.y}_${pulseBucket}`;

            if (this._lastStateKey !== stateKey) {
                this._lastStateKey = stateKey;
                this.redrawHud(c, maxQi, bottleneck, coords);
            }
        }

        drawRoundRectPath(ctx, x, y, w, h, r) {
            const radius = Math.max(0, Math.min(r, w / 2, h / 2));
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
            ctx.lineTo(x + w, y + h - radius);
            ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            ctx.lineTo(x + radius, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        }

        redrawHud(c, maxQi, bottleneck, coords) {
            const bmp = this.bitmap;
            bmp.clear();
            const ctx = bmp.context;
            const w = bmp.width;
            const h = bmp.height;

            const realm = $gameSystem.currentRealmObj();
            const stageName = $gameSystem.currentStageName();
            const env = analyzeEnvironmentAt(coords.x, coords.y);

            ctx.save();

            // Moldura de Jade Escuro & Ouro Celestial
            const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
            bgGrad.addColorStop(0, "rgba(12, 16, 26, 0.86)");
            bgGrad.addColorStop(1, "rgba(6, 9, 16, 0.92)");
            ctx.fillStyle = bgGrad;

            this.drawRoundRectPath(ctx, 2, 2, w - 4, h - 4, 8);
            ctx.fill();

            ctx.strokeStyle = bottleneck ? "#ffd43b" : (c.meditating ? realm.glowColor : "rgba(180, 160, 110, 0.65)");
            ctx.lineWidth = (bottleneck || c.meditating) ? 2.0 : 1.2;
            ctx.stroke();

            // Orbe do Reino à Esquerda
            const orbX = 22;
            const orbY = 23;
            const orbGrad = ctx.createRadialGradient(orbX - 3, orbY - 3, 2, orbX, orbY, 13);
            orbGrad.addColorStop(0, "#ffffff");
            orbGrad.addColorStop(0.4, realm.glowColor);
            orbGrad.addColorStop(1, realm.color);
            ctx.fillStyle = orbGrad;
            ctx.beginPath();
            ctx.arc(orbX, orbY, 11, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = "bold 11px 'GameFont', sans-serif";
            ctx.fillStyle = "#0b0e14";
            ctx.textAlign = "center";
            ctx.fillText(String(c.realmIndex), orbX, orbY + 4);

            // Nome do Reino e Camada
            ctx.textAlign = "left";
            ctx.font = "bold 13px 'GameFont', sans-serif";
            ctx.fillStyle = realm.glowColor;
            ctx.fillText(realm.name, 40, 20);

            ctx.font = "11px 'GameFont', sans-serif";
            ctx.fillStyle = "#ced4da";
            ctx.fillText(`${stageName} • Pureza ${Math.round(c.foundationPurity)}%`, 40, 35);

            // Barra de Qi do Dantian
            const barX = 12;
            const barY = 44;
            const barW = w - 24;
            const barH = 14;
            const ratio = Math.max(0, Math.min(1, c.currentQi / Math.max(1, maxQi)));

            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            this.drawRoundRectPath(ctx, barX, barY, barW, barH, 5);
            ctx.fill();

            if (ratio > 0) {
                const fillGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
                fillGrad.addColorStop(0, realm.color);
                fillGrad.addColorStop(1, bottleneck ? "#ffd43b" : realm.glowColor);
                ctx.fillStyle = fillGrad;
                this.drawRoundRectPath(ctx, barX + 1, barY + 1, Math.max(2, (barW - 2) * ratio), barH - 2, 4);
                ctx.fill();
            }

            ctx.font = "bold 10px 'GameFont', sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#000000";
            ctx.shadowBlur = 3;
            const barText = bottleneck
                ? `⚡ PRONTO P/ ROMPER [${breakthroughKeyChar}] ⚡`
                : `Qi: ${c.currentQi} / ${maxQi} (${Math.floor(ratio * 100)}%)`;
            ctx.fillText(barText, barX + barW / 2, barY + 11);
            ctx.shadowBlur = 0;

            // Linha de Densidade de Qi Ambiental e Bússola de Veio Espiritual
            ctx.textAlign = "left";
            ctx.font = "11px 'GameFont', sans-serif";
            const veinDist = env.nearestVein ? Math.round(env.nearestVein.distance) : 99;
            const veinDir = env.nearestVein ? getDirectionLabel(env.nearestVein.dx, env.nearestVein.dy) : "";
            ctx.fillStyle = env.activeVein ? "#ffd43b" : "#a5d8ff";
            const veinInfo = veinDist <= 1
                ? `★ Em ${env.nearestVein.name}!`
                : `Veio Qi: ${veinDir} (${veinDist}m)`;
            ctx.fillText(`Qi: ${env.totalDensity}x | ${veinInfo}`, 12, 74);

            // Rodapé com Atalhos
            ctx.font = "10px 'GameFont', sans-serif";
            ctx.fillStyle = c.meditating ? "#63e6be" : "#adb5bd";
            const medLabel = c.meditating ? `[${meditateKeyChar}] Meditando...` : `[${meditateKeyChar}] Meditar`;
            ctx.fillText(`${medLabel}  •  [${cultMenuKeyChar}] Dantian  •  [${breakthroughKeyChar}] Romper`, 12, 94);

            ctx.restore();
            bmp._baseTexture.update();
        }
    }

    // =========================================================================
    // 8. CENA DEDICADA DO DANTIAN, MERIDIANOS E SUTRAS (SCENE_CULTIVATION)
    // =========================================================================

    class Window_CultivationVisualizer extends Window_Base {
        initialize(rect) {
            super.initialize(rect);
            this._animTick = 0;
        }

        update() {
            super.update();
            this._animTick++;
            if (this._animTick % 2 === 0) {
                this.refresh();
            }
        }

        refresh() {
            this.contents.clear();
            if (typeof $gameSystem === "undefined" || !$gameSystem) return;

            const ctx = this.contents.context;
            const w = this.innerWidth;
            const h = this.innerHeight;
            const cx = w / 2;
            const cy = h * 0.44;
            const t = this._animTick * 0.04;

            const c = $gameSystem.cultivation();
            const realm = $gameSystem.currentRealmObj();
            const root = $gameSystem.currentSpiritualRoot();
            const sutra = $gameSystem.currentSutra();

            ctx.save();

            // Título da Visão Interior
            ctx.font = "bold 16px 'GameFont', sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = realm.glowColor;
            ctx.fillText("Visão Interior (Nei视 • Dantian)", cx, 24);

            // Aura Cósmica de Fundo
            const bgGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 125);
            bgGrad.addColorStop(0.0, `${realm.color}55`);
            bgGrad.addColorStop(0.5, `${root.color}22`);
            bgGrad.addColorStop(1.0, "rgba(0,0,0,0)");
            ctx.fillStyle = bgGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, 125, 0, Math.PI * 2);
            ctx.fill();

            // Anéis Orbitais do Dantian
            for (let ring = 0; ring < 3; ring++) {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(t * (ring % 2 === 0 ? 1 : -1) * (0.6 + ring * 0.25));
                ctx.strokeStyle = ring === 0 ? realm.glowColor : (ring === 1 ? root.color : sutra.color);
                ctx.lineWidth = 1.5;
                ctx.setLineDash(ring === 1 ? [6, 6] : [12, 8]);
                ctx.beginPath();
                ctx.arc(0, 0, 56 + ring * 22, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            // Silhueta Estilizada de Meditação em Lótus e Rede de Meridianos
            ctx.strokeStyle = "rgba(220, 235, 255, 0.55)";
            ctx.lineWidth = 2.0;

            // Eixo Central (Canal Governador / Du Mai)
            ctx.beginPath();
            ctx.moveTo(cx, cy - 68);
            ctx.lineTo(cx, cy + 48);
            ctx.stroke();

            // Cabeça / Dantian Superior (Shen)
            ctx.fillStyle = "rgba(20, 28, 46, 0.9)";
            ctx.beginPath();
            ctx.arc(cx, cy - 72, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Ombros, Braços e Pernas Cruzadas em Lótus
            ctx.beginPath();
            ctx.moveTo(cx - 34, cy - 42);
            ctx.quadraticCurveTo(cx, cy - 52, cx + 34, cy - 42);
            ctx.lineTo(cx + 46, cy + 12);
            ctx.quadraticCurveTo(cx + 58, cy + 48, cx, cy + 52);
            ctx.quadraticCurveTo(cx - 58, cy + 48, cx - 46, cy + 12);
            ctx.closePath();
            ctx.stroke();

            // 7 Nodos de Meridianos (Chakras / Acupontos) e Nodos Laterais
            const nodes = [
                { x: cx, y: cy - 72, r: 5, color: "#d0bfff", label: "Shen (Mente)" },
                { x: cx, y: cy - 30, r: 7, color: sutra.color, label: "Qi (Peito)" },
                { x: cx, y: cy + 16, r: 12 + Math.sin(t * 2) * 2, color: realm.color, label: "Dantian (Núcleo)" },
                { x: cx - 32, y: cy + 8, r: 4, color: root.color },
                { x: cx + 32, y: cy + 8, r: 4, color: root.color },
                { x: cx - 26, y: cy + 42, r: 4, color: realm.glowColor },
                { x: cx + 26, y: cy + 42, r: 4, color: realm.glowColor }
            ];

            // Pulso de Energia Fluindo pelos Meridianos
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                const grad = ctx.createRadialGradient(n.x, n.y, 1, n.x, n.y, n.r * 2.2);
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(0.4, n.color);
                grad.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * 2.2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Resumo Inferior no Painel Visual
            const infoY = h - 125;
            ctx.textAlign = "center";
            ctx.font = "bold 15px 'GameFont', sans-serif";
            ctx.fillStyle = realm.glowColor;
            ctx.fillText(`${realm.name} (${realm.title})`, cx, infoY);

            ctx.font = "13px 'GameFont', sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.fillText($gameSystem.currentStageName(), cx, infoY + 22);

            ctx.font = "12px 'GameFont', sans-serif";
            ctx.fillStyle = "#ced4da";
            this.drawWrappedText(ctx, realm.desc, cx, infoY + 46, w - 24, 18);

            // Indicador de Pureza da Fundação
            const purY = h - 22;
            ctx.font = "bold 13px 'GameFont', sans-serif";
            ctx.fillStyle = c.foundationPurity >= 85 ? "#63e6be" : (c.foundationPurity >= 60 ? "#ffd43b" : "#ff8787");
            ctx.fillText(`Pureza da Fundação Dao: ${c.foundationPurity.toFixed(1)}%`, cx, purY);

            ctx.restore();
            this.contents._baseTexture.update();
        }

        drawWrappedText(ctx, text, cx, startY, maxWidth, lineHeight) {
            const words = text.split(" ");
            let line = "";
            let y = startY;
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + " ";
                if (ctx.measureText(testLine).width > maxWidth && i > 0) {
                    ctx.fillText(line.trim(), cx, y);
                    line = words[i] + " ";
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            if (line.trim()) ctx.fillText(line.trim(), cx, y);
        }
    }

    class Window_CultivationStatus extends Window_Base {
        initialize(rect) {
            super.initialize(rect);
            this.refresh();
        }

        refresh() {
            this.contents.clear();
            if (typeof $gameSystem === "undefined" || !$gameSystem) return;

            const c = $gameSystem.cultivation();
            const realm = $gameSystem.currentRealmObj();
            const root = $gameSystem.currentSpiritualRoot();
            const sutra = $gameSystem.currentSutra();
            const maxQi = $gameSystem.maxQiForCurrentStage();
            const coords = getRealPlayerCoords();
            const env = analyzeEnvironmentAt(coords.x, coords.y);

            let y = 0;
            const lh = 26;

            // 1. Raiz Espiritual e Sutra Ativo
            this.changeTextColor(ColorManager.systemColor());
            this.drawText("Raiz Espiritual:", 0, y, 160);
            this.resetTextColor();
            this.drawText(`${root.name} [${root.element}]`, 150, y, this.innerWidth - 150);
            y += lh - 2;

            this.contents.fontSize = 16;
            this.changeTextColor("#adb5bd");
            this.drawText(root.desc, 0, y, this.innerWidth);
            this.resetFontSettings();
            y += lh + 2;

            this.changeTextColor(ColorManager.systemColor());
            this.drawText("Sutra de Cultivo:", 0, y, 160);
            this.changeTextColor(sutra.color);
            this.drawText(`${sutra.name} (${sutra.style})`, 150, y, this.innerWidth - 150);
            y += lh - 2;

            this.contents.fontSize = 16;
            this.changeTextColor("#adb5bd");
            this.drawText(sutra.desc, 0, y, this.innerWidth);
            this.resetFontSettings();
            y += lh + 6;

            // 2. Ambiente Atual e Bússola de Veio Espiritual
            this.changeTextColor("#ffd43b");
            this.drawText(`Ambiente Atual: ${env.biomeLabel} • ${env.timePhenomenon} (Densidade: ${env.totalDensity}x)`, 0, y, this.innerWidth);
            y += lh;

            if (env.nearestVein) {
                const dist = Math.round(env.nearestVein.distance);
                const dir = getDirectionLabel(env.nearestVein.dx, env.nearestVein.dy);
                this.changeTextColor("#63e6be");
                this.drawText(`Bússola Espiritual: ${env.nearestVein.name} (${env.nearestVein.multiplier}x Qi) a ${dist} passos (${dir})`, 0, y, this.innerWidth);
                y += lh + 6;
            }

            // 3. Comparativo de Bônus de Atributos (Atual vs Próximo Avanço)
            this.changeTextColor(ColorManager.systemColor());
            this.drawText("Bônus Permanentes do Cultivo (Estágio Atual  →  Próximo Avanço):", 0, y, this.innerWidth);
            y += lh;

            const nextStageIdx = (c.realmIndex === 0 || c.stageIndex >= 3) ? 0 : c.stageIndex + 1;
            const nextRealmIdx = (c.realmIndex === 0 || c.stageIndex >= 3) ? Math.min(CULTIVATION_REALMS.length - 1, c.realmIndex + 1) : c.realmIndex;

            const statLabels = ["HP Máx", "MP Máx", "Ataque", "Defesa", "Magia", "Def. Mág", "Agilid.", "Sorte"];
            const colW = Math.floor(this.innerWidth / 2) - 8;

            this.contents.fontSize = 18;
            for (let i = 0; i < 8; i++) {
                const col = i % 2;
                const row = Math.floor(i / 2);
                const sx = col * (colW + 16);
                const sy = y + row * 24;

                const currVal = $gameSystem.calculateCultivationStatBonus(i, c.realmIndex, c.stageIndex, c.foundationPurity);
                const nextVal = $gameSystem.calculateCultivationStatBonus(i, nextRealmIdx, nextStageIdx, c.foundationPurity);

                this.changeTextColor("#ced4da");
                this.drawText(`${statLabels[i]}:`, sx, sy, 90);
                this.changeTextColor("#63e6be");
                this.drawText(`+${currVal}  →  +${nextVal}`, sx + 88, sy, colW - 88);
            }
            this.resetFontSettings();
        }
    }

    class Window_CultivationCommand extends Window_Command {
        makeCommandList() {
            if (typeof $gameSystem === "undefined" || !$gameSystem) return;
            const c = $gameSystem.cultivation();
            const bottleneck = $gameSystem.isBottleneckReached();
            const isMajor = $gameSystem.isMajorRealmBottleneck();

            const breakLabel = bottleneck
                ? (isMajor ? "⚡ Iniciar Tribulação Celestial!" : "✨ Romper para Próxima Camada!")
                : `Romper Gargalo (Requer 100% Qi)`;

            this.addCommand(breakLabel, "breakthrough", bottleneck);
            this.addCommand("Purificar Fundação Dao (-20% Qi -> +15% Pureza)", "purify", c.currentQi >= 30 && c.foundationPurity < 100);
            this.addCommand("Alternar Sutra de Respiração", "cycleSutra", true);
            this.addCommand("Sintonizar Raiz Espiritual", "cycleRoot", true);
            this.addCommand("Meditar no Mapa Agora", "meditateNow", true);
            this.addCommand("Voltar ao Mapa", "cancel", true);
        }
    }

    class Scene_Cultivation extends Scene_MenuBase {
        create() {
            super.create();
            this.createVisualizerWindow();
            this.createStatusWindow();
            this.createCommandWindow();
        }

        createVisualizerWindow() {
            const w = Math.floor(Graphics.boxWidth * 0.36);
            const h = Graphics.boxHeight - this.mainAreaTop();
            const rect = new Rectangle(0, this.mainAreaTop(), w, h);
            this._visualizerWindow = new Window_CultivationVisualizer(rect);
            this.addWindow(this._visualizerWindow);
        }

        createStatusWindow() {
            const leftW = this._visualizerWindow.width;
            const w = Graphics.boxWidth - leftW;
            const cmdH = this.calcWindowHeight(6, true);
            const h = Graphics.boxHeight - this.mainAreaTop() - cmdH;
            const rect = new Rectangle(leftW, this.mainAreaTop(), w, h);
            this._statusWindow = new Window_CultivationStatus(rect);
            this.addWindow(this._statusWindow);
        }

        createCommandWindow() {
            const leftW = this._visualizerWindow.width;
            const w = Graphics.boxWidth - leftW;
            const cmdH = this.calcWindowHeight(6, true);
            const y = Graphics.boxHeight - cmdH;
            const rect = new Rectangle(leftW, y, w, cmdH);
            this._commandWindow = new Window_CultivationCommand(rect);
            this._commandWindow.setHandler("breakthrough", this.onBreakthrough.bind(this));
            this._commandWindow.setHandler("purify", this.onPurify.bind(this));
            this._commandWindow.setHandler("cycleSutra", this.onCycleSutra.bind(this));
            this._commandWindow.setHandler("cycleRoot", this.onCycleRoot.bind(this));
            this._commandWindow.setHandler("meditateNow", this.onMeditateNow.bind(this));
            this._commandWindow.setHandler("cancel", this.popScene.bind(this));
            this.addWindow(this._commandWindow);
        }

        refreshAll() {
            if ($gameParty && $gameParty.leader()) {
                $gameParty.leader().refresh();
            }
            this._visualizerWindow.refresh();
            this._statusWindow.refresh();
            this._commandWindow.refresh();
        }

        onBreakthrough() {
            SceneManager.goto(Scene_Map);
            setTimeout(() => {
                CultivationManager.attemptBreakthrough();
            }, 60);
        }

        onPurify() {
            const c = $gameSystem.cultivation();
            const maxQi = $gameSystem.maxQiForCurrentStage();
            const cost = Math.max(25, Math.round(maxQi * 0.20));
            c.currentQi = Math.max(0, c.currentQi - cost);
            c.foundationPurity = Math.min(100, +(c.foundationPurity + 15).toFixed(1));
            playSafeSe("Heal3", 80, 115);
            this.refreshAll();
            this._commandWindow.activate();
        }

        onCycleSutra() {
            const c = $gameSystem.cultivation();
            c.sutraIndex = (c.sutraIndex + 1) % BREATHING_SUTRAS.length;
            playSafeSe("Skill1", 80, 110);
            this.refreshAll();
            this._commandWindow.activate();
        }

        onCycleRoot() {
            const c = $gameSystem.cultivation();
            c.rootIndex = (c.rootIndex + 1) % SPIRITUAL_ROOTS.length;
            playSafeSe("Magic1", 80, 115);
            this.refreshAll();
            this._commandWindow.activate();
        }

        onMeditateNow() {
            SceneManager.goto(Scene_Map);
            setTimeout(() => {
                if (!$gameSystem.cultivation().meditating) {
                    CultivationManager.toggleMeditation();
                }
            }, 50);
        }
    }

    globalThis.Scene_Cultivation = Scene_Cultivation;

    // =========================================================================
    // 9. HOOKS EM SCENE_MAP E WINDOW_MENUCOMMAND + PLUGIN COMMANDS
    // =========================================================================

    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        this._cultivationEffectsSprite = new Sprite_CultivationMapEffects();
        this.addChild(this._cultivationEffectsSprite);

        _Scene_Map_createAllWindows.call(this);

        this._cultivationHudSprite = new Sprite_CultivationHUD();
        this.addChild(this._cultivationHudSprite);
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);

        CultivationManager.updateMapCultivation();

        if (!this.isMapTouchOk() && !$gameSystem.cultivation().meditating) return;
        if ($gameMessage.isBusy()) return;

        if (Input.isTriggered("cultivateMeditate")) {
            CultivationManager.toggleMeditation();
        } else if (Input.isTriggered("cultivateBreakthrough")) {
            CultivationManager.attemptBreakthrough();
        } else if (Input.isTriggered("cultivateScene") && !CultivationManager.isTribulationActive()) {
            playSafeSe("Bell1", 70, 120);
            SceneManager.push(Scene_Cultivation);
        }
    };

    const _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function() {
        _Window_MenuCommand_addOriginalCommands.call(this);
        this.addCommand(menuCommandText, "cultivationMenu", true);
    };

    const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler("cultivationMenu", () => {
            SceneManager.push(Scene_Cultivation);
        });
    };

    // Comandos de Plugin para uso em Eventos
    PluginManager.registerCommand(pluginName, "addQi", args => {
        const amount = Number(args.amount || 100);
        const purityBonus = Number(args.purityBonus || 0);
        $gameSystem.gainCultivationQi(amount, purityBonus);
        const sign = amount >= 0 ? "+" : "";
        CultivationManager.addFloatingText(`${sign}${amount} Qi Espiritual`, "#63e6be", -44, 1.1);
    });

    PluginManager.registerCommand(pluginName, "setRealm", args => {
        const c = $gameSystem.cultivation();
        c.realmIndex = Math.max(0, Math.min(CULTIVATION_REALMS.length - 1, Number(args.realmIndex || 0)));
        c.stageIndex = Math.max(0, Math.min(3, Number(args.stageIndex || 0)));
        c.currentQi = 0;
        if ($gameParty && $gameParty.leader()) {
            $gameParty.leader().refresh();
            $gameParty.leader().recoverAll();
        }
    });

    PluginManager.registerCommand(pluginName, "triggerBreakthrough", () => {
        CultivationManager.attemptBreakthrough();
    });

    PluginManager.registerCommand(pluginName, "openCultivationScene", () => {
        SceneManager.push(Scene_Cultivation);
    });

})();
