
dojo.require('game.KeyMash');

function init() {

    console.log("place widget");
    var sg = new game.KeyMash({schemaLocation: "easySchema.json"});
    dojo.place(sg.domNode, 'activity');
    console.log("placed");

}

dojo.ready(init);
