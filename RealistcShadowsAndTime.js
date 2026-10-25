//=============================================================================
// RPG Maker MZ - Realistic Shadows, Time & Lunar Phases System
// Nome do Arquivo: RealisticShadowsAndTime.js
// Versão: 1.0.0
//=============================================================================

/*:pt
 * @target MZ
 * @plugindesc [v1.0.0] Sistema de sombras realistas em tempo real (PixiJS), luzes pontuais, relógio e 8 fases da lua.
 * @author Custom Plugin Architecture
 *
 * @help
 * ============================================================================
 * INTRODUÇÃO E ARQUITETURA
 * ============================================================================
 * Este plugin projeta silhuetas dinâmicas em tempo real para o jogador,
 * seguidores, veículos e eventos utilizando transformações matriciais e
 * filtros WebGL do PixiJS v5.
 *
 * Funcionalidades Principais:
 * 1. Silhueta em Tempo Real: Espelha o frame exato, direção e pose do sprite.
 * 2. Luz Global (Sol e Lua): A inclinação (skew.x), escala vertical (scale.y)
 *    e opacidade seguem uma curva trigonométrica baseada na hora do dia.
 * 3. Ciclo de 8 Fases da Lua: Modula a força da sombra noturna e a iluminação
 *    ambiente da noite (0% na Lua Nova até 100% na Lua Cheia).
 * 4. Luzes Pontuais (Tochas, Postes, Fogueiras): Calcula vetores de distância
 *    e ângulo por frame, permitindo múltiplas sombras simultâneas por fonte.
 * 5. Camada Unificada (Alpha/Blur Layer): Todas as sombras são renderizadas
 *    em um contêiner dedicado abaixo dos personagens com BlurFilter e
 *    AlphaFilter, evitando que sombras sobrepostas fiquem duplamente escuras.
 * 6. Compatibilidade Procedural: Detecta eventos criados dinamicamente em
 *    mapas procedurais.
 *
 * ============================================================================
 * NOTETAGS DE MAPA (Propriedades do Mapa -> Notas)
 * ============================================================================
 * <Indoor>
 * Desativa a sombra direcional global (Sol/Lua) e a tonalidade de horário
 * neste mapa. Apenas luzes pontuais (<Light: ...>) projetarão sombras.
 *
 * <NoShadows>
 * Desativa completamente todas as sombras neste mapa.
 *
 * <ShadowAmbient: R, G, B, Gray>
 * Define uma tonalidade fixa personalizada para mapas internos.
 *
 * ============================================================================
 * NOTETAGS E COMENTÁRIOS DE EVENTO (Notas do Evento ou Comando Comentário)
 * ============================================================================
 * <NoShadow>
 * Impede que este evento projete sombra (útil para fantasmas, partículas,
 * luzes invisíveis ou eventos de sistema).
 *
 * <ObjectShadow>
 * Marca o evento como um objeto estático/vertical (ex.: árvores, pilares,
 * placas), mantendo a ancoragem firme na base.
 *
 * <ShadowOffset: X, Y>
 * Ajusta manualmente o ponto de ancoragem da sombra em pixels (Ex: <ShadowOffset: 0, 4>).
 *
 * <ShadowScale: S>
 * Multiplica o comprimento da sombra deste evento específico (Ex: <ShadowScale: 1.5>).
 *
 * <Light: R>
 * <Light: R, I>
 * <Light: R, I, #RRGGBB>
 * Transforma o evento em uma fonte de luz pontual que projeta sombras nos
 * personagens ao redor!
 * - R: Raio de alcance em tiles (Ex: 5).
 * - I: Intensidade de 0.1 a 1.0 (Padrão: 1.0).
 * - #RRGGBB: Cor opcional do halo de luz (Padrão: #FFAA44).
 * Exemplo: <Light: 6, 0.9, #FFCC66>
 *
 * ============================================================================
 * COMANDOS DE PLUGIN
 * ============================================================================
 * Utilize os Plugin Commands nativos do RPG Maker MZ para:
 * - Definir ou avançar o horário (Horas/Minutos).
 * - Pausar ou retomar a passagem do tempo.
 * - Forçar uma das 8 fases da lua (0 = Nova ... 4 = Cheia ... 7 = Minguante).
 * - Exibir/Ocultar o HUD de Relógio e Fase da Lua.
 *
 * @param --- Relógio e Tempo ---
 *
 * @param enableInternalClock
 * @text Ativar Relógio Interno
 * @type boolean
 * @default true
 * @desc Ativa a contagem automática de tempo do plugin. Desative se quiser ler as horas de variáveis externas.
 *
 * @param secondDurationFrames
 * @text Frames por Minuto do Jogo
 * @type number
 * @min 1
 * @default 60
 * @desc Quantos frames reais (60 FPS = 1 seg) equivalem a 1 minuto dentro do jogo.
 *
 * @param startHour
 * @text Hora Inicial
 * @type number
 * @min 0
 * @max 23
 * @default 8
 *
 * @param startMinute
 * @text Minuto Inicial
 * @type number
 * @min 0
 * @max 59
 * @default 0
 *
 * @param sunriseHour
 * @text Hora do Nascer do Sol
 * @type number
 * @min 0
 * @max 11
 * @default 6
 *
 * @param sunsetHour
 * @text Hora do Pôr do Sol
 * @type number
 * @min 12
 * @max 23
 * @default 18
 *
 * @param --- Ciclo Lunar ---
 *
 * @param synodicMonthDays
 * @text Dias do Ciclo Lunar Completo
 * @type number
 * @min 8
 * @default 8
 * @desc Quantidade de dias para a lua completar todas as 8 fases (Ex: 8, 16 ou 28 dias).
 *
 * @param initialMoonPhase
 * @text Fase Inicial da Lua
 * @type select
 * @option 0 - Lua Nova (0% Luz)
 * @value 0
 * @option 1 - Lua Crescente (25% Luz)
 * @value 1
 * @option 2 - Quarto Crescente (50% Luz)
 * @value 2
 * @option 3 - Gibosa Crescente (75% Luz)
 * @value 3
 * @option 4 - Lua Cheia (100% Luz)
 * @value 4
 * @option 5 - Gibosa Minguante (75% Luz)
 * @value 5
 * @option 6 - Quarto Minguante (50% Luz)
 * @value 6
 * @option 7 - Lua Minguante (25% Luz)
 * @value 7
 * @default 4
 *
 * @param --- Integração Variáveis ---
 *
 * @param syncMode
 * @text Modo de Sincronização de Variáveis
 * @type select
 * @option Exportar (Escreve nas variáveis do jogo)
 * @value export
 * @option Importar (Lê de outro plugin ex: DayNightSystem)
 * @value import
 * @option Desativado
 * @value none
 * @default export
 * @desc Permite integrar o sistema de sombras com o seu DayNightSystem.js ou EnvironmentVariableUpdater.js.
 *
 * @param varHourId
 * @text ID Variável: Hora (0-23)
 * @type variable
 * @default 0
 *
 * @param varMinuteId
 * @text ID Variável: Minuto (0-59)
 * @type variable
 * @default 0
 *
 * @param varDayId
 * @text ID Variável: Dia Acumulado
 * @type variable
 * @default 0
 *
 * @param varMoonPhaseId
 * @text ID Variável: Fase da Lua (0-7)
 * @type variable
 * @default 0
 *
 * @param --- Sombras Realistas ---
 *
 * @param maxShadowOpacity
 * @text Opacidade Máxima da Camada
 * @type number
 * @decimals 2
 * @min 0.10
 * @max 1.00
 * @default 0.55
 * @desc Opacidade global unificada das sombras (0.55 = 55% escura). Sombras sobrepostas não ultrapassam esse valor.
 *
 * @param shadowBlurStrength
 * @text Suavização da Sombra (Blur)
 * @type number
 * @decimals 1
 * @min 0.0
 * @max 10.0
 * @default 2.0
 * @desc Intensidade do filtro gaussiano nas bordas da sombra (PixiJS BlurFilter).
 *
 * @param maxSolarSkew
 * @text Inclinação Máxima (Skew X)
 * @type number
 * @decimals 2
 * @min 0.20
 * @max 2.50
 * @default 1.15
 * @desc Inclinação lateral máxima da sombra no nascer e pôr do sol.
 *
 * @param minNoonScaleY
 * @text Escala Vertical ao Meio-Dia
 * @type number
 * @decimals 2
 * @min 0.15
 * @max 1.00
 * @default 0.45
 * @desc Comprimento mínimo da sombra às 12h00 (Zênite).
 *
 * @param maxHorizonScaleY
 * @text Escala Vertical no Horizonte
 * @type number
 * @decimals 2
 * @min 0.50
 * @max 3.00
 * @default 1.35
 * @desc Comprimento máximo da sombra no início da manhã e fim da tarde.
 *
 * @param maxPointLightSources
 * @text Máximo de Luzes Pontuais por Sprite
 * @type number
 * @min 1
 * @max 5
 * @default 2
 * @desc Quantas sombras de tochas/lâmpadas próximas cada personagem pode projetar simultaneamente.
 *
 * @param renderPointLightGlow
 * @text Renderizar Brilho nas Luzes Pontuais
 * @type boolean
 * @default true
 * @desc Desenha um halo luminoso suave com BlendMode ADD nos eventos com <Light: R>.
 *
 * @param noShadowRegions
 * @text Region IDs Sem Sombra (Oclusão)
 * @type string
 * @default 254, 255
 * @desc Lista de Region IDs separados por vírgula onde as sombras desaparecem (ex: buracos, abismos).
 *
 * @param --- Ambiência e HUD ---
 *
 * @param enableScreenTint
 * @text Ativar Tonalidade Automática (Tint)
 * @type boolean
 * @default true
 * @desc Altera a cor da tela conforme a hora e fase da lua. Desative se já usar o tint do DayNightSystem.js.
 *
 * @param showClockHud
 * @text Exibir HUD de Relógio e Lua
 * @type boolean
 * @default true
 * @desc Exibe um painel elegante no canto da tela com horário, dia e ícone/nome da fase da lua.
 *
 * @command SetTime
 * @text Definir Horário
 * @desc Altera imediatamente a hora e o minuto do sistema.
 *
 * @arg hour
 * @text Hora (0-23)
 * @type number
 * @min 0
 * @max 23
 * @default 12
 *
 * @arg minute
 * @text Minuto (0-59)
 * @type number
 * @min 0
 * @max 59
 * @default 0
 *
 * @command AddTime
 * @text Avançar Tempo
 * @desc Adiciona horas e minutos ao relógio atual, avançando dias e fases da lua se necessário.
 *
 * @arg hours
 * @text Horas a Adicionar
 * @type number
 * @min 0
 * @default 1
 *
 * @arg minutes
 * @text Minutos a Adicionar
 * @type number
 * @min 0
 * @default 0
 *
 * @command SetMoonPhase
 * @text Forçar Fase da Lua
 * @desc Define imediatamente uma das 8 fases da lua (0 a 7).
 *
 * @arg phase
 * @text Fase da Lua (0 a 7)
 * @type select
 * @option 0 - Lua Nova
 * @value 0
 * @option 1 - Lua Crescente
 * @value 1
 * @option 2 - Quarto Crescente
 * @value 2
 * @option 3 - Gibosa Crescente
 * @value 3
 * @option 4 - Lua Cheia
 * @value 4
 * @option 5 - Gibosa Minguante
 * @value 5
 * @option 6 - Quarto Minguante
 * @value 6
 * @option 7 - Lua Minguante
 * @value 7
 * @default 4
 *
 * @command PauseClock
 * @text Pausar/Retomar Relógio
 * @desc Pausa ou retoma a passagem automática do tempo.
 *
 * @arg pause
 * @text Pausar Tempo?
 * @type boolean
 * @default true
 *
 * @command ToggleHud
 * @text Mostrar/Ocultar HUD
 * @desc Exibe ou oculta o HUD de horário e fase da lua no mapa.
 *
 * @arg show
 * @text Mostrar HUD?
 * @type boolean
 * @default true
 */

