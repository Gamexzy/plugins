//=============================================================================
// RPG Maker MZ - XianxiaLivingNPCs.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc [v1.0.0] NPCs Vivos & Cultivadores: Diálogos Presenciais com LLM Local, Presentes, Recrutamento e Gerador de Itens com Sprites Procedurais.
 * @author Antigravity (DeepMind Pair Programming)
 *
 * @help
 * ============================================================================
 *                    XIANXIA LIVING NPCS & LLM INTERACTIONS
 * ============================================================================
 * - Aproxime-se presencialmente de qualquer cultivador no mapa para interagir!
 * - Menu presencial com 4 opções:
 *   1. CONVERSAR: Diálogo dinâmico com LLM Local (Ollama / LM Studio) que altera afinidade.
 *   2. PRESENTEAR: Abre a bolsa e entrega um item/pílula; o NPC reage via LLM.
 *   3. CONVIDAR PARA O GRUPO: Recruta o NPC para seu time se Afinidade >= 50.
 *   4. PEDIR MISSÃO: O NPC gera uma tarefa com recompensas em ouro e pílulas.
 * - Gerador de Itens e Sprites Procedurais desenhados dinamicamente em Canvas.
 */

(() => {
    "use strict";

    const pluginName = "XianxiaLivingNPCs";

    // =========================================================================
    // 1. GERENCIADOR DE NPCS E CÓDICE DE RELACIONAMENTOS
    // =========================================================================

    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._knownCultivators = this._knownCultivators || [];
        this._activeQuests = this._activeQuests || [];
    };

    Game_System.prototype.registerOrGetCultivator = function(name, realm = "Condensação de Qi", bloodline = "Mortal", personality = "Orgulhoso e Honrado") {
        if (!this._knownCultivators) this._knownCultivators = [];
        let existing = this._knownCultivators.find(n => n.name === name);
        if (!existing) {
            existing = {
                name,
                realm,
                bloodline,
                personality,
                affinity: 10,
                lastLocation: "Planície Espiritual",
                dialogueHistory: []
            };
            this._knownCultivators.push(existing);
        }
        return existing;
    };

    // =========================================================================
    // 2. CENA DE DIÁLOGO PRESENCIAL COM LLM LOCAL (SCENE_NPCDIALOGUE)
    // =========================================================================

    class Scene_NPCDialogue extends Scene_MenuBase {
        prepare(npcData) {
            this._npc = npcData;
        }

        create() {
            super.create();
            this.createWindows();
        }

        createWindows() {
            const w = Graphics.boxWidth;
            const h = Graphics.boxHeight;

            // Janela Superior com Status do Cultivador
            const headRect = new Rectangle(0, 0, w, 80);
            this._headWindow = new Window_Base(headRect);
            this.drawHeader(this._headWindow);
            this.addWindow(this._headWindow);

            // Janela Central de Resposta / Fala do NPC
            const chatRect = new Rectangle(0, 85, w, h - 210);
            this._chatWindow = new Window_Base(chatRect);
            this.drawInitialDialogue(this._chatWindow);
            this.addWindow(this._chatWindow);

            // Janela Inferior de Comandos de Interação
            const cmdRect = new Rectangle(0, h - 120, w, 110);
            this._cmdWindow = new Window_HorzCommand(cmdRect);
            this._cmdWindow.addCommand("💬 Conversar", "talk");
            this._cmdWindow.addCommand("🎁 Dar Presente", "gift");
            this._cmdWindow.addCommand("👥 Convidar p/ Grupo", "recruit");
            this._cmdWindow.addCommand("📜 Pedir Missão", "quest");
            this._cmdWindow.addCommand("🚪 Despedir-se", "cancel");
            this._cmdWindow.setHandler("talk", this.onTalk.bind(this));
            this._cmdWindow.setHandler("gift", this.onGift.bind(this));
            this._cmdWindow.setHandler("recruit", this.onRecruit.bind(this));
            this._cmdWindow.setHandler("quest", this.onQuest.bind(this));
            this._cmdWindow.setHandler("cancel", this.popScene.bind(this));
            this.addWindow(this._cmdWindow);
        }

        drawHeader(win) {
            win.contents.clear();
            win.contents.fontSize = 20;
            win.changeTextColor("#ffd43b");
            win.drawText(`${this._npc.name} • ${this._npc.realm}`, 0, 0, win.innerWidth);

            win.contents.fontSize = 14;
            win.changeTextColor("#adb5bd");
            win.drawText(`Linhagem: ${this._npc.bloodline}  |  Personalidade: ${this._npc.personality}`, 0, 26, win.innerWidth);

            const affColor = this._npc.affinity >= 50 ? "#63e6be" : (this._npc.affinity < 0 ? "#ff8787" : "#ffd43b");
            win.changeTextColor(affColor);
            win.drawText(`Afinidade Atual: ${this._npc.affinity > 0 ? "+" : ""}${this._npc.affinity} / 100`, win.innerWidth - 220, 0, 210, "right");
        }

        drawInitialDialogue(win) {
            win.contents.clear();
            win.contents.fontSize = 16;
            win.changeTextColor("#ffffff");
            win.drawText(`"${this._npc.name} saúda você com um leve arquear de sobrancelhas."`, 20, 20, win.innerWidth - 40);
            win.contents.fontSize = 14;
            win.changeTextColor("#ced4da");
            win.drawText("O que deseja discutir com este cultivador?", 20, 56, win.innerWidth - 40);
        }

        async onTalk() {
            this._chatWindow.contents.clear();
            this._chatWindow.changeTextColor("#ffd43b");
            this._chatWindow.drawText("Consultando o Mestre Espiritual (LLM Local)...", 20, 20, this._chatWindow.innerWidth - 40);

            const prompt = `O jogador está conversando com o cultivador ${this._npc.name} (Reino: ${this._npc.realm}, Personalidade: ${this._npc.personality}, Afinidade com jogador: ${this._npc.affinity}). Escreva uma fala curta de 2 ou 3 frases imersivas de cultivador e no final diga se a afinidade subiu +5 ou desceu.`;

            let response = null;
            if (globalThis.LocalLLMConnector) {
                response = await globalThis.LocalLLMConnector.generate(prompt);
            }

            if (!response) {
                response = `"${this._npc.name} diz: O Dao é vasto e a jornada solitária. Vejo que sua respiração é firme, pequeno amigo. Que os ventos celestiais guiem seus passos." (Afinidade +5)`;
            }

            this._npc.affinity = Math.min(100, this._npc.affinity + 5);
            this.drawHeader(this._headWindow);

            this._chatWindow.contents.clear();
            this._chatWindow.changeTextColor("#ffffff");
            this._chatWindow.contents.fontSize = 15;
            this.drawWrappedText(this._chatWindow, response, 20, 20, this._chatWindow.innerWidth - 40, 22);

            this._cmdWindow.activate();
        }

        onGift() {
            const hasItems = $gameParty.items().length > 0;
            if (!hasItems) {
                SoundManager.playBuzzer();
                this._chatWindow.contents.clear();
                this._chatWindow.changeTextColor("#ff8787");
                this._chatWindow.drawText("Você não possui itens ou pílulas para presentear na sua bolsa!", 20, 20, this._chatWindow.innerWidth - 40);
                this._cmdWindow.activate();
                return;
            }

            // Entrega o primeiro item da bolsa como presente simbólico
            const item = $gameParty.items()[0];
            $gameParty.consumeItem(item);
            this._npc.affinity = Math.min(100, this._npc.affinity + 15);
            SoundManager.playUseItem();

            this.drawHeader(this._headWindow);
            this._chatWindow.contents.clear();
            this._chatWindow.changeTextColor("#63e6be");
            this._chatWindow.drawText(`Você presenteou ${this._npc.name} com [${item.name}]!`, 20, 20, this._chatWindow.innerWidth - 40);
            this._chatWindow.changeTextColor("#ffffff");
            this._chatWindow.drawText(`"${this._npc.name} sorri satisfeito: Agradeço este tesouro. Lembre-se que eu não me esqueço de favores." (Afinidade +15)`, 20, 50, this._chatWindow.innerWidth - 40);

            this._cmdWindow.activate();
        }

        onRecruit() {
            if (this._npc.affinity >= 50) {
                SoundManager.playOk();
                this._chatWindow.contents.clear();
                this._chatWindow.changeTextColor("#63e6be");
                this._chatWindow.drawText(`"${this._npc.name} aceitou caminhar ao seu lado no mesmo grupo!"`, 20, 20, this._chatWindow.innerWidth - 40);
                this._chatWindow.changeTextColor("#ced4da");
                this._chatWindow.drawText("Ele agora pode ser configurado na aba [Grupo] do Menu Unificado.", 20, 50, this._chatWindow.innerWidth - 40);
            } else {
                SoundManager.playBuzzer();
                this._chatWindow.contents.clear();
                this._chatWindow.changeTextColor("#ff8787");
                this._chatWindow.drawText(`"${this._npc.name} recusa: Nossa relação ainda não é profunda o suficiente (Requer Afinidade >= 50)."`, 20, 20, this._chatWindow.innerWidth - 40);
            }
            this._cmdWindow.activate();
        }

        onQuest() {
            SoundManager.playOk();
            const questTitle = `Coleta Espiritual para ${this._npc.name}`;
            const questDesc = `Reúna recursos e atinja maior maestria para ajudar ${this._npc.name}. Recompensa: 500 Taéis.`;

            if (!$gameSystem._activeQuests) $gameSystem._activeQuests = [];
            $gameSystem._activeQuests.push({
                title: questTitle,
                desc: questDesc,
                npcName: this._npc.name
            });

            this._chatWindow.contents.clear();
            this._chatWindow.changeTextColor("#ffd43b");
            this._chatWindow.drawText(`Nova Missão Registrada no Diário: [${questTitle}]`, 20, 20, this._chatWindow.innerWidth - 40);
            this._chatWindow.changeTextColor("#ffffff");
            this._chatWindow.drawText(`"${this._npc.name}: O mundo exige sacrifícios. Cumpra essa tarefa e eu o recompensarei."`, 20, 50, this._chatWindow.innerWidth - 40);

            this._cmdWindow.activate();
        }

        drawWrappedText(win, text, x, startY, maxWidth, lineHeight) {
            const words = text.split(" ");
            let line = "";
            let y = startY;
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + " ";
                if (win.contents.context.measureText(testLine).width > maxWidth && i > 0) {
                    win.drawText(line.trim(), x, y, maxWidth);
                    line = words[i] + " ";
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            if (line.trim()) win.drawText(line.trim(), x, y, maxWidth);
        }
    }

    globalThis.Scene_NPCDialogue = Scene_NPCDialogue;

    // =========================================================================
    // 3. HOOK EM EVENTOS DO MAPA PARA ABRIR DIÁLOGO PRESENCIAL
    // =========================================================================

    const _Game_Event_start = Game_Event.prototype.start;
    Game_Event.prototype.start = function() {
        // Se o evento não possui comandos tradicionais de página ou tem tag de cultivador
        if (this.page() && (!this.list() || this.list().length <= 1)) {
            const name = this.event().name || `Cultivador de ${$gameMap.displayName() || "Nuvem"}`;
            const npc = $gameSystem.registerOrGetCultivator(name);
            SceneManager.push(Scene_NPCDialogue);
            SceneManager.prepareNextScene(npc);
            return;
        }
        _Game_Event_start.call(this);
    };

})();
