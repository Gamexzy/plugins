//=============================================================================
// RPG Maker MZ - XianxiaBuildingPrefabs.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc [v2.0.0] Catálogo Modular de Construções Xianxia (Exteriores e Interiores), Paleta Semântica, Gerador Modular de Casas e Prefabs para Gerador de Cidades.
 * @author Antigravity (DeepMind Pair Programming)
 *
 * @help
 * ============================================================================
 *               XIANXIA BUILDING PREFABS - ARQUITETURA DE CULTIVO MZ
 * ============================================================================
 * Este plugin fornece um catálogo modular completo de designs arquiteturais
 * orientais inspirados em Xianxia/Wuxia para RPG Maker MZ, projetado para
 * integração com o ProceduralCityGenerator.js.
 *
 * ----------------------------------------------------------------------------
 * RECURSOS PRINCIPAIS:
 * ----------------------------------------------------------------------------
 * 1. PALETA SEMÂNTICA CONFIGURÁVEL (XianxiaPalette):
 *    - Constantes semânticas para telhados de jade, paredes de treliça, caldeirões
 *      de pílulas (Ding), futons de meditação, suportes de espadas, biombos, etc.
 *    - Aliases genéricos e específicos para facilidade de uso.
 *    - Padrões RTP do RPG Maker MZ com suporte a remapeamento transparente:
 *      XianxiaBuildingPrefabs.XianxiaPalette.remap({ ROOF_JADE_EAVE: 7000, ... });
 *    - Balcões mapeados com suporte nativo à flag Counter (0x80) do RMMZ.
 *
 * 2. 13 CONSTRUÇÕES COMPLETAS EM 3 ESCALAS:
 *    - Compactas (6x6 a 8x7): Cabana do Herbalista, Residência de Artesão,
 *      Retiro de Cultivador de Espada, Estúdio de Caligrafia & Dao, Moradia Tradicional Jiangnan.
 *    - Comércios & Pavilhões (10x8 a 12x10): Estalagem do Vinho Imortal,
 *      Pavilhão de Alquimia, Forja de Artefatos, Casa de Chá com Weiqi,
 *      Pavilhão de Talismãs & Matrizes, Pavilhão de Escrituras Marciais.
 *    - Complexos & Lugares de Poder (14x12 a 18x18): Mansão Siheyuan de Clã
 *      Cultivador (Modular com Lago de Lótus), Palácio do Lorde da Cidade (城主府).
 *
 * 3. GERADOR PROCEDURAL DE CASAS MODULARES:
 *    - assembleModularHouse(options): gera infinitas variações com dimensões
 *      6x6 a 8x8, combinações estéticas de telhados e paredes, e interiores ricos.
 *
 * 4. 4 CAMADAS PARA EXTERIOR E INTERIOR:
 *    - layer0: Terreno base / piso.
 *    - layer1: Telhados, paredes estruturais e autotiling.
 *    - layer2: Mobília de chão, balcões, caldeirões, mesas, portas.
 *    - layer3: Decorações superiores, vigas, vitrais, luminárias, chaminés.
 *
 * 5. NPCS TOTALMENTE DESOBSTRUÍDOS & ESTÁTUAS COMPOSTAS:
 *    - NPCs posicionados fora de paredes e fora de mobília (l1=0, l2=0, l3=0).
 *    - Estátuas e pilares compostos com TOP e BASE perfeitamente alinhados.
 * ============================================================================
 */

