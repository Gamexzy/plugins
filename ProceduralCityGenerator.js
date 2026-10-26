//=============================================================================
// RPG Maker MZ - ProceduralCityGenerator.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc [v2.5.0] Gerador Completo de Cidade Procedural (>100 tiles), Suporte a Estilo Xianxia & Medieval, Autotiling Real (16/48 Shapes), População Viva de NPCs e Interiores Ricos.
 * @author Antigravity (DeepMind Pair Programming)
 *
 * @help
 * ============================================================================
 *               PROCEDURAL CITY GENERATOR - CIDADE PROCEDURAL MZ
 * ============================================================================
 * Este plugin gera uma cidade procedural massiva (com mais de 100 tiles quadrados,
 * padrão 120x120 = 14.400 tiles), linda, altamente detalhada e com urbanismo
 * coerente para RPG Maker MZ, suportando tanto o tema Xianxia (Cultivo Oriental)
 * quanto Medieval Ocidental.
 *
 * ----------------------------------------------------------------------------
 * PRINCIPAIS CARACTERÍSTICAS:
 * ----------------------------------------------------------------------------
 * 1. SUPORTE TOTAL A TEMAS (XIANXIA & MEDIEVAL):
 *    - Quando configurado para Xianxia (padrão):
 *      Gera construções autênticas da biblioteca XianxiaBuildingPrefabs:
 *      * Estalagem do Vinho Imortal (仙客来客栈 - 12x10)
 *      * Pavilhão de Alquimia & Pílulas da Montanha Celestial (丹药阁 - 10x8)
 *      * Forja de Artefatos & Espadas Espirituais (神兵炼器阁 - 10x8)
 *      * Casa de Chá & Salão de Xadrez Weiqi (品茗弈棋阁 - 10x8)
 *      * Pavilhão de Talismãs & Matrizes de Formação (天符阵法阁 - 10x8)
 *      * Pavilhão de Escrituras e Técnicas Marciais (藏经阁 - 10x10)
 *      * Palácio do Lorde da Cidade (城主府 - 16x12)
 *      * Mansão Siheyuan de Clã Cultivador (18x18 Modular)
 *      * Retiros de Cultivo: Cabanas de Herbalistas e Casas de Artesãos Mortais.
 *    - Quando configurado para Medieval:
 *      Gera Cidadela do Duque, Catedral, Taverna, Ferraria e Bairro Artesão.
 *
 * 2. DIMENSÕES & ESTRUTURA MASSIVA (>100 tiles):
 *    - Padrão 120 x 120 tiles (configurável para 100, 128, 150, 200 tiles).
 *    - Muralhas de fortificação com ameias, torres de vigia e fosso com água A1.
 *    - 4 Grandes Portões (Norte, Sul, Leste, Oeste) com pontes de pedra.
 *    - Grandes Avenidas Imperiais pavimentadas de 5 tiles de largura.
 *    - Grande Praça Central (26x26 tiles) com Monumentos e Chafariz.
 *
 * 3. POPULAÇÃO VIVA DE NPCS (COM INTERAÇÃO REAL E WALK ANIME):
 *    - Sentinelas nos portões com diálogos protetores.
 *    - Mestres de cada estabelecimento com lojas nativas, descansos e bênçãos.
 *    - Cidadãos, cultivadores e discípulos andando e interagindo pelas ruas.
 *
 * 4. SISTEMA DE INTERIORES IMPORTANTES:
 *    - Suporta Interiores Dedicados Físicos (se interiorMapId > 0): renderiza a
 *      planta interna completa do prefab (4 camadas) com saída para a rua exata!
 *    - Suporta Interiores Virtuais Interativos (se interiorMapId = 0): janela imersiva
 *      com descanso, lojas nativas, rumores e bênçãos.
 *
 * 5. MOTOR DE AUTOTILING ROBUSTO:
 *    - Autotiling 16-shapes canônico para telhados A3 e paredes A4.
 *    - Autotiling 48-shapes canônico para pisos A2 e canais de água A1.
 *
 * ----------------------------------------------------------------------------
 * NOTA DE MAPA (NOTE TAG):
 * ----------------------------------------------------------------------------
 * Coloque nas 'Notas' do Mapa no RPG Maker MZ:
 *   <ProceduralCity>
 * Ou com parâmetros opcionais (Largura, Altura, Semente, Estilo):
 *   <ProceduralCity: 120, 120, 0, Xianxia>
 * Ou especificando apenas o estilo:
 *   <CityStyle: Xianxia>
 *   <CityStyle: Medieval>
 *
 * ----------------------------------------------------------------------------
 * COMANDOS DE PLUGIN:
 * ----------------------------------------------------------------------------
 * - GenerateCity: Força a geração no mapa atual com semente, dimensões e estilo.
 * - TeleportDistrict: Teleporta o jogador para um distrito da cidade.
 * - RegenerateCurrentMap: Regenera a cidade com uma nova semente aleatória.
 * ============================================================================
 *
 * @param cityStyle
 * @text Estilo Visual e Arquitetural
 * @desc Escolha o estilo visual da cidade: Xianxia (Cultivo Oriental) ou Medieval (Ocidental).
 * @type select
 * @option Xianxia (Cultivo Oriental)
 * @value Xianxia
 * @option Medieval (Ocidental Clássico)
 * @value Medieval
 * @default Xianxia
 *
 * @param defaultWidth
 * @text Largura Padrão da Cidade
 * @desc Largura do mapa em tiles (mínimo 100 tiles para cidades massivas).
 * @type number
 * @min 100
 * @max 256
 * @default 120
 *
 * @param defaultHeight
 * @text Altura Padrão da Cidade
 * @desc Altura do mapa em tiles (mínimo 100 tiles para cidades massivas).
 * @type number
 * @min 100
 * @max 256
 * @default 120
 *
 * @param citySeed
 * @text Semente de Geração (Seed)
 * @desc Semente fixa inicial (deixe 0 para gerar semente aleatória e salvá-la).
 * @type string
 * @default 0
 *
 * @param autoGenerateMaps
 * @text IDs de Mapas Automáticos
 * @desc Lista de IDs de mapas que sempre serão cidades procedurais (ex: [1, 2]).
 * @type number[]
 * @default []
 *
 * @param interiorMapId
 * @text ID do Mapa de Interiores
 * @desc ID do mapa dedicado para gerar salas interiores físicas (0 = sistema virtual).
 * @type number
 * @default 0
 *
 * @param enableNpcs
 * @text Gerar População de NPCs
 * @desc Cria NPCs vivos e interativos pela cidade.
 * @type boolean
 * @default true
 *
 * @param npcCount
 * @text Quantidade de NPCs
 * @desc Número aproximado de NPCs espalhados pelos distritos.
 * @type number
 * @min 10
 * @max 80
 * @default 35
 *
 * @param showDistrictBanner
 * @text Exibir Banner de Distritos
 * @desc Mostra banner elegante no topo da tela ao entrar em cada distrito.
 * @type boolean
 * @default true
 *
 * @param cityBgm
 * @text BGM da Cidade
 * @desc Música tocada na cidade (deixe vazio para usar a do mapa).
 * @type file
 * @dir audio/bgm/
 * @default Town1
 *
 * @param cityBgs
 * @text BGS da Cidade (Ambiente)
 * @desc Som ambiente da cidade (deixe vazio para nenhum).
 * @type file
 * @dir audio/bgs/
 * @default City
 *
 * @command GenerateCity
 * @text Gerar Cidade Procedural
 * @desc Força a geração procedural de cidade no mapa atual.
 *
 * @arg seed
 * @text Semente (Seed)
 * @desc Semente numérica ou texto (0 = aleatória).
 * @type string
 * @default 0
 *
 * @arg width
 * @text Largura (Tiles)
 * @desc Largura do mapa (mínimo 100).
 * @type number
 * @default 120
 *
 * @arg height
 * @text Altura (Tiles)
 * @desc Altura do mapa (mínimo 100).
 * @type number
 * @default 120
 *
 * @arg style
 * @text Estilo Arquitetural
 * @type select
 * @option Xianxia
 * @value Xianxia
 * @option Medieval
 * @value Medieval
 * @default Xianxia
 *
 * @command TeleportDistrict
 * @text Teleportar para Distrito
 * @desc Move o jogador para o centro de um dos distritos da cidade.
 *
 * @arg district
 * @text Distrito Alvo
 * @type select
 * @option Praça Central (Mercado)
 * @value Plaza
 * @option Palácio do Duque (Cidadela)
 * @value Castle
 * @option Catedral da Luz (Sagrado)
 * @value Cathedral
 * @option Quartel Militar
 * @value Barracks
 * @option Docas e Canal
 * @value Docks
 * @option Bairro Residencial
 * @value Residential
 * @option Portão Sul (Entrada)
 * @value SouthGate
 * @option Portão Norte
 * @value NorthGate
 * @default Plaza
 *
 * @command RegenerateCurrentMap
 * @text Regenerar Cidade Atual
 * @desc Cria uma nova variação da cidade com uma semente aleatória.
 */