(() => {
    "use strict";

    const PLUGIN_NAME = "RealisticShadowsAndTime";
    const PARAMS = PluginManager.parameters(PLUGIN_NAME);

    const CONFIG = {
        enableInternalClock: PARAMS["enableInternalClock"] !== "false",
        secondDurationFrames: Math.max(1, Number(PARAMS["secondDurationFrames"] || 60)),
        startHour: Number(PARAMS["startHour"] || 8),
        startMinute: Number(PARAMS["startMinute"] || 0),
        sunriseHour: Number(PARAMS["sunriseHour"] || 6),
        sunsetHour: Number(PARAMS["sunsetHour"] || 18),
        synodicMonthDays: Math.max(8, Number(PARAMS["synodicMonthDays"] || 8)),
        initialMoonPhase: Number(PARAMS["initialMoonPhase"] || 4),
        syncMode: String(PARAMS["syncMode"] || "export"),
        varHourId: Number(PARAMS["varHourId"] || 0),
        varMinuteId: Number(PARAMS["varMinuteId"] || 0),
        varDayId: Number(PARAMS["varDayId"] || 0),
        varMoonPhaseId: Number(PARAMS["varMoonPhaseId"] || 0),
        maxShadowOpacity: Number(PARAMS["maxShadowOpacity"] || 0.55),
        shadowBlurStrength: Number(PARAMS["shadowBlurStrength"] || 2.0),
        maxSolarSkew: Number(PARAMS["maxSolarSkew"] || 1.15),
        minNoonScaleY: Number(PARAMS["minNoonScaleY"] || 0.45),
        maxHorizonScaleY: Number(PARAMS["maxHorizonScaleY"] || 1.35),
        maxPointLightSources: Math.max(1, Number(PARAMS["maxPointLightSources"] || 2)),
        renderPointLightGlow: PARAMS["renderPointLightGlow"] !== "false",
        noShadowRegions: String(PARAMS["noShadowRegions"] || "254, 255")
            .split(",")
            .map(n => Number(n.trim()))
            .filter(n => !isNaN(n) && n > 0),
        enableScreenTint: PARAMS["enableScreenTint"] !== "false",
        showClockHud: PARAMS["showClockHud"] !== "false"
    };

    const MOON_PHASES = [
        { index: 0, name: "Lua Nova",         illumination: 0.00, symbol: "🌑" },
        { index: 1, name: "Lua Crescente",    illumination: 0.25, symbol: "🌒" },
        { index: 2, name: "Quarto Crescente", illumination: 0.50, symbol: "🌓" },
        { index: 3, name: "Gibosa Crescente", illumination: 0.75, symbol: "🌔" },
        { index: 4, name: "Lua Cheia",        illumination: 1.00, symbol: "🌕" },
        { index: 5, name: "Gibosa Minguante", illumination: 0.75, symbol: "🌖" },
        { index: 6, name: "Quarto Minguante", illumination: 0.50, symbol: "🌗" },
        { index: 7, name: "Lua Minguante",    illumination: 0.25, symbol: "🌘" }
    ];

    //=========================================================================
    // FUNÇÕES UTILITÁRIAS E MATEMÁTICAS (Declaradas no topo do escopo)
    //=========================================================================

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    function lerp(a, b, t) {
        return a + (b - a) * clamp(t, 0, 1);
    }

    function parseEventCommentTags(event) {
        const result = {
            noShadow: false,
            objectShadow: false,
            offsetX: 0,
            offsetY: 0,
            shadowScale: 1.0,
            lightSource: null
        };

        if (!event || !event.event()) return result;

        const note = event.event().note || "";
        let combinedText = note + "\n";

        const page = event.page();
        if (page && page.list) {
            for (const cmd of page.list) {
                if (cmd.code === 108 || cmd.code === 408) {
                    combinedText += cmd.parameters[0] + "\n";
                }
            }
        }

        if (/<NoShadow>/i.test(combinedText)) {
            result.noShadow = true;
        }
        if (/<ObjectShadow>/i.test(combinedText)) {
            result.objectShadow = true;
        }

        const offsetMatch = combinedText.match(/<ShadowOffset:\s*(-?\d+)\s*,\s*(-?\d+)>/i);
        if (offsetMatch) {
            result.offsetX = Number(offsetMatch[1]);
            result.offsetY = Number(offsetMatch[2]);
        }

        const scaleMatch = combinedText.match(/<ShadowScale:\s*([\d.]+)>/i);
        if (scaleMatch) {
            result.shadowScale = Number(scaleMatch[1]);
        }

        const lightMatch = combinedText.match(/<Light:\s*([\d.]+)(?:\s*,\s*([\d.]+))?(?:\s*,\s*(#[0-9a-fA-F]{6}))?>/i);
        if (lightMatch) {
            result.lightSource = {
                radius: Math.max(0.5, Number(lightMatch[1])),
                intensity: lightMatch[2] !== undefined ? clamp(Number(lightMatch[2]), 0.05, 1.5) : 1.0,
                color: lightMatch[3] ? lightMatch[3] : "#FFAA44"
            };
        }

        return result;
    }

    function createRadialLightBitmap(radiusPx, hexColor) {
        const size = Math.max(32, Math.ceil(radiusPx * 2));
        const bitmap = new Bitmap(size, size);
        const ctx = bitmap.context;
        const center = size / 2;

        const r = parseInt(hexColor.slice(1, 3), 16) || 255;
        const g = parseInt(hexColor.slice(3, 5), 16) || 170;
        const b = parseInt(hexColor.slice(5, 7), 16) || 68;

        const grad = ctx.createRadialGradient(center, center, 2, center, center, center);
        grad.addColorStop(0.0, `rgba(${r}, ${g}, ${b}, 0.75)`);
        grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.35)`);
        grad.addColorStop(1.0, `rgba(${r}, ${g}, ${b}, 0.0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        bitmap._baseTexture.update();
        return bitmap;
    }

    //=========================================================================
    // CLASSES DE RENDERIZAÇÃO PIXIJS (Sombras e Luzes)
    //=========================================================================

    /**
     * Sprite individual de silhueta projetada (Solar/Lunar ou Pontual)
     */
    class Sprite_RealisticShadow extends Sprite {
        constructor(targetCharacterSprite, shadowType = "global", lightIndex = 0) {
            super();
            this._targetSprite = targetCharacterSprite;
            this._character = targetCharacterSprite._character;
            this._shadowType = shadowType; // "global" ou "point"
            this._lightIndex = lightIndex;
            this.anchor.set(0.5, 1.0);
            this.tint = 0x000000;
            this.visible = false;
        }

        update() {
            super.update();
            const charSprite = this._targetSprite;
            const char = this._character;

            if (!charSprite || !char || !this.shouldRenderShadow(char, charSprite)) {
                this.visible = false;
                return;
            }

            this.syncBitmapAndFrame(charSprite);

            const meta = char.shadowMeta ? char.shadowMeta() : { offsetX: 0, offsetY: 0, shadowScale: 1.0, objectShadow: false };
            const baseX = char.screenX() + (meta.offsetX || 0);
            const baseY = char.screenY() + char.jumpHeight() + (meta.offsetY || 0);
            this.x = baseX;
            this.y = baseY;

            if (this._shadowType === "global") {
                this.updateGlobalDirectionalShadow(char, meta);
            } else {
                this.updatePointLightShadow(char, meta);
            }
        }

        shouldRenderShadow(char, charSprite) {
            if (!charSprite.visible || charSprite.opacity === 0 || char.isTransparent()) return false;
            if (!char.characterName() && !char.tileId()) return false;
            if ($gameMap.isShadowDisabledMap()) return false;

            const regionId = $gameMap.regionId(Math.round(char._realX), Math.round(char._realY));
            if (CONFIG.noShadowRegions.includes(regionId)) return false;

            if (char instanceof Game_Vehicle && !char.isVehicleShadowActive()) return false;
            if (char instanceof Game_Follower && !char.isVisible()) return false;

            const meta = char.shadowMeta ? char.shadowMeta() : null;
            if (meta && meta.noShadow) return false;

            return true;
        }

        syncBitmapAndFrame(charSprite) {
            if (this.bitmap !== charSprite.bitmap) {
                this.bitmap = charSprite.bitmap;
            }
            if (this.bitmap) {
                const frame = charSprite._frame;
                this.setFrame(frame.x, frame.y, frame.width, frame.height);
            }
        }

        updateGlobalDirectionalShadow(char, meta) {
            if ($gameMap.isIndoorShadowMap()) {
                this.visible = false;
                return;
            }

            const celestial = $gameSystem.getCelestialShadowState();
            if (celestial.opacity <= 0.01) {
                this.visible = false;
                return;
            }

            this.visible = true;
            this.rotation = 0;
            const jumpFactor = Math.max(0.4, 1.0 - (char.jumpHeight() / 64));
            const customScale = meta.shadowScale || 1.0;

            this.skew.x = celestial.skewX;
            this.scale.x = jumpFactor;
            // Valor negativo de scale.y projeta a sombra no sentido oposto ao sprite
            this.scale.y = -celestial.scaleY * customScale * jumpFactor;
            this.alpha = clamp(celestial.opacity * (char.opacity() / 255), 0, 1);
        }

        updatePointLightShadow(char, meta) {
            const activeLights = $gameMap.getNearestLightSources(char._realX, char._realY, CONFIG.maxPointLightSources);
            const lightData = activeLights[this._lightIndex];

            if (!lightData) {
                this.visible = false;
                return;
            }

            const { dx, dy, distance, radius, intensity } = lightData;
            if (distance < 0.05 || distance >= radius) {
                this.visible = false;
                return;
            }

            this.visible = true;
            const normDist = distance / radius;
            const attenuation = Math.pow(1.0 - normDist, 1.35) * intensity;

            if (attenuation <= 0.02) {
                this.visible = false;
                return;
            }

            // Ângulo do vetor (Luz -> Personagem) projetando a sombra para fora da luz
            const angle = Math.atan2(dy, dx);
            const customScale = meta.shadowScale || 1.0;
            const stretch = lerp(0.45, 1.45, normDist) * customScale;

            this.skew.set(0, 0);
            this.rotation = angle - Math.PI / 2;
            this.scale.set(1.0, -stretch);
            this.alpha = clamp(attenuation * (char.opacity() / 255), 0, 1);
        }
    }

    /**
     * Sprite de Halo Luminoso para Eventos com <Light: R, I, #HEX>
     */
    class Sprite_PointLightGlow extends Sprite {
        constructor(event) {
            super();
            this._event = event;
            this._cachedKey = "";
            this.anchor.set(0.5, 0.5);
            this.blendMode = PIXI.BLEND_MODES.ADD;
            this._pulsePhase = Math.random() * Math.PI * 2;
        }

        update() {
            super.update();
            if (!CONFIG.renderPointLightGlow || !this._event || this._event._erased) {
                this.visible = false;
                return;
            }

            const meta = this._event.shadowMeta();
            if (!meta || !meta.lightSource) {
                this.visible = false;
                return;
            }

            this.visible = true;
            const { radius, intensity, color } = meta.lightSource;
            const radiusPx = radius * $gameMap.tileWidth();
            const key = `${radiusPx}_${color}`;

            if (this._cachedKey !== key) {
                this._cachedKey = key;
                this.bitmap = createRadialLightBitmap(radiusPx, color);
            }

            this.x = this._event.screenX();
            this.y = this._event.screenY() - ($gameMap.tileHeight() / 2);

            this._pulsePhase += 0.06;
            const flicker = 1.0 + Math.sin(this._pulsePhase) * 0.04;
            this.scale.set(flicker, flicker);

            // Brilho mais visível à noite ou em interiores
            const celestial = $gameSystem.getCelestialShadowState();
            const envFactor = $gameMap.isIndoorShadowMap() ? 0.85 : lerp(0.85, 0.30, celestial.isDay ? celestial.dayStrength : 0);
            this.alpha = clamp(intensity * envFactor, 0.1, 0.95);
        }
    }

    /**
     * HUD de Relógio e Fases da Lua no Mapa
     */
    class Window_TimeLunarHud extends Window_Base {
        constructor(rect) {
            super(rect);
            this.opacity = 180;
            this._lastSignature = "";
        }

        update() {
            super.update();
            this.visible = $gameSystem.isClockHudVisible() && !$gameMessage.isBusy();
            if (!this.visible) return;

            const sig = $gameSystem.getTimeSignature();
            if (this._lastSignature !== sig) {
                this._lastSignature = sig;
                this.refresh();
            }
        }

        refresh() {
            this.contents.clear();
            const timeStr = $gameSystem.getFormattedTime();
            const dayNum = $gameSystem.getDayCount();
            const moon = $gameSystem.getMoonPhaseData();

            this.contents.fontSize = 18;
            this.changeTextColor(ColorManager.systemColor());
            this.drawText(`Dia ${dayNum}`, 4, 0, 110, "left");

            this.resetTextColor();
            this.contents.fontSize = 20;
            this.drawText(timeStr, 4, 0, this.innerWidth - 8, "right");

            this.contents.fontSize = 15;
            const illuminationPct = Math.round(moon.illumination * 100);
            this.drawText(`${moon.symbol} ${moon.name} (${illuminationPct}%)`, 4, 26, this.innerWidth - 8, "left");
        }
    }

    //=========================================================================
    // GAME_SYSTEM (Relógio, Ciclo Solar, 8 Fases da Lua e Ambiência)
    //=========================================================================

    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this.initRealisticTimeAndMoon();
    };

    Game_System.prototype.initRealisticTimeAndMoon = function() {
        if (this._rstHour === undefined) this._rstHour = CONFIG.startHour;
        if (this._rstMinute === undefined) this._rstMinute = CONFIG.startMinute;
        if (this._rstDay === undefined) this._rstDay = 1;
        if (this._rstMoonPhase === undefined) this._rstMoonPhase = CONFIG.initialMoonPhase;
        if (this._rstFrameCounter === undefined) this._rstFrameCounter = 0;
        if (this._rstClockPaused === undefined) this._rstClockPaused = false;
        if (this._rstShowHud === undefined) this._rstShowHud = CONFIG.showClockHud;
    };

    Game_System.prototype.isClockHudVisible = function() {
        this.initRealisticTimeAndMoon();
        return this._rstShowHud;
    };

    Game_System.prototype.setClockHudVisible = function(visible) {
        this.initRealisticTimeAndMoon();
        this._rstShowHud = !!visible;
    };

    Game_System.prototype.setClockPaused = function(paused) {
        this.initRealisticTimeAndMoon();
        this._rstClockPaused = !!paused;
    };

    Game_System.prototype.setRealisticTime = function(hour, minute) {
        this.initRealisticTimeAndMoon();
        this._rstHour = clamp(Math.floor(hour), 0, 23);
        this._rstMinute = clamp(Math.floor(minute), 0, 59);
        this._rstFrameCounter = 0;
        this.syncTimeVariables();
    };

    Game_System.prototype.addRealisticTime = function(hours, minutes) {
        this.initRealisticTimeAndMoon();
        let totalMinutes = this._rstHour * 60 + this._rstMinute + (hours * 60) + minutes;
        while (totalMinutes >= 1440) {
            totalMinutes -= 1440;
            this.advanceDayAndMoon();
        }
        while (totalMinutes < 0) {
            totalMinutes += 1440;
        }
        this._rstHour = Math.floor(totalMinutes / 60);
        this._rstMinute = totalMinutes % 60;
        this.syncTimeVariables();
    };

    Game_System.prototype.advanceDayAndMoon = function() {
        this._rstDay += 1;
        const cycleLength = CONFIG.synodicMonthDays;
        const phaseStep = 8 / cycleLength;
        const rawPhase = ((this._rstDay - 1) * phaseStep + CONFIG.initialMoonPhase) % 8;
        this._rstMoonPhase = Math.floor(rawPhase) % 8;
    };

    Game_System.prototype.setMoonPhaseIndex = function(phaseIndex) {
        this.initRealisticTimeAndMoon();
        this._rstMoonPhase = clamp(Math.floor(phaseIndex), 0, 7);
        this.syncTimeVariables();
    };

    Game_System.prototype.getMoonPhaseData = function() {
        this.initRealisticTimeAndMoon();
        return MOON_PHASES[this._rstMoonPhase] || MOON_PHASES[0];
    };

    Game_System.prototype.getDayCount = function() {
        this.initRealisticTimeAndMoon();
        return this._rstDay;
    };

    Game_System.prototype.getFormattedTime = function() {
        this.initRealisticTimeAndMoon();
        const hh = String(this._rstHour).padStart(2, "0");
        const mm = String(this._rstMinute).padStart(2, "0");
        return `${hh}:${mm}`;
    };

    Game_System.prototype.getTimeSignature = function() {
        this.initRealisticTimeAndMoon();
        return `${this._rstDay}_${this._rstHour}_${this._rstMinute}_${this._rstMoonPhase}`;
    };

    Game_System.prototype.updateRealisticClock = function() {
        this.initRealisticTimeAndMoon();

        if (CONFIG.syncMode === "import") {
            this.syncTimeVariables();
            return;
        }

        if (!CONFIG.enableInternalClock || this._rstClockPaused) return;

        this._rstFrameCounter++;
        if (this._rstFrameCounter >= CONFIG.secondDurationFrames) {
            this._rstFrameCounter = 0;
            this._rstMinute++;
            if (this._rstMinute >= 60) {
                this._rstMinute = 0;
                this._rstHour++;
                if (this._rstHour >= 24) {
                    this._rstHour = 0;
                    this.advanceDayAndMoon();
                }
            }
            this.syncTimeVariables();
        }
    };

    Game_System.prototype.syncTimeVariables = function() {
        if (!$gameVariables) return;
        if (CONFIG.syncMode === "export") {
            if (CONFIG.varHourId > 0) $gameVariables.setValue(CONFIG.varHourId, this._rstHour);
            if (CONFIG.varMinuteId > 0) $gameVariables.setValue(CONFIG.varMinuteId, this._rstMinute);
            if (CONFIG.varDayId > 0) $gameVariables.setValue(CONFIG.varDayId, this._rstDay);
            if (CONFIG.varMoonPhaseId > 0) $gameVariables.setValue(CONFIG.varMoonPhaseId, this._rstMoonPhase);
        } else if (CONFIG.syncMode === "import") {
            if (CONFIG.varHourId > 0) this._rstHour = clamp($gameVariables.value(CONFIG.varHourId), 0, 23);
            if (CONFIG.varMinuteId > 0) this._rstMinute = clamp($gameVariables.value(CONFIG.varMinuteId), 0, 59);
            if (CONFIG.varDayId > 0) this._rstDay = Math.max(1, $gameVariables.value(CONFIG.varDayId));
            if (CONFIG.varMoonPhaseId > 0) this._rstMoonPhase = clamp($gameVariables.value(CONFIG.varMoonPhaseId), 0, 7);
        }
    };

    /**
     * Calcula a geometria e força da sombra direcional (Sol durante o dia, Lua à noite)
     */
    Game_System.prototype.getCelestialShadowState = function() {
        this.initRealisticTimeAndMoon();
        const decimalHour = this._rstHour + (this._rstMinute / 60) + (this._rstFrameCounter / (CONFIG.secondDurationFrames * 60));
        const sunrise = CONFIG.sunriseHour;
        const sunset = CONFIG.sunsetHour;

        // Período Diurno (Sol)
        if (decimalHour >= sunrise && decimalHour <= sunset) {
            const dayDuration = Math.max(1, sunset - sunrise);
            const progress = (decimalHour - sunrise) / dayDuration; // 0.0 (Nascer) -> 0.5 (Meio-dia) -> 1.0 (Pôr)

            // Inclinação contínua: Leste para Oeste -> Meio-dia (0) -> Oeste para Leste
            const skewX = Math.cos(progress * Math.PI) * CONFIG.maxSolarSkew;

            // Escala vertical: mínima ao meio-dia, longa no horizonte
            const zenithDist = Math.abs(progress - 0.5) * 2; // 1 nas bordas, 0 no meio-dia
            const scaleY = lerp(CONFIG.minNoonScaleY, CONFIG.maxHorizonScaleY, Math.pow(zenithDist, 1.5));

            // Crossfade suave no alvorecer e crepúsculo (primeiros e últimos 12% do dia)
            const altitudeSin = Math.sin(progress * Math.PI);
            const opacity = clamp(altitudeSin * 1.4, 0, 1);

            return {
                isDay: true,
                dayStrength: altitudeSin,
                skewX,
                scaleY,
                opacity
            };
        }

        // Período Noturno (Lua modulada pelas 8 fases)
        const nightDuration = 24 - (sunset - sunrise);
        const nightElapsed = decimalHour > sunset
            ? (decimalHour - sunset)
            : (24 - sunset + decimalHour);
        const nightProgress = clamp(nightElapsed / Math.max(1, nightDuration), 0, 1);

        const moonData = this.getMoonPhaseData();
        const skewX = Math.cos(nightProgress * Math.PI) * (CONFIG.maxSolarSkew * 0.9);
        const zenithDist = Math.abs(nightProgress - 0.5) * 2;
        const scaleY = lerp(CONFIG.minNoonScaleY * 1.15, CONFIG.maxHorizonScaleY * 0.95, Math.pow(zenithDist, 1.4));

        // A força da sombra noturna depende da elevação da lua E da porcentagem da fase lunar
        const moonAltitude = Math.sin(nightProgress * Math.PI);
        const maxNightShadowRatio = 0.75; // Na Lua Cheia, a sombra tem até 75% da força máxima do Sol
        const opacity = clamp(moonAltitude * moonData.illumination * maxNightShadowRatio, 0, maxNightShadowRatio);

        return {
            isDay: false,
            dayStrength: 0,
            skewX,
            scaleY,
            opacity
        };
    };

    /**
     * Calcula a tonalidade ambiental da tela (Screen Tint) de acordo com Hora + Fase da Lua
     */
    Game_System.prototype.getTargetAmbientTint = function() {
        if ($gameMap &&$gameMap.customAmbientTint()) {
            return $gameMap.customAmbientTint();
        }
        if ($gameMap &&$gameMap.isIndoorShadowMap()) {
            return [0, 0, 0, 0];
        }

        const decimalHour = this._rstHour + (this._rstMinute / 60);
        const sunrise = CONFIG.sunriseHour;
        const sunset = CONFIG.sunsetHour;
        const moonIllum = this.getMoonPhaseData().illumination;

        // Escuridão noturna: Lua Nova é muito escura (-135, -130, -95), Lua Cheia é azulada/prateada (-65, -55, -15)
        const nightR = lerp(-135, -65, moonIllum);
        const nightG = lerp(-130, -55, moonIllum);
        const nightB = lerp(-95, -15, moonIllum);
        const nightGray = lerp(65, 25, moonIllum);

        // Alvorada (sunrise - 1h até sunrise + 1.5h)
        if (decimalHour >= sunrise - 1 && decimalHour < sunrise + 1.5) {
            if (decimalHour < sunrise) {
                const t = decimalHour - (sunrise - 1);
                return [
                    lerp(nightR, 25, t),
                    lerp(nightG, -15, t),
                    lerp(nightB, -25, t),
                    lerp(nightGray, 10, t)
                ];
            } else {
                const t = (decimalHour - sunrise) / 1.5;
                return [
                    lerp(25, 0, t),
                    lerp(-15, 0, t),
                    lerp(-25, 0, t),
                    lerp(10, 0, t)
                ];
            }
        }

        // Dia Pleno
        if (decimalHour >= sunrise + 1.5 && decimalHour <= sunset - 1.5) {
            return [0, 0, 0, 0];
        }

        // Crepúsculo / Pôr do Sol (sunset - 1.5h até sunset + 1h)
        if (decimalHour > sunset - 1.5 && decimalHour <= sunset + 1) {
            if (decimalHour <= sunset) {
                const t = (decimalHour - (sunset - 1.5)) / 1.5;
                return [
                    lerp(0, 45, t),
                    lerp(0, -25, t),
                    lerp(0, -45, t),
                    lerp(0, 15, t)
                ];
            } else {
                const t = decimalHour - sunset;
                return [
                    lerp(45, nightR, t),
                    lerp(-25, nightG, t),
                    lerp(-45, nightB, t),
                    lerp(15, nightGray, t)
                ];
            }
        }

        // Noite
        return [nightR, nightG, nightB, nightGray];
    };

    //=========================================================================
    // GAME_MAP E GAME_CHARACTERBASE (Metadados e Luzes Pontuais)
    //=========================================================================

    const _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.call(this, mapId);
        this.setupShadowMapMeta();
    };

    Game_Map.prototype.setupShadowMapMeta = function() {
        const note = $dataMap && $dataMap.note ? $dataMap.note : "";
        this._isIndoorShadowMap = /<Indoor>/i.test(note);
        this._isShadowDisabledMap = /<NoShadows>/i.test(note);
        this._customAmbientTint = null;

        const tintMatch = note.match(/<ShadowAmbient:\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(\d+)>/i);
        if (tintMatch) {
            this._customAmbientTint = [
                Number(tintMatch[1]),
                Number(tintMatch[2]),
                Number(tintMatch[3]),
                Number(tintMatch[4])
            ];
        }
    };

    Game_Map.prototype.isIndoorShadowMap = function() {
        return !!this._isIndoorShadowMap;
    };

    Game_Map.prototype.isShadowDisabledMap = function() {
        return !!this._isShadowDisabledMap;
    };

    Game_Map.prototype.customAmbientTint = function() {
        return this._customAmbientTint || null;
    };

    Game_Map.prototype.getNearestLightSources = function(targetX, targetY, maxCount) {
        const sources = [];
        const events = this.events();

        for (let i = 0; i < events.length; i++) {
            const ev = events[i];
            if (!ev || ev._erased) continue;
            const meta = ev.shadowMeta();
            if (!meta || !meta.lightSource) continue;

            const dx = targetX - ev._realX;
            const dy = targetY - ev._realY;
            const distance = Math.hypot(dx, dy);

            if (distance < meta.lightSource.radius && distance > 0.01) {
                sources.push({
                    event: ev,
                    dx,
                    dy,
                    distance,
                    radius: meta.lightSource.radius,
                    intensity: meta.lightSource.intensity
                });
            }
        }

        sources.sort((a, b) => a.distance - b.distance);
        return sources.slice(0, maxCount);
    };

    Game_CharacterBase.prototype.shadowMeta = function() {
        return {
            noShadow: false,
            objectShadow: false,
            offsetX: 0,
            offsetY: 0,
            shadowScale: 1.0,
            lightSource: null
        };
    };

    Game_Vehicle.prototype.isVehicleShadowActive = function() {
        return this._mapId === $gameMap.mapId() && this.isTransparent() === false;
    };

    const _Game_Event_refresh = Game_Event.prototype.refresh;
    Game_Event.prototype.refresh = function() {
        _Game_Event_refresh.call(this);
        this._cachedShadowMeta = parseEventCommentTags(this);
    };

    Game_Event.prototype.shadowMeta = function() {
        if (!this._cachedShadowMeta) {
            this._cachedShadowMeta = parseEventCommentTags(this);
        }
        return this._cachedShadowMeta;
    };

    //=========================================================================
    // SPRITESET_MAP (Camada Unificada de Sombras, Filtros e Sincronização)
    //=========================================================================

    const _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
    Spriteset_Map.prototype.createCharacters = function() {
        this.createRealisticShadowContainer();
        _Spriteset_Map_createCharacters.call(this);
        this.createRealisticShadowsForAllCharacters();
    };

    Spriteset_Map.prototype.createRealisticShadowContainer = function() {
        // Contêiner de sombras posicionado no tilemap com z = 1.5 (acima do chão z=0/1, abaixo dos personagens z=3)
        this._realisticShadowContainer = new PIXI.Container();
        this._realisticShadowContainer.z = 1.5;

        const filters = [];
        if (CONFIG.shadowBlurStrength > 0) {
            const blurFilter = new PIXI.filters.BlurFilter(CONFIG.shadowBlurStrength, 2);
            filters.push(blurFilter);
        }

        // O AlphaFilter aplicado ao contêiner pai garante que sombras sobrepostas não fiquem duplamente escuras
        const alphaFilter = new PIXI.filters.AlphaFilter(CONFIG.maxShadowOpacity);
        filters.push(alphaFilter);

        this._realisticShadowContainer.filters = filters;
        this._tilemap.addChild(this._realisticShadowContainer);

        // Contêiner de brilho aditivo para fontes de luz (z = 8, acima dos personagens)
        this._pointLightGlowContainer = new PIXI.Container();
        this._pointLightGlowContainer.z = 8;
        this._tilemap.addChild(this._pointLightGlowContainer);

        this._trackedCharSprites = new WeakSet();
        this._shadowSpriteGroups = [];
    };

    Spriteset_Map.prototype.createRealisticShadowsForAllCharacters = function() {
        if (!this._characterSprites) return;
        for (const charSprite of this._characterSprites) {
            this.registerCharacterShadowSprites(charSprite);
        }
    };

    Spriteset_Map.prototype.registerCharacterShadowSprites = function(charSprite) {
        if (!charSprite || this._trackedCharSprites.has(charSprite)) return;
        this._trackedCharSprites.add(charSprite);

        const group = {
            charSprite,
            globalShadow: new Sprite_RealisticShadow(charSprite, "global", 0),
            pointShadows: [],
            lightGlow: null
        };

        this._realisticShadowContainer.addChild(group.globalShadow);

        for (let i = 0; i < CONFIG.maxPointLightSources; i++) {
            const ptShadow = new Sprite_RealisticShadow(charSprite, "point", i);
            this._realisticShadowContainer.addChild(ptShadow);
            group.pointShadows.push(ptShadow);
        }

        if (charSprite._character instanceof Game_Event) {
            const glowSprite = new Sprite_PointLightGlow(charSprite._character);
            this._pointLightGlowContainer.addChild(glowSprite);
            group.lightGlow = glowSprite;
        }

        this._shadowSpriteGroups.push(group);
    };

    const _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.call(this);
        this.updateRealisticShadowSystem();
    };

    Spriteset_Map.prototype.updateRealisticShadowSystem = function() {
        // Suporte a mapas procedurais: verifica se novos Sprite_Character foram adicionados ao _characterSprites
        if (this._characterSprites) {
            for (let i = 0; i < this._characterSprites.length; i++) {
                const spr = this._characterSprites[i];
                if (!this._trackedCharSprites.has(spr)) {
                    this.registerCharacterShadowSprites(spr);
                }
            }
        }

        // Atualiza todas as sombras e remove referências de sprites destruídos
        for (let i = this._shadowSpriteGroups.length - 1; i >= 0; i--) {
            const group = this._shadowSpriteGroups[i];
            if (!group.charSprite || group.charSprite._destroyed || !group.charSprite.parent) {
                this._realisticShadowContainer.removeChild(group.globalShadow);
                for (const pt of group.pointShadows) {
                    this._realisticShadowContainer.removeChild(pt);
                }
                if (group.lightGlow) {
                    this._pointLightGlowContainer.removeChild(group.lightGlow);
                }
                this._shadowSpriteGroups.splice(i, 1);
                continue;
            }

            group.globalShadow.update();
            for (let j = 0; j < group.pointShadows.length; j++) {
                group.pointShadows[j].update();
            }
            if (group.lightGlow) {
                group.lightGlow.update();
            }
        }
    };

    // Oculta a sombra oval padrão do RPG Maker MZ quando a silhueta realista está ativa
    const _Sprite_Character_updateOther = Sprite_Character.prototype.updateOther;
    Sprite_Character.prototype.updateOther = function() {
        _Sprite_Character_updateOther.call(this);
        if (this._shadowSprite && !$gameMap.isShadowDisabledMap()) {
            this._shadowSprite.visible = false;
        }
    };

    //=========================================================================
    // SCENE_MAP (Ciclo de Atualização, Ambiência e HUD)
    //=========================================================================

    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this.createTimeLunarHudWindow();
    };

    Scene_Map.prototype.createTimeLunarHudWindow = function() {
        const width = 250;
        const height = 76;
        const x = Graphics.boxWidth - width - 12;
        const y = 12;
        const rect = new Rectangle(x, y, width, height);
        this._timeLunarHudWindow = new Window_TimeLunarHud(rect);
        this.addWindow(this._timeLunarHudWindow);
    };

    const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);
        if (CONFIG.enableScreenTint) {
            const tint = $gameSystem.getTargetAmbientTint();$gameScreen.startTint(tint, 1);
        }
    };

    const _Scene_Map_updateMain = Scene_Map.prototype.updateMain;
    Scene_Map.prototype.updateMain = function() {
        _Scene_Map_updateMain.call(this);
        $gameSystem.updateRealisticClock();
        this.updateAmbientScreenTint();
    };

    Scene_Map.prototype.updateAmbientScreenTint = function() {
        if (!CONFIG.enableScreenTint) return;
        if (Graphics.frameCount % 30 !== 0) return; // Atualiza suavemente a cada meio segundo
        const targetTint = $gameSystem.getTargetAmbientTint();$gameScreen.startTint(targetTint, 30);
    };

    //=========================================================================
    // PLUGIN COMMANDS (RPG Maker MZ)
    //=========================================================================

    PluginManager.registerCommand(PLUGIN_NAME, "SetTime", args => {
        const hour = Number(args.hour || 0);
        const minute = Number(args.minute || 0);
        $gameSystem.setRealisticTime(hour, minute);
        if (CONFIG.enableScreenTint) {
            $gameScreen.startTint($gameSystem.getTargetAmbientTint(), 20);
        }
    });

    PluginManager.registerCommand(PLUGIN_NAME, "AddTime", args => {
        const hours = Number(args.hours || 0);
        const minutes = Number(args.minutes || 0);
        $gameSystem.addRealisticTime(hours, minutes);
        if (CONFIG.enableScreenTint) {
            $gameScreen.startTint($gameSystem.getTargetAmbientTint(), 20);
        }
    });

    PluginManager.registerCommand(PLUGIN_NAME, "SetMoonPhase", args => {
        const phase = Number(args.phase || 0);
        $gameSystem.setMoonPhaseIndex(phase);
        if (CONFIG.enableScreenTint) {
            $gameScreen.startTint($gameSystem.getTargetAmbientTint(), 20);
        }
    });

    PluginManager.registerCommand(PLUGIN_NAME, "PauseClock", args => {
        const pause = args.pause === "true";
        $gameSystem.setClockPaused(pause);
    });

    PluginManager.registerCommand(PLUGIN_NAME, "ToggleHud", args => {
        const show = args.show === "true";
        $gameSystem.setClockHudVisible(show);
    });

})();