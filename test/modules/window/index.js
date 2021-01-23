(function(){

    browser.window = {};

    ['window'].forEach(function(object){
        loadScripts('window/' + object);
    });

})();