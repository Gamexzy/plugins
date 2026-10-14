//=============================================================================
// RPG Maker MZ - DayNightSystem.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc [v1.3.0] Sistema dinâmico de Dia e Noite com iluminação suave, relógio HUD e fontes de luz para eventos/jogador (Unificação de sombras de estruturas verticais, atenuação gradual e dissolução por luz local).
 * @author DeepMind Pair Programming
 *
 * @param --- Configurações de Tempo ---
 * @default
 *
 * @param SecondsPerGameMinute
 * @text Segundos por Minuto do Jogo
 * @parent --- Configurações de Tempo ---
 * @type number
 * @decimals 2
 * @desc Quantos segundos reais equivalem a 1 minuto no jogo (Ex: 1.0 = 24 minutos reais por dia de jogo).
 * @default 1.00
 *
 * @param StartHour
 * @text Hora Inicial
 * @parent --- Configurações de Tempo ---
 * @type number
 * @min 0
 * @max 23
 * @desc Hora inicial ao começar um novo jogo (0 a 23).
 * @default 8
 *
 * @param StartMinute
 * @text Minuto Inicial
 * @parent --- Configurações de Tempo ---
 * @type number
 * @min 0
 * @max 59
 * @desc Minuto inicial ao começar um novo jogo (0 a 59).
 * @default 0
 *
 * @param TimeSpeedVariable
 * @text ID da Variável de Multiplicador de Velocidade
 * @parent --- Configurações de Tempo ---
 * @type variable
 * @desc Se configurada (> 0), o tempo é multiplicado pelo valor desta variável (0 = pausa o tempo, 2 = 2x mais rápido).
 * @default 0
 *
 * @param --- Variáveis de Sincronização ---
 * @default
 *
 * @param GameMinuteVariableId
 * @text Variável para Minuto Atual
 * @parent --- Variáveis de Sincronização ---
 * @type variable
 * @desc ID da Variável do RPG Maker onde o minuto atual (0-59) será salvo automaticamente. (0 para desativar).
 * @default 0
 *
 * @param GameHourVariableId
 * @text Variável para Hora Atual
 * @parent --- Variáveis de Sincronização ---
 * @type variable
 * @desc ID da Variável do RPG Maker onde a hora atual (0-23) será salvo automaticamente. (0 para desativar).
 * @default 0
 *
 * @param GameDayVariableId
 * @text Variável para Dia Atual
 * @parent --- Variáveis de Sincronização ---
 * @type variable
 * @desc ID da Variável do RPG Maker onde o número de dias decorridos será salvo. (0 para desativar).
 * @default 0
 *
 * @param IsNightSwitchId
 * @text Switch 'É Noite'
 * @parent --- Variáveis de Sincronização ---
 * @type switch
 * @desc Switch que ficará ON durante a noite e madrugada (20h às 5h) e OFF durante o dia. (0 para desativar).
 * @default 0
 *
 * @param --- HUD do Relógio ---
 * @default
 *
 * @param ShowClockHud
 * @text Exibir Relógio na Tela
 * @parent --- HUD do Relógio ---
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Se verdadeiro, mostra um elegante mostrador com hora, período do dia e ícone na tela.
 * @default true
 *
 * @param ClockX
 * @text Posição X do Relógio
 * @parent --- HUD do Relógio ---
 * @type number
 * @desc Coordenada X na tela.
 * @default 20
 *
 * @param ClockY
 * @text Posição Y do Relógio
 * @parent --- HUD do Relógio ---
 * @type number
 * @desc Coordenada Y na tela.
 * @default 150
 *
 * @param --- Fontes de Luz e Sombras ---
 * @default
 *
 * @param PlayerLanternEnabled
 * @text Lanterna do Jogador à Noite
 * @parent --- Fontes de Luz e Sombras ---
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Se ativado, o jogador emite automaticamente um círculo de luz ao redor de si durante a noite.
 * @default true
 *
 * @param PlayerLanternRadius
 * @text Raio da Lanterna do Jogador
 * @parent --- Fontes de Luz e Sombras ---
 * @type number
 * @desc Raio em pixels da luz emitida pelo jogador.
 * @default 100
 *
 * @param EnableDynamicShadows
 * @text Ativar Sombras Dinâmicas (Personagens)
 * @parent --- Fontes de Luz e Sombras ---
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Projeta sombras suaves para o jogador e personagens/eventos que se movem de acordo com a posição do sol.
 * @default true
 *
 * @param EnableTileShadows
 * @text Ativar Sombras do Mapa (Objetos/Paredes)
 * @parent --- Fontes de Luz e Sombras ---
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Projeta automaticamente sombras do sol para paredes, telhados, montanhas e árvores altas do mapa.
 * @default true
 *
 * @param MaxShadowLength
 * @text Comprimento Máximo da Sombra
 * @parent --- Fontes de Luz e Sombras ---
 * @type number
 * @desc Comprimento máximo da sombra em pixels durante o amanhecer e entardecer (ex: 28).
 * @default 24
 *
 * @param ShadowOpacity
 * @text Opacidade da Sombra Solar
 * @parent --- Fontes de Luz e Sombras ---
 * @type number
 * @decimals 2
 * @min 0.0
 * @max 1.0
 * @desc Opacidade da sombra solar projetada (0.0 = invisível, 1.0 = preta opaca).
 * @default 0.45
 *
 * @param TileShadowOpacity
 * @text Opacidade da Sombra dos Objetos do Mapa
 * @parent --- Fontes de Luz e Sombras ---
 * @type number
 * @decimals 2
 * @min 0.0
 * @max 1.0
 * @desc Opacidade da sombra das paredes, telhados e árvores do mapa (0.0 a 1.0).
 * @default 0.40
 *
 * @param EnableFlameFlicker
 * @text Ativar Tremeluzir de Chamas (Flicker)
 * @parent --- Fontes de Luz e Sombras ---
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Se ativado, tochas, fogueiras e lanternas tremulam suavemente de forma orgânica com microturbulência de vento.
 * @default true
 *
 * @param EnableNaturalColorGrading
 * @text Cores Físicas Contínuas (Kelvin / Rayleigh)
 * @parent --- Fontes de Luz e Sombras ---
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Utiliza cálculo de radiação de corpo negro (Kelvin) e dispersão atmosférica de Rayleigh para sol, dourado e céu.
 * @default true
 *
 * @param EnableSoftShadows
 * @text Ativar Penumbra Suave (Soft Blur)
 * @parent --- Fontes de Luz e Sombras ---
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Aplica difusão suave por GPU nas bordas das sombras, eliminando recortes rígidos e quinas duras.
 * @default true
 *
 * @param ShadowBlur
 * @text Intensidade da Penumbra Suave
 * @parent --- Fontes de Luz e Sombras ---
 * @type number
 * @decimals 1
 * @min 0.5
 * @max 5.0
 * @desc Grau de desfoque/penumbra suave nas bordas da sombra (padrão: 1.5).
 * @default 1.5
 *
 * @param ShadowBlendMode
 * @text Modo de Mesclagem da Sombra
 * @parent --- Fontes de Luz e Sombras ---
 * @type select
 * @option Multiply (Multiplicar - Mais Realista)
 * @value 2
 * @option Normal (Translúcido Padrão)
 * @value 0
 * @desc Modo de mesclagem GPU. Multiply preserva e aprofunda as cores do terreno (neve azulada, grama viva).
 * @default 2
 *
 * @param CanopyHeightOffset
 * @text Deslocamento de Altura da Copa (Canopy Offset)
 * @parent --- Fontes de Luz e Sombras ---
 * @type number
 * @decimals 2
 * @min 0.00
 * @max 2.00
 * @desc Fator de elevação (0.0 a 2.0) para deslocar a sombra de tiles flutuantes isolados (*), criando paralaxe 3D.
 * @default 0.00
 *
 * @param EnableContactShadow
 * @text Ativar Sombra de Contato nos Pés (Ambient Occlusion)
 * @parent --- Fontes de Luz e Sombras ---
 * @type boolean
 * @on SIM
 * @off NÃO
 * @desc Cria uma elipse suave de oclusão de contato debaixo dos pés dos personagens, evitando que pareçam flutuar no mapa.
 * @default true
 *
 * @param ContactShadowOpacity
 * @text Opacidade da Sombra de Contato
 * @parent --- Fontes de Luz e Sombras ---
 * @type number
 * @decimals 2
 * @min 0.0
 * @max 1.0
 * @desc Opacidade da elipse de contato nos pés dos personagens (0.0 a 1.0).
 * @default 0.55
 *
 * @param StartMoonPhase
 * @text Fase Inicial da Lua
 * @type select
 * @option 0 - Lua Nova (Breu Total)
 * @value 0
 * @option 1 - Lua Crescente
 * @value 1
 * @option 2 - Quarto Crescente
 * @value 2
 * @option 3 - Crescente Gibosa
 * @value 3
 * @option 4 - Lua Cheia (Mais Clara + Sombra Lunar)
 * @value 4
 * @option 5 - Minguante Gibosa
 * @value 5
 * @option 6 - Quarto Minguante
 * @value 6
 * @option 7 - Lua Minguante
 * @value 7
 * @desc Fase da lua no Dia 1 (avança automaticamente a cada noite).
 * @default 2
 *
 * @param MoonPhaseVariableId
 * @text Variável da Fase da Lua (0-7)
 * @type variable
 * @desc ID da variável do jogo para salvar a fase atual da lua (0=Nova, 4=Cheia, 0=Desativado).
 * @default 0
 *
 * @command setTime
 * @text Definir Horário
 * @desc Altera a hora e minuto atuais do jogo.
 *
 * @arg hour
 * @text Hora
 * @type number
 * @min 0
 * @max 23
 * @default 12
 *
 * @arg minute
 * @text Minuto
 * @type number
 * @min 0
 * @max 59
 * @default 0
 *
 * @command addTime
 * @text Avançar Tempo
 * @desc Avança um determinado número de horas e minutos.
 *
 * @arg hours
 * @text Horas a Avançar
 * @type number
 * @default 1
 *
 * @arg minutes
 * @text Minutos a Avançar
 * @type number
 * @default 0
 *
 * @command setTimePaused
 * @text Pausar/Retomar Tempo
 * @desc Pausa ou retoma o fluxo do ciclo de dia e noite.
 *
 * @arg paused
 * @text Pausado?
 * @type boolean
 * @default true
 *
 * @command setIndoorMode
 * @text Modo Interior (Desativar Luz Ambiente)
 * @desc Ativa ou desativa o modo interior para o mapa atual (desativa a escuridão do dia/noite).
 *
 * @arg indoor
 * @text Interior?
 * @type boolean
 * @default true
 *
 * @command setMoonPhase
 * @text Definir Fase da Lua
 * @desc Altera manualmente a fase atual da lua (0 a 7).
 *
 * @arg phase
 * @text Fase da Lua (0-7)
 * @type select
 * @option 0 - Lua Nova
 * @value 0
 * @option 1 - Lua Crescente
 * @value 1
 * @option 2 - Quarto Crescente
 * @value 2
 * @option 3 - Crescente Gibosa
 * @value 3
 * @option 4 - Lua Cheia
 * @value 4
 * @option 5 - Minguante Gibosa
 * @value 5
 * @option 6 - Quarto Minguante
 * @value 6
 * @option 7 - Lua Minguante
 * @value 7
 * @default 4
 *
 * @help DayNightSystem.js
 * ============================================================================
 * SISTEMA COMPLETO DE DIA E NOITE COM MUDANÇAS DE LUZ E FASES DA LUA (MZ)
 * ============================================================================
 * 
 * Este plugin adiciona um ciclo orgânico de 24 horas ao jogo com:
 *  1. Mudança de iluminação gradativa e suave entre Madrugada, Alvorecer, Manhã,
 *     Tarde, Entardecer/Pôr do Sol, Noite Profunda e Ciclo Lunar de 8 Fases.
 *  2. Ciclo de 8 Fases da Lua:
 *     - 0: Lua Nova (96% de escuridão, breu profundo sem luar)
 *     - 1: Lua Crescente (94% de escuridão)
 *     - 2: Quarto Crescente (92% de escuridão)
 *     - 3: Crescente Gibosa (89% de escuridão + sombra lunar suave)
 *     - 4: Lua Cheia (86% de escuridão azul-noturno + sombra lunar nítida)
 *     - 5: Minguante Gibosa (89% de escuridão + sombra lunar suave)
 *     - 6: Quarto Minguante (92% de escuridão)
 *     - 7: Lua Minguante (94% de escuridão)
 *  3. Sombras Dinâmicas Solares e Lunares em Tempo Real:
 *     - Durante o dia, o sol projeta sombras naturais para o jogador, seguidores,
 *       eventos e objetos/estruturas do mapa.
 *     - Em noites de Lua Cheia ou Gibosa, o luar também projeta sombras sutis!
 *     - Eventos com a tag <no_shadow> nas notas não projetam sombra.
 *  4. Máscara de Luz Dinâmica (Light Mask): Durante a noite e entardecer,
 *     o jogador e eventos com tags especiais iluminam os arredores em tempo real!
 *  5. Suporte a Ambientes Interiores (Indoors):
 *     - Coloque a tag <indoor> nas Notas do Mapa para que o ciclo não escureça
 *       aquele mapa e desative as sombras solares externas.
 *     - Ou a tag <outdoor> para forçar a iluminação externa.
 *  6. Eventos que emitem luz (Tochas, Fogueiras, Postes, Cristais):
 *     - Basta colocar um comentário na página do evento ou na Nota do Evento:
 *       <light: raio>
 *       Exemplo: <light: 120> (gera uma luz de 120px de raio)
 *       Exemplo com cor: <light: 140, #ffaa44> (luz alaranjada de tocha/fogo)
 *  7. Relógio HUD com ícone dinâmico do Sol e das 8 Fases da Lua.
 *
 * ============================================================================
 * CÓDIGO JS / SCRIPT CALLS
 * ============================================================================
 * - $gameSystem.dayNightHour()        -> Retorna a hora atual (0 a 23)
 * - $gameSystem.dayNightMinute()      -> Retorna o minuto atual (0 a 59)
 * - $gameSystem.dayNightDay()         -> Retorna o número de dias decorridos
 * - $gameSystem.dayNightMoonPhase()   -> Retorna a fase da lua (0 a 7)
 * - $gameSystem.dayNightMoonName()    -> Retorna o nome da fase da lua atual
 * - $gameSystem.setMoonPhase(0..7)    -> Define a fase da lua
 * - $gameSystem.isNight()             -> Retorna true se for noite
 * - $gameSystem.setTime(hora, minuto) -> Define o horário
 * - $gameSystem.addTime(horas, min)   -> Avança o horário
 * ============================================================================
 */

