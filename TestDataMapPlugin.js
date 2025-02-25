/*:
 * @target MZ
 * @plugindesc Plugin de Teste MINIMAL para Exibir DataMap (ONMAPLOADED TEST)
 * @author Gemini
 * @help   Plugin de Teste MINIMAL para verificar se o código em onMapLoaded() está executando.
 *
 * Comando Plugin: TesteOnMapLoaded
 *
 * Para usar, chame o comando de plugin "TesteOnMapLoaded" para agendar um teste em onMapLoaded.
 *
 * @command TesteOnMapLoaded
 * @text Teste OnMapLoaded (Console)
 * @desc Agenda um teste simples para onMapLoaded (exibe mensagem no console).
 */

(() => {
  const pluginName = 'TestDataMapPlugin'; // Nome ÚNICO para o plugin

  let testeOnMapLoadedFlag = false; // Flag para o teste onMapLoaded


  PluginManager.registerCommand(pluginName, "TesteOnMapLoaded", function(args) { // Comando para agendar o teste
      console.log("[TestDataMapPlugin] Comando TesteOnMapLoaded AGENDADO para onMapLoaded."); // Log de agendamento
      testeOnMapLoadedFlag = true; // **Seta a flag para true**
  });


  const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded; // Alias da função original
  Scene_Map.prototype.onMapLoaded = function() {
      _Scene_Map_onMapLoaded.call(this); // Chamar onMapLoaded original primeiro
      console.log("[Scene_Map.onMapLoaded] onMapLoaded() ORIGINAL CHAMADO! - Mapa carregado (TestDataMapPlugin MINIMAL)."); // *** Log onMapLoaded do Teste Plugin ***

      if (testeOnMapLoadedFlag) { // **Verifica flag: Teste onMapLoaded?**
          console.log("[TestDataMapPlugin] Flag testeOnMapLoadedFlag VERDADEIRA. Executando teste minimal em onMapLoaded()."); // Log de execução do teste

          // **TESTE MINIMAL: Apenas exibir uma mensagem no console**
          console.log("[TestDataMapPlugin] TESTE ONMAPLOADED: Mensagem de teste DENTRO de onMapLoaded()!");
          console.log("[TestDataMapPlugin] TESTE ONMAPLOADED: $gameMap.data (DEVE SER UNDEFINED):", $gameMap.data); // Verificar $gameMap.data novamente (apenas por precaução)


          testeOnMapLoadedFlag = false; // **Reseta a flag**
      }
  };

})();