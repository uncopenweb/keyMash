dojo.require("editor.GridSelector");
dojo.require("editor.GameEditor");

var gameGridLayout =  [
    { name: 'Game Name', field: 'name', width: "50%" },
    { name: 'Id', field: '_id', width: "50%" } ];

var profileGridLayout =  [
    { name: 'Profile Name', field: 'name', width: "50%" },
    { name: 'Id', field: '_id', width: "50%" } ];
    
var database = "KeyMash";
var gameCollection = "Games";
var profileCollection = "Profiles";

var currentDisplay = null;

var currentGame = null;

function init() {

    displayGameSelector();

}

function displayGameSelector() {
    uow.getDatabase({database:database, collection:gameCollection}).addCallback(function(db) {
        var gs = new editor.GridSelector({db: db, gridLayout: gameGridLayout, selectCallback: selectGameCallback});
        dojo.place(gs.domNode, "activity");
        currentDisplay = gs;
    });
}

function selectGameCallback(game) {
    //store current game
    currentGame = game;
    
    //tear down grid
    currentDisplay.destroyRecursive();
    
    //init profile chooser
    displayProfileSelector();
}

function displayProfileSelector() {
    uow.getDatabase({database:database, collection:profileCollection}).addCallback(function(db) {
        var ps = new editor.GridSelector({db: db, gridLayout: profileGridLayout, selectCallback: selectProfileCallback});
        dojo.place(ps.domNode, "activity");
        currentDisplay = ps;
    });
}

function selectProfileCallback(game) {
    //store current game
    if(game) currentGame = game;
    
    //tear down grid
    currentDisplay.destroyRecursive();
    
    //init game editor
    displayGameEditor(currentGame);
}

function displayGameEditor(game) {
    var ge = new editor.GameEditor({game: game});
    dojo.place(ge.domNode, "activity");
    currentDisplay = ge;
}

dojo.ready(init);
