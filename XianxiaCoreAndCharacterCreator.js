//=============================================================================
// RPG Maker MZ - XianxiaCoreAndCharacterCreator.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc [v1.0.0] Núcleo Xianxia: Criador de Personagem Realista (Loteria do Nascimento), Conector LLM Local e Sistema de Afinidades/Técnicas.
 * @author Antigravity (DeepMind Pair Programming)
 *
 * @help
 * ============================================================================
 *               XIANXIA CORE & REALISTIC CHARACTER CREATOR
 * ============================================================================
 * - Ao iniciar um 'Novo Jogo', abre automaticamente a tela do Destino Natal.
 * - O jogador escolhe o Nome (ou sorteia).
 * - O destino sorteia Raça, Berço Familiar, Linhagem Ancestral, Constituição
 *   Física e Afinidades Elementais com probabilidades realistas (maioria plebeia/comum).
 * - O jogador inicia o jogo sozinho (grupo com apenas 1 membro).
 * - Conector universal com LLM Local (Ollama: 11434 / LM Studio: 1234) + Fallback
 *   Procedural completo para funcionamento 100% offline.
 *
 * @param OllamaEndpoint
 * @text URL do Ollama
 * @type string
 * @default http://localhost:11434
 *
 * @param LMStudioEndpoint
 * @text URL do LM Studio
 * @type string
 * @default http://localhost:1234
 *
 * @param DefaultModel
 * @text Modelo Padrão do LLM
 * @type string
 * @default qwen2.5:latest
 *
 * @command openCharacterCreator
 * @text Abrir Criador de Personagem
 * @desc Força a abertura da cena de nascimento do personagem.
 */