(() => {
    'use strict';

    // =========================================================================
    // 0. Declarações de Funções Auxiliares no Topo da IIFE
    // =========================================================================

    function getCurrentMoonData() {
        const phaseIdx = (typeof $gameSystem !== 'undefined' && $gameSystem &&$gameSystem.dayNightMoonPhase)
            ? $gameSystem.dayNightMoonPhase()
            : ((startMoonPhase % 8) + 8) % 8;
        return MOON_PHASES[phaseIdx] || MOON_PHASES[2];
    }

    /**
     * Converte Temperatura de Cor (Kelvin 1000K a 15000K) em RGB linear.
     * Algoritmo de Tanner Helland baseado em emissão de corpo negro e física estelar.
     */
    function kelvinToRGB(kelvin) {
        const temp = Math.max(1000, Math.min(15000, kelvin)) / 100;
        let red = 0;
        let green = 0;
        let blue = 0;

        if (temp <= 66) {
            red = 255;
        } else {
            red = temp - 60;
            red = 329.698727446 * Math.pow(red, -0.1332047592);
            red = Math.max(0, Math.min(255, red));
        }

        if (temp <= 66) {
            green = temp;
            green = 99.4708025861 * Math.log(green) - 161.1195681661;
            green = Math.max(0, Math.min(255, green));
        } else {
            green = temp - 60;
            green = 288.1221695283 * Math.pow(green, -0.0755148492);
            green = Math.max(0, Math.min(255, green));
        }

        if (temp >= 66) {
            blue = 255;
        } else if (temp <= 19) {
            blue = 0;
        } else {
            blue = temp - 10;
            blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
            blue = Math.max(0, Math.min(255, blue));
        }

        return { r: Math.round(red), g: Math.round(green), b: Math.round(blue) };
    }

    /**
     * Calcula o vetor e intensidade da sombra do sol (ou da lua em noites claras) com base no minuto atual.
     * Retorna { skewX, scaleY, elevationFactor, alpha, shadowColor, shadowRgb, visible }
     */
    function getSunShadowVectorForTime(totalMinutes) {
        if (!enableDynamicShadows && !enableTileShadows) {
            return { skewX: 0, scaleY: 0, elevationFactor: 0, alpha: 0, shadowColor: 'rgba(0,0,0,0)', shadowRgb: 'rgb(0,0,0)', visible: false };
        }

        const hour = (totalMinutes % 1440) / 60; // 0.00 a 23.99

        // 1. Período Diurno (Sol entre 5h30 e 18h30)
        if (hour >= 5.5 && hour <= 18.5) {
            const sunProgress = (hour - 5.5) / 13.0; // 0.0 a 1.0
            const sunAngle = sunProgress * Math.PI;  // 0 a PI

            const skewX = -Math.cos(sunAngle) * 1.35;
            const elevation = Math.sin(sunAngle); // 0 no horizonte, 1 no zênite
            const scaleY = (0.28 + (1.0 - elevation) * 0.48) * (maxShadowLength / 24);

            const elevationFactor = Math.min(1.0, elevation * 1.5);
            const alpha = shadowOpacity * elevationFactor;

            let shadowColor = `rgba(0, 0, 0, ${alpha.toFixed(2)})`;
            let shadowRgb = 'rgb(0, 0, 0)';
            if (enableNaturalColorGrading) {
                if (elevation < 0.5) {
                    const skyMix = (1.0 - elevation * 2.0);
                    const sr = Math.round(10 + 18 * skyMix);
                    const sg = Math.round(14 + 16 * skyMix);
                    const sb = Math.round(38 + 38 * skyMix);
                    shadowColor = `rgba(${sr}, ${sg}, ${sb}, ${alpha.toFixed(2)})`;
                    shadowRgb = `rgb(${sr}, ${sg}, ${sb})`;
                } else {
                    shadowColor = `rgba(6, 10, 18, ${alpha.toFixed(2)})`;
                    shadowRgb = 'rgb(6, 10, 18)';
                }
            }

            return {
                skewX,
                scaleY,
                elevationFactor,
                alpha: Math.max(0, Math.min(1, alpha)),
                shadowColor,
                shadowRgb,
                visible: elevationFactor > 0.05
            };
        }

        // 2. Período Noturno (Sombra Lunar entre 19h30 e 04h30 quando a Lua ilumina >= 35%)
        const moon = getCurrentMoonData();
        if (moon.illumination >= 0.35 && (hour >= 19.5 || hour <= 4.5)) {
            const nightElapsed = (hour >= 19.5) ? (hour - 19.5) : (hour + 24.0 - 19.5);
            const moonProgress = nightElapsed / 9.0; // 0.0 (19h30) a 1.0 (04h30)
            const moonAngle = moonProgress * Math.PI;

            const skewX = -Math.cos(moonAngle) * 1.15;
            const elevation = Math.sin(moonAngle);
            const scaleY = (0.30 + (1.0 - elevation) * 0.40) * (maxShadowLength / 24);

            const elevationFactor = Math.min(1.0, elevation * 1.4) * moon.illumination * 0.65;
            const alpha = shadowOpacity * elevationFactor;

            return {
                skewX,
                scaleY,
                elevationFactor,
                alpha: Math.max(0, Math.min(1, alpha)),
                shadowColor: `rgba(2, 4, 10, ${alpha.toFixed(2)})`,
                shadowRgb: 'rgb(2, 4, 10)',
                visible: elevationFactor > 0.05
            };
        }

        return { skewX: 0, scaleY: 0, elevationFactor: 0, alpha: 0, shadowColor: 'rgba(0,0,0,0)', shadowRgb: 'rgb(0,0,0)', visible: false };
    }

    /**
     * Interpolação contínua com graduação de cor física e modulação pela Fase da Lua.
     */
    function getAmbientLightForTime(totalMinutes) {
        const hourTime = (totalMinutes % 1440) / 60; // 0.0 a 23.999

        let prev = AMBIENT_LIGHT_SCHEDULE[0];
        let next = AMBIENT_LIGHT_SCHEDULE[AMBIENT_LIGHT_SCHEDULE.length - 1];

        for (let i = 0; i < AMBIENT_LIGHT_SCHEDULE.length - 1; i++) {
            if (hourTime >= AMBIENT_LIGHT_SCHEDULE[i].hour && hourTime < AMBIENT_LIGHT_SCHEDULE[i + 1].hour) {
                prev = AMBIENT_LIGHT_SCHEDULE[i];
                next = AMBIENT_LIGHT_SCHEDULE[i + 1];
                break;
            }
        }

        const span = next.hour - prev.hour;
        const progress = span > 0 ? (hourTime - prev.hour) / span : 0;

        let r = Math.round(prev.r + (next.r - prev.r) * progress);
        let g = Math.round(prev.g + (next.g - prev.g) * progress);
        let b = Math.round(prev.b + (next.b - prev.b) * progress);
        let alpha = Math.max(0, Math.min(1, prev.alpha + (next.alpha - prev.alpha) * progress));

        const daylightWeight = Math.max(0, 1.0 - alpha * 1.25);
        if (enableNaturalColorGrading && prev.kelvin && next.kelvin && daylightWeight > 0) {
            const currentKelvin = prev.kelvin + (next.kelvin - prev.kelvin) * progress;
            const kRgb = kelvinToRGB(currentKelvin);
            const kMix = 0.28 * daylightWeight;
            r = Math.round(r * (1.0 - kMix) + kRgb.r * kMix);
            g = Math.round(g * (1.0 - kMix) + kRgb.g * kMix);
            b = Math.round(b * (1.0 - kMix) + kRgb.b * kMix);
        }

        const moon = getCurrentMoonData();
        let nightFactor = 0;
        if (hourTime >= 20 || hourTime < 4) {
            nightFactor = 1.0;
        } else if (hourTime >= 19 && hourTime < 20) {
            nightFactor = hourTime - 19.0;
        } else if (hourTime >= 4 && hourTime < 5) {
            nightFactor = 1.0 - (hourTime - 4.0);
        }

        if (nightFactor > 0) {
            const alphaDelta = (0.035 - moon.illumination * 0.10) * nightFactor;
            alpha = Math.max(0, Math.min(0.97, alpha + alphaDelta));

            const moonColorScale = (0.35 + moon.illumination * 1.15);
            r = Math.round(r * (1.0 - nightFactor) + Math.min(12, r * moonColorScale) * nightFactor);
            g = Math.round(g * (1.0 - nightFactor) + Math.min(18, g * moonColorScale) * nightFactor);
            b = Math.round(b * (1.0 - nightFactor) + Math.min(34, b * moonColorScale) * nightFactor);
        }

        const label = (progress > 0.5) ? next.label : prev.label;

        return { r, g, b, alpha, label, moon };
    }

    /**
     * Calcula o flicker orgânico de chamas baseado em harmônicos de Fourier (3 oitavas de frequência)
     * e turbulência de vento, evitando a oscilação mecânica de ondas senoidais simples.
     */
    function getFlameFlicker(seed = 0) {
        if (!enableFlameFlicker) {
            return { radiusMult: 1.0, alphaMult: 1.0, offsetX: 0, offsetY: 0 };
        }

        const t = (Graphics.frameCount || 0) * 0.08 + seed;
        const wave1 = Math.sin(t * 1.5) * 0.035;
        const wave2 = Math.sin(t * 3.7 + 1.2) * 0.025;
        const wave3 = Math.cos(t * 8.3 + 2.7) * 0.015;

        const offsetX = Math.sin(t * 2.1) * 1.2;
        const offsetY = Math.cos(t * 1.8) * 0.8;

        const flicker = wave1 + wave2 + wave3;
        return {
            radiusMult: Math.max(0.85, Math.min(1.15, 1.0 + flicker)),
            alphaMult: Math.max(0.80, Math.min(1.20, 1.0 + flicker * 1.5)),
            offsetX,
            offsetY
        };
    }

    /**
     * Gera ou retorna o bitmap partilhado para a elipse de oclusão de contacto (Ambient Occlusion) nos pés.
     */
    function getSharedContactShadowBitmap() {
        if (!_sharedContactShadowBitmap) {
            _sharedContactShadowBitmap = new Bitmap(48, 24);
            const ctx = _sharedContactShadowBitmap.context;
            ctx.save();
            ctx.translate(24, 12);
            ctx.scale(1.0, 0.45);
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
            grad.addColorStop(0.00, 'rgba(0, 0, 0, 0.75)');
            grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.45)');
            grad.addColorStop(0.70, 'rgba(0, 0, 0, 0.15)');
            grad.addColorStop(1.00, 'rgba(0, 0, 0, 0.00)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            _sharedContactShadowBitmap._baseTexture.update();
        }
        return _sharedContactShadowBitmap;
    }

    /**
     * Verifica se o tile na posição (x, y) possui um tile superior (*) em (x, y - 1),
     * permitindo identificar bases passáveis de estruturas verticais (ex: entrada de torres, árvores, portões).
     */
    function hasUpperTileAt(x, y, flags) {
        if (!flags || !$gameMap.isValid(x, y)) return false;
        const tid2 = $gameMap.tileId(x, y, 2);
        const tid3 = $gameMap.tileId(x, y, 3);
        if (tid2 > 0 && flags[tid2] !== undefined && (flags[tid2] & 0x10) !== 0) return true;
        if (tid3 > 0 && flags[tid3] !== undefined && (flags[tid3] & 0x10) !== 0) return true;
        return false;
    }

    /**
     * Verifica se a coordenada (x, y) é uma parede vertical (A3/A4 de parede ou A5 vertical).
     */
    function isWallLocation(x, y) {
        if (typeof $gameMap === 'undefined' || !$gameMap || !$gameMap.isValid(x, y)) return false;
        const t0 = $gameMap.tileId(x, y, 0);
        const t1 = $gameMap.tileId(x, y, 1);
        for (const tid of [t0, t1]) {
            if (tid > 0 && typeof Tilemap !== 'undefined') {
                if (Tilemap.isWallSideTile && Tilemap.isWallSideTile(tid)) return true;
                if (Tilemap.isShadowingTile && Tilemap.isShadowingTile(tid) && (!Tilemap.isRoofTile || !Tilemap.isRoofTile(tid))) return true;
            }
        }
        return false;
    }

    /**
     * Verifica se (x, y) é uma borda de silhueta da parede (base em contato com o chão ou laterais livres).
     * Permite extrudar a massa arquitetônica unificada do prédio sem fatiar tijolos internos.
     */
    function isWallEdgeLocation(x, y) {
        if (!isWallLocation(x, y)) return false;
        // Base da parede (chão/rua abaixo)
        if (!isWallLocation(x, y + 1)) return true;
        // Lateral esquerda livre
        if (!$gameMap.isValid(x - 1, y) || !isWallLocation(x - 1, y)) return true;
        // Lateral direita livre
        if (!$gameMap.isValid(x + 1, y) || !isWallLocation(x + 1, y)) return true;
        return false;
    }

    // =========================================================================
    // 1. Parâmetros e Constantes
    // =========================================================================

    const pluginName = "DayNightSystem";
    const params = PluginManager.parameters(pluginName);

    const secondsPerGameMinute = Math.max(0.01, Number(params['SecondsPerGameMinute'] || 1.0));
    const defaultStartHour = Number(params['StartHour'] !== undefined ? params['StartHour'] : 8);
    const defaultStartMinute = Number(params['StartMinute'] !== undefined ? params['StartMinute'] : 0);
    const timeSpeedVarId = Number(params['TimeSpeedVariable'] || 0);

    const gameMinuteVarId = Number(params['GameMinuteVariableId'] || 0);
    const gameHourVarId = Number(params['GameHourVariableId'] || 0);
    const gameDayVarId = Number(params['GameDayVariableId'] || 0);
    const isNightSwitchId = Number(params['IsNightSwitchId'] || 0);
    const startMoonPhase = Number(params['StartMoonPhase'] !== undefined ? params['StartMoonPhase'] : 2);
    const moonPhaseVarId = Number(params['MoonPhaseVariableId'] || 0);

    const showClockHud = String(params['ShowClockHud'] || 'true') === 'true';
    const clockX = Number(params['ClockX'] || 20);
    const clockY = Number(params['ClockY'] || 150);

    const playerLanternEnabled = String(params['PlayerLanternEnabled'] || 'true') === 'true';
    const playerLanternRadius = Number(params['PlayerLanternRadius'] || 100);

    const enableDynamicShadows = String(params['EnableDynamicShadows'] !== undefined ? params['EnableDynamicShadows'] : 'true') === 'true';
    const enableTileShadows = String(params['EnableTileShadows'] !== undefined ? params['EnableTileShadows'] : 'true') === 'true';
    const maxShadowLength = Number(params['MaxShadowLength'] || 24);
    const shadowOpacity = Number(params['ShadowOpacity'] !== undefined ? params['ShadowOpacity'] : 0.45);
    const tileShadowOpacity = Number(params['TileShadowOpacity'] !== undefined ? params['TileShadowOpacity'] : 0.40);
    const enableFlameFlicker = String(params['EnableFlameFlicker'] !== undefined ? params['EnableFlameFlicker'] : 'true') === 'true';
    const enableNaturalColorGrading = String(params['EnableNaturalColorGrading'] !== undefined ? params['EnableNaturalColorGrading'] : 'true') === 'true';
    const enableSoftShadows = String(params['EnableSoftShadows'] !== undefined ? params['EnableSoftShadows'] : 'true') === 'true';
    const shadowBlur = Number(params['ShadowBlur'] || 1.5);
    const shadowBlendMode = Number(params['ShadowBlendMode'] !== undefined ? params['ShadowBlendMode'] : 2); // 2 = MULTIPLY
    const canopyHeightOffset = Number(params['CanopyHeightOffset'] !== undefined ? params['CanopyHeightOffset'] : 0.00);
    const enableContactShadow = String(params['EnableContactShadow'] !== undefined ? params['EnableContactShadow'] : 'true') === 'true';
    const contactShadowOpacity = Number(params['ContactShadowOpacity'] !== undefined ? params['ContactShadowOpacity'] : 0.55);

    let _sharedContactShadowBitmap = null;

    const MOON_PHASES = [
        { index: 0, name: "Lua Nova",         illumination: 0.00 },
        { index: 1, name: "Lua Crescente",    illumination: 0.22 },
        { index: 2, name: "Quarto Crescente", illumination: 0.50 },
        { index: 3, name: "Crescente Gibosa", illumination: 0.78 },
        { index: 4, name: "Lua Cheia",        illumination: 1.00 },
        { index: 5, name: "Minguante Gibosa", illumination: 0.78 },
        { index: 6, name: "Quarto Minguante", illumination: 0.50 },
        { index: 7, name: "Lua Minguante",    illumination: 0.22 }
    ];

    const AMBIENT_LIGHT_SCHEDULE = [
        { hour: 0,  r: 2,   g: 4,   b: 12,  alpha: 0.93, kelvin: 12000, label: "Madrugada" },
        { hour: 3,  r: 2,   g: 4,   b: 12,  alpha: 0.93, kelvin: 12000, label: "Madrugada" },
        { hour: 4,  r: 6,   g: 9,   b: 22,  alpha: 0.86, kelvin: 10000, label: "Alvorada" },
        { hour: 5,  r: 55,  g: 30,  b: 55,  alpha: 0.62, kelvin: 2000,  label: "Amanhecer" },
        { hour: 6,  r: 195, g: 105, b: 60,  alpha: 0.28, kelvin: 2600,  label: "Aurora Dourada" },
        { hour: 7,  r: 240, g: 185, b: 125, alpha: 0.10, kelvin: 3800,  label: "Manhã" },
        { hour: 8,  r: 255, g: 245, b: 235, alpha: 0.00, kelvin: 5500,  label: "Manhã" },
        { hour: 11, r: 255, g: 255, b: 255, alpha: 0.00, kelvin: 6500,  label: "Dia (Zênite)" },
        { hour: 13, r: 255, g: 255, b: 255, alpha: 0.00, kelvin: 6500,  label: "Dia" },
        { hour: 16, r: 250, g: 225, b: 175, alpha: 0.04, kelvin: 4800,  label: "Tarde" },
        { hour: 17, r: 245, g: 145, b: 65,  alpha: 0.22, kelvin: 2800,  label: "Golden Hour" },
        { hour: 18, r: 180, g: 65,  b: 48,  alpha: 0.48, kelvin: 2100,  label: "Pôr do Sol" },
        { hour: 19, r: 42,  g: 22,  b: 52,  alpha: 0.75, kelvin: 8500,  label: "Crepúsculo" },
        { hour: 20, r: 4,   g: 7,   b: 18,  alpha: 0.90, kelvin: 11000, label: "Noite" },
        { hour: 22, r: 2,   g: 4,   b: 12,  alpha: 0.93, kelvin: 12000, label: "Noite" },
        { hour: 24, r: 2,   g: 4,   b: 12,  alpha: 0.93, kelvin: 12000, label: "Madrugada" }
    ];

    // =========================================================================
    // 2. Comandos de Plugin (Plugin Commands do MZ)
    // =========================================================================

    PluginManager.registerCommand(pluginName, "setTime", args => {
        const hour = Number(args.hour || 0);
        const minute = Number(args.minute || 0);
        $gameSystem.setTime(hour, minute);
    });

    PluginManager.registerCommand(pluginName, "addTime", args => {
        const hours = Number(args.hours || 0);
        const minutes = Number(args.minutes || 0);
        $gameSystem.addTime(hours, minutes);
    });

    PluginManager.registerCommand(pluginName, "setTimePaused", args => {
        const paused = String(args.paused || 'true') === 'true';
        $gameSystem.setTimePaused(paused);
    });

    PluginManager.registerCommand(pluginName, "setIndoorMode", args => {
        const indoor = String(args.indoor || 'true') === 'true';
        $gameSystem.setDayNightIndoor(indoor);
    });

    PluginManager.registerCommand(pluginName, "setMoonPhase", args => {
        const phase = Number(args.phase || 0);
        $gameSystem.setMoonPhase(phase);
    });

    // =========================================================================
    // 3. Game_System - Armazenamento de Estado, Ciclo de Tempo & Fases da Lua
    // =========================================================================

    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        if (_Game_System_initialize) {
            _Game_System_initialize.call(this);
        }
        this._dayNightTotalSeconds = (defaultStartHour * 3600) + (defaultStartMinute * 60);
        this._dayNightDayCount = 1;
        this._dayNightMoonPhase = ((startMoonPhase % 8) + 8) % 8;
        this._dayNightPaused = false;
        this._dayNightIndoorOverride = null;
    };

    Game_System.prototype.dayNightTotalMinutes = function() {
        return Math.floor(this._dayNightTotalSeconds / 60);
    };

    Game_System.prototype.dayNightHour = function() {
        return Math.floor(this.dayNightTotalMinutes() / 60) % 24;
    };

    Game_System.prototype.dayNightMinute = function() {
        return this.dayNightTotalMinutes() % 60;
    };

    Game_System.prototype.dayNightDay = function() {
        return this._dayNightDayCount;
    };

    Game_System.prototype.dayNightMoonPhase = function() {
        if (this._dayNightMoonPhase === undefined || this._dayNightMoonPhase === null) {
            this._dayNightMoonPhase = ((startMoonPhase + (this._dayNightDayCount || 1) - 1) % 8 + 8) % 8;
        }
        return this._dayNightMoonPhase;
    };

    Game_System.prototype.dayNightMoonName = function() {
        const phase = this.dayNightMoonPhase();
        return MOON_PHASES[phase] ? MOON_PHASES[phase].name : "Quarto Crescente";
    };

    Game_System.prototype.setMoonPhase = function(phaseIndex) {
        this._dayNightMoonPhase = ((Math.floor(Number(phaseIndex) || 0) % 8) + 8) % 8;
        this.updateDayNightVariables();
    };

    Game_System.prototype.isNight = function() {
        const h = this.dayNightHour();
        return h >= 20 || h < 5;
    };

    Game_System.prototype.setTime = function(hour, minute) {
        const h = Math.max(0, Math.min(23, Number(hour) || 0));
        const m = Math.max(0, Math.min(59, Number(minute) || 0));
        const days = Math.floor(this._dayNightTotalSeconds / 86400);
        this._dayNightTotalSeconds = (days * 86400) + (h * 3600) + (m * 60);
        this.updateDayNightVariables();
    };

    Game_System.prototype.addTime = function(hours, minutes) {
        const addSec = (Number(hours || 0) * 3600) + (Number(minutes || 0) * 60);
        const prevDay = Math.floor(this._dayNightTotalSeconds / 86400);
        const prevLunarCycle = Math.floor((this._dayNightTotalSeconds - 21600) / 86400);

        this._dayNightTotalSeconds += addSec;

        const currDay = Math.floor(this._dayNightTotalSeconds / 86400);
        const currLunarCycle = Math.floor((this._dayNightTotalSeconds - 21600) / 86400);

        if (currDay > prevDay) {
            this._dayNightDayCount += (currDay - prevDay);
        }
        if (currLunarCycle > prevLunarCycle) {
            this._dayNightMoonPhase = (this.dayNightMoonPhase() + (currLunarCycle - prevLunarCycle)) % 8;
        }
        this.updateDayNightVariables();
    };

    Game_System.prototype.setTimePaused = function(paused) {
        this._dayNightPaused = !!paused;
    };

    Game_System.prototype.isTimePaused = function() {
        return !!this._dayNightPaused;
    };

    Game_System.prototype.setDayNightIndoor = function(isIndoor) {
        this._dayNightIndoorOverride = isIndoor;
    };

    Game_System.prototype.isDayNightIndoor = function() {
        if (this._dayNightIndoorOverride !== null && this._dayNightIndoorOverride !== undefined) {
            return this._dayNightIndoorOverride;
        }
        if (typeof $dataMap !== 'undefined' && $dataMap && $dataMap.meta) {
            if ($dataMap.meta.indoor) return true;
            if ($dataMap.meta.outdoor) return false;
        }
        return false;
    };

    Game_System.prototype.updateDayNightTime = function(deltaRealSeconds) {
        if (this._dayNightPaused) return;

        let multiplier = 1.0;
        if (timeSpeedVarId > 0 && typeof $gameVariables !== 'undefined' && $gameVariables) {
            const v = $gameVariables.value(timeSpeedVarId);
            if (v >= 0) multiplier = v;
        }

        const gameSecondsPerRealSecond = 60 / secondsPerGameMinute;
        const advanceSec = deltaRealSeconds * gameSecondsPerRealSecond * multiplier;

        const prevDay = Math.floor(this._dayNightTotalSeconds / 86400);
        const prevLunarCycle = Math.floor((this._dayNightTotalSeconds - 21600) / 86400);

        this._dayNightTotalSeconds += advanceSec;

        const currDay = Math.floor(this._dayNightTotalSeconds / 86400);
        const currLunarCycle = Math.floor((this._dayNightTotalSeconds - 21600) / 86400);

        if (currDay > prevDay) {
            this._dayNightDayCount += (currDay - prevDay);
        }
        if (currLunarCycle > prevLunarCycle) {
            this._dayNightMoonPhase = (this.dayNightMoonPhase() + (currLunarCycle - prevLunarCycle)) % 8;
        }

        this.updateDayNightVariables();
    };

    Game_System.prototype.updateDayNightVariables = function() {
        if (typeof $gameVariables === 'undefined' || !$gameVariables) return;

        const h = this.dayNightHour();
        const m = this.dayNightMinute();
        const moonPhase = this.dayNightMoonPhase();

        if (gameMinuteVarId > 0 && $gameVariables.value(gameMinuteVarId) !== m) {
            $gameVariables.setValue(gameMinuteVarId, m);
        }
        if (gameHourVarId > 0 && $gameVariables.value(gameHourVarId) !== h) {
            $gameVariables.setValue(gameHourVarId, h);
        }
        if (gameDayVarId > 0 && $gameVariables.value(gameDayVarId) !== this._dayNightDayCount) {
            $gameVariables.setValue(gameDayVarId, this._dayNightDayCount);
        }
        if (moonPhaseVarId > 0 && $gameVariables.value(moonPhaseVarId) !== moonPhase) {
            $gameVariables.setValue(moonPhaseVarId, moonPhase);
        }
        if (isNightSwitchId > 0 && typeof $gameSwitches !== 'undefined' && $gameSwitches) {
            const night = this.isNight();
            if ($gameSwitches.value(isNightSwitchId) !== night) {
                $gameSwitches.setValue(isNightSwitchId, night);
            }
        }
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if ($gameSystem && $gameSystem.updateDayNightTime) {
            $gameSystem.updateDayNightTime(1 / 60);
        }
    };

    // =========================================================================
    // 4. Detecção de Fontes de Luz em Eventos (<light: radius, color>)
    // =========================================================================

    Game_Event.prototype.dayNightLightData = function() {
        if (!this.page()) return null;

        const list = this.list();
        if (list) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].code === 108 || list[i].code === 408) {
                    const match = list[i].parameters[0].match(/<light:\s*(\d+)(?:,\s*([#a-zA-Z0-9]+))?>/i);
                    if (match) {
                        return {
                            radius: Number(match[1]),
                            color: match[2] || '#ffcc66'
                        };
                    }
                }
            }
        }

        const eventData = this.event();
        if (eventData && eventData.meta && eventData.meta.light) {
            const raw = String(eventData.meta.light);
            const parts = raw.split(',');
            return {
                radius: Number(parts[0]) || 80,
                color: (parts[1] || '#ffcc66').trim()
            };
        }

        return null;
    };

    // =========================================================================
    // 5. Spriteset_Map - Máscara de Iluminação Ambiente e Luzes Dinâmicas
    // =========================================================================

    const _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _Spriteset_Map_createLowerLayer.call(this);
        this.createDayNightShadowOverlay();
        this.createDayNightLightingOverlay();
    };

    Spriteset_Map.prototype.createDayNightShadowOverlay = function() {
        this._dayNightTileShadowBitmap = new Bitmap(Graphics.width, Graphics.height);
        this._dayNightTileShadowSprite = new Sprite(this._dayNightTileShadowBitmap);
        this._dayNightTileShadowSprite.z = 2; // Acima dos tiles de chão, abaixo dos personagens (z=3+)

        if (typeof document !== 'undefined') {
            this._dayNightCastersCanvas = document.createElement('canvas');
            this._dayNightCastersCanvas.width = Graphics.width;
            this._dayNightCastersCanvas.height = Graphics.height;
            this._dayNightCastersCtx = this._dayNightCastersCanvas.getContext('2d');

            this._dayNightCanopyCanvas = document.createElement('canvas');
            this._dayNightCanopyCanvas.width = Graphics.width;
            this._dayNightCanopyCanvas.height = Graphics.height;
            this._dayNightCanopyCtx = this._dayNightCanopyCanvas.getContext('2d');

            this._dayNightCutoutCanvas = document.createElement('canvas');
            this._dayNightCutoutCanvas.width = Graphics.width;
            this._dayNightCutoutCanvas.height = Graphics.height;
            this._dayNightCutoutCtx = this._dayNightCutoutCanvas.getContext('2d');
        }

        if (shadowBlendMode === 2 && typeof PIXI !== 'undefined' && PIXI.BLEND_MODES) {
            this._dayNightTileShadowSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
        }

        if (enableSoftShadows && typeof PIXI !== 'undefined' && PIXI.filters && PIXI.filters.BlurFilter) {
            this._dayNightShadowBlurFilter = new PIXI.filters.BlurFilter();
            this._dayNightShadowBlurFilter.blur = shadowBlur;
            this._dayNightShadowBlurFilter.quality = 2;
            this._dayNightTileShadowSprite.filters = [this._dayNightShadowBlurFilter];
        }

        if (this._tilemap) {
            this._tilemap.addChild(this._dayNightTileShadowSprite);
        } else {
            this._baseSprite.addChild(this._dayNightTileShadowSprite);
        }

        this._characterShadowContainer = (typeof PIXI !== 'undefined' && PIXI.Container) ? new PIXI.Container() : new Sprite();
        this._characterShadowContainer.z = 2.5;
        if (this._tilemap) {
            this._tilemap.addChild(this._characterShadowContainer);
        } else {
            this._baseSprite.addChild(this._characterShadowContainer);
        }
    };

    Spriteset_Map.prototype.createDayNightLightingOverlay = function() {
        this._dayNightOverlayBitmap = new Bitmap(Graphics.width, Graphics.height);
        this._dayNightOverlaySprite = new Sprite(this._dayNightOverlayBitmap);
        this._dayNightOverlaySprite.z = 8;
        this._baseSprite.addChild(this._dayNightOverlaySprite);
    };

    const _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.call(this);
        this.updateDayNightTileShadows();
        this.updateDayNightLighting();
    };

    Spriteset_Map.prototype.drawTileToCanvasContext = function(targetCtx, tileId, dx, dy) {
        if (!this._tilemap || !this._tilemap._bitmaps || !this._tilemap._addTile) return false;
        let drawn = false;
        const bitmaps = this._tilemap._bitmaps;
        const proxyLayer = {
            addRect: function(setNumber, sx, sy, rdx, rdy, w, h) {
                const bmp = bitmaps[setNumber];
                if (bmp && bmp.isReady()) {
                    const imgSource = bmp._canvas || bmp._image;
                    if (imgSource) {
                        targetCtx.drawImage(imgSource, sx, sy, w, h, rdx, rdy, w, h);
                        drawn = true;
                    }
                }
            }
        };
        this._tilemap._addTile(proxyLayer, tileId, dx, dy);
        return drawn;
    };

    /**
     * Renderiza sombras com silhueta 100% fiel ao formato real dos tiles (montanhas, árvores, torres, prédios).
     * Unifica estruturas de múltiplos tiles verticais (base + topo), aplica atenuação por distância
     * e dissolve sombras sob fontes de luz locais.
     */
    Spriteset_Map.prototype.updateDayNightTileShadows = function() {
        if (!this._dayNightTileShadowBitmap || !this._dayNightTileShadowSprite) return;

        const ctx = this._dayNightTileShadowBitmap.context;
        const w = Graphics.width;
        const h = Graphics.height;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, w, h);

        if (!enableTileShadows) {
            this._dayNightTileShadowSprite.visible = false;
            this._dayNightTileShadowBitmap._baseTexture.update();
            return;
        }

        if (typeof $gameSystem !== 'undefined' && $gameSystem && $gameSystem.isDayNightIndoor()) {
            this._dayNightTileShadowSprite.visible = false;
            this._dayNightTileShadowBitmap._baseTexture.update();
            return;
        }

        const totalMinutes = (typeof $gameSystem !== 'undefined' && $gameSystem) ? $gameSystem.dayNightTotalMinutes() : 720;
        const sunData = getSunShadowVectorForTime(totalMinutes);

        if (!sunData.visible) {
            this._dayNightTileShadowSprite.visible = false;
            this._dayNightTileShadowBitmap._baseTexture.update();
            return;
        }

        this._dayNightTileShadowSprite.visible = true;
        this._dayNightTileShadowSprite.opacity = Math.round(tileShadowOpacity * sunData.elevationFactor * 255);

        const tileW = $gameMap.tileWidth();
        const tileH = $gameMap.tileHeight();

        const originX = Math.ceil($gameMap.displayX() * tileW);
        const originY = Math.ceil($gameMap.displayY() * tileH);

        const startX = Math.floor($gameMap.displayX()) - 2;
        const endX = startX + Math.ceil(w / tileW) + 5;
        const startY = Math.floor($gameMap.displayY()) - 2;
        const endY = startY + Math.ceil(h / tileH) + 5;

        const tileset = $gameMap.tileset();
        const isWorldMap = tileset ? (tileset.mode === 0) : false;

        // Projeção horizontal pelo sol e componente vertical sutil para manter a sombra ancorada à estrutura
        const dx = isWorldMap ? Math.round(sunData.skewX * 14) : Math.round(sunData.skewX * 22);
        const dy = isWorldMap ? Math.round(sunData.scaleY * 6) : Math.round(sunData.scaleY * 14);

        if (!this._dayNightCastersCanvas || !this._dayNightCanopyCanvas) return;

        if (this._dayNightCastersCanvas.width !== w || this._dayNightCastersCanvas.height !== h) {
            this._dayNightCastersCanvas.width = w;
            this._dayNightCastersCanvas.height = h;
            this._dayNightCanopyCanvas.width = w;
            this._dayNightCanopyCanvas.height = h;
            this._dayNightCutoutCanvas.width = w;
            this._dayNightCutoutCanvas.height = h;
        }

        const cCtx = this._dayNightCastersCtx;
        const knCtx = this._dayNightCanopyCtx;
        const oCtx = this._dayNightCutoutCtx;
        cCtx.setTransform(1, 0, 0, 1, 0, 0);
        cCtx.clearRect(0, 0, w, h);
        knCtx.setTransform(1, 0, 0, 1, 0, 0);
        knCtx.clearRect(0, 0, w, h);
        oCtx.setTransform(1, 0, 0, 1, 0, 0);
        oCtx.clearRect(0, 0, w, h);

        const flags = $gameMap.tilesetFlags();
        let casterCount = 0;
        let canopyCount = 0;

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (!$gameMap.isValid(x, y)) continue;

                const tileL0 = $gameMap.tileId(x, y, 0);
                const tileL1 = $gameMap.tileId(x, y, 1);
                const tileL2 = $gameMap.tileId(x, y, 2);
                const tileL3 = $gameMap.tileId(x, y, 3);

                const screenX = x * tileW - originX;
                const screenY = y * tileH - originY;

                // Verifica se existe um tile superior (*) em (x, y - 1), indicando que (x, y) é a base de uma estrutura alta (ex: torre/árvore)
                const isBaseOfVerticalStructure = hasUpperTileAt(x, y - 1, flags);

                if (isWorldMap) {
                    for (const tid of [tileL0, tileL1]) {
                        if (tid > 0 && !Tilemap.isTileA1(tid) && flags) {
                            const f = flags[tid];
                            if (f !== undefined && (f & 0x0f) === 0x0f) {
                                this.drawTileToCanvasContext(cCtx, tid, screenX, screenY);
                                this.drawTileToCanvasContext(oCtx, tid, screenX, screenY);
                                casterCount++;
                            }
                        }
                    }
                    for (const tid of [tileL2, tileL3]) {
                        if (tid > 0 && flags) {
                            const f = flags[tid];
                            if (f !== undefined) {
                                const isUpper = (f & 0x10) !== 0;
                                const isImpassableOrPartiallyBlocked = (f & 0x0f) !== 0;
                                if (isUpper || isImpassableOrPartiallyBlocked || isBaseOfVerticalStructure) {
                                    // No Mapa-Múndi ou estruturas conectadas, mantém topo e base unidos na silhueta contínua
                                    this.drawTileToCanvasContext(cCtx, tid, screenX, screenY);
                                    this.drawTileToCanvasContext(oCtx, tid, screenX, screenY);
                                    casterCount++;
                                }
                            }
                        }
                    }
                } else {
                    // MAPAS DE ÁREA (Cidades, Vilas, Florestas, Masmorras, Castelos)
                    const isWall = isWallLocation(x, y);
                    const isWallEdge = isWallEdgeLocation(x, y);

                    // 1. Paredes e Edifícios (Camadas A3/A4 em L0 e L1):
                    // Para criar um volume arquitetônico unificado e evitar fatias duplicadas de tijolos,
                    // a sombra cai na rua apenas a partir da borda/base da parede (isWallEdge) ou beiral de telhado.
                    for (const tid of [tileL0, tileL1]) {
                        if (Tilemap.isShadowingTile(tid)) {
                            if (isWallEdge || Tilemap.isRoofTile(tid)) {
                                this.drawTileToCanvasContext(cCtx, tid, screenX, screenY);
                                this.drawTileToCanvasContext(oCtx, tid, screenX, screenY);
                                casterCount++;
                            } else {
                                // Corpo interno da parede: adiciona apenas ao cutout para proteger a fachada
                                this.drawTileToCanvasContext(oCtx, tid, screenX, screenY);
                            }
                        }
                    }

                    // 2. Objetos e Decorações (Camadas B-E em L2 e L3):
                    for (const tid of [tileL2, tileL3]) {
                        if (tid > 0 && flags) {
                            const f = flags[tid];
                            if (f !== undefined) {
                                const isUpper = (f & 0x10) !== 0;
                                const isBlocked = (f & 0x0f) !== 0;

                                // REGRA VISUAL 2.5D: Se o objeto está pregado numa PAREDE (A3/A4),
                                // ele é uma "Decoração de Parede" (banners, placa de espada, janelas, tochas).
                                // Decorações de parede pertencem ao plano vertical e NUNCA devem
                                // projetar sombras extrudadas sobre a rua/chão!
                                if (isWall) {
                                    // Absorvido na parede: apenas protege a arte do objeto no cutout
                                    this.drawTileToCanvasContext(oCtx, tid, screenX, screenY);
                                    continue;
                                }

                                // Se o objeto está no CHÃO (calçada, grama, terra):
                                if (isUpper) {
                                    // Copa de árvore elevada ou toldo livre sobre o chão
                                    if (canopyHeightOffset > 0.01) {
                                        this.drawTileToCanvasContext(knCtx, tid, screenX, screenY);
                                        canopyCount++;
                                    } else {
                                        this.drawTileToCanvasContext(cCtx, tid, screenX, screenY);
                                        casterCount++;
                                    }
                                } else if (isBlocked || isBaseOfVerticalStructure) {
                                    // Objeto de solo apoiado no chão (lápides, monumentos, barris, troncos de árvores, postes)
                                    this.drawTileToCanvasContext(cCtx, tid, screenX, screenY);
                                    this.drawTileToCanvasContext(oCtx, tid, screenX, screenY);
                                    casterCount++;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (casterCount === 0 && canopyCount === 0) {
            this._dayNightTileShadowBitmap._baseTexture.update();
            return;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        const dist = Math.hypot(dx, dy);

        // PASSE 1A: Extrusão Contínua de Casters com Atenuação pela Distância (Contact Hardening)
        // Mais densa na base (s = 1) e gradualmente mais suave na ponta (s = steps)
        if (casterCount > 0) {
            const steps = Math.max(4, Math.min(10, Math.ceil(dist / 3)));
            for (let s = 1; s <= steps; s++) {
                const t = s / steps;
                const ox = Math.round(dx * t);
                const oy = Math.round(dy * t);
                ctx.globalAlpha = Math.max(0.18, Math.pow(1.0 - (t * 0.60), 1.4));
                ctx.drawImage(this._dayNightCastersCanvas, ox, oy);
            }
        }

        // PASSE 1B: Extrusão de Copas Flutuantes (quando CanopyHeightOffset > 0)
        if (canopyCount > 0) {
            const offsetDistX = Math.round(dx * canopyHeightOffset);
            const offsetDistY = Math.round(dy * canopyHeightOffset);
            const canopySteps = Math.max(3, Math.min(7, Math.ceil(dist / 4)));
            for (let s = 0; s <= canopySteps; s++) {
                const t = s / canopySteps;
                const ox = offsetDistX + Math.round(dx * t * 0.65);
                const oy = offsetDistY + Math.round(dy * t * 0.65);
                ctx.globalAlpha = Math.max(0.15, Math.pow(1.0 - (t * 0.65), 1.4));
                ctx.drawImage(this._dayNightCanopyCanvas, ox, oy);
            }
        }

        // PASSE 2: Tinge os pixels estampados na cor da sombra preservando o gradiente de opacidade (source-atop)
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = sunData.shadowRgb || 'rgb(12, 18, 32)';
        ctx.fillRect(0, 0, w, h);

        // PASSE 3: Recorta a silhueta exata das estruturas originais (destination-out)
        ctx.globalCompositeOperation = 'destination-out';
        ctx.drawImage(this._dayNightCutoutCanvas, 0, 0);

        // PASSE 4: Dissolução de Sombra Ambiente por Fontes de Luz Locais (Tochas, Fogueiras e Lanterna)
        const lightInfo = getAmbientLightForTime(totalMinutes);
        if (playerLanternEnabled && lightInfo.alpha > 0.25) {
            const flicker = getFlameFlicker(42);
            const px = $gamePlayer.screenX() + flicker.offsetX;
            const py = $gamePlayer.screenY() - (tileH / 3) + flicker.offsetY;
            const pRadius = playerLanternRadius * 0.85 * Math.min(1.0, (lightInfo.alpha - 0.2) / 0.5) * flicker.radiusMult;
            this.drawSoftLightHole(ctx, px, py, pRadius, 0.85 * flicker.alphaMult);
        }

        const events = $gameMap.events();
        for (let i = 0; i < events.length; i++) {
            const ev = events[i];
            const lightData = ev.dayNightLightData();
            if (lightData) {
                const flicker = getFlameFlicker(ev.eventId() * 17.3);
                const ex = ev.screenX() + flicker.offsetX;
                const ey = ev.screenY() - (tileH / 3) + flicker.offsetY;
                const radius = lightData.radius * 0.85 * flicker.radiusMult;
                if (ex >= -radius && ex <= w + radius && ey >= -radius && ey <= h + radius) {
                    this.drawSoftLightHole(ctx, ex, ey, radius, 0.90 * flicker.alphaMult);
                }
            }
        }

        ctx.restore();
        this._dayNightTileShadowBitmap._baseTexture.update();
    };

    Spriteset_Map.prototype.updateDayNightLighting = function() {
        if (!this._dayNightOverlayBitmap) return;

        const ctx = this._dayNightOverlayBitmap.context;
        const w = Graphics.width;
        const h = Graphics.height;

        ctx.clearRect(0, 0, w, h);

        if ($gameSystem.isDayNightIndoor()) {
            this._dayNightOverlayBitmap._baseTexture.update();
            return;
        }

        const totalMinutes = $gameSystem.dayNightTotalMinutes();
        const light = getAmbientLightForTime(totalMinutes);

        if (light.alpha <= 0.005) {
            this._dayNightOverlayBitmap._baseTexture.update();
            return;
        }

        ctx.save();
        ctx.fillStyle = `rgba(${light.r}, ${light.g}, ${light.b}, ${light.alpha})`;
        ctx.fillRect(0, 0, w, h);

        ctx.globalCompositeOperation = 'destination-out';

        if (playerLanternEnabled && light.alpha > 0.25) {
            const flicker = getFlameFlicker(42);
            const px = $gamePlayer.screenX() + flicker.offsetX;
            const py = $gamePlayer.screenY() - ($gameMap.tileHeight() / 3) + flicker.offsetY;
            const pRadius = playerLanternRadius * Math.min(1.0, (light.alpha - 0.2) / 0.5) * flicker.radiusMult;

            this.drawSoftLightHole(ctx, px, py, pRadius, 0.95 * flicker.alphaMult);
        }

        const events = $gameMap.events();
        for (let i = 0; i < events.length; i++) {
            const ev = events[i];
            const lightData = ev.dayNightLightData();
            if (lightData) {
                const flicker = getFlameFlicker(ev.eventId() * 17.3);
                const ex = ev.screenX() + flicker.offsetX;
                const ey = ev.screenY() - ($gameMap.tileHeight() / 3) + flicker.offsetY;
                const radius = lightData.radius * flicker.radiusMult;

                if (ex >= -radius && ex <= w + radius && ey >= -radius && ey <= h + radius) {
                    this.drawSoftLightHole(ctx, ex, ey, radius, 1.0 * flicker.alphaMult);
                }
            }
        }

        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        if (playerLanternEnabled && light.alpha > 0.25) {
            const flicker = getFlameFlicker(42);
            const px = $gamePlayer.screenX() + flicker.offsetX;
            const py = $gamePlayer.screenY() - ($gameMap.tileHeight() / 3) + flicker.offsetY;
            const pRadius = playerLanternRadius * Math.min(1.0, (light.alpha - 0.2) / 0.5) * flicker.radiusMult;
            this.drawColorLightAura(ctx, px, py, pRadius, 'rgba(255, 230, 160, 0.25)', flicker.alphaMult);
        }

        for (let i = 0; i < events.length; i++) {
            const ev = events[i];
            const lightData = ev.dayNightLightData();
            if (lightData) {
                const flicker = getFlameFlicker(ev.eventId() * 17.3);
                const ex = ev.screenX() + flicker.offsetX;
                const ey = ev.screenY() - ($gameMap.tileHeight() / 3) + flicker.offsetY;
                const radius = lightData.radius * flicker.radiusMult;

                if (ex >= -radius && ex <= w + radius && ey >= -radius && ey <= h + radius) {
                    this.drawColorLightAura(ctx, ex, ey, radius, lightData.color || '#ffaa44', flicker.alphaMult);
                }
            }
        }

        ctx.restore();
        this._dayNightOverlayBitmap._baseTexture.update();
    };

    Spriteset_Map.prototype.drawSoftLightHole = function(ctx, x, y, radius, intensity) {
        if (radius <= 0) return;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0.00, `rgba(0, 0, 0, ${intensity})`);
        grad.addColorStop(0.20, `rgba(0, 0, 0, ${(intensity * 0.95).toFixed(3)})`);
        grad.addColorStop(0.45, `rgba(0, 0, 0, ${(intensity * 0.70).toFixed(3)})`);
        grad.addColorStop(0.75, `rgba(0, 0, 0, ${(intensity * 0.30).toFixed(3)})`);
        grad.addColorStop(1.00, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    };

    Spriteset_Map.prototype.drawColorLightAura = function(ctx, x, y, radius, colorHexOrRgba, intensityMultiplier = 1.0) {
        if (radius <= 0) return;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);

        let rgb = '255, 180, 80';
        if (colorHexOrRgba.startsWith('#')) {
            const hex = colorHexOrRgba.replace('#', '');
            const bigint = parseInt(hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex, 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            rgb = `${r}, ${g}, ${b}`;
        }

        const a1 = (0.42 * intensityMultiplier).toFixed(3);
        const a2 = (0.22 * intensityMultiplier).toFixed(3);
        const a3 = (0.07 * intensityMultiplier).toFixed(3);

        grad.addColorStop(0.00, `rgba(${rgb}, ${a1})`);
        grad.addColorStop(0.35, `rgba(${rgb}, ${a2})`);
        grad.addColorStop(0.70, `rgba(${rgb}, ${a3})`);
        grad.addColorStop(1.00, `rgba(${rgb}, 0.0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    };

    // =========================================================================
    // 6. Sprite_Character - Projeção de Sombras Dinâmicas e Oclusão de Contato
    // =========================================================================

    const _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
    Sprite_Character.prototype.initMembers = function() {
        _Sprite_Character_initMembers.call(this);
        this._dynamicSunShadowSprite = null;
        this._contactShadowSprite = null;
    };

    Sprite_Character.prototype.getCharacterShadowContainer = function() {
        if (this.parent && this.parent._characterShadowContainer) {
            return this.parent._characterShadowContainer;
        }
        if (typeof SceneManager !== 'undefined' && SceneManager._scene && SceneManager._scene._spriteset && SceneManager._scene._spriteset._characterShadowContainer) {
            return SceneManager._scene._spriteset._characterShadowContainer;
        }
        return null;
    };

    Sprite_Character.prototype.createDynamicSunShadow = function() {
        if (!this._dynamicSunShadowSprite) {
            this._dynamicSunShadowSprite = new Sprite();
            this._dynamicSunShadowSprite.anchor.x = 0.5;
            this._dynamicSunShadowSprite.anchor.y = 1.0;
            this._dynamicSunShadowSprite.setColorTone([-255, -255, -255, 0]);
            this._dynamicSunShadowSprite.setBlendColor([0, 0, 0, 255]);

            if (enableSoftShadows && typeof PIXI !== 'undefined' && PIXI.filters && PIXI.filters.BlurFilter) {
                const blur = new PIXI.filters.BlurFilter();
                blur.blur = shadowBlur;
                this._dynamicSunShadowSprite.filters = [blur];
            }
            if (typeof PIXI !== 'undefined' && PIXI.BLEND_MODES) {
                this._dynamicSunShadowSprite.blendMode = shadowBlendMode;
            }
        }

        if (!this._contactShadowSprite && enableContactShadow) {
            this._contactShadowSprite = new Sprite(getSharedContactShadowBitmap());
            this._contactShadowSprite.anchor.x = 0.5;
            this._contactShadowSprite.anchor.y = 0.5;
            if (typeof PIXI !== 'undefined' && PIXI.BLEND_MODES) {
                this._contactShadowSprite.blendMode = shadowBlendMode;
            }
        }

        const container = this.getCharacterShadowContainer();
        if (container) {
            if (this._dynamicSunShadowSprite && this._dynamicSunShadowSprite.parent !== container) {
                container.addChild(this._dynamicSunShadowSprite);
            }
            if (this._contactShadowSprite && this._contactShadowSprite.parent !== container) {
                container.addChild(this._contactShadowSprite);
            }
        }
    };

    const _Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function() {
        _Sprite_Character_update.call(this);
        this.updateDynamicSunShadow();
    };

    Sprite_Character.prototype.updateDynamicSunShadow = function() {
        if (!this._character || this.isEmptyCharacter() || !this.visible || this._character.isTransparent()) {
            if (this._dynamicSunShadowSprite) this._dynamicSunShadowSprite.visible = false;
            if (this._contactShadowSprite) this._contactShadowSprite.visible = false;
            return;
        }

        if (this._tileId > 0 || this._character instanceof Game_Vehicle) {
            if (this._dynamicSunShadowSprite) this._dynamicSunShadowSprite.visible = false;
            if (this._contactShadowSprite) this._contactShadowSprite.visible = false;
            return;
        }

        if (this._character instanceof Game_Event) {
            const ev = this._character.event();
            if (ev && ev.meta && ev.meta.no_shadow) {
                if (this._dynamicSunShadowSprite) this._dynamicSunShadowSprite.visible = false;
                if (this._contactShadowSprite) this._contactShadowSprite.visible = false;
                return;
            }
        }

        if (!this._dynamicSunShadowSprite || (enableContactShadow && !this._contactShadowSprite)) {
            this.createDynamicSunShadow();
        }

        const container = this.getCharacterShadowContainer();
        if (container) {
            if (this._dynamicSunShadowSprite && this._dynamicSunShadowSprite.parent !== container) {
                container.addChild(this._dynamicSunShadowSprite);
            }
            if (this._contactShadowSprite && this._contactShadowSprite.parent !== container) {
                container.addChild(this._contactShadowSprite);
            }
        }

        const jumpHeight = (this._character && typeof this._character.jumpHeight === 'function') ? this._character.jumpHeight() : 0;
        const groundX = this.x;
        const groundY = this.y + jumpHeight;

        if (enableContactShadow && this._contactShadowSprite) {
            this._contactShadowSprite.x = groundX;
            this._contactShadowSprite.y = groundY - 2;
            const jumpScale = Math.max(0.35, 1.0 - jumpHeight / 90);
            this._contactShadowSprite.scale.x = jumpScale;
            this._contactShadowSprite.scale.y = jumpScale * 0.9;
            const jumpAlpha = Math.max(0.20, 1.0 - jumpHeight / 70);
            this._contactShadowSprite.opacity = Math.round(contactShadowOpacity * 255 * (this.opacity / 255) * jumpAlpha);
            this._contactShadowSprite.visible = true;
        } else if (this._contactShadowSprite) {
            this._contactShadowSprite.visible = false;
        }

        const isIndoor = typeof $gameSystem !== 'undefined' && $gameSystem && $gameSystem.isDayNightIndoor();
        if (!enableDynamicShadows || isIndoor) {
            if (this._dynamicSunShadowSprite) this._dynamicSunShadowSprite.visible = false;
            return;
        }

        const totalMinutes = (typeof $gameSystem !== 'undefined' && $gameSystem) ? $gameSystem.dayNightTotalMinutes() : 720;
        const sunData = getSunShadowVectorForTime(totalMinutes);

        // Verifica se há uma fonte de luz local próxima para modular/projetar a sombra do personagem
        let localLightSkewX = 0;
        let localLightScaleY = 0;
        let localLightInfluence = 0;

        if ($gameMap) {
            const charScreenX = this._character.screenX();
            const charScreenY = this._character.screenY();
            const events = $gameMap.events();
            let closestDist = Infinity;

            for (let i = 0; i < events.length; i++) {
                const ev = events[i];
                if (ev === this._character) continue;
                const lData = ev.dayNightLightData();
                if (lData && lData.radius > 0) {
                    const lx = ev.screenX();
                    const ly = ev.screenY();
                    const dist = Math.hypot(charScreenX - lx, charScreenY - ly);
                    if (dist < lData.radius && dist < closestDist && dist > 4) {
                        closestDist = dist;
                        const strength = 1.0 - (dist / lData.radius);
                        localLightInfluence = strength * 0.75;
                        localLightSkewX = ((charScreenX - lx) / lData.radius) * 1.15;
                        localLightScaleY = 0.25 + (dist / lData.radius) * 0.35;
                    }
                }
            }
        }

        if (!sunData.visible && localLightInfluence <= 0.05) {
            if (this._dynamicSunShadowSprite) this._dynamicSunShadowSprite.visible = false;
            return;
        }

        const shadow = this._dynamicSunShadowSprite;
        shadow.bitmap = this.bitmap;
        shadow.setFrame(this._frame.x, this._frame.y, this._frame.width, this._frame.height);

        const finalSkewX = sunData.visible
            ? sunData.skewX * (1.0 - localLightInfluence) + localLightSkewX * localLightInfluence
            : localLightSkewX;
        const finalScaleY = sunData.visible
            ? sunData.scaleY * (1.0 - localLightInfluence) + localLightScaleY * localLightInfluence
            : localLightScaleY;
        const finalAlpha = sunData.visible
            ? Math.max(sunData.alpha * (1.0 - localLightInfluence * 0.4), localLightInfluence * shadowOpacity)
            : localLightInfluence * shadowOpacity;

        shadow.x = groundX;
        shadow.y = groundY;
        shadow.anchor.x = 0.5;
        shadow.anchor.y = 1.0;
        shadow.skew.x = finalSkewX;
        shadow.scale.y = -finalScaleY;
        shadow.scale.x = 1.0;
        shadow.opacity = Math.round(finalAlpha * 255 * (this.opacity / 255));
        shadow.visible = true;
    };

    const _Sprite_Character_destroy = Sprite_Character.prototype.destroy;
    Sprite_Character.prototype.destroy = function(options) {
        if (this._dynamicSunShadowSprite) {
            if (this._dynamicSunShadowSprite.parent && typeof this._dynamicSunShadowSprite.parent.removeChild === 'function') {
                this._dynamicSunShadowSprite.parent.removeChild(this._dynamicSunShadowSprite);
            }
            if (typeof this._dynamicSunShadowSprite.destroy === 'function') {
                this._dynamicSunShadowSprite.destroy();
            }
            this._dynamicSunShadowSprite = null;
        }
        if (this._contactShadowSprite) {
            if (this._contactShadowSprite.parent && typeof this._contactShadowSprite.parent.removeChild === 'function') {
                this._contactShadowSprite.parent.removeChild(this._contactShadowSprite);
            }
            if (typeof this._contactShadowSprite.destroy === 'function') {
                this._contactShadowSprite.destroy();
            }
            this._contactShadowSprite = null;
        }
        if (_Sprite_Character_destroy) {
            _Sprite_Character_destroy.call(this, options);
        }
    };

    // =========================================================================
    // 7. HUD do Relógio de Dia, Noite e Fases da Lua
    // =========================================================================

    class Sprite_DayNightClock extends Sprite {
        constructor() {
            super();
            this.bitmap = new Bitmap(200, 50);
            this.x = clockX;
            this.y = clockY;
            this.z = 20;
            this._lastMinute = -1;
            this._lastHour = -1;
            this._lastMoonPhase = -1;
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

            ctx.fillStyle = '#182232';
            ctx.strokeStyle = '#4a607a';
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
                const glow = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.45);
                glow.addColorStop(0, 'rgba(210, 235, 255, 0.45)');
                glow.addColorStop(1, 'rgba(210, 235, 255, 0.0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(cx, cy, radius * 1.45, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(cx, cy, radius - 0.5, 0, Math.PI * 2);
            ctx.clip();

            const litColor = (phaseIndex === 4) ? '#eef7ff' : '#c8e4ff';
            ctx.fillStyle = litColor;

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
                ctx.fillStyle = '#182232';
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
                ctx.fillStyle = '#182232';
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
            ctx.fillStyle = 'rgba(12, 16, 24, 0.88)';
            ctx.strokeStyle = '#c5a059';
            ctx.lineWidth = 1.5;

            const r = 8;
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(w - r, 0);
            ctx.quadraticCurveTo(w, 0, w, r);
            ctx.lineTo(w, h - r);
            ctx.quadraticCurveTo(w, h, w - r, h);
            ctx.lineTo(r, h);
            ctx.quadraticCurveTo(0, h, 0, h - r);
            ctx.lineTo(0, r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            const currentHour = this._lastHour;
            const isDay = currentHour >= 6 && currentHour < 18;
            const iconX = 24;
            const iconY = 25;

            if (isDay) {
                ctx.fillStyle = '#ffcc00';
                ctx.beginPath();
                ctx.arc(iconX, iconY, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ff9900';
                ctx.lineWidth = 1.5;
                for (let a = 0; a < 8; a++) {
                    const ang = (a * Math.PI) / 4;
                    const x1 = iconX + Math.cos(ang) * 12;
                    const y1 = iconY + Math.sin(ang) * 12;
                    const x2 = iconX + Math.cos(ang) * 15;
                    const y2 = iconY + Math.sin(ang) * 15;
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
            ctx.fillText(timeStr, 48, 23);

            const subLabel = (!isDay) ? `${moonName} • Dia ${dayCount}` : `${lightInfo.label} • Dia ${dayCount}`;
            ctx.font = '11px sans-serif';
            ctx.fillStyle = (!isDay) ? '#b8d8ff' : '#dcdcdc';
            ctx.shadowBlur = 2;
            ctx.fillText(subLabel, 48, 39);

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
        setMoonPhase: (p) => { if ($gameSystem)$gameSystem.setMoonPhase(p); },
        isNight: () => $gameSystem ? $gameSystem.isNight() : false,
        setTime: (h, m) => { if ($gameSystem)$gameSystem.setTime(h, m); },
        addTime: (h, m) => { if ($gameSystem)$gameSystem.addTime(h, m); },
        pause: () => { if ($gameSystem)$gameSystem.setTimePaused(true); },
        resume: () => { if ($gameSystem)$gameSystem.setTimePaused(false); },
        version: "1.3.0"
    };

    console.log(`${pluginName} [v1.3.0]: Plugin carregado com sucesso.`);

})();