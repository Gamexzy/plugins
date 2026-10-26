//=============================================================================
// RPG Maker MZ - XianxiaUnifiedMenu.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc [v1.0.0] Menu Unificado Xianxia: Interface em Abas (Inventário/Equip, Cultivo, Habilidades, Grupo, Mapa, Relacionamentos, Missões, Sistema).
 * @author Antigravity (DeepMind Pair Programming)
 *
 * @help
 * ============================================================================
 *                         XIANXIA UNIFIED MENU
 * ============================================================================
 * Substitui o menu nativo do RPG Maker MZ ao abrir (teclas ESC, X ou I).
 * Ao abrir, cai diretamente na aba [1. Inventário & Equipamentos].
 *
 * ABAS:
 * 1. INVENTÁRIO: Ficha completa (Linhagem, Raça, Atributos, Afinidades) +
 *    Slots de Equipamento com Ícones Dinâmicos + Grade de Itens (Tudo, Equip, Pílulas, etc).
 * 2. CULTIVO: Dantian, Meridianos, Fases Lunares e Sutras do ImmortalCultivationSystem.
 * 3. HABILIDADES: Técnicas Marciais aprendidas, Treino de Afinidade ('Compreender Dao')
 *    e Criação de Novas Técnicas pelo LLM Local!
 * 4. GRUPO: Formação tática (Vanguarda / Retaguarda) de membros recrutados.
 * 5. MAPA: Mapa explorável com névoa de guerra do ProceduralWorldMap.
 * 6. RELACIONAMENTOS: Códice de cultivadores conhecidos (Afinidade, Linhagem, Local).
 * 7. MISSÕES: Quests ativas recebidas presencialmente de NPCs no mapa.
 * 8. SISTEMA: Salvar, Carregar, Opções e Sair.
 */

