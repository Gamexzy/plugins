/*:pt-BR
* @target MZ
* @plugindesc Plugin Markov para geração de mapas com cadeias de Markov (com comandos Salvar/Carregar Markov).
* @author Gemini
* @help
* Comandos de Plugin:
*
* TreinarMarkov
*   Treina a cadeia de Markov com dados de tiles fornecidos.
*
*   Argumentos do Comando TreinarMarkov:
*     dadosTreinamento:texto (multilinhas) - Dados de treinamento da cadeia de Markov (Tile IDs separados por vírgula e quebra de linha).
*
*   Exemplo de Comando de Plugin em Evento ou Console de Teste:
*     TreinarMarkov dadosTreinamento:2816,2816,2816,2864,2864,2864,2864,2864,2816,2816,2816,2048,2816,2816,2816\n2816,2816,2816,2816,2864,2864,2864,2816,2816,2816,2048,2048,2816,2816,2816\n... (mais linhas de Tile IDs)
*
* GerarMapaMarkov
*   Gera um mapa Markov baseado na cadeia treinada e aplica no mapa atual.
*
*   Argumentos do Comando GerarMapaMarkov:
*     largura:valor   - Largura do mapa a ser gerado (número).
*     altura:valor    - Altura do mapa a ser gerado (número).
*     camadaBase:valor - Camada base para aplicar o mapa gerado (0: Inferior, 1: Meio, 2: Superior, número).
*
*   Exemplo de Comando de Plugin em Evento ou Console de Teste:
*     GerarMapaMarkov largura:20 altura:15 camadaBase:0
*
* SalvarMarkov
*   Salva a cadeia de Markov treinada no parâmetro do plugin.
*   Não requer argumentos.
*
* CarregarMarkov
*   Carrega uma cadeia de Markov salva do parâmetro do plugin.
*   Substitui o treinamento atual pela cadeia carregada.
*   Não requer argumentos.
*
*
* Este plugin adiciona os comandos "TreinarMarkov", "GerarMapaMarkov", "SalvarMarkov" e "CarregarMarkov".
*
* Use "TreinarMarkov" para treinar a cadeia de Markov com dados de tiles.
* Use "GerarMapaMarkov" para gerar um mapa Markov baseado na cadeia treinada.
* Use "SalvarMarkov" para salvar o treinamento da cadeia de Markov.
* Use "CarregarMarkov" para carregar um treinamento de cadeia de Markov salvo.
*
* @command TreinarMarkov
* @text Treinar Cadeia Markov
* @desc Treina a cadeia de Markov com dados de tiles.
*
* @arg dadosTreinamento
* @type textarea
* @default
* @text Dados de Treinamento (Tile IDs)
* @desc Dados para treinar a cadeia de Markov (Tile IDs separados por vírgula e quebra de linha).
* @parent TreinarMarkov
*
* @command GerarMapaMarkov
* @text Gerar Mapa Markov
* @desc Gera um mapa Markov baseado na cadeia treinada e aplica no mapa atual.
*
* @arg largura
* @type number
* @min 1
* @max 100
* @default 10
* @text Largura do Mapa
* @desc Largura do mapa Markov a ser gerado.
* @parent GerarMapaMarkov
*
* @arg altura
* @type number
* @min 1
* @max 100
* @default 8
* @text Altura do Mapa
* @desc Altura do mapa Markov a ser gerado.
* @parent GerarMapaMarkov
*
* @arg camadaBase
* @type number
* @min 0
* @max 2
* @default 0
* @text Camada Base
* @desc Camada do mapa para aplicar a geração Markov (0: Inferior, 1: Meio, 2: Superior).
* @parent GerarMapaMarkov
*
* @command SalvarMarkov
* @text Salvar Treinamento Markov
* @desc Salva a cadeia de Markov treinada no parâmetro do plugin.
*
* @command CarregarMarkov
* @text Carregar Treinamento Markov
* @desc Carrega uma cadeia de Markov salva do parâmetro do plugin.
*/