(() => {
    "use strict";

    const pluginName = "ProceduralCityGenerator";
    const params = PluginManager.parameters(pluginName);

    const defaultCityStyle = String(params.cityStyle || "Xianxia");
    const defaultWidth = Math.max(100, Number(params.defaultWidth || 120));
    const defaultHeight = Math.max(100, Number(params.defaultHeight || 120));
    const defaultSeedParam = String(params.citySeed || "0");
    const interiorMapId = Number(params.interiorMapId || 0);
    const enableNpcs = String(params.enableNpcs || "true") === "true";
    const targetNpcCount = Number(params.npcCount || 35);
    const showDistrictBanner = String(params.showDistrictBanner || "true") === "true";
    const cityBgm = String(params.cityBgm || "Town1");
    const cityBgs = String(params.cityBgs || "City");

    let autoMapIds = [];
    try {
        autoMapIds = JSON.parse(params.autoGenerateMaps || "[]").map(Number);
    } catch (e) {
        autoMapIds = [];
    }

    // Compatibilidade segura para som de porta no RPG Maker MZ
    if (typeof SoundManager !== "undefined" && !SoundManager.playDoor) {
        SoundManager.playDoor = function() {
            if (typeof AudioManager !== "undefined" && AudioManager && AudioManager.playSe) {
                AudioManager.playSe({ name: "Door1", volume: 90, pitch: 100, pan: 0 });
            }
        };
    }

    // Carregamento dinâmico de XianxiaBuildingPrefabs
    let PrefabsModule = null;
    if (typeof window !== "undefined" && window.XianxiaBuildingPrefabs) {
        PrefabsModule = window.XianxiaBuildingPrefabs;
    } else if (typeof require !== "undefined") {
        try {
            PrefabsModule = require("./XianxiaBuildingPrefabs.js");
        } catch (e) {
            // Fallback
        }
    }

    // =========================================================================
    // 1. GERADOR PSEUDO-ALEATÓRIO REPRODUZÍVEL (MULBERRY32 PRNG)
    // =========================================================================
    class CityPRNG {
        constructor(seed) {
            this.reseed(seed);
        }

        reseed(seed) {
            let s = 0;
            if (typeof seed === "number" && !isNaN(seed) && seed !== 0) {
                s = Math.floor(seed);
            } else if (typeof seed === "string" && seed !== "0" && seed.length > 0) {
                for (let i = 0; i < seed.length; i++) {
                    s = ((s << 5) - s) + seed.charCodeAt(i);
                    s |= 0;
                }
            } else {
                s = Math.floor(Math.random() * 2147483647) + 1;
            }
            this._seed = s >>> 0;
            this._state = this._seed;
        }

        next() {
            let t = (this._state += 0x6D2B79F5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }

        randomInt(min, max) {
            return Math.floor(this.next() * (max - min + 1)) + min;
        }

        randomChoice(arr) {
            if (!arr || arr.length === 0) return null;
            return arr[Math.floor(this.next() * arr.length)];
        }

        chance(percent) {
            return this.next() * 100 < percent;
        }
    }

    // =========================================================================
    // 2. CONSTANTES DE TILES DO RPG MAKER MZ (TILESET EXTERIOR & INTERIOR)
    // =========================================================================
    const TILES = {
        // Terrenos Base (A2)
        GRASS: 2816,          // Meadow Grass A2 (kind 16)
        DIRT: 2864,           // Dirt (Meadow) A2 (kind 17)
        ROAD: 2912,           // Road (Meadow) A2 (kind 18)
        COBBLE_A: 2960,       // Cobblestones A (kind 19)
        COBBLE_B: 3728,       // Cobblestones B / Plaza (kind 35)
        WATER_CANAL: 2048,    // Water Canal A1 (kind 0)

        // Telhados (A3)
        ROOF_RED: 4352,       // Roof A Dressed Tile (kind 48)
        ROOF_CRIMSON: 4400,   // Roof B Pink/Crimson (kind 49)
        ROOF_ORANGE: 4448,    // Roof C Orange (kind 50)
        ROOF_WOOD: 4544,      // Roof E Wood (kind 52)
        ROOF_SLATE_BLUE: 4688,// Roof H Dark Blue (kind 55)
        ROOF_GREEN: 5120,     // Roof I Green (kind 64)
        ROOF_TEMPLE: 5216,    // Roof K Stone/Cathedral (kind 66)
        ROOF_THATCH: 5264,    // Roof L Thatched (kind 67)

        // Paredes Exteriores (A3 / A4)
        WALL_STONE: 4736,     // Outer Wall A Rock/Stone (kind 56)
        WALL_PLASTER: 4784,   // Outer Wall B Plaster (kind 57)
        WALL_BRICK: 4832,     // Outer Wall C Red Brick (kind 58)
        WALL_WOOD: 4928,      // Outer Wall E Timber (kind 60)
        WALL_TEMPLE: 5552,    // Outer Wall J Temple White (kind 73)
        WALL_CASTLE: 5888,    // Wall A Castle Stone (kind 80)
        WALL_CASTLE_TOP: 6032,// Castle Battlements (kind 83)

        // A5 Pavimentos
        A5_STONE_SLAB: 1560,
        A5_WOOD_PLANK: 1556,

        // Camada B (Props e Decorações Externas)
        PROP_STREETLIGHT_TOP: 8,
        PROP_STREETLIGHT_MID: 16,
        PROP_STREETLIGHT_BASE: 24,

        PROP_SIGN_SWORD: 65,
        PROP_SIGN_ARMOR: 67,
        PROP_SIGN_SACK: 68,
        PROP_SIGN_INN: 70,
        PROP_SIGN_PUB: 71,
        PROP_SIGN_MAGIC: 73,
        PROP_SIGN_HAMMER: 77,

        PROP_BRIDGE_WOOD_H: 83,
        PROP_BRIDGE_WOOD_V: 82,
        PROP_BRIDGE_STONE_H: 94,

        PROP_CHIMNEY_A: 128,
        PROP_CHIMNEY_B: 136,

        PROP_WELL_TOP: 139,
        PROP_WELL_BASE: 147,

        PROP_BARREL: 142,
        PROP_GRAVE_A: 143,
        PROP_GRAVE_B: 144,
        PROP_POT: 145,
        PROP_CRATE_A: 181,
        PROP_CRATE_B: 182,
        PROP_CRATE_C: 183,

        PROP_FLOWERS_A: 160,
        PROP_FLOWERS_B: 161,
        PROP_FLOWERS_C: 162,
        PROP_FLOWERS_D: 163,

        PROP_TREE_TOP: 157,
        PROP_TREE_TRUNK: 165,

        // Camada C (Estátuas e Monumentos)
        PROP_C_OBELISK_TOP: 256 + 1,
        PROP_C_OBELISK_MID: 256 + 9,
        PROP_C_OBELISK_BASE: 256 + 17,
        PROP_C_ANGEL_TOP: 256 + 66,
        PROP_C_ANGEL_BASE: 256 + 74,
        PROP_C_STATUE_TOP: 256 + 64,
        PROP_C_STATUE_BASE: 256 + 72,
        PROP_C_WINDOW_STAINED: 256 + 116,
        PROP_C_ROUND_TOWER_TOP: 256 + 196,
        PROP_C_ROUND_TOWER_BASE: 256 + 204
    };

    const INT_TILES = {
        FLOOR_WOOD: 2816,
        FLOOR_CARPET_RED: 2912,
        FLOOR_STONE: 3008,
        WALL_WOOD: 5888,
        WALL_STONE: 6080,
        WALL_PLASTER: 6272,

        WINDOW_STAINED_TOP: 71,
        WINDOW_STAINED_BASE: 79,
        WINDOW_MID_A: 64,
        WINDOW_MID_B: 66,

        BED_TOP: 168,
        BED_BASE: 176,
        LARGE_BED_L_TOP: 169,
        LARGE_BED_R_TOP: 170,
        LARGE_BED_L_BASE: 177,
        LARGE_BED_R_BASE: 178,

        TABLE_WOOD: 112,
        CHAIR_WOOD: 101,

        SHELF_BOTTLES_TOP: 142,
        SHELF_BOTTLES_BASE: 150,
        SHELF_SUNDRIES_TOP: 153,
        SHELF_SUNDRIES_BASE: 161,
        SHELF_MEDICINE_TOP: 156,
        SHELF_MEDICINE_BASE: 164,

        FIREPLACE_TOP: 186,
        FIREPLACE_BASE: 194,
        FIREPLACE_IRON_TOP: 188,
        FIREPLACE_IRON_BASE: 196,

        COUNTER_A: 202,
        COUNTER_B: 203,

        PILLAR_STONE_TOP: 24,
        PILLAR_STONE_BASE: 32,

        C_BEER_BARREL_A: 256 + 56,
        C_BEER_BARREL_B: 256 + 57,
        C_ANVIL_A: 256 + 148,
        C_ANVIL_B: 256 + 149,
        C_CHURCH_PEW_TOP: 256 + 184,
        C_CHURCH_PEW_BASE: 256 + 192
    };

    // =========================================================================
    // 3. MOTOR DE AUTOTILING (48-SHAPES & 16-SHAPES CANÔNICO)
    // =========================================================================
    function getFloorAutotileShape(u, d, l, r, ul, ur, dl, dr) {
        if (!l && !r && !u && !d) return 46;
        if (l && r && u && d) {
            let code = 0;
            if (!ul) code |= 1;
            if (!ur) code |= 2;
            if (!dl) code |= 4;
            if (!dr) code |= 8;
            const cornerMap = [0, 1, 2, 3, 8, 9, 10, 11, 4, 5, 6, 7, 12, 13, 14, 15];
            return cornerMap[code];
        }
        if (!l && r && u && d) {
            let code = (ur ? 0 : 1) | (dr ? 0 : 2);
            return [16, 17, 18, 19][code];
        }
        if (l && !r && u && d) {
            let code = (ul ? 0 : 1) | (dl ? 0 : 2);
            return [24, 26, 25, 27][code];
        }
        if (l && r && !u && d) {
            let code = (dl ? 0 : 1) | (dr ? 0 : 2);
            return [20, 22, 21, 23][code];
        }
        if (l && r && u && !d) {
            let code = (ul ? 0 : 1) | (ur ? 0 : 2);
            return [28, 29, 30, 31][code];
        }
        if (!l && !r && u && d) return 32;
        if (l && r && !u && !d) return 33;
        if (!l && r && !u && d) return dr ? 34 : 35;
        if (l && !r && !u && d) return dl ? 36 : 37;
        if (!l && r && u && !d) return ur ? 40 : 41;
        if (l && !r && u && !d) return ul ? 38 : 39;
        if (!l && !r && !u && d) return 42;
        if (!l && r && !u && !d) return 43;
        if (!l && !r && u && !d) return 44;
        if (l && !r && !u && !d) return 45;
        return 0;
    }

    function getWallAutotileShape(u, d, l, r) {
        let shape = 0;
        if (!l) shape |= 1;
        if (!u) shape |= 2;
        if (!r) shape |= 4;
        if (!d) shape |= 8;
        return shape;
    }

    function isWallAutotileTile(tileId) {
        if (tileId >= 4352 && tileId < 5888) return true;
        if (tileId >= 5888 && tileId < 8192) {
            const kind = Math.floor((tileId - 2048) / 48);
            const ty = Math.floor(kind / 8);
            return (ty % 2 === 1);
        }
        return false;
    }

    // =========================================================================
    // 4. DISTRITOS DA CIDADE (MEDIEVAL E XIANXIA)
    // =========================================================================
    const DISTRICT_INFO_MEDIEVAL = {
        PLAZA: { id: 1, name: "Grande Praça do Mercado", icon: "🏛️", desc: "Coração comercial e pulsante da cidade." },
        CASTLE: { id: 2, name: "Cidadela Real & Palácio", icon: "👑", desc: "A sede nobre do poder e da guarda da cidade." },
        CATHEDRAL: { id: 3, name: "Bairro Sagrado & Catedral da Luz", icon: "⛪", desc: "Terra consagrada de reflexão, fé e descanso eterno." },
        BARRACKS: { id: 4, name: "Distrito Militar & Quartel", icon: "⚔️", desc: "Campos de treinamento e guarnição dos soldados." },
        DOCKS: { id: 5, name: "Cais das Docas & Canal Fluvial", icon: "⛵", desc: "Porto movimentado de pescadores, barcos e mercadorias." },
        RESIDENTIAL: { id: 6, name: "Bairro dos Artesãos & Casas", icon: "🏡", desc: "Aconchegantes ruelas e lares da população civil." },
        GATES: { id: 7, name: "Muralhas & Portões da Cidade", icon: "🛡️", desc: "Poderosas fortificações que guardam as fronteiras." },
        OUTSKIRTS: { id: 8, name: "Campina Exterior & Fazendas", icon: "🌿", desc: "Campos verdejantes além dos muros da cidade." }
    };

    const DISTRICT_INFO_XIANXIA = {
        PLAZA: { id: 1, name: "Praça Celestial & Mercado Imortal", icon: "🏮", desc: "Pulsante centro de comércio de pílulas, jades e vinhos espirituais." },
        CASTLE: { id: 2, name: "Palácio do Lorde da Cidade (城主府)", icon: "🏯", desc: "Sede do poder do Governador e assembleia dos grandes clãs imortais." },
        CATHEDRAL: { id: 3, name: "Pavilhão de Escrituras & Santuário do Dao", icon: "📜", desc: "Templo sagrado de contemplação do Dao e herança de técnicas ancestrais." },
        BARRACKS: { id: 4, name: "Campos Marciais & Pavilhão de Matrizes", icon: "⚔️", desc: "Campos de treino de Qi, forja de artefatos e mestres de talismãs." },
        DOCKS: { id: 5, name: "Cais Fluvial das Barcas Espirituais", icon: "⛵", desc: "Porto de atracação de barcos com mercadorias e ervas raras de rios sagrados." },
        RESIDENTIAL: { id: 6, name: "Bairro de Cultivo & Retiros Espirituais", icon: "🎋", desc: "Retiros de cultivadores, cabanas de herbalistas e oficinas de artesãos." },
        GATES: { id: 7, name: "Muralhas & Portões Selados da Cidade", icon: "🛡️", desc: "Grandes muralhas rúnicas protegidas por sentinelas de seitas." },
        OUTSKIRTS: { id: 8, name: "Campinas Além dos Muros & Cordilheiras", icon: "🏔️", desc: "Colinas verdejantes e florestas onde habitam bestas espirituais." }
    };

    let CURRENT_DISTRICT_INFO = DISTRICT_INFO_XIANXIA;

    // =========================================================================
    // 5. CLASSE PRINCIPAL: GERADOR PROCEDURAL DE CIDADE
    // =========================================================================
    class ProceduralCityGenerator {
        constructor() {
            this._width = defaultWidth;
            this._height = defaultHeight;
            this._cityStyle = defaultCityStyle;
            this._prng = new CityPRNG(defaultSeedParam);
            this._grid = null;
            this._buildings = [];
            this._doors = [];
            this._spawnPoint = { x: 60, y: 110 };
            this._npcs = [];
            this._currentSeed = null;
        }

        isCityMap(mapId) {
            if (autoMapIds.includes(mapId)) return true;
            if (typeof $dataMap !== "undefined" && $dataMap && $dataMap.note && $dataMap.note.includes("<ProceduralCity")) return true;
            return false;
        }

        generate(mapData, customSeed = null, width = defaultWidth, height = defaultHeight, preservePlayerPos = false, customStyle = null) {
            this._width = Math.max(100, width);
            this._height = Math.max(100, height);
            this._cityStyle = customStyle || this._cityStyle || defaultCityStyle;

            CURRENT_DISTRICT_INFO = (this._cityStyle === "Xianxia") ? DISTRICT_INFO_XIANXIA : DISTRICT_INFO_MEDIEVAL;

            // Garante semente persistente por mapa
            let finalSeed = customSeed;
            const currentMapId = (typeof $gameMap !== "undefined" && $gameMap) ? $gameMap.mapId() : 0;
            if (!finalSeed || finalSeed === "0") {
                if (typeof $gameSystem !== "undefined" && $gameSystem && $gameSystem._proceduralCitySeeds && $gameSystem._proceduralCitySeeds[currentMapId]) {
                    finalSeed = $gameSystem._proceduralCitySeeds[currentMapId];
                } else {
                    finalSeed = (defaultSeedParam && defaultSeedParam !== "0") ? defaultSeedParam : String(Math.floor(Math.random() * 2147483647) + 1);
                }
            }

            this._currentSeed = finalSeed;
            if (typeof $gameSystem !== "undefined" && $gameSystem && currentMapId > 0) {
                $gameSystem._proceduralCitySeeds = $gameSystem._proceduralCitySeeds || {};
                $gameSystem._proceduralCitySeeds[currentMapId] = finalSeed;
            }

            this._prng.reseed(finalSeed);
            this._buildings = [];
            this._doors = [];
            this._npcs = [];

            console.log(`[ProceduralCityGenerator] Gerando cidade (${this._cityStyle}, ${this._width}x${this._height} tiles, Seed: ${finalSeed})...`);

            const W = this._width;
            const H = this._height;
            const cx = Math.floor(W / 2);
            const cy = Math.floor(H / 2);

            this._grid = {
                district: Array(H).fill(null).map(() => Array(W).fill(CURRENT_DISTRICT_INFO.OUTSKIRTS.id)),
                terrain: Array(H).fill(null).map(() => Array(W).fill(TILES.GRASS)),
                roadType: Array(H).fill(null).map(() => Array(W).fill(0)),
                wallType: Array(H).fill(null).map(() => Array(W).fill(0)),
                roofType: Array(H).fill(null).map(() => Array(W).fill(0)),
                occupied: Array(H).fill(null).map(() => Array(W).fill(false)),
                layer0: Array(H).fill(null).map(() => Array(W).fill(0)),
                layer1: Array(H).fill(null).map(() => Array(W).fill(0)),
                layer2: Array(H).fill(null).map(() => Array(W).fill(0)),
                layer3: Array(H).fill(null).map(() => Array(W).fill(0)),
                shadow: Array(H).fill(null).map(() => Array(W).fill(0))
            };

            // 1. ZONING E DIVISÃO DOS 6 DISTRITOS
            this.buildZoning(W, H, cx, cy);

            // 2. MURALHAS FORTIFICADAS, 4 GRANDES PORTÕES E FOSSO
            this.buildFortifications(W, H, cx, cy);

            // 3. REDE DE AVENIDAS IMPERIAIS & GRANDE PRAÇA CENTRAL
            this.buildRoadsAndPlaza(W, H, cx, cy);

            // 4. EDIFICAÇÕES IMPORTANTES DOS DISTRITOS (XIANXIA OU MEDIEVAL)
            this.buildImportantGuildBuildings(cx, cy);

            // 5. BAIRROS RESIDENCIAIS & CASAS PROCEDURAIS
            this.buildResidentialQuarters(W, H, cx, cy);

            // 6. DECORAÇÕES DETALHADAS (MONUMENTOS, LANTERNAS, BANCAS, ÁRVORES)
            this.buildPropsAndDecorations(W, H, cx, cy);

            // 7. COMPILAÇÃO DAS CAMADAS E AUTOTILING
            this.compileMapLayers(W, H);

            // 8. GERAÇÃO DA POPULAÇÃO DE NPCS VIVOS
            if (enableNpcs) {
                this.generateNpcPopulation(cx, cy);
            }

            // 9. EXPORTA PARA OS DADOS NATIVOS DO RPG MAKER MZ
            this.applyToMapData(mapData, preservePlayerPos);

            console.log(`[ProceduralCityGenerator] Cidade procedural gerada com sucesso! (${this._buildings.length} edifícios, ${this._npcs.length} NPCs).`);
            return this;
        }

        buildZoning(W, H, cx, cy) {
            const grid = this._grid;
            const rCity = Math.min(cx, cy) - 10;
            const info = CURRENT_DISTRICT_INFO;

            for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    const dx = x - cx;
                    const dy = y - cy;
                    const dist = Math.hypot(dx, dy);

                    if (dist > rCity) {
                        grid.district[y][x] = info.OUTSKIRTS.id;
                        continue;
                    }

                    if (Math.abs(dx) <= 13 && Math.abs(dy) <= 13) {
                        grid.district[y][x] = info.PLAZA.id;
                    } else if (dy < -13 && Math.abs(dx) <= 24) {
                        grid.district[y][x] = info.CASTLE.id;
                    } else if (dx > 13 && dy < 10) {
                        grid.district[y][x] = info.CATHEDRAL.id;
                    } else if (dx < -13 && dy < 10) {
                        grid.district[y][x] = info.BARRACKS.id;
                    } else if (dx > 10 && dy >= 10) {
                        grid.district[y][x] = info.DOCKS.id;
                    } else {
                        grid.district[y][x] = info.RESIDENTIAL.id;
                    }
                }
            }
        }

        buildFortifications(W, H, cx, cy) {
            const grid = this._grid;
            const rWall = Math.min(cx, cy) - 14;
            const rMoatInner = rWall + 2;
            const rMoatOuter = rWall + 6;

            for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    const dist = Math.hypot(x - cx, y - cy);

                    if (dist >= rMoatInner && dist <= rMoatOuter) {
                        const isNorthGate = Math.abs(x - cx) <= 3 && y < cy;
                        const isSouthGate = Math.abs(x - cx) <= 3 && y > cy;
                        const isWestGate = Math.abs(y - cy) <= 3 && x < cx;
                        const isEastGate = Math.abs(y - cy) <= 3 && x > cy;

                        if (!isNorthGate && !isSouthGate && !isWestGate && !isEastGate) {
                            grid.terrain[y][x] = TILES.WATER_CANAL;
                            grid.occupied[y][x] = true;
                        } else {
                            grid.terrain[y][x] = TILES.COBBLE_A;
                            grid.roadType[y][x] = TILES.COBBLE_A;
                        }
                    }

                    if (Math.abs(dist - rWall) <= 1.0) {
                        const isNorthGate = Math.abs(x - cx) <= 2 && y < cy;
                        const isSouthGate = Math.abs(x - cx) <= 2 && y > cy;
                        const isWestGate = Math.abs(y - cy) <= 2 && x < cx;
                        const isEastGate = Math.abs(y - cy) <= 2 && x > cy;

                        if (!isNorthGate && !isSouthGate && !isWestGate && !isEastGate) {
                            grid.wallType[y][x] = TILES.WALL_CASTLE;
                            grid.occupied[y][x] = true;
                        } else {
                            grid.district[y][x] = CURRENT_DISTRICT_INFO.GATES.id;
                            grid.roadType[y][x] = TILES.ROAD;
                        }
                    }
                }
            }

            this._spawnPoint = { x: cx, y: cy + rWall + 2 };
        }

        buildRoadsAndPlaza(W, H, cx, cy) {
            const grid = this._grid;
            const rWall = Math.min(cx, cy) - 14;

            // Praça Central (26x26)
            for (let y = cy - 13; y <= cy + 13; y++) {
                for (let x = cx - 13; x <= cx + 13; x++) {
                    grid.terrain[y][x] = TILES.COBBLE_B;
                    grid.roadType[y][x] = TILES.COBBLE_B;
                }
            }

            for (let y = cy - 10; y <= cy + 10; y++) {
                for (let x = cx - 10; x <= cx + 10; x++) {
                    if ((Math.abs(x - cx) + Math.abs(y - cy)) % 4 === 0) {
                        grid.roadType[y][x] = TILES.COBBLE_A;
                    }
                }
            }

            // Grandes Avenidas Imperiais
            for (let y = cy - rWall; y <= cy + rWall; y++) {
                for (let dx = -2; dx <= 2; dx++) {
                    const x = cx + dx;
                    if (x >= 0 && x < W && y >= 0 && y < H) {
                        grid.roadType[y][x] = TILES.ROAD;
                    }
                }
            }
            for (let x = cx - rWall; x <= cx + rWall; x++) {
                for (let dy = -2; dy <= 2; dy++) {
                    const y = cy + dy;
                    if (x >= 0 && x < W && y >= 0 && y < H) {
                        grid.roadType[y][x] = TILES.ROAD;
                    }
                }
            }

            // Anéis Viários Secundários
            const ringR = Math.floor(rWall * 0.65);
            for (let deg = 0; deg < 360; deg += 2) {
                const rad = (deg * Math.PI) / 180;
                const rx = Math.round(cx + ringR * Math.cos(rad));
                const ry = Math.round(cy + ringR * Math.sin(rad));
                for (let ox = -1; ox <= 1; ox++) {
                    for (let oy = -1; oy <= 1; oy++) {
                        const tx = rx + ox;
                        const ty = ry + oy;
                        if (tx >= 0 && tx < W && ty >= 0 && ty < H && !grid.occupied[ty][tx]) {
                            grid.roadType[ty][tx] = TILES.COBBLE_A;
                        }
                    }
                }
            }
        }

        buildImportantGuildBuildings(cx, cy) {
            if (this._cityStyle === "Xianxia" && PrefabsModule) {
                // 1. Estalagem do Vinho Imortal (仙客来客栈 - 12x10)
                const innP = PrefabsModule.getBuilding("IMMORTAL_WINE_INN");
                this.placeBuilding({
                    name: innP.name,
                    type: innP.type,
                    x: cx - 20,
                    y: cy - 12,
                    width: innP.width,
                    height: innP.height,
                    prefab: innP,
                    ownerName: "Estalajadeiro Qian"
                });

                // 2. Forja de Artefatos & Espadas Espirituais (神兵炼器阁 - 10x8)
                const forgeP = PrefabsModule.getBuilding("ARTIFACT_FORGE");
                this.placeBuilding({
                    name: forgeP.name,
                    type: forgeP.type,
                    x: cx - 20,
                    y: cy + 4,
                    width: forgeP.width,
                    height: forgeP.height,
                    prefab: forgeP,
                    ownerName: "Mestre Forjador Tie"
                });

                // 3. Pavilhão de Alquimia & Pílulas da Montanha Celestial (丹药阁 - 10x8)
                const alchP = PrefabsModule.getBuilding("ALCHEMY_PAVILION");
                this.placeBuilding({
                    name: alchP.name,
                    type: alchP.type,
                    x: cx + 10,
                    y: cy - 12,
                    width: alchP.width,
                    height: alchP.height,
                    prefab: alchP,
                    ownerName: "Grão-Mestre Alquimista Mu"
                });

                // 4. Casa de Chá & Salão de Xadrez Weiqi (品茗弈棋阁 - 10x8)
                const teaP = PrefabsModule.getBuilding("TEA_WEIQI_HOUSE");
                this.placeBuilding({
                    name: teaP.name,
                    type: teaP.type,
                    x: cx + 10,
                    y: cy + 4,
                    width: teaP.width,
                    height: teaP.height,
                    prefab: teaP,
                    ownerName: "Mestre do Chá Lu"
                });

                // 5. Palácio do Lorde da Cidade (城主府 - 16x12)
                const palaceP = PrefabsModule.getBuilding("CITY_LORD_PALACE");
                this.placeBuilding({
                    name: palaceP.name,
                    type: palaceP.type,
                    x: cx - 8,
                    y: cy - 36,
                    width: palaceP.width,
                    height: palaceP.height,
                    prefab: palaceP,
                    ownerName: "Lorde Governador Han"
                });

                // 6. Pavilhão de Escrituras e Técnicas Marciais (藏经阁 - 10x10)
                const libP = PrefabsModule.getBuilding("MARTIAL_SCRIPTURE_LIBRARY");
                this.placeBuilding({
                    name: libP.name,
                    type: libP.type,
                    x: cx + 18,
                    y: cy - 24,
                    width: libP.width,
                    height: libP.height,
                    prefab: libP,
                    ownerName: "Ancião Guardião Gu"
                });

                // 7. Pavilhão de Talismãs & Matrizes de Formação (天符阵法阁 - 10x8)
                const talP = PrefabsModule.getBuilding("TALISMAN_PAVILION");
                this.placeBuilding({
                    name: talP.name,
                    type: talP.type,
                    x: cx - 34,
                    y: cy - 24,
                    width: talP.width,
                    height: talP.height,
                    prefab: talP,
                    ownerName: "Mestre das Runas Bai"
                });

                // 8. Mansão Siheyuan de Clã Cultivador (18x18 Modular)
                const siheyuanP = PrefabsModule.getBuilding("SIHEYUAN_CLAN_MANSION");
                if (this.canPlaceBuilding(cx + 14, cy + 14, siheyuanP.width, siheyuanP.height)) {
                    this.placeBuilding({
                        name: siheyuanP.name,
                        type: siheyuanP.type,
                        x: cx + 14,
                        y: cy + 14,
                        width: siheyuanP.width,
                        height: siheyuanP.height,
                        prefab: siheyuanP,
                        ownerName: "Patriarca Xiao Tian"
                    });
                    this.createPathToStreet(cx + 14 + 8, cy + 14 + siheyuanP.height);
                }
                return;
            }

            // Modo Medieval Clássico
            this.placeBuilding({
                name: "A Taverna do Javali Saltitante",
                type: "TAVERN",
                x: cx - 18,
                y: cy - 10,
                width: 9,
                height: 7,
                roofTile: TILES.ROOF_RED,
                wallTile: TILES.WALL_WOOD,
                signTile: TILES.PROP_SIGN_PUB,
                doorSide: "RIGHT",
                interiorType: "Tavern",
                ownerName: "Taverneiro Geraldo"
            });

            this.placeBuilding({
                name: "Ferraria do Martelo Flamejante",
                type: "BLACKSMITH",
                x: cx - 18,
                y: cy + 4,
                width: 8,
                height: 6,
                roofTile: TILES.ROOF_SLATE_BLUE,
                wallTile: TILES.WALL_STONE,
                signTile: TILES.PROP_SIGN_HAMMER,
                doorSide: "RIGHT",
                interiorType: "Blacksmith",
                ownerName: "Mestre Ferreiro Vulkan"
            });

            this.placeBuilding({
                name: "Botica & Alquimia da Flor de Lótus",
                type: "ALCHEMY",
                x: cx + 10,
                y: cy - 10,
                width: 8,
                height: 6,
                roofTile: TILES.ROOF_CRIMSON,
                wallTile: TILES.WALL_PLASTER,
                signTile: TILES.PROP_SIGN_MAGIC,
                doorSide: "LEFT",
                interiorType: "Alchemy",
                ownerName: "Alquimista Mirella"
            });

            this.placeBuilding({
                name: "Empório Mercantil da Praça",
                type: "GENERAL_STORE",
                x: cx + 10,
                y: cy + 4,
                width: 8,
                height: 6,
                roofTile: TILES.ROOF_ORANGE,
                wallTile: TILES.WALL_BRICK,
                signTile: TILES.PROP_SIGN_SACK,
                doorSide: "LEFT",
                interiorType: "GeneralStore",
                ownerName: "Mercador Bernart"
            });

            this.placeBuilding({
                name: "Palácio Ducal de Val-Dourado",
                type: "CASTLE",
                x: cx - 10,
                y: cy - 36,
                width: 20,
                height: 12,
                roofTile: TILES.ROOF_SLATE_BLUE,
                wallTile: TILES.WALL_CASTLE,
                signTile: 0,
                doorSide: "BOTTOM",
                interiorType: "Castle",
                ownerName: "Duque Aldous"
            });

            this.placeBuilding({
                name: "Catedral da Luz Celestial",
                type: "CATHEDRAL",
                x: cx + 18,
                y: cy - 24,
                width: 16,
                height: 11,
                roofTile: TILES.ROOF_TEMPLE,
                wallTile: TILES.WALL_TEMPLE,
                signTile: 0,
                doorSide: "BOTTOM",
                interiorType: "Cathedral",
                ownerName: "Sumo Sacerdote Anselmo"
            });

            this.placeBuilding({
                name: "Quartel-General da Guarda",
                type: "BARRACKS",
                x: cx - 34,
                y: cy - 24,
                width: 14,
                height: 9,
                roofTile: TILES.ROOF_SLATE_BLUE,
                wallTile: TILES.WALL_STONE,
                signTile: TILES.PROP_SIGN_ARMOR,
                doorSide: "BOTTOM",
                interiorType: "Barracks",
                ownerName: "Capitão Rodrik"
            });
        }

        buildResidentialQuarters(W, H, cx, cy) {
            if (this._cityStyle === "Xianxia" && PrefabsModule) {
                const residentNames = [
                    "Cultivador Lu", "Herbalista Wang", "Discípulo Fang", "Dona Mo",
                    "Mestre Chen", "Cultivadora Yan", "Alquimista Aprendiz Song",
                    "Cultivador de Espada Jin", "Padeiro Espiritual Bai", "Ancião Xu",
                    "Costureira Ling", "Artesão Dan", "Cultivador Zhou", "Erudito Wen",
                    "Ferreiro Liu", "Mestra Meiying", "Monge Taoísta He", "Médica Su"
                ];

                const archetypes = ["HERBALIST", "ARTISAN", "SWORD_CULTIVATOR", "SCHOLAR", "TRADITIONAL"];
                const roofOptions = [
                    "ROOF_RUSTIC_THATCH", "ROOF_TIMBER", "ROOF_DARK_SLATE",
                    "ROOF_JADE_EAVE", "ROOF_CRIMSON"
                ];
                const wallOptions = [
                    "WALL_WOOD_LATTICE", "WALL_WHITE_PLASTER", "WALL_GRAY_BRICK",
                    "WALL_TEMPLE_WHITE"
                ];

                let attempts = 0;
                const targetHouses = 22;
                let placedCount = 0;

                while (placedCount < targetHouses && attempts < 400) {
                    attempts++;
                    const archType = archetypes[placedCount % archetypes.length];
                    const bw = this._prng.randomInt(6, 8);
                    const bh = this._prng.randomInt(6, 7);
                    const resident = residentNames[placedCount % residentNames.length];
                    const roof = this._prng.randomChoice(roofOptions);
                    const wall = this._prng.randomChoice(wallOptions);

                    let prefab = null;
                    if (typeof PrefabsModule.assembleModularHouse === "function") {
                        prefab = PrefabsModule.assembleModularHouse({
                            type: archType,
                            width: bw,
                            height: bh,
                            roofType: roof,
                            wallType: wall,
                            residentName: resident
                        });
                    } else {
                        prefab = PrefabsModule.getBuilding(archType === "HERBALIST" ? "HERBALIST_HUT" : "ARTISAN_HOUSE");
                    }

                    const bx = this._prng.chance(70)
                        ? this._prng.randomInt(cx - 38, cx - 12)
                        : this._prng.randomInt(cx + 12, cx + 38);
                    const by = this._prng.chance(70)
                        ? this._prng.randomInt(cy + 10, cy + 34)
                        : this._prng.randomInt(cy - 20, cy + 20);

                    if (this.canPlaceBuilding(bx, by, prefab.width, prefab.height)) {
                        placedCount++;

                        this.placeBuilding({
                            name: prefab.name,
                            type: prefab.type,
                            x: bx,
                            y: by,
                            width: prefab.width,
                            height: prefab.height,
                            prefab: prefab,
                            ownerName: resident
                        });

                        this.createPathToStreet(bx + (prefab.door ? prefab.door.x : Math.floor(prefab.width / 2)), by + prefab.height);
                    }
                }
                return;
            }

            // Modo Medieval
            const houseRoofChoices = [
                TILES.ROOF_RED, TILES.ROOF_CRIMSON, TILES.ROOF_ORANGE,
                TILES.ROOF_WOOD, TILES.ROOF_THATCH, TILES.ROOF_GREEN
            ];
            const houseWallChoices = [
                TILES.WALL_BRICK, TILES.WALL_PLASTER, TILES.WALL_WOOD, TILES.WALL_STONE
            ];
            const residentNames = [
                "Cidadão Marcus", "Ferreiro Aprendiz Lucas", "Costureira Helena",
                "Artesão Bento", "Dona Sofia", "Herbalista Clara", "Carpinteiro Hugo",
                "Mercadora Beatriz", "Guarda Aposentado Jonas", "Padeiro Vicente",
                "Escultor Mateus", "Alquimista Aprendiz Lia", "Capelão Tiago"
            ];

            let attempts = 0;
            const targetHouses = 22;

            while (this._buildings.length < (7 + targetHouses) && attempts < 400) {
                attempts++;
                const bw = this._prng.randomInt(5, 7);
                const bh = this._prng.randomInt(4, 5);

                const bx = this._prng.chance(70)
                    ? this._prng.randomInt(cx - 38, cx - 12)
                    : this._prng.randomInt(cx + 12, cx + 38);
                const by = this._prng.chance(70)
                    ? this._prng.randomInt(cy + 10, cy + 34)
                    : this._prng.randomInt(cy - 20, cy + 20);

                if (this.canPlaceBuilding(bx, by, bw, bh)) {
                    const roof = this._prng.randomChoice(houseRoofChoices);
                    const wall = this._prng.randomChoice(houseWallChoices);
                    const resident = residentNames[(this._buildings.length - 7) % residentNames.length];

                    this.placeBuilding({
                        name: `Residência de ${resident}`,
                        type: "HOUSE",
                        x: bx,
                        y: by,
                        width: bw,
                        height: bh,
                        roofTile: roof,
                        wallTile: wall,
                        signTile: 0,
                        doorSide: "BOTTOM",
                        interiorType: "House",
                        ownerName: resident
                    });

                    this.createPathToStreet(bx + Math.floor(bw / 2), by + bh);
                }
            }
        }

        canPlaceBuilding(x, y, w, h) {
            const grid = this._grid;
            const W = this._width;
            const H = this._height;

            if (x < 14 || x + w >= W - 14 || y < 14 || y + h >= H - 14) return false;

            for (let ty = y - 1; ty <= y + h + 1; ty++) {
                for (let tx = x - 1; tx <= x + w + 1; tx++) {
                    if (grid.occupied[ty][tx]) return false;
                    if (grid.roadType[ty][tx] === TILES.ROAD) return false;
                    if (grid.terrain[ty][tx] === TILES.WATER_CANAL) return false;
                }
            }
            return true;
        }

        placeBuilding(info) {
            const grid = this._grid;
            const { x, y, width, height, roofTile, wallTile, doorSide, prefab } = info;

            if (prefab && PrefabsModule) {
                // Carimbo 1:1 das 4 camadas do prefab
                for (let by = 0; by < height; by++) {
                    for (let bx = 0; bx < width; bx++) {
                        const tx = x + bx;
                        const ty = y + by;
                        if (tx >= 0 && tx < this._width && ty >= 0 && ty < this._height) {
                            grid.occupied[ty][tx] = true;
                            const t0 = PrefabsModule.resolveTile(prefab.exterior.layer0[by][bx]);
                            const t1 = PrefabsModule.resolveTile(prefab.exterior.layer1[by][bx]);
                            const t2 = PrefabsModule.resolveTile(prefab.exterior.layer2[by][bx]);
                            const t3 = PrefabsModule.resolveTile(prefab.exterior.layer3[by][bx]);

                            if (t0 > 0) grid.layer0[ty][tx] = t0;
                            if (t1 > 0) {
                                if (t1 >= 4352 && t1 < 5888) {
                                    grid.roofType[ty][tx] = t1;
                                } else if (t1 >= 5888) {
                                    grid.wallType[ty][tx] = t1;
                                } else {
                                    grid.layer1[ty][tx] = t1;
                                }
                            }
                            if (t2 > 0) grid.layer2[ty][tx] = t2;
                            if (t3 > 0) grid.layer3[ty][tx] = t3;
                        }
                    }
                }

                let doorX = x + (prefab.door ? prefab.door.x : Math.floor(width / 2));
                let doorY = y + (prefab.door ? prefab.door.y : height - 1);
                info.doorX = doorX;
                info.doorY = doorY;
                info.interiorPrefab = prefab.interior;
                info.npcs = prefab.npcs;
            } else {
                const roofH = Math.max(2, height - 2);

                for (let by = 0; by < height; by++) {
                    for (let bx = 0; bx < width; bx++) {
                        const tx = x + bx;
                        const ty = y + by;
                        grid.occupied[ty][tx] = true;

                        if (by < roofH) {
                            grid.roofType[ty][tx] = roofTile;
                        } else {
                            grid.wallType[ty][tx] = wallTile;
                        }
                    }
                }

                let doorX = x + Math.floor(width / 2);
                let doorY = y + height - 1;

                if (doorSide === "LEFT") {
                    doorX = x;
                    doorY = y + height - 1;
                } else if (doorSide === "RIGHT") {
                    doorX = x + width - 1;
                    doorY = y + height - 1;
                }

                info.doorX = doorX;
                info.doorY = doorY;
            }

            this._doors.push({ x: info.doorX, y: info.doorY, building: info });
            this._buildings.push(info);

            // Sombra do edifício à direita (0x0f = sombra completa)
            for (let by = 0; by < height; by++) {
                const sx = x + width;
                const sy = y + by + 1;
                if (sx < this._width && sy < this._height) {
                    grid.shadow[sy][sx] = 15;
                }
            }
        }

        createPathToStreet(startX, startY) {
            const grid = this._grid;
            let cx = startX;
            let cy = startY;
            const maxSteps = 12;

            for (let i = 0; i < maxSteps; i++) {
                if (cy + 1 < this._height && !grid.occupied[cy + 1][cx]) {
                    cy++;
                    if (grid.roadType[cy][cx] === TILES.ROAD) break;
                    grid.roadType[cy][cx] = TILES.COBBLE_A;
                }
            }
        }

        buildPropsAndDecorations(W, H, cx, cy) {
            const grid = this._grid;

            // 1. Chafariz / Monumento Central da Praça
            const fx = cx - 2;
            const fy = cy - 2;
            for (let y = fy; y <= fy + 3; y++) {
                for (let x = fx; x <= fx + 3; x++) {
                    grid.terrain[y][x] = TILES.WATER_CANAL;
                }
            }

            if (this._cityStyle === "Xianxia" && PrefabsModule) {
                const P = PrefabsModule.XianxiaPalette;
                grid.layer2[fy + 1][fx + 1] = P.resolve("PROP_QILIN_STATUE_TOP");
                grid.layer2[fy + 2][fx + 1] = P.resolve("PROP_QILIN_STATUE_BASE");
                grid.layer2[fy + 1][fx + 2] = P.resolve("PROP_IMMORTAL_STATUE_TOP");
                grid.layer2[fy + 2][fx + 2] = P.resolve("PROP_IMMORTAL_STATUE_BASE");

                // Lanternas de Pedra orientais
                const lP = P.resolve("PROP_LANTERN_STONE");
                grid.layer2[cy - 12][cx - 12] = lP;
                grid.layer2[cy - 12][cx + 12] = lP;
                grid.layer2[cy + 12][cx - 12] = lP;
                grid.layer2[cy + 12][cx + 12] = lP;
            } else {
                grid.layer2[fy + 1][fx + 1] = TILES.PROP_C_ANGEL_TOP;
                grid.layer2[fy + 2][fx + 1] = TILES.PROP_C_ANGEL_BASE;
                grid.layer2[fy + 1][fx + 2] = TILES.PROP_C_STATUE_TOP;
                grid.layer2[fy + 2][fx + 2] = TILES.PROP_C_STATUE_BASE;

                grid.layer2[cy - 12][cx - 12] = TILES.PROP_STREETLIGHT_BASE;
                grid.layer3[cy - 13][cx - 12] = TILES.PROP_STREETLIGHT_TOP;
                grid.layer2[cy - 12][cx + 12] = TILES.PROP_STREETLIGHT_BASE;
                grid.layer3[cy - 13][cx + 12] = TILES.PROP_STREETLIGHT_TOP;
                grid.layer2[cy + 12][cx - 12] = TILES.PROP_STREETLIGHT_BASE;
                grid.layer3[cy + 11][cx - 12] = TILES.PROP_STREETLIGHT_TOP;
                grid.layer2[cy + 12][cx + 12] = TILES.PROP_STREETLIGHT_BASE;
                grid.layer3[cy + 11][cx + 12] = TILES.PROP_STREETLIGHT_TOP;
            }

            // Postes ao longo das Avenidas Imperiais
            for (let y = cy - 36; y <= cy + 36; y += 8) {
                if (Math.abs(y - cy) > 13) {
                    grid.layer2[y][cx - 3] = TILES.PROP_STREETLIGHT_BASE;
                    grid.layer3[y - 1][cx - 3] = TILES.PROP_STREETLIGHT_TOP;
                    grid.layer2[y][cx + 3] = TILES.PROP_STREETLIGHT_BASE;
                    grid.layer3[y - 1][cx + 3] = TILES.PROP_STREETLIGHT_TOP;
                }
            }

            // 2. Bancas de Mercado na Praça
            const marketStallCoords = [
                { x: cx - 8, y: cy - 7, sign: TILES.PROP_SIGN_SWORD },
                { x: cx - 4, y: cy - 7, sign: TILES.PROP_SIGN_SACK },
                { x: cx + 4, y: cy - 7, sign: TILES.PROP_SIGN_MAGIC },
                { x: cx + 8, y: cy - 7, sign: TILES.PROP_SIGN_ARMOR },
                { x: cx - 8, y: cy + 7, sign: TILES.PROP_SIGN_PUB },
                { x: cx - 4, y: cy + 7, sign: TILES.PROP_SIGN_HAMMER },
                { x: cx + 4, y: cy + 7, sign: TILES.PROP_SIGN_SACK },
                { x: cx + 8, y: cy + 7, sign: TILES.PROP_SIGN_PUB }
            ];

            marketStallCoords.forEach(stall => {
                grid.layer2[stall.y][stall.x] = TILES.PROP_CRATE_A;
                grid.layer2[stall.y][stall.x + 1] = TILES.PROP_BARREL;
                grid.layer3[stall.y - 1][stall.x] = stall.sign;
                grid.occupied[stall.y][stall.x] = true;
                grid.occupied[stall.y][stall.x + 1] = true;
            });

            // 3. Vegetação e Bambuzais em áreas livres
            for (let y = 14; y < H - 14; y += 3) {
                for (let x = 14; x < W - 14; x += 3) {
                    if (!grid.occupied[y][x] && grid.roadType[y][x] === 0 && grid.terrain[y][x] === TILES.GRASS) {
                        if (this._prng.chance(25)) {
                            grid.layer2[y][x] = TILES.PROP_TREE_TRUNK;
                            grid.layer3[y - 1][x] = TILES.PROP_TREE_TOP;
                            grid.occupied[y][x] = true;
                        } else if (this._prng.chance(20)) {
                            grid.layer2[y][x] = this._prng.randomChoice([
                                TILES.PROP_FLOWERS_A,
                                TILES.PROP_FLOWERS_B,
                                TILES.PROP_FLOWERS_C,
                                TILES.PROP_FLOWERS_D
                            ]);
                        } else if (this._prng.chance(10)) {
                            grid.layer2[y][x] = TILES.PROP_BARREL;
                        }
                    }
                }
            }
        }

        compileMapLayers(W, H) {
            const grid = this._grid;

            for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    // Camada 0: Terreno Inferior (Água, Grama)
                    if (grid.terrain[y][x] === TILES.WATER_CANAL) {
                        const isWater = (tx, ty) => {
                            if (tx < 0 || tx >= W || ty < 0 || ty >= H) return true;
                            return grid.terrain[ty][tx] === TILES.WATER_CANAL;
                        };
                        const shape = getFloorAutotileShape(
                            isWater(x, y - 1), isWater(x, y + 1),
                            isWater(x - 1, y), isWater(x + 1, y),
                            isWater(x - 1, y - 1), isWater(x + 1, y - 1),
                            isWater(x - 1, y + 1), isWater(x + 1, y + 1)
                        );
                        grid.layer0[y][x] = TILES.WATER_CANAL + shape;
                    } else if (grid.layer0[y][x] === 0) {
                        grid.layer0[y][x] = TILES.GRASS;
                    }

                    // Camada 1: Estradas, Telhados e Paredes
                    if (grid.roofType[y][x] > 0) {
                        const baseRoof = grid.roofType[y][x];
                        const isSameRoof = (tx, ty) => {
                            if (tx < 0 || tx >= W || ty < 0 || ty >= H) return false;
                            return grid.roofType[ty][tx] === baseRoof;
                        };
                        const shape = getWallAutotileShape(
                            isSameRoof(x, y - 1), isSameRoof(x, y + 1),
                            isSameRoof(x - 1, y), isSameRoof(x + 1, y)
                        );
                        grid.layer1[y][x] = baseRoof + shape;
                    } else if (grid.wallType[y][x] > 0) {
                        const baseWall = grid.wallType[y][x];
                        const isSameWall = (tx, ty) => {
                            if (tx < 0 || tx >= W || ty < 0 || ty >= H) return false;
                            return grid.wallType[ty][tx] === baseWall;
                        };

                        if (isWallAutotileTile(baseWall)) {
                            const shape = getWallAutotileShape(
                                isSameWall(x, y - 1), isSameWall(x, y + 1),
                                isSameWall(x - 1, y), isSameWall(x + 1, y)
                            );
                            grid.layer1[y][x] = baseWall + shape;
                        } else {
                            const shape = getFloorAutotileShape(
                                isSameWall(x, y - 1), isSameWall(x, y + 1),
                                isSameWall(x - 1, y), isSameWall(x + 1, y),
                                isSameWall(x - 1, y - 1), isSameWall(x + 1, y - 1),
                                isSameWall(x - 1, y + 1), isSameWall(x + 1, y + 1)
                            );
                            grid.layer1[y][x] = baseWall + shape;
                        }
                    } else if (grid.roadType[y][x] > 0) {
                        const baseRoad = grid.roadType[y][x];
                        const isSameRoad = (tx, ty) => {
                            if (tx < 0 || tx >= W || ty < 0 || ty >= H) return false;
                            return grid.roadType[ty][tx] === baseRoad;
                        };
                        const shape = getFloorAutotileShape(
                            isSameRoad(x, y - 1), isSameRoad(x, y + 1),
                            isSameRoad(x - 1, y), isSameRoad(x + 1, y),
                            isSameRoad(x - 1, y - 1), isSameRoad(x + 1, y - 1),
                            isSameRoad(x - 1, y + 1), isSameRoad(x + 1, y + 1)
                        );
                        grid.layer1[y][x] = baseRoad + shape;
                    }
                }
            }
        }

        generateNpcPopulation(cx, cy) {
            const npcs = [];
            let eventId = 1;

            const createEventData = (name, x, y, charName, charIndex, moveType, messages, customScript = null) => {
                const list = [];
                if (customScript) {
                    list.push({ code: 355, indent: 0, parameters: [customScript] });
                } else if (messages && messages.length > 0) {
                    list.push({ code: 101, indent: 0, parameters: [charName, charIndex, 0, 2, name] });
                    messages.forEach(msg => {
                        list.push({ code: 401, indent: 0, parameters: [msg] });
                    });
                }
                list.push({ code: 0, indent: 0, parameters: [] });

                return {
                    id: eventId++,
                    name: name,
                    x: x,
                    y: y,
                    pages: [
                        {
                            conditions: {
                                actorId: 1, actorValid: false,
                                itemId: 1, itemValid: false,
                                selfSwitchCh: "A", selfSwitchValid: false,
                                switch1Id: 1, switch1Valid: false,
                                switch2Id: 1, switch2Valid: false,
                                variableId: 1, variableValid: false, variableValue: 0
                            },
                            directionFix: false,
                            image: { characterIndex: charIndex, characterName: charName, direction: 2, pattern: 1, tileId: 0 },
                            list: list,
                            moveFrequency: 3,
                            moveRoute: { list: [{ code: 0, parameters: [] }], repeat: true, skippable: false, wait: false },
                            moveSpeed: 3,
                            moveType: moveType,
                            priorityType: 1,
                            stepAnime: false,
                            walkAnime: true,
                            through: false,
                            trigger: 0
                        }
                    ]
                };
            };

            const rWall = Math.min(cx, cy) - 14;

            if (this._cityStyle === "Xianxia") {
                // Sentinelas dos 4 Portões
                npcs.push(createEventData("Sentinela Daoísta do Sul", cx - 1, cy + rWall - 1, "People3", 4, 0, [
                    "Bem-vindo à Cidade Imortal, cultivador!",
                    "Mantenha seu Qi em equilíbrio e embainhe sua espada voadora dentro das muralhas."
                ]));
                npcs.push(createEventData("Sentinela do Portão Norte", cx - 1, cy - rWall + 1, "People3", 4, 0, [
                    "Atenção nas cordilheiras do Norte. Bestas espirituais de 2º Grau rondam as colinas.",
                    "Pode entrar com segurança na cidade."
                ]));
                npcs.push(createEventData("Guarda do Portão Leste", cx + rWall - 1, cy - 1, "People1", 0, 0, [
                    "O cais fluvial e o Pavilhão de Escrituras ficam a leste. Que os Céus iluminem seu cultivo."
                ]));
                npcs.push(createEventData("Guarda do Portão Oeste", cx - rWall + 1, cy - 1, "People1", 0, 0, [
                    "Você está entrando pelo setor de Matrizes e Forja. Cuidado com o calor das fornalhas espirituais."
                ]));

                // Mestres Comerciantes
                npcs.push(createEventData("Estalajadeiro Qian", cx - 13, cy - 8, "People2", 2, 0, null,
                    `CityGenerator.openTavernMenu();`
                ));
                npcs.push(createEventData("Mestre Forjador Tie", cx - 13, cy + 6, "People2", 3, 0, null,
                    `CityGenerator.openBlacksmithShop();`
                ));
                npcs.push(createEventData("Grão-Mestre Alquimista Mu", cx + 13, cy - 8, "People1", 6, 0, null,
                    `CityGenerator.openAlchemyShop();`
                ));
                npcs.push(createEventData("Mestre do Chá Lu", cx + 13, cy + 6, "People3", 2, 0, null,
                    `CityGenerator.openTeaTasting();`
                ));
                npcs.push(createEventData("Ancião Guardião Gu", cx + 26, cy - 16, "People3", 0, 0, null,
                    `CityGenerator.openScriptureBlessing();`
                ));
                npcs.push(createEventData("Lorde Governador Han", cx, cy - 23, "People4", 0, 0, [
                    "Bem-vindo à nossa Cidade Espiritual, nobre praticante do Dao.",
                    "Esta cidade é o porto seguro entre o mundo mortal e as grandes montanhas celestiais.",
                    "Cultive com diligência e respeite as ordens da província."
                ]));
                npcs.push(createEventData("General Zhao", cx - 27, cy - 16, "People1", 2, 0, [
                    "Em guarda, cultivador! Se buscar missões de caça a feras espirituais,",
                    "nossos batedores estão sempre à procura de espadas corajosas."
                ]));

                // Cultivadores e Cidadãos
                const citizenSprites = [
                    { name: "People1", index: 1, title: "Dama da Seita Floral", msg: "O aroma das flores espirituais na praça ajuda a acalmar o Qi turbulento." },
                    { name: "People1", index: 3, title: "Jovem Cultivador Teo", msg: "Você já alcançou o Estabelecimento de Fundação?! Um dia voarei em minha própria espada!" },
                    { name: "People1", index: 4, title: "Cultivador Andarilho Pedro", msg: "O vinho de pêssego da longevidade da Estalagem Imortal está excelente este ano!" },
                    { name: "People2", index: 4, title: "Vendedora de Frutas de Qi", msg: "Frutas espirituais colhidas ao amanhecer! Fortaleçam sua vitalidade!" },
                    { name: "People2", index: 5, title: "Ancião Pescador Barnabé", msg: "Dizem que nas profundezas do rio há carpas douradas ancestrais com escamas de dragão." },
                    { name: "People3", index: 2, title: "Mestre Daoísta", msg: "O Dao segue a natureza. Não se apresse em romper os reinos de cultivo." },
                    { name: "People3", index: 4, title: "Guarda Cultivador", msg: "Muralhas protegidas por matrizes garantem a meditação pacífica de todos." },
                    { name: "People4", index: 2, title: "Mestre Artesão", msg: "O jade e os talismãs gravados em nossa cidade são conhecidos por todos os reinos." }
                ];

                const grid = this._grid;
                for (let i = 0; i < targetNpcCount - npcs.length; i++) {
                    const spec = citizenSprites[i % citizenSprites.length];
                    let placed = false;
                    let cTries = 0;
                    while (!placed && cTries < 60) {
                        cTries++;
                        const rx = this._prng.randomInt(cx - 30, cx + 30);
                        const ry = this._prng.randomInt(cy - 30, cy + 30);
                        if (grid.roadType[ry][rx] > 0 && !grid.occupied[ry][rx]) {
                            npcs.push(createEventData(spec.title, rx, ry, spec.name, spec.index, 1, [spec.msg]));
                            grid.occupied[ry][rx] = true;
                            placed = true;
                        }
                    }
                }
            } else {
                // Modo Medieval
                npcs.push(createEventData("Sentinela do Sul", cx - 1, cy + rWall - 1, "People1", 0, 0, [
                    "Bem-vindo à Cidadela de Val-Dourado, viajante!",
                    "Mantenha sua espada embainhada dentro dos muros e aproveite a hospitalidade."
                ]));
                npcs.push(createEventData("Sentinela do Norte", cx - 1, cy - rWall + 1, "People1", 0, 0, [
                    "Atenção nos caminhos do Norte. Criaturas selvagens rondam as colinas.",
                    "Pode entrar com segurança na cidade."
                ]));
                npcs.push(createEventData("Guarda do Portão Leste", cx + rWall - 1, cy - 1, "People1", 0, 0, [
                    "O cais do canal e o templo ficam a leste. Paz em seu caminho."
                ]));
                npcs.push(createEventData("Guarda do Portão Oeste", cx - rWall + 1, cy - 1, "People1", 0, 0, [
                    "Você está entrando pelo Distrito Militar. Tenha respeito aos soldados em treino."
                ]));

                npcs.push(createEventData("Taverneiro Geraldo", cx - 13, cy - 8, "People2", 2, 0, null,
                    `CityGenerator.openTavernMenu();`
                ));
                npcs.push(createEventData("Mestre Ferreiro Vulkan", cx - 13, cy + 6, "People2", 3, 0, null,
                    `CityGenerator.openBlacksmithShop();`
                ));
                npcs.push(createEventData("Alquimista Mirella", cx + 13, cy - 8, "People1", 6, 0, null,
                    `CityGenerator.openAlchemyShop();`
                ));
                npcs.push(createEventData("Mercador Bernart", cx + 13, cy + 6, "People2", 0, 0, null,
                    `CityGenerator.openGeneralShop();`
                ));
                npcs.push(createEventData("Sumo Sacerdote Anselmo", cx + 26, cy - 16, "People3", 0, 0, null,
                    `CityGenerator.openTempleBlessing();`
                ));
                npcs.push(createEventData("Duque Aldous de Val-Dourado", cx, cy - 23, "People4", 0, 0, [
                    "Seja bem-vindo ao coração do meu ducado, Nobre Viajante.",
                    "Nossa cidade prospera graças ao comércio justo, à coragem da guarda e à bênção da Catedral.",
                    "Sinta-se em casa em Val-Dourado."
                ]));
                npcs.push(createEventData("Capitão Rodrik", cx - 27, cy - 16, "People1", 2, 0, [
                    "Em guarda, soldado! Se estiver buscando missões ou recompensas por monstros,",
                    "nossos batedores estão sempre à procura de espadas corajosas."
                ]));

                const citizenSprites = [
                    { name: "People1", index: 1, title: "Dama Rosalinda", msg: "Que dia radiante para passear pela praça! As flores estão perfumadas." },
                    { name: "People1", index: 3, title: "Menino Teo", msg: "Você é um aventureiro de verdade?! Um dia serei cavaleiro do Duque!" },
                    { name: "People1", index: 4, title: "Cidadão Pedro", msg: "A cerveja da Taverna do Javali está excelente nesta estação!" },
                    { name: "People2", index: 4, title: "Vendedora Agnes", msg: "Frutas frescas da colheita! Maçãs doces e pães quentinhos!" },
                    { name: "People2", index: 5, title: "Velho Barnabé", msg: "Dizem que nas profundezas do canal fluvial há tesouros de galeões antigos." },
                    { name: "People3", index: 2, title: "Monge Devoto", msg: "A paz seja com você. Não deixe de fazer uma prece no Santuário da Luz." },
                    { name: "People3", index: 4, title: "Cavaleiro em Guarda", msg: "Muralhas firmes garantem o sono tranquilo do povo." },
                    { name: "People4", index: 2, title: "Artesão Mestre", msg: "A cerâmica e o aço de Val-Dourado são conhecidos por todos os reinos." }
                ];

                const grid = this._grid;
                for (let i = 0; i < targetNpcCount - npcs.length; i++) {
                    const spec = citizenSprites[i % citizenSprites.length];
                    let placed = false;
                    let cTries = 0;
                    while (!placed && cTries < 60) {
                        cTries++;
                        const rx = this._prng.randomInt(cx - 30, cx + 30);
                        const ry = this._prng.randomInt(cy - 30, cy + 30);
                        if (grid.roadType[ry][rx] > 0 && !grid.occupied[ry][rx]) {
                            npcs.push(createEventData(spec.title, rx, ry, spec.name, spec.index, 1, [spec.msg]));
                            grid.occupied[ry][rx] = true;
                            placed = true;
                        }
                    }
                }
            }

            // Portas Interativas de Todos os Edifícios
            this._doors.forEach((door, index) => {
                const doorEvent = {
                    id: eventId++,
                    name: `Porta: ${door.building.name}`,
                    x: door.x,
                    y: door.y,
                    pages: [
                        {
                            conditions: {
                                actorId: 1, actorValid: false,
                                itemId: 1, itemValid: false,
                                selfSwitchCh: "A", selfSwitchValid: false,
                                switch1Id: 1, switch1Valid: false,
                                switch2Id: 1, switch2Valid: false,
                                variableId: 1, variableValid: false, variableValue: 0
                            },
                            directionFix: false,
                            image: { characterIndex: 0, characterName: "!Door1", direction: 2, pattern: 0, tileId: 0 },
                            list: [
                                { code: 250, indent: 0, parameters: [{ name: "Door1", volume: 90, pitch: 100, pan: 0 }] },
                                { code: 355, indent: 0, parameters: [`CityGenerator.enterBuilding(${index});`] },
                                { code: 0, indent: 0, parameters: [] }
                            ],
                            moveFrequency: 3,
                            moveRoute: { list: [{ code: 0, parameters: [] }], repeat: true, skippable: false, wait: false },
                            moveSpeed: 3,
                            moveType: 0,
                            priorityType: 1,
                            stepAnime: false,
                            walkAnime: false,
                            through: false,
                            trigger: 0
                        }
                    ]
                };
                npcs.push(doorEvent);
            });

            this._npcs = npcs;
        }

        applyToMapData(mapData, preservePlayerPos = false) {
            const W = this._width;
            const H = this._height;
            const grid = this._grid;

            mapData.width = W;
            mapData.height = H;
            mapData.tilesetId = 2; // Tileset Exterior oficial

            const totalTiles = W * H * 6;
            mapData.data = new Array(totalTiles).fill(0);

            const setTile = (x, y, z, val) => {
                mapData.data[(z * H + y) * W + x] = val || 0;
            };

            for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    setTile(x, y, 0, grid.layer0[y][x]);
                    setTile(x, y, 1, grid.layer1[y][x]);
                    setTile(x, y, 2, grid.layer2[y][x]);
                    setTile(x, y, 3, grid.layer3[y][x]);
                    setTile(x, y, 4, grid.shadow[y][x]);
                    setTile(x, y, 5, grid.district[y][x]);
                }
            }

            mapData.events = [null];
            this._npcs.forEach(ev => {
                mapData.events.push(ev);
            });

            if (!preservePlayerPos && typeof $gamePlayer !== "undefined" && $gamePlayer) {
                if ($gamePlayer.x === 0 && $gamePlayer.y === 0) {
                    $gamePlayer.locate(this._spawnPoint.x, this._spawnPoint.y);
                    $gamePlayer.setDirection(8);
                }
            }
        }

        // =====================================================================
        // 7. SISTEMA DE INTERIORES (DEDICADOS OU VIRTUAIS)
        // =====================================================================
        enterBuilding(doorIndex) {
            const door = this._doors[doorIndex];
            if (!door || !door.building) return;

            const b = door.building;
            if (typeof SoundManager !== "undefined" && typeof SoundManager.playDoor === "function") {
                SoundManager.playDoor();
            } else if (typeof AudioManager !== "undefined" && AudioManager && AudioManager.playSe) {
                AudioManager.playSe({ name: "Door1", volume: 90, pitch: 100, pan: 0 });
            }

            if (interiorMapId > 0) {
                $gameSystem._cityReturnMapId = $gameMap.mapId();
                $gameSystem._cityReturnX = door.x;
                $gameSystem._cityReturnY = door.y + 1;
                $gameSystem._cityReturnDir = 2;
                $gameSystem._cityCurrentInterior = b;

                const exDoor = (b.interiorPrefab && b.interiorPrefab.exitDoor) ? b.interiorPrefab.exitDoor : { x: 8, y: 12 };
                $gamePlayer.reserveTransfer(interiorMapId, exDoor.x, Math.max(0, exDoor.y - 1), 8, 0);
            } else {
                this.showVirtualInteriorScene(b);
            }
        }

        showVirtualInteriorScene(b) {
            $gameMessage.clear();
            $gameMessage.setFaceImage("People1", 0);
            $gameMessage.setBackground(0);
            $gameMessage.setPositionType(2);

            let desc = "";
            let choices = [];

            if (b.type === "IMMORTAL_WINE_INN" || b.type === "TAVERN") {
                desc = `Você adentra ${b.name}.\nO calor suave e o inebriante aroma de vinho de arroz espiritual preenchem o salão onde cultivadores descansam de suas jornadas.`;
                choices = ["🍶 Degustar Vinho Espiritual & Descansar (10 Moedas)", "📜 Ouvir Rumores do Mundo Marcial", "🚪 Sair para a Rua"];
            } else if (b.type === "ALCHEMY_PAVILION" || b.type === "ALCHEMY") {
                desc = `Você entra no ${b.name}.\nO calor brando dos fornos caldeirões Ding e o aroma de centenas de ervas medicinais purificam seus meridianos.`;
                choices = ["🧪 Adquirir Pílulas & Elixires de Qi", "✨ Consultar o Mestre Alquimista", "🚪 Sair para a Rua"];
            } else if (b.type === "ARTIFACT_FORGE" || b.type === "BLACKSMITH") {
                desc = `Você entra na ${b.name}.\nFaíscas de chamas espirituais e o bater compassado na bigorna ecoam entre fileiras de espadas voadoras reluzentes.`;
                choices = ["⚔️ Comprar Espadas Espirituais & Artefatos", "🔨 Conversar com o Mestre Forjador", "🚪 Sair para a Rua"];
            } else if (b.type === "TEA_WEIQI_HOUSE") {
                desc = `Você entra na ${b.name}.\nO som sutil de pedras de Go tocando o tabuleiro e o vapor aromático do chá gongfu acalmam as agitações do Qi.`;
                choices = ["🍵 Cerimônia do Chá Espiritual (Recuperar Qi)", "♟️ Ouvir Estratégias do Mestre", "🚪 Sair para a Rua"];
            } else if (b.type === "TALISMAN_PAVILION") {
                desc = `Você entra no ${b.name}.\nPergaminhos inscritos em cinábrio dourado flutuam suavemente, protegidos por pequenas barreiras de matrizes defensivas.`;
                choices = ["📜 Comprar Talismãs Rúnicos & Bandeiras de Matriz", "🔮 Conversar sobre Formações", "🚪 Sair para a Rua"];
            } else if (b.type === "MARTIAL_SCRIPTURE_LIBRARY" || b.type === "CATHEDRAL") {
                desc = `Você entra no ${b.name}.\nMilhares de manuais de técnicas marciais e jades de transmissão repousam em estantes monumentais em solene silêncio.`;
                choices = ["🙏 Receber Bênção de Compreensão do Dao", "📖 Consultar Manuais Antigos", "🚪 Sair para a Rua"];
            } else if (b.type === "SIHEYUAN_CLAN_MANSION") {
                desc = `Você adentra a ${b.name}.\nO imponente salão do clã exibe estandartes de dragões e a lendária espada ancestral da linhagem fundadora.`;
                choices = ["👑 Prestar Respeito ao Patriarca Xiao", "⚔️ Falar com o Discípulo de Guarda", "🚪 Sair para a Rua"];
            } else if (b.type === "CITY_LORD_PALACE" || b.type === "CASTLE") {
                desc = `Você entra no ${b.name}.\nPilares de mármore e guardas de elite protegem o salão de audiência do Soberano desta cidade imortal.`;
                choices = ["👑 Cumprimentar o Lorde Governador Han", "📜 Consultar Decretos da Província", "🚪 Sair para a Rua"];
            } else if (b.type === "HERBALIST_HUT" || b.type === "HOUSE_HERBALIST") {
                desc = `Você entra na ${b.name}.\nErvas medicinais penduradas secam ao calor de um pequeno caldeirão de barro sob o olhar tranquilo do herbalista.`;
                choices = ["🌿 Comprar Ervas Medicinais", "🧘 Meditar no Futon de Cultivo", "🚪 Sair para a Rua"];
            } else if (b.type === "ARTISAN_HOUSE" || b.type === "HOUSE_ARTISAN") {
                desc = `Você entra na ${b.name}.\nBancadas com cinzéis de jade, pedras espirituais brutas e biombos tradicionais revelam a arte do mestre artesão.`;
                choices = ["💎 Conversar sobre Esculturas de Jade", "🛋️ Descansar no Aposento", "🚪 Sair para a Rua"];
            } else if (b.type === "SWORD_CULTIVATOR_RETREAT" || b.type === "HOUSE_SWORD_CULTIVATOR") {
                desc = `Você entra no ${b.name}.\nEspadas afiadas repousam em suportes de jacarandá e o ar vibra com uma pura e cortante intenção de espada.`;
                choices = ["⚔️ Pedir Conselhos sobre Esgrima Espiritual", "🧘 Meditar no Futon de Espada", "🚪 Sair para a Rua"];
            } else if (b.type === "SCHOLAR_STUDIO" || b.type === "HOUSE_SCHOLAR") {
                desc = `Você entra no ${b.name}.\nO aroma suave de cinábrio fresco e pergaminhos milenares preenche o ambiente solene de erudição.`;
                choices = ["📜 Ouvir Crônicas e Sabedoria Antiga", "🍵 Tomar Chá com o Erudito", "🚪 Sair para a Rua"];
            } else if (b.type === "TRADITIONAL_DWELLING" || b.type === "HOUSE_TRADITIONAL") {
                desc = `Você entra na ${b.name}.\nUma residência tradicional com piso de madeira laqueada, biombos delicados e acolhedor aroma de incenso doméstico.`;
                choices = ["💬 Conversar com o Anfitrião", "🛋️ Descansar no Aposento", "🚪 Sair para a Rua"];
            } else if (b.type === "BARRACKS") {
                desc = `Você entra no ${b.name}.\nSoldados em formação afiam suas lâminas ao redor de um grande mapa estratégico do reino.`;
                choices = ["⚔️ Conversar com o Capitão", "🛡️ Examinar o Arsenal", "🚪 Sair para a Rua"];
            } else {
                desc = `Você entra na ${b.name}.\nUma residência aconchegante com chão de madeira, lareira aquecida e cheiro de comida caseira.`;
                choices = ["💬 Conversar com o Morador", "🛋️ Descansar no Aposento", "🚪 Sair para a Rua"];
            }

            $gameMessage.add(`\\c[6]【 ${b.name} 】\\c[0]\n${desc}`);
            $gameMessage.setChoices(choices, 0, choices.length - 1);
            $gameMessage.setChoiceCallback(n => {
                if (n === 0) {
                    if (b.type === "IMMORTAL_WINE_INN" || b.type === "TAVERN") this.openTavernMenu();
                    else if (b.type === "ALCHEMY_PAVILION" || b.type === "ALCHEMY") this.openAlchemyShop();
                    else if (b.type === "ARTIFACT_FORGE" || b.type === "BLACKSMITH") this.openBlacksmithShop();
                    else if (b.type === "TEA_WEIQI_HOUSE") this.openTeaTasting();
                    else if (b.type === "TALISMAN_PAVILION") this.openTalismanShop();
                    else if (b.type === "MARTIAL_SCRIPTURE_LIBRARY") this.openScriptureBlessing();
                    else if (b.type === "CATHEDRAL") this.openTempleBlessing();
                    else if (b.type === "SIHEYUAN_CLAN_MANSION") this.talkToClanPatriarch();
                    else if (b.type === "CITY_LORD_PALACE") this.talkToCityLord();
                    else if (b.type === "CASTLE") this.talkToDuke();
                    else if (b.type === "HERBALIST_HUT" || b.type === "HOUSE_HERBALIST") this.openHerbalistShop();
                    else if (b.type === "SWORD_CULTIVATOR_RETREAT" || b.type === "HOUSE_SWORD_CULTIVATOR") this.talkToSwordCultivator(b.ownerName);
                    else if (b.type === "SCHOLAR_STUDIO" || b.type === "HOUSE_SCHOLAR") this.talkToScholar(b.ownerName);
                    else if (b.type === "TRADITIONAL_DWELLING" || b.type === "HOUSE_TRADITIONAL") this.restAtDwelling(b.ownerName);
                    else if (b.type === "ARTISAN_HOUSE" || b.type === "HOUSE_ARTISAN") this.talkGeneric(b.ownerName);
                    else if (b.type === "BARRACKS") this.talkToGuardCaptain();
                    else this.restAtHouse();
                } else if (n === 1) {
                    if (b.type === "IMMORTAL_WINE_INN" || b.type === "TAVERN") this.tellTavernRumor();
                    else if (b.type === "SIHEYUAN_CLAN_MANSION") this.talkToClanDisciple();
                    else if (b.type === "CITY_LORD_PALACE") this.talkToGeneral();
                    else if (b.type === "CATHEDRAL") this.prayAtAltar();
                    else if (b.type === "BARRACKS") this.inspectArmory();
                    else if (b.type === "SWORD_CULTIVATOR_RETREAT" || b.type === "HOUSE_SWORD_CULTIVATOR") this.restAtHouse();
                    else if (b.type === "SCHOLAR_STUDIO" || b.type === "HOUSE_SCHOLAR") this.openTeaTasting();
                    else if (b.type === "TRADITIONAL_DWELLING" || b.type === "HOUSE_TRADITIONAL") this.restAtHouse();
                    else if (b.type === "ARTISAN_HOUSE" || b.type === "HOUSE_ARTISAN") this.restAtHouse();
                    else this.talkGeneric(b.ownerName);
                }
            });
        }

        // =====================================================================
        // 8. INTERAÇÕES VIVAS & LOJAS PROCEDURAIS
        // =====================================================================
        openTavernMenu() {
            $gameMessage.clear();
            $gameMessage.setFaceImage("People2", 2);
            $gameMessage.add("\\c[4]【 Estalajadeiro Qian 】\\c[0]\nBem-vindo à Estalagem do Vinho Imortal! Uma boa jarra de vinho de pêssego ou uma noite de descanso espiritual?");
            $gameMessage.setChoices(["Dormir e Recuperar Qi/HP (10 Moedas)", "Ouvir Rumores do Jianghu", "Sair"], 0, 2);
            $gameMessage.setChoiceCallback(n => {
                if (n === 0) {
                    if ($gameParty.gold() >= 10) {
                        $gameParty.loseGold(10);
                        SoundManager.playShop();
                        $gameScreen.startFadeOut(24);
                        setTimeout(() => {
                            $gameParty.members().forEach(actor => {
                                actor.recoverAll();
                            });
                            $gameScreen.startFadeIn(24);
                            $gameMessage.clear();
                            $gameMessage.add("\\c[2]Você descansou confortavelmente nos aposentos e acordou com o Qi 100% revigorado!\\c[0]");
                        }, 500);
                    } else {
                        SoundManager.playBuzzer();
                        $gameMessage.add("\\c[4]【 Estalajadeiro Qian 】\\c[0]\nVocê não tem moedas suficientes, forasteiro.");
                    }
                } else if (n === 1) {
                    this.tellTavernRumor();
                }
            });
        }

        tellTavernRumor() {
            const rumors = [
                "Dizem que uma seita antiga deixou uma tumba secreta na Cordilheira das Nuvens além do Portão Norte.",
                "O Alquimista da praça descobriu uma essência de lótus de fogo rara nas margens do canal fluvial.",
                "Sentinelas avistaram rastros de uma Besta Espiritual de 3º Grau perto dos vales externos.",
                "O Ancião do Pavilhão de Escrituras afirma que um cometa de jade cruzou o céu na lua passada.",
                "O vinho espiritual da longevidade deste ano está com uma concentração de Qi sem precedentes!"
            ];
            $gameMessage.clear();
            $gameMessage.setFaceImage("People2", 2);
            $gameMessage.add(`\\c[4]【 Rumores do Jianghu 】\\c[0]\n${this._prng.randomChoice(rumors)}`);
        }

        openBlacksmithShop() {
            const goods = [
                [1, 1, 0, 0], // Espada
                [1, 2, 0, 0],
                [2, 1, 0, 0], // Escudo
                [2, 2, 0, 0], // Elmo
                [2, 3, 0, 0]  // Armadura
            ];
            if (typeof SceneManager !== "undefined" && typeof Scene_Shop !== "undefined") {
                SceneManager.push(Scene_Shop);
                SceneManager.prepareNextScene(goods, false);
            }
        }

        openAlchemyShop() {
            const goods = [
                [0, 1, 0, 0], // Poção
                [0, 2, 0, 0], // Super Poção
                [0, 3, 0, 0], // Água Mágica / Elixir de Qi
                [0, 4, 0, 0]  // Antídoto
            ];
            if (typeof SceneManager !== "undefined" && typeof Scene_Shop !== "undefined") {
                SceneManager.push(Scene_Shop);
                SceneManager.prepareNextScene(goods, false);
            }
        }

        openHerbalistShop() {
            const goods = [
                [0, 1, 0, 0], // Erva medicinal
                [0, 4, 0, 0], // Antídoto
                [0, 3, 0, 0]  // Orvalho espiritual
            ];
            if (typeof SceneManager !== "undefined" && typeof Scene_Shop !== "undefined") {
                SceneManager.push(Scene_Shop);
                SceneManager.prepareNextScene(goods, false);
            }
        }

        openTeaTasting() {
            $gameMessage.clear();
            $gameMessage.setFaceImage("People3", 2);
            $gameMessage.add("\\c[4]【 Mestre do Chá Lu 】\\c[0]\nO chá espiritual das névoas celestiais acalma a agitação dos pensamentos e purifica os meridianos.");
            $gameMessage.setChoices(["Degustar Chá Espiritual (Recuperar MP - 10 Moedas)", "Sair"], 0, 1);
            $gameMessage.setChoiceCallback(n => {
                if (n === 0) {
                    if ($gameParty.gold() >= 10) {
                        $gameParty.loseGold(10);
                        SoundManager.playRecovery();
                        $gameParty.members().forEach(actor => actor.gainMp(Math.floor(actor.mmp * 0.5)));
                        $gameMessage.clear();
                        $gameMessage.add("\\c[3]O aroma puro do chá percorre seus meridianos. Seu Qi e MP foram revitalizados!\\c[0]");
                    } else {
                        SoundManager.playBuzzer();
                        $gameMessage.add("\\c[4]【 Mestre Lu 】\\c[0]\nSuas moedas não cobrem o preparo deste chá raro, amigo.");
                    }
                }
            });
        }

        openTalismanShop() {
            const goods = [
                [0, 1, 0, 0],
                [0, 2, 0, 0],
                [0, 5, 0, 0],
                [0, 6, 0, 0]
            ];
            if (typeof SceneManager !== "undefined" && typeof Scene_Shop !== "undefined") {
                SceneManager.push(Scene_Shop);
                SceneManager.prepareNextScene(goods, false);
            }
        }

        openScriptureBlessing() {
            SoundManager.playRecovery();
            $gameParty.members().forEach(actor => {
                actor.clearStates();
                actor.gainHp(Math.floor(actor.mhp * 0.3));
                actor.gainMp(Math.floor(actor.mmp * 0.3));
            });
            $gameMessage.clear();
            $gameMessage.setFaceImage("People3", 0);
            $gameMessage.add("\\c[4]【 Ancião Guardião Gu 】\\c[0]\nQue a sabedoria ancestral do Dao ilumine sua compreensão e fortaleça seus alicerces.");
            $gameMessage.add("\\c[3]Uma iluminação súbita clareia sua mente! Status negativos removidos e Qi restaurado.\\c[0]");
        }

        openGeneralShop() {
            const goods = [
                [0, 1, 0, 0],
                [0, 4, 0, 0],
                [0, 7, 0, 0]
            ];
            if (typeof SceneManager !== "undefined" && typeof Scene_Shop !== "undefined") {
                SceneManager.push(Scene_Shop);
                SceneManager.prepareNextScene(goods, false);
            }
        }

        openTempleBlessing() {
            $gameMessage.clear();
            $gameMessage.setFaceImage("People3", 0);
            $gameMessage.add("\\c[4]【 Sumo Sacerdote Anselmo 】\\c[0]\nQue a Luz Divina purifique seu espírito e afaste todo o mal.");
            $gameMessage.setChoices(["Receber Bênção Celestial (Cura Todos os Males)", "Sair"], 0, 1);
            $gameMessage.setChoiceCallback(n => {
                if (n === 0) {
                    SoundManager.playRecovery();
                    $gameParty.members().forEach(actor => {
                        actor.clearStates();
                    });
                    $gameMessage.clear();
                    $gameMessage.add("\\c[3]Uma aura sagrada e radiante envolve seu grupo. Todos os venenos e maldições foram purificados!\\c[0]");
                }
            });
        }

        talkToClanPatriarch() {
            $gameMessage.clear();
            $gameMessage.setFaceImage("People4", 0);
            $gameMessage.add("\\c[4]【 Patriarca Xiao Tian 】\\c[0]\nBem-vindo à mansão do Clã Xiao. Nosso clã prospera porque respeitamos os Céus e treinamos nossos discípulos com honra inabalável.");
        }

        talkToClanDisciple() {
            $gameMessage.clear();
            $gameMessage.setFaceImage("People3", 4);
            $gameMessage.add("\\c[4]【 Discípulo Sênior Long 】\\c[0]\nMantenha a reverência no salão principal. O Patriarca está meditando sobre a próxima assembleia de seitas.");
        }

        talkToCityLord() {
            $gameMessage.clear();
            $gameMessage.setFaceImage("People4", 0);
            $gameMessage.add("\\c[4]【 Lorde Governador Han 】\\c[0]\nEsta Cidade Imortal é o porto seguro entre o mundo mortal e as grandes montanhas celestiais. Cumpram as leis e terão nossa bênção.");
        }

        talkToGeneral() {
            $gameMessage.clear();
            $gameMessage.setFaceImage("People1", 2);
            $gameMessage.add("\\c[4]【 General Zhao 】\\c[0]\nNossos batedores mantêm vigilância cerrada contra bestas demoníacas nas florestas além das muralhas.");
        }

        talkToDuke() {
            $gameMessage.clear();
            $gameMessage.setFaceImage("People4", 0);
            $gameMessage.add("\\c[4]【 Duque Aldous 】\\c[0]\nEnquanto eu governar Val-Dourado, nossa cidade será farol de ordem e prosperidade neste continente.");
        }

        talkToGuardCaptain() {
            $gameMessage.clear();
            $gameMessage.setFaceImage("People1", 2);
            $gameMessage.add("\\c[4]【 Capitão Rodrik 】\\c[0]\nNossos patrulheiros mantêm a cidade segura dia e noite. Se avistar bandidos nas estradas, avise o quartel.");
        }

        inspectArmory() {
            if (typeof SoundManager !== "undefined" && typeof SoundManager.playDoor === "function") {
                SoundManager.playDoor();
            } else if (typeof AudioManager !== "undefined" && AudioManager && AudioManager.playSe) {
                AudioManager.playSe({ name: "Door1", volume: 90, pitch: 100, pan: 0 });
            }
            $gameMessage.clear();
            $gameMessage.add("\\c[6]Você inspeciona o arsenal do quartel: espadas bem forjadas, escudos de carvalho e arcos de longo alcance impecavelmente mantidos.\\c[0]");
        }

        prayAtAltar() {
            SoundManager.playRecovery();
            $gameMessage.clear();
            $gameMessage.add("\\c[3]Você fecha os olhos diante do altar sagrado. Uma profunda sensação de serenidade e paz preenche seu coração.\\c[0]");
        }

        talkGeneric(name) {
            $gameMessage.clear();
            $gameMessage.add(`\\c[4]【 ${name} 】\\c[0]\nSeja sempre bem-vindo ao nosso lar, nobre viajante!`);
        }

        restAtHouse() {
            SoundManager.playShop();
            $gameScreen.startFadeOut(24);
            setTimeout(() => {
                $gameParty.members().forEach(actor => actor.gainHp(Math.floor(actor.mhp * 0.5)));
                $gameScreen.startFadeIn(24);
                $gameMessage.clear();
                $gameMessage.add("\\c[2]Você descansou confortavelmente na esteira e recuperou parte de suas forças.\\c[0]");
            }, 500);
        }

        talkToSwordCultivator(name) {
            $gameMessage.clear();
            $gameMessage.setFaceImage("People3", 4);
            $gameMessage.add(`\\c[4]【 ${name} 】\\c[0]\nA espada não é meramente metal cortante, mas uma extensão da intenção e do foco espiritual. Forje sua mente antes de desembainhar sua lâmina.`);
        }

        talkToScholar(name) {
            $gameMessage.clear();
            $gameMessage.setFaceImage("People2", 0);
            $gameMessage.add(`\\c[4]【 ${name} 】\\c[0]\nO fluxo do Dao reflete-se na caligrafia assim como no vento sobre as montanhas. Aquele que compreende a quietude alcançará a longevidade.`);
        }

        restAtDwelling(name) {
            $gameMessage.clear();
            $gameMessage.setFaceImage("People1", 4);
            $gameMessage.add(`\\c[4]【 ${name} 】\\c[0]\nO bule de chá acabou de ser servido. Sente-se e descanse seus passos antes de prosseguir viagem.`);
            this.restAtHouse();
        }

        // =====================================================================
        // 9. GERAÇÃO DE MAPAS FÍSICOS DE INTERIORES
        // =====================================================================
        generateInteriorMap(mapData, building) {
            // Se o edifício possui blueprint dedicado de XianxiaBuildingPrefabs:
            if (building.interiorPrefab && PrefabsModule) {
                const ip = building.interiorPrefab;
                const W = ip.width;
                const H = ip.height;
                mapData.width = W;
                mapData.height = H;
                mapData.tilesetId = 3; // Inside Tileset

                const totalTiles = W * H * 6;
                mapData.data = new Array(totalTiles).fill(0);

                const setTile = (x, y, z, val) => {
                    if (x >= 0 && x < W && y >= 0 && y < H) {
                        mapData.data[(z * H + y) * W + x] = val || 0;
                    }
                };

                for (let y = 0; y < H; y++) {
                    for (let x = 0; x < W; x++) {
                        const t0 = PrefabsModule.resolveTile(ip.layer0[y][x]);
                        const t1 = PrefabsModule.resolveTile(ip.layer1[y][x]);
                        const t2 = PrefabsModule.resolveTile(ip.layer2[y][x]);
                        const t3 = PrefabsModule.resolveTile(ip.layer3[y][x]);
                        if (t0 > 0) setTile(x, y, 0, t0);
                        if (t1 > 0) setTile(x, y, 1, t1);
                        if (t2 > 0) setTile(x, y, 2, t2);
                        if (t3 > 0) setTile(x, y, 3, t3);
                    }
                }

                const events = [null];
                let evId = 1;

                // Porta de Saída do Interior
                const exDoor = ip.exitDoor || { x: Math.floor(W / 2), y: H - 1 };
                events.push({
                    id: evId++,
                    name: "Porta de Saída",
                    x: exDoor.x,
                    y: exDoor.y,
                    pages: [{
                        conditions: { actorId: 1, actorValid: false, itemId: 1, itemValid: false, selfSwitchCh: "A", selfSwitchValid: false, switch1Id: 1, switch1Valid: false, switch2Id: 1, switch2Valid: false, variableId: 1, variableValid: false, variableValue: 0 },
                        directionFix: false,
                        image: { characterIndex: 0, characterName: "!Door1", direction: 2, pattern: 0, tileId: 0 },
                        list: [
                            { code: 250, indent: 0, parameters: [{ name: "Door1", volume: 90, pitch: 100, pan: 0 }] },
                            { code: 355, indent: 0, parameters: [
                                `const retMap = $gameSystem._cityReturnMapId || 1;\n` +
                                `const rx = $gameSystem._cityReturnX || 60;\n` +
                                `const ry = $gameSystem._cityReturnY || 60;\n` +
                                `$gameSystem._cityCurrentInterior = null;\n` +
                                `$gamePlayer.reserveTransfer(retMap, rx, ry, 2, 0);`
                            ]},
                            { code: 0, indent: 0, parameters: [] }
                        ],
                        moveFrequency: 3,
                        moveRoute: { list: [{ code: 0, parameters: [] }], repeat: true, skippable: false, wait: false },
                        moveSpeed: 3,
                        moveType: 0,
                        priorityType: 1,
                        stepAnime: false,
                        walkAnime: false,
                        through: false,
                        trigger: 1
                    }]
                });

                // Spawn de NPCs do Prefab Interior
                const npcsToSpawn = building.npcs || [];
                npcsToSpawn.forEach(npc => {
                    events.push({
                        id: evId++,
                        name: npc.name,
                        x: npc.x,
                        y: npc.y,
                        pages: [{
                            conditions: { actorId: 1, actorValid: false, itemId: 1, itemValid: false, selfSwitchCh: "A", selfSwitchValid: false, switch1Id: 1, switch1Valid: false, switch2Id: 1, switch2Valid: false, variableId: 1, variableValid: false, variableValue: 0 },
                            directionFix: false,
                            image: { characterIndex: npc.charIndex, characterName: npc.charName, direction: npc.direction || 2, pattern: 1, tileId: 0 },
                            list: [
                                { code: 355, indent: 0, parameters: [npc.actionScript || `CityGenerator.talkGeneric("${npc.name}");`] },
                                { code: 0, indent: 0, parameters: [] }
                            ],
                            moveFrequency: 3,
                            moveRoute: { list: [{ code: 0, parameters: [] }], repeat: true, skippable: false, wait: false },
                            moveSpeed: 3,
                            moveType: 0,
                            priorityType: 1,
                            stepAnime: false,
                            walkAnime: true,
                            through: false,
                            trigger: 0
                        }]
                    });
                });

                mapData.events = events;
                return;
            }

            // Modo Medieval / Padrão Algorítmico 17x13
            const W = 17;
            const H = 13;
            mapData.width = W;
            mapData.height = H;
            mapData.tilesetId = 3;

            const totalTiles = W * H * 6;
            mapData.data = new Array(totalTiles).fill(0);

            const setTile = (x, y, z, val) => {
                if (x >= 0 && x < W && y >= 0 && y < H) {
                    mapData.data[(z * H + y) * W + x] = val || 0;
                }
            };

            let floorTile = INT_TILES.FLOOR_WOOD;
            let wallTile = INT_TILES.WALL_WOOD;

            if (building.type === "BLACKSMITH" || building.type === "BARRACKS") {
                floorTile = INT_TILES.FLOOR_STONE;
                wallTile = INT_TILES.WALL_STONE;
            } else if (building.type === "CATHEDRAL" || building.type === "CASTLE") {
                floorTile = INT_TILES.FLOOR_CARPET_RED;
                wallTile = INT_TILES.WALL_STONE;
            } else if (building.type === "ALCHEMY" || building.type === "HOUSE") {
                floorTile = INT_TILES.FLOOR_WOOD;
                wallTile = INT_TILES.WALL_PLASTER;
            }

            for (let y = 2; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    setTile(x, y, 0, floorTile);
                }
            }

            for (let y = 0; y < 2; y++) {
                for (let x = 0; x < W; x++) {
                    const u = y > 0;
                    const d = y < 1;
                    const l = x > 0;
                    const r = x < W - 1;
                    const shape = getWallAutotileShape(u, d, l, r);
                    setTile(x, y, 1, wallTile + shape);
                }
            }

            if (building.type === "TAVERN") {
                setTile(14, 1, 2, INT_TILES.FIREPLACE_TOP);
                setTile(14, 2, 2, INT_TILES.FIREPLACE_BASE);
                setTile(4, 1, 2, INT_TILES.WINDOW_MID_A);
                setTile(10, 1, 2, INT_TILES.WINDOW_MID_A);
                for (let x = 2; x <= 6; x++) {
                    setTile(x, 5, 2, INT_TILES.COUNTER_A);
                    setTile(x, 4, 2, INT_TILES.SHELF_BOTTLES_BASE);
                    setTile(x, 3, 3, INT_TILES.SHELF_BOTTLES_TOP);
                }
                setTile(1, 4, 2, INT_TILES.C_BEER_BARREL_A);
                setTile(1, 5, 2, INT_TILES.C_BEER_BARREL_B);
                setTile(10, 5, 2, INT_TILES.TABLE_WOOD);
                setTile(10, 6, 2, INT_TILES.CHAIR_WOOD);
                setTile(10, 8, 2, INT_TILES.TABLE_WOOD);
                setTile(10, 9, 2, INT_TILES.CHAIR_WOOD);
            } else if (building.type === "BLACKSMITH") {
                setTile(4, 1, 2, INT_TILES.FIREPLACE_IRON_TOP);
                setTile(4, 2, 2, INT_TILES.FIREPLACE_IRON_BASE);
                setTile(5, 4, 2, INT_TILES.C_ANVIL_A);
                setTile(6, 4, 2, INT_TILES.C_ANVIL_B);
                for (let x = 10; x <= 13; x++) {
                    setTile(x, 5, 2, INT_TILES.COUNTER_B);
                }
                setTile(11, 1, 2, INT_TILES.SHELF_SUNDRIES_TOP);
                setTile(11, 2, 2, INT_TILES.SHELF_SUNDRIES_BASE);
            } else if (building.type === "ALCHEMY") {
                for (let x = 3; x <= 13; x += 2) {
                    setTile(x, 1, 2, INT_TILES.SHELF_BOTTLES_TOP);
                    setTile(x, 2, 2, INT_TILES.SHELF_BOTTLES_BASE);
                }
                setTile(7, 5, 2, INT_TILES.COUNTER_A);
                setTile(8, 5, 2, INT_TILES.COUNTER_B);
                setTile(9, 5, 2, INT_TILES.COUNTER_A);
            } else if (building.type === "CATHEDRAL") {
                setTile(4, 1, 2, INT_TILES.WINDOW_STAINED_TOP);
                setTile(4, 2, 2, INT_TILES.WINDOW_STAINED_BASE);
                setTile(12, 1, 2, INT_TILES.WINDOW_STAINED_TOP);
                setTile(12, 2, 2, INT_TILES.WINDOW_STAINED_BASE);
                for (let y = 5; y <= 9; y += 2) {
                    setTile(4, y, 2, INT_TILES.C_CHURCH_PEW_TOP);
                    setTile(5, y, 2, INT_TILES.C_CHURCH_PEW_BASE);
                    setTile(11, y, 2, INT_TILES.C_CHURCH_PEW_TOP);
                    setTile(12, y, 2, INT_TILES.C_CHURCH_PEW_BASE);
                }
                setTile(8, 2, 2, INT_TILES.TABLE_WOOD);
            } else if (building.type === "CASTLE") {
                setTile(3, 4, 2, INT_TILES.PILLAR_STONE_TOP);
                setTile(3, 5, 2, INT_TILES.PILLAR_STONE_BASE);
                setTile(13, 4, 2, INT_TILES.PILLAR_STONE_TOP);
                setTile(13, 5, 2, INT_TILES.PILLAR_STONE_BASE);
                setTile(8, 2, 2, INT_TILES.TABLE_WOOD);
            } else if (building.type === "BARRACKS") {
                setTile(2, 3, 2, INT_TILES.BED_TOP);
                setTile(2, 4, 2, INT_TILES.BED_BASE);
                setTile(8, 5, 2, INT_TILES.TABLE_WOOD);
                setTile(9, 5, 2, INT_TILES.TABLE_WOOD);
            } else {
                setTile(13, 3, 2, INT_TILES.LARGE_BED_L_TOP);
                setTile(14, 3, 2, INT_TILES.LARGE_BED_R_TOP);
                setTile(13, 4, 2, INT_TILES.LARGE_BED_L_BASE);
                setTile(14, 4, 2, INT_TILES.LARGE_BED_R_BASE);
                setTile(8, 1, 2, INT_TILES.FIREPLACE_TOP);
                setTile(8, 2, 2, INT_TILES.FIREPLACE_BASE);
                setTile(4, 6, 2, INT_TILES.TABLE_WOOD);
                setTile(4, 7, 2, INT_TILES.CHAIR_WOOD);
            }

            const events = [null];
            let evId = 1;

            events.push({
                id: evId++,
                name: "Porta de Saída",
                x: 8,
                y: 12,
                pages: [{
                    conditions: { actorId: 1, actorValid: false, itemId: 1, itemValid: false, selfSwitchCh: "A", selfSwitchValid: false, switch1Id: 1, switch1Valid: false, switch2Id: 1, switch2Valid: false, variableId: 1, variableValid: false, variableValue: 0 },
                    directionFix: false,
                    image: { characterIndex: 0, characterName: "!Door1", direction: 2, pattern: 0, tileId: 0 },
                    list: [
                        { code: 250, indent: 0, parameters: [{ name: "Door1", volume: 90, pitch: 100, pan: 0 }] },
                        { code: 355, indent: 0, parameters: [
                            `const retMap = $gameSystem._cityReturnMapId || 1;\n` +
                            `const rx = $gameSystem._cityReturnX || 60;\n` +
                            `const ry = $gameSystem._cityReturnY || 60;\n` +
                            `$gameSystem._cityCurrentInterior = null;\n` +
                            `$gamePlayer.reserveTransfer(retMap, rx, ry, 2, 0);`
                        ]},
                        { code: 0, indent: 0, parameters: [] }
                    ],
                    moveFrequency: 3,
                    moveRoute: { list: [{ code: 0, parameters: [] }], repeat: true, skippable: false, wait: false },
                    moveSpeed: 3,
                    moveType: 0,
                    priorityType: 1,
                    stepAnime: false,
                    walkAnime: false,
                    through: false,
                    trigger: 1
                }]
            });

            let charName = "People1";
            let charIndex = 0;
            let actionScript = `CityGenerator.talkGeneric("${building.ownerName}");`;
            let npcX = 8;
            let npcY = 4;

            if (building.type === "TAVERN") {
                charName = "People2"; charIndex = 2;
                actionScript = `CityGenerator.openTavernMenu();`;
                npcX = 4; npcY = 4;
            } else if (building.type === "BLACKSMITH") {
                charName = "People2"; charIndex = 3;
                actionScript = `CityGenerator.openBlacksmithShop();`;
                npcX = 11; npcY = 4;
            } else if (building.type === "ALCHEMY") {
                charName = "People1"; charIndex = 6;
                actionScript = `CityGenerator.openAlchemyShop();`;
                npcX = 8; npcY = 4;
            } else if (building.type === "CATHEDRAL") {
                charName = "People3"; charIndex = 0;
                actionScript = `CityGenerator.openTempleBlessing();`;
                npcX = 8; npcY = 3;
            } else if (building.type === "CASTLE") {
                charName = "People4"; charIndex = 0;
                actionScript = `CityGenerator.talkToDuke();`;
                npcX = 8; npcY = 3;
            } else if (building.type === "BARRACKS") {
                charName = "People1"; charIndex = 2;
                actionScript = `CityGenerator.talkToGuardCaptain();`;
                npcX = 8; npcY = 4;
            } else if (building.type === "GENERAL_STORE") {
                charName = "People2"; charIndex = 0;
                actionScript = `CityGenerator.openGeneralShop();`;
                npcX = 8; npcY = 4;
            } else {
                npcX = 5; npcY = 5;
            }

            events.push({
                id: evId++,
                name: building.ownerName,
                x: npcX,
                y: npcY,
                pages: [{
                    conditions: { actorId: 1, actorValid: false, itemId: 1, itemValid: false, selfSwitchCh: "A", selfSwitchValid: false, switch1Id: 1, switch1Valid: false, switch2Id: 1, switch2Valid: false, variableId: 1, variableValid: false, variableValue: 0 },
                    directionFix: false,
                    image: { characterIndex: charIndex, characterName: charName, direction: 2, pattern: 1, tileId: 0 },
                    list: [
                        { code: 355, indent: 0, parameters: [actionScript] },
                        { code: 0, indent: 0, parameters: [] }
                    ],
                    moveFrequency: 3,
                    moveRoute: { list: [{ code: 0, parameters: [] }], repeat: true, skippable: false, wait: false },
                    moveSpeed: 3,
                    moveType: 0,
                    priorityType: 1,
                    stepAnime: false,
                    walkAnime: true,
                    through: false,
                    trigger: 0
                }]
            });

            if (building.type === "HOUSE") {
                events.push({
                    id: evId++,
                    name: "Cama Confortável",
                    x: 13,
                    y: 4,
                    pages: [{
                        conditions: { actorId: 1, actorValid: false, itemId: 1, itemValid: false, selfSwitchCh: "A", selfSwitchValid: false, switch1Id: 1, switch1Valid: false, switch2Id: 1, switch2Valid: false, variableId: 1, variableValid: false, variableValue: 0 },
                        directionFix: true,
                        image: { characterIndex: 0, characterName: "", direction: 2, pattern: 0, tileId: 0 },
                        list: [
                            { code: 355, indent: 0, parameters: [`CityGenerator.restAtHouse();`] },
                            { code: 0, indent: 0, parameters: [] }
                        ],
                        moveFrequency: 3,
                        moveRoute: { list: [{ code: 0, parameters: [] }], repeat: true, skippable: false, wait: false },
                        moveSpeed: 3,
                        moveType: 0,
                        priorityType: 0,
                        stepAnime: false,
                        walkAnime: false,
                        through: false,
                        trigger: 0
                    }]
                });
            }

            mapData.events = events;
        }
    }

    // Instância global do gerador
    window.CityGenerator = new ProceduralCityGenerator();

    // =========================================================================
    // 10. INTEGRAÇÃO COM GAME_MAP E DATA_MANAGER DO RPG MAKER MZ
    // =========================================================================
    function checkAndGenerateCity(mapId, preservePlayerPos = false) {
        if (typeof $dataMap === "undefined" || !$dataMap) return;

        const hasTag = $dataMap.note && $dataMap.note.includes("<ProceduralCity");
        const isAutoMap = autoMapIds.includes(mapId);

        if (hasTag || isAutoMap) {
            let w = defaultWidth;
            let h = defaultHeight;
            let seed = defaultSeedParam;
            let style = defaultCityStyle;

            if (hasTag) {
                const match = $dataMap.note.match(/<ProceduralCity(?::\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([^,\s>]+))?(?:\s*,\s*([^\s>]+))?)?>/);
                if (match && match[1] && match[2]) {
                    w = Number(match[1]);
                    h = Number(match[2]);
                    if (match[3]) {
                        if (match[3].toLowerCase() === "xianxia" || match[3].toLowerCase() === "medieval") {
                            style = match[3];
                        } else {
                            seed = match[3];
                        }
                    }
                    if (match[4]) style = match[4];
                }
            }

            if ($dataMap.note && $dataMap.note.includes("<CityStyle:")) {
                const sMatch = $dataMap.note.match(/<CityStyle:\s*([^\s>]+)>/);
                if (sMatch && sMatch[1]) style = sMatch[1];
            }

            window.CityGenerator.generate($dataMap, seed, w, h, preservePlayerPos, style);

            if (cityBgm && cityBgm.trim().length > 0 && typeof AudioManager !== "undefined") {
                AudioManager.playBgm({ name: cityBgm, volume: 90, pitch: 100, pan: 0 });
            }
            if (cityBgs && cityBgs.trim().length > 0 && typeof AudioManager !== "undefined") {
                AudioManager.playBgs({ name: cityBgs, volume: 70, pitch: 100, pan: 0 });
            }
        } else if (interiorMapId > 0 && mapId === interiorMapId && typeof $gameSystem !== "undefined" && $gameSystem && $gameSystem._cityCurrentInterior) {
            window.CityGenerator.generateInteriorMap($dataMap, $gameSystem._cityCurrentInterior);
        }
    }

    if (typeof Game_Map !== "undefined" && Game_Map.prototype) {
        const _Game_Map_setup = Game_Map.prototype.setup;
        Game_Map.prototype.setup = function(mapId) {
            checkAndGenerateCity(mapId, false);
            _Game_Map_setup.call(this, mapId);
        };
    }

    if (typeof Scene_Map !== "undefined" && Scene_Map.prototype) {
        const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
        Scene_Map.prototype.onMapLoaded = function() {
            if (!this._transfer) {
                if (typeof $gameMap !== "undefined" && $gameMap) {
                    checkAndGenerateCity($gameMap.mapId(), true);
                }
            }
            _Scene_Map_onMapLoaded.call(this);
        };
    }

    // =========================================================================
    // 11. HUD FLUTUANTE DE ANÚNCIO DE DISTRITOS (SPRITE_DISTRICTBANNER)
    // =========================================================================
    if (typeof Sprite !== "undefined") {
        class Sprite_DistrictBanner extends Sprite {
            initialize() {
                super.initialize();
                this.bitmap = new Bitmap(Graphics.width, 100);
                this.x = 0;
                this.y = -80;
                this.opacity = 0;
                this._timer = 0;
                this._currentDistrictId = 0;
                this.z = 90;
            }

            update() {
                super.update();
                if (!showDistrictBanner || typeof $gameMap === "undefined" || !$gameMap || !window.CityGenerator.isCityMap($gameMap.mapId())) {
                    this.opacity = 0;
                    return;
                }

                const regionId = $gameMap.regionId($gamePlayer.x, $gamePlayer.y);
                if (regionId > 0 && regionId !== this._currentDistrictId) {
                    this._currentDistrictId = regionId;
                    this.displayBanner(regionId);
                }

                if (this._timer > 0) {
                    this._timer--;
                    if (this._timer > 140) {
                        this.opacity = Math.min(255, this.opacity + 20);
                        this.y = Math.min(16, this.y + 4);
                    } else if (this._timer < 30) {
                        this.opacity = Math.max(0, this.opacity - 10);
                        this.y -= 1;
                    }
                }
            }

            displayBanner(regionId) {
                let info = null;
                Object.values(CURRENT_DISTRICT_INFO).forEach(d => {
                    if (d.id === regionId) info = d;
                });
                if (!info) return;

                this._timer = 180;
                this.opacity = 0;
                this.y = -60;

                const bmp = this.bitmap;
                bmp.clear();

                const w = 460;
                const h = 54;
                const bx = (Graphics.width - w) / 2;

                bmp.gradientFillRect(bx, 0, w / 2, h, "rgba(10, 15, 25, 0)", "rgba(20, 30, 50, 0.90)");
                bmp.gradientFillRect(bx + w / 2, 0, w / 2, h, "rgba(20, 30, 50, 0.90)", "rgba(10, 15, 25, 0)");

                bmp.fillRect(bx + 40, 0, w - 80, 2, "#e6c35c");
                bmp.fillRect(bx + 40, h - 2, w - 80, 2, "#e6c35c");

                bmp.fontSize = 20;
                bmp.textColor = "#fff3cd";
                bmp.outlineColor = "rgba(0, 0, 0, 0.8)";
                bmp.outlineWidth = 4;
                bmp.drawText(`${info.icon} ${info.name}`, 0, 6, Graphics.width, 24, "center");

                bmp.fontSize = 13;
                bmp.textColor = "#b0c4de";
                bmp.drawText(info.desc, 0, 30, Graphics.width, 18, "center");
            }
        }

        if (typeof Spriteset_Map !== "undefined" && Spriteset_Map.prototype) {
            const _Spriteset_Map_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;
            Spriteset_Map.prototype.createUpperLayer = function() {
                _Spriteset_Map_createUpperLayer.call(this);
                if (showDistrictBanner) {
                    this._districtBanner = new Sprite_DistrictBanner();
                    this.addChild(this._districtBanner);
                }
            };
        }
    }

    // =========================================================================
    // 12. REGISTRO DE COMANDOS DE PLUGIN MZ
    // =========================================================================
    if (typeof PluginManager !== "undefined" && PluginManager.registerCommand) {
        PluginManager.registerCommand(pluginName, "GenerateCity", args => {
            const seed = String(args.seed || "0");
            const w = Number(args.width || defaultWidth);
            const h = Number(args.height || defaultHeight);
            const style = String(args.style || defaultCityStyle);
            window.CityGenerator.generate($dataMap, seed, w, h, false, style);
            if (typeof $gamePlayer !== "undefined" && $gamePlayer && typeof $gameMap !== "undefined" && $gameMap) {
                $gamePlayer.reserveTransfer($gameMap.mapId(), $gamePlayer.x, $gamePlayer.y, $gamePlayer.direction(), 0);
            }
        });

        PluginManager.registerCommand(pluginName, "RegenerateCurrentMap", () => {
            const randomSeed = Math.floor(Math.random() * 9999999).toString();
            if (typeof $gameSystem !== "undefined" && $gameSystem && $gameSystem._proceduralCitySeeds && typeof $gameMap !== "undefined" && $gameMap) {
                delete $gameSystem._proceduralCitySeeds[$gameMap.mapId()];
            }
            window.CityGenerator.generate($dataMap, randomSeed, defaultWidth, defaultHeight, false);
            if (typeof $gamePlayer !== "undefined" && $gamePlayer && typeof $gameMap !== "undefined" && $gameMap) {
                $gamePlayer.reserveTransfer($gameMap.mapId(), $gamePlayer.x, $gamePlayer.y, $gamePlayer.direction(), 0);
            }
        });

        PluginManager.registerCommand(pluginName, "TeleportDistrict", args => {
            const district = String(args.district || "Plaza");
            const cx = Math.floor($gameMap.width() / 2);
            const cy = Math.floor($gameMap.height() / 2);
            let tx = cx;
            let ty = cy;

            if (district === "Plaza") { tx = cx; ty = cy + 4; }
            else if (district === "Castle") { tx = cx; ty = cy - 22; }
            else if (district === "Cathedral") { tx = cx + 26; ty = cy - 14; }
            else if (district === "Barracks") { tx = cx - 26; ty = cy - 14; }
            else if (district === "Docks") { tx = cx + 26; ty = cy + 22; }
            else if (district === "Residential") { tx = cx - 22; ty = cy + 22; }
            else if (district === "SouthGate") { tx = cx; ty = cy + 44; }
            else if (district === "NorthGate") { tx = cx; ty = cy - 44; }

            $gamePlayer.reserveTransfer($gameMap.mapId(), tx, ty, 2, 0);
        });
    }

    // Exportação em ambiente Node.js para testes automatizados
    if (typeof module !== "undefined" && module.exports) {
        module.exports = {
            ProceduralCityGenerator,
            CityGenerator: window.CityGenerator,
            TILES,
            INT_TILES,
            DISTRICT_INFO_MEDIEVAL,
            DISTRICT_INFO_XIANXIA
        };
    }

})();
