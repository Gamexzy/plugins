/*:
 * @target MZ
 * @plugindesc [v2.0.0] Sistema Completo de Ciclo Dia/Noite, Fases da Lua, Iluminação Atmosférica HD-2D e Sombras Projetadas Coerentes.
 * @author Antigravity AI
 *
 * @param startHour
 * @text Hora Inicial (0-23)
 * @desc Hora do dia ao iniciar um novo jogo.
 * @type number
 * @min 0
 * @max 23
 * @default 8
 *
 * @param startMinute
 * @text Minuto Inicial (0-59)
 * @desc Minuto da hora ao iniciar um novo jogo.
 * @type number
 * @min 0
 * @max 59
 * @default 0
 *
 * @param dayDurationMinutes
 * @text Duração do Dia (Minutos Reais)
 * @desc Quantos minutos na vida real dura um ciclo completo de 24 horas no jogo.
 * @type number
 * @min 1
 * @max 1440
 * @default 24
 *
 * @param timeSwitchPause
 * @text Switch para Pausar Tempo
 * @desc ID da Switch que, quando LIGADA (ON), pausa a passagem do tempo (0 = nenhum).
 * @type switch
 * @default 0
 *
 * @param showClockHud
 * @text Mostrar Relógio na Tela
 * @desc Exibe um HUD elegante com a hora atual, fase da lua e período do dia no mapa.
 * @type boolean
 * @default true
 *
 * @param clockX
 * @text Posição X do Relógio
 * @desc Coordenada X do HUD do relógio no mapa.
 * @type number
 * @default 16
 *
 * @param clockY
 * @text Posição Y do Relógio
 * @desc Coordenada Y do HUD do relógio no mapa.
 * @type number
 * @default 16
 *
 * @param hourVariableId
 * @text Variável: Hora Atual
 * @desc ID da variável do jogo onde a hora atual (0-23) será gravada (0 = desativado).
 * @type variable
 * @default 0
 *
 * @param minuteVariableId
 * @text Variável: Minuto Atual
 * @desc ID da variável do jogo onde o minuto atual (0-59) será gravado (0 = desativado).
 * @type variable
 * @default 0
 *
 * @param dayVariableId
 * @text Variável: Contador de Dias
 * @desc ID da variável do jogo onde o total de dias decorridos será gravado (0 = desativado).
 * @type variable
 * @default 0
 *
 * @param periodVariableId
 * @text Variável: Período do Dia
 * @desc Grava o período: 0=Madrugada, 1=Amanhecer, 2=Dia, 3=Entardecer, 4=Noite (0 = desativado).
 * @type variable
 * @default 0
 *
 * @param isNightSwitchId
 * @text Switch: Está de Noite?
 * @desc Switch ligada automaticamente entre 19:00 e 05:59 (0 = desativado).
 * @type switch
 * @default 0
 *
 * @param moonPhaseVariableId
 * @text Variável: Fase da Lua (0-7)
 * @desc Grava a fase da lua: 0=Nova, 1=Cresc. Côncava, 2=Quarto Cresc., 3=Cresc. Gibosa, 4=Cheia, 5=Ming. Gibosa, 6=Quarto Ming., 7=Ming. Côncava.
 * @type variable
 * @default 0
 *
 * @param startMoonPhase
 * @text Fase Inicial da Lua (0-7)
 * @desc Fase da lua no Dia 1 (0 = Lua Nova, 2 = Quarto Crescente, 4 = Lua Cheia).
 * @type number
 * @min 0
 * @max 7
 * @default 2
 *
 * @param playerLightSwitchId
 * @text Switch: Lanterna do Jogador
 * @desc Quando ligada, o jogador emite um halo de luz próprio ao seu redor (0 = sempre ativo à noite).
 * @type switch
 * @default 0
 *
 * @param playerLightRadius
 * @text Raio da Luz do Jogador
 * @desc Raio em pixels da luz da lanterna do jogador.
 * @type number
 * @default 160
 *
 * @param playerLightColor
 * @text Cor da Luz do Jogador
 * @desc Cor hexadecimal da lanterna do jogador.
 * @type string
 * @default #ffbb66
 *
 * @param enableDynamicShadows
 * @text Sombras Solares Dinâmicas
 * @desc Projeta sombras reais no chão para o jogador, eventos e estruturas de acordo com o ângulo do Sol e da Lua.
 * @type boolean
 * @default true
 *
 * @param enableTileShadows
 * @text Sombras de Estruturas do Mapa (Tiles)
 * @desc Faz árvores, muros, casas e pilares projetarem sombras contínuas com perspectiva 2.5D coerente.
 * @type boolean
 * @default true
 *
 * @param shadowIntensity
 * @text Intensidade das Sombras (%)
 * @desc Opacidade máxima das sombras projetadas ao meio-dia (50 a 200%).
 * @type number
 * @min 20
 * @max 200
 * @default 100
 *
 * @param shadowLengthMultiplier
 * @text Comprimento das Sombras (%)
 * @desc Multiplicador do comprimento das sombras projetadas (50 a 250%).
 * @type number
 * @min 50
 * @max 250
 * @default 110
 *
 * @param shadowWidthMultiplier
 * @text Largura das Sombras (%)
 * @desc Multiplicador da escala/largura geral das sombras projetadas (50 a 250%).
 * @type number
 * @min 50
 * @max 250
 * @default 100
 *
 * @command setTime
 * @text Definir Hora
 * @desc Define imediatamente a hora e o minuto do jogo.
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
 * @command addTime
 * @text Avançar Tempo
 * @desc Avança o relógio em horas e minutos.
 *
 * @arg hours
 * @text Horas a avançar
 * @type number
 * @min 0
 * @default 1
 *
 * @arg minutes
 * @text Minutos a avançar
 * @type number
 * @min 0
 * @default 0
 *
 * @command pauseTime
 * @text Pausar / Retomar Tempo
 * @desc Pausa ou retoma a contagem automática de tempo.
 *
 * @arg pause
 * @text Pausar?
 * @type boolean
 * @default true
 *
 * @command SetTimeSpeed
 * @text Definir Velocidade do Tempo
 * @desc Altera quantos minutos reais dura um dia completo no jogo.
 *
 * @arg speed
 * @text Minutos Reais por Dia
 * @type number
 * @min 1
 * @max 1440
 * @default 24
 *
 * @command setMoonPhase
 * @text Definir Fase da Lua
 * @desc Altera imediatamente a fase da lua atual (0 = Nova, 4 = Cheia, 0-7).
 *
 * @arg phase
 * @text Fase (0 a 7)
 * @type number
 * @min 0
 * @max 7
 * @default 4
 *
 * @help
 * ============================================================================
 * DayNightSystem.js [v2.0.0] - Iluminação HD-2D & Sombras Coerentes
 * ============================================================================
 *
 * Novidades da v2.0.0:
 * 1. Geometria Solar/Lunar 2.5D Unificada:
 *    - Personagens, árvores, muros, pilares e telhados usam exatamente a mesma
 *      matriz de projeção afim no plano do chão:
 *        [ x' ] = [ 1  -Sx ] [ x ]
 *        [ y' ]   [ 0   Sy ] [ y ]
 *      ancorada na linha de base real (y_base) de cada estrutura!
 *    - Corrige a inversão onde personagens e tiles projetavam sombras em
 *      direções opostas.
 * 2. Sombras de Estruturas Sem Costuras (Zero Grid Seams):
 *    - Agrupa colunas verticais conectadas (tronco + copa '*' / parede + telhado)
 *      na mesma âncora terrestre (ty_base), projetando árvores e construções
 *      inteiras como uma única silhueta contínua com penumbra suave em 3 passes.
 *    - Usa normalização de alfa via 'source-in' para evitar escurecimento duplo
 *      entre tiles adjacentes.
 * 3. Reação Dinâmica a Luzes Locais:
 *    - Ao caminhar perto de tochas, fogueiras ou matrizes luminosas, a sombra
 *      dos personagens se inclina suavemente na direção oposta à fonte de luz.
 * 4. Iluminação Atmosférica & Bloom Aditivo (PIXI.BLEND_MODES.ADD):
 *    - Camada de ambiência com vinheta cinematográfica sutil + camada separada
 *      de Bloom Aditivo para que tochas, cristais e lanternas realmente brilhem.
 *
 * ----------------------------------------------------------------------------
 * TAGS PARA NOTAS DO MAPA (Map Note):
 * ----------------------------------------------------------------------------
 *   <NoDayNight> ou <Indoor>
 *     Desativa completamente o efeito de luz e escuridão neste mapa.
 *
 *   <AmbientDarkness: 75>
 *     Define uma escuridão fixa para o mapa (0 a 100%).
 *
 *   <Sunless>
 *     Bloqueia a luz direta do Sol/Lua (ideal para cavernas).
 *
 * ----------------------------------------------------------------------------
 * TAGS PARA EVENTOS (Nota do Evento ou Comentário na Página Ativa):
 * ----------------------------------------------------------------------------
 *   <light: RAIO, #COR>     Ex: <light: 180, #ffaa44>
 *   <torch> / <tocha>       Luz de tocha bruxuleante (raio 150, laranja quente)
 *   <bonfire> / <fogueira>  Luz de fogueira intensa (raio 230, fogo)
 *   <lantern> / <lanterna>  Luz de poste/lanterna (raio 160, dourado suave)
 *   <crystal> / <cristal>   Luz espiritual/cristal (raio 140, ciano místico)
 *   <candle> / <vela>       Luz de vela suave (raio 95, âmbar)
 *   <noShadow> / <semSombra> Desativa a sombra projetada neste evento
 * ============================================================================
 */