(() => {
    "use strict";

    const pluginName = "XianxiaCoreAndCharacterCreator";
    const params = PluginManager.parameters(pluginName);

    const ollamaUrl = String(params["OllamaEndpoint"] || "http://localhost:11434");
    const lmStudioUrl = String(params["LMStudioEndpoint"] || "http://localhost:1234");
    const defaultModel = String(params["DefaultModel"] || "qwen2.5:latest");

    // =========================================================================
    // 1. CONECTOR UNIVERSAL LLM LOCAL COM FALLBACK PROCEDURAL
    // =========================================================================

    class LocalLLMConnector {
        static _cachedEndpoint = null;
        static _activeModel = defaultModel;

        static async detectEndpoint() {
            if (this._cachedEndpoint) return this._cachedEndpoint;

            // 1. Testa Ollama
            try {
                const res = await fetch(`${ollamaUrl}/api/tags`, { method: "GET" });
                if (res.ok) {
                    const data = await res.json();
                    if (data.models && data.models.length > 0) {
                        this._activeModel = data.models[0].name;
                    }
                    this._cachedEndpoint = { type: "ollama", url: ollamaUrl };
                    console.log(`[Xianxia LLM] Ollama detectado com sucesso. Modelo ativo: ${this._activeModel}`);
                    return this._cachedEndpoint;
                }
            } catch (e) { /* Ollama offline */ }

            // 2. Testa LM Studio / OpenAI compatível
            try {
                const res = await fetch(`${lmStudioUrl}/v1/models`, { method: "GET" });
                if (res.ok) {
                    this._cachedEndpoint = { type: "lmstudio", url: lmStudioUrl };
                    console.log("[Xianxia LLM] LM Studio detectado com sucesso.");
                    return this._cachedEndpoint;
                }
            } catch (e) { /* LM Studio offline */ }

            console.log("[Xianxia LLM] Servidores locais offline. Utilizando motor procedural de fallback.");
            this._cachedEndpoint = { type: "fallback" };
            return this._cachedEndpoint;
        }

        static async generate(prompt, systemPrompt = "Você é o Mestre Narrador de um RPG Imortal Xianxia/Wuxia realista. Responda em Português.") {
            const endpoint = await this.detectEndpoint();

            if (endpoint.type === "ollama") {
                try {
                    const res = await fetch(`${endpoint.url}/api/generate`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            model: this._activeModel,
                            prompt: prompt,
                            system: systemPrompt,
                            stream: false
                        })
                    });
                    if (res.ok) {
                        const json = await res.json();
                        return json.response;
                    }
                } catch (e) {
                    console.warn("[Xianxia LLM] Falha na chamada Ollama, acionando fallback.");
                }
            } else if (endpoint.type === "lmstudio") {
                try {
                    const res = await fetch(`${endpoint.url}/v1/chat/completions`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            messages: [
                                { role: "system", content: systemPrompt },
                                { role: "user", content: prompt }
                            ],
                            temperature: 0.7
                        })
                    });
                    if (res.ok) {
                        const json = await res.json();
                        return json.choices[0].message.content;
                    }
                } catch (e) {
                    console.warn("[Xianxia LLM] Falha na chamada LM Studio, acionando fallback.");
                }
            }

            return null; // Aciona o gerador procedural
        }
    }

    globalThis.LocalLLMConnector = LocalLLMConnector;

    // =========================================================================
    // 2. TABELAS REALISTAS DO DESTINO NATAL (A LOTERIA DO NASCIMENTO)
    // =========================================================================

    const RACES = [
        { id: "human", name: "Humano", weight: 75, desc: "A raça mais adaptável do mundo mortal. Sem grandes vantagens inatas, mas com potencial ilimitado de ascensão.", sprite: "Actor1", face: "Actor1", faceIdx: 0, charIdx: 0 },
        { id: "yao", name: "Meio-Besta (Yao)", weight: 14, desc: "Descendente de feras espirituais. Vitalidade exuberante e sentidos aguçados, com temperamento instintivo.", sprite: "People4", face: "People4", faceIdx: 2, charIdx: 2 },
        { id: "asura", name: "Sangue Demoníaco", weight: 7, desc: "Linhagem temida com energia corrosiva e instinto de combate selvagem. Perigoso para seitas ortodoxas.", sprite: "Evil", face: "Evil", faceIdx: 0, charIdx: 0 },
        { id: "spirit", name: "Espírito Feérico", weight: 4, desc: "Nascido da coalescência de Qi vegetal e elemental. Afinidade inata altíssima com o Dao natural.", sprite: "Nature", face: "Nature", faceIdx: 0, charIdx: 0 }
    ];

    const SOCIAL_BACKGROUNDS = [
        { id: "orphan", name: "Órfão / Mendigo Miserável", weight: 40, gold: 5, items: [], desc: "Você nasceu no degrau mais baixo da sociedade. Cada migalha de Qi e comida foi conquistada à força." },
        { id: "peasant", name: "Família Camponesa Comum", weight: 35, gold: 50, items: [], desc: "Filho de lavradores da periferia. Vida simples sem conhecimentos marciais, mas com vigor rústico." },
        { id: "merchant", name: "Família de Mercadores", weight: 15, gold: 350, items: ["Pílula Nutritiva de Qi"], desc: "Comércio de província. Você cresceu vendo moedas e remédios básicos, entendendo o valor dos recursos." },
        { id: "martial_clan", name: "Clã Marcial Menor", weight: 8, gold: 1200, items: ["Pílula de Jade", "Espada de Ferro Negro"], desc: "Família de guerreiros mortais locais. Seus membros praticam técnicas básicas de respiração." },
        { id: "ancient_sect", name: "Herdeiro de Clã Imortal", weight: 2, gold: 5000, items: ["Pílula Espiritual Celestial", "Túnica de Seda da Névoa"], desc: "Nascimento abençoado entre os nobres do cultivo. Cercado de tesouros, mas com grandes expectativas e rivais." }
    ];

    const BLOODLINES = [
        { id: "none", name: "Sangue Mortal Comum", weight: 78, bonus: {}, desc: "Nenhuma herança mística no sangue. Seu Dao será esculpido unicamente por sua força de vontade." },
        { id: "faint_beast", name: "Linhagem de Fera Silvestre Diluída", weight: 12, bonus: { mhp: 150, atk: 15 }, desc: "Um sopro remoto de sangue lupino ou ursino que reforça o vigor muscular." },
        { id: "azure_dragon", name: "Linhagem do Dragão Azure", weight: 3, bonus: { mhp: 400, def: 35, mat: 30 }, desc: "O sangue do soberano dos mares e trovões corre nas suas veias. Vitalidade regenerativa prodigiosa." },
        { id: "crimson_phoenix", name: "Linhagem da Fênix Carmesim", weight: 3, bonus: { mmp: 250, mat: 50, agi: 20 }, desc: "Fogo sagrado imortal. Acelera a purificação de impurezas e potencializa o Qi de fogo." },
        { id: "primordial_sage", name: "Linhagem do Sábio Primordial", weight: 2, bonus: { mmp: 400, mat: 40, mdf: 40, luk: 30 }, desc: "Descendência direta de um soberano que alcançou a Imortalidade. Harmonia suprema com as Leis." },
        { id: "white_tiger", name: "Linhagem do Tigre do Massacre", weight: 2, bonus: { atk: 60, agi: 35, luk: 20 }, desc: "Aura assassina natural de metal cortante. Seus ataques ignoram parte da defesa adversária." }
    ];

    const CONSTITUTIONS = [
        { id: "mortal", name: "Corpo Mortal Rústico", weight: 65, penalty: null, desc: "Constituição física convencional, sem bênçãos celestiais nem deformidades graves." },
        { id: "blocked", name: "Meridianos Obstruídos (Doentio)", weight: 15, penalty: "qi_cost", desc: "Meridianos estreitos e impuros de nascença. Exige mais Qi e esforço árduo para cada avanço." },
        { id: "pure_vessel", name: "Vaso Espiritual Puro", weight: 8, penalty: null, desc: "Canais de Qi naturalmente desobstruídos. Facilidade enorme na absorção de energia ambiental." },
        { id: "extreme_yin", name: "Constituição Yin Extrema", weight: 4, penalty: "fire_clash", desc: "Frio ártico permanente nos órgãos vitais. Soberania no gelo e água, mas severo atrito com o fogo." },
        { id: "solar_yang", name: "Constituição Solar Yang", weight: 4, penalty: "water_clash", desc: "Calor vulcânico nas artérias. Força destrutiva avassaladora de chamas, com aversão a artes aquáticas." },
        { id: "innate_sword", name: "Corpo da Espada Innata", weight: 4, penalty: null, desc: "Ossos e tendões afiados como lâminas espirituais. Afinidade máxima com esgrima e técnicas perfurantes." }
    ];

    const ELEMENTS = ["fire", "water", "wood", "earth", "metal", "thunder", "ice", "yin", "yang"];
    const ELEMENT_NAMES = {
        fire: "Fogo", water: "Água", wood: "Madeira", earth: "Terra", metal: "Metal",
        thunder: "Trovão", ice: "Gelo", yin: "Yin (Trevas)", yang: "Yang (Luz)"
    };

    function weightedRandom(list) {
        let total = list.reduce((sum, item) => sum + item.weight, 0);
        let rand = Math.random() * total;
        for (let item of list) {
            if (rand < item.weight) return item;
            rand -= item.weight;
        }
        return list[0];
    }

    function generateRealisticBirth() {
        const race = weightedRandom(RACES);
        const bg = weightedRandom(SOCIAL_BACKGROUNDS);
        const blood = weightedRandom(BLOODLINES);
        const consti = weightedRandom(CONSTITUTIONS);

        // Gera afinidades elementais realistas (a maioria entre 5% e 40%, raros picos em elementos afins)
        const affinities = {};
        for (let el of ELEMENTS) {
            let base = Math.floor(Math.random() * 35) + 5;
            if (blood.id === "azure_dragon" && (el === "water" || el === "thunder")) base += 45;
            if (blood.id === "crimson_phoenix" && el === "fire") base += 55;
            if (blood.id === "white_tiger" && el === "metal") base += 50;
            if (consti.id === "extreme_yin" && (el === "ice" || el === "water" || el === "yin")) base += 50;
            if (consti.id === "extreme_yin" && el === "fire") base = Math.max(1, base - 25);
            if (consti.id === "solar_yang" && (el === "fire" || el === "yang")) base += 50;
            if (consti.id === "solar_yang" && el === "water") base = Math.max(1, base - 25);
            if (consti.id === "pure_vessel") base += 18;
            affinities[el] = Math.max(1, Math.min(100, base));
        }

        // Escolhe o elemento com maior afinidade como o caminho inicial natural
        let primaryElement = "fire";
        let maxAff = -1;
        for (let el in affinities) {
            if (affinities[el] > maxAff) {
                maxAff = affinities[el];
                primaryElement = el;
            }
        }

        return {
            race,
            background: bg,
            bloodline: blood,
            constitution: consti,
            affinities,
            chosenPath: primaryElement
        };
    }

    // =========================================================================
    // 3. PERSISTÊNCIA NO GAME_ACTOR E GAME_SYSTEM
    // =========================================================================

    const _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _Game_Actor_setup.call(this, actorId);
        if (actorId === 1 && !this._xianxiaBirthData) {
            this._xianxiaBirthData = generateRealisticBirth();
            this._xianxiaTrainedAffinities = { ...this._xianxiaBirthData.affinities };
            this._xianxiaTechniques = [];
        }
    };

    Game_Actor.prototype.xianxiaBirth = function() {
        if (!this._xianxiaBirthData) {
            this._xianxiaBirthData = generateRealisticBirth();
            this._xianxiaTrainedAffinities = { ...this._xianxiaBirthData.affinities };
            this._xianxiaTechniques = [];
        }
        return this._xianxiaBirthData;
    };

    Game_Actor.prototype.trainedAffinities = function() {
        if (!this._xianxiaTrainedAffinities) {
            this._xianxiaTrainedAffinities = { ...this.xianxiaBirth().affinities };
        }
        return this._xianxiaTrainedAffinities;
    };

    Game_Actor.prototype.trainElementalAffinity = function(element, points = 1) {
        const affs = this.trainedAffinities();
        const birth = this.xianxiaBirth();
        let penalty = 1.0;

        if (birth.constitution.penalty === "fire_clash" && element === "fire") penalty = 0.35;
        if (birth.constitution.penalty === "water_clash" && element === "water") penalty = 0.35;
        if (birth.constitution.penalty === "qi_cost") penalty = 0.65;

        const delta = Math.max(0.1, +(points * penalty).toFixed(2));
        affs[element] = Math.min(100, +(affs[element] + delta).toFixed(2));
        return delta;
    };

    // =========================================================================
    // 4. CENA DO CRIADOR DE PERSONAGEM (A RODA DO DESTINO NATAL)
    // =========================================================================

    class Window_CharacterCreatorCommand extends Window_HorzCommand {
        makeCommandList() {
            this.addCommand("🎲 Rolar Nascimento", "reroll");
            this.addCommand("✏️ Trocar Nome", "name");
            this.addCommand("☯️ Mudar Caminho", "path");
            this.addCommand("✨ Aceitar e Iniciar", "accept");
        }
        maxCols() {
            return 4;
        }
    }

    class Scene_CharacterCreator extends Scene_MenuBase {
        create() {
            super.create();
            this._birthData = generateRealisticBirth();
            this._playerName = "Xiao Fan";
            this.createWindows();
        }

        createBackground() {
            this._bgSprite = new Sprite();
            this._bgSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
            const ctx = this._bgSprite.bitmap.context;
            const grad = ctx.createLinearGradient(0, 0, 0, Graphics.height);
            grad.addColorStop(0, "#080c16");
            grad.addColorStop(0.6, "#101626");
            grad.addColorStop(1, "#04060b");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, Graphics.width, Graphics.height);
            this._bgSprite.bitmap._baseTexture.update();
            this._backgroundSprite = this._bgSprite;
            this.addChild(this._bgSprite);
        }

        needsCancelButton() {
            return false;
        }

        needsPageButtons() {
            return false;
        }

        start() {
            super.start();
            this.startFadeIn(this.fadeSpeed(), false);
        }

        createWindows() {
            const w = Graphics.boxWidth;
            const h = Graphics.boxHeight;

            // Janela do Título do Samsara
            const titleRect = new Rectangle(0, 10, w, 60);
            this._titleWindow = new Window_Base(titleRect);
            this._titleWindow.contents.fontSize = 22;
            this._titleWindow.drawText("⚡ RODA DA REENCARNAÇÃO: O DESTINO DO SEU NASCIMENTO ⚡", 0, 4, w - 32, "center");
            this.addWindow(this._titleWindow);

            // Janela de Informações do Destino (Esquerda)
            const leftW = Math.floor(w * 0.58);
            const cmdH = this.calcWindowHeight(1, true);
            const bodyH = h - 85 - cmdH - 15;
            const leftRect = new Rectangle(0, 75, leftW, bodyH);
            this._destinyWindow = new Window_Base(leftRect);
            this.addWindow(this._destinyWindow);

            // Janela de Afinidades e Escolha de Caminho (Direita)
            const rightW = w - leftW;
            const rightRect = new Rectangle(leftW, 75, rightW, bodyH);
            this._affinityWindow = new Window_Base(rightRect);
            this.addWindow(this._affinityWindow);

            // Janela de Comandos Inferiores
            const cmdRect = new Rectangle(0, h - cmdH - 10, w, cmdH);
            this._commandWindow = new Window_CharacterCreatorCommand(cmdRect);
            this._commandWindow.setHandler("reroll", this.onReroll.bind(this));
            this._commandWindow.setHandler("name", this.onChangeName.bind(this));
            this._commandWindow.setHandler("path", this.onChangePath.bind(this));
            this._commandWindow.setHandler("accept", this.onAccept.bind(this));
            this.addWindow(this._commandWindow);
            this._commandWindow.select(0);
            this._commandWindow.activate();

            this.refreshAll();
        }

        refreshAll() {
            this.refreshDestiny();
            this.refreshAffinities();
        }

        refreshDestiny() {
            const win = this._destinyWindow;
            win.contents.clear();
            const b = this._birthData;

            let y = 0;
            const lh = 28;

            win.changeTextColor(ColorManager.systemColor());
            win.drawText("Identidade Mortal:", 0, y, 160);
            win.changeTextColor("#ffd43b");
            win.drawText(this._playerName, 150, y, 200);
            y += lh;

            win.changeTextColor(ColorManager.systemColor());
            win.drawText("Raça Determinada:", 0, y, 160);
            win.resetTextColor();
            win.drawText(b.race.name, 150, y, 200);
            y += lh - 4;
            win.contents.fontSize = 15;
            win.changeTextColor("#adb5bd");
            win.drawText(b.race.desc, 0, y, win.innerWidth);
            win.resetFontSettings();
            y += lh + 6;

            win.changeTextColor(ColorManager.systemColor());
            win.drawText("Berço Familiar:", 0, y, 160);
            win.resetTextColor();
            win.drawText(`${b.background.name} (${b.background.gold} Taéis)`, 150, y, win.innerWidth - 150);
            y += lh - 4;
            win.contents.fontSize = 15;
            win.changeTextColor("#adb5bd");
            win.drawText(b.background.desc, 0, y, win.innerWidth);
            win.resetFontSettings();
            y += lh + 6;

            win.changeTextColor(ColorManager.systemColor());
            win.drawText("Linhagem Ancestral:", 0, y, 160);
            win.changeTextColor(b.bloodline.id === "none" ? "#ced4da" : "#ff8787");
            win.drawText(b.bloodline.name, 150, y, win.innerWidth - 150);
            y += lh - 4;
            win.contents.fontSize = 15;
            win.changeTextColor("#adb5bd");
            win.drawText(b.bloodline.desc, 0, y, win.innerWidth);
            win.resetFontSettings();
            y += lh + 6;

            win.changeTextColor(ColorManager.systemColor());
            win.drawText("Constituição Física:", 0, y, 160);
            win.changeTextColor(b.constitution.id === "blocked" ? "#ff8787" : (b.constitution.id === "mortal" ? "#ced4da" : "#63e6be"));
            win.drawText(b.constitution.name, 150, y, win.innerWidth - 150);
            y += lh - 4;
            win.contents.fontSize = 15;
            win.changeTextColor("#adb5bd");
            win.drawText(b.constitution.desc, 0, y, win.innerWidth);
            win.resetFontSettings();
        }

        refreshAffinities() {
            const win = this._affinityWindow;
            win.contents.clear();
            const b = this._birthData;

            let y = 0;
            const lh = 26;

            win.changeTextColor("#ffd43b");
            win.drawText("Afinidades Elementais Inatas:", 0, y, win.innerWidth);
            y += lh;

            win.contents.fontSize = 16;
            for (let el of ELEMENTS) {
                const val = b.affinities[el];
                const isChosen = b.chosenPath === el;

                win.changeTextColor(isChosen ? "#ffd43b" : "#ced4da");
                win.drawText(`${isChosen ? "★ " : "  "}${ELEMENT_NAMES[el]}:`, 0, y, 120);

                // Barra de afinidade
                const barX = 130;
                const barW = win.innerWidth - 180;
                win.contents.fillRect(barX, y + 4, barW, 10, "rgba(0,0,0,0.6)");
                const barColor = isChosen ? "#ffd43b" : (val >= 60 ? "#63e6be" : "#4dabf7");
                win.contents.fillRect(barX, y + 4, Math.floor(barW * (val / 100)), 10, barColor);

                win.drawText(`${val}%`, win.innerWidth - 42, y, 40, "right");
                y += 22;
            }
            win.resetFontSettings();

            y += 8;
            win.changeTextColor("#63e6be");
            win.drawText(`Caminho Escolhido: ${ELEMENT_NAMES[b.chosenPath]}`, 0, y, win.innerWidth);
            y += lh - 4;
            win.contents.fontSize = 14;
            win.changeTextColor("#adb5bd");
            win.drawText("Mesmo com afinidade baixa, você pode cultivar", 0, y, win.innerWidth);
            y += 18;
            win.drawText("qualquer elemento superando o destino com esforço!", 0, y, win.innerWidth);
            win.resetFontSettings();
        }

        onReroll() {
            this._birthData = generateRealisticBirth();
            SoundManager.playCursor();
            this.refreshAll();
            this._commandWindow.activate();
        }

        onChangeName() {
            const names = ["Xiao Fan", "Lin Dong", "Han Li", "Su Chen", "Meng Hao", "Bai Xiaochun", "Ye Fan", "Lu Zhou", "Gu Hai", "Feng Xi"];
            const currentIdx = names.indexOf(this._playerName);
            this._playerName = names[(currentIdx + 1) % names.length];
            SoundManager.playCursor();
            this.refreshDestiny();
            this._commandWindow.activate();
        }

        onChangePath() {
            const curIdx = ELEMENTS.indexOf(this._birthData.chosenPath);
            this._birthData.chosenPath = ELEMENTS[(curIdx + 1) % ELEMENTS.length];
            SoundManager.playCursor();
            this.refreshAffinities();
            this._commandWindow.activate();
        }

        onAccept() {
            // Aplica os dados de nascimento ao Protagonista (Ator 1)
            const actor = $gameParty.leader() || $gameActors.actor(1);
            if (actor) {
                actor.setName(this._playerName);
                actor._xianxiaBirthData = this._birthData;
                actor._xianxiaTrainedAffinities = { ...this._birthData.affinities };
                actor.setCharacterImage(this._birthData.race.sprite, this._birthData.race.charIdx);
                actor.setFaceImage(this._birthData.race.face, this._birthData.race.faceIdx);
                $gamePlayer.refresh();

                // Aplica ouro inicial da família
                $gameParty._gold = this._birthData.background.gold;

                // Garante que o jogador inicia SOLO no grupo
                $gameParty._actors = [actor.actorId()];
            }

            SoundManager.playOk();
            this.fadeOutAll();
            SceneManager.goto(Scene_Map);
        }
    }

    globalThis.Scene_CharacterCreator = Scene_CharacterCreator;

    // =========================================================================
    // 5. HOOK NO INÍCIO DE NOVO JOGO (SCENE_TITLE)
    // =========================================================================

    Scene_Title.prototype.commandNewGame = function() {
        DataManager.setupNewGame();
        this._commandWindow.close();
        this.fadeOutAll();
        SceneManager.goto(Scene_CharacterCreator);
    };

    const _Scene_Map_needsFadeIn = Scene_Map.prototype.needsFadeIn;
    Scene_Map.prototype.needsFadeIn = function() {
        return _Scene_Map_needsFadeIn.call(this) || SceneManager.isPreviousScene(Scene_CharacterCreator);
    };

    PluginManager.registerCommand(pluginName, "openCharacterCreator", () => {
        SceneManager.push(Scene_CharacterCreator);
    });

})();
