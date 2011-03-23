dojo.require("dojo.dnd.Source");

function init() {

    console.log("init");

    var topRowKeys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    var middleRowKeys = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
    var bottomRowKeys = ['Z', 'C', 'V', 'B', 'N', 'M'];
    
    dojo.forEach(topRowKeys, 
        function(key) {
            var keyNode = dojo.create('span', {innerHTML:key});
            dojo.addClass(keyNode, 'keyblock');
            dojo.place(keyNode, 'keys_available');
        }
    );
    
    dojo.place('</br>', 'keys_available');
    
    dojo.forEach(middleRowKeys, 
        function(key) {
            var keyNode = dojo.create('span', {innerHTML:key});
            dojo.addClass(keyNode, 'keyblock');
            dojo.place(keyNode, 'keys_available');
        }
    );    
    
    dojo.place('</br>', 'keys_available');
    
    dojo.forEach(bottomRowKeys, 
        function(key) {
            var keyNode = dojo.create('span', {innerHTML:key});
            dojo.addClass(keyNode, 'keyblock');
            dojo.place(keyNode, 'keys_available');
        }
    );
    
    console.log("done");
    
}

dojo.ready(init);