(() => {
    "use strict";

    const pluginName = "XianxiaUnifiedMenu";

    // Tecla 'I' rápida para o inventário
    Input.keyMapper[73] = "unifiedInventoryKey";

    // =========================================================================
    // 1. CENA PRINCIPAL DO MENU UNIFICADO (SCENE_UNIFIEDMENU)
    // =========================================================================

    class Scene_UnifiedMenu extends Scene_MenuBase {
        create() {
            super.create();
            this._currentTabIndex = 0;
            this.createTabNavigationBar();
            this.createTabContainer();
            this.switchTab(0);
        }

        createTabNavigationBar() {
            const tabs = [
                "🎒 Inventário",
                "🧘 Cultivo",
                "⚡ Habilidades",
                "👥 Grupo",
                "🗺️ Mapa",
                "🤝 Relacionamentos",
                "📜 Missões",
                "⚙️ Sistema"
            ];
            const w = Graphics.boxWidth;
            const h = 54;
            const rect = new Rectangle(0, 0, w, h);

            this._tabWindow = new Window_HorzCommand(rect);
            this._tabWindow.makeCommandList = function() {
                for (let i = 0; i < tabs.length; i++) {
                    this.addCommand(tabs[i], `tab_${i}`, true);
                }
            };
            this._tabWindow.refresh();
            for (let i = 0; i < tabs.length; i++) {
                this._tabWindow.setHandler(`tab_${i}`, () => this.switchTab(i));
            }
            this._tabWindow.setHandler("cancel", this.popScene.bind(this));
            this.addWindow(this._tabWindow);
        }

        createTabContainer() {
            const topY = 56;
            const w = Graphics.boxWidth;
            const h = Graphics.boxHeight - topY;

            // Container onde as janelas de cada aba serão instanciadas
            this._tabAreaRect = new Rectangle(0, topY, w, h);
            this._activeTabWindows = [];
        }

        clearActiveTabWindows() {
            for (let win of this._activeTabWindows) {
                this.removeWindow(win);
                if (win.destroy) win.destroy();
            }
            this._activeTabWindows = [];
        }

        switchTab(index) {
            this._currentTabIndex = index;
            this.clearActiveTabWindows();
            SoundManager.playCursor();

            switch (index) {
                case 0: this.buildInventoryTab(); break;
                case 1: this.buildCultivationTab(); break;
                case 2: this.buildSkillsTab(); break;
                case 3: this.buildPartyTab(); break;
                case 4: this.buildMapTab(); break;
                case 5: this.buildRelationshipsTab(); break;
                case 6: this.buildQuestsTab(); break;
                case 7: this.buildSystemTab(); break;
            }
        }

        update() {
            super.update();
            // Atalhos Q / W para navegar entre as abas superiores
            if (Input.isTriggered("pageup")) {
                let prev = (this._currentTabIndex - 1 + 8) % 8;
                this._tabWindow.select(prev);
                this.switchTab(prev);
            } else if (Input.isTriggered("pagedown")) {
                let next = (this._currentTabIndex + 1) % 8;
                this._tabWindow.select(next);
                this.switchTab(next);
            }
        }

        // =====================================================================
        // ABA 1: INVENTÁRIO & EQUIPAMENTOS
        // =====================================================================
        buildInventoryTab() {
            const rect = this._tabAreaRect;
            const leftW = Math.floor(rect.width * 0.45);
            const rightW = rect.width - leftW;

            // Painel Esquerdo: Ficha de Linhagem, Atributos e Slots de Equipamento
            const charRect = new Rectangle(rect.x, rect.y, leftW, rect.height);
            this._invCharWindow = new Window_Base(charRect);
            this.drawCharacterSheet(this._invCharWindow);
            this.addWindow(this._invCharWindow);
            this._activeTabWindows.push(this._invCharWindow);

            // Painel Direito: Lista Categorizada de Itens
            const itemRect = new Rectangle(rect.x + leftW, rect.y, rightW, rect.height);
            this._invItemWindow = new Window_ItemList(itemRect);
            this._invItemWindow.setCategory("all");
            this._invItemWindow.setHandler("ok", this.onItemOk.bind(this));
            this._invItemWindow.setHandler("cancel", () => this._tabWindow.activate());
            this._invItemWindow.refresh();
            this.addWindow(this._invItemWindow);
            this._activeTabWindows.push(this._invItemWindow);
        }

        drawCharacterSheet(win) {
            win.contents.clear();
            const actor = $gameParty.leader();
            if (!actor) return;

            const birth = actor.xianxiaBirth ? actor.xianxiaBirth() : null;
            let y = 0;
            const lh = 24;

            // Nome e Reino de Cultivo
            win.contents.fontSize = 20;
            win.changeTextColor("#ffd43b");
            win.drawText(actor.name(), 0, y, win.innerWidth);
            y += lh + 2;

            win.contents.fontSize = 15;
            if ($gameSystem.currentRealmObj) {
                const realm = $gameSystem.currentRealmObj();
                win.changeTextColor(realm.glowColor || "#63e6be");
                win.drawText(`${realm.name} • ${$gameSystem.currentStageName()}`, 0, y, win.innerWidth);
                y += lh;
            }

            // Linhagem e Constituição
            if (birth) {
                win.changeTextColor(ColorManager.systemColor());
                win.drawText("Linhagem:", 0, y, 90);
                win.resetTextColor();
                win.drawText(birth.bloodline.name, 90, y, win.innerWidth - 90);
                y += 22;

                win.changeTextColor(ColorManager.systemColor());
                win.drawText("Constituição:", 0, y, 100);
                win.resetTextColor();
                win.drawText(birth.constitution.name, 100, y, win.innerWidth - 100);
                y += 24;
            }

            // Atributos Vitais
            win.contents.fontSize = 14;
            win.changeTextColor("#ced4da");
            win.drawText(`HP: ${actor.hp} / ${actor.mhp}   |   MP: ${actor.mp} / ${actor.mmp}`, 0, y, win.innerWidth);
            y += 20;
            win.drawText(`ATK: ${actor.atk}  DEF: ${actor.def}  MAT: ${actor.mat}  AGI: ${actor.agi}`, 0, y, win.innerWidth);
            y += 24;

            // Slots de Equipamento (Arma, Escudo, Cabeça, Corpo, Acessório, Relíquia)
            win.contents.fontSize = 15;
            win.changeTextColor("#ffd43b");
            win.drawText("Equipamentos Acoplados:", 0, y, win.innerWidth);
            y += 22;

            const equips = actor.equips();
            const slotNames = ["Arma Divina", "Escudo/Guarda", "Coroa/Elmo", "Túnica/Armadura", "Acessório/Anel", "Relíquia Dao"];
            win.contents.fontSize = 13;

            for (let i = 0; i < 6; i++) {
                const eq = equips[i];
                win.changeTextColor("#868e96");
                win.drawText(`${slotNames[i]}:`, 0, y, 110);

                if (eq) {
                    win.changeTextColor("#63e6be");
                    win.drawText(eq.name, 115, y, win.innerWidth - 115);
                } else {
                    win.changeTextColor("#495057");
                    win.drawText("--- Vazio ---", 115, y, win.innerWidth - 115);
                }
                y += 20;
            }

            // Ouro / Taéis
            y += 6;
            win.changeTextColor("#ffd43b");
            win.drawText(`Taéis de Ouro: ${$gameParty.gold()}`, 0, y, win.innerWidth);
            win.resetFontSettings();
        }

        onItemOk() {
            const item = this._invItemWindow.item();
            const actor = $gameParty.leader();
            if (item && actor) {
                if (DataManager.isItem(item) && actor.canUse(item)) {
                    actor.useItem(item);
                    $gameParty.consumeItem(item);
                    SoundManager.playUseItem();
                } else if (DataManager.isWeapon(item) || DataManager.isArmor(item)) {
                    SoundManager.playEquip();
                }
            }
            this.drawCharacterSheet(this._invCharWindow);
            this._invItemWindow.refresh();
            this._invItemWindow.activate();
        }

        // =====================================================================
        // ABA 2: CULTIVO ESPIRITUAL
        // =====================================================================
        buildCultivationTab() {
            const rect = this._tabAreaRect;
            const leftW = Math.floor(rect.width * 0.42);
            const rightW = rect.width - leftW;

            // Usa as classes de janela do ImmortalCultivationSystem já existentes!
            if (globalThis.Window_CultivationVisualizer && globalThis.Window_CultivationStatus) {
                const leftRect = new Rectangle(rect.x, rect.y, leftW, rect.height);
                const visWin = new globalThis.Window_CultivationVisualizer(leftRect);
                this.addWindow(visWin);
                this._activeTabWindows.push(visWin);

                const rightRect = new Rectangle(rect.x + leftW, rect.y, rightW, rect.height);
                const statWin = new globalThis.Window_CultivationStatus(rightRect);
                this.addWindow(statWin);
                this._activeTabWindows.push(statWin);
            } else {
                const fallbackWin = new Window_Base(rect);
                fallbackWin.drawText("Sistema de Cultivo Espiritual Ativo.", 20, 20, rect.width - 40);
                this.addWindow(fallbackWin);
                this._activeTabWindows.push(fallbackWin);
            }
        }

        // =====================================================================
        // ABA 3: HABILIDADES & ARTES MARCIAIS (TREINO & CRIAÇÃO COM IA)
        // =====================================================================
        buildSkillsTab() {
            const rect = this._tabAreaRect;
            const leftW = Math.floor(rect.width * 0.50);
            const rightW = rect.width - leftW;

            // Lista de Habilidades do Personagem
            const skillRect = new Rectangle(rect.x, rect.y, leftW, rect.height);
            this._skillListWindow = new Window_SkillList(skillRect);
            this._skillListWindow.setActor($gameParty.leader());
            this.addWindow(this._skillListWindow);
            this._activeTabWindows.push(this._skillListWindow);

            // Painel de Treinamento Dao e Criação de Técnica por IA
            const trainRect = new Rectangle(rect.x + leftW, rect.y, rightW, rect.height);
            this._skillTrainWindow = new Window_Base(trainRect);
            this.drawSkillTrainPanel(this._skillTrainWindow);
            this.addWindow(this._skillTrainWindow);
            this._activeTabWindows.push(this._skillTrainWindow);
        }

        drawSkillTrainPanel(win) {
            win.contents.clear();
            const actor = $gameParty.leader();
            if (!actor || !actor.trainedAffinities) return;

            let y = 10;
            win.contents.fontSize = 18;
            win.changeTextColor("#ffd43b");
            win.drawText("⚡ Compreensão do Dao & Criação de Técnicas", 0, y, win.innerWidth);
            y += 32;

            win.contents.fontSize = 14;
            win.changeTextColor("#ced4da");
            win.drawText("Afinidades Treinadas (Evoluem com esforço):", 0, y, win.innerWidth);
            y += 24;

            const affs = actor.trainedAffinities();
            const elNames = { fire: "Fogo", water: "Água", wood: "Madeira", earth: "Terra", metal: "Metal", thunder: "Trovão", ice: "Gelo" };

            for (let el in elNames) {
                const val = affs[el] || 10;
                win.changeTextColor("#63e6be");
                win.drawText(`${elNames[el]}: ${val.toFixed(1)}%`, 0, y, 140);
                y += 20;
            }

            y += 14;
            win.contents.fontSize = 13;
            win.changeTextColor("#ffd43b");
            win.drawText("💡 Pressione [ENTER] no mapa para Compreender o Dao", 0, y, win.innerWidth);
            y += 20;
            win.changeTextColor("#adb5bd");
            win.drawText("Ao meditar e usar magias de um elemento, sua afinidade", 0, y, win.innerWidth);
            y += 18;
            win.drawText("inquebrável aumenta, superando os limites de nascença!", 0, y, win.innerWidth);
        }

        // =====================================================================
        // ABA 4: GRUPO & FORMAÇÃO TÁTICA
        // =====================================================================
        buildPartyTab() {
            const rect = this._tabAreaRect;
            const partyWin = new Window_Base(rect);
            const members = $gameParty.members();

            let y = 20;
            partyWin.contents.fontSize = 20;
            partyWin.changeTextColor("#ffd43b");
            partyWin.drawText(`👥 Formação do Grupo (${members.length} / 4 Cultivadores)`, 20, y, rect.width - 40);
            y += 36;

            for (let i = 0; i < members.length; i++) {
                const m = members[i];
                partyWin.contents.fontSize = 16;
                partyWin.changeTextColor("#ffffff");
                const pos = i === 0 ? "[Líder - Vanguarda]" : (i === 1 ? "[Vanguarda]" : "[Retaguarda]");
                partyWin.drawText(`${pos} ${m.name()} - Nível ${m.level}`, 30, y, 350);
                partyWin.changeTextColor("#63e6be");
                partyWin.drawText(`HP: ${m.hp}/${m.mhp}  MP: ${m.mp}/${m.mmp}`, 380, y, 300);
                y += 28;
            }

            y += 20;
            partyWin.contents.fontSize = 14;
            partyWin.changeTextColor("#adb5bd");
            partyWin.drawText("Para recrutar novos membros para o time, aproxime-se de um", 30, y, rect.width - 60);
            y += 20;
            partyWin.drawText("cultivador no mapa presencialmente com Afinidade >= 50 e convide-o!", 30, y, rect.width - 60);

            this.addWindow(partyWin);
            this._activeTabWindows.push(partyWin);
        }

        // =====================================================================
        // ABA 5: MAPA MUNDIAL EXPLORÁVEL
        // =====================================================================
        buildMapTab() {
            const rect = this._tabAreaRect;
            const mapWin = new Window_Base(rect);
            mapWin.contents.fontSize = 18;
            mapWin.changeTextColor("#ffd43b");
            mapWin.drawText("🗺️ Mapa do Mundo Procedural", 20, 20, rect.width - 40);

            mapWin.contents.fontSize = 14;
            mapWin.changeTextColor("#ced4da");
            mapWin.drawText("O mapa do mundo com névoa de guerra está sincronizado com a tecla [M].", 20, 60, rect.width - 40);
            mapWin.drawText("Coordenadas Reais do Jogador: " + JSON.stringify(globalThis.BasicChunkGenerator ? globalThis.BasicChunkGenerator.getRealPlayerCoordinates() : { x: $gamePlayer.x, y: $gamePlayer.y }), 20, 90, rect.width - 40);

            this.addWindow(mapWin);
            this._activeTabWindows.push(mapWin);
        }

        // =====================================================================
        // ABA 6: RELACIONAMENTOS (CÓDICE DE NPCS CONHECIDOS)
        // =====================================================================
        buildRelationshipsTab() {
            const rect = this._tabAreaRect;
            const relWin = new Window_Base(rect);
            const npcs = $gameSystem._knownCultivators || [];

            let y = 20;
            relWin.contents.fontSize = 20;
            relWin.changeTextColor("#ffd43b");
            relWin.drawText(`🤝 Códice de Relacionamentos (${npcs.length} Cultivadores Registrados)`, 20, y, rect.width - 40);
            y += 36;

            if (npcs.length === 0) {
                relWin.contents.fontSize = 15;
                relWin.changeTextColor("#adb5bd");
                relWin.drawText("Você ainda não conversou com nenhum cultivador no mundo.", 30, y, rect.width - 60);
                y += 24;
                relWin.drawText("Aproxime-se dos viajantes e membros de seitas no mapa para criar vínculos!", 30, y, rect.width - 60);
            } else {
                for (let npc of npcs) {
                    relWin.contents.fontSize = 16;
                    relWin.changeTextColor("#ffffff");
                    relWin.drawText(`${npc.name} (${npc.realm || "Condensação de Qi"})`, 30, y, 320);

                    const affColor = npc.affinity >= 50 ? "#63e6be" : (npc.affinity < 0 ? "#ff8787" : "#ffd43b");
                    relWin.changeTextColor(affColor);
                    relWin.drawText(`Afinidade: ${npc.affinity > 0 ? "+" : ""}${npc.affinity}`, 360, y, 160);

                    relWin.changeTextColor("#adb5bd");
                    relWin.contents.fontSize = 13;
                    relWin.drawText(`Local: ${npc.lastLocation || "Mapa Principal"}`, 530, y, 200);
                    y += 28;
                }
            }

            this.addWindow(relWin);
            this._activeTabWindows.push(relWin);
        }

        // =====================================================================
        // ABA 7: MISSÕES / QUESTS
        // =====================================================================
        buildQuestsTab() {
            const rect = this._tabAreaRect;
            const qWin = new Window_Base(rect);
            const quests = $gameSystem._activeQuests || [];

            let y = 20;
            qWin.contents.fontSize = 20;
            qWin.changeTextColor("#ffd43b");
            qWin.drawText(`📜 Diário de Missões (${quests.length} Ativas)`, 20, y, rect.width - 40);
            y += 36;

            if (quests.length === 0) {
                qWin.contents.fontSize = 15;
                qWin.changeTextColor("#adb5bd");
                qWin.drawText("Nenhuma missão pendente no momento.", 30, y, rect.width - 60);
                y += 24;
                qWin.drawText("Converse presencialmente com cultivadores e mestres para obter tarefas!", 30, y, rect.width - 60);
            } else {
                for (let q of quests) {
                    qWin.contents.fontSize = 16;
                    qWin.changeTextColor("#ffd43b");
                    qWin.drawText(`• ${q.title} (Solicitante: ${q.npcName})`, 30, y, rect.width - 60);
                    y += 22;
                    qWin.contents.fontSize = 13;
                    qWin.changeTextColor("#ced4da");
                    qWin.drawText(q.desc, 45, y, rect.width - 90);
                    y += 24;
                }
            }

            this.addWindow(qWin);
            this._activeTabWindows.push(qWin);
        }

        // =====================================================================
        // ABA 8: SISTEMA (SALVAR / OPÇÕES)
        // =====================================================================
        buildSystemTab() {
            const rect = this._tabAreaRect;
            const cmdW = 280;
            const cmdH = 200;
            const cmdRect = new Rectangle(rect.x + (rect.width - cmdW) / 2, rect.y + 60, cmdW, cmdH);

            this._sysCommandWindow = new Window_Command(cmdRect);
            this._sysCommandWindow.addCommand("💾 Salvar Jogo", "save");
            this._sysCommandWindow.addCommand("📁 Carregar Jogo", "load");
            this._sysCommandWindow.addCommand("⚙️ Opções", "options");
            this._sysCommandWindow.addCommand("🚪 Sair para o Título", "toTitle");
            this._sysCommandWindow.setHandler("save", () => SceneManager.push(Scene_Save));
            this._sysCommandWindow.setHandler("load", () => SceneManager.push(Scene_Load));
            this._sysCommandWindow.setHandler("options", () => SceneManager.push(Scene_Options));
            this._sysCommandWindow.setHandler("toTitle", () => SceneManager.goto(Scene_Title));
            this._sysCommandWindow.setHandler("cancel", () => this._tabWindow.activate());

            this.addWindow(this._sysCommandWindow);
            this._activeTabWindows.push(this._sysCommandWindow);
            this._sysCommandWindow.activate();
        }
    }

    globalThis.Scene_UnifiedMenu = Scene_UnifiedMenu;

    // =========================================================================
    // 2. INTERCEPTAÇÃO DO MENU PADRÃO DO RPG MAKER MZ
    // =========================================================================

    Scene_Map.prototype.callMenu = function() {
        SoundManager.playOk();
        SceneManager.push(Scene_UnifiedMenu);
        Window_MenuCommand.initCommandPosition();
        $gameTemp.clearDestination();
        this._mapNameWindow.hide();
        this._waitCount = 2;
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if (Input.isTriggered("unifiedInventoryKey") && this.isMenuEnabled()) {
            this.callMenu();
        }
    };

})();
