//=============================================================================
// RPG Maker MZ - CultivationCore.js [v2.0.0 - Edição Completa Refinada]
//=============================================================================

/*:
 * @target MZ
 * @plugindesc [v2.0.0] Sistema Completo de Cultivo Espiritual & Identidade Oculta (Xianxia/Wuxia): Nascimento Cego (só Nome), Fisiologia (???), Monstros 1º-9º Grau, Desvio de Qi, Perícias Skyrim e Menu em Abas.
 * @author Gabriel & Antigravity
 *
 * @param --- Fluxo de Novo Jogo ---
 * @default
 *
 * @param EnableBlindBirthScreen
 * @text Nascimento Cego (Apenas Nome)
 * @parent --- Fluxo de Novo Jogo ---
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc No Novo Jogo, o jogador escolhe apenas o Nome; Raça, Aparência, Clã, Constituição, Linhagem e Elementos são ocultos.
 * @default true
 *
 * @param ReplaceDefaultMenu
 * @text Substituir Menu Padrão (ESC)
 * @parent --- Fluxo de Novo Jogo ---
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Substitui o menu padrão do RPG Maker pelo Novo Menu Unificado em Abas (Inventário, Fisiologia, Cultivo, Skyrim, Mapa, Quests, Clã).
 * @default true
 *
 * @param --- Controles & Teclas ---
 * @default
 *
 * @param MeditationKey
 * @text Tecla de Meditação
 * @parent --- Controles & Teclas ---
 * @type select
 * @option C
 * @value C
 * @option V
 * @value V
 * @option Z
 * @value Z
 * @option SPACE
 * @value SPACE
 * @desc Tecla para entrar/sair da meditação ativa no mapa.
 * @default C
 *
 * @param CultivationMenuKey
 * @text Tecla de Config. de Cultivo
 * @parent --- Controles & Teclas ---
 * @type select
 * @option K
 * @value K
 * @option J
 * @value J
 * @option Y
 * @value Y
 * @option TAB
 * @value TAB
 * @desc Abre diretamente a aba de Configuração de Cultivo do Novo Menu.
 * @default K
 *
 * @param GatherMaterialKey
 * @text Tecla de Coletar/Sondar Mapa
 * @parent --- Controles & Teclas ---
 * @type select
 * @option G
 * @value G
 * @option F
 * @value F
 * @option E
 * @value E
 * @desc Tecla para sondar o terreno com Sentido Espiritual e coletar materiais (Ervas, Minérios, Cristais).
 * @default G
 *
 * @param --- Taxas de Qi & Meditação ---
 * @default
 *
 * @param PassiveQiPerSecond
 * @text Qi Passivo ao Andar (/seg)
 * @parent --- Taxas de Qi & Meditação ---
 * @type number
 * @decimals 2
 * @desc Quantidade base de Qi absorvida automaticamente enquanto caminha pelo mundo.
 * @default 0.65
 *
 * @param MeditationQiMultiplier
 * @text Multiplicador em Meditação
 * @parent --- Taxas de Qi & Meditação ---
 * @type number
 * @decimals 1
 * @desc Multiplicador de absorção de Qi ao meditar parado na técnica configurada.
 * @default 8.5
 *
 * @param --- Avisos Flutuantes (HUD Minimalista) ---
 * @default
 *
 * @param EnableToasts
 * @text Ativar Avisos Minimalistas
 * @parent --- Avisos Flutuantes (HUD Minimalista) ---
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Exibe avisos pequenos e visíveis na tela (subida de habilidades, sintomas de Desvio de Qi e alerta de Qi acabando).
 * @default true
 *
 * @param ToastPosition
 * @text Posição dos Avisos
 * @parent --- Avisos Flutuantes (HUD Minimalista) ---
 * @type select
 * @option Superior Direito
 * @value top-right
 * @option Superior Centro
 * @value top-center
 * @option Inferior Centro
 * @value bottom-center
 * @default top-right
 *
 * @command startMeditation
 * @text Iniciar Meditação
 * @desc Inicia a meditação na Técnica de Cultivo configurada.
 *
 * @command stopMeditation
 * @text Parar Meditação
 * @desc Encerra a meditação ativa.
 *
 * @command openCultivationMenu
 * @text Abrir Menu Unificado / Cultivo
 * @desc Abre o Novo Menu Unificado na aba desejada.
 * @arg tab
 * @text Aba Inicial
 * @type select
 * @option Inventário
 * @value inventory
 * @option Fisiologia & Status
 * @value physiology
 * @option Configuração de Cultivo
 * @value cultivation
 * @option Habilidades (Skyrim)
 * @value skills
 * @option Mapa
 * @value map
 * @option Quests
 * @value quests
 * @option Relacionamentos & Clã
 * @value relationships
 * @default cultivation
 *
 * @command revealTrait
 * @text Revelar Característica Oculta
 * @desc Revela um mistério da fisiologia do jogador (ou via Pedra de Teste / Mestre).
 * @arg trait
 * @text Característica
 * @type select
 * @option Raça & Aparência
 * @value race
 * @option Anatomia de Meridianos
 * @value anatomy
 * @option Família / Clã
 * @value family
 * @option Linhagem Sanguínea
 * @value bloodline
 * @option Pureza da Linhagem (%)
 * @value bloodlinePurity
 * @option Constituição Corporal
 * @value constitution
 * @option Afinidade Elemental
 * @value elements
 * @option Revelar Tudo (Mestre Supremo)
 * @value all
 * @default race
 *
 * @command grantHeritage
 * @text Conceder Herança Sanguínea (Humanos)
 * @desc Permite ao jogador (especialmente Humanos) absorver um legado ancestral divino.
 * @arg bloodlineId
 * @text Linhagem da Herança
 * @type select
 * @option Dragão Verdadeiro
 * @value true_dragon
 * @option Fênix Cósmica
 * @value cosmic_phoenix
 * @option Qilin Sagrado
 * @value qilin_sacred
 * @option Colosso Abissal
 * @value abyssal_behemoth
 * @option Imperador Imortal Humano
 * @value immortal_emperor
 * @default true_dragon
 *
 * @command triggerEpiphany
 * @text Desencadear Epifania (Rompimento Súbito)
 * @desc Faz o cultivador romper um nível de uma só vez.
 * @arg realmType
 * @text Trilha
 * @type select
 * @option Qi / Grau Bestial
 * @value qi
 * @option Corpo
 * @value body
 * @option Alma
 * @value soul
 * @default qi
 * @arg message
 * @text Mensagem
 * @type string
 * @default Compreensão Súbita do Dao! Seu gargalo se desfez instantaneamente!
 *
 * @command addQiExp
 * @text Conceder Experiência de Qi
 * @arg amount
 * @type number
 * @default 150
 *
 * @command addSkillExp
 * @text Conceder Exp de Perícia (Skyrim)
 * @arg skill
 * @type select
 * @option Meditação
 * @value meditation
 * @option Têmpera Corporal
 * @value bodyTempering
 * @option Sentido Espiritual
 * @value soulPerception
 * @option Alquimia
 * @value alchemy
 * @option Forja
 * @value smithing
 * @option Arranjos
 * @value arrays
 * @default meditation
 * @arg exp
 * @type number
 * @default 60
 */