(() => {
    'use strict';

    const pluginName = "DayNightSystem";
    const parameters = PluginManager.parameters(pluginName);

    const defaultStartHour = Number(parameters['startHour'] || 8);
    const defaultStartMinute = Number(parameters['startMinute'] || 0);
    const defaultDayDuration = Math.max(1, Number(parameters['dayDurationMinutes'] || 24));
    const timeSwitchPause = Number(parameters['timeSwitchPause'] || 0);
    const showClockHud = String(parameters['showClockHud'] || 'true') === 'true';
    const clockX = Number(parameters['clockX'] || 16);
    const clockY = Number(parameters['clockY'] || 16);

    const hourVariableId = Number(parameters['hourVariableId'] || 0);
    const minuteVariableId = Number(parameters['minuteVariableId'] || 0);
    const dayVariableId = Number(parameters['dayVariableId'] || 0);
    const periodVariableId = Number(parameters['periodVariableId'] || 0);
    const isNightSwitchId = Number(parameters['isNightSwitchId'] || 0);
    const moonPhaseVariableId = Number(parameters['moonPhaseVariableId'] || 0);
    const startMoonPhase = Math.max(0, Math.min(7, Number(parameters['startMoonPhase'] !== undefined ? parameters['startMoonPhase'] : 2)));

    const playerLightSwitchId = Number(parameters['playerLightSwitchId'] || 0);
    const playerLightRadius = Number(parameters['playerLightRadius'] || 160);
    const playerLightColor = String(parameters['playerLightColor'] || '#ffbb66');

    const enableDynamicShadows = String(parameters['enableDynamicShadows'] || 'true') === 'true';
    const enableTileShadows = String(parameters['enableTileShadows'] || 'true') === 'true';
    const shadowIntensity = Math.max(20, Math.min(200, Number(parameters['shadowIntensity'] || 100))) / 100;
    const shadowLengthMultiplier = Math.max(50, Math.min(250, Number(parameters['shadowLengthMultiplier'] || 110))) / 100;
    const shadowWidthMultiplier = Math.max(50, Math.min(250, Number(parameters['shadowWidthMultiplier'] || 100))) / 100;

    // =========================================================================
    // 1. Fases da Lua & Paleta Atmosférica Cinematográfica (24 Horas)
    // =========================================================================

    const MOON_PHASES = [
        { index: 0, name: "Lua Nova",         illumination: 0.00, r: 2,  g: 3,  b: 10, alpha: 0.95, shadowStrength: 0.08 },
        { index: 1, name: "Cresc. Côncava",   illumination: 0.22, r: 3,  g: 5,  b: 14, alpha: 0.91, shadowStrength: 0.18 },
        { index: 2, name: "Quarto Crescente", illumination: 0.50, r: 5,  g: 9,  b: 22, alpha: 0.87, shadowStrength: 0.32 },
        { index: 3, name: "Cresc. Gibosa",    illumination: 0.78, r: 7,  g: 13, b: 28, alpha: 0.82, shadowStrength: 0.46 },
        { index: 4, name: "Lua Cheia",        illumination: 1.00, r: 10, g: 18, b: 38, alpha: 0.75, shadowStrength: 0.65 },
        { index: 5, name: "Ming. Gibosa",     illumination: 0.78, r: 7,  g: 13, b: 28, alpha: 0.82, shadowStrength: 0.46 },
        { index: 6, name: "Quarto Minguante", illumination: 0.50, r: 5,  g: 9,  b: 22, alpha: 0.87, shadowStrength: 0.32 },
        { index: 7, name: "Ming. Côncava",    illumination: 0.22, r: 3,  g: 5,  b: 14, alpha: 0.91, shadowStrength: 0.18 }
    ];

    function getMoonPhaseData(phaseIndex) {
        const idx = ((Math.floor(phaseIndex) % 8) + 8) % 8;
        return MOON_PHASES[idx];
    }

    /**
     * Paleta de iluminação ambiente de 24 horas:
     * r, g, b, alpha: camada atmosférica
     * shadowR, shadowG, shadowB: temperatura de cor das sombras projetadas no chão
     * vignette: intensidade da vinheta atmosférica nas bordas da tela
     */
    const TIME_KEYFRAMES = [
        { hour: 0,    r: 4,   g: 7,   b: 18,  alpha: 0.88, sr: 4,  sg: 8,  sb: 20, vig: 0.32, period: 0, label: "Meia-Noite" },
        { hour: 4,    r: 6,   g: 9,   b: 22,  alpha: 0.86, sr: 6,  sg: 10, sb: 24, vig: 0.30, period: 0, label: "Madrugada" },
        { hour: 5,    r: 36,  g: 24,  b: 58,  alpha: 0.58, sr: 20, sg: 14, sb: 36, vig: 0.18, period: 1, label: "Alvorada" },
        { hour: 6,    r: 255, g: 148, b: 96,  alpha: 0.22, sr: 28, sg: 22, sb: 46, vig: 0.08, period: 1, label: "Amanhecer" },
        { hour: 7.5,  r: 255, g: 225, b: 175, alpha: 0.08, sr: 20, sg: 26, sb: 44, vig: 0.03, period: 2, label: "Manhã" },
        { hour: 10,   r: 255, g: 255, b: 255, alpha: 0.00, sr: 16, sg: 22, sb: 38, vig: 0.00, period: 2, label: "Manhã" },
        { hour: 12,   r: 255, g: 255, b: 245, alpha: 0.00, sr: 14, sg: 20, sb: 36, vig: 0.00, period: 2, label: "Meio-Dia" },
        { hour: 15.5, r: 255, g: 242, b: 215, alpha: 0.04, sr: 18, sg: 22, sb: 40, vig: 0.02, period: 2, label: "Tarde" },
        { hour: 17,   r: 255, g: 168, b: 78,  alpha: 0.22, sr: 26, sg: 20, sb: 44, vig: 0.10, period: 3, label: "Hora Dourada" },
        { hour: 18,   r: 210, g: 80,  b: 68,  alpha: 0.42, sr: 22, sg: 14, sb: 38, vig: 0.16, period: 3, label: "Pôr do Sol" },
        { hour: 19,   r: 42,  g: 22,  b: 62,  alpha: 0.72, sr: 10, sg: 10, sb: 28, vig: 0.24, period: 4, label: "Crepúsculo" },
        { hour: 20.5, r: 6,   g: 10,  b: 24,  alpha: 0.86, sr: 6,  sg: 10, sb: 24, vig: 0.30, period: 4, label: "Noite" },
        { hour: 24,   r: 4,   g: 7,   b: 18,  alpha: 0.88, sr: 4,  sg: 8,  sb: 20, vig: 0.32, period: 0, label: "Meia-Noite" }
    ];

    function smoothstep(t) {
        const c = Math.max(0, Math.min(1, t));
        return c * c * (3 - 2 * c);
    }

    function getAmbientLightForTime(totalMinutes) {
        const currentHour = (totalMinutes / 60) % 24;
        let k1 = TIME_KEYFRAMES[0];
        let k2 = TIME_KEYFRAMES[TIME_KEYFRAMES.length - 1];

        for (let i = 0; i < TIME_KEYFRAMES.length - 1; i++) {
            if (currentHour >= TIME_KEYFRAMES[i].hour && currentHour <= TIME_KEYFRAMES[i + 1].hour) {
                k1 = TIME_KEYFRAMES[i];
                k2 = TIME_KEYFRAMES[i + 1];
                break;
            }
        }

        const range = k2.hour - k1.hour;
        const rawT = range > 0 ? (currentHour - k1.hour) / range : 0;
        const t = smoothstep(rawT);

        const moonIdx = ($gameSystem && $gameSystem.dayNightMoonPhase) ? $gameSystem.dayNightMoonPhase() : startMoonPhase;
        const moonData = getMoonPhaseData(moonIdx);

        function resolveEndpoint(kf) {
            if (kf.hour <= 4.2 || kf.hour >= 20.2) {
                return {
                    r: moonData.r,
                    g: moonData.g,
                    b: moonData.b,
                    alpha: moonData.alpha,
                    sr: kf.sr,
                    sg: kf.sg,
                    sb: kf.sb,
                    vig: kf.vig
                };
            }
            if (kf.hour === 19) {
                return {
                    r: Math.round(kf.r * 0.65 + moonData.r * 0.35),
                    g: Math.round(kf.g * 0.65 + moonData.g * 0.35),
                    b: Math.round(kf.b * 0.65 + moonData.b * 0.35),
                    alpha: kf.alpha * 0.65 + moonData.alpha * 0.35,
                    sr: kf.sr,
                    sg: kf.sg,
                    sb: kf.sb,
                    vig: kf.vig
                };
            }
            return kf;
        }

        const e1 = resolveEndpoint(k1);
        const e2 = resolveEndpoint(k2);

        return {
            r: Math.round(e1.r + (e2.r - e1.r) * t),
            g: Math.round(e1.g + (e2.g - e1.g) * t),
            b: Math.round(e1.b + (e2.b - e1.b) * t),
            alpha: Number((e1.alpha + (e2.alpha - e1.alpha) * t).toFixed(3)),
            shadowR: Math.round(e1.sr + (e2.sr - e1.sr) * t),
            shadowG: Math.round(e1.sg + (e2.sg - e1.sg) * t),
            shadowB: Math.round(e1.sb + (e2.sb - e1.sb) * t),
            vignette: Number((e1.vig + (e2.vig - e1.vig) * t).toFixed(3)),
            period: rawT < 0.5 ? k1.period : k2.period,
            label: rawT < 0.5 ? k1.label : k2.label
        };
    }

    /**
     * Geometria Solar/Lunar 2.5D Unificada:
     * Retorna o vetor de projeção de sombra (sx, sy) por unidade de altura h acima da base:
     *   - sx < 0: sombra aponta para Oeste (Esquerda na tela, manhã)
     *   - sx > 0: sombra aponta para Leste (Direita na tela, tarde)
     *   - sy > 0: compressão vertical da sombra projetada no plano do chão (para o Norte/fundo 2.5D)
     *
     * Tanto o Canvas2D (tiles) quanto o PIXI.Sprite (personagens) usam a MESMA matriz:
     *   [ a  c ] = [ 1  -sx ]
     *   [ b  d ]   [ 0   sy ]
     * No PIXI (onde c = sin(skewX)*scaleY e d = cos(skewX)*scaleY):
     *   skewX  = Math.atan2(-sx, sy)
     *   scaleY = +Math.hypot(sx, sy)
     */
    function getSolarShadowTransform(totalMinutes) {
        if ($gameSystem && $gameSystem.isDayNightIndoor()) {
            return { sx: 0, sy: 0.45, skewX: 0, scaleY: 0.45, opacity: 0, isDaylight: false, isMoonlight: false };
        }
        if ($gameSystem && $gameSystem.isMapSunless && $gameSystem.isMapSunless()) {
            return { sx: 0, sy: 0.45, skewX: 0, scaleY: 0.45, opacity: 0, isDaylight: false, isMoonlight: false };
        }

        const currentHour = (totalMinutes / 60) % 24;
        const lenMult = shadowLengthMultiplier * shadowWidthMultiplier;

        // Transição suave entre Sol (05:15 - 19:00) e Lua (18:45 - 05:30)
        let sunWeight = 0;
        if (currentHour >= 5.25 && currentHour <= 19.0) {
            if (currentHour < 6.25) {
                sunWeight = smoothstep((currentHour - 5.25) / 1.0);
            } else if (currentHour > 18.0) {
                sunWeight = 1.0 - smoothstep((currentHour - 18.0) / 1.0);
            } else {
                sunWeight = 1.0;
            }
        }

        // --- Vetor Solar (05:15 às 19:00) ---
        // Sol nasce a Leste (direita -> sombra para Oeste sx < 0), passa pelo zênite às 12:00 (sx = 0),
        // e se põe a Oeste (esquerda -> sombra para Leste sx > 0).
        const dayProgress = Math.max(0, Math.min(1, (currentHour - 5.25) / (19.0 - 5.25)));
        const sunAngle = dayProgress * Math.PI; // 0 (nascer) -> PI/2 (meio-dia) -> PI (pôr do sol)
        const sunElevation = Math.sin(sunAngle); // 0 no horizonte -> 1 no meio-dia
        const sunHoriz = -Math.cos(sunAngle);    // -1 (manhã, sombra p/ esquerda) -> +1 (tarde, sombra p/ direita)

        const sunSx = sunHoriz * 0.92 * lenMult;
        const sunSy = (0.38 + (1.0 - sunElevation) * 0.34) * lenMult;
        const sunOpacity = (0.24 + 0.34 * Math.pow(sunElevation, 0.65)) * shadowIntensity;

        // --- Vetor Lunar (18:45 às 05:30) ---
        let nightHours = currentHour >= 18.75 ? (currentHour - 18.75) : (currentHour + (24 - 18.75));
        const nightProgress = Math.max(0, Math.min(1, nightHours / 10.75));
        const moonAngle = nightProgress * Math.PI;
        const moonElevation = Math.sin(moonAngle);
        const moonHoriz = -Math.cos(moonAngle);

        const moonIdx = ($gameSystem && $gameSystem.dayNightMoonPhase) ? $gameSystem.dayNightMoonPhase() : startMoonPhase;
        const moonData = getMoonPhaseData(moonIdx);

        const moonSx = moonHoriz * 0.78 * lenMult;
        const moonSy = (0.36 + (1.0 - moonElevation) * 0.28) * lenMult;
        const moonOpacity = (0.08 + 0.34 * moonElevation) * moonData.shadowStrength * shadowIntensity;

        // --- Interpolação Contínua Sol <-> Lua (zero saltos na alvorada/crepúsculo) ---
        const sx = sunSx * sunWeight + moonSx * (1.0 - sunWeight);
        const sy = Math.max(0.22, sunSy * sunWeight + moonSy * (1.0 - sunWeight));
        const opacity = Math.min(0.68, sunOpacity * sunWeight + moonOpacity * (1.0 - sunWeight));

        // Conversão exata para PIXI.Sprite (onde lt.c = sin(skewX)*scaleY = -sx e lt.d = cos(skewX)*scaleY = sy)
        const skewX = Math.atan2(-sx, sy);
        const scaleY = Math.hypot(sx, sy);

        return {
            sx,
            sy,
            skewX,
            scaleY,
            opacity,
            elevation: sunWeight >= 0.5 ? sunElevation : moonElevation,
            isDaylight: sunWeight >= 0.5,
            isMoonlight: sunWeight < 0.5 && opacity > 0.01
        };
    }

    function hexToRgb(hex) {
        const cleanHex = String(hex || '#ffbb66').trim().replace('#', '');
        if (cleanHex.length === 3) {
            return {
                r: parseInt(cleanHex[0] + cleanHex[0], 16) || 255,
                g: parseInt(cleanHex[1] + cleanHex[1], 16) || 187,
                b: parseInt(cleanHex[2] + cleanHex[2], 16) || 102
            };
        }
        const bigint = parseInt(cleanHex, 16);
        if (isNaN(bigint)) return { r: 255, g: 187, b: 102 };
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    // =========================================================================
    // 2. Comandos de Plugin
    // =========================================================================

    PluginManager.registerCommand(pluginName, "setTime", args => {
        const h = Number(args.hour || 0);
        const m = Number(args.minute || 0);
        if ($gameSystem) $gameSystem.setTime(h, m);
    });

    PluginManager.registerCommand(pluginName, "addTime", args => {
        const h = Number(args.hours || 0);
        const m = Number(args.minutes || 0);
        if ($gameSystem) $gameSystem.addTime(h, m);
    });

    PluginManager.registerCommand(pluginName, "pauseTime", args => {
        const p = String(args.pause) === 'true';
        if ($gameSystem) $gameSystem.setTimePaused(p);
    });

    PluginManager.registerCommand(pluginName, "SetTimeSpeed", args => {
        const speed = Math.max(1, Number(args.speed || 24));
        if ($gameSystem) $gameSystem.setTimeSpeed(speed);
    });

    PluginManager.registerCommand(pluginName, "setMoonPhase", args => {
        const phase = Math.max(0, Math.min(7, Number(args.phase || 0)));
        if ($gameSystem) $gameSystem.setMoonPhase(phase);
    });

    // =========================================================================
    // 3. Game_System - Gerenciamento do Tempo e Estado Global
    // =========================================================================

    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this.initDayNightSystem();
    };

    Game_System.prototype.initDayNightSystem = function() {
        if (this._dayNightTotalMinutes === undefined) {
            this._dayNightTotalMinutes = defaultStartHour * 60 + defaultStartMinute;
        }
        if (this._dayNightDays === undefined) {
            this._dayNightDays = 1;
        }
        if (this._dayNightPaused === undefined) {
            this._dayNightPaused = false;
        }
        if (this._dayNightSpeedMinutes === undefined) {
            this._dayNightSpeedMinutes = defaultDayDuration;
        }
        if (this._dayNightMoonPhase === undefined) {
            this._dayNightMoonPhase = startMoonPhase;
        }
    };

    Game_System.prototype.dayNightHour = function() {
        this.initDayNightSystem();
        return Math.floor(this._dayNightTotalMinutes / 60) % 24;
    };

    Game_System.prototype.dayNightMinute = function() {
        this.initDayNightSystem();
        return Math.floor(this._dayNightTotalMinutes) % 60;
    };

    Game_System.prototype.dayNightTotalMinutes = function() {
        this.initDayNightSystem();
        return this._dayNightTotalMinutes;
    };

    Game_System.prototype.dayNightDay = function() {
        this.initDayNightSystem();
        return this._dayNightDays;
    };

    Game_System.prototype.dayNightMoonPhase = function() {
        this.initDayNightSystem();
        return this._dayNightMoonPhase;
    };

    Game_System.prototype.dayNightMoonName = function() {
        return getMoonPhaseData(this.dayNightMoonPhase()).name;
    };

    Game_System.prototype.setMoonPhase = function(phase) {
        this.initDayNightSystem();
        this._dayNightMoonPhase = ((Math.floor(Number(phase) || 0) % 8) + 8) % 8;
        this.syncDayNightVariables();
    };

    Game_System.prototype.isNight = function() {
        const h = this.dayNightHour();
        return h >= 19 || h < 6;
    };

    Game_System.prototype.setTime = function(hour, minute) {
        this.initDayNightSystem();
        const h = Math.max(0, Math.min(23, Number(hour) || 0));
        const m = Math.max(0, Math.min(59, Number(minute) || 0));
        this._dayNightTotalMinutes = h * 60 + m;
        this.syncDayNightVariables();
    };

    Game_System.prototype.addTime = function(hours, minutes) {
        this.initDayNightSystem();
        const totalToAdd = (Number(hours) || 0) * 60 + (Number(minutes) || 0);
        this._dayNightTotalMinutes += totalToAdd;
        while (this._dayNightTotalMinutes >= 1440) {
            this._dayNightTotalMinutes -= 1440;
            this._dayNightDays++;
            this._dayNightMoonPhase = (this._dayNightMoonPhase + 1) % 8;
        }
        while (this._dayNightTotalMinutes < 0) {
            this._dayNightTotalMinutes += 1440;
            this._dayNightDays = Math.max(1, this._dayNightDays - 1);
            this._dayNightMoonPhase = (this._dayNightMoonPhase + 7) % 8;
        }
        this.syncDayNightVariables();
    };

    Game_System.prototype.setTimePaused = function(paused) {
        this.initDayNightSystem();
        this._dayNightPaused = !!paused;
    };

    Game_System.prototype.setTimeSpeed = function(minutesPerDay) {
        this.initDayNightSystem();
        this._dayNightSpeedMinutes = Math.max(1, Number(minutesPerDay) || defaultDayDuration);
    };

    Game_System.prototype.isTimePaused = function() {
        this.initDayNightSystem();
        if (this._dayNightPaused) return true;
        if (timeSwitchPause > 0 && $gameSwitches && $gameSwitches.value(timeSwitchPause)) {
            return true;
        }
        if ($gameMessage && $gameMessage.isBusy()) return true;
        if ($gameMap && $gameMap.isEventRunning()) return true;
        return false;
    };

    Game_System.prototype.updateDayNight = function() {
        if (this.isTimePaused()) return;

        const realFramesPerDay = this._dayNightSpeedMinutes * 60 * 60;
        const gameMinutesPerFrame = 1440 / realFramesPerDay;

        const prevMinute = Math.floor(this._dayNightTotalMinutes);
        this._dayNightTotalMinutes += gameMinutesPerFrame;

        if (this._dayNightTotalMinutes >= 1440) {
            this._dayNightTotalMinutes -= 1440;
            this._dayNightDays++;
            this._dayNightMoonPhase = (this._dayNightMoonPhase + 1) % 8;
        }

        const currentMinute = Math.floor(this._dayNightTotalMinutes);
        if (currentMinute !== prevMinute) {
            this.syncDayNightVariables();
        }
    };

    Game_System.prototype.syncDayNightVariables = function() {
        if (!$gameVariables || !$gameSwitches) return;

        const h = this.dayNightHour();
        const m = this.dayNightMinute();
        const d = this.dayNightDay();
        const lightInfo = getAmbientLightForTime(this._dayNightTotalMinutes);

        if (hourVariableId > 0) $gameVariables.setValue(hourVariableId, h);
        if (minuteVariableId > 0) $gameVariables.setValue(minuteVariableId, m);
        if (dayVariableId > 0) $gameVariables.setValue(dayVariableId, d);
        if (periodVariableId > 0) $gameVariables.setValue(periodVariableId, lightInfo.period);
        if (moonPhaseVariableId > 0) $gameVariables.setValue(moonPhaseVariableId, this.dayNightMoonPhase());
        if (isNightSwitchId > 0) $gameSwitches.setValue(isNightSwitchId, this.isNight());
    };

    Game_System.prototype.isDayNightIndoor = function() {
        if (!$dataMap || !$dataMap.note) return false;
        const note = $dataMap.note;
        return /<(?:NoDayNight|Indoor)>/i.test(note);
    };

    Game_System.prototype.getMapAmbientDarkness = function() {
        if (!$dataMap || !$dataMap.note) return null;
        const match = $dataMap.note.match(/<AmbientDarkness:\s*(\d+)>/i);
        if (match) {
            return Math.max(0, Math.min(100, Number(match[1]))) / 100;
        }
        return null;
    };

    Game_System.prototype.isMapSunless = function() {
        if (!$dataMap || !$dataMap.note) return false;
        if (/<Sunless>/i.test($dataMap.note)) return true;
        return this.getMapAmbientDarkness() !== null;
    };

    // =========================================================================
    // 4. Detecção de Fontes de Luz e Tags de Sombra em Eventos (Game_Event)
    // =========================================================================

    const LIGHT_PRESETS = {
        torch:   { radius: 155, color: '#ff9933', flicker: true,  intensity: 1.0 },
        tocha:   { radius: 155, color: '#ff9933', flicker: true,  intensity: 1.0 },
        fire:    { radius: 185, color: '#ff7722', flicker: true,  intensity: 1.1 },
        fogo:    { radius: 185, color: '#ff7722', flicker: true,  intensity: 1.1 },
        bonfire: { radius: 235, color: '#ff6611', flicker: true,  intensity: 1.2 },
        fogueira:{ radius: 235, color: '#ff6611', flicker: true,  intensity: 1.2 },
        lantern: { radius: 165, color: '#ffcc66', flicker: false, intensity: 0.95 },
        lanterna:{ radius: 165, color: '#ffcc66', flicker: false, intensity: 0.95 },
        crystal: { radius: 145, color: '#55eeff', flicker: false, intensity: 0.95 },
        cristal: { radius: 145, color: '#55eeff', flicker: false, intensity: 0.95 },
        candle:  { radius: 95,  color: '#ffbb55', flicker: true,  intensity: 0.85 },
        vela:    { radius: 95,  color: '#ffbb55', flicker: true,  intensity: 0.85 }
    };

    function parseLightTagFromText(text) {
        if (!text) return null;

        const customMatch = text.match(/<light:\s*(\d+)\s*(?:,\s*([#a-zA-Z0-9]+))?\s*(?:,\s*(flicker))?\s*>/i);
        if (customMatch) {
            return {
                radius: Number(customMatch[1]) || 140,
                color: customMatch[2] || '#ffbb66',
                flicker: Boolean(customMatch[3]),
                intensity: 1.0
            };
        }

        const presetMatch = text.match(/<(torch|tocha|fire|fogo|bonfire|fogueira|lantern|lanterna|crystal|cristal|candle|vela)>/i);
        if (presetMatch) {
            const key = presetMatch[1].toLowerCase();
            return Object.assign({}, LIGHT_PRESETS[key]);
        }

        return null;
    }

    function parseNoShadowTagFromText(text) {
        if (!text) return false;
        return /<(?:noShadow|semSombra)>/i.test(text);
    }

    const _Game_Event_setupPage = Game_Event.prototype.setupPage;
    Game_Event.prototype.setupPage = function() {
        _Game_Event_setupPage.call(this);
        this.refreshDayNightLightData();
    };

    Game_Event.prototype.refreshDayNightLightData = function() {
        this._dayNightLightData = null;
        this._dayNightNoShadow = false;
        const ev = this.event();
        if (!ev) return;

        if (parseNoShadowTagFromText(ev.note)) {
            this._dayNightNoShadow = true;
        }

        if (this.page() && this.list()) {
            for (const cmd of this.list()) {
                if (cmd.code === 108 || cmd.code === 408) {
                    const comment = cmd.parameters[0];
                    if (parseNoShadowTagFromText(comment)) {
                        this._dayNightNoShadow = true;
                    }
                    const parsed = parseLightTagFromText(comment);
                    if (parsed) {
                        this._dayNightLightData = parsed;
                        this._dayNightLightSeed = (this.eventId() * 137) % 1000;
                        return;
                    }
                }
            }
        }

        const noteLight = parseLightTagFromText(ev.note);
        if (noteLight) {
            this._dayNightLightData = noteLight;
            this._dayNightLightSeed = (this.eventId() * 137) % 1000;
        }
    };

    Game_Event.prototype.getDayNightLightData = function() {
        if (this._dayNightLightData === undefined) {
            this.refreshDayNightLightData();
        }
        return this._dayNightLightData;
    };

    Game_Event.prototype.hasNoSunShadow = function() {
        if (this._dayNightNoShadow === undefined) {
            this.refreshDayNightLightData();
        }
        return Boolean(this._dayNightNoShadow);
    };

    // =========================================================================
    // 5. Camadas de Iluminação HD-2D, Bloom Aditivo e Sombras de Estruturas
    // =========================================================================

    const _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _Spriteset_Map_createLowerLayer.call(this);
        this.createDayNightTileShadows();
        this.createDayNightOverlay();
    };

    Spriteset_Map.prototype.createDayNightTileShadows = function() {
        const width = Graphics.width;
        const height = Graphics.height;

        // Bitmap final exibido no Tilemap em z = 1.5 (acima do chão z=0, abaixo de personagens z=3 e copas '*' z=4)
        this._dayNightTileShadowBitmap = new Bitmap(width, height);
        // Único buffer de trabalho offscreen para composição sem costuras via 'source-in'
        this._shadowWorkBitmap = new Bitmap(width, height);

        this._dayNightTileShadowSprite = new Sprite(this._dayNightTileShadowBitmap);
        this._dayNightTileShadowSprite.z = 1.5;
        this._tilemap.addChild(this._dayNightTileShadowSprite);

        this._lastShadowState = null;
    };

    Spriteset_Map.prototype.createDayNightOverlay = function() {
        const width = Graphics.width;
        const height = Graphics.height;

        // 1. Camada de Ambiência & Escuridão Noturna (com recortes suaves destination-out)
        this._dayNightOverlayBitmap = new Bitmap(width, height);
        this._dayNightOverlaySprite = new Sprite(this._dayNightOverlayBitmap);
        this._dayNightOverlaySprite.blendMode = PIXI.BLEND_MODES.NORMAL;
        this._dayNightOverlaySprite.z = 8;
        this.addChild(this._dayNightOverlaySprite);

        // 2. Camada Separada de Bloom Aditivo (PIXI.BLEND_MODES.ADD) para brilho real de tochas/cristais/lanternas
        this._dayNightBloomBitmap = new Bitmap(width, height);
        this._dayNightBloomSprite = new Sprite(this._dayNightBloomBitmap);
        this._dayNightBloomSprite.blendMode = PIXI.BLEND_MODES.ADD;
        this._dayNightBloomSprite.z = 8.5;
        this.addChild(this._dayNightBloomSprite);
    };

    const _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.call(this);
        this.updateDayNightTileShadows();
        this.updateDayNightLighting();
    };

    // -------------------------------------------------------------------------
    // 5.1 Desenho Preciso de Tiles RMMZ (Autotiles A1-A4, Normal A5, B/C/D/E)
    // -------------------------------------------------------------------------

    Spriteset_Map.prototype.drawSingleTileToContext = function(ctx, bitmap, tileId, dx, dy) {
        if (!bitmap || !bitmap.isReady()) return;
        const tileWidth = $gameMap.tileWidth();
        const tileHeight = $gameMap.tileHeight();

        if (Tilemap.isAutotile(tileId)) {
            this.drawAutotileToContext(ctx, bitmap, tileId, dx, dy, tileWidth, tileHeight);
        } else {
            this.drawNormalTileToContext(ctx, bitmap, tileId, dx, dy, tileWidth, tileHeight);
        }
    };

    Spriteset_Map.prototype.drawNormalTileToContext = function(ctx, bitmap, tileId, dx, dy, w, h) {
        const sx = ((Math.floor(tileId / 128) % 2) * 8 + (tileId % 8)) * w;
        const sy = (Math.floor((tileId % 256) / 8) % 16) * h;
        const source = bitmap._image || bitmap._canvas || bitmap.canvas;
        if (source) {
            ctx.drawImage(source, sx, sy, w, h, dx, dy, w, h);
        }
    };

    Spriteset_Map.prototype.drawAutotileToContext = function(ctx, bitmap, tileId, dx, dy, w, h) {
        const kind = Tilemap.getAutotileKind(tileId);
        const shape = Tilemap.getAutotileShape(tileId);
        const tx = kind % 8;
        const ty = Math.floor(kind / 8);

        let bx = 0;
        let by = 0;
        let autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;

        if (Tilemap.isTileA1(tileId)) {
            return;
        } else if (Tilemap.isTileA2(tileId)) {
            bx = tx * 2;
            by = (ty - 2) * 3;
        } else if (Tilemap.isTileA3(tileId)) {
            bx = tx * 2;
            by = (ty - 6) * 2;
            autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
        } else if (Tilemap.isTileA4(tileId)) {
            bx = tx * 2;
            by = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0));
            if (ty % 2 === 1) {
                autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
            }
        }

        const table = autotileTable[shape];
        if (!table) return;

        const w1 = w / 2;
        const h1 = h / 2;
        const source = bitmap._image || bitmap._canvas || bitmap.canvas;
        if (!source) return;

        for (let i = 0; i < 4; i++) {
            const qsx = table[i][0];
            const qsy = table[i][1];
            const sx1 = (bx * 2 + qsx) * w1;
            const sy1 = (by * 2 + qsy) * h1;
            const dx1 = dx + (i % 2) * w1;
            const dy1 = dy + Math.floor(i / 2) * h1;
            ctx.drawImage(source, sx1, sy1, w1, h1, dx1, dy1, w1, h1);
        }
    };

    Spriteset_Map.prototype.getTilesetBitmapForTile = function(tileId) {
        if (!this._tilemap) return null;
        const bitmaps = this._tilemap._bitmaps || this._tilemap.bitmaps;
        if (!bitmaps) return null;
        let setNumber = 0;
        if (Tilemap.isTileA1(tileId)) setNumber = 0;
        else if (Tilemap.isTileA2(tileId)) setNumber = 1;
        else if (Tilemap.isTileA3(tileId)) setNumber = 2;
        else if (Tilemap.isTileA4(tileId)) setNumber = 3;
        else if (Tilemap.isTileA5(tileId)) setNumber = 4;
        else setNumber = 5 + Math.floor(tileId / 256);
        return bitmaps[setNumber] || null;
    };

    // -------------------------------------------------------------------------
    // 5.2 Projeção Coerente de Sombras de Estruturas (Sem Costuras 48x48)
    // -------------------------------------------------------------------------

    Spriteset_Map.prototype.updateDayNightTileShadows = function() {
        if (!this._dayNightTileShadowSprite || !this._dayNightTileShadowBitmap || !$gameSystem || !$gameMap) return;
        if (!this._tilemap || (this._tilemap.isReady && !this._tilemap.isReady())) return;

        if (!enableDynamicShadows || !enableTileShadows || $gameSystem.isDayNightIndoor() || $gameSystem.isMapSunless()) {
            this._dayNightTileShadowSprite.visible = false;
            this._lastShadowState = null;
            return;
        }

        const totalMinutes = $gameSystem.dayNightTotalMinutes();
        const sunData = getSolarShadowTransform(totalMinutes);
        if (sunData.opacity <= 0.01) {
            this._dayNightTileShadowSprite.visible = false;
            this._lastShadowState = null;
            return;
        }

        const flags = $gameMap.tilesetFlags();
        if (!flags) return;

        const displayX = $gameMap.displayX();
        const displayY = $gameMap.displayY();
        const mapId = $gameMap.mapId();
        const lightInfo = getAmbientLightForTime(totalMinutes);

        // Cache inteligente: atualiza imediatamente se a câmera moveu, ou quando o ângulo solar muda perceptivelmente
        const prev = this._lastShadowState;
        if (
            prev &&
            prev.mapId === mapId &&
            Math.abs(prev.displayX - displayX) < 0.0005 &&
            Math.abs(prev.displayY - displayY) < 0.0005 &&
            Math.abs(prev.sx - sunData.sx) < 0.003 &&
            Math.abs(prev.sy - sunData.sy) < 0.003 &&
            Math.abs(prev.opacity - sunData.opacity) < 0.004
        ) {
            return;
        }

        this._lastShadowState = {
            mapId,
            displayX,
            displayY,
            sx: sunData.sx,
            sy: sunData.sy,
            opacity: sunData.opacity
        };

        this._dayNightTileShadowSprite.visible = true;

        const w = this._dayNightTileShadowBitmap.width;
        const h = this._dayNightTileShadowBitmap.height;
        const tileW = $gameMap.tileWidth();
        const tileH = $gameMap.tileHeight();

        const startX = Math.floor(displayX) - 3;
        const endX = startX + Math.ceil(w / tileW) + 6;
        const startY = Math.floor(displayY) - 4;
        const endY = startY + Math.ceil(h / tileH) + 8;

        // 1. Coleta todos os tiles emissores de sombra na área visível (+ margem)
        // Cada item em entries[tx][ty] representa uma peça individual de estrutura para que
        // pilares sobrepostos na mesma célula (ex: z2 base do pilar N e z3 topo '*' do pilar S)
        // recebam seu próprio tyBase exato!
        const grid = {};
        for (let tx = startX; tx <= endX; tx++) {
            grid[tx] = {};
            const wrappedX = $gameMap.roundX(tx);

            for (let ty = startY; ty <= endY; ty++) {
                const wrappedY = $gameMap.roundY(ty);
                if (!$gameMap.isValid(wrappedX, wrappedY)) continue;

                const regionId = $gameMap.regionId(wrappedX, wrappedY);
                if (regionId === 251) continue; // Região 251 = Sem sombra

                const t0 = $gameMap.tileId(wrappedX, wrappedY, 0);
                const t1 = $gameMap.tileId(wrappedX, wrappedY, 1);
                const t2 = $gameMap.tileId(wrappedX, wrappedY, 2);
                const t3 = $gameMap.tileId(wrappedX, wrappedY, 3);

                const items = [];

                // Camadas 0 e 1 (Fachadas de paredes A3/A4 e Telhados A3)
                const baseIds = [t0, t1];
                for (let i = 0; i < 2; i++) {
                    const tid = baseIds[i];
                    if (tid <= 0) continue;

                    if (Tilemap.isWallSideTile(tid)) {
                        items.push({
                            tx, ty, tid,
                            kind: 'wallSide',
                            isUpper: false,
                            cutout: false, // Autotiles 48x48 opacos não devem recortar sombras de pilares à frente
                            tyBase: null
                        });
                    } else if (Tilemap.isRoofTile(tid)) {
                        items.push({
                            tx, ty, tid,
                            kind: 'roof',
                            isUpper: false,
                            cutout: false,
                            tyBase: null
                        });
                    }
                }

                // Camadas 2 e 3 (Objetos B/C/D/E: árvores, pilares, estátuas, rochas, torres)
                const objIds = [t2, t3];
                for (let i = 0; i < 2; i++) {
                    const tid = objIds[i];
                    if (tid <= 0) continue;

                    const flag = flags[tid] || 0;
                    const isUpper = (flag & 0x10) !== 0; // '*' overhead (copa / topo de pilar)
                    const isSolid = (flag & 0x0f) !== 0; // colisor sólido (tronco / base de pilar)
                    const forceShadow = (regionId === 250 || ((flag >> 12) === 7));

                    if (isUpper || isSolid || forceShadow) {
                        items.push({
                            tx, ty, tid,
                            kind: isUpper ? 'objUpper' : 'objSolid',
                            isUpper,
                            // Apenas objetos sólidos de camada inferior (troncos, bases de pilares, rochas)
                            // recortam a própria silhueta para não escurecerem a si mesmos
                            cutout: !isUpper,
                            tyBase: null
                        });
                    } else if (!Tilemap.isAutotile(tid) && ty < endY) {
                        // Verifica se é o topo passável (flag 0x00) de uma estátua/objeto de 2 tiles cuja base (tid + 8) está em ty + 1
                        const belowY = $gameMap.roundY(ty + 1);
                        if ($gameMap.isValid(wrappedX, belowY)) {
                            const bt2 = $gameMap.tileId(wrappedX, belowY, 2);
                            const bt3 = $gameMap.tileId(wrappedX, belowY, 3);
                            const matchBelow = [bt2, bt3].some(bt => bt > 0 && Math.abs((bt - tid) - 8) <= 1 && ((flags[bt] || 0) & 0x1f) !== 0);
                            if (matchBelow) {
                                items.push({
                                    tx, ty, tid,
                                    kind: 'objUpper',
                                    isUpper: true,
                                    cutout: false,
                                    tyBase: null
                                });
                            }
                        }
                    }
                }

                if (items.length > 0) {
                    grid[tx][ty] = items;
                }
            }
        }

        // 2. Determina a linha de base terrestre (tyBase) de cada peça de baixo para cima
        for (let tx = startX; tx <= endX; tx++) {
            const col = grid[tx];
            for (let ty = endY; ty >= startY; ty--) {
                const items = col[ty];
                if (!items) continue;
                const belowItems = col[ty + 1] || [];

                for (let i = 0; i < items.length; i++) {
                    const item = items[i];

                    if (item.kind === 'wallSide') {
                        const belowWall = belowItems.find(b => b.kind === 'wallSide' && b.tyBase !== null && (b.tyBase - ty) <= 2);
                        item.tyBase = belowWall ? belowWall.tyBase : ty;
                    } else if (item.kind === 'roof') {
                        const belowStruct = belowItems.find(b => (b.kind === 'wallSide' || b.kind === 'roof') && b.tyBase !== null && (b.tyBase - ty) <= 3);
                        item.tyBase = belowStruct ? belowStruct.tyBase : ty;
                    } else if (item.kind === 'objSolid') {
                        // Verifica se faz parte de uma coluna/torre multi-tile contínua na folha de sprites (tid_below - tid === 8)
                        const belowMatch = belowItems.find(b => b.kind === 'objSolid' && Math.abs((b.tid - item.tid) - 8) <= 1 && b.tyBase !== null && (b.tyBase - ty) <= 3);
                        item.tyBase = belowMatch ? belowMatch.tyBase : ty;
                    } else if (item.kind === 'objUpper') {
                        // Prioridade 1: peça diretamente abaixo na folha de sprites (ex: base de pilar tid+8 em ty+1)
                        const sheetMatch = belowItems.find(b => !Tilemap.isAutotile(b.tid) && Math.abs((b.tid - item.tid) - 8) <= 1 && b.tyBase !== null);
                        if (sheetMatch) {
                            item.tyBase = sheetMatch.tyBase;
                        } else {
                            // Prioridade 2: qualquer tronco/objeto na célula abaixo
                            const anyBelowObj = belowItems.find(b => (b.kind === 'objSolid' || b.kind === 'objUpper') && b.tyBase !== null && (b.tyBase - ty) <= 3);
                            item.tyBase = anyBelowObj ? anyBelowObj.tyBase : (ty + 1);
                        }
                    }
                }
            }
        }

        // 2b. Alinha copas laterais ('*') com o tyBase de troncos adjacentes na mesma linha
        for (let tx = startX; tx <= endX; tx++) {
            const col = grid[tx];
            for (let ty = startY; ty <= endY; ty++) {
                const items = col[ty];
                if (!items) continue;
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.kind !== 'objUpper') continue;
                    const leftItems = (grid[tx - 1] && grid[tx - 1][ty]) || [];
                    const rightItems = (grid[tx + 1] && grid[tx + 1][ty]) || [];
                    const adjSolid = leftItems.find(a => a.kind === 'objSolid' && a.tyBase !== null) ||
                                     rightItems.find(a => a.kind === 'objSolid' && a.tyBase !== null);
                    if (adjSolid && Math.abs(adjSolid.tyBase - item.tyBase) <= 1) {
                        item.tyBase = adjSolid.tyBase;
                    }
                }
            }
        }

        // 3. Agrupa peças por tyBase para projeção afim contínua
        const groupsByBase = new Map();
        const allLowerCutoutItems = [];

        for (let tx = startX; tx <= endX; tx++) {
            const col = grid[tx];
            for (let ty = startY; ty <= endY; ty++) {
                const items = col[ty];
                if (!items) continue;
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.tyBase === null) continue;

                    let list = groupsByBase.get(item.tyBase);
                    if (!list) {
                        list = [];
                        groupsByBase.set(item.tyBase, list);
                    }
                    list.push(item);

                    if (item.cutout) {
                        allLowerCutoutItems.push(item);
                    }
                }
            }
        }

        const workCtx = this._shadowWorkBitmap.context;
        const outCtx = this._dayNightTileShadowBitmap.context;
        workCtx.setTransform(1, 0, 0, 1, 0, 0);
        workCtx.clearRect(0, 0, w, h);
        outCtx.setTransform(1, 0, 0, 1, 0, 0);
        outCtx.clearRect(0, 0, w, h);

        if (groupsByBase.size === 0) {
            this._dayNightTileShadowBitmap._baseTexture.update();
            return;
        }

        const sx = sunData.sx;
        const sy = sunData.sy;

        // 4. Desenha as silhuetas projetadas com penumbra suave em 3 passes (núcleo + 2 bordas difusas)
        const penumbraPasses = [
            { dsx: -0.045, dsy: -0.025, alpha: 0.38 },
            { dsx: +0.045, dsy: +0.025, alpha: 0.38 },
            { dsx:  0.000, dsy:  0.000, alpha: 1.00 }
        ];

        workCtx.save();
        workCtx.globalCompositeOperation = 'source-over';

        for (const [tyBase, items] of groupsByBase.entries()) {
            const yBase = Math.round((tyBase - displayY + 1) * tileH);

            // Projeção Solar/Lunar Principal:
            //   x' = x - sx * y + sx * yBase
            //   y' = sy * y + (1 - sy) * yBase
            for (let p = 0; p < penumbraPasses.length; p++) {
                const pass = penumbraPasses[p];
                const psx = sx + pass.dsx;
                const psy = Math.max(0.18, sy + pass.dsy);

                workCtx.globalAlpha = pass.alpha;
                workCtx.setTransform(1, 0, -psx, psy, psx * yBase, (1 - psy) * yBase);

                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const screenX = Math.round((item.tx - displayX) * tileW);
                    const screenY = Math.round((item.ty - displayY) * tileH);
                    const bmp = this.getTilesetBitmapForTile(item.tid);
                    if (bmp) {
                        this.drawSingleTileToContext(workCtx, bmp, item.tid, screenX, screenY);
                    }
                }
            }

            // Sombra de Contato Terrestre Sutil (5-6px ao pé de muros/troncos/pilares na linha yBase)
            const contactSy = -0.14;
            const contactSx = sx * 0.14;
            workCtx.globalAlpha = 0.80;
            workCtx.setTransform(1, 0, -contactSx, contactSy, contactSx * yBase, (1 - contactSy) * yBase);

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.ty !== tyBase || item.isUpper) continue;
                const screenX = Math.round((item.tx - displayX) * tileW);
                const screenY = Math.round((item.ty - displayY) * tileH);
                const bmp = this.getTilesetBitmapForTile(item.tid);
                if (bmp) {
                    this.drawSingleTileToContext(workCtx, bmp, item.tid, screenX, screenY);
                }
            }
        }

        // 5. Normaliza toda a máscara de sombra em UMA única operação 'source-in'
        // Isso elimina 100% das costuras 48x48 e evita escurecimento duplo entre tiles adjacentes!
        workCtx.setTransform(1, 0, 0, 1, 0, 0);
        workCtx.globalAlpha = 1.0;
        workCtx.globalCompositeOperation = 'source-in';
        workCtx.fillStyle = `rgba(${lightInfo.shadowR}, ${lightInfo.shadowG}, ${lightInfo.shadowB}, ${sunData.opacity.toFixed(3)})`;
        workCtx.fillRect(0, 0, w, h);

        // 6. Recorta ('destination-out') apenas os objetos B/C/D/E sólidos da camada inferior (_lowerLayer z=0)
        // para que troncos, bases de pilares e rochas não escureçam a si mesmos
        workCtx.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < allLowerCutoutItems.length; i++) {
            const item = allLowerCutoutItems[i];
            const screenX = Math.round((item.tx - displayX) * tileW);
            const screenY = Math.round((item.ty - displayY) * tileH);
            const bmp = this.getTilesetBitmapForTile(item.tid);
            if (bmp) {
                this.drawSingleTileToContext(workCtx, bmp, item.tid, screenX, screenY);
            }
        }

        workCtx.restore();

        // 7. Transfere para o bitmap final do Tilemap
        outCtx.drawImage(this._shadowWorkBitmap.canvas, 0, 0);
        this._dayNightTileShadowBitmap._baseTexture.update();
    };

    // -------------------------------------------------------------------------
    // 5.3 Coleta de Fontes de Luz Ativas no Mapa (para Iluminação e Sombras)
    // -------------------------------------------------------------------------

    Spriteset_Map.prototype.collectActiveLightSources = function() {
        const sources = [];
        if (!$gameMap) return sources;

        const timeTick = Graphics.frameCount * 0.08;

        // 1. Luz da Lanterna do Jogador
        const playerHasLight = (playerLightSwitchId > 0)
            ? ($gameSwitches && $gameSwitches.value(playerLightSwitchId))
            : ($gameSystem && $gameSystem.isNight());

        if (playerHasLight && $gamePlayer) {
            const pulse = Math.sin(timeTick * 0.7) * 3;
            sources.push({
                x: $gamePlayer.screenX(),
                y: $gamePlayer.screenY() - 20,
                worldX: $gamePlayer._realX !== undefined ? $gamePlayer._realX : $gamePlayer.x,
                worldY: $gamePlayer._realY !== undefined ? $gamePlayer._realY : $gamePlayer.y,
                radius: playerLightRadius + pulse,
                color: playerLightColor,
                intensity: 0.95,
                isPlayer: true
            });
        }

        // 2. Luzes de Eventos no Mapa
        const events = $gameMap.events();
        for (let i = 0; i < events.length; i++) {
            const ev = events[i];
            if (!ev || ev._erased) continue;
            const light = ev.getDayNightLightData();
            if (!light) continue;

            const sx = ev.screenX();
            const sy = ev.screenY() - 20;
            if (sx < -light.radius - 64 || sx > Graphics.width + light.radius + 64 ||
                sy < -light.radius - 64 || sy > Graphics.height + light.radius + 64) {
                continue;
            }

            let radius = light.radius;
            let intensity = light.intensity || 1.0;
            if (light.flicker) {
                const seed = ev._dayNightLightSeed || 0;
                const wave = Math.sin(timeTick * 2.1 + seed) * 0.5 + Math.cos(timeTick * 3.4 + seed) * 0.5;
                radius += wave * (light.radius * 0.055);
                intensity += wave * 0.06;
            }

            sources.push({
                x: sx,
                y: sy,
                worldX: ev._realX !== undefined ? ev._realX : ev.x,
                worldY: ev._realY !== undefined ? ev._realY : ev.y,
                radius: Math.max(24, radius),
                color: light.color,
                intensity: Math.max(0.4, Math.min(1.35, intensity)),
                isPlayer: false,
                eventId: ev.eventId()
            });
        }

        this._activeLightSources = sources;
        return sources;
    };

    // -------------------------------------------------------------------------
    // 5.4 Renderização Atmosférica + Bloom Aditivo (PIXI.BLEND_MODES.ADD)
    // -------------------------------------------------------------------------

    Spriteset_Map.prototype.updateDayNightLighting = function() {
        if (!this._dayNightOverlayBitmap || !this._dayNightBloomBitmap || !$gameSystem) return;

        if ($gameSystem.isDayNightIndoor()) {
            this._dayNightOverlaySprite.visible = false;
            this._dayNightBloomSprite.visible = false;
            return;
        }

        const totalMinutes = $gameSystem.dayNightTotalMinutes();
        const light = getAmbientLightForTime(totalMinutes);
        const fixedDarkness = $gameSystem.getMapAmbientDarkness();

        let r = light.r;
        let g = light.g;
        let b = light.b;
        let alpha = light.alpha;
        let vignette = light.vignette;

        if (fixedDarkness !== null) {
            r = 8;
            g = 10;
            b = 18;
            alpha = fixedDarkness;
            vignette = Math.min(0.30, fixedDarkness * 0.35);
        }

        const sources = this.collectActiveLightSources();
        const w = this._dayNightOverlayBitmap.width;
        const h = this._dayNightOverlayBitmap.height;

        // --- Camada 1: Ambiência, Vinheta e Recortes Suaves de Luz ---
        const ctx = this._dayNightOverlayBitmap.context;
        ctx.clearRect(0, 0, w, h);

        if (alpha <= 0.005 && vignette <= 0.005) {
            this._dayNightOverlaySprite.visible = false;
        } else {
            this._dayNightOverlaySprite.visible = true;
            ctx.save();

            // Preenche a cor atmosférica do horário
            if (alpha > 0.005) {
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.fillRect(0, 0, w, h);
            }

            // Vinheta cinematográfica suave nas bordas da tela
            if (vignette > 0.01) {
                const cx = w * 0.5;
                const cy = h * 0.5;
                const outerR = Math.hypot(cx, cy);
                const vigGrad = ctx.createRadialGradient(cx, cy, outerR * 0.48, cx, cy, outerR);
                vigGrad.addColorStop(0.0, 'rgba(4, 6, 14, 0.0)');
                vigGrad.addColorStop(0.65, `rgba(4, 6, 14, ${(vignette * 0.45).toFixed(3)})`);
                vigGrad.addColorStop(1.0, `rgba(4, 6, 14, ${vignette.toFixed(3)})`);
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = vigGrad;
                ctx.fillRect(0, 0, w, h);
            }

            // Esculpe recortes suaves ('destination-out') onde há fontes de luz
            if (alpha > 0.02 && sources.length > 0) {
                ctx.globalCompositeOperation = 'destination-out';
                for (let i = 0; i < sources.length; i++) {
                    const src = sources[i];
                    const grad = ctx.createRadialGradient(src.x, src.y, 0, src.x, src.y, src.radius);
                    const coreCut = Math.min(0.96, 0.88 * src.intensity);
                    grad.addColorStop(0.00, `rgba(0, 0, 0, ${coreCut.toFixed(3)})`);
                    grad.addColorStop(0.30, `rgba(0, 0, 0, ${(coreCut * 0.78).toFixed(3)})`);
                    grad.addColorStop(0.62, `rgba(0, 0, 0, ${(coreCut * 0.36).toFixed(3)})`);
                    grad.addColorStop(0.85, `rgba(0, 0, 0, ${(coreCut * 0.10).toFixed(3)})`);
                    grad.addColorStop(1.00, 'rgba(0, 0, 0, 0.0)');

                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(src.x, src.y, src.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.restore();
            this._dayNightOverlayBitmap._baseTexture.update();
        }

        // --- Camada 2: Bloom Aditivo Real (PIXI.BLEND_MODES.ADD) ---
        const bCtx = this._dayNightBloomBitmap.context;
        bCtx.clearRect(0, 0, w, h);

        // O bloom é mais intenso à noite/crepúsculo e sutil durante o dia
        const bloomVisibility = Math.max(0.22, Math.min(1.0, alpha * 1.25 + 0.18));
        if (sources.length === 0 || bloomVisibility <= 0.02) {
            this._dayNightBloomSprite.visible = false;
        } else {
            this._dayNightBloomSprite.visible = true;
            bCtx.save();
            bCtx.globalCompositeOperation = 'lighter';

            for (let i = 0; i < sources.length; i++) {
                const src = sources[i];
                const rgb = hexToRgb(src.color);
                const strength = bloomVisibility * src.intensity;

                // Halo amplo atmosférico
                const outerGrad = bCtx.createRadialGradient(src.x, src.y, 0, src.x, src.y, src.radius * 1.05);
                outerGrad.addColorStop(0.00, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(0.34 * strength).toFixed(3)})`);
                outerGrad.addColorStop(0.32, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(0.18 * strength).toFixed(3)})`);
                outerGrad.addColorStop(0.68, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(0.06 * strength).toFixed(3)})`);
                outerGrad.addColorStop(1.00, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.0)`);

                bCtx.fillStyle = outerGrad;
                bCtx.beginPath();
                bCtx.arc(src.x, src.y, src.radius * 1.05, 0, Math.PI * 2);
                bCtx.fill();

                // Núcleo quente brilhante
                const coreRadius = src.radius * 0.28;
                const coreGrad = bCtx.createRadialGradient(src.x, src.y, 0, src.x, src.y, coreRadius);
                coreGrad.addColorStop(0.00, `rgba(255, 248, 230, ${(0.26 * strength).toFixed(3)})`);
                coreGrad.addColorStop(0.55, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(0.12 * strength).toFixed(3)})`);
                coreGrad.addColorStop(1.00, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.0)`);

                bCtx.fillStyle = coreGrad;
                bCtx.beginPath();
                bCtx.arc(src.x, src.y, coreRadius, 0, Math.PI * 2);
                bCtx.fill();
            }

            bCtx.restore();
            this._dayNightBloomBitmap._baseTexture.update();
        }
    };

    // =========================================================================
    // 6. Sombras Projetadas Coerentes para Personagens & Eventos (Sprite_Character)
    // =========================================================================

    // Bitmap estático compartilhado para a sombra de contato oval sob os pés (nunca destruído por sprites individuais)
    let _sharedContactOvalBitmap = null;
    function getSharedContactOvalBitmap() {
        if (!_sharedContactOvalBitmap) {
            const bw = 48;
            const bh = 24;
            _sharedContactOvalBitmap = new Bitmap(bw, bh);
            const ctx = _sharedContactOvalBitmap.context;
            ctx.save();
            ctx.translate(bw / 2, bh / 2);
            ctx.scale(1.0, bh / bw);
            const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, bw * 0.46);
            grad.addColorStop(0.00, 'rgba(8, 12, 24, 0.72)');
            grad.addColorStop(0.55, 'rgba(8, 12, 24, 0.38)');
            grad.addColorStop(1.00, 'rgba(8, 12, 24, 0.00)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, bw * 0.46, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            _sharedContactOvalBitmap._baseTexture.update();
        }
        return _sharedContactOvalBitmap;
    }

    const _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
    Sprite_Character.prototype.initMembers = function() {
        _Sprite_Character_initMembers.call(this);
        this._sunShadowSprite = null;
        this._contactShadowSprite = null;
    };

    const _Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function() {
        _Sprite_Character_update.call(this);
        this.updateDynamicSunShadow();
    };

    Sprite_Character.prototype.createDynamicSunShadow = function() {
        if (this._sunShadowSprite || !this.parent) return;

        // 1. Sombra de Contato Oval Suave (Oclusão de Ambiente nos pés)
        this._contactShadowSprite = new Sprite(getSharedContactOvalBitmap());
        this._contactShadowSprite.anchor.x = 0.5;
        this._contactShadowSprite.anchor.y = 0.55;
        this._contactShadowSprite.z = 1.9;
        this.parent.addChild(this._contactShadowSprite);

        // 2. Sombra Projetada Dinâmica (Silhueta animada do próprio personagem)
        this._sunShadowSprite = new Sprite();
        this._sunShadowSprite.anchor.x = 0.5;
        this._sunShadowSprite.anchor.y = 1.0;
        this._sunShadowSprite.setColorTone([-255, -255, -255, 255]);
        this._sunShadowSprite.setBlendColor([14, 20, 38, 255]);
        this._sunShadowSprite.z = 2;
        this.parent.addChild(this._sunShadowSprite);
    };

    Sprite_Character.prototype.shouldCastSunShadow = function() {
        if (!enableDynamicShadows || !$gameSystem) return false;
        const c = this._character;
        if (!c) return false;

        if (!c.characterName() || c.isTransparent() || c.opacity() === 0) return false;
        if (c instanceof Game_Vehicle && !c._driving) return false;
        if (c instanceof Game_Follower && !c.isVisible()) return false;
        if (c instanceof Game_Event) {
            if (c._erased || c.hasNoSunShadow()) return false;
            // Eventos que são tochas/fogueiras puras não projetam sombra escura sobre o próprio fogo
            const light = c.getDayNightLightData();
            if (light && light.flicker) return false;
        }
        return true;
    };

    Sprite_Character.prototype.updateDynamicSunShadow = function() {
        if (!this.shouldCastSunShadow()) {
            if (this._sunShadowSprite) this._sunShadowSprite.visible = false;
            if (this._contactShadowSprite) this._contactShadowSprite.visible = false;
            return;
        }

        if (!this._sunShadowSprite && this.parent) {
            this.createDynamicSunShadow();
        }
        if (!this._sunShadowSprite || !this._contactShadowSprite) return;

        if (this._sunShadowSprite.parent !== this.parent && this.parent) {
            this.parent.addChild(this._contactShadowSprite);
            this.parent.addChild(this._sunShadowSprite);
        }

        const totalMinutes = $gameSystem.dayNightTotalMinutes();
        const sunData = getSolarShadowTransform(totalMinutes);
        const lightInfo = getAmbientLightForTime(totalMinutes);
        const c = this._character;

        // Sincroniza frame da silhueta com o sprite do personagem
        const shadow = this._sunShadowSprite;
        const contact = this._contactShadowSprite;
        if (shadow.bitmap !== this.bitmap) {
            shadow.bitmap = this.bitmap;
        }
        shadow.setFrame(this._frame.x, this._frame.y, this._frame.width, this._frame.height);

        const groundY = c.screenY();
        const jumpHeight = c.jumpHeight ? c.jumpHeight() : 0;
        const jumpFactor = Math.max(0.35, 1.0 - jumpHeight / 100);

        // --- Vetor de Sombra Combinado: Sol/Lua + Luzes Pontuais Próximas ---
        let sx = sunData.sx;
        let sy = sunData.sy;
        let shadowOpacity = sunData.opacity;

        const spriteset = SceneManager._scene && SceneManager._scene._spriteset;
        const lightSources = (spriteset && spriteset._activeLightSources) ? spriteset._activeLightSources : [];

        if (lightSources.length > 0) {
            const charScreenX = this.x;
            const charScreenY = groundY;
            let localWeightSum = 0;
            let localSxSum = 0;
            let localSySum = 0;
            let maxLocalBoost = 0;

            for (let i = 0; i < lightSources.length; i++) {
                const src = lightSources[i];
                // Lanterna na mão do próprio jogador suaviza a sombra solar sem girar loucamente
                if (src.isPlayer && c === $gamePlayer) {
                    shadowOpacity *= 0.72;
                    continue;
                }

                const dx = charScreenX - src.x;
                const dy = charScreenY - (src.y + 16);
                const dist = Math.hypot(dx, dy);
                if (dist >= src.radius || dist < 4) continue;

                const falloff = Math.pow(1.0 - dist / src.radius, 1.6) * src.intensity;
                const len = (0.35 + 0.50 * (dist / src.radius)) * shadowLengthMultiplier;

                // Sombra aponta na direção OPOSTA à fonte de luz:
                //   dx > 0 (personagem à direita da luz) -> sombra p/ direita (sx > 0)
                //   dy < 0 (personagem ao norte da luz) -> sombra mais longa p/ norte (sy maior)
                const lSx = (dx / dist) * len;
                const lSy = Math.max(0.26, Math.min(0.82, (0.44 - (dy / dist) * 0.24) * shadowLengthMultiplier));

                localSxSum += lSx * falloff;
                localSySum += lSy * falloff;
                localWeightSum += falloff;
                if (falloff > maxLocalBoost) maxLocalBoost = falloff;
            }

            if (localWeightSum > 0.01) {
                const avgLocalSx = localSxSum / localWeightSum;
                const avgLocalSy = localSySum / localWeightSum;
                // À noite, a luz local domina a direção da sombra; de dia, o Sol domina
                const solarDominance = sunData.isDaylight ? 0.75 : 0.20;
                const blend = Math.min(0.88, maxLocalBoost * (1.0 - solarDominance * 0.65));

                sx = sx * (1.0 - blend) + avgLocalSx * blend;
                sy = sy * (1.0 - blend) + avgLocalSy * blend;
                shadowOpacity = Math.max(shadowOpacity, Math.min(0.58, maxLocalBoost * 0.52 * shadowIntensity));
            }
        }

        // Posiciona e escala a Sombra de Contato Oval sob os pés
        contact.x = this.x;
        contact.y = groundY - 1;
        const charW = Math.max(24, this._frame.width || 48);
        contact.scale.x = (charW / 48) * 0.78 * jumpFactor * shadowWidthMultiplier;
        contact.scale.y = (charW / 48) * 0.65 * jumpFactor * shadowWidthMultiplier;
        const baseContactAlpha = $gameSystem.isDayNightIndoor() ? 0.26 : Math.max(0.22, shadowOpacity * 0.85);
        contact.opacity = Math.round(Math.min(0.62, baseContactAlpha) * (c.opacity() / 255) * 255);
        contact.visible = contact.opacity > 4;

        if (shadowOpacity <= 0.01) {
            shadow.visible = false;
            return;
        }

        // Posiciona a Sombra Projetada exatamente nos pés no chão
        shadow.visible = true;
        shadow.x = this.x;
        shadow.y = groundY;

        // Conversão exata da matriz [ 1  -sx ; 0  sy ] para PIXI.Sprite (anchor.y = 1.0):
        //   lt.c = sin(skew.x) * scale.y = -sx
        //   lt.d = cos(skew.x) * scale.y = +sy
        // IMPORTANTE: scale.y POSITIVO projeta a sombra para o fundo/chão (Norte) e mantém o sinal correto de skew.x!
        shadow.scale.x = this.scale.x * jumpFactor * shadowWidthMultiplier;
        shadow.scale.y = Math.hypot(sx, sy) * jumpFactor;
        shadow.skew.x = Math.atan2(-sx, sy);

        shadow.setBlendColor([lightInfo.shadowR, lightInfo.shadowG, lightInfo.shadowB, 255]);
        shadow.opacity = Math.round(shadowOpacity * jumpFactor * (c.opacity() / 255) * 255);
    };

    // Guard seguro contra falha de textura nula no PIXI durante destruição de cena
    const _Sprite_destroy = Sprite.prototype.destroy;
    Sprite.prototype.destroy = function(options) {
        if (!this._texture) {
            if (this.children && this.children.length > 0) {
                const children = this.children.slice();
                for (const child of children) {
                    if (child && child.destroy) child.destroy(options);
                }
            }
            return;
        }
        _Sprite_destroy.call(this, options);
    };

    const _Sprite_Character_destroy = Sprite_Character.prototype.destroy;
    Sprite_Character.prototype.destroy = function(options) {
        if (this._sunShadowSprite) {
            if (this._sunShadowSprite.parent) {
                this._sunShadowSprite.parent.removeChild(this._sunShadowSprite);
            }
            this._sunShadowSprite.bitmap = null;
            this._sunShadowSprite.destroy();
            this._sunShadowSprite = null;
        }
        if (this._contactShadowSprite) {
            if (this._contactShadowSprite.parent) {
                this._contactShadowSprite.parent.removeChild(this._contactShadowSprite);
            }
            // Não destrói o bitmap compartilhado _sharedContactOvalBitmap
            this._contactShadowSprite.bitmap = null;
            this._contactShadowSprite.destroy();
            this._contactShadowSprite = null;
        }
        _Sprite_Character_destroy.call(this, options);
    };

    // =========================================================================
    // 7. Atualização na Scene_Map e HUD Celestial do Relógio
    // =========================================================================

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if ($gameSystem) {
            $gameSystem.updateDayNight();
        }
    };

    class Sprite_DayNightClock extends Sprite {
        constructor() {
            super(new Bitmap(184, 54));
            this.x = clockX;
            this.y = clockY;
            this._lastMinute = -1;
            this._lastHour = -1;
            this._lastMoonPhase = -1;
            this.update();
        }

        update() {
            super.update();
            if (!$gameSystem) return;

            this.visible = showClockHud && !$gameSystem.isDayNightIndoor();
            if (!this.visible) return;

            const m = $gameSystem.dayNightMinute();
            const h = $gameSystem.dayNightHour();
            const mp = $gameSystem.dayNightMoonPhase ? $gameSystem.dayNightMoonPhase() : 0;

            if (m !== this._lastMinute || h !== this._lastHour || mp !== this._lastMoonPhase) {
                this._lastMinute = m;
                this._lastHour = h;
                this._lastMoonPhase = mp;
                this.redrawClock();
            }
        }

        drawMoonPhaseIcon(ctx, cx, cy, radius, phaseIndex) {
            ctx.save();

            ctx.fillStyle = '#141d2e';
            ctx.strokeStyle = '#567296';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            if (phaseIndex === 0) {
                ctx.restore();
                return;
            }

            if (phaseIndex === 4) {
                const glow = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius * 1.55);
                glow.addColorStop(0, 'rgba(215, 238, 255, 0.50)');
                glow.addColorStop(1, 'rgba(215, 238, 255, 0.0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(cx, cy, radius * 1.55, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(cx, cy, radius - 0.5, 0, Math.PI * 2);
            ctx.clip();

            ctx.fillStyle = (phaseIndex === 4) ? '#f0f8ff' : '#cbe5ff';

            if (phaseIndex === 4) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (phaseIndex === 2) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius, -Math.PI / 2, Math.PI / 2, false);
                ctx.closePath();
                ctx.fill();
            } else if (phaseIndex === 6) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius, Math.PI / 2, -Math.PI / 2, false);
                ctx.closePath();
                ctx.fill();
            } else if (phaseIndex === 1) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius, -Math.PI / 2, Math.PI / 2, false);
                ctx.fill();
                ctx.fillStyle = '#141d2e';
                ctx.beginPath();
                ctx.ellipse(cx, cy, radius * 0.55, radius, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (phaseIndex === 3) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius, -Math.PI / 2, Math.PI / 2, false);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(cx, cy, radius * 0.55, radius, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (phaseIndex === 5) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius, Math.PI / 2, -Math.PI / 2, false);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(cx, cy, radius * 0.55, radius, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (phaseIndex === 7) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius, Math.PI / 2, -Math.PI / 2, false);
                ctx.fill();
                ctx.fillStyle = '#141d2e';
                ctx.beginPath();
                ctx.ellipse(cx, cy, radius * 0.55, radius, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        redrawClock() {
            const ctx = this.bitmap.context;
            const w = this.bitmap.width;
            const h = this.bitmap.height;

            ctx.clearRect(0, 0, w, h);
            ctx.save();

            // Fundo em gradiente escuro com moldura dourada Xianxia
            const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
            bgGrad.addColorStop(0, 'rgba(14, 20, 32, 0.90)');
            bgGrad.addColorStop(1, 'rgba(8, 12, 20, 0.92)');
            ctx.fillStyle = bgGrad;
            ctx.strokeStyle = '#c8a45d';
            ctx.lineWidth = 1.5;

            const r = 9;
            ctx.beginPath();
            ctx.moveTo(r, 1);
            ctx.lineTo(w - r, 1);
            ctx.quadraticCurveTo(w - 1, 1, w - 1, r);
            ctx.lineTo(w - 1, h - r);
            ctx.quadraticCurveTo(w - 1, h - 1, w - r, h - 1);
            ctx.lineTo(r, h - 1);
            ctx.quadraticCurveTo(1, h - 1, 1, h - r);
            ctx.lineTo(1, r);
            ctx.quadraticCurveTo(1, 1, r, 1);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            const currentHour = this._lastHour;
            const isDay = currentHour >= 6 && currentHour < 18;
            const iconX = 25;
            const iconY = 27;

            if (isDay) {
                const sunGlow = ctx.createRadialGradient(iconX, iconY, 4, iconX, iconY, 16);
                sunGlow.addColorStop(0, 'rgba(255, 210, 80, 0.45)');
                sunGlow.addColorStop(1, 'rgba(255, 170, 30, 0.0)');
                ctx.fillStyle = sunGlow;
                ctx.beginPath();
                ctx.arc(iconX, iconY, 16, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#ffd23b';
                ctx.beginPath();
                ctx.arc(iconX, iconY, 9.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#ff9d1a';
                ctx.lineWidth = 1.5;
                for (let a = 0; a < 8; a++) {
                    const ang = (a * Math.PI) / 4;
                    const x1 = iconX + Math.cos(ang) * 11.5;
                    const y1 = iconY + Math.sin(ang) * 11.5;
                    const x2 = iconX + Math.cos(ang) * 14.5;
                    const y2 = iconY + Math.sin(ang) * 14.5;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            } else {
                this.drawMoonPhaseIcon(ctx, iconX, iconY, 10, this._lastMoonPhase);
            }

            const hourStr = String(this._lastHour).padStart(2, '0');
            const minStr = String(this._lastMinute).padStart(2, '0');
            const timeStr = `${hourStr}:${minStr}`;

            const lightInfo = getAmbientLightForTime($gameSystem.dayNightTotalMinutes());
            const dayCount = $gameSystem.dayNightDay();
            const moonName = $gameSystem.dayNightMoonName ? $gameSystem.dayNightMoonName() : "Quarto Crescente";

            ctx.font = 'bold 17px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 4;
            ctx.fillText(timeStr, 48, 24);

            const subLabel = (!isDay) ? `${moonName} • Dia ${dayCount}` : `${lightInfo.label} • Dia ${dayCount}`;
            ctx.font = '11px sans-serif';
            ctx.fillStyle = (!isDay) ? '#b8d8ff' : '#e4d6b8';
            ctx.shadowBlur = 2;
            ctx.fillText(subLabel, 48, 41);

            ctx.restore();
            this.bitmap._baseTexture.update();
        }
    }

    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this.createDayNightClock();
    };

    Scene_Map.prototype.createDayNightClock = function() {
        this._dayNightClockSprite = new Sprite_DayNightClock();
        this.addChild(this._dayNightClockSprite);
    };

    // =========================================================================
    // 8. Exportação da API Global
    // =========================================================================

    globalThis.DayNightSystem = {
        getHour: () => $gameSystem ? $gameSystem.dayNightHour() : defaultStartHour,
        getMinute: () => $gameSystem ? $gameSystem.dayNightMinute() : defaultStartMinute,
        getDay: () => $gameSystem ? $gameSystem.dayNightDay() : 1,
        getMoonPhase: () => $gameSystem ? $gameSystem.dayNightMoonPhase() : startMoonPhase,
        getMoonName: () => $gameSystem ? $gameSystem.dayNightMoonName() : "Quarto Crescente",
        setMoonPhase: (p) => { if ($gameSystem) $gameSystem.setMoonPhase(p); },
        isNight: () => $gameSystem ? $gameSystem.isNight() : false,
        setTime: (h, m) => { if ($gameSystem) $gameSystem.setTime(h, m); },
        addTime: (h, m) => { if ($gameSystem) $gameSystem.addTime(h, m); },
        pause: () => { if ($gameSystem) $gameSystem.setTimePaused(true); },
        resume: () => { if ($gameSystem) $gameSystem.setTimePaused(false); },
        version: "2.0.0"
    };

    console.log(`${pluginName} [v2.0.0]: Plugin carregado com sucesso.`);

})();
