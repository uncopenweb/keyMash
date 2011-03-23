dojo.provide("editor.GameEditor");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");

dojo.declare("editor.GameEditor", [ dijit._Widget, dijit._Templated ], {
    templatePath: dojo.moduleUrl("editor", "GameEditor.html"),
    widgetsInTemplate: true,

    postCreate: function() {
    
    }


});
