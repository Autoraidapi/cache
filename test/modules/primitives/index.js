(function(){
    
    browser.primitives = {};

    [ 'primitives' ].forEach(function(object){
        load('primitives/' + object);
    });

})();