(() => {
    "use strict";

    const pluginName = "CultivationCore";
    const params = PluginManager.parameters(pluginName);

    const enableBlindBirthScreen = String(params["EnableBlindBirthScreen"] || "true") === "true";
    const replaceDefaultMenu = String(params["ReplaceDefaultMenu"] || "true") === "true";
    const meditationKey = String(params["MeditationKey"] || "C").toUpperCase();
    const cultivationMenuKey = String(params["CultivationMenuKey"] || "K").toUpperCase();
    const gatherMaterialKey = String(params["GatherMaterialKey"] || "G").toUpperCase();
    const passiveQiPerSecond = Number(params["PassiveQiPerSecond"] || 0.65);
    const meditationQiMultiplier = Number(params["MeditationQiMultiplier"] || 8.5);
    const enableToasts = String(params["EnableToasts"] || "true") === "true";
    const toastPosition = String(params["ToastPosition"] || "top-right");

    const KEY_CODES = {
        "C": 67, "K": 75, "J": 74, "Y": 89, "V": 86, "Z": 90,
        "G": 71, "F": 70, "E": 69, "TAB": 9, "SPACE": 32
    };
    Input.keyMapper[KEY_CODES[meditationKey] || 67] = "meditationKey";
    Input.keyMapper[KEY_CODES[cultivationMenuKey] || 75] = "cultivationMenuKey";
    Input.keyMapper[KEY_CODES[gatherMaterialKey] || 71] = "gatherMaterialKey";

    // =========================================================================
    // 1. TAXONOMIA COMPLETA: RAÇAS, MONSTROS (1º-9º GRAU), ANATOMIAS, LINHAGENS
    // =========================================================================

    const MERIDIAN_ANATOMIES = {
        "human_12_meridians": {
            id: "human_12_meridians",
            name: "12 Meridianos Principais & 8 Vasos Extraordinários",
            desc: "Anatomia espiritual versátil com 3 Dantians. Permite Cultivo Tríplice (Qi, Corpo e Alma), assimilação de Heranças e domínio de Alquimia, Forja e Arranjos."
        },
        "beast_core": {
            id: "beast_core",
            name: "Núcleo Interno Bestial & Veias Primordiais",
            desc: "O Qi se condensa em um Núcleo Bestial ligado ao sangue. Evolução de 1º a 9º Grau ditada pela Pureza da Linhagem, despertando consciência e forma humana."
        },
        "asura_blood_vessels": {
            id: "asura_blood_vessels",
            name: "Vasos de Sangue Frenéticos & Coração Asura",
            desc: "Meridianos pulsantes que convertem vitalidade e intenção de batalha em poder destrutivo. Rejeita técnicas passivas ou puramente luminosas."
        },
        "ethereal_vortex": {
            id: "ethereal_vortex",
            name: "Vórtice Elemental Etéreo (Sem Carne Mortal)",
            desc: "Corpo formado por energia espiritual condensada. Absorve Qi da natureza com perfeição, mas possui baixa densidade física."
        },
        "crystalline_veins": {
            id: "crystalline_veins",
            name: "Veios Minerais Cristalinos (Silicóide)",
            desc: "Rede cristalina em vez de vasos sanguíneos. Imune a sangramentos e toxinas; incompatível com técnicas de sangue ou madeira."
        },
        "chitin_ganglia": {
            id: "chitin_ganglia",
            name: "Nós Ganglionares & Exoesqueleto Espiritual",
            desc: "O Qi flui por gânglios nervosos e tempera a carapaça externa. Sentido espiritual funciona como radar de enxame."
        },
        "sylvan_sap_veins": {
            id: "sylvan_sap_veins",
            name: "Meridianos Foliares de Seiva Vital",
            desc: "Canais orgânicos em simbiose com a natureza, florestas e luz solar/lunar. Sofre atrito severo com técnicas de fogo destrutivo ou morte."
        },
        "undead_yin_channels": {
            id: "undead_yin_channels",
            name: "Canais Cinzentos de Yin & Fogo da Alma",
            desc: "Meridianos frios movidos por Yin extremo e essência anímica. Energia Yang/Solar causa combustão interna dolorosa."
        }
    };

    // Raças Clássicas + Grande Variedade de Monstros + Cosmologia Extrema Procedural
    const RACES_DATA = [
        // 1. HUMANOS (A Raça Mais Roubada / Versátil)
        {
            id: "human",
            category: "human",
            name: "Humano",
            anatomyId: "human_12_meridians",
            canTripleCultivate: true,
            canAbsorbHeritage: true,
            professionBonus: 1.5, // +50% eficiência em Alquimia, Forja e Arranjos
            appearanceClue: "Sua pele macia, cinco dedos ágeis e pulsação nos doze pontos acupunturais revelam uma forma puramente Humana.",
            parentAppearanceClue: "Seus pais possuem feições humanas clássicas e vestes de tecido mortal.",
            spriteName: "Actor1",
            spriteIndex: 0,
            baseQiAffinity: 1.15,
            baseBodyAffinity: 1.10,
            baseSoulAffinity: 1.35,
            statModifiers: { mhp: 20, mmp: 40, atk: 4, def: 4, mat: 10, mdf: 10, agi: 6, luk: 12 },
            favoredElements: ["all"],
            conflictingElements: []
        },
        // 2. GRANDE VARIEDADE DE MONSTROS / FERAS ESPIRITUAIS (1º ao 9º Grau)
        {
            id: "monster_abyssal_wolf",
            category: "monster",
            name: "Fera Espiritual: Lobo Abissal da Lua Negra",
            anatomyId: "beast_core",
            canTripleCultivate: false,
            canAbsorbHeritage: false,
            professionBonus: 0.7,
            appearanceClue: "Ao observar seu reflexo, você vê presas afiadas, pupilas lupinas prateadas e pelagem escura que absorve o luar.",
            parentAppearanceClue: "Sua alcateia ancestral carrega a silhueta feroz dos Lobos da Lua Negra.",
            spriteName: "Monster",
            spriteIndex: 2,
            humanFormSprite: { name: "Actor2", index: 4 },
            baseQiAffinity: 1.0,
            baseBodyAffinity: 1.65,
            baseSoulAffinity: 0.85,
            statModifiers: { mhp: 160, mmp: 10, atk: 18, def: 12, mat: 4, mdf: 6, agi: 16, luk: 2 },
            favoredElements: ["darkness", "wind", "ice"],
            conflictingElements: ["light", "fire"]
        },
        {
            id: "monster_thunder_tiger",
            category: "monster",
            name: "Fera Espiritual: Tigre Branco do Trovão Celestial",
            anatomyId: "beast_core",
            canTripleCultivate: false,
            canAbsorbHeritage: false,
            professionBonus: 0.75,
            appearanceClue: "Listras brancas e azul-elétricas percorrem seus membros musculosos, com garras que estalam faíscas metálicas.",
            parentAppearanceClue: "O rugido de seus progenitores ecoava como trovões rasgando os picos.",
            spriteName: "Monster",
            spriteIndex: 5,
            humanFormSprite: { name: "Actor1", index: 4 },
            baseQiAffinity: 1.1,
            baseBodyAffinity: 1.8,
            baseSoulAffinity: 0.8,
            statModifiers: { mhp: 200, mmp: 0, atk: 24, def: 16, mat: 6, mdf: 4, agi: 14, luk: 0 },
            favoredElements: ["thunder", "metal", "wind"],
            conflictingElements: ["earth", "wood"]
        },
        {
            id: "monster_flood_serpent",
            category: "monster",
            name: "Fera Espiritual: Serpente de Inundação (Jiao)",
            anatomyId: "beast_core",
            canTripleCultivate: false,
            canAbsorbHeritage: false,
            professionBonus: 0.8,
            appearanceClue: "Escamas iridescentes frias cobrem seu corpo sinuoso e uma protuberância na testa anuncia futuros chifres dracônicos.",
            parentAppearanceClue: "Seus ascendentes habitavam abismos subaquáticos com escamas de serpente-dragão.",
            spriteName: "Monster",
            spriteIndex: 4,
            humanFormSprite: { name: "Actor3", index: 2 },
            baseQiAffinity: 1.25,
            baseBodyAffinity: 1.55,
            baseSoulAffinity: 0.95,
            statModifiers: { mhp: 180, mmp: 35, atk: 15, def: 18, mat: 12, mdf: 12, agi: 10, luk: 4 },
            favoredElements: ["water", "ice", "thunder"],
            conflictingElements: ["fire", "earth"]
        },
        {
            id: "monster_nine_tail_fox",
            category: "monster",
            name: "Fera Espiritual: Raposa Espiritual Miragem",
            anatomyId: "beast_core",
            canTripleCultivate: false,
            canAbsorbHeritage: false,
            professionBonus: 1.1,
            appearanceClue: "Orelhas vulpinas sensíveis ao Qi e caudas felpudas onde dançam ilusões espirituais hipnóticas.",
            parentAppearanceClue: "Sua linhagem familiar é lembrada por olhos encantadores e caudas alvas.",
            spriteName: "Nature",
            spriteIndex: 1,
            humanFormSprite: { name: "Actor1", index: 1 },
            baseQiAffinity: 1.35,
            baseBodyAffinity: 1.1,
            baseSoulAffinity: 1.5,
            statModifiers: { mhp: 90, mmp: 70, atk: 8, def: 6, mat: 20, mdf: 18, agi: 18, luk: 14 },
            favoredElements: ["fire", "light", "darkness"],
            conflictingElements: ["metal", "earth"]
        },
        {
            id: "monster_obsidian_tortoise",
            category: "monster",
            name: "Fera Espiritual: Tartaruga Abissal de Obsidiana",
            anatomyId: "beast_core",
            canTripleCultivate: false,
            canAbsorbHeritage: false,
            professionBonus: 0.85,
            appearanceClue: "Uma carapaça negra gravada com runas naturais protege suas costas, exalando longevidade e peso imenso.",
            parentAppearanceClue: "Seus ancestrais eram confundidos com ilhas rochosas imóveis por séculos.",
            spriteName: "Monster",
            spriteIndex: 6,
            humanFormSprite: { name: "People1", index: 6 },
            baseQiAffinity: 1.0,
            baseBodyAffinity: 2.1,
            baseSoulAffinity: 1.0,
            statModifiers: { mhp: 300, mmp: 20, atk: 12, def: 32, mat: 4, mdf: 24, agi: -6, luk: 8 },
            favoredElements: ["water", "earth"],
            conflictingElements: ["wind", "fire"]
        },
        // 3. RAÇAS CLÁSSICAS DE XIANXIA EXPANDIDO
        {
            id: "asura_demon",
            category: "classic_nonhuman",
            name: "Demônio Asura",
            anatomyId: "asura_blood_vessels",
            canTripleCultivate: true,
            canAbsorbHeritage: false,
            professionBonus: 0.85,
            appearanceClue: "Marcas carmesins naturais cruzam sua pele, suas íris brilham em vermelho sangue e seu coração bate como um tambor de guerra.",
            parentAppearanceClue: "Seus parentes possuíam chifres sutis e uma aura sanguinária inconfundível dos Asuras.",
            spriteName: "Evil",
            spriteIndex: 1,
            baseQiAffinity: 1.15,
            baseBodyAffinity: 1.6,
            baseSoulAffinity: 0.9,
            statModifiers: { mhp: 140, mmp: 20, atk: 22, def: 10, mat: 10, mdf: 2, agi: 12, luk: -2 },
            favoredElements: ["fire", "darkness", "metal"],
            conflictingElements: ["light", "wood"]
        },
        {
            id: "celestial_spirit",
            category: "classic_nonhuman",
            name: "Celestial / Espírito Natural Puro",
            anatomyId: "ethereal_vortex",
            canTripleCultivate: false,
            canAbsorbHeritage: false,
            professionBonus: 1.2,
            appearanceClue: "Seu corpo quase não projeta peso no solo; suas veias brilham com luz translúcida como se fossem feitas de névoa e Qi condensado.",
            parentAppearanceClue: "Você não nasceu de carne comum, mas da condensação espiritual de um veio sagrado.",
            spriteName: "Nature",
            spriteIndex: 3,
            baseQiAffinity: 1.65,
            baseBodyAffinity: 0.65,
            baseSoulAffinity: 1.55,
            statModifiers: { mhp: -20, mmp: 100, atk: 0, def: 2, mat: 24, mdf: 22, agi: 15, luk: 15 },
            favoredElements: ["light", "wind", "water", "thunder"],
            conflictingElements: ["darkness"]
        },
        // 4. COSMOLOGIA EXTREMA / FANTASIA LIVRE PROCEDURAL
        {
            id: "stone_silicon",
            category: "exotic",
            name: "Povo de Rocha (Litóide / Silicóide)",
            anatomyId: "crystalline_veins",
            canTripleCultivate: false,
            canAbsorbHeritage: false,
            professionBonus: 1.15, // Bom em forja e arranjos
            appearanceClue: "Sua epiderme tem textura de granito polido e jade; onde deveria correr sangue, brilham filamentos cristalinos de quartzo.",
            parentAppearanceClue: "Seu clã habita cavernas minerais profundas, esculpidos na própria rocha mãe.",
            spriteName: "Monster",
            spriteIndex: 7,
            baseQiAffinity: 0.85,
            baseBodyAffinity: 1.95,
            baseSoulAffinity: 0.75,
            statModifiers: { mhp: 240, mmp: -10, atk: 16, def: 28, mat: -4, mdf: 16, agi: -8, luk: 0 },
            favoredElements: ["earth", "metal"],
            conflictingElements: ["wood", "water", "wind"]
        },
        {
            id: "insectoid_hive",
            category: "exotic",
            name: "Homem-Inseto (Quitinóide Imperial)",
            anatomyId: "chitin_ganglia",
            canTripleCultivate: false,
            canAbsorbHeritage: false,
            professionBonus: 0.8,
            appearanceClue: "Placas de quitina negra reluzente revestem seus antebraços e olhos multifacetados captam o menor movimento do ar.",
            parentAppearanceClue: "Sua ninhada ancestral responde ao pulso telepático de uma Rainha Imortal.",
            spriteName: "Monster",
            spriteIndex: 3,
            baseQiAffinity: 0.95,
            baseBodyAffinity: 1.65,
            baseSoulAffinity: 1.25,
            statModifiers: { mhp: 150, mmp: 20, atk: 18, def: 20, mat: 4, mdf: 8, agi: 16, luk: 0 },
            favoredElements: ["wind", "earth", "darkness"],
            conflictingElements: ["fire", "ice"]
        },
        {
            id: "spirit_elf",
            category: "exotic",
            name: "Elfo Espiritual (Silvano Ancestral)",
            anatomyId: "sylvan_sap_veins",
            canTripleCultivate: true,
            canAbsorbHeritage: false,
            professionBonus: 1.35, // Excelente em Alquimia
            appearanceClue: "Orelhas longas e afiladas, cabelos que exalam aroma de flor espiritual e meridianos verdes como seiva de árvore milenar.",
            parentAppearanceClue: "Seus parentes têm feições élficas esguias e vivem em comunhão com Árvores do Mundo.",
            spriteName: "Actor3",
            spriteIndex: 0,
            baseQiAffinity: 1.35,
            baseBodyAffinity: 0.85,
            baseSoulAffinity: 1.4,
            statModifiers: { mhp: 40, mmp: 80, atk: 6, def: 4, mat: 18, mdf: 18, agi: 16, luk: 10 },
            favoredElements: ["wood", "water", "wind", "light"],
            conflictingElements: ["fire", "metal", "darkness"]
        },
        {
            id: "undead_cultivator",
            category: "exotic",
            name: "Morto-Vivo Desperto (Cultivador de Yin)",
            anatomyId: "undead_yin_channels",
            canTripleCultivate: false,
            canAbsorbHeritage: false,
            professionBonus: 0.9,
            appearanceClue: "Sua pele é pálida e fria como mármore funerário; seu peito não respira ar comum, mas arde com uma chama anímica azulada.",
            parentAppearanceClue: "Você despertou em meio a antigas lápides onde clãs esquecidos foram sepultados.",
            spriteName: "Evil",
            spriteIndex: 5,
            baseQiAffinity: 1.2,
            baseBodyAffinity: 1.45,
            baseSoulAffinity: 1.45,
            statModifiers: { mhp: 170, mmp: 50, atk: 12, def: 14, mat: 16, mdf: 16, agi: 4, luk: -4 },
            favoredElements: ["darkness", "ice", "earth"],
            conflictingElements: ["light", "fire"]
        }
    ];

    const BLOODLINES_DATA = [
        {
            id: "mortal_blood",
            name: "Sangue Comum Sem Linhagem Nobre",
            clanName: "Família Camponesa Sem Nome",
            clanReputation: "Sua família é composta por trabalhadores humildes sem registros nos pergaminhos de clãs imortais.",
            reputationRevealsBloodline: true,
            purityMultiplier: 1.0,
            bypassConflict: false,
            perk: "Determinação do Plebeu (+15% XP em Perícias estilo Skyrim)",
            statBonus: { mhp: 15, mmp: 10, atk: 2, def: 2, mat: 2, mdf: 2, agi: 2, luk: 5 }
        },
        {
            id: "true_dragon",
            name: "Linhagem do Dragão Verdadeiro (Zulong)",
            clanName: "Clã Ancestral Long (Guardiões das Escamas Celestes)",
            clanReputation: "Dizem as lendas locais que o Clã Long carrega nas veias o sangue tirânico dos Dragões Verdadeiros da Era Primordial.",
            reputationRevealsBloodline: true,
            purityMultiplier: 2.2,
            bypassConflict: false,
            perk: "Pressão Imperial Dracônica (+25% Poder de Qi e Físico)",
            statBonus: { mhp: 140, mmp: 60, atk: 15, def: 15, mat: 15, mdf: 12, agi: 8, luk: 6 }
        },
        {
            id: "cosmic_phoenix",
            name: "Linhagem da Fênix Imortal do Nirvana",
            clanName: "Casa Zhuque do Pavilhão Vermelho",
            clanReputation: "A Casa Zhuque é famosa em toda a província por seus descendentes que emanam chamas imortais de Fênix quando feridos.",
            reputationRevealsBloodline: true,
            purityMultiplier: 2.0,
            bypassConflict: false,
            perk: "Chama do Nirvana (Regenera meridianos e vitalidade continuamente)",
            statBonus: { mhp: 90, mmp: 90, atk: 10, def: 8, mat: 22, mdf: 18, agi: 14, luk: 10 }
        },
        {
            id: "qilin_sacred",
            name: "Linhagem do Qilin Auspicioso",
            clanName: "Linhagem Ruilin do Vale das Nuvens",
            clanReputation: "O Clã Ruilin tem a reputação de ser abençoado pelo sangue do Qilin Sagrado, atraindo ervas e tesouros onde quer que pisem.",
            reputationRevealsBloodline: true,
            purityMultiplier: 1.85,
            bypassConflict: false,
            perk: "Passos da Fortuna Celestial (+30 Sorte e Afinidade Ambiental)",
            statBonus: { mhp: 80, mmp: 70, atk: 8, def: 12, mat: 14, mdf: 16, agi: 12, luk: 30 }
        },
        {
            id: "abyssal_behemoth",
            name: "Linhagem do Behemoth Devorador de Montanhas",
            clanName: "Tribo Bárbara JuYue",
            clanReputation: "A Tribo JuYue é temida por sua força bruta capaz de partir rochedos com os punhos, herança direta do Behemoth Abissal.",
            reputationRevealsBloodline: true,
            purityMultiplier: 1.8,
            bypassConflict: false,
            perk: "Sangue Titânico (+40% Força Corporal e Defesa)",
            statBonus: { mhp: 220, mmp: 0, atk: 24, def: 24, mat: 0, mdf: 10, agi: 2, luk: 0 }
        },
        {
            id: "immortal_emperor",
            name: "Sangue Imperial do Soberano do Dao (Oculto)",
            clanName: "Ramo Exilado da Dinastia Xuan",
            clanReputation: "Sua família vive escondida sob nomes falsos, mas guarda relíquias quebradas de um antigo Imperador Imortal Humano.",
            reputationRevealsBloodline: true,
            purityMultiplier: 2.4,
            bypassConflict: true, // Linhagem suprema que contorna limites!
            perk: "Soberania dos Dez Mil Daos (Reduz em 2 níveis qualquer Desvio de Qi)",
            statBonus: { mhp: 120, mmp: 120, atk: 14, def: 14, mat: 20, mdf: 20, agi: 14, luk: 20 }
        }
    ];

    const CONSTITUTIONS_DATA = [
        {
            id: "mortal_physique",
            name: "Constituição Mortal Equilibrada",
            desc: "Meridianos estáveis sem polarização extrema. Não oferece bônus explosivos, mas raramente sofre conflito elemental grave.",
            symptomClue: "Ao circular o Qi, você sente um fluxo morno e regular, sem pontadas de frio ou calor excessivo.",
            favoredElements: [],
            forbiddenElements: [],
            bypassConflict: false,
            statBonus: { mhp: 20, mmp: 20, atk: 2, def: 2, mat: 2, mdf: 2 }
        },
        {
            id: "solar_yang",
            name: "Corpo Sagrado do Sol Ardente (Yang Extremo)",
            desc: "Seus vasos espirituais queimam como uma fornalha solar. Técnicas de Fogo, Luz e Trovão têm dobro de potência, mas Gelo e Escuridão ferem seus meridianos.",
            symptomClue: "Seu suor evapora em vapor branco e você sente seu sangue ferver com energia solar radiante!",
            favoredElements: ["fire", "light", "thunder"],
            forbiddenElements: ["ice", "darkness", "water"],
            bypassConflict: false,
            statBonus: { mhp: 80, mmp: 40, atk: 16, def: 8, mat: 18, mdf: 6 }
        },
        {
            id: "eternal_ice",
            name: "Físico de Jade da Geada Eterna (Yin Puro)",
            desc: "Medula e meridianos cristalizados pelo frio primordial. Domínio supremo sobre Gelo, Água e Yin, mas técnicas de Fogo causam choque térmico interno.",
            symptomClue: "Sua respiração condensa cristais de gelo no ar e seus meridianos pulsam com uma frieza serena e cortante.",
            favoredElements: ["ice", "water", "darkness"],
            forbiddenElements: ["fire", "light"],
            bypassConflict: false,
            statBonus: { mhp: 50, mmp: 80, atk: 6, def: 12, mat: 20, mdf: 18 }
        },
        {
            id: "thunder_tribulation",
            name: "Ossos de Relâmpago da Tribulação",
            desc: "Seus ossos conduzem eletricidade celestial naturalmente. Absorve raios para temperar o corpo, mas técnicas pesadas de Terra bloqueiam seu fluxo.",
            symptomClue: "Arcos voltaicos azulados saltam entre seus dedos e seus ossos vibram como sinos durante tempestades!",
            favoredElements: ["thunder", "wind", "metal"],
            forbiddenElements: ["earth"],
            bypassConflict: false,
            statBonus: { mhp: 70, mmp: 50, atk: 18, def: 6, mat: 18, mdf: 8 }
        },
        {
            id: "primordial_chaos",
            name: "Corpo Divino do Caos Primordial",
            desc: "A constituição lendária que existia antes da separação do Yin e do Yang. Converte e aceita QUALQUER elemento ou técnica sem sofrer Desvio de Qi!",
            symptomClue: "Uma névoa cinzenta primordial envolve seu Dantian, engolindo e harmonizando energias opostas sem qualquer rejeição!",
            favoredElements: ["all", "chaos", "fire", "ice", "thunder", "darkness", "light", "wood", "water", "earth", "metal", "wind"],
            forbiddenElements: [],
            bypassConflict: true, // Constituição que contorna todos os limites!
            statBonus: { mhp: 120, mmp: 120, atk: 15, def: 15, mat: 15, mdf: 15 }
        }
    ];

    const ELEMENTS_LIST = ["fire", "water", "wood", "earth", "metal", "thunder", "ice", "wind", "light", "darkness"];
    const ELEMENT_NAMES = {
        "fire": "Fogo (Yang)",
        "water": "Água",
        "wood": "Madeira (Vida)",
        "earth": "Terra",
        "metal": "Metal",
        "thunder": "Trovão Celestial",
        "ice": "Gelo (Yin)",
        "wind": "Vento",
        "light": "Luz Sagrada",
        "darkness": "Escuridão / Yin",
        "neutral": "Neutro / Puro",
        "chaos": "Caos Primordial",
        "all": "Universal"
    };

    const OPPOSITE_ELEMENTS = {
        "fire": "ice",
        "ice": "fire",
        "water": "fire",
        "light": "darkness",
        "darkness": "light",
        "thunder": "earth",
        "earth": "wind",
        "wind": "earth",
        "metal": "wood",
        "wood": "metal"
    };

    // Catálogo de Técnicas de Cultivo (para o Menu de Configuração de Cultivo)
    const CULTIVATION_TECHNIQUES = [
        {
            id: "basic_breath",
            name: "Respiração Básica da Brisa Serena",
            element: "neutral",
            requiredAnatomy: "any",
            focus: "qi",
            speedMultiplier: 1.0,
            bypassConflict: false,
            desc: "Técnica introdutória suave e neutra. Segura para qualquer raça ou constituição, sem risco de Desvio de Qi."
        },
        {
            id: "solar_flame_sutra",
            name: "Sutra Solar da Chama Suprema",
            element: "fire",
            requiredAnatomy: "human_or_beast",
            focus: "qi",
            speedMultiplier: 1.65,
            bypassConflict: false,
            desc: "Canaliza Qi ígneo violento. Muito rápida para afinidades de Fogo/Yang, mas causa grave Desvio de Qi em corpos de Gelo ou Yin."
        },
        {
            id: "abyssal_frost_art",
            name: "Escritura da Geada do Abismo Lunar",
            element: "ice",
            requiredAnatomy: "any",
            focus: "qi",
            speedMultiplier: 1.60,
            bypassConflict: false,
            desc: "Condensa Qi glacial nos meridianos. Excelente à meia-noite e para físicos Yin; congela meridianos solares."
        },
        {
            id: "nine_thunders_body",
            name: "Forja Corporal dos Nove Trovões",
            element: "thunder",
            requiredAnatomy: "any",
            focus: "body",
            speedMultiplier: 1.70,
            bypassConflict: false,
            desc: "Usa descargas de Qi de trovão para temperar carne, carapaça e ossos simultaneamente."
        },
        {
            id: "primal_beast_blood",
            name: "Método Bestial de Refino do Núcleo Sanguíneo",
            element: "darkness",
            requiredAnatomy: "beast_or_asura",
            focus: "qi_and_body",
            speedMultiplier: 1.85,
            bypassConflict: false,
            desc: "Exclusivo para anatomia de Núcleo Bestial ou Vasos Asura. Ferve o sangue ancestral e purifica a linhagem (+Pureza gradual). Causa Desvio severo em outras raças."
        },
        {
            id: "immortal_rock_canon",
            name: "Cânone Imortal da Montanha Inabalável",
            element: "earth",
            requiredAnatomy: "any",
            focus: "body",
            speedMultiplier: 1.55,
            bypassConflict: false,
            desc: "Absorve o magnetismo terrestre e minérios para petrificar a defesa física. Perfeito para Povo de Rocha e cultivadores corporais."
        },
        {
            id: "stellar_soul_contemplation",
            name: "Contemplação Estelar do Mar da Consciência",
            element: "light",
            requiredAnatomy: "any",
            focus: "soul",
            speedMultiplier: 1.60,
            bypassConflict: false,
            desc: "Expande o Sentido Espiritual e o Reino da Alma. Conflita apenas com canais de Mortos-Vivos ou escuridão pura."
        },
        {
            id: "yin_yang_harmony_manual",
            name: "Sutra Supremo de Harmonização Yin-Yang",
            element: "chaos",
            requiredAnatomy: "any",
            focus: "all",
            speedMultiplier: 1.45,
            bypassConflict: true, // Técnica que contorna limites!
            desc: "[TÉCNICA DE CONTORNO] Equilibra forças opostas, permitindo cultivar qualquer elemento sem sofrer Desvio de Qi e curando instabilidades!"
        }
    ];

    // Escalas de Reinos
    const QI_REALMS_STANDARD = [
        { name: "Mortal Desperto", stages: 1, baseMaxExp: 100 },
        { name: "Condensação de Qi", stages: 9, baseMaxExp: 140 },
        { name: "Estabelecimento de Fundação", stages: 4, baseMaxExp: 700 },
        { name: "Núcleo Dourado (Golden Core)", stages: 4, baseMaxExp: 2800 },
        { name: "Alma Nascente (Nascent Soul)", stages: 4, baseMaxExp: 10000 },
        { name: "Transformação Divina", stages: 4, baseMaxExp: 38000 },
        { name: "Ascensão Imortal", stages: 1, baseMaxExp: 120000 }
    ];

    // Escala de Monstros / Feras (1º ao 9º Grau ditado pela Pureza da Linhagem)
    const MONSTER_GRADES = [
        { grade: 1, name: "Fera Espiritual de 1º Grau (Selvagem)", minPurity: 10, baseMaxExp: 150, consciousness: "Instinto Selvagem", form: "Forma Bestial Nativa" },
        { grade: 2, name: "Fera Espiritual de 2º Grau (Feroz)", minPurity: 15, baseMaxExp: 350, consciousness: "Instinto Aguçado", form: "Forma Bestial Nativa" },
        { grade: 3, name: "Fera Espiritual de 3º Grau (Núcleo Bruto)", minPurity: 25, baseMaxExp: 800, consciousness: "Semi-Consciente", form: "Forma Bestial Nativa" },
        { grade: 4, name: "Fera Sapiens de 4º Grau (Desperta)", minPurity: 35, baseMaxExp: 1800, consciousness: "Consciência Desperta & Fala Espiritual", form: "Forma Bestial Sapiens" },
        { grade: 5, name: "Fera Sapiens de 5º Grau (General Besta)", minPurity: 45, baseMaxExp: 4000, consciousness: "Intelecto Superior", form: "Forma Bestial Sapiens" },
        { grade: 6, name: "Lorde Besta de 6º Grau (Meio-Humanoide)", minPurity: 55, baseMaxExp: 9000, consciousness: "Sabedoria Ancestral", form: "Transformação Parcial Híbrida" },
        { grade: 7, name: "Rei Besta de 7º Grau (Forma Humana)", minPurity: 70, baseMaxExp: 20000, consciousness: "Mente Transcendente", form: "Transformação Humana Completa" },
        { grade: 8, name: "Imperador Besta de 8º Grau", minPurity: 82, baseMaxExp: 48000, consciousness: "Vontade Soberana", form: "Transformação Humana / Divina Livre" },
        { grade: 9, name: "Monstro Soberano de 9º Grau (Besta Divina)", minPurity: 92, baseMaxExp: 120000, consciousness: "Onisciência Primordial", form: "Corpo Imortal Soberano" }
    ];

    const BODY_REALMS = [
        { name: "Carne Comum", stages: 1, baseMaxExp: 100 },
        { name: "Pele de Ferro Temperado", stages: 3, baseMaxExp: 180 },
        { name: "Tendões & Músculos de Bronze", stages: 3, baseMaxExp: 520 },
        { name: "Ossos de Jade Imaculado", stages: 3, baseMaxExp: 1600 },
        { name: "Medula Dourada Sagrada", stages: 3, baseMaxExp: 6000 },
        { name: "Corpo Indestrutível Primordial", stages: 3, baseMaxExp: 24000 }
    ];

    const SOUL_REALMS = [
        { name: "Consciência Mortal", stages: 1, baseMaxExp: 100 },
        { name: "Visão Espiritual Desperta", stages: 3, baseMaxExp: 240 },
        { name: "Sentido Divino (Divine Sense)", stages: 4, baseMaxExp: 1100 },
        { name: "Projeção Astral da Alma", stages: 4, baseMaxExp: 4500 },
        { name: "Mar da Consciência Infinito", stages: 3, baseMaxExp: 18000 }
    ];

    // =========================================================================
    // 2. MOTOR CENTRAL: Game_CultivationSystem
    // =========================================================================

    class Game_CultivationSystem {
        constructor() {
            this.initData();
        }

        initData() {
            // Sorteio ponderado com alta presença de Humanos e grande variedade de Monstros + Exóticos
            const randomRace = RACES_DATA[Math.floor(Math.random() * RACES_DATA.length)];
            const randomBloodline = BLOODLINES_DATA[Math.floor(Math.random() * BLOODLINES_DATA.length)];
            const randomConstitution = CONSTITUTIONS_DATA[Math.floor(Math.random() * CONSTITUTIONS_DATA.length)];

            // Se a constituição tiver elementos favoritos, há chance maior de alinhar pelo menos um, ou ser totalmente aleatório e misterioso
            const elem1 = ELEMENTS_LIST[Math.floor(Math.random() * ELEMENTS_LIST.length)];
            let elem2 = ELEMENTS_LIST[Math.floor(Math.random() * ELEMENTS_LIST.length)];
            while (elem2 === elem1) {
                elem2 = ELEMENTS_LIST[Math.floor(Math.random() * ELEMENTS_LIST.length)];
            }

            const purity = Math.floor(18 + Math.random() * 78); // 18% a 95%

            this.physiology = {
                raceId: randomRace.id,
                anatomyId: randomRace.anatomyId,
                bloodlineId: randomBloodline.id,
                bloodlinePurity: purity,
                inheritedLegacies: [], // Humanos podem adquirir heranças extras!
                constitutionId: randomConstitution.id,
                primaryElement: elem1,
                secondaryElement: elem2,
                inHumanForm: randomRace.category !== "monster", // Monstros desbloqueiam forma humana no 7º Grau!

                // Tudo exceto os Status numéricos começa com "???"
                revealed: {
                    race: false,
                    anatomy: false,
                    family: false,
                    bloodline: false,
                    bloodlinePurity: false,
                    constitution: false,
                    elements: false
                }
            };

            this.cultivation = {
                // Qi ou Grau Bestial
                qiRealmIndex: 1,
                qiStage: 1,
                qiExp: 0,
                qiMaxExp: randomRace.category === "monster" ? MONSTER_GRADES[0].baseMaxExp : QI_REALMS_STANDARD[1].baseMaxExp,
                qiBottleneck: false,
                bloodlineBottleneck: false,

                // Corpo
                bodyRealmIndex: 1,
                bodyStage: 1,
                bodyExp: 0,
                bodyMaxExp: BODY_REALMS[1].baseMaxExp,
                bodyBottleneck: false,

                // Alma
                soulRealmIndex: 1,
                soulStage: 1,
                soulExp: 0,
                soulMaxExp: SOUL_REALMS[1].baseMaxExp,
                soulBottleneck: false,

                // Reservatório de Qi & Estabilidade / Desvio de Qi
                currentQi: 120,
                maxQi: 120,
                deviationPoints: 0,     // 0 a 100
                qiDeviationLevel: 0,    // 0=Estável, 1=Leve, 2=Moderado, 3=Severo, 4=Catastrófico
                stabilizationBuffTimer: 0, // Pílula ou Arranjo ativo
                groundArrayActive: false,
                groundArrayTimer: 0
            };

            //Configuração ativa de cultivo
            this.activeTechniqueId = "basic_breath";
            this.cultivationFocus = "balanced"; // "balanced", "qi", "body", "soul"

            // Perícias estilo Skyrim (Aumentam pelo uso)
            this.skills = {
                meditation: { level: 1, exp: 0, maxExp: 100, name: "Meditação & Circulação", desc: "Aumenta absorção de Qi, Dantian máximo e reduz Desvio de Qi." },
                bodyTempering: { level: 1, exp: 0, maxExp: 100, name: "Têmpera Corporal", desc: "Evolui ao receber dano e treinar o físico; nutre o Reino Corporal." },
                soulPerception: { level: 1, exp: 0, maxExp: 100, name: "Sentido Espiritual", desc: "Permite autodescobrir fisiologia oculta (???) e achar recursos no mapa." },
                alchemy: { level: 1, exp: 0, maxExp: 100, name: "Alquimia Espiritual", desc: "Refina ervas em Pílulas de Qi, Calmaria de Meridianos e Sangue." },
                smithing: { level: 1, exp: 0, maxExp: 100, name: "Forja de Artefatos", desc: "Refina minérios espirituais em armas e relíquias protetoras." },
                arrays: { level: 1, exp: 0, maxExp: 100, name: "Mestria de Arranjos", desc: "Cria formações no chão que dobram a densidade de Qi e evitam desvios." }
            };

            // Materiais Espirituais & Pílulas no Bolso Espiritual
            this.materials = {
                spiritHerbs: 3,
                spiritOres: 2,
                arrayStones: 2,
                beastCores: 1,
                testingStones: 1, // Pedra de Teste inicial para o jogador experimentar
                qiPills: 2,
                calmingPills: 1
            };

            // Quests de Descoberta e Exploração
            this.quests = [
                { id: "q_appearance", title: "Quem Sou Eu? (O Reflexo)", desc: "Observe sua própria aparência/reflexo na aba Fisiologia para descobrir sua Raça.", completed: false },
                { id: "q_family", title: "Ecos do Sangue e Clã", desc: "Investigue as memórias e reputação de sua Família para descobrir se há uma Linhagem famosa.", completed: false },
                { id: "q_meridians", title: "Segredos dos Meridianos", desc: "Medite (Tecla C) ou use uma Pedra de Teste / Sentido Espiritual para revelar sua Constituição e Elementos.", completed: false },
                { id: "q_breakthrough", title: "O Primeiro Rompimento", desc: "Acumule Qi no mapa (caminhando ou meditando na hora/bioma certos) e rompa seu primeiro nível.", completed: false }
            ];

            // Registro de Relacionamentos / Clã / Mestres
            this.relationships = [
                {
                    name: "Ancião Guardião do Vilarejo",
                    role: "Mestre Espiritual Errante",
                    affinity: 25,
                    note: "Pode diagnosticar seus meridianos ocultos ou ensinar sobre o Desvio de Qi."
                },
                {
                    name: "Patriarca / Matriarca de Origem",
                    role: "Parente de Sangue",
                    affinity: 60,
                    note: "Compartilha os traços físicos da sua Raça e a reputação do seu Clã."
                }
            ];

            this.isMeditating = false;
            this.meditationSeconds = 0;
            this._lowQiWarned = false;
            this._symptomCooldown = 0;
        }

        // Garante que campos novos existam mesmo ao carregar um save antigo criado em versões anteriores
        ensureFields() {
            if (!this.physiology) this.physiology = {};
            if (!this.physiology.revealed) {
                this.physiology.revealed = {
                    race: false,
                    anatomy: false,
                    family: false,
                    bloodline: false,
                    bloodlinePurity: false,
                    constitution: false,
                    elements: false
                };
            }
            if (this.physiology.inHumanForm === undefined) {
                this.physiology.inHumanForm = this.getRace().category !== "monster";
            }
            if (!this.physiology.inheritedLegacies) {
                this.physiology.inheritedLegacies = [];
            }
            if (!this.cultivation) this.cultivation = {};
            if (this.cultivation.currentQi === undefined) this.cultivation.currentQi = 120;
            if (this.cultivation.maxQi === undefined) this.cultivation.maxQi = 120;
            if (this.cultivation.deviationPoints === undefined) this.cultivation.deviationPoints = 0;
            if (this.cultivation.qiDeviationLevel === undefined) this.cultivation.qiDeviationLevel = 0;
            if (this.cultivation.qiRealmIndex === undefined) this.cultivation.qiRealmIndex = 1;
            if (this.cultivation.qiStage === undefined) this.cultivation.qiStage = 1;
            if (this.cultivation.bodyRealmIndex === undefined) this.cultivation.bodyRealmIndex = 1;
            if (this.cultivation.soulRealmIndex === undefined) this.cultivation.soulRealmIndex = 1;

            if (!this.skills) this.skills = {};
            const defSkills = {
                meditation: { level: 1, exp: 0, maxExp: 100, name: "Meditação & Circulação", desc: "Aumenta absorção de Qi, Dantian máximo e reduz Desvio de Qi." },
                bodyTempering: { level: 1, exp: 0, maxExp: 100, name: "Têmpera Corporal", desc: "Evolui ao receber dano e treinar o físico; nutre o Reino Corporal." },
                soulPerception: { level: 1, exp: 0, maxExp: 100, name: "Sentido Espiritual", desc: "Permite autodescobrir fisiologia oculta (???) e achar recursos no mapa." },
                alchemy: { level: 1, exp: 0, maxExp: 100, name: "Alquimia Espiritual", desc: "Refina ervas em Pílulas de Qi, Calmaria de Meridianos e Sangue." },
                smithing: { level: 1, exp: 0, maxExp: 100, name: "Forja de Artefatos", desc: "Refina minérios espirituais em armas e relíquias protetoras." },
                arrays: { level: 1, exp: 0, maxExp: 100, name: "Mestria de Arranjos", desc: "Cria formações no chão que dobram a densidade de Qi e evitam desvios." }
            };
            for (const k in defSkills) {
                if (!this.skills[k]) this.skills[k] = defSkills[k];
            }

            if (!this.materials) {
                this.materials = {
                    spiritHerbs: 3,
                    spiritOres: 2,
                    arrayStones: 2,
                    beastCores: 1,
                    testingStones: 1,
                    qiPills: 2,
                    calmingPills: 1
                };
            }

            if (!this.quests) {
                this.quests = [
                    { id: "q_appearance", title: "Quem Sou Eu? (O Reflexo)", desc: "Observe sua própria aparência/reflexo na aba Fisiologia para descobrir sua Raça.", completed: false },
                    { id: "q_family", title: "Ecos do Sangue e Clã", desc: "Investigue as memórias e reputação de sua Família para descobrir se há uma Linhagem famosa.", completed: false },
                    { id: "q_meridians", title: "Segredos dos Meridianos", desc: "Medite (Tecla C) ou use uma Pedra de Teste / Sentido Espiritual para revelar sua Constituição e Elementos.", completed: false },
                    { id: "q_breakthrough", title: "O Primeiro Rompimento", desc: "Acumule Qi no mapa (caminhando ou meditando na hora/bioma certos) e rompa seu primeiro nível.", completed: false }
                ];
            }

            if (!this.relationships) {
                this.relationships = [
                    {
                        name: "Ancião Guardião do Vilarejo",
                        role: "Mestre Espiritual Errante",
                        affinity: 25,
                        note: "Pode diagnosticar seus meridianos ocultos ou ensinar sobre o Desvio de Qi."
                    },
                    {
                        name: "Patriarca / Matriarca de Origem",
                        role: "Parente de Sangue",
                        affinity: 60,
                        note: "Compartilha os traços físicos da sua Raça e a reputação do seu Clã."
                    }
                ];
            }

            if (!this.activeTechniqueId) this.activeTechniqueId = "basic_breath";
            if (!this.cultivationFocus) this.cultivationFocus = "balanced";
        }

        // --- Getters de Dados ---
        getRace() {
            return RACES_DATA.find(r => r.id === this.physiology.raceId) || RACES_DATA[0];
        }

        getAnatomy() {
            return MERIDIAN_ANATOMIES[this.physiology.anatomyId] || MERIDIAN_ANATOMIES["human_12_meridians"];
        }

        getBloodline() {
            return BLOODLINES_DATA.find(b => b.id === this.physiology.bloodlineId) || BLOODLINES_DATA[0];
        }

        getConstitution() {
            return CONSTITUTIONS_DATA.find(c => c.id === this.physiology.constitutionId) || CONSTITUTIONS_DATA[0];
        }

        getActiveTechnique() {
            return CULTIVATION_TECHNIQUES.find(t => t.id === this.activeTechniqueId) || CULTIVATION_TECHNIQUES[0];
        }

        isMonster() {
            return this.getRace().category === "monster";
        }

        isHuman() {
            return this.getRace().id === "human";
        }

        // Aplica o sprite correspondente à raça (ou forma humana se for fera de 7º+ Grau)
        applyRaceAppearanceToActor() {
            const actor = $gameParty ? $gameParty.leader() : null;
            if (!actor) return;
            const race = this.getRace();
            if (this.isMonster() && this.physiology.inHumanForm && race.humanFormSprite) {
                actor.setCharacterImage(race.humanFormSprite.name, race.humanFormSprite.index);
            } else {
                actor.setCharacterImage(race.spriteName, race.spriteIndex);
            }
            if ($gamePlayer) {
                $gamePlayer.refresh();
            }
        }

        // --- Sistema de Descoberta Progressiva (??? -> Revelado) ---
        reveal(trait, customReason = "") {
            if (trait === "all") {
                Object.keys(this.physiology.revealed).forEach(k => {
                    this.physiology.revealed[k] = true;
                });
                this.completeQuest("q_appearance");
                this.completeQuest("q_family");
                this.completeQuest("q_meridians");
                this.addToast("✨ Epifania Ontológica! Todos os segredos do seu corpo foram revelados!", "#ffd700");
                if ($gameParty && $gameParty.leader()) $gameParty.leader().refresh();
                return;
            }

            if (this.physiology.revealed[trait] !== undefined && !this.physiology.revealed[trait]) {
                this.physiology.revealed[trait] = true;
                const info = this.getTraitDisplayName(trait);
                const prefix = customReason ? `${customReason}: ` : "Descoberta: ";
                this.addToast(`🔮 ${prefix}[${info}]`, "#81ecec");
                SoundManager.playRecovery();

                if (trait === "race") this.completeQuest("q_appearance");
                if (trait === "family" || trait === "bloodline") this.completeQuest("q_family");
                if (trait === "constitution" || trait === "elements") this.completeQuest("q_meridians");

                // Descobrir um mistério do próprio ser concede XP de Sentido Espiritual e chance de Epifania!
                this.addSkillExp("soulPerception", 35);
            }
        }

        getTraitDisplayName(trait) {
            switch (trait) {
                case "race": return `Raça: ${this.getRace().name}`;
                case "anatomy": return `Anatomia: ${this.getAnatomy().name}`;
                case "family": return `Clã: ${this.getBloodline().clanName}`;
                case "bloodline": return `Linhagem: ${this.getBloodline().name}`;
                case "bloodlinePurity": return `Pureza Sanguínea: ${this.physiology.bloodlinePurity}%`;
                case "constitution": return `Constituição: ${this.getConstitution().name}`;
                case "elements": return `Afinidades: ${ELEMENT_NAMES[this.physiology.primaryElement]} & ${ELEMENT_NAMES[this.physiology.secondaryElement]}`;
                default: return trait;
            }
        }

        // Métodos práticos de Autodescoberta usados pelo Jogador
        inspectOwnAppearance() {
            const race = this.getRace();
            this.addToast(`👁️ ${race.appearanceClue}`, "#dfe6e9");
            this.reveal("race", "Ao observar sua própria aparência");
            this.addSkillExp("soulPerception", 15);
        }

        investigateFamilyAndClan() {
            const race = this.getRace();
            const blood = this.getBloodline();
            this.addToast(`🏠 ${race.parentAppearanceClue}`, "#dfe6e9");
            this.reveal("race", "Pelos traços dos seus parentes");
            this.reveal("family", "Memórias de Origem");

            if (blood.reputationRevealsBloodline) {
                this.addToast(`📜 Rumor do Clã: ${blood.clanReputation}`, "#ffeaa7");
                this.reveal("bloodline", "Pela reputação da sua família");
            }
            this.addSkillExp("soulPerception", 15);
        }

        probeInternalMeridians() {
            const spLevel = this.skills.soulPerception.level;
            const constData = this.getConstitution();
            this.reveal("anatomy", "Ao sondar seus canais internos");
            this.addToast(`🧘 ${constData.symptomClue}`, "#a29bfe");

            if (spLevel >= 2 || this.meditationSeconds >= 10) {
                this.reveal("constitution", "Diagnóstico de Meridianos");
            } else {
                this.addToast("💡 Dica: Medite mais ou suba Sentido Espiritual para confirmar sua Constituição.", "#fab1a0");
            }
            this.addSkillExp("soulPerception", 25);
        }

        useTestingStone() {
            if (this.materials.testingStones <= 0) {
                this.addToast("⚠️ Você não possui Pedras de Teste Espiritual no inventário.", "#ff7675");
                return false;
            }
            this.materials.testingStones -= 1;
            this.reveal("elements", "Pedra de Teste Espiritual");
            this.reveal("bloodlinePurity", "Ressonância da Pedra de Teste");
            this.reveal("constitution", "Reflexo da Pedra de Teste");
            return true;
        }

        // --- Heranças Sanguíneas (Vantagem "Roubada" dos Humanos) ---
        absorbHeritage(bloodlineId) {
            const targetBlood = BLOODLINES_DATA.find(b => b.id === bloodlineId);
            if (!targetBlood) return false;

            if (this.isHuman()) {
                this.physiology.bloodlineId = targetBlood.id;
                this.physiology.bloodlinePurity = Math.min(100, Math.max(this.physiology.bloodlinePurity, 75));
                if (!this.physiology.inheritedLegacies.includes(targetBlood.name)) {
                    this.physiology.inheritedLegacies.push(targetBlood.name);
                }
                this.reveal("bloodline", "Herança Ancestral Assimilada");
                this.reveal("bloodlinePurity", "Sangue Refinado pela Herança");
                this.addToast(`👑 [VANTAGEM HUMANA] Você assimilou a Herança: ${targetBlood.name}!`, "#ffd700");
                SoundManager.playRecovery();
                if ($gameParty.leader()) $gameParty.leader().refresh();
                return true;
            } else {
                // Outras raças apenas refinam um pouco a própria pureza ao absorver um legado
                this.physiology.bloodlinePurity = Math.min(100, this.physiology.bloodlinePurity + 12);
                this.cultivation.bloodlineBottleneck = false;
                this.addToast(`🩸 Sua fisiologia não-humana absorveu a essência para purificar seu sangue (+12% Pureza)!`, "#ff7675");
                return true;
            }
        }

        // --- Cálculo de Compatibilidade Fisiológica e Desvio de Qi ---
        evaluateTechniqueCompatibility(tech = this.getActiveTechnique()) {
            const race = this.getRace();
            const constitution = this.getConstitution();
            const bloodline = this.getBloodline();

            // Verifica se possui contorno universal (Técnica de Harmonização, Físico do Caos, Sangue Imperial ou Pílula/Arranjo)
            const hasBypass = tech.bypassConflict ||
                constitution.bypassConflict ||
                bloodline.bypassConflict ||
                this.cultivation.stabilizationBuffTimer > 0 ||
                this.cultivation.groundArrayActive;

            let conflictScore = 0;
            const reasons = [];

            // 1. Checagem de Anatomia de Meridianos
            if (tech.requiredAnatomy === "beast_or_asura") {
                if (race.anatomyId !== "beast_core" && race.anatomyId !== "asura_blood_vessels") {
                    conflictScore += 3;
                    reasons.push("Anatomia sem Núcleo Bestial/Vasos Asura");
                } else {
                    conflictScore -= 1;
                }
            } else if (tech.requiredAnatomy === "human_or_beast") {
                if (race.anatomyId === "crystalline_veins" || race.anatomyId === "undead_yin_channels") {
                    conflictScore += 2;
                    reasons.push("Canais rígidos para esta circulação");
                }
            }

            // 2. Checagem de Constituição Corporal
            if (tech.element !== "neutral" && tech.element !== "chaos") {
                if (constitution.forbiddenElements.includes(tech.element)) {
                    conflictScore += 3;
                    reasons.push(`Conflito direto com sua Constituição (${constitution.name})`);
                }
                if (constitution.favoredElements.includes(tech.element) || constitution.favoredElements.includes("all")) {
                    conflictScore -= 2;
                }
            }

            // 3. Checagem de Raça
            if (tech.element !== "neutral" && tech.element !== "chaos") {
                if (race.conflictingElements && race.conflictingElements.includes(tech.element)) {
                    conflictScore += 2;
                    reasons.push(`Elemento rejeitado pela sua fisiologia racial`);
                }
                if (race.favoredElements && (race.favoredElements.includes(tech.element) || race.favoredElements.includes("all"))) {
                    conflictScore -= 1;
                }
            }

            // 4. Checagem de Afinidade Elemental Inata
            if (tech.element === this.physiology.primaryElement || tech.element === this.physiology.secondaryElement) {
                conflictScore -= 2;
            } else if (OPPOSITE_ELEMENTS[tech.element] === this.physiology.primaryElement) {
                conflictScore += 2;
                reasons.push(`Oposto à sua Afinidade Elemental Primordial`);
            }

            // Se tiver meio de contorno ativo, neutraliza o conflito!
            if (hasBypass && conflictScore > 0) {
                conflictScore = 0;
                reasons.push("Conflito neutralizado por Harmonização / Constituição / Arranjo!");
            }

            // Redução pelo nível de Meditação
            if (conflictScore > 0 && this.skills.meditation.level >= 5) {
                conflictScore = Math.max(0, conflictScore - Math.floor(this.skills.meditation.level / 5));
            }

            let statusLabel = "Fluxo Neutro Estável";
            let efficiency = 1.0;
            let riskLevel = 0;

            if (conflictScore <= -2) {
                statusLabel = "Harmonia Perfeita (Ressonância Divina)";
                efficiency = 1.65;
                riskLevel = 0;
            } else if (conflictScore === -1) {
                statusLabel = "Boa Afinidade";
                efficiency = 1.25;
                riskLevel = 0;
            } else if (conflictScore === 0) {
                statusLabel = "Estável (Sem Conflito)";
                efficiency = 1.0;
                riskLevel = 0;
            } else if (conflictScore <= 2) {
                statusLabel = "Atrito Leve (Risco de Desvio Leve)";
                efficiency = 0.70;
                riskLevel = 1;
            } else if (conflictScore <= 4) {
                statusLabel = "Incompatível (Risco de Desvio Moderado)";
                efficiency = 0.40;
                riskLevel = 2;
            } else {
                statusLabel = "Colisão Fisiológica! (Desvio Severo / Catastrófico)";
                efficiency = 0.15;
                riskLevel = 3;
            }

            return {
                conflictScore,
                statusLabel,
                efficiency,
                riskLevel,
                reasons
            };
        }

        // Processa Sintomas e Desvio de Qi durante o cultivo
        processCompatibilityEffects(isActiveMeditation) {
            const tech = this.getActiveTechnique();
            const compat = this.evaluateTechniqueCompatibility(tech);

            // Se a técnica for o Método Bestial e for compatível, purifica gradualmente o sangue!
            if (tech.id === "primal_beast_blood" && compat.riskLevel === 0 && isActiveMeditation) {
                if (Math.random() < 0.01 && this.physiology.bloodlinePurity < 100) {
                    this.physiology.bloodlinePurity = Math.min(100, this.physiology.bloodlinePurity + 1);
                    this.cultivation.bloodlineBottleneck = false;
                    this.addToast(`🩸 Seu sangue ancestral ferve e se torna mais puro (${this.physiology.bloodlinePurity}%)!`, "#ff7675");
                }
            }

            if (compat.riskLevel === 0) {
                // Reduz pontos de desvio lentamente se estiver cultivando em harmonia
                if (this.cultivation.deviationPoints > 0) {
                    this.cultivation.deviationPoints = Math.max(0, this.cultivation.deviationPoints - (isActiveMeditation ? 0.15 : 0.03));
                    this.updateDeviationTier();
                }
                return compat.efficiency;
            }

            // Há conflito fisiológico!
            const rate = isActiveMeditation ? (compat.riskLevel * 0.12) : (compat.riskLevel * 0.02);
            this.cultivation.deviationPoints = Math.min(100, this.cultivation.deviationPoints + rate);
            this.updateDeviationTier();

            if (this._symptomCooldown > 0) {
                this._symptomCooldown--;
            } else if (isActiveMeditation) {
                this._symptomCooldown = 240; // A cada 4 segundos em meditação conflitante
                this.emitSymptomClue(tech, compat);
            }

            return compat.efficiency;
        }

        updateDeviationTier() {
            const pts = this.cultivation.deviationPoints;
            const prevTier = this.cultivation.qiDeviationLevel;

            if (pts < 15) this.cultivation.qiDeviationLevel = 0;
            else if (pts < 40) this.cultivation.qiDeviationLevel = 1;
            else if (pts < 70) this.cultivation.qiDeviationLevel = 2;
            else if (pts < 92) this.cultivation.qiDeviationLevel = 3;
            else this.cultivation.qiDeviationLevel = 4;

            if (this.cultivation.qiDeviationLevel > prevTier) {
                if (this.cultivation.qiDeviationLevel === 1) {
                    this.addToast("⚠️ [Desvio de Qi Leve] Seus meridianos formigam em rejeição à técnica atual!", "#ffeaa7");
                } else if (this.cultivation.qiDeviationLevel === 2) {
                    this.addToast("⚠️ [Desvio Moderado] Qi turbulento! Você tosse sangue espiritual!", "#fab1a0");
                    this.applyDeviationDamage(0.05);
                } else if (this.cultivation.qiDeviationLevel === 3) {
                    this.addToast("🚨 [Desvio Severo] Fissura nos meridianos e alucinações no Mar da Consciência!", "#ff7675");
                    this.applyDeviationDamage(0.15);
                    if ($gameScreen) $gameScreen.startShake(4, 4, 25);
                } else if (this.cultivation.qiDeviationLevel === 4) {
                    this.triggerCatastrophicDeviation();
                }
            }
        }

        emitSymptomClue(tech, compat) {
            const constData = this.getConstitution();
            this.addToast(`❗ Sintoma: ${constData.symptomClue}`, "#fdcb6e");

            // Ao sentir os sintomas na pele repetidamente, o jogador acaba descobrindo sua Constituição ou Elemento!
            if (!this.physiology.revealed.constitution && Math.random() < 0.45) {
                this.reveal("constitution", "Pelos sintomas de rejeição nos meridianos");
            } else if (!this.physiology.revealed.elements && Math.random() < 0.45) {
                this.reveal("elements", "Pelo choque elemental no Dantian");
            }
        }

        applyDeviationDamage(hpPercent) {
            const leader = $gameParty ? $gameParty.leader() : null;
            if (!leader) return;
            const dmg = Math.max(1, Math.floor(leader.mhp * hpPercent));
            leader.gainHp(-dmg);
            if (leader.hp <= 0) {
                leader.setHp(1); // Sobrevive por um fio com meridianos feridos
            }
        }

        triggerCatastrophicDeviation() {
            this.isMeditating = false;
            this.cultivation.deviationPoints = 50;
            this.cultivation.qiDeviationLevel = 2;
            this.cultivation.qiExp = Math.floor(this.cultivation.qiExp * 0.5);
            this.cultivation.currentQi = 5;
            this.applyDeviationDamage(0.40);
            if ($gameScreen) {
                $gameScreen.startFlash([255, 40, 40, 220], 45);
                $gameScreen.startShake(7, 7, 45);
            }
            SoundManager.playEnemyCollapse();
            this.addToast("💥 [DESVIO CATASTRÓFICO] Explosão interna no Dantian! Cultivo regrediu! Troque de técnica ou use Harmonização!", "#ff4757");
        }

        // --- Perícias Estilo Skyrim ---
        addSkillExp(skillId, amount) {
            const skill = this.skills[skillId];
            if (!skill) return;

            let mult = 1.0;
            if (this.physiology.bloodlineId === "mortal_blood") mult += 0.15;
            if (this.isHuman() && (skillId === "alchemy" || skillId === "smithing" || skillId === "arrays")) {
                mult *= 1.5; // Aptidão humana suprema para as 3 artes
            }

            skill.exp += amount * mult;
            while (skill.exp >= skill.maxExp) {
                skill.exp -= skill.maxExp;
                skill.level += 1;
                skill.maxExp = Math.floor(skill.maxExp * 1.25);
                this.onSkillLevelUp(skillId, skill);
            }
        }

        onSkillLevelUp(skillId, skill) {
            this.addToast(`⬆️ Habilidade [${skill.name}] subiu para o Nível ${skill.level}!`, "#55efc4");
            SoundManager.playRecovery();

            if (skillId === "bodyTempering") {
                this.addBodyExp(skill.level * 25);
            } else if (skillId === "meditation") {
                this.cultivation.maxQi += 15;
                this.cultivation.currentQi = Math.min(this.cultivation.maxQi, this.cultivation.currentQi + 15);
            } else if (skillId === "soulPerception") {
                this.addSoulExp(skill.level * 25);
                // Aos níveis 3, 5, 7, o Sentido Espiritual desvenda automaticamente traços ocultos!
                if (skill.level === 2 && !this.physiology.revealed.anatomy) this.reveal("anatomy", "Sentido Espiritual Nv.2");
                if (skill.level === 3 && !this.physiology.revealed.constitution) this.reveal("constitution", "Sentido Espiritual Nv.3");
                if (skill.level === 4 && !this.physiology.revealed.elements) this.reveal("elements", "Sentido Espiritual Nv.4");
                if (skill.level === 5 && !this.physiology.revealed.bloodlinePurity) this.reveal("bloodlinePurity", "Sentido Espiritual Nv.5");
            }

            // A cada 5 níveis de qualquer perícia, há chance de desencadear uma Epifania Súbita!
            if (skill.level % 5 === 0) {
                this.triggerEpiphany("qi", `Ao atingir o Nível ${skill.level} em ${skill.name}, você compreendeu uma lei do Dao!`);
            }

            if ($gameParty && $gameParty.leader()) {
                $gameParty.leader().refresh();
            }
        }

        // --- Adição de Exp nas 3 Trilhas (Qi/Grau Bestial, Corpo, Alma) ---
        addQiExp(amount) {
            if (this.cultivation.qiBottleneck || this.cultivation.bloodlineBottleneck) return;
            const race = this.getRace();
            const blood = this.getBloodline();
            const purityFactor = 0.7 + (this.physiology.bloodlinePurity / 100) * 0.6 * blood.purityMultiplier;

            this.cultivation.qiExp += amount * race.baseQiAffinity * purityFactor;
            if (this.cultivation.qiExp >= this.cultivation.qiMaxExp) {
                this.cultivation.qiExp = this.cultivation.qiMaxExp;
                this.cultivation.qiBottleneck = true;
                this.addToast("⚡ Gargalo Atingido! Seu Dantian/Núcleo está cheio e pronto para romper!", "#ffeaa7");
            }
        }

        addBodyExp(amount) {
            if (this.cultivation.bodyBottleneck) return;
            const race = this.getRace();
            this.cultivation.bodyExp += amount * race.baseBodyAffinity;
            if (this.cultivation.bodyExp >= this.cultivation.bodyMaxExp) {
                this.cultivation.bodyExp = this.cultivation.bodyMaxExp;
                this.cultivation.bodyBottleneck = true;
                this.addToast("💪 Limite Físico Atingido! Seu corpo está pronto para romper de estágio!", "#fab1a0");
            }
        }

        addSoulExp(amount) {
            if (this.cultivation.soulBottleneck) return;
            const race = this.getRace();
            this.cultivation.soulExp += amount * race.baseSoulAffinity;
            if (this.cultivation.soulExp >= this.cultivation.soulMaxExp) {
                this.cultivation.soulExp = this.cultivation.soulMaxExp;
                this.cultivation.soulBottleneck = true;
                this.addToast("👁️ Mar da Consciência Pleno! Sua Alma pode avançar de reino!", "#74b9ff");
            }
        }

        // --- Avanço de Reinos & Evolução de Monstros (1º ao 9º Grau) ---
        attemptBreakthrough(track = "qi") {
            if (track === "qi") {
                if (this.isMonster()) {
                    return this.attemptMonsterGradeBreakthrough();
                } else {
                    return this.attemptStandardQiBreakthrough();
                }
            } else if (track === "body") {
                if (!this.cultivation.bodyBottleneck) return false;
                if (this.cultivation.bodyRealmIndex < BODY_REALMS.length - 1) {
                    this.cultivation.bodyRealmIndex += 1;
                    const nextB = BODY_REALMS[this.cultivation.bodyRealmIndex];
                    this.cultivation.bodyExp = 0;
                    this.cultivation.bodyMaxExp = nextB.baseMaxExp;
                    this.cultivation.bodyBottleneck = false;
                    this.addToast(`🛡️ Rompimento Corporal! Você alcançou [${nextB.name}]!`, "#fab1a0");
                    SoundManager.playRecovery();
                    if ($gameParty.leader()) $gameParty.leader().refresh();
                    this.completeQuest("q_breakthrough");
                    return true;
                }
            } else if (track === "soul") {
                if (!this.cultivation.soulBottleneck) return false;
                if (this.cultivation.soulRealmIndex < SOUL_REALMS.length - 1) {
                    this.cultivation.soulRealmIndex += 1;
                    const nextS = SOUL_REALMS[this.cultivation.soulRealmIndex];
                    this.cultivation.soulExp = 0;
                    this.cultivation.soulMaxExp = nextS.baseMaxExp;
                    this.cultivation.soulBottleneck = false;
                    this.addToast(`👁️ Evolução Anímica! Sua alma ascendeu para [${nextS.name}]!`, "#74b9ff");
                    SoundManager.playRecovery();
                    if ($gameParty.leader()) $gameParty.leader().refresh();
                    this.completeQuest("q_breakthrough");
                    return true;
                }
            }
            return false;
        }

        attemptMonsterGradeBreakthrough() {
            if (!this.cultivation.qiBottleneck) return false;
            const currentGradeIdx = this.cultivation.qiRealmIndex - 1; // 0 a 8 (1º ao 9º Grau)
            if (currentGradeIdx >= MONSTER_GRADES.length - 1) return false;

            const nextGradeData = MONSTER_GRADES[currentGradeIdx + 1];

            // Verifica se a Pureza da Linhagem permite subir para este Grau!
            if (this.physiology.bloodlinePurity < nextGradeData.minPurity) {
                this.cultivation.bloodlineBottleneck = true;
                this.reveal("bloodlinePurity", "Limite Sanguíneo Bestial");
                this.addToast(`🩸 Gargalo de Linhagem! O ${nextGradeData.grade}º Grau exige ${nextGradeData.minPurity}% de Pureza (Atual: ${this.physiology.bloodlinePurity}%). Purifique seu sangue!`, "#ff7675");
                SoundManager.playBuzzer();
                return false;
            }

            this.cultivation.qiRealmIndex += 1;
            this.cultivation.qiExp = 0;
            this.cultivation.qiMaxExp = nextGradeData.baseMaxExp;
            this.cultivation.qiBottleneck = false;
            this.cultivation.bloodlineBottleneck = false;
            this.cultivation.maxQi += 90;
            this.cultivation.currentQi = this.cultivation.maxQi;

            this.addToast(`🐉 EVOLUÇÃO BESTIAL! Você atingiu: ${nextGradeData.name}!`, "#ffd700");

            // Marcos de Consciência (4º Grau) e Transformação Humana (7º Grau)
            if (nextGradeData.grade === 4) {
                this.addToast("🧠 [DESPERTAR SAPIENS] Sua mente bestial se abriu para a consciência plena e fala espiritual!", "#55efc4");
            } else if (nextGradeData.grade === 6) {
                this.addToast("🐾 [FORMA HÍBRIDA] Você já consegue assumir postura humanoide parcial!", "#81ecec");
            } else if (nextGradeData.grade === 7) {
                this.physiology.inHumanForm = true;
                this.applyRaceAppearanceToActor();
                this.addToast("✨ [TRANSFORMAÇÃO HUMANA] Seus ossos se remodelam sob raios celestes! Você conquistou a Forma Humana Completa!", "#fdcb6e");
            }

            if ($gameScreen) {
                $gameScreen.startFlash([255, 220, 120, 200], 45);
                $gameScreen.startShake(5, 5, 30);
            }
            SoundManager.playBattleStart();
            if ($gameParty.leader()) $gameParty.leader().refresh();
            this.completeQuest("q_breakthrough");
            return true;
        }

        attemptStandardQiBreakthrough() {
            if (!this.cultivation.qiBottleneck) return false;
            const realm = QI_REALMS_STANDARD[this.cultivation.qiRealmIndex] || QI_REALMS_STANDARD[1];

            if (this.cultivation.qiStage < realm.stages) {
                this.cultivation.qiStage += 1;
                this.cultivation.qiExp = 0;
                this.cultivation.qiMaxExp = Math.floor(realm.baseMaxExp * (1 + this.cultivation.qiStage * 0.35));
                this.cultivation.qiBottleneck = false;
                this.cultivation.maxQi += 30;
                this.cultivation.currentQi = this.cultivation.maxQi;
                this.addToast(`🌟 Avanço! Você rompeu para a ${this.cultivation.qiStage}ª Camada de ${realm.name}!`, "#ffd700");
                SoundManager.playRecovery();
                if ($gameScreen) $gameScreen.startFlash([255, 235, 160, 160], 25);
                if ($gameParty.leader()) $gameParty.leader().refresh();
                this.completeQuest("q_breakthrough");
                return true;
            } else if (this.cultivation.qiRealmIndex < QI_REALMS_STANDARD.length - 1) {
                this.cultivation.qiRealmIndex += 1;
                this.cultivation.qiStage = 1;
                const nextR = QI_REALMS_STANDARD[this.cultivation.qiRealmIndex];
                this.cultivation.qiExp = 0;
                this.cultivation.qiMaxExp = nextR.baseMaxExp;
                this.cultivation.qiBottleneck = false;
                this.cultivation.maxQi += 120;
                this.cultivation.currentQi = this.cultivation.maxQi;
                this.addToast(`👑 GRANDE ROMPIMENTO! Você ascendeu ao Reino [${nextR.name}]!`, "#ff7675");
                SoundManager.playBattleStart();
                if ($gameScreen) {
                    $gameScreen.startFlash([255, 255, 255, 230], 50);
                    $gameScreen.startShake(6, 6, 40);
                }
                if ($gameParty.leader()) $gameParty.leader().refresh();
                this.completeQuest("q_breakthrough");
                return true;
            }
            return false;
        }

        triggerEpiphany(track = "qi", message = "") {
            if (track === "qi") {
                this.cultivation.qiExp = this.cultivation.qiMaxExp;
                this.cultivation.qiBottleneck = true;
            } else if (track === "body") {
                this.cultivation.bodyExp = this.cultivation.bodyMaxExp;
                this.cultivation.bodyBottleneck = true;
            } else if (track === "soul") {
                this.cultivation.soulExp = this.cultivation.soulMaxExp;
                this.cultivation.soulBottleneck = true;
            }
            this.attemptBreakthrough(track);
            if (message) {
                this.addToast(`⚡ [EPIFANIA SÚBITA] ${message}`, "#fdcb6e");
            }
        }

        // --- Artes Auxiliares (Alquimia, Forja, Arranjos e Refino Sanguíneo) ---
        gatherWorldMaterials() {
            const env = this.getEnvironmentSummary();
            this.addSkillExp("soulPerception", 20);

            const roll = Math.random();
            if (roll < 0.35) {
                this.materials.spiritHerbs += 2;
                this.addToast(`🌿 Você sondou o bioma (${env.biomeLabel}) e colheu 2x Ervas Espirituais!`, "#55efc4");
            } else if (roll < 0.65) {
                this.materials.spiritOres += 2;
                this.addToast(`⛏️ Você extraiu 2x Minérios Espirituais da altitude ${env.height}m!`, "#74b9ff");
            } else if (roll < 0.88) {
                this.materials.arrayStones += 1;
                this.addToast(`💎 Você encontrou 1x Pedra de Matriz Espiritual!`, "#a29bfe");
            } else {
                this.materials.testingStones += 1;
                this.addToast(`🔮 Encontrou 1x Pedra de Teste Ancestral!`, "#ffd700");
            }
            SoundManager.playUseItem();
        }

        craftAlchemyPill(pillType = "qi") {
            if (this.materials.spiritHerbs < 2) {
                this.addToast("⚠️ Ervas Espirituais insuficientes (Exige 2x Ervas).", "#ff7675");
                return false;
            }
            this.materials.spiritHerbs -= 2;
            this.addSkillExp("alchemy", 45);

            if (pillType === "calming") {
                this.materials.calmingPills += 1;
                this.addToast("⚗️ [Alquimia] Você refinou 1x Pílula de Harmonização Yin-Yang (Cura Desvio de Qi)!", "#55efc4");
            } else {
                this.materials.qiPills += 1;
                this.addToast("⚗️ [Alquimia] Você refinou 1x Pílula de Condensação Espiritual!", "#55efc4");
            }
            SoundManager.playRecovery();
            return true;
        }

        consumePill(pillType = "qi") {
            if (pillType === "calming") {
                if (this.materials.calmingPills <= 0) {
                    this.addToast("⚠️ Você não possui Pílulas de Harmonização.", "#ff7675");
                    return false;
                }
                this.materials.calmingPills -= 1;
                this.cultivation.deviationPoints = 0;
                this.cultivation.qiDeviationLevel = 0;
                this.cultivation.stabilizationBuffTimer = 3600; // 60 segundos imune a conflito!
                this.addToast("💊 Seus meridianos se acalmam! Desvio de Qi zerado e 60s de Harmonização!", "#81ecec");
                SoundManager.playRecovery();
                return true;
            } else {
                if (this.materials.qiPills <= 0) {
                    this.addToast("⚠️ Você não possui Pílulas de Condensação de Qi.", "#ff7675");
                    return false;
                }
                this.materials.qiPills -= 1;
                const bonus = 80 + this.skills.alchemy.level * 25;
                this.cultivation.currentQi = this.cultivation.maxQi;
                this.addQiExp(bonus);
                this.addToast(`💊 Pílula absorvida! Qi restaurado e +${bonus} Exp de Cultivo!`, "#55efc4");
                SoundManager.playRecovery();
                return true;
            }
        }

        forgeSpiritArtifact() {
            if (this.materials.spiritOres < 2) {
                this.addToast("⚠️ Minérios Espirituais insuficientes (Exige 2x Minérios).", "#ff7675");
                return false;
            }
            this.materials.spiritOres -= 2;
            this.addSkillExp("smithing", 50);
            this.addBodyExp(45); // Martelar o metal espiritual também tempera o físico!
            this.addToast("🔨 [Forja Espiritual] Você temperou o metal com seu Qi! Forja e Corpo evoluíram!", "#fab1a0");
            SoundManager.playEquip();
            return true;
        }

        deployGroundArray() {
            if (this.materials.arrayStones < 1) {
                this.addToast("⚠️ Você precisa de pelo menos 1x Pedra de Matriz Espiritual.", "#ff7675");
                return false;
            }
            this.materials.arrayStones -= 1;
            this.cultivation.groundArrayActive = true;
            this.cultivation.groundArrayTimer = 3600; // 60 segundos
            this.addSkillExp("arrays", 55);
            this.addToast("☸️ [Arranjo Ativado] Matriz de Reunião de Qi erguida (+100% Qi e Proteção contra Desvio por 60s)!", "#a29bfe");
            SoundManager.playMagicEvasion();
            return true;
        }

        refineBeastCoreForPurity() {
            if (this.materials.beastCores < 1 && this.materials.spiritHerbs < 3) {
                this.addToast("⚠️ Exige 1x Núcleo Bestial (ou 3x Ervas Espirituais) para refinar a Linhagem.", "#ff7675");
                return false;
            }
            if (this.materials.beastCores >= 1) {
                this.materials.beastCores -= 1;
            } else {
                this.materials.spiritHerbs -= 3;
            }
            const gain = 6 + Math.floor(Math.random() * 6);
            this.physiology.bloodlinePurity = Math.min(100, this.physiology.bloodlinePurity + gain);
            this.cultivation.bloodlineBottleneck = false;
            this.reveal("bloodlinePurity", "Refino de Sangue Ancestral");
            this.addToast(`🩸 Seu sangue ancestral foi refinado! Pureza aumentou para ${this.physiology.bloodlinePurity}%!`, "#ff7675");
            SoundManager.playRecovery();
            return true;
        }

        completeQuest(questId) {
            const q = this.quests.find(x => x.id === questId);
            if (q && !q.completed) {
                q.completed = true;
                this.addToast(`📜 Quest Concluída: [${q.title}]!`, "#ffd700");
            }
        }

        // --- Atualização em Tempo Real no Mapa ---
        update() {
            if (!$gamePlayer || !$gameMap) return;

            if (this.cultivation.stabilizationBuffTimer > 0) {
                this.cultivation.stabilizationBuffTimer--;
            }
            if (this.cultivation.groundArrayTimer > 0) {
                this.cultivation.groundArrayTimer--;
                if (this.cultivation.groundArrayTimer <= 0) {
                    this.cultivation.groundArrayActive = false;
                    this.addToast("☸️ O Arranjo Espiritual no solo dissipou sua energia.", "#dfe6e9");
                }
            }

            const env = this.getEnvironmentSummary();
            const tech = this.getActiveTechnique();
            const compatEfficiency = this.processCompatibilityEffects(this.isMeditating);

            if (this.isMeditating) {
                const rawGain = (passiveQiPerSecond * meditationQiMultiplier * env.totalMultiplier * tech.speedMultiplier * compatEfficiency) / 60;
                this.distributeCultivationGain(rawGain, tech);
                this.addSkillExp("meditation", 0.06);

                // Recupera Qi durante a meditação (ou consome se estiver em Desvio Severo)
                if (this.cultivation.qiDeviationLevel >= 2) {
                    this.cultivation.currentQi = Math.max(0, this.cultivation.currentQi - 0.15);
                } else {
                    this.cultivation.currentQi = Math.min(this.cultivation.maxQi, this.cultivation.currentQi + rawGain * 0.9);
                }

                this.meditationSeconds += (1 / 60);

                // Pequena chance de Epifania Súbita se estiver meditando em Lua Cheia ou Alta Montanha em Harmonia
                if (env.totalMultiplier >= 1.8 && compatEfficiency >= 1.2 && Math.random() < 0.0004) {
                    this.triggerEpiphany("qi", "Em comunhão com o Céu e a Terra neste local auspicioso, você teve uma Epifania Súbita!");
                }
            } else if ($gamePlayer.isMoving()) {
                // Absorção passiva ao caminhar pelo mundo!
                const passiveGain = (passiveQiPerSecond * env.totalMultiplier * tech.speedMultiplier * compatEfficiency * 0.45) / 60;
                this.distributeCultivationGain(passiveGain, tech);

                // Se estiver caminhando com uma técnica muito pesada ou incompatível, gasta um pouco de Qi
                if (this.cultivation.qiDeviationLevel >= 1) {
                    this.cultivation.currentQi = Math.max(0, this.cultivation.currentQi - 0.04);
                } else {
                    this.cultivation.currentQi = Math.min(this.cultivation.maxQi, this.cultivation.currentQi + passiveGain * 0.25);
                }
            }

            // Alerta Minimalista de Qi Acabando (Requisito explícito do /grill-me)
            const qiRatio = this.cultivation.currentQi / Math.max(1, this.cultivation.maxQi);
            if (qiRatio <= 0.20 && !this._lowQiWarned) {
                this._lowQiWarned = true;
                this.addToast(`⚠️ [Alerta de Dantian] Seu Qi está acabando (${Math.floor(qiRatio * 100)}%)! Medite ou tome uma pílula!`, "#ff4757");
            } else if (qiRatio > 0.35) {
                this._lowQiWarned = false;
            }
        }

        distributeCultivationGain(gain, tech) {
            const focus = this.cultivationFocus;
            if (focus === "qi") {
                this.addQiExp(gain);
            } else if (focus === "body") {
                this.addBodyExp(gain * 0.85);
                this.addQiExp(gain * 0.25);
            } else if (focus === "soul") {
                this.addSoulExp(gain * 0.85);
                this.addQiExp(gain * 0.25);
            } else {
                // Equilibrado ou baseado na técnica
                if (tech.focus === "body") {
                    this.addBodyExp(gain * 0.75);
                    this.addQiExp(gain * 0.35);
                } else if (tech.focus === "soul") {
                    this.addSoulExp(gain * 0.75);
                    this.addQiExp(gain * 0.35);
                } else if (tech.focus === "all") {
                    this.addQiExp(gain * 0.5);
                    this.addBodyExp(gain * 0.4);
                    this.addSoulExp(gain * 0.4);
                } else {
                    this.addQiExp(gain * 0.8);
                    this.addBodyExp(gain * 0.15);
                    this.addSoulExp(gain * 0.15);
                }
            }
        }

        getEnvironmentSummary() {
            let mult = 1.0;
            let hour = 12;
            let moonPhase = 0;
            let height = 100;
            let temp = 24;
            let humidity = 50;
            let biomeLabel = "Planície Espiritual";
            const activeBonuses = [];

            if ($gameSystem && typeof $gameSystem.dayNightHour === "function") {
                hour = $gameSystem.dayNightHour();
                moonPhase = typeof $gameSystem.dayNightMoonPhase === "function" ? $gameSystem.dayNightMoonPhase() : 0;
            } else if ($gameVariables) {
                hour = $gameVariables.value(10) || 12;
            }

            const tech = this.getActiveTechnique();

            // Hora do dia
            if ((hour >= 5 && hour <= 7) || (hour >= 17 && hour <= 19)) {
                mult += 0.35;
                activeBonuses.push("Crepúsculo/Alvorada (+35%)");
            } else if (hour >= 11 && hour <= 14) {
                if (tech.element === "fire" || tech.element === "light" || tech.element === "thunder") {
                    mult += 0.55;
                    activeBonuses.push("Zênite Solar Yang (+55%)");
                }
            } else if (hour >= 22 || hour <= 2) {
                if (tech.element === "ice" || tech.element === "darkness" || tech.element === "water") {
                    mult += 0.55;
                    activeBonuses.push("Meia-Noite Yin (+55%)");
                }
            }

            // Fase da Lua
            if (moonPhase === 4) {
                mult += 0.80;
                activeBonuses.push("Lua Cheia Celestial (+80%)");
            }

            // Altitude e Bioma Procedural
            const coords = (globalThis.BasicChunkGenerator && globalThis.BasicChunkGenerator.getRealPlayerCoordinates)
                ? globalThis.BasicChunkGenerator.getRealPlayerCoordinates()
                : { x: $gamePlayer ? $gamePlayer.x : 0, y: $gamePlayer ? $gamePlayer.y : 0 };

            if (globalThis.PerlinNoiseGenerator && globalThis.PerlinNoiseGenerator.getEnvironmentDataForCoords) {
                const env = globalThis.PerlinNoiseGenerator.getEnvironmentDataForCoords(coords.x, coords.y);
                if (env) {
                    height = Math.round(env.height || 100);
                    temp = Math.round(env.temperature || 24);
                    humidity = Math.round(env.humidity || 50);
                }
            } else if ($gameVariables) {
                height = $gameVariables.value(1) || 100;
                temp = $gameVariables.value(2) || 24;
                humidity = $gameVariables.value(3) || 50;
            }

            if (height >= 450) {
                const altBonus = Math.min(1.2, (height - 300) / 350);
                mult += altBonus;
                biomeLabel = temp < 10 ? "Pico Nevado Imortal" : "Cordilheira Espiritual Alta";
                activeBonuses.push(`Altitude Elevada (+${Math.round(altBonus * 100)}%)`);
            } else if (height < 0) {
                biomeLabel = "Vale / Leito Aquático";
                if (tech.element === "water" || tech.element === "ice") {
                    mult += 0.40;
                    activeBonuses.push("Ressonância Aquática (+40%)");
                }
            } else if (humidity >= 70) {
                biomeLabel = "Floresta Antiga de Qi";
                if (tech.element === "wood") {
                    mult += 0.45;
                    activeBonuses.push("Vitalidade Silvestre (+45%)");
                }
            }

            if (this.cultivation.groundArrayActive) {
                mult += 1.0;
                activeBonuses.push("Arranjo de Qi no Solo (+100%)");
            }

            return {
                coords,
                hour,
                moonPhase,
                height,
                temp,
                humidity,
                biomeLabel,
                totalMultiplier: Number(mult.toFixed(2)),
                activeBonuses
            };
        }

        addToast(text, color = "#ffffff") {
            if (!enableToasts) return;
            if (SceneManager._scene && SceneManager._scene._cultivationToastManager) {
                SceneManager._scene._cultivationToastManager.showToast(text, color);
            }
        }
    }

    // =========================================================================
    // 3. INTEGRAÇÃO COM GAME_SYSTEM, ATRIBUTOS VISÍVEIS E COMBATE (SKYRIM)
    // =========================================================================

    // Expõe a classe globalmente para o JsonEx do RMMZ conseguir serializar/deserializar no save
    globalThis.Game_CultivationSystem = Game_CultivationSystem;

    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._cultivationSystem = new Game_CultivationSystem();
    };

    Game_System.prototype.cultivation = function() {
        if (!this._cultivationSystem) {
            this._cultivationSystem = new Game_CultivationSystem();
        } else if (!(this._cultivationSystem instanceof Game_CultivationSystem)) {
            // Restaura o protótipo da classe caso o save tenha sido carregado como Object puro
            Object.setPrototypeOf(this._cultivationSystem, Game_CultivationSystem.prototype);
        }
        if (typeof this._cultivationSystem.ensureFields === "function") {
            this._cultivationSystem.ensureFields();
        }
        return this._cultivationSystem;
    };

    const _DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _DataManager_extractSaveContents.call(this, contents);
        if ($gameSystem && typeof $gameSystem.cultivation === "function") {
            $gameSystem.cultivation();
        }
    };

    // Os Status Base (HP, MP, ATK, DEF, MAT, MDF, AGI, LUK) são revelados de primeira e refletem Raça, Constituição, Linhagem e Reino!
    const _Game_Actor_paramPlus = Game_Actor.prototype.paramPlus;
    Game_Actor.prototype.paramPlus = function(paramId) {
        let value = _Game_Actor_paramPlus.call(this, paramId);

        if ($gameParty && this === $gameParty.leader() && $gameSystem && $gameSystem.cultivation) {
            const cs = $gameSystem.cultivation();
            const race = cs.getRace();
            const blood = cs.getBloodline();
            const constData = cs.getConstitution();

            const qR = cs.cultivation.qiRealmIndex;
            const qS = cs.cultivation.qiStage;
            const bR = cs.cultivation.bodyRealmIndex;
            const sR = cs.cultivation.soulRealmIndex;

            const rMod = race.statModifiers || {};
            const bMod = blood.statModifiers || blood.statBonus || {};
            const cMod = constData.statBonus || {};

            // Penalidade temporária se estiver em Desvio de Qi Severo
            const devPenalty = cs.cultivation.qiDeviationLevel >= 3 ? 0.75 : 1.0;

            let bonus = 0;
            if (paramId === 0) { // MHP
                bonus = (bR * 160) + (qR * 60) + (rMod.mhp || 0) + (bMod.mhp || 0) + (cMod.mhp || 0) + (cs.skills.bodyTempering.level * 25);
            } else if (paramId === 1) { // MMP
                bonus = (qR * 85) + (qS * 15) + (sR * 40) + (rMod.mmp || 0) + (bMod.mmp || 0) + (cMod.mmp || 0) + (cs.skills.meditation.level * 15);
            } else if (paramId === 2) { // ATK
                bonus = (bR * 14) + (qR * 6) + (rMod.atk || 0) + (bMod.atk || 0) + (cMod.atk || 0) + (cs.skills.bodyTempering.level * 2) + (cs.skills.smithing.level * 2);
            } else if (paramId === 3) { // DEF
                bonus = (bR * 18) + (rMod.def || 0) + (bMod.def || 0) + (cMod.def || 0) + (cs.skills.bodyTempering.level * 3);
            } else if (paramId === 4) { // MAT
                bonus = (qR * 16) + (qS * 4) + (sR * 12) + (rMod.mat || 0) + (bMod.mat || 0) + (cMod.mat || 0) + (cs.skills.meditation.level * 3);
            } else if (paramId === 5) { // MDF
                bonus = (sR * 16) + (qR * 10) + (rMod.mdf || 0) + (bMod.mdf || 0) + (cMod.mdf || 0) + (cs.skills.soulPerception.level * 3);
            } else if (paramId === 6) { // AGI
                bonus = (qR * 6) + (bR * 5) + (rMod.agi || 0) + (bMod.agi || 0) + (cMod.agi || 0);
            } else if (paramId === 7) { // LUK
                bonus = (sR * 8) + (rMod.luk || 0) + (bMod.luk || 0) + (cMod.luk || 0);
            }

            value += Math.floor(bonus * devPenalty);
        }

        return value;
    };

    // Hook de Combate: Levar dano sobre o corpo evolui Têmpera Corporal (Estilo Skyrim) e sobrevivência crítica pode gerar Epifania!
    const _Game_Action_executeHpDamage = Game_Action.prototype.executeHpDamage;
    Game_Action.prototype.executeHpDamage = function(target, value) {
        _Game_Action_executeHpDamage.call(this, target, value);
        if (target === $gameParty.leader() && value > 0 && $gameSystem && $gameSystem.cultivation) {
            const cs = $gameSystem.cultivation();
            cs.addSkillExp("bodyTempering", Math.min(80, 10 + Math.floor(value * 0.5)));

            // Sobreviver com < 15% de HP pode desencadear Rompimento Súbito (Epifania de Quase-Morte)!
            if (target.hp > 0 && target.hp <= target.mhp * 0.15 && Math.random() < 0.35) {
                cs.triggerEpiphany("body", "À beira da morte, seu sangue ancestral ferveu e rompeu os limites da carne!");
            }
        }
    };

    // =========================================================================
    // 4. CENA DE NASCIMENTO CEGO (NOVO JOGO: ESCOLHE SOMENTE O NOME!)
    // =========================================================================

    if (enableBlindBirthScreen) {
        Scene_Title.prototype.commandNewGame = function() {
            DataManager.setupNewGame();
            this._commandWindow.close();
            this.fadeOutAll();
            SceneManager.goto(Scene_BlindBirthName);
        };
    }

    class Window_BlindBirthInfo extends Window_Base {
        constructor(rect, currentName) {
            super(rect);
            this._heroName = currentName;
            this.refresh();
        }

        setHeroName(name) {
            this._heroName = name;
            this.refresh();
        }

        refresh() {
            this.contents.clear();
            const cs = $gameSystem.cultivation();
            const actor = $gameParty.leader();

            let y = 6;
            const lh = 28;

            this.contents.fontSize = 22;
            this.changeTextColor("#ffd700");
            this.drawText("☯ DESPERTAR EM UM MUNDO DESCONHECIDO ☯", 0, y, this.innerWidth, "center");
            y += 36;

            this.contents.fontSize = 15;
            this.changeTextColor("#dfe6e9");
            this.drawText("Você desperta sem memórias de sua forma passada. Neste universo alternativo,", 0, y, this.innerWidth, "center");
            y += 22;
            this.drawText("apenas o seu NOME pertence à sua vontade inicial — todo o resto é um mistério.", 0, y, this.innerWidth, "center");
            y += 32;

            // Nome Escolhido
            this.contents.fontSize = 20;
            this.changeTextColor("#81ecec");
            this.drawText(`Nome do Cultivador(a):   【 ${this._heroName} 】`, 0, y, this.innerWidth, "center");
            y += 38;

            // Coluna Esquerda: Status Base (Revelados de Primeira!)
            this.contents.fontSize = 16;
            this.changeTextColor("#55efc4");
            this.drawText("【 Status Base Iniciais (Visíveis) 】", 20, y, 320);
            this.changeTextColor("#fab1a0");
            this.drawText("【 Fisiologia & Origem (Mistério ???) 】", 380, y, 340);
            y += lh;

            this.contents.fontSize = 15;
            this.resetTextColor();
            if (actor) {
                actor.refresh();
                const stats = [
                    [`HP Máximo: ${actor.mhp}`, `Raça Biológica: ???`],
                    [`MP / Espírito: ${actor.mmp}`, `Aparência Física: ???`],
                    [`Ataque Físico: ${actor.atk}`, `Anatomia de Meridianos: ???`],
                    [`Defesa Física: ${actor.def}`, `Família / Clã: ???`],
                    [`Poder Mágico (Qi): ${actor.mat}`, `Linhagem Sanguínea: ??? (???%)`],
                    [`Defesa Espiritual: ${actor.mdf}`, `Constituição Corporal: ???`],
                    [`Agilidade: ${actor.agi}  |  Sorte: ${actor.luk}`, `Afinidade Elemental: ??? / ???`]
                ];

                stats.forEach(pair => {
                    this.changeTextColor("#ffffff");
                    this.drawText(pair[0], 30, y, 310);
                    this.changeTextColor("#a4b0be");
                    this.drawText(pair[1], 390, y, 340);
                    y += 25;
                });
            }

            y += 10;
            this.contents.fontSize = 14;
            this.changeTextColor("#ffeaa7");
            this.drawText("💡 Dica: Observe os seus números de Status acima! Eles já refletem sua Raça, Constituição e Linhagem secreta.", 0, y, this.innerWidth, "center");
        }
    }

    class Window_BlindBirthCommands extends Window_HorzCommand {
        maxCols() {
            return 3;
        }
        makeCommandList() {
            this.addCommand("✏️ Digitar Nome", "typeName");
            this.addCommand("🎲 Sugerir Outro Nome", "randomName");
            this.addCommand("✨ Despertar no Mundo", "startWorld");
        }
    }

    const SUGGESTED_NAMES = [
        "Lin Xuan", "Xiao Chen", "Su Ming", "Bai Xiaochun", "Meng Hao",
        "Wang Lin", "Ye Fan", "Shi Hao", "Qin Yu", "Mu Chen", "Ji Ning", "Chu Feng"
    ];

    class Scene_BlindBirthName extends Scene_MenuBase {
        create() {
            super.create();
            // Garante grupo solo com o protagonista e gera a fisiologia secreta
            if ($gameParty) {
                const allIds = $gameParty._actors ? [...$gameParty._actors] : [];
                allIds.forEach(id => {
                    if (id !== 1) $gameParty.removeActor(id);
                });
                if (!$gameParty._actors.includes(1)) {
                    $gameParty.addActor(1);
                }
            }
            const cs = $gameSystem.cultivation();
            cs.applyRaceAppearanceToActor();

            this._heroName = "Lin Xuan";
            if ($gameActors.actor(1)) {
                $gameActors.actor(1).setName(this._heroName);
            }

            const infoRect = new Rectangle(30, 25, Graphics.boxWidth - 60, Graphics.boxHeight - 135);
            this._infoWindow = new Window_BlindBirthInfo(infoRect, this._heroName);
            this.addWindow(this._infoWindow);

            const cmdRect = new Rectangle(30, Graphics.boxHeight - 95, Graphics.boxWidth - 60, 70);
            this._cmdWindow = new Window_BlindBirthCommands(cmdRect);
            this._cmdWindow.setHandler("typeName", this.onTypeName.bind(this));
            this._cmdWindow.setHandler("randomName", this.onRandomName.bind(this));
            this._cmdWindow.setHandler("startWorld", this.onStartWorld.bind(this));
            this.addWindow(this._cmdWindow);
            this._cmdWindow.select(2);
            this._cmdWindow.activate();
        }

        start() {
            super.start();
            this.startFadeIn(this.fadeSpeed(), false);
        }

        onTypeName() {
            const input = window.prompt("Digite o nome do seu personagem:", this._heroName);
            if (input && input.trim().length > 0) {
                this._heroName = input.trim().slice(0, 18);
                if ($gameActors.actor(1)) {
                    $gameActors.actor(1).setName(this._heroName);
                }
                this._infoWindow.setHeroName(this._heroName);
            }
            this._cmdWindow.activate();
        }

        onRandomName() {
            const pick = SUGGESTED_NAMES[Math.floor(Math.random() * SUGGESTED_NAMES.length)];
            this._heroName = pick;
            if ($gameActors.actor(1)) {
                $gameActors.actor(1).setName(this._heroName);
            }
            this._infoWindow.setHeroName(this._heroName);
            SoundManager.playCursor();
            this._cmdWindow.activate();
        }

        onStartWorld() {
            if ($gameActors.actor(1)) {
                $gameActors.actor(1).setName(this._heroName);
                $gameActors.actor(1).recoverAll();
            }
            SoundManager.playOk();
            this.fadeOutAll();
            SceneManager.goto(Scene_Map);
        }
    }

    // =========================================================================
    // 5. HUD MINIMALISTA (TOASTS DISCRETOS + PARTÍCULAS DE MEDITAÇÃO NO MAPA)
    // =========================================================================

    class CultivationToastManager extends PIXI.Container {
        constructor() {
            super();
            this.toasts = [];
            this.z = 100;
        }

        showToast(text, color = "#ffffff") {
            const toast = new PIXI.Container();

            const textStyle = new PIXI.TextStyle({
                fontFamily: $gameSystem && $gameSystem.mainFontFace ? $gameSystem.mainFontFace() : "sans-serif",
                fontSize: 15,
                fill: color,
                wordWrap: true,
                wordWrapWidth: 520,
                dropShadow: true,
                dropShadowColor: "#000000",
                dropShadowBlur: 4,
                dropShadowDistance: 2
            });

            const textSprite = new PIXI.Text(text, textStyle);
            textSprite.x = 14;
            textSprite.y = 8;

            const bgWidth = textSprite.width + 28;
            const bgHeight = textSprite.height + 16;

            const bg = new PIXI.Graphics();
            bg.beginFill(0x0b0e17, 0.88);
            bg.lineStyle(1.5, 0x3b4866, 0.95);
            bg.drawRoundedRect(0, 0, bgWidth, bgHeight, 6);
            bg.endFill();

            toast.addChild(bg);
            toast.addChild(textSprite);

            if (toastPosition === "top-right") {
                toast.x = Math.max(10, Graphics.boxWidth - bgWidth - 16);
                toast.y = 16 + (this.toasts.length * (bgHeight + 8));
            } else if (toastPosition === "top-center") {
                toast.x = (Graphics.boxWidth - bgWidth) / 2;
                toast.y = 16 + (this.toasts.length * (bgHeight + 8));
            } else {
                toast.x = (Graphics.boxWidth - bgWidth) / 2;
                toast.y = Graphics.boxHeight - 90 - (this.toasts.length * (bgHeight + 8));
            }

            toast.alpha = 0;
            toast.life = 250;
            this.addChild(toast);
            this.toasts.push(toast);

            if (this.toasts.length > 5) {
                const old = this.toasts.shift();
                this.removeChild(old);
            }
        }

        update() {
            for (let i = this.toasts.length - 1; i >= 0; i--) {
                const toast = this.toasts[i];
                toast.life--;
                if (toast.life > 230) {
                    toast.alpha = Math.min(1.0, toast.alpha + 0.12);
                } else if (toast.life <= 30) {
                    toast.alpha = Math.max(0, toast.life / 30);
                }
                if (toast.life <= 0) {
                    this.removeChild(toast);
                    this.toasts.splice(i, 1);
                }
            }
        }
    }

    // Efeito visual de Partículas de Qi e Matriz no chão durante a meditação
    class MeditationParticleEffect extends PIXI.Container {
        constructor() {
            super();
            this._particles = [];
            this._ring = new PIXI.Graphics();
            this._ring.lineStyle(2, 0x81ecec, 0.55);
            this._ring.drawCircle(0, 0, 26);
            this._ring.scale.y = 0.5;
            this.addChild(this._ring);
        }

        update() {
            if (!$gameSystem || !$gameSystem.cultivation || !$gamePlayer) return;
            const cs = $gameSystem.cultivation();
            this.visible = cs.isMeditating || cs.cultivation.groundArrayActive;
            if (!this.visible) return;

            this.x = $gamePlayer.screenX();
            this.y = $gamePlayer.screenY() - 12;
            this._ring.rotation += 0.03;

            if (cs.isMeditating && Math.random() < 0.35 && this._particles.length < 18) {
                const p = new PIXI.Graphics();
                const isDeviating = cs.cultivation.qiDeviationLevel >= 2;
                p.beginFill(isDeviating ? 0xff4757 : 0x81ecec, 0.85);
                p.drawCircle(0, 0, 2.5);
                p.endFill();
                const angle = Math.random() * Math.PI * 2;
                const dist = 32 + Math.random() * 20;
                p.x = Math.cos(angle) * dist;
                p.y = Math.sin(angle) * dist * 0.6;
                p.life = 30;
                this.addChild(p);
                this._particles.push(p);
            }

            for (let i = this._particles.length - 1; i >= 0; i--) {
                const p = this._particles[i];
                p.x *= 0.90;
                p.y *= 0.90;
                p.life--;
                p.alpha = p.life / 30;
                if (p.life <= 0) {
                    this.removeChild(p);
                    this._particles.splice(i, 1);
                }
            }
        }
    }

    // Proteção global contra dupla destruição de Sprites (ex: sombras de DayNightSystem ao abrir menus)
    if (typeof Sprite !== "undefined" && Sprite.prototype) {
        const _Sprite_destroy_guard = Sprite.prototype.destroy;
        Sprite.prototype.destroy = function(options) {
            if (this._destroyed) return;
            if (!this._texture) {
                this._destroyed = true;
                if (typeof PIXI !== "undefined" && PIXI.Container && PIXI.Container.prototype.destroy) {
                    PIXI.Container.prototype.destroy.call(this, { children: true });
                }
                return;
            }
            _Sprite_destroy_guard.call(this, options);
        };
    }

    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this._meditationEffect = new MeditationParticleEffect();
        this.addChild(this._meditationEffect);

        this._cultivationToastManager = new CultivationToastManager();
        this.addChild(this._cultivationToastManager);
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);

        if ($gameSystem && $gameSystem.cultivation) {
            $gameSystem.cultivation().update();
        }
        if (this._meditationEffect) {
            this._meditationEffect.update();
        }
        if (this._cultivationToastManager) {
            this._cultivationToastManager.update();
        }
        this.updateCultivationShortcuts();
    };

    Scene_Map.prototype.updateCultivationShortcuts = function() {
        if ($gameMap.isEventRunning() || this.isBusy()) return;

        const cs = $gameSystem.cultivation();

        // Tecla C: Meditar / Levantar
        if (Input.isTriggered("meditationKey")) {
            cs.isMeditating = !cs.isMeditating;
            if (cs.isMeditating) {
                const tech = cs.getActiveTechnique();
                cs.addToast(`🧘 Meditando: [${tech.name}] (Tecla ${meditationKey} para levantar)`, "#81ecec");
                SoundManager.playRecovery();
            } else {
                cs.addToast("🚶 Você interrompe a circulação ativa de Qi e se levanta.", "#dfe6e9");
            }
        }

        // TeclaG: Sondar e Coletar Recursos do Mapa
        if (Input.isTriggered("gatherMaterialKey")) {
            cs.gatherWorldMaterials();
        }

        // Tecla K: Abre direto a aba de Configuração de Cultivo do Novo Menu
        if (Input.isTriggered("cultivationMenuKey")) {
            Scene_XianxiaTabbedMenu._initialTab = "cultivation";
            SceneManager.push(Scene_XianxiaTabbedMenu);
        }
    };

    const _Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        if ($gameSystem && $gameSystem.cultivation && $gameSystem.cultivation().isMeditating) {
            return false;
        }
        return _Game_Player_canMove.call(this);
    };

    const _Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
    Sprite_Character.prototype.updatePosition = function() {
        _Sprite_Character_updatePosition.call(this);
        if (this._character === $gamePlayer && $gameSystem && $gameSystem.cultivation && $gameSystem.cultivation().isMeditating) {
            this.y += Math.sin((Graphics.frameCount || 0) * 0.08) * 4;
        }
    };

    // =========================================================================
    // 6. NOVO MENU UNIFICADO EM ABAS (SUBSTITUI O MENU DO RPG MAKER MZ)
    // =========================================================================

    if (replaceDefaultMenu) {
        Scene_Map.prototype.callMenu = function() {
            SoundManager.playOk();
            Scene_XianxiaTabbedMenu._initialTab = "inventory";
            SceneManager.push(Scene_XianxiaTabbedMenu);
            Window_MenuCommand.initCommandPosition();
            $gameTemp.clearDestination();
            this._mapNameWindow.hide();
            this._waitCount = 2;
        };
    }

    class Window_XianxiaTopTabs extends Window_HorzCommand {
        maxCols() {
            return 8;
        }
        itemWidth() {
            return Math.floor(this.innerWidth / 8);
        }
        makeCommandList() {
            this.addCommand("🎒 Itens", "inventory");
            this.addCommand("🧬 Corpo", "physiology");
            this.addCommand("☯️ Cultivo", "cultivation");
            this.addCommand("✨ Perícias", "skills");
            this.addCommand("🗺️ Mapa", "map");
            this.addCommand("📜 Quests", "quests");
            this.addCommand("🤝 Clã", "relationships");
            this.addCommand("⚙️ Sist.", "system");
        }

        // Navegação direta com o mouse (único clique sem duplicação)
        processTouch() {
            if (this.isOpen()) {
                if (this.isTouchedInsideFrame()) {
                    const hit = this.hitIndex();
                    if (hit >= 0) {
                        if (TouchInput.isTriggered()) {
                            if (this.index() !== hit) {
                                this.select(hit);
                                SoundManager.playCursor();
                            }
                        }
                        if (TouchInput.isClicked()) {
                            this.select(hit);
                            const sym = this.commandSymbol(hit);
                            if (sym && this._handlers[sym]) {
                                TouchInput.clear();
                                this._handlers[sym]();
                                return;
                            }
                        }
                    }
                }
            }
            if (this.isOpenAndActive() && TouchInput.isCancelled()) {
                this.processCancel();
            }
        }
    }

    class Window_XianxiaTabContent extends Window_Base {
        constructor(rect) {
            super(rect);
            this._currentTab = "inventory";
        }

        setTab(tabSymbol) {
            if (this._currentTab !== tabSymbol) {
                this._currentTab = tabSymbol;
                this.refresh();
            }
        }

        refresh() {
            this.contents.clear();
            const cs = $gameSystem.cultivation();

            switch (this._currentTab) {
                case "inventory": this.drawInventoryTab(cs); break;
                case "physiology": this.drawPhysiologyTab(cs); break;
                case "cultivation": this.drawCultivationConfigTab(cs); break;
                case "skills": this.drawSkillsTab(cs); break;
                case "map": this.drawMapTab(cs); break;
                case "quests": this.drawQuestsTab(cs); break;
                case "relationships": this.drawRelationshipsTab(cs); break;
                case "system": this.drawSystemTab(cs); break;
            }
        }

        drawHeader(title, subtitle = "") {
            this.contents.fontSize = 20;
            this.changeTextColor("#ffd700");
            this.drawText(title, 10, 4, this.innerWidth - 20, "left");
            if (subtitle) {
                this.contents.fontSize = 13;
                this.changeTextColor("#a4b0be");
                this.drawText(subtitle, 10, 28, this.innerWidth - 20, "left");
            }
            this.contents.fillRect(10, 50, this.innerWidth - 20, 1, "#3b4866");
        }

        // ABA 1: INVENTÁRIO ESPIRITUAL & EQUIPAMENTOS
        drawInventoryTab(cs) {
            this.drawHeader("🎒 ANEL ESPACIAL & INVENTÁRIO ESPIRITUAL", "Use os botões abaixo para consumir pílulas, usar Pedras de Teste ou coletar recursos no mapa (Tecla G).");
            const mat = cs.materials;
            let y = 62;
            const lh = 28;

            this.contents.fontSize = 16;
            this.changeTextColor("#81ecec");
            this.drawText("【 Recursos Espirituais & Pílulas Alquímicas 】", 12, y, 420);
            y += lh;

            this.contents.fontSize = 15;
            this.resetTextColor();
            this.drawText(`🔮 Pedras de Teste Espiritual: ${mat.testingStones}`, 24, y, 340);
            this.drawText(`💊 Pílulas de Condensação de Qi: ${mat.qiPills}`, 390, y, 340);
            y += lh;
            this.drawText(`💊 Pílulas de Harmonização (Cura Desvio): ${mat.calmingPills}`, 24, y, 350);
            this.drawText(`🌿 Ervas Espirituais: ${mat.spiritHerbs}`, 390, y, 340);
            y += lh;
            this.drawText(`⛏️ Minérios Espirituais: ${mat.spiritOres}`, 24, y, 340);
            this.drawText(`💎 Pedras de Matriz (Arranjos): ${mat.arrayStones}`, 390, y, 340);
            y += lh;
            this.drawText(`🩸 Núcleos Internos Bestiais: ${mat.beastCores}`, 24, y, 340);
            this.drawText(`💰 Ouro / Moedas Mortais: ${$gameParty ? $gameParty.gold() : 0}`, 390, y, 340);
            y += lh + 12;

            // Itens do banco de dados do RMMZ
            this.contents.fontSize = 16;
            this.changeTextColor("#ffeaa7");
            this.drawText("【 Itens & Equipamentos na Bolsa 】", 12, y, 420);
            y += lh;

            this.contents.fontSize = 14;
            this.resetTextColor();
            const allItems = $gameParty ? $gameParty.allItems() : [];
            if (allItems.length === 0) {
                this.changeTextColor("#a4b0be");
                this.drawText("Nenhum equipamento mundano extra. Use seus materiais espirituais para Alquimia, Forja e Arranjos!", 24, y, this.innerWidth - 40);
            } else {
                allItems.slice(0, 6).forEach((item, idx) => {
                    const colX = (idx % 2) * 370 + 24;
                    const rowY = y + Math.floor(idx / 2) * 26;
                    this.drawText(`• ${item.name} (x${$gameParty.numItems(item)})`, colX, rowY, 350);
                });
            }
        }

        // ABA 2: FISIOLOGIA OCULTA (???) & STATUS VISÍVEIS
        drawPhysiologyTab(cs) {
            const actor = $gameParty.leader();
            const phys = cs.physiology;
            this.drawHeader(`🧬 FISIOLOGIA & STATUS — ${actor ? actor.name() : "Cultivador"}`, "Seus Status numéricos são visíveis desde o início; descubra os '???' observando seu corpo, família e meridianos!");

            let y = 60;
            const lh = 26;

            // Coluna Esquerda: Status Base Visíveis
            this.contents.fontSize = 16;
            this.changeTextColor("#55efc4");
            this.drawText("【 Status Atuais (Visíveis) 】", 12, y, 260);
            this.changeTextColor("#81ecec");
            this.drawText("【 Mistérios do Corpo & Sangue 】", 290, y, 440);
            y += lh;

            this.contents.fontSize = 14;
            if (actor) {
                const leftStats = [
                    `HP: ${actor.hp} / ${actor.mhp}`,
                    `MP: ${actor.mp} / ${actor.mmp}`,
                    `Qi Dantian: ${Math.floor(cs.cultivation.currentQi)} / ${cs.cultivation.maxQi}`,
                    `Ataque (ATK): ${actor.atk}`,
                    `Defesa (DEF): ${actor.def}`,
                    `Poder Mágico (MAT): ${actor.mat}`,
                    `Def. Espiritual (MDF): ${actor.mdf}`,
                    `Agilidade: ${actor.agi} | Sorte: ${actor.luk}`
                ];

                const rightTraits = [
                    `Raça: ${phys.revealed.race ? cs.getRace().name : "??? (Observe sua Aparência/Parentes)"}`,
                    `Anatomia: ${phys.revealed.anatomy ? cs.getAnatomy().name : "??? (Sonde seus Meridianos)"}`,
                    `Clã / Família: ${phys.revealed.family ? cs.getBloodline().clanName : "??? (Recorde sua Família)"}`,
                    `Linhagem: ${phys.revealed.bloodline ? cs.getBloodline().name : "??? (Descubra pela Reputação do Clã)"}`,
                    `Pureza Sanguínea: ${phys.revealed.bloodlinePurity ? phys.bloodlinePurity + "%" : "???% (Use Pedra de Teste / Refino)"}`,
                    `Constituição: ${phys.revealed.constitution ? cs.getConstitution().name : "??? (Medite ou Sonde Meridianos)"}`,
                    `Afinidades Elementais: ${phys.revealed.elements ? (ELEMENT_NAMES[phys.primaryElement] + " & " + ELEMENT_NAMES[phys.secondaryElement]) : "??? / ??? (Use Pedra de Teste)"}`,
                    `Heranças Absorvidas: ${phys.inheritedLegacies.length > 0 ? phys.inheritedLegacies.join(", ") : "Nenhuma ainda"}`
                ];

                for (let i = 0; i < leftStats.length; i++) {
                    this.changeTextColor("#ffffff");
                    this.drawText(leftStats[i], 20, y, 255);

                    const isRevealed = !rightTraits[i].includes("???");
                    this.changeTextColor(isRevealed ? "#ffd700" : "#a4b0be");
                    this.drawText(rightTraits[i], 295, y, 470);
                    y += lh;
                }
            }

            y += 6;
            this.contents.fontSize = 13;
            this.changeTextColor("#dfe6e9");
            if (phys.revealed.race) {
                this.drawText(`Pista Física: ${cs.getRace().appearanceClue}`, 12, y, this.innerWidth - 24);
            } else {
                this.drawText(`Pista: Use os botões abaixo para observar seu reflexo, recordar seu clã ou sondar seus meridianos!`, 12, y, this.innerWidth - 24);
            }
        }

        // ABA 3: MENU PRÓPRIO DE CONFIGURAÇÃO DE CULTIVO & DANTIAN
        drawCultivationConfigTab(cs) {
            const tech = cs.getActiveTechnique();
            const compat = cs.evaluateTechniqueCompatibility(tech);
            const cult = cs.cultivation;

            this.drawHeader("☯️ CONFIGURAÇÃO DE CULTIVO & DIAGNÓSTICO DE MERIDIANOS", "Escolha qual Técnica de Cultivo circular, ajuste seu Foco, monitore o Desvio de Qi e rompa gargalos.");

            let y = 58;
            const lh = 25;

            // 1. Reinos Atuais (Humano/Padrão vs Monstro 1º-9º Grau)
            this.contents.fontSize = 15;
            this.changeTextColor("#ffd700");
            if (cs.isMonster()) {
                const gData = MONSTER_GRADES[Math.min(MONSTER_GRADES.length - 1, cult.qiRealmIndex - 1)];
                this.drawText(`🐉 Evolução Bestial: ${gData.name} [${Math.floor(cult.qiExp)}/${cult.qiMaxExp}]`, 12, y, 520);
                this.changeTextColor("#81ecec");
                this.drawText(`Consciência: ${gData.consciousness}`, 535, y, 240);
                y += lh;
                this.changeTextColor("#dfe6e9");
                this.drawText(`Forma Atual: ${gData.form} | Pureza Exigida Próx. Grau: ${MONSTER_GRADES[Math.min(8, cult.qiRealmIndex)].minPurity}%`, 12, y, 720);
            } else {
                const qR = QI_REALMS_STANDARD[cult.qiRealmIndex] || QI_REALMS_STANDARD[1];
                this.drawText(`🌟 Reino de Qi: ${qR.name} (${cult.qiStage}ª Camada) — [${Math.floor(cult.qiExp)} / ${cult.qiMaxExp}] ${cult.qiBottleneck ? "【GARGALO!】" : ""}`, 12, y, 740);
            }
            y += lh;

            const bR = BODY_REALMS[cult.bodyRealmIndex];
            const sR = SOUL_REALMS[cult.soulRealmIndex];
            this.changeTextColor("#fab1a0");
            this.drawText(`🛡️ Reino Corporal: ${bR.name} [${Math.floor(cult.bodyExp)}/${cult.bodyMaxExp}] ${cult.bodyBottleneck ? "【GARGALO!】" : ""}`, 12, y, 370);
            this.changeTextColor("#74b9ff");
            this.drawText(`👁️ Reino da Alma: ${sR.name} [${Math.floor(cult.soulExp)}/${cult.soulMaxExp}] ${cult.soulBottleneck ? "【GARGALO!】" : ""}`, 395, y, 370);
            y += lh + 8;

            // 2. Técnica Ativa & Foco de Cultivo
            this.contents.fontSize = 15;
            this.changeTextColor("#55efc4");
            this.drawText(`📖 Técnica Ativa: 【 ${tech.name} 】 (Elemento: ${ELEMENT_NAMES[tech.element]})`, 12, y, 520);
            this.changeTextColor("#ffeaa7");
            this.drawText(`🎯 Foco: ${cs.cultivationFocus.toUpperCase()}`, 545, y, 210);
            y += 22;

            this.contents.fontSize = 13;
            this.changeTextColor("#dfe6e9");
            this.drawText(tech.desc, 20, y, this.innerWidth - 30);
            y += 26;

            // 3. Compatibilidade Fisiológica & Desvio de Qi
            const riskColors = ["#55efc4", "#ffeaa7", "#fab1a0", "#ff4757"];
            this.contents.fontSize = 15;
            this.changeTextColor(riskColors[compat.riskLevel] || "#ffffff");
            this.drawText(`⚖️ Compatibilidade Fisiológica: ${compat.statusLabel} (Eficiência: ${Math.round(compat.efficiency * 100)}%)`, 12, y, 720);
            y += lh;

            const devLabels = ["0 - Mente Serena (Estável)", "1 - Desvio Leve (Formigamento)", "2 - Desvio Moderado (Tosse de Sangue)", "3 - Desvio Severo (Fissura de Meridianos)", "4 - Colapso Catastrófico!"];
            this.changeTextColor(cult.qiDeviationLevel === 0 ? "#81ecec" : "#ff6b81");
            this.drawText(`🔥 Estado de Desvio de Qi: Nível ${devLabels[cult.qiDeviationLevel]} (${Math.floor(cult.deviationPoints)}/100 pts)`, 12, y, 720);
            y += 22;

            if (compat.reasons.length > 0) {
                this.contents.fontSize = 13;
                this.changeTextColor("#fdcb6e");
                this.drawText(`Diagnóstico: ${compat.reasons.join(" | ")}`, 20, y, this.innerWidth - 30);
            }
        }

        // ABA 4: HABILIDADES ESTILO SKYRIM
        drawSkillsTab(cs) {
            this.drawHeader("✨ HABILIDADES & PERÍCIAS ORGÂNICAS (ESTILO SKYRIM)", "Evoluem automaticamente conforme você pratica ações no mundo. A cada 5 níveis, desencadeiam uma Epifania!");

            let y = 62;
            Object.keys(cs.skills).forEach(key => {
                const sk = cs.skills[key];
                const ratio = Math.min(1, sk.exp / Math.max(1, sk.maxExp));

                this.contents.fontSize = 16;
                this.changeTextColor("#55efc4");
                this.drawText(`${sk.name} — Nível ${sk.level}`, 16, y, 340);

                // Barra de Progresso
                const barX = 370;
                const barY = y + 6;
                const barW = 220;
                const barH = 14;
                this.contents.fillRect(barX, barY, barW, barH, "#1e272e");
                this.contents.fillRect(barX, barY, Math.floor(barW * ratio), barH, "#00d2d3");

                this.contents.fontSize = 13;
                this.changeTextColor("#ffffff");
                this.drawText(`${Math.floor(sk.exp)} / ${sk.maxExp} XP`, barX + barW + 12, y, 140);
                y += 22;

                this.contents.fontSize = 13;
                this.changeTextColor("#a4b0be");
                this.drawText(sk.desc, 24, y, this.innerWidth - 40);
                y += 26;
            });
        }

        // ABA 5: MAPA & RESSONÂNCIA AMBIENTAL
        drawMapTab(cs) {
            const env = cs.getEnvironmentSummary();
            this.drawHeader("🗺️ MAPA DO MUNDO & RESSONÂNCIA ESPIRITUAL DO TERRENO", "A hora do dia, fase da lua, bioma e altitude alteram diretamente a densidade do Qi mundial.");

            let y = 64;
            const lh = 28;
            const moonNames = ["Lua Nova (Yin)", "Crescente Côncava", "Quarto Crescente", "Crescente Gibosa", "🌕 LUA CHEIA (Maré Celestial)", "Minguante Gibosa", "Quarto Minguante", "Minguante Côncava"];

            this.contents.fontSize = 16;
            this.changeTextColor("#ffd700");
            this.drawText(`📍 Coordenadas Reais: X = ${env.coords.x}, Y = ${env.coords.y}  |  Bioma: ${env.biomeLabel}`, 16, y, 700);
            y += lh;

            this.resetTextColor();
            this.drawText(`⛰️ Altitude do Terreno: ${env.height}m`, 16, y, 320);
            this.drawText(`🌡️ Temperatura: ${env.temp}°C  |  💧 Umidade: ${env.humidity}%`, 360, y, 380);
            y += lh;

            this.changeTextColor("#81ecec");
            this.drawText(`🕒 Hora Mundial: ${env.hour}:00h`, 16, y, 320);
            this.drawText(`🌙 Fase Lunar: ${moonNames[env.moonPhase] || "Fase " + env.moonPhase}`, 360, y, 380);
            y += lh + 6;

            this.contents.fontSize = 18;
            this.changeTextColor("#55efc4");
            this.drawText(`✨ Multiplicador de Densidade de Qi Local: ${env.totalMultiplier}x`, 16, y, 500);
            y += lh;

            this.contents.fontSize = 14;
            this.changeTextColor("#ffeaa7");
            const bonusText = env.activeBonuses.length > 0 ? env.activeBonuses.join("  •  ") : "Nenhum bônus astro-topográfico ativo neste momento.";
            this.drawText(`Fatores Ativos: ${bonusText}`, 16, y, this.innerWidth - 32);
        }

        // ABA 6: QUESTS & JORNADA DE DESCOBERTA
        drawQuestsTab(cs) {
            this.drawHeader("📜 DIÁRIO DE QUESTS & MISTÉRIOS DO MUNDO", "Desvende sua identidade, supere os limites da sua fisiologia e conquiste heranças ancestrais.");

            let y = 64;
            cs.quests.forEach(q => {
                this.contents.fontSize = 16;
                this.changeTextColor(q.completed ? "#55efc4" : "#ffd700");
                this.drawText(`${q.completed ? "✔ [CONCLUÍDA]" : "⏳ [EM ABERTO]"} ${q.title}`, 16, y, 700);
                y += 22;

                this.contents.fontSize = 14;
                this.changeTextColor("#dfe6e9");
                this.drawText(`   ${q.desc}`, 24, y, this.innerWidth - 40);
                y += 32;
            });
        }

        // ABA 7: RELACIONAMENTOS, FAMÍLIA & REPUTAÇÃO DE CLÃ
        drawRelationshipsTab(cs) {
            const phys = cs.physiology;
            const blood = cs.getBloodline();
            this.drawHeader("🤝 RELACIONAMENTOS, CLÃ DE ORIGEM & MESTRES", "A aparência dos seus parentes e a reputação da sua família revelam sua Raça e Linhagem.");

            let y = 62;
            this.contents.fontSize = 16;
            this.changeTextColor("#ffd700");
            this.drawText(`🏛️ Família / Clã de Origem: ${phys.revealed.family ? blood.clanName : "??? (Use 'Investigar Família' para recordar)"}`, 16, y, 720);
            y += 24;

            this.contents.fontSize = 14;
            this.changeTextColor("#dfe6e9");
            this.drawText(`Reputação Conhecida: ${phys.revealed.family ? blood.clanReputation : "??? (Desconhecida até investigar suas raízes familiares)"}`, 24, y, this.innerWidth - 40);
            y += 34;

            this.contents.fontSize = 16;
            this.changeTextColor("#81ecec");
            this.drawText("【 Pessoas & Vínculos Conhecidos 】", 16, y, 400);
            y += 26;

            cs.relationships.forEach(rel => {
                this.contents.fontSize = 15;
                this.changeTextColor("#55efc4");
                this.drawText(`• ${rel.name} (${rel.role}) — Afinidade: ${rel.affinity}`, 20, y, 650);
                y += 20;
                this.contents.fontSize = 13;
                this.changeTextColor("#a4b0be");
                this.drawText(`  ${rel.note}`, 28, y, this.innerWidth - 40);
                y += 28;
            });
        }

        // ABA 8: SISTEMA
        drawSystemTab() {
            this.drawHeader("⚙️ SISTEMA & OPÇÕES DO MUNDO", "Salve seu progresso na jornada imortal ou ajuste configurações.");
            this.contents.fontSize = 16;
            this.changeTextColor("#dfe6e9");
            this.drawText("Atalhos no Mapa:", 20, 75, 300);
            this.drawText(`• Tecla [${meditationKey}]: Sentar e Meditar na Técnica Configurada`, 36, 105, 600);
            this.drawText(`• Tecla [${gatherMaterialKey}]: Sondar o Terreno e Coletar Materiais Espirituais`, 36, 135, 600);
            this.drawText(`• Tecla [${cultivationMenuKey}]: Abrir direto a Configuração de Cultivo`, 36, 165, 600);
            this.drawText(`• Tecla [ESC / X]: Abrir este Menu Unificado em Abas`, 36, 195, 600);
        }
    }

    // Barra Inferior de Ações Contextuais para cada Aba
    class Window_XianxiaSubActions extends Window_HorzCommand {
        constructor(rect) {
            super(rect);
            this._currentTab = "inventory";
        }

        setTab(tab) {
            if (this._currentTab !== tab) {
                this._currentTab = tab;
                this.refresh();
                this.select(0);
            }
        }

        maxCols() {
            return 4;
        }

        // Processamento direto de clique do mouse nas ações (único clique sem duplicação)
        processTouch() {
            if (this.isOpen()) {
                if (this.isTouchedInsideFrame()) {
                    const hit = this.hitIndex();
                    if (hit >= 0) {
                        if (TouchInput.isTriggered()) {
                            if (this.index() !== hit) {
                                this.select(hit);
                                SoundManager.playCursor();
                            }
                        }
                        if (TouchInput.isClicked()) {
                            this.select(hit);
                            const sym = this.commandSymbol(hit);
                            if (sym && this._handlers[sym]) {
                                TouchInput.clear();
                                this._handlers[sym]();
                                return;
                            }
                        }
                    }
                }
            }
            if (this.isOpenAndActive() && TouchInput.isCancelled()) {
                this.processCancel();
            }
        }

        makeCommandList() {
            const cs = $gameSystem ? $gameSystem.cultivation() : null;
            if (!cs) return;

            switch (this._currentTab) {
                case "inventory":
                    this.addCommand("🔮 Usar Pedra Teste", "useTestingStone");
                    this.addCommand("💊 Tomar Pílula Qi", "takeQiPill");
                    this.addCommand("💊 Pílula Harmoniz.", "takeCalmingPill");
                    this.addCommand("🌿 Coletar no Mapa", "gatherMaterials");
                    break;
                case "physiology":
                    this.addCommand("👁️ Olhar Aparência", "inspectAppearance");
                    this.addCommand("🏠 Recordar Família", "investigateFamily");
                    this.addCommand("🧘 Sondar Meridianos", "probeMeridians");
                    if (cs.isHuman()) {
                        this.addCommand("👑 Absorver Herança", "absorbHumanHeritage");
                    } else {
                        this.addCommand("🩸 Purificar Sangue", "refineBloodline");
                    }
                    break;
                case "cultivation":
                    this.addCommand("📖 Trocar Técnica", "cycleTechnique");
                    this.addCommand("🎯 Mudar Foco", "cycleFocus");
                    this.addCommand("🌟 Romper Gargalo", "breakthroughAll");
                    this.addCommand("☸️ Erguer Arranjo", "deployArray");
                    break;
                case "skills":
                    this.addCommand("⚗️ Praticar Alquimia", "craftQiPill");
                    this.addCommand("💊 Refinar Calmaria", "craftCalmingPill");
                    this.addCommand("🔨 Praticar Forja", "practiceSmithing");
                    this.addCommand("🧘 Meditar Agora", "toggleMeditation");
                    break;
                case "quests":
                    this.addCommand("📜 Atualizar Quests", "refreshQuests");
                    this.addCommand("🚪 Fechar Menu", "exitMenu");
                    break;
                case "map":
                    this.addCommand("🗺️ Mapa Completo", "openProceduralMap");
                    this.addCommand("🌿 Sondar Recursos", "gatherMaterials");
                    this.addCommand("☸️ Erguer Arranjo", "deployArray");
                    this.addCommand("🚪 Fechar Menu", "exitMenu");
                    break;
                case "relationships":
                    this.addCommand("🏠 Investigar Clã", "investigateFamily");
                    this.addCommand("🧓 Consultar Mestre", "consultMaster");
                    this.addCommand("🚪 Fechar Menu", "exitMenu");
                    break;
                case "system":
                    this.addCommand("💾 Salvar Jogo", "saveGame");
                    this.addCommand("⚙️ Opções", "openOptions");
                    this.addCommand("🏠 Tela de Título", "toTitle");
                    this.addCommand("🚪 Fechar Menu", "exitMenu");
                    break;
                default:
                    this.addCommand("🚪 Fechar Menu", "exitMenu");
                    break;
            }
        }
    }

    class Scene_XianxiaTabbedMenu extends Scene_MenuBase {
        createCancelButton() {
            // Sobrescreve para remover completamente o botão flutuante de voltar do canto superior direito
        }

        create() {
            super.create();
            if (this._cancelButton) {
                this._cancelButton.visible = false;
                if (this._cancelButton.parent) {
                    this._cancelButton.parent.removeChild(this._cancelButton);
                }
                this._cancelButton = null;
            }

            const topRect = new Rectangle(16, 10, Graphics.boxWidth - 32, 68);
            this._topTabs = new Window_XianxiaTopTabs(topRect);

            const contentRect = new Rectangle(16, 82, Graphics.boxWidth - 32, Graphics.boxHeight - 168);
            this._contentWin = new Window_XianxiaTabContent(contentRect);

            const subRect = new Rectangle(16, Graphics.boxHeight - 82, Graphics.boxWidth - 32, 68);
            this._subActions = new Window_XianxiaSubActions(subRect);

            // Handlers das Abas Superiores (navegação direta pelo mouse)
            const tabs = ["inventory", "physiology", "cultivation", "skills", "map", "quests", "relationships", "system"];
            tabs.forEach(t => {
                this._topTabs.setHandler(t, () => {
                    this._contentWin.setTab(t);
                    this._subActions.setTab(t);
                    if (!TouchInput.isTriggered() && !TouchInput.isClicked()) {
                        // Se navegou pelo teclado (Enter), foca nos botões inferiores
                        this._topTabs.deactivate();
                        this._subActions.activate();
                    } else {
                        // Se clicou com o mouse, mantém ambas as janelas responsivas
                        this._topTabs.activate();
                    }
                });
            });
            this._topTabs.setHandler("cancel", this.popScene.bind(this));

            // Atualiza a aba em tempo real ao mover o cursor no topo
            const origSelect = this._topTabs.select.bind(this._topTabs);
            this._topTabs.select = (index) => {
                origSelect(index);
                const sym = this._topTabs.commandSymbol(index);
                if (sym && this._contentWin && this._subActions) {
                    this._contentWin.setTab(sym);
                    this._subActions.setTab(sym);
                }
            };

            this.bindSubActionHandlers();

            this.addWindow(this._topTabs);
            this.addWindow(this._contentWin);
            this.addWindow(this._subActions);

            const startTab = Scene_XianxiaTabbedMenu._initialTab || "inventory";
            const startIdx = Math.max(0, tabs.indexOf(startTab));
            this._topTabs.select(startIdx);
            this._contentWin.setTab(tabs[startIdx]);
            this._subActions.setTab(tabs[startIdx]);
            this._topTabs.activate();
            this._subActions.deactivate();
        }

        update() {
            super.update();
            if (this.isBusy()) return;

            // Clique com o botão direito em qualquer área fecha o menu imediatamente
            if (TouchInput.isCancelled()) {
                TouchInput.clear();
                SoundManager.playCancel();
                this.popScene();
                return;
            }

            // Navegação fluida pelo teclado (Cima/Baixo alterna entre as abas e botões inferiores)
            if (this._topTabs.active && Input.isRepeated("down")) {
                this._topTabs.deactivate();
                this._subActions.activate();
                SoundManager.playCursor();
            } else if (this._subActions.active && Input.isRepeated("up")) {
                this._subActions.deactivate();
                this._topTabs.activate();
                SoundManager.playCursor();
            }
        }

        bindSubActionHandlers() {
            const cs = $gameSystem.cultivation();
            const refreshAll = () => {
                this._contentWin.refresh();
                this._subActions.refresh();
            };

            this._subActions.setHandler("cancel", () => {
                this._subActions.deactivate();
                this._topTabs.activate();
            });

            // Inventário
            this._subActions.setHandler("useTestingStone", () => {
                cs.useTestingStone();
                refreshAll();
            });
            this._subActions.setHandler("takeQiPill", () => {
                cs.consumePill("qi");
                refreshAll();
            });
            this._subActions.setHandler("takeCalmingPill", () => {
                cs.consumePill("calming");
                refreshAll();
            });
            this._subActions.setHandler("gatherMaterials", () => {
                cs.gatherWorldMaterials();
                refreshAll();
            });

            // Fisiologia & Descoberta
            this._subActions.setHandler("inspectAppearance", () => {
                cs.inspectOwnAppearance();
                refreshAll();
            });
            this._subActions.setHandler("investigateFamily", () => {
                cs.investigateFamilyAndClan();
                refreshAll();
            });
            this._subActions.setHandler("probeMeridians", () => {
                cs.probeInternalMeridians();
                refreshAll();
            });
            this._subActions.setHandler("absorbHumanHeritage", () => {
                const pool = ["true_dragon", "cosmic_phoenix", "qilin_sacred", "immortal_emperor"];
                const pick = pool[Math.floor(Math.random() * pool.length)];
                cs.absorbHeritage(pick);
                refreshAll();
            });
            this._subActions.setHandler("refineBloodline", () => {
                cs.refineBeastCoreForPurity();
                refreshAll();
            });

            // Configuração de Cultivo
            this._subActions.setHandler("cycleTechnique", () => {
                const idx = CULTIVATION_TECHNIQUES.findIndex(t => t.id === cs.activeTechniqueId);
                const next = CULTIVATION_TECHNIQUES[(idx + 1) % CULTIVATION_TECHNIQUES.length];
                cs.activeTechniqueId = next.id;
                cs.addToast(`📖 Técnica de Cultivo alterada para: [${next.name}]`, "#81ecec");
                SoundManager.playEquip();
                refreshAll();
            });
            this._subActions.setHandler("cycleFocus", () => {
                const modes = ["balanced", "qi", "body", "soul"];
                const idx = modes.indexOf(cs.cultivationFocus);
                cs.cultivationFocus = modes[(idx + 1) % modes.length];
                SoundManager.playCursor();
                refreshAll();
            });
            this._subActions.setHandler("breakthroughAll", () => {
                let broke = cs.attemptBreakthrough("qi");
                if (!broke) broke = cs.attemptBreakthrough("body");
                if (!broke) broke = cs.attemptBreakthrough("soul");
                if (!broke) {
                    cs.addToast("⚠️ Nenhum gargalo pronto para rompimento no momento. Continue cultivando!", "#fab1a0");
                    SoundManager.playBuzzer();
                }
                refreshAll();
            });
            this._subActions.setHandler("deployArray", () => {
                cs.deployGroundArray();
                refreshAll();
            });

            // Perícias Skyrim
            this._subActions.setHandler("craftQiPill", () => {
                cs.craftAlchemyPill("qi");
                refreshAll();
            });
            this._subActions.setHandler("craftCalmingPill", () => {
                cs.craftAlchemyPill("calming");
                refreshAll();
            });
            this._subActions.setHandler("practiceSmithing", () => {
                cs.forgeSpiritArtifact();
                refreshAll();
            });
            this._subActions.setHandler("toggleMeditation", () => {
                cs.isMeditating = !cs.isMeditating;
                this.popScene();
            });

            // Mapa & Relacionamentos
            this._subActions.setHandler("openProceduralMap", () => {
                if (globalThis.Scene_WorldMap) {
                    SceneManager.push(globalThis.Scene_WorldMap);
                } else {
                    SoundManager.playOk();
                    refreshAll();
                }
            });
            this._subActions.setHandler("consultMaster", () => {
                cs.reveal("constitution", "Diagnóstico do Ancião Espiritual");
                cs.reveal("anatomy", "Avaliação do Ancião Espiritual");
                refreshAll();
            });

            // Quests
            this._subActions.setHandler("refreshQuests", () => {
                refreshAll();
            });

            // Sistema
            this._subActions.setHandler("saveGame", () => {
                SceneManager.push(Scene_Save);
            });
            this._subActions.setHandler("openOptions", () => {
                SceneManager.push(Scene_Options);
            });
            this._subActions.setHandler("toTitle", () => {
                SceneManager.goto(Scene_Title);
            });
            this._subActions.setHandler("exitMenu", () => {
                this.popScene();
            });
        }
    }

    Scene_XianxiaTabbedMenu._initialTab = "inventory";

    // =========================================================================
    // 7. REGISTRO DE COMANDOS DE PLUGIN & API GLOBAL
    // =========================================================================

    PluginManager.registerCommand(pluginName, "startMeditation", () => {
        if ($gameSystem && $gameSystem.cultivation) {
            $gameSystem.cultivation().isMeditating = true;
        }
    });

    PluginManager.registerCommand(pluginName, "stopMeditation", () => {
        if ($gameSystem && $gameSystem.cultivation) {
            $gameSystem.cultivation().isMeditating = false;
        }
    });

    PluginManager.registerCommand(pluginName, "openCultivationMenu", args => {
        Scene_XianxiaTabbedMenu._initialTab = String(args.tab || "cultivation");
        SceneManager.push(Scene_XianxiaTabbedMenu);
    });

    PluginManager.registerCommand(pluginName, "revealTrait", args => {
        if ($gameSystem && $gameSystem.cultivation) {
            $gameSystem.cultivation().reveal(String(args.trait || "race"));
        }
    });

    PluginManager.registerCommand(pluginName, "grantHeritage", args => {
        if ($gameSystem && $gameSystem.cultivation) {
            $gameSystem.cultivation().absorbHeritage(String(args.bloodlineId || "true_dragon"));
        }
    });

    PluginManager.registerCommand(pluginName, "triggerEpiphany", args => {
        if ($gameSystem && $gameSystem.cultivation) {
            $gameSystem.cultivation().triggerEpiphany(String(args.realmType || "qi"), String(args.message || ""));
        }
    });

    PluginManager.registerCommand(pluginName, "addQiExp", args => {
        if ($gameSystem && $gameSystem.cultivation) {
            $gameSystem.cultivation().addQiExp(Number(args.amount || 150));
        }
    });

    PluginManager.registerCommand(pluginName, "addSkillExp", args => {
        if ($gameSystem && $gameSystem.cultivation) {
            $gameSystem.cultivation().addSkillExp(String(args.skill || "meditation"), Number(args.exp || 60));
        }
    });

    globalThis.CultivationCore = {
        getSystem: () => $gameSystem ? $gameSystem.cultivation() : null,
        revealTrait: (trait, reason) => $gameSystem && $gameSystem.cultivation().reveal(trait, reason),
        absorbHeritage: (bloodlineId) => $gameSystem && $gameSystem.cultivation().absorbHeritage(bloodlineId),
        triggerEpiphany: (track, msg) => $gameSystem && $gameSystem.cultivation().triggerEpiphany(track, msg),
        addQi: (amount) => $gameSystem && $gameSystem.cultivation().addQiExp(amount),
        addSkillExp: (skill, exp) => $gameSystem && $gameSystem.cultivation().addSkillExp(skill, exp),
        openMenu: (tab = "inventory") => {
            Scene_XianxiaTabbedMenu._initialTab = tab;
            SceneManager.push(Scene_XianxiaTabbedMenu);
        }
    };

})();