(() => {
    "use strict";

    // =========================================================================
    // 1. PALETA SEMÂNTICA DE TILES (XianxiaPalette)
    // =========================================================================
    const XianxiaPalette = {
        // --- Telhados (Roofs) ---
        ROOF_JADE_EAVE: 5120,          // Roof I Green / Jade Glazed Tile (kind 64)
        ROOF_DARK_SLATE: 4688,         // Roof H Dark Blue / Slate Tile (kind 55)
        ROOF_GOLDEN_IMPERIAL: 4496,    // Roof D Yellow / Golden Imperial Eave (kind 51)
        ROOF_TIMBER: 4544,             // Roof E Wood / Timber Roof (kind 52)
        ROOF_RUSTIC_THATCH: 5264,      // Roof L Thatched Roof (kind 67)
        ROOF_CRIMSON: 4400,            // Roof B Pink/Crimson Glazed Tile (kind 49)

        // --- Paredes Exteriores (Outer Walls) ---
        WALL_WOOD_LATTICE: 4928,       // Outer Wall E Timber / Wooden Lattice (kind 60)
        WALL_WHITE_PLASTER: 4784,      // Outer Wall B Plaster / Jiangnan White Wall (kind 57)
        WALL_GRAY_BRICK: 4736,         // Outer Wall A Stone / Ancient Gray Brick (kind 56)
        WALL_TEMPLE_WHITE: 5552,       // Outer Wall J Temple White (kind 73)
        WALL_RED_PALACE: 4832,         // Outer Wall C Red Brick / Imperial Vermilion (kind 58)
        WALL_SECT_STONE: 5888,         // Wall A Castle Stone / Sect Battlement (kind 80)

        // --- Terrenos e Pisos (Floors & Grounds) ---
        FLOOR_POLISHED_WOOD: 2816,     // Inside_A2 Floor 1 Wood Plank / Lacquered Wood
        FLOOR_TATAMI_MAT: 2864,        // Inside_A2 Floor 2 Tatami / Straw Meditation Mat
        FLOOR_RED_CARPET: 2912,        // Inside_A2 Floor 3 Red Silk Carpet
        FLOOR_GRAY_STONE: 3008,        // Inside_A2 Floor 5 Polished Slate / Gray Stone
        FLOOR_WHITE_MARBLE: 3104,      // Inside_A2 Floor 7 White Marble / Immortal Hall
        GROUND_MEADOW: 2816,           // Outside_A2 Meadow Grass
        GROUND_DIRT_PATH: 2864,        // Outside_A2 Dirt Path
        GROUND_COBBLE_A: 2960,         // Outside_A2 Cobble A
        GROUND_COBBLE_B: 3728,         // Outside_A2 Cobble B / Plaza
        GROUND_WATER_POND: 2048,       // Outside_A1 Water Canal / Lotus Pond

        // --- Paredes Interiores (Inside Walls) ---
        INT_WALL_WOOD_LATTICE: 5888,   // Inside_A4 Wood Wall
        INT_WALL_STONE_SECT: 6080,     // Inside_A4 Stone Wall
        INT_WALL_WHITE_PLASTER: 6272,  // Inside_A4 White Plaster Wall

        // --- Mobília & Props Interiores (Inside Props & Furniture) ---
        PROP_PILL_FURNACE: 196,        // Inside_B Hearth Iron Base (Alias genérico)
        PROP_PILL_FURNACE_TOP: 188,    // Inside_B Hearth Iron Top (Refino de Pílulas)
        PROP_PILL_FURNACE_BASE: 196,   // Inside_B Hearth Iron Base
        PROP_CAULDRON: 194,            // Inside_B Hearth Stone Base (Alias genérico)
        PROP_CAULDRON_DING_TOP: 186,   // Inside_B Hearth Stone Top (Caldeirão Ding)
        PROP_CAULDRON_DING_BASE: 194,  // Inside_B Hearth Stone Base
        PROP_MEDITATION_FUTON: 173,    // Inside_B Straw Bed (Futon de Cultivo)
        PROP_WINE_JAR: 209,            // Inside_B Pot A (Alias genérico)
        PROP_WINE_JAR_A: 209,          // Inside_B Pot A (Jarra de Vinho Selada)
        PROP_WINE_JAR_B: 210,          // Inside_B Pot B (Jarra de Cerâmica)
        PROP_WINE_BARREL: 256 + 56,    // Inside_C Beer Barrel A (Barril de Vinho Espiritual)
        PROP_TEA_TABLE: 112,           // Inside_B Table A (Mesa Baixa de Chá - flag Counter 0x80)
        PROP_TEA_STOOL: 101,           // Inside_B Chair Wood (Banco de Chá)
        PROP_TEAPOT: 256 + 0,          // Inside_C Teapot A (Bule de Celadon)
        PROP_GO_BOARD: 115,            // Inside_B Table D (Tabuleiro de Weiqi / Go - flag Counter 0x80)
        PROP_SWORD_RACK: 256 + 144,    // Inside_C Sword Rack A (Alias genérico)
        PROP_SWORD_RACK_A: 256 + 144,  // Inside_C Sword Rack A (Suporte de Espada Voadora)
        PROP_SWORD_RACK_B: 256 + 145,  // Inside_C Sword Rack B
        PROP_SWORD_STAND: 256 + 174,   // Inside_C Repository of Swords
        PROP_ANVIL: 256 + 148,         // Inside_C Anvil A (Alias genérico)
        PROP_ANVIL_A: 256 + 148,       // Inside_C Anvil A (Bigorna de Artefatos)
        PROP_ANVIL_B: 256 + 149,       // Inside_C Anvil B
        PROP_HERB_CABINET: 164,        // Inside_B Medicine Shelf Base (Alias genérico)
        PROP_HERB_CABINET_TOP: 156,    // Inside_B Medicine Shelf Top (Armário de Ervas)
        PROP_HERB_CABINET_BASE: 164,   // Inside_B Medicine Shelf Base
        PROP_ELIXIR_SHELF: 150,        // Inside_B Bottle Shelf Base (Alias genérico)
        PROP_ELIXIR_SHELF_TOP: 142,    // Inside_B Bottle Shelf Top (Prateleira de Elixires)
        PROP_ELIXIR_SHELF_BASE: 150,   // Inside_B Bottle Shelf Base
        PROP_SCRIPTURE_SHELF: 165,     // Inside_B Bookshelf A Base (Alias genérico)
        PROP_SCRIPTURE_SHELF_A_TOP: 157, // Inside_B Bookshelf A Top (Estante de Manuais)
        PROP_SCRIPTURE_SHELF_A_BASE: 165,// Inside_B Bookshelf A Base
        PROP_SCRIPTURE_SHELF_B_TOP: 158, // Inside_B Bookshelf B Top
        PROP_SCRIPTURE_SHELF_B_BASE: 166,// Inside_B Bookshelf B Base
        PROP_SCROLLS_A: 256 + 82,      // Inside_C Scrolls A (Pergaminhos de Talismã)
        PROP_SCROLLS_B: 256 + 83,      // Inside_C Scrolls B (Jades e Rolos Marciais)
        PROP_ANCIENT_TOME_A: 256 + 68, // Inside_C Open Book (Manual Marcial Aberto)
        PROP_ANCIENT_TOME_B: 256 + 64, // Inside_C Closed Book
        PROP_SPIRIT_POTION_A: 256 + 100,// Inside_C Potion A (Frasco de Elixir)
        PROP_SPIRIT_POTION_B: 256 + 101,// Inside_C Potion B
        PROP_BONSAI_TREE: 256 + 86,    // Inside_C Potted Plant (Bonsai Espiritual)
        PROP_ZHAOBI_SCREEN: 256 + 184, // Inside_C Screen (Biombo de Caligrafia)
        PROP_DAOIST_ALTAR: 114,        // Inside_B Table C (Altar de Incenso - flag Counter 0x80)
        PROP_SECT_BANNER: 256 + 96,    // Inside_C Tapestry A (Estandarte de Dragão)
        PROP_STONE_PILLAR: 32,         // Inside_B Stone Pillar Base (Alias genérico)
        PROP_STONE_PILLAR_TOP: 24,     // Inside_B Stone Pillar Top
        PROP_STONE_PILLAR_BASE: 32,    // Inside_B Stone Pillar Base
        PROP_MASTER_THRONE: 111,       // Inside_B Throne Demon Castle Base
        PROP_MASTER_THRONE_TOP: 103,   // Inside_B Throne Demon Castle Top
        PROP_MASTER_THRONE_BASE: 111,  // Inside_B Throne Demon Castle Base
        PROP_WINDOW_ORIENTAL_A: 66,    // Inside_B Middle Window B (Janela Treliçada)
        PROP_WINDOW_ORIENTAL_B: 64,    // Inside_B Middle Window A
        PROP_CULTIVATOR_BED: 177,      // Inside_B Large Bed L Base (Alias genérico)
        PROP_CULTIVATOR_BED_L_TOP: 169,// Inside_B Large Bed L Top
        PROP_CULTIVATOR_BED_R_TOP: 170,// Inside_B Large Bed R Top
        PROP_CULTIVATOR_BED_L_BASE: 177,// Inside_B Large Bed L Base
        PROP_CULTIVATOR_BED_R_BASE: 178,// Inside_B Large Bed R Base
        PROP_WOOD_COUNTER_A: 112,      // Inside_B Table A (Balcão de Atendimento com flag Counter 0x80)
        PROP_WOOD_COUNTER_B: 114,      // Inside_B Table B (Balcão Escuro com flag Counter 0x80)
        PROP_CHEST_OF_DRAWERS: 139,    // Inside_B Chest of Drawers
        PROP_STORAGE_CHEST: 136,       // Inside_B Chest A (Baú de Pedras Espirituais)

        // --- Props Exteriores (Outside Props & Decorations) ---
        PROP_LANTERN_STONE: 8,         // Outside_B Streetlight A (Lanterna de Pedra)
        PROP_LANTERN_POST_TOP: 8,      // Outside_B Streetlight Top
        PROP_LANTERN_POST_MID: 16,     // Outside_B Streetlight Mid
        PROP_LANTERN_POST_BASE: 24,    // Outside_B Streetlight Base
        PROP_QILIN_STATUE: 256 + 77,   // Outside_C Dragon/Qilin Base (Alias genérico)
        PROP_QILIN_STATUE_TOP: 256 + 69, // Outside_C Dragon/Qilin Top (Dragão Guardião)
        PROP_QILIN_STATUE_BASE: 256 + 77,// Outside_C Dragon/Qilin Base
        PROP_FOO_DOG_STATUE: 256 + 72, // Outside_C Stone Lion Base (Alias genérico)
        PROP_FOO_DOG_STATUE_TOP: 256 + 64, // Outside_C Stone Lion Top (Leão de Guarda Foo Dog)
        PROP_FOO_DOG_STATUE_BASE: 256 + 72,// Outside_C Stone Lion Base
        PROP_IMMORTAL_STATUE: 256 + 79,// Outside_C God Statue Base (Alias genérico)
        PROP_IMMORTAL_STATUE_TOP: 256 + 71,// Outside_C God Statue Top (Estátua de Imortal)
        PROP_IMMORTAL_STATUE_BASE: 256 + 79,// Outside_C God Statue Base
        PROP_STELE_MONUMENT: 256 + 32, // Outside_C Stele Tablet (Estela de Seita)
        PROP_LOTUS_WATER_PLANT: 163,   // Outside_B Flowers D (Flores de Lótus no Lago)
        PROP_BAMBOO_TRUNK: 165,        // Outside_B Tree Trunk (Caule de Bambu)
        PROP_BAMBOO_TOP: 157,          // Outside_B Tree Top (Copa de Bambu)
        PROP_PAIFANG_PILLAR: 256 + 17, // Outside_C Stone Pillar Base (Alias genérico)
        PROP_PAIFANG_PILLAR_TOP: 256 + 1, // Outside_C Stone Pillar Top (Coluna do Portal Paifang)
        PROP_PAIFANG_PILLAR_MID: 256 + 9, // Outside_C Stone Pillar Mid
        PROP_PAIFANG_PILLAR_BASE: 256 + 17,// Outside_C Stone Pillar Base
        PROP_WOOD_BRIDGE_H: 83,        // Outside_B Wood Bridge H
        PROP_WOOD_BRIDGE_V: 82,        // Outside_B Wood Bridge V
        PROP_STONE_BRIDGE_H: 85,       // Outside_B Stone Bridge H
        PROP_STONE_BRIDGE_V: 84,       // Outside_B Stone Bridge V
        PROP_SIGN_WEAPON: 65,          // Outside_B Sign Sword
        PROP_SIGN_TEA_WINE: 69,        // Outside_B Sign Teapot
        PROP_SIGN_INN: 70,             // Outside_B Sign Inn
        PROP_SIGN_ALCHEMY: 73,         // Outside_B Sign Hexagram
        PROP_SIGN_FORGE: 77,           // Outside_B Sign Hammer
        PROP_SIGN_SECT_CREST: 78,      // Outside_B Sign Crest
        PROP_SIGN_TALISMAN: 74,        // Outside_B Sign Staves
        PROP_SIGN_HERBS: 68,           // Outside_B Sign Sack
        PROP_SPIRIT_BARREL: 142,       // Outside_B Barrel
        PROP_HERB_POT: 145,            // Outside_B Pot
        PROP_MINERAL_CRATE: 181,       // Outside_B Crate
        PROP_HERBAL_RACK: 182          // Outside_B Crate B (Varal/Bandeja de Secagem)
    };

    XianxiaPalette.remap = function(mapping) {
        if (!mapping || typeof mapping !== "object") return;
        for (const key of Object.keys(mapping)) {
            if (typeof mapping[key] === "number") {
                this[key] = mapping[key];
            }
        }
    };

    XianxiaPalette.resolve = function(keyOrId) {
        if (typeof keyOrId === "number") return keyOrId;
        if (typeof keyOrId === "string") {
            if (typeof this[keyOrId] === "number") return this[keyOrId];
            const parsed = parseInt(keyOrId, 10);
            if (!isNaN(parsed)) return parsed;
        }
        return 0;
    };

    XianxiaPalette.exportConfig = function() {
        const res = {};
        for (const key of Object.keys(this)) {
            if (typeof this[key] === "number") res[key] = this[key];
        }
        return res;
    };

    // =========================================================================
    // 2. UTILITÁRIOS DE CRIAÇÃO DE MATRIZES
    // =========================================================================
    function createMatrix(w, h, fillVal = 0) {
        return Array(h).fill(null).map(() => Array(w).fill(fillVal));
    }

    function resolveMatrix(matrix) {
        const h = matrix.length;
        const w = matrix[0].length;
        const res = createMatrix(w, h, 0);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                res[y][x] = XianxiaPalette.resolve(matrix[y][x]);
            }
        }
        return res;
    }

    // =========================================================================
    // 3. GERADOR PROCEDURAL DE CASAS MODULARES (assembleModularHouse)
    // =========================================================================
    function assembleModularHouse(options = {}) {
        const type = options.type || "TRADITIONAL"; // HERBALIST, ARTISAN, SWORD_CULTIVATOR, SCHOLAR, TRADITIONAL
        const extW = Math.max(6, Math.min(8, options.width || 7));
        const extH = Math.max(6, Math.min(7, options.height || 6));
        const roofType = options.roofType || (type === "HERBALIST" ? "ROOF_RUSTIC_THATCH" : (type === "SWORD_CULTIVATOR" ? "ROOF_TIMBER" : (type === "SCHOLAR" ? "ROOF_CRIMSON" : "ROOF_DARK_SLATE")));
        const wallType = options.wallType || (type === "HERBALIST" ? "WALL_WOOD_LATTICE" : (type === "ARTISAN" ? "WALL_WHITE_PLASTER" : (type === "SWORD_CULTIVATOR" ? "WALL_GRAY_BRICK" : "WALL_WOOD_LATTICE")));
        const residentName = options.residentName || "Cultivador Residente";

        const extL0 = createMatrix(extW, extH, "GROUND_MEADOW");
        const extL1 = createMatrix(extW, extH, 0);
        const extL2 = createMatrix(extW, extH, 0);
        const extL3 = createMatrix(extW, extH, 0);

        const roofH = Math.max(2, extH - 2);
        for (let y = 0; y < roofH; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = roofType;
        }
        for (let y = roofH; y < extH; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = wallType;
        }

        const doorX = (typeof options.doorX === "number") ? options.doorX : Math.floor(extW / 2);
        const doorY = extH - 1;
        extL1[doorY][doorX] = 0; // Vão da porta

        // Props externos conforme o arquétipo
        if (type === "HERBALIST") {
            extL2[doorY][0] = "PROP_HERB_POT";
            if (doorX > 1) extL2[doorY][1] = "PROP_HERBAL_RACK";
            extL2[doorY][extW - 1] = "PROP_LANTERN_STONE";
            extL3[doorY - 1][doorX] = "PROP_SIGN_HERBS";
        } else if (type === "ARTISAN") {
            extL2[doorY][0] = "PROP_MINERAL_CRATE";
            extL2[doorY][extW - 1] = "PROP_LANTERN_STONE";
            if (extW >= 8 && doorX < extW - 2) extL2[doorY][extW - 2] = "PROP_HERB_POT";
        } else if (type === "SWORD_CULTIVATOR") {
            extL2[doorY][0] = "PROP_STELE_MONUMENT";
            extL2[doorY][extW - 1] = "PROP_LANTERN_STONE";
            extL3[doorY - 1][doorX] = "PROP_SIGN_WEAPON";
        } else if (type === "SCHOLAR") {
            extL2[doorY][0] = "PROP_BONSAI_TREE";
            extL2[doorY][extW - 1] = "PROP_LANTERN_STONE";
            extL3[doorY - 1][doorX] = "PROP_SIGN_TALISMAN";
        } else {
            extL2[doorY][0] = "PROP_BONSAI_TREE";
            extL2[doorY][extW - 1] = "PROP_LANTERN_STONE";
            if (doorX > 1) extL2[doorY][1] = "PROP_HERB_POT";
        }

        // Janelas na fachada
        if (doorX - 2 >= 0) extL2[doorY - 1][doorX - 2] = "PROP_WINDOW_ORIENTAL_A";
        if (doorX + 2 < extW) extL2[doorY - 1][doorX + 2] = "PROP_WINDOW_ORIENTAL_A";

        // Interior proporcional (intW: extW + 4, intH: extH + 2)
        const intW = extW + 4;
        const intH = extH + 2;
        const intFloor = (type === "HERBALIST" || type === "SWORD_CULTIVATOR") ? "FLOOR_TATAMI_MAT" : ((type === "SCHOLAR") ? "FLOOR_RED_CARPET" : "FLOOR_POLISHED_WOOD");
        const intWall = (wallType === "WALL_GRAY_BRICK") ? "INT_WALL_STONE_SECT" : ((wallType === "WALL_WHITE_PLASTER") ? "INT_WALL_WHITE_PLASTER" : "INT_WALL_WOOD_LATTICE");

        const intL0 = createMatrix(intW, intH, intFloor);
        const intL1 = createMatrix(intW, intH, 0);
        const intL2 = createMatrix(intW, intH, 0);
        const intL3 = createMatrix(intW, intH, 0);

        for (let y = 0; y <= 1; y++) {
            for (let x = 0; x < intW; x++) intL1[y][x] = intWall;
        }
        intL2[1][2] = "PROP_WINDOW_ORIENTAL_A";
        if (intW >= 11) intL2[1][intW - 3] = "PROP_WINDOW_ORIENTAL_B";

        const exitDoorX = Math.floor(intW / 2);
        const exitDoorY = intH - 1;

        let npcRole = "Cultivador Residente";
        let npcChar = "People1";
        let npcIndex = 0;
        let actionScript = `CityGenerator.talkGeneric("${residentName}");`;

        // Mobília interior sem sobreposição sobre NPCs
        if (type === "HERBALIST") {
            npcRole = "Herbalista Medicinal";
            npcChar = "People1";
            npcIndex = 6;
            actionScript = `CityGenerator.openHerbalistShop();`;
            intL3[1][1] = "PROP_HERB_CABINET_TOP";
            intL2[2][1] = "PROP_HERB_CABINET_BASE";
            intL3[1][intW - 2] = "PROP_ELIXIR_SHELF_TOP";
            intL2[2][intW - 2] = "PROP_ELIXIR_SHELF_BASE";
            intL3[1][4] = "PROP_CAULDRON_DING_TOP";
            intL2[2][4] = "PROP_CAULDRON_DING_BASE";
            intL2[4][1] = "PROP_MEDITATION_FUTON";
            intL2[4][intW - 3] = "PROP_TEA_TABLE";
            intL2[5][intW - 3] = "PROP_TEA_STOOL";
        } else if (type === "ARTISAN") {
            npcRole = "Artesão de Jade";
            npcChar = "People4";
            npcIndex = 2;
            intL2[2][1] = "PROP_STORAGE_CHEST";
            intL2[2][2] = "PROP_BONSAI_TREE";
            intL2[3][intW - 4] = "PROP_ZHAOBI_SCREEN";
            intL2[4][intW - 4] = "PROP_ZHAOBI_SCREEN";
            intL3[2][intW - 2] = "PROP_CULTIVATOR_BED_L_TOP";
            intL2[3][intW - 2] = "PROP_CULTIVATOR_BED_L_BASE";
            intL2[4][2] = "PROP_TEA_TABLE";
            intL2[5][2] = "PROP_TEA_STOOL";
        } else if (type === "SWORD_CULTIVATOR") {
            npcRole = "Cultivador de Espada";
            npcChar = "People3";
            npcIndex = 4;
            actionScript = `CityGenerator.talkToSwordCultivator("${residentName}");`;
            intL2[2][1] = "PROP_SWORD_RACK_A";
            intL2[2][2] = "PROP_SWORD_RACK_B";
            intL3[1][intW - 2] = "PROP_SECT_BANNER";
            intL2[2][intW - 2] = "PROP_STORAGE_CHEST";
            intL2[3][1] = "PROP_MEDITATION_FUTON";
            intL2[4][intW - 3] = "PROP_TEA_TABLE";
            intL2[5][intW - 3] = "PROP_TEA_STOOL";
        } else if (type === "SCHOLAR") {
            npcRole = "Erudito & Calígrafo do Dao";
            npcChar = "People2";
            npcIndex = 0;
            actionScript = `CityGenerator.talkToScholar("${residentName}");`;
            intL3[1][1] = "PROP_SCRIPTURE_SHELF_A_TOP";
            intL2[2][1] = "PROP_SCRIPTURE_SHELF_A_BASE";
            intL3[1][intW - 2] = "PROP_SCRIPTURE_SHELF_B_TOP";
            intL2[2][intW - 2] = "PROP_SCRIPTURE_SHELF_B_BASE";
            intL2[3][2] = "PROP_TEA_TABLE";
            intL3[2][2] = "PROP_SCROLLS_A";
            intL2[4][2] = "PROP_MEDITATION_FUTON";
            intL2[2][intW - 4] = "PROP_DAOIST_ALTAR";
        } else {
            npcRole = "Morador Tradicional";
            npcChar = "People1";
            npcIndex = 4;
            actionScript = `CityGenerator.restAtDwelling("${residentName}");`;
            intL3[2][intW - 3] = "PROP_CULTIVATOR_BED_L_TOP";
            intL3[2][intW - 2] = "PROP_CULTIVATOR_BED_R_TOP";
            intL2[3][intW - 3] = "PROP_CULTIVATOR_BED_L_BASE";
            intL2[3][intW - 2] = "PROP_CULTIVATOR_BED_R_BASE";
            intL2[5][intW - 2] = "PROP_CHEST_OF_DRAWERS";
            intL2[3][2] = "PROP_TEA_TABLE";
            intL2[4][2] = "PROP_TEA_STOOL";
            intL2[2][1] = "PROP_BONSAI_TREE";
        }

        // Posicionamento do NPC em célula 100% desobstruída (l1=0, l2=0, l3=0) e fora da porta
        const npcX = Math.min(intW - 3, Math.max(3, exitDoorX - 1));
        const npcY = 3;

        return {
            id: options.id || `MODULAR_HOUSE_${type}_${extW}x${extH}`,
            name: options.name || `Residência de ${residentName}`,
            type: options.typeKey || `HOUSE_${type}`,
            scale: "COMPACT",
            width: extW,
            height: extH,
            exterior: { layer0: extL0, layer1: extL1, layer2: extL2, layer3: extL3 },
            door: { x: doorX, y: doorY, side: "BOTTOM" },
            interior: {
                width: intW,
                height: intH,
                layer0: intL0,
                layer1: intL1,
                layer2: intL2,
                layer3: intL3,
                exitDoor: { x: exitDoorX, y: exitDoorY }
            },
            npcs: [
                {
                    id: 1,
                    name: residentName,
                    role: npcRole,
                    charName: npcChar,
                    charIndex: npcIndex,
                    x: npcX,
                    y: npcY,
                    direction: 2,
                    actionScript: actionScript
                }
            ],
            anchors: { street: { x: doorX, y: doorY + 1 } }
        };
    }

    // =========================================================================
    // 4. DEFINIÇÃO DO CATÁLOGO DE CONSTRUÇÕES XIANXIA (PREFABS)
    // =========================================================================
    const prefabs = {};

    // -------------------------------------------------------------------------
    // 1. CABANA DO HERBALISTA / CULTIVADOR ERRANTE (6x6 Exterior, 10x8 Interior)
    // -------------------------------------------------------------------------
    prefabs.HERBALIST_HUT = (() => {
        const extW = 6, extH = 6;
        const extL0 = createMatrix(extW, extH, "GROUND_MEADOW");
        const extL1 = createMatrix(extW, extH, 0);
        const extL2 = createMatrix(extW, extH, 0);
        const extL3 = createMatrix(extW, extH, 0);

        for (let y = 0; y <= 3; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "ROOF_RUSTIC_THATCH";
        }
        for (let y = 4; y <= 5; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "WALL_WOOD_LATTICE";
        }
        extL1[5][3] = 0; // Vão da porta

        extL2[5][1] = "PROP_HERBAL_RACK";
        extL2[5][0] = "PROP_HERB_POT";
        extL2[5][5] = "PROP_LANTERN_STONE";
        extL3[4][3] = "PROP_SIGN_HERBS";

        const intW = 10, intH = 8;
        const intL0 = createMatrix(intW, intH, "FLOOR_TATAMI_MAT");
        const intL1 = createMatrix(intW, intH, 0);
        const intL2 = createMatrix(intW, intH, 0);
        const intL3 = createMatrix(intW, intH, 0);

        for (let y = 0; y <= 1; y++) {
            for (let x = 0; x < intW; x++) intL1[y][x] = "INT_WALL_WOOD_LATTICE";
        }
        intL2[1][3] = "PROP_WINDOW_ORIENTAL_A";
        intL2[1][6] = "PROP_WINDOW_ORIENTAL_B";

        intL3[1][1] = "PROP_HERB_CABINET_TOP";
        intL2[2][1] = "PROP_HERB_CABINET_BASE";

        intL3[1][4] = "PROP_CAULDRON_DING_TOP";
        intL2[2][4] = "PROP_CAULDRON_DING_BASE";

        intL3[1][8] = "PROP_ELIXIR_SHELF_TOP";
        intL2[2][8] = "PROP_ELIXIR_SHELF_BASE";

        intL2[4][1] = "PROP_MEDITATION_FUTON";
        intL2[4][7] = "PROP_TEA_TABLE";
        intL3[3][7] = "PROP_TEAPOT";
        intL2[5][7] = "PROP_TEA_STOOL";

        intL2[5][1] = "PROP_WINE_JAR_A";
        intL2[6][1] = "PROP_WINE_JAR_B";

        return {
            id: "HERBALIST_HUT",
            name: "Cabana do Herbalista Errante",
            type: "HERBALIST_HUT",
            scale: "COMPACT",
            width: extW,
            height: extH,
            exterior: { layer0: extL0, layer1: extL1, layer2: extL2, layer3: extL3 },
            door: { x: 3, y: 5, side: "BOTTOM" },
            interior: {
                width: intW,
                height: intH,
                layer0: intL0,
                layer1: intL1,
                layer2: intL2,
                layer3: intL3,
                exitDoor: { x: 5, y: 7 }
            },
            npcs: [
                {
                    id: 1,
                    name: "Herbalista Zhi",
                    role: "Mestre de Ervas Medicinais",
                    charName: "People1",
                    charIndex: 6,
                    x: 5,
                    y: 3,
                    direction: 2,
                    actionScript: `CityGenerator.openHerbalistShop();`
                }
            ],
            anchors: { street: { x: 3, y: 6 } }
        };
    })();

    // -------------------------------------------------------------------------
    // 2. RESIDÊNCIA TRADICIONAL DE ARTESÃO MORTAL (8x7 Exterior, 12x9 Interior)
    // -------------------------------------------------------------------------
    prefabs.ARTISAN_HOUSE = (() => {
        const extW = 8, extH = 7;
        const extL0 = createMatrix(extW, extH, "GROUND_MEADOW");
        const extL1 = createMatrix(extW, extH, 0);
        const extL2 = createMatrix(extW, extH, 0);
        const extL3 = createMatrix(extW, extH, 0);

        for (let y = 0; y <= 3; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "ROOF_DARK_SLATE";
        }
        for (let y = 4; y <= 6; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "WALL_WHITE_PLASTER";
        }
        extL1[6][4] = 0; // Porta

        extL2[6][2] = "PROP_HERB_POT";
        extL2[6][6] = "PROP_LANTERN_STONE";
        extL2[4][3] = "PROP_WINDOW_ORIENTAL_A";
        extL2[4][5] = "PROP_WINDOW_ORIENTAL_A";

        const intW = 12, intH = 9;
        const intL0 = createMatrix(intW, intH, "FLOOR_POLISHED_WOOD");
        const intL1 = createMatrix(intW, intH, 0);
        const intL2 = createMatrix(intW, intH, 0);
        const intL3 = createMatrix(intW, intH, 0);

        for (let y = 0; y <= 1; y++) {
            for (let x = 0; x < intW; x++) intL1[y][x] = "INT_WALL_WHITE_PLASTER";
        }
        intL2[1][3] = "PROP_WINDOW_ORIENTAL_A";
        intL2[1][8] = "PROP_WINDOW_ORIENTAL_B";

        intL2[3][6] = "PROP_ZHAOBI_SCREEN";
        intL2[4][6] = "PROP_ZHAOBI_SCREEN";

        intL3[2][9] = "PROP_CULTIVATOR_BED_L_TOP";
        intL3[2][10] = "PROP_CULTIVATOR_BED_R_TOP";
        intL2[3][9] = "PROP_CULTIVATOR_BED_L_BASE";
        intL2[3][10] = "PROP_CULTIVATOR_BED_R_BASE";
        intL2[5][10] = "PROP_CHEST_OF_DRAWERS";

        intL2[4][2] = "PROP_TEA_TABLE";
        intL2[5][2] = "PROP_TEA_STOOL";
        intL2[2][1] = "PROP_STORAGE_CHEST";
        intL2[2][2] = "PROP_BONSAI_TREE";

        return {
            id: "ARTISAN_HOUSE",
            name: "Residência Tradicional de Artesão",
            type: "ARTISAN_HOUSE",
            scale: "COMPACT",
            width: extW,
            height: extH,
            exterior: { layer0: extL0, layer1: extL1, layer2: extL2, layer3: extL3 },
            door: { x: 4, y: 6, side: "BOTTOM" },
            interior: {
                width: intW,
                height: intH,
                layer0: intL0,
                layer1: intL1,
                layer2: intL2,
                layer3: intL3,
                exitDoor: { x: 6, y: 8 }
            },
            npcs: [
                {
                    id: 1,
                    name: "Mestre Artesão Chen",
                    role: "Artesão de Jade e Escultor",
                    charName: "People4",
                    charIndex: 2,
                    x: 3,
                    y: 3,
                    direction: 2,
                    actionScript: `CityGenerator.talkGeneric("Mestre Artesão Chen");`
                }
            ],
            anchors: { street: { x: 4, y: 7 } }
        };
    })();

    // -------------------------------------------------------------------------
    // 3. RETIRO DO CULTIVADOR DE ESPADA (7x6 Exterior, 11x8 Interior)
    // -------------------------------------------------------------------------
    prefabs.SWORD_CULTIVATOR_RETREAT = assembleModularHouse({
        id: "SWORD_CULTIVATOR_RETREAT",
        type: "SWORD_CULTIVATOR",
        name: "Retiro do Cultivador de Espada",
        typeKey: "SWORD_CULTIVATOR_RETREAT",
        width: 7,
        height: 6,
        roofType: "ROOF_TIMBER",
        wallType: "WALL_GRAY_BRICK",
        residentName: "Cultivador de Espada Jin"
    });

    // -------------------------------------------------------------------------
    // 4. ESTÚDIO DE CALIGRAFIA & ESTUDO DO DAO (8x6 Exterior, 12x8 Interior)
    // -------------------------------------------------------------------------
    prefabs.SCHOLAR_STUDIO = assembleModularHouse({
        id: "SCHOLAR_STUDIO",
        type: "SCHOLAR",
        name: "Estúdio de Caligrafia & Estudo do Dao",
        typeKey: "SCHOLAR_STUDIO",
        width: 8,
        height: 6,
        roofType: "ROOF_CRIMSON",
        wallType: "WALL_TEMPLE_WHITE",
        residentName: "Erudito Mestre Wen"
    });

    // -------------------------------------------------------------------------
    // 5. RESIDÊNCIA TRADICIONAL JIANGNAN (7x7 Exterior, 11x9 Interior)
    // -------------------------------------------------------------------------
    prefabs.TRADITIONAL_DWELLING = assembleModularHouse({
        id: "TRADITIONAL_DWELLING",
        type: "TRADITIONAL",
        name: "Residência Tradicional Jiangnan",
        typeKey: "TRADITIONAL_DWELLING",
        width: 7,
        height: 7,
        roofType: "ROOF_DARK_SLATE",
        wallType: "WALL_WHITE_PLASTER",
        residentName: "Dona Mo"
    });

    // -------------------------------------------------------------------------
    // 6. ESTALAGEM DO VINHO IMORTAL (仙客来客栈 - 12x10 Exterior, 16x12 Interior)
    // -------------------------------------------------------------------------
    prefabs.IMMORTAL_WINE_INN = (() => {
        const extW = 12, extH = 10;
        const extL0 = createMatrix(extW, extH, "GROUND_COBBLE_B");
        const extL1 = createMatrix(extW, extH, 0);
        const extL2 = createMatrix(extW, extH, 0);
        const extL3 = createMatrix(extW, extH, 0);

        for (let y = 0; y <= 5; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "ROOF_JADE_EAVE";
        }
        for (let y = 6; y <= 9; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "WALL_RED_PALACE";
        }
        extL1[9][6] = 0; // Porta

        extL3[8][6] = "PROP_SIGN_TEA_WINE";
        extL2[9][4] = "PROP_WINE_JAR_A";
        extL2[9][3] = "PROP_WINE_JAR_B";
        extL2[9][8] = "PROP_SPIRIT_BARREL";
        extL2[9][1] = "PROP_LANTERN_STONE";
        extL2[9][10] = "PROP_LANTERN_STONE";

        const intW = 16, intH = 12;
        const intL0 = createMatrix(intW, intH, "FLOOR_POLISHED_WOOD");
        const intL1 = createMatrix(intW, intH, 0);
        const intL2 = createMatrix(intW, intH, 0);
        const intL3 = createMatrix(intW, intH, 0);

        for (let y = 0; y <= 1; y++) {
            for (let x = 0; x < intW; x++) intL1[y][x] = "INT_WALL_WOOD_LATTICE";
        }
        intL2[1][4] = "PROP_WINDOW_ORIENTAL_A";
        intL2[1][11] = "PROP_WINDOW_ORIENTAL_A";

        for (let y = 2; y <= 10; y++) {
            intL0[y][7] = "FLOOR_RED_CARPET";
            intL0[y][8] = "FLOOR_RED_CARPET";
        }

        // Balcão com flag Counter 0x80
        for (let x = 2; x <= 6; x++) {
            intL2[4][x] = "PROP_WOOD_COUNTER_A";
            intL2[2][x] = "PROP_ELIXIR_SHELF_BASE";
            intL3[1][x] = "PROP_ELIXIR_SHELF_TOP";
        }
        intL2[4][1] = "PROP_WINE_BARREL";
        intL2[5][1] = "PROP_WINE_JAR_A";

        intL3[1][13] = "PROP_CAULDRON_DING_TOP";
        intL2[2][13] = "PROP_CAULDRON_DING_BASE";
        intL2[2][14] = "PROP_STORAGE_CHEST";

        intL2[7][4] = "PROP_TEA_TABLE";
        intL3[6][4] = "PROP_TEAPOT";
        intL2[8][4] = "PROP_TEA_STOOL";

        intL2[9][4] = "PROP_TEA_TABLE";
        intL2[10][4] = "PROP_TEA_STOOL";

        intL2[7][11] = "PROP_TEA_TABLE";
        intL3[6][11] = "PROP_TEAPOT";
        intL2[8][11] = "PROP_TEA_STOOL";

        intL2[9][11] = "PROP_TEA_TABLE";
        intL2[10][11] = "PROP_TEA_STOOL";

        intL2[10][1] = "PROP_BONSAI_TREE";
        intL2[10][14] = "PROP_BONSAI_TREE";

        return {
            id: "IMMORTAL_WINE_INN",
            name: "Estalagem do Vinho Imortal (仙客来客栈)",
            type: "IMMORTAL_WINE_INN",
            scale: "COMMERCIAL",
            width: extW,
            height: extH,
            exterior: { layer0: extL0, layer1: extL1, layer2: extL2, layer3: extL3 },
            door: { x: 6, y: 9, side: "BOTTOM" },
            interior: {
                width: intW,
                height: intH,
                layer0: intL0,
                layer1: intL1,
                layer2: intL2,
                layer3: intL3,
                exitDoor: { x: 8, y: 11 }
            },
            npcs: [
                {
                    id: 1,
                    name: "Estalajadeiro Qian",
                    role: "Mestre da Estalagem de Vinho",
                    charName: "People2",
                    charIndex: 2,
                    x: 5,
                    y: 3,
                    direction: 2,
                    actionScript: `CityGenerator.openTavernMenu();`
                },
                {
                    id: 2,
                    name: "Jovem Atendente Xiao Er",
                    role: "Garçom e Informante",
                    charName: "People1",
                    charIndex: 1,
                    x: 9,
                    y: 7,
                    direction: 4,
                    actionScript: `CityGenerator.tellTavernRumor();`
                }
            ],
            anchors: { street: { x: 6, y: 10 } }
        };
    })();

    // -------------------------------------------------------------------------
    // 7. PAVILHÃO DE ALQUIMIA & PÍLULAS (丹药阁 - 10x8 Exterior, 14x10 Interior)
    // -------------------------------------------------------------------------
    prefabs.ALCHEMY_PAVILION = (() => {
        const extW = 10, extH = 8;
        const extL0 = createMatrix(extW, extH, "GROUND_COBBLE_B");
        const extL1 = createMatrix(extW, extH, 0);
        const extL2 = createMatrix(extW, extH, 0);
        const extL3 = createMatrix(extW, extH, 0);

        for (let y = 0; y <= 4; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "ROOF_GOLDEN_IMPERIAL";
        }
        for (let y = 5; y <= 7; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "WALL_WHITE_PLASTER";
        }
        extL1[7][5] = 0; // Porta

        extL3[6][5] = "PROP_SIGN_ALCHEMY";
        extL2[7][3] = "PROP_HERB_POT";
        extL2[7][7] = "PROP_HERB_POT";
        extL2[7][1] = "PROP_LANTERN_STONE";
        extL2[7][8] = "PROP_LANTERN_STONE";

        const intW = 14, intH = 10;
        const intL0 = createMatrix(intW, intH, "FLOOR_GRAY_STONE");
        const intL1 = createMatrix(intW, intH, 0);
        const intL2 = createMatrix(intW, intH, 0);
        const intL3 = createMatrix(intW, intH, 0);

        for (let y = 0; y <= 1; y++) {
            for (let x = 0; x < intW; x++) intL1[y][x] = "INT_WALL_STONE_SECT";
        }
        intL2[1][3] = "PROP_WINDOW_ORIENTAL_A";
        intL2[1][10] = "PROP_WINDOW_ORIENTAL_A";

        for (let x = 1; x <= 12; x += 3) {
            intL3[1][x] = "PROP_HERB_CABINET_TOP";
            intL2[2][x] = "PROP_HERB_CABINET_BASE";
        }

        intL3[3][3] = "PROP_PILL_FURNACE_TOP";
        intL2[4][3] = "PROP_PILL_FURNACE_BASE";
        intL3[3][10] = "PROP_PILL_FURNACE_TOP";
        intL2[4][10] = "PROP_PILL_FURNACE_BASE";

        // Balcão de pesagem com flag Counter 0x80
        for (let x = 6; x <= 8; x++) {
            intL2[5][x] = "PROP_WOOD_COUNTER_A";
        }
        intL3[4][6] = "PROP_SPIRIT_POTION_A";
        intL3[4][8] = "PROP_SPIRIT_POTION_B";

        intL2[7][2] = "PROP_MEDITATION_FUTON";
        intL2[7][11] = "PROP_MEDITATION_FUTON";

        return {
            id: "ALCHEMY_PAVILION",
            name: "Pavilhão de Alquimia & Pílulas da Montanha Celestial (丹药阁)",
            type: "ALCHEMY_PAVILION",
            scale: "COMMERCIAL",
            width: extW,
            height: extH,
            exterior: { layer0: extL0, layer1: extL1, layer2: extL2, layer3: extL3 },
            door: { x: 5, y: 7, side: "BOTTOM" },
            interior: {
                width: intW,
                height: intH,
                layer0: intL0,
                layer1: intL1,
                layer2: intL2,
                layer3: intL3,
                exitDoor: { x: 7, y: 9 }
            },
            npcs: [
                {
                    id: 1,
                    name: "Grão-Mestre Alquimista Mu",
                    role: "Mestre Alquimista de 7º Grau",
                    charName: "People1",
                    charIndex: 6,
                    x: 7,
                    y: 4,
                    direction: 2,
                    actionScript: `CityGenerator.openAlchemyShop();`
                }
            ],
            anchors: { street: { x: 5, y: 8 } }
        };
    })();

    // -------------------------------------------------------------------------
    // 8. FORJA DE ARTEFATOS & ESPADAS ESPIRITUAIS (神兵炼器阁 - 10x8 Exterior, 14x10 Interior)
    // -------------------------------------------------------------------------
    prefabs.ARTIFACT_FORGE = (() => {
        const extW = 10, extH = 8;
        const extL0 = createMatrix(extW, extH, "GROUND_COBBLE_B");
        const extL1 = createMatrix(extW, extH, 0);
        const extL2 = createMatrix(extW, extH, 0);
        const extL3 = createMatrix(extW, extH, 0);

        for (let y = 0; y <= 4; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "ROOF_DARK_SLATE";
        }
        for (let y = 5; y <= 7; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "WALL_GRAY_BRICK";
        }
        extL1[7][5] = 0; // Porta

        extL3[6][5] = "PROP_SIGN_FORGE";
        extL2[7][3] = "PROP_MINERAL_CRATE";
        extL2[7][7] = "PROP_ANVIL_A";
        extL2[7][1] = "PROP_LANTERN_STONE";
        extL2[7][8] = "PROP_LANTERN_STONE";

        const intW = 14, intH = 10;
        const intL0 = createMatrix(intW, intH, "FLOOR_GRAY_STONE");
        const intL1 = createMatrix(intW, intH, 0);
        const intL2 = createMatrix(intW, intH, 0);
        const intL3 = createMatrix(intW, intH, 0);

        for (let y = 0; y <= 1; y++) {
            for (let x = 0; x < intW; x++) intL1[y][x] = "INT_WALL_STONE_SECT";
        }

        intL3[1][3] = "PROP_PILL_FURNACE_TOP";
        intL2[2][3] = "PROP_PILL_FURNACE_BASE";

        intL2[4][3] = "PROP_ANVIL_A";
        intL2[4][4] = "PROP_ANVIL_B";

        intL2[2][10] = "PROP_SWORD_RACK_A";
        intL2[2][11] = "PROP_SWORD_RACK_B";
        intL2[4][11] = "PROP_SWORD_STAND";

        // Balcão com flag Counter 0x80
        for (let x = 7; x <= 9; x++) {
            intL2[5][x] = "PROP_WOOD_COUNTER_B";
        }

        intL2[2][1] = "PROP_MINERAL_CRATE";
        intL2[3][1] = "PROP_MINERAL_CRATE";
        intL2[7][1] = "PROP_STORAGE_CHEST";

        return {
            id: "ARTIFACT_FORGE",
            name: "Forja de Artefatos & Espadas Espirituais (神兵炼器阁)",
            type: "ARTIFACT_FORGE",
            scale: "COMMERCIAL",
            width: extW,
            height: extH,
            exterior: { layer0: extL0, layer1: extL1, layer2: extL2, layer3: extL3 },
            door: { x: 5, y: 7, side: "BOTTOM" },
            interior: {
                width: intW,
                height: intH,
                layer0: intL0,
                layer1: intL1,
                layer2: intL2,
                layer3: intL3,
                exitDoor: { x: 7, y: 9 }
            },
            npcs: [
                {
                    id: 1,
                    name: "Mestre Forjador Tie",
                    role: "Ferreiro de Armas Espirituais",
                    charName: "People2",
                    charIndex: 3,
                    x: 8,
                    y: 4,
                    direction: 2,
                    actionScript: `CityGenerator.openBlacksmithShop();`
                }
            ],
            anchors: { street: { x: 5, y: 8 } }
        };
    })();

    // -------------------------------------------------------------------------
    // 9. CASA DE CHÁ & SALÃO DE XADREZ WEIQI (品茗弈棋阁 - 10x8 Exterior, 14x10 Interior)
    // -------------------------------------------------------------------------
    prefabs.TEA_WEIQI_HOUSE = (() => {
        const extW = 10, extH = 8;
        const extL0 = createMatrix(extW, extH, "GROUND_COBBLE_B");
        const extL1 = createMatrix(extW, extH, 0);
        const extL2 = createMatrix(extW, extH, 0);
        const extL3 = createMatrix(extW, extH, 0);

        for (let y = 0; y <= 4; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "ROOF_JADE_EAVE";
        }
        for (let y = 5; y <= 7; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "WALL_WOOD_LATTICE";
        }
        extL1[7][5] = 0; // Porta

        extL3[6][5] = "PROP_SIGN_TEA_WINE";
        extL2[7][3] = "PROP_BONSAI_TREE";
        extL2[7][7] = "PROP_BONSAI_TREE";
        extL2[7][1] = "PROP_LANTERN_STONE";
        extL2[7][8] = "PROP_LANTERN_STONE";

        const intW = 14, intH = 10;
        const intL0 = createMatrix(intW, intH, "FLOOR_TATAMI_MAT");
        const intL1 = createMatrix(intW, intH, 0);
        const intL2 = createMatrix(intW, intH, 0);
        const intL3 = createMatrix(intW, intH, 0);

        for (let y = 0; y <= 1; y++) {
            for (let x = 0; x < intW; x++) intL1[y][x] = "INT_WALL_WOOD_LATTICE";
        }
        intL2[1][4] = "PROP_WINDOW_ORIENTAL_A";
        intL2[1][9] = "PROP_WINDOW_ORIENTAL_A";

        // Balcão de chá com flag Counter 0x80
        for (let x = 6; x <= 8; x++) {
            intL2[3][x] = "PROP_WOOD_COUNTER_A";
        }
        // Bule colocado no balcão (x: 6), NÃO sobre a cabeça do NPC (x: 7)
        intL3[3][6] = "PROP_TEAPOT";

        intL2[5][3] = "PROP_GO_BOARD";
        intL2[6][3] = "PROP_MEDITATION_FUTON";
        intL2[4][3] = "PROP_MEDITATION_FUTON";

        intL2[5][10] = "PROP_GO_BOARD";
        intL2[6][10] = "PROP_MEDITATION_FUTON";
        intL2[4][10] = "PROP_MEDITATION_FUTON";

        intL2[2][1] = "PROP_ZHAOBI_SCREEN";
        intL2[3][1] = "PROP_ZHAOBI_SCREEN";
        intL2[2][12] = "PROP_ZHAOBI_SCREEN";
        intL2[3][12] = "PROP_ZHAOBI_SCREEN";

        intL2[2][6] = "PROP_DAOIST_ALTAR";

        return {
            id: "TEA_WEIQI_HOUSE",
            name: "Casa de Chá & Salão de Xadrez Weiqi (品茗弈棋阁)",
            type: "TEA_WEIQI_HOUSE",
            scale: "COMMERCIAL",
            width: extW,
            height: extH,
            exterior: { layer0: extL0, layer1: extL1, layer2: extL2, layer3: extL3 },
            door: { x: 5, y: 7, side: "BOTTOM" },
            interior: {
                width: intW,
                height: intH,
                layer0: intL0,
                layer1: intL1,
                layer2: intL2,
                layer3: intL3,
                exitDoor: { x: 7, y: 9 }
            },
            npcs: [
                {
                    id: 1,
                    name: "Mestre do Chá Lu",
                    role: "Mestre Sommelier de Chá Espiritual",
                    charName: "People3",
                    charIndex: 2,
                    x: 7,
                    y: 2,
                    direction: 2,
                    actionScript: `CityGenerator.openTeaTasting();`
                }
            ],
            anchors: { street: { x: 5, y: 8 } }
        };
    })();

    // -------------------------------------------------------------------------
    // 10. PAVILHÃO DE TALISMÃS & MATRIZES (天符阵法阁 - 10x8 Exterior, 14x10 Interior)
    // -------------------------------------------------------------------------
    prefabs.TALISMAN_PAVILION = (() => {
        const extW = 10, extH = 8;
        const extL0 = createMatrix(extW, extH, "GROUND_COBBLE_B");
        const extL1 = createMatrix(extW, extH, 0);
        const extL2 = createMatrix(extW, extH, 0);
        const extL3 = createMatrix(extW, extH, 0);

        for (let y = 0; y <= 4; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "ROOF_CRIMSON";
        }
        for (let y = 5; y <= 7; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "WALL_TEMPLE_WHITE";
        }
        extL1[7][5] = 0; // Porta

        extL3[6][5] = "PROP_SIGN_TALISMAN";
        extL2[7][2] = "PROP_STELE_MONUMENT";
        extL2[7][8] = "PROP_STELE_MONUMENT";

        const intW = 14, intH = 10;
        const intL0 = createMatrix(intW, intH, "FLOOR_POLISHED_WOOD");
        const intL1 = createMatrix(intW, intH, 0);
        const intL2 = createMatrix(intW, intH, 0);
        const intL3 = createMatrix(intW, intH, 0);

        for (let y = 0; y <= 1; y++) {
            for (let x = 0; x < intW; x++) intL1[y][x] = "INT_WALL_WHITE_PLASTER";
        }

        intL2[3][2] = "PROP_TEA_TABLE";
        intL2[3][3] = "PROP_TEA_TABLE";
        intL2[3][4] = "PROP_TEA_TABLE";
        intL3[2][3] = "PROP_SCROLLS_A";

        intL3[1][10] = "PROP_SCRIPTURE_SHELF_A_TOP";
        intL2[2][10] = "PROP_SCRIPTURE_SHELF_A_BASE";
        intL3[1][11] = "PROP_SCRIPTURE_SHELF_B_TOP";
        intL2[2][11] = "PROP_SCRIPTURE_SHELF_B_BASE";

        // Balcão rúnico com flag Counter 0x80
        for (let x = 6; x <= 8; x++) {
            intL2[5][x] = "PROP_WOOD_COUNTER_A";
        }
        intL3[4][6] = "PROP_SCROLLS_B";
        intL3[4][8] = "PROP_SPIRIT_POTION_A";

        intL2[2][7] = "PROP_DAOIST_ALTAR";

        return {
            id: "TALISMAN_PAVILION",
            name: "Pavilhão de Talismãs & Matrizes de Formação (天符阵法阁)",
            type: "TALISMAN_PAVILION",
            scale: "COMMERCIAL",
            width: extW,
            height: extH,
            exterior: { layer0: extL0, layer1: extL1, layer2: extL2, layer3: extL3 },
            door: { x: 5, y: 7, side: "BOTTOM" },
            interior: {
                width: intW,
                height: intH,
                layer0: intL0,
                layer1: intL1,
                layer2: intL2,
                layer3: intL3,
                exitDoor: { x: 7, y: 9 }
            },
            npcs: [
                {
                    id: 1,
                    name: "Mestre das Runas Bai",
                    role: "Especialista em Talismãs e Matrizes",
                    charName: "People2",
                    charIndex: 0,
                    x: 7,
                    y: 4,
                    direction: 2,
                    actionScript: `CityGenerator.openTalismanShop();`
                }
            ],
            anchors: { street: { x: 5, y: 8 } }
        };
    })();

    // -------------------------------------------------------------------------
    // 11. PAVILHÃO DE ESCRITURAS E TÉCNICAS MARCIAIS (藏经阁 - 10x10 Exterior, 16x12 Interior)
    // -------------------------------------------------------------------------
    prefabs.MARTIAL_SCRIPTURE_LIBRARY = (() => {
        const extW = 10, extH = 10;
        const extL0 = createMatrix(extW, extH, "GROUND_COBBLE_B");
        const extL1 = createMatrix(extW, extH, 0);
        const extL2 = createMatrix(extW, extH, 0);
        const extL3 = createMatrix(extW, extH, 0);

        for (let y = 0; y <= 5; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "ROOF_JADE_EAVE";
        }
        for (let y = 6; y <= 9; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "WALL_GRAY_BRICK";
        }
        extL1[9][5] = 0; // Porta

        // Leões Foo Dogs com TOP e BASE perfeitamente integrados
        extL3[8][3] = "PROP_FOO_DOG_STATUE_TOP";
        extL2[9][3] = "PROP_FOO_DOG_STATUE_BASE";
        extL3[8][7] = "PROP_FOO_DOG_STATUE_TOP";
        extL2[9][7] = "PROP_FOO_DOG_STATUE_BASE";

        extL3[8][5] = "PROP_SIGN_SECT_CREST";
        extL2[9][1] = "PROP_LANTERN_STONE";
        extL2[9][8] = "PROP_LANTERN_STONE";

        const intW = 16, intH = 12;
        const intL0 = createMatrix(intW, intH, "FLOOR_GRAY_STONE");
        const intL1 = createMatrix(intW, intH, 0);
        const intL2 = createMatrix(intW, intH, 0);
        const intL3 = createMatrix(intW, intH, 0);

        for (let y = 0; y <= 1; y++) {
            for (let x = 0; x < intW; x++) intL1[y][x] = "INT_WALL_STONE_SECT";
        }

        for (let y = 2; y <= 10; y++) {
            intL0[y][7] = "FLOOR_RED_CARPET";
            intL0[y][8] = "FLOOR_RED_CARPET";
        }

        for (let x = 1; x <= 5; x += 2) {
            intL3[1][x] = "PROP_SCRIPTURE_SHELF_A_TOP";
            intL2[2][x] = "PROP_SCRIPTURE_SHELF_A_BASE";
        }
        for (let x = 10; x <= 14; x += 2) {
            intL3[1][x] = "PROP_SCRIPTURE_SHELF_B_TOP";
            intL2[2][x] = "PROP_SCRIPTURE_SHELF_B_BASE";
        }

        for (let y = 4; y <= 8; y += 2) {
            intL3[y - 1][2] = "PROP_SCRIPTURE_SHELF_A_TOP";
            intL2[y][2] = "PROP_SCRIPTURE_SHELF_A_BASE";
            intL3[y - 1][13] = "PROP_SCRIPTURE_SHELF_B_TOP";
            intL2[y][13] = "PROP_SCRIPTURE_SHELF_B_BASE";
        }

        intL2[2][7] = "PROP_DAOIST_ALTAR";
        intL2[2][8] = "PROP_DAOIST_ALTAR";
        intL3[1][7] = "PROP_ANCIENT_TOME_A";
        intL3[1][8] = "PROP_SCROLLS_B";

        intL2[6][5] = "PROP_TEA_TABLE";
        intL2[7][5] = "PROP_MEDITATION_FUTON";

        intL2[6][10] = "PROP_TEA_TABLE";
        intL2[7][10] = "PROP_MEDITATION_FUTON";

        return {
            id: "MARTIAL_SCRIPTURE_LIBRARY",
            name: "Pavilhão de Escrituras Marciais (藏经阁)",
            type: "MARTIAL_SCRIPTURE_LIBRARY",
            scale: "COMMERCIAL",
            width: extW,
            height: extH,
            exterior: { layer0: extL0, layer1: extL1, layer2: extL2, layer3: extL3 },
            door: { x: 5, y: 9, side: "BOTTOM" },
            interior: {
                width: intW,
                height: intH,
                layer0: intL0,
                layer1: intL1,
                layer2: intL2,
                layer3: intL3,
                exitDoor: { x: 8, y: 11 }
            },
            npcs: [
                {
                    id: 1,
                    name: "Ancião Guardião Gu",
                    role: "Guardião dos Manuais de Cultivo",
                    charName: "People3",
                    charIndex: 0,
                    x: 8,
                    y: 4,
                    direction: 2,
                    actionScript: `CityGenerator.openScriptureBlessing();`
                }
            ],
            anchors: { street: { x: 5, y: 10 } }
        };
    })();

    // -------------------------------------------------------------------------
    // 12. MANSÃO SIHEYUAN DE CLÃ CULTIVADOR (18x18 Modular Exterior, 18x13 Interior)
    // -------------------------------------------------------------------------
    function assembleSiheyuan(options = {}) {
        const includeEast = options.includeEastWing !== false;
        const includeWest = options.includeWestWing !== false;
        const includePond = options.includeCourtyardPond !== false;
        const roofType = options.roofType || "ROOF_JADE_EAVE";
        const wallType = options.wallType || "WALL_RED_PALACE";

        const W = 18, H = 18;
        const extL0 = createMatrix(W, H, "GROUND_COBBLE_A");
        const extL1 = createMatrix(W, H, 0);
        const extL2 = createMatrix(W, H, 0);
        const extL3 = createMatrix(W, H, 0);

        // Muros de Fechamento do Complexo Siheyuan
        for (let x = 0; x < W; x++) {
            extL1[0][x] = wallType;
            extL1[H - 1][x] = wallType;
        }
        for (let y = 0; y < H; y++) {
            extL1[y][0] = wallType;
            extL1[y][W - 1] = wallType;
        }

        // Portão Frontal Cerimonial (Daomen) aberto no Sul (x: 8, 9, y: 17)
        extL1[H - 1][8] = 0;
        extL1[H - 1][9] = 0;

        // Leões Foo Dogs guardando o portal frontal (TOP em y:16, BASE em y:17)
        extL3[H - 2][7] = "PROP_FOO_DOG_STATUE_TOP";
        extL2[H - 1][7] = "PROP_FOO_DOG_STATUE_BASE";
        extL3[H - 2][10] = "PROP_FOO_DOG_STATUE_TOP";
        extL2[H - 1][10] = "PROP_FOO_DOG_STATUE_BASE";

        // Tela de Espíritos Feng Shui (Zhaobi) logo após o portão
        extL2[15][8] = "PROP_ZHAOBI_SCREEN";
        extL2[15][9] = "PROP_ZHAOBI_SCREEN";

        // Salão Principal (Zhengfang) ao Norte (x: 3..14, y: 1..5)
        for (let y = 1; y <= 3; y++) {
            for (let x = 3; x <= 14; x++) extL1[y][x] = roofType;
        }
        for (let y = 4; y <= 5; y++) {
            for (let x = 3; x <= 14; x++) extL1[y][x] = wallType;
        }
        // Porta de entrada do Salão Principal Zhengfang
        extL1[5][8] = 0;
        extL1[5][9] = 0;

        // Colunas Paifang monumentais ladeando a entrada do Zhengfang (TOP em y:4, BASE em y:5)
        extL3[4][7] = "PROP_PAIFANG_PILLAR_TOP";
        extL2[5][7] = "PROP_PAIFANG_PILLAR_BASE";
        extL3[4][10] = "PROP_PAIFANG_PILLAR_TOP";
        extL2[5][10] = "PROP_PAIFANG_PILLAR_BASE";

        // Ala Oeste (Xixiangfang)
        if (includeWest) {
            for (let y = 6; y <= 12; y++) {
                for (let x = 1; x <= 4; x++) {
                    if (y <= 8) extL1[y][x] = roofType;
                    else extL1[y][x] = wallType;
                }
            }
            extL1[10][4] = 0; // Porta Ala Oeste
        } else {
            for (let y = 6; y <= 12; y += 2) {
                extL2[y][2] = "PROP_BAMBOO_TRUNK";
                extL3[y - 1][2] = "PROP_BAMBOO_TOP";
            }
        }

        // Ala Leste (Dongxiangfang)
        if (includeEast) {
            for (let y = 6; y <= 12; y++) {
                for (let x = 13; x <= 16; x++) {
                    if (y <= 8) extL1[y][x] = roofType;
                    else extL1[y][x] = wallType;
                }
            }
            extL1[10][13] = 0; // Porta Ala Leste
        } else {
            extL2[8][14] = "PROP_STELE_MONUMENT";
            extL2[10][14] = "PROP_STELE_MONUMENT";
        }

        // Pátio Central: Lago de Lótus com ponte de madeira
        if (includePond) {
            for (let y = 8; y <= 12; y++) {
                for (let x = 7; x <= 10; x++) {
                    extL0[y][x] = "GROUND_WATER_POND";
                }
            }
            extL2[9][8] = "PROP_WOOD_BRIDGE_V";
            extL2[10][8] = "PROP_WOOD_BRIDGE_V";
            extL2[11][8] = "PROP_WOOD_BRIDGE_V";
            extL2[9][9] = "PROP_WOOD_BRIDGE_V";
            extL2[10][9] = "PROP_WOOD_BRIDGE_V";
            extL2[11][9] = "PROP_WOOD_BRIDGE_V";

            extL2[8][7] = "PROP_LOTUS_WATER_PLANT";
            extL2[12][10] = "PROP_LOTUS_WATER_PLANT";
        }

        // Interior do Salão Principal Zhengfang: 18x13
        const intW = 18, intH = 13;
        const intL0 = createMatrix(intW, intH, "FLOOR_WHITE_MARBLE");
        const intL1 = createMatrix(intW, intH, 0);
        const intL2 = createMatrix(intW, intH, 0);
        const intL3 = createMatrix(intW, intH, 0);

        for (let y = 0; y <= 1; y++) {
            for (let x = 0; x < intW; x++) intL1[y][x] = "INT_WALL_WOOD_LATTICE";
        }

        // Tapete Vermelho Central
        for (let y = 2; y <= 11; y++) {
            for (let x = 7; x <= 10; x++) intL0[y][x] = "FLOOR_RED_CARPET";
        }

        // Trono do Patriarca ao norte (y: 2, x: 8, 9) com estandartes no topo (y: 1)
        intL2[2][8] = "PROP_MASTER_THRONE_BASE";
        intL2[2][9] = "PROP_MASTER_THRONE_BASE";
        intL3[1][8] = "PROP_SECT_BANNER";
        intL3[1][9] = "PROP_SECT_BANNER";

        // Dragões Qilin guardiões com TOP e BASE
        intL3[2][6] = "PROP_QILIN_STATUE_TOP";
        intL2[3][6] = "PROP_QILIN_STATUE_BASE";
        intL3[2][11] = "PROP_QILIN_STATUE_TOP";
        intL2[3][11] = "PROP_QILIN_STATUE_BASE";

        // Pilares Imperiais
        intL3[3][4] = "PROP_STONE_PILLAR_TOP";
        intL2[4][4] = "PROP_STONE_PILLAR_BASE";
        intL3[3][13] = "PROP_STONE_PILLAR_TOP";
        intL2[4][13] = "PROP_STONE_PILLAR_BASE";
        intL3[7][4] = "PROP_STONE_PILLAR_TOP";
        intL2[8][4] = "PROP_STONE_PILLAR_BASE";
        intL3[7][13] = "PROP_STONE_PILLAR_TOP";
        intL2[8][13] = "PROP_STONE_PILLAR_BASE";

        for (let y = 5; y <= 9; y += 2) {
            intL2[y][5] = "PROP_TEA_TABLE";
            intL2[y][12] = "PROP_TEA_TABLE";
        }

        return {
            id: "SIHEYUAN_CLAN_MANSION",
            name: "Mansão Siheyuan de Clã Cultivador",
            type: "SIHEYUAN_CLAN_MANSION",
            scale: "COMPLEX",
            width: W,
            height: H,
            exterior: { layer0: extL0, layer1: extL1, layer2: extL2, layer3: extL3 },
            door: { x: 8, y: 5, side: "BOTTOM" }, // Entrada do Salão Principal Zhengfang
            interior: {
                width: intW,
                height: intH,
                layer0: intL0,
                layer1: intL1,
                layer2: intL2,
                layer3: intL3,
                exitDoor: { x: 9, y: 12 }
            },
            npcs: [
                {
                    id: 1,
                    name: "Patriarca Xiao Tian",
                    role: "Líder do Clã Xiao",
                    charName: "People4",
                    charIndex: 0,
                    x: 9,
                    y: 3, // Em frente ao trono no tapete vermelho (100% desobstruído)
                    direction: 2,
                    actionScript: `CityGenerator.talkToClanPatriarch();`
                },
                {
                    id: 2,
                    name: "Discípulo Sênior Long",
                    role: "Guarda do Salão do Clã",
                    charName: "People3",
                    charIndex: 4,
                    x: 6,
                    y: 4, // Posição de guarda desobstruída
                    direction: 2,
                    actionScript: `CityGenerator.talkToClanDisciple();`
                }
            ],
            anchors: { street: { x: 8, y: 17 }, mainHall: { x: 8, y: 5 } }
        };
    }

    prefabs.SIHEYUAN_CLAN_MANSION = assembleSiheyuan();

    // -------------------------------------------------------------------------
    // 13. PALÁCIO DO LORDE DA CIDADE (城主府 - 16x12 Exterior, 18x14 Interior)
    // -------------------------------------------------------------------------
    prefabs.CITY_LORD_PALACE = (() => {
        const extW = 16, extH = 12;
        const extL0 = createMatrix(extW, extH, "GROUND_COBBLE_B");
        const extL1 = createMatrix(extW, extH, 0);
        const extL2 = createMatrix(extW, extH, 0);
        const extL3 = createMatrix(extW, extH, 0);

        for (let y = 0; y <= 6; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "ROOF_GOLDEN_IMPERIAL";
        }
        for (let y = 7; y <= 11; y++) {
            for (let x = 0; x < extW; x++) extL1[y][x] = "WALL_RED_PALACE";
        }
        extL1[11][8] = 0; // Porta imperial ampla

        // Estátuas guardiãs completas com TOP e BASE
        extL3[10][3] = "PROP_QILIN_STATUE_TOP";
        extL2[11][3] = "PROP_QILIN_STATUE_BASE";
        extL3[10][5] = "PROP_FOO_DOG_STATUE_TOP";
        extL2[11][5] = "PROP_FOO_DOG_STATUE_BASE";
        extL3[10][11] = "PROP_FOO_DOG_STATUE_TOP";
        extL2[11][11] = "PROP_FOO_DOG_STATUE_BASE";
        extL3[10][13] = "PROP_QILIN_STATUE_TOP";
        extL2[11][13] = "PROP_QILIN_STATUE_BASE";

        extL3[10][8] = "PROP_SIGN_SECT_CREST";
        extL2[11][1] = "PROP_LANTERN_STONE";
        extL2[11][15] = "PROP_LANTERN_STONE";

        const intW = 18, intH = 14;
        const intL0 = createMatrix(intW, intH, "FLOOR_WHITE_MARBLE");
        const intL1 = createMatrix(intW, intH, 0);
        const intL2 = createMatrix(intW, intH, 0);
        const intL3 = createMatrix(intW, intH, 0);

        for (let y = 0; y <= 1; y++) {
            for (let x = 0; x < intW; x++) intL1[y][x] = "INT_WALL_WOOD_LATTICE";
        }

        for (let y = 2; y <= 12; y++) {
            for (let x = 8; x <= 10; x++) intL0[y][x] = "FLOOR_RED_CARPET";
        }

        // Trono Imperial ao norte com estandarte
        intL2[2][9] = "PROP_MASTER_THRONE_BASE";
        intL3[1][9] = "PROP_SECT_BANNER";

        // Dragões Qilin ladeando o trono (TOP em y:2, BASE em y:3)
        intL3[2][7] = "PROP_QILIN_STATUE_TOP";
        intL2[3][7] = "PROP_QILIN_STATUE_BASE";
        intL3[2][11] = "PROP_QILIN_STATUE_TOP";
        intL2[3][11] = "PROP_QILIN_STATUE_BASE";

        intL3[3][3] = "PROP_STONE_PILLAR_TOP";
        intL2[4][3] = "PROP_STONE_PILLAR_BASE";
        intL3[3][14] = "PROP_STONE_PILLAR_TOP";
        intL2[4][14] = "PROP_STONE_PILLAR_BASE";
        intL3[8][3] = "PROP_STONE_PILLAR_TOP";
        intL2[9][3] = "PROP_STONE_PILLAR_BASE";
        intL3[8][14] = "PROP_STONE_PILLAR_TOP";
        intL2[9][14] = "PROP_STONE_PILLAR_BASE";

        // Grande Mesa de Conselho Militar e Mapa Estratégico
        intL2[6][5] = "PROP_TEA_TABLE";
        intL2[6][6] = "PROP_TEA_TABLE";
        intL3[5][5] = "PROP_SCROLLS_B";

        intL2[6][12] = "PROP_TEA_TABLE";
        intL2[6][13] = "PROP_TEA_TABLE";
        intL3[5][12] = "PROP_SCROLLS_A";

        intL2[2][4] = "PROP_CAULDRON_DING_BASE";
        intL3[1][4] = "PROP_CAULDRON_DING_TOP";
        intL2[2][13] = "PROP_CAULDRON_DING_BASE";
        intL3[1][13] = "PROP_CAULDRON_DING_TOP";

        return {
            id: "CITY_LORD_PALACE",
            name: "Palácio do Lorde da Cidade (城主府)",
            type: "CITY_LORD_PALACE",
            scale: "COMPLEX",
            width: extW,
            height: extH,
            exterior: { layer0: extL0, layer1: extL1, layer2: extL2, layer3: extL3 },
            door: { x: 8, y: 11, side: "BOTTOM" },
            interior: {
                width: intW,
                height: intH,
                layer0: intL0,
                layer1: intL1,
                layer2: intL2,
                layer3: intL3,
                exitDoor: { x: 9, y: 13 }
            },
            npcs: [
                {
                    id: 1,
                    name: "Lorde Governador Han",
                    role: "Soberano da Província Imortal",
                    charName: "People4",
                    charIndex: 0,
                    x: 9,
                    y: 3, // Em frente ao trono no tapete vermelho (100% livre)
                    direction: 2,
                    actionScript: `CityGenerator.talkToCityLord();`
                },
                {
                    id: 2,
                    name: "General Zhao",
                    role: "Comandante das Forças da Cidade",
                    charName: "People1",
                    charIndex: 2,
                    x: 6,
                    y: 7, // Ao lado da mesa de estratégia olhando para o mapa (100% livre)
                    direction: 8,
                    actionScript: `CityGenerator.talkToGeneral();`
                }
            ],
            anchors: { street: { x: 8, y: 12 } }
        };
    })();

    // =========================================================================
    // 5. API PÚBLICA DO MÓDULO
    // =========================================================================
    const XianxiaBuildingPrefabs = {
        XianxiaPalette: XianxiaPalette,
        prefabs: prefabs,
        assembleModularHouse: assembleModularHouse,
        assembleSiheyuan: assembleSiheyuan,

        getBuilding(type) {
            return prefabs[type] || null;
        },

        listBuildingTypes() {
            return Object.keys(prefabs);
        },

        resolveTile(keyOrId) {
            return XianxiaPalette.resolve(keyOrId);
        },

        resolveMatrix: resolveMatrix
    };

    if (typeof window !== "undefined") {
        window.XianxiaBuildingPrefabs = XianxiaBuildingPrefabs;
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = XianxiaBuildingPrefabs;
    }

})();
