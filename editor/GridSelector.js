dojo.provide("editor.GridSelector");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojox.grid.DataGrid");
dojo.require("dijit.form.Button");

dojo.declare("editor.GridSelector", [ dijit._Widget, dijit._Templated ], {
    templatePath: dojo.moduleUrl("editor", "GridSelector.html"),
    widgetsInTemplate: true,
    
    db: {},
    isEditable: false,
    
    grid: {},
    store: {},
    gridLayout: {},
    
    current: null,
    
    saveCallback: null,
    editCallback: null,
    deleteCallback: null,
    selectCallback: null,
    
    postCreate: function() {
        this.inherited(arguments);

        this.grid = new dojox.grid.DataGrid({
            store: this.db,
            structure: this.gridLayout});
        dojo.place(this.grid.domNode, this.gridGoesHere);
        this.grid.startup();
        
        if(!this.isEditable) {
            dojo.style(this.editButton.domNode, {"display":"none"});
        }
        
        this.connect(this.grid, 'onSelected', 'lightSelect');
        this.connect(this.grid, 'onRowDblClick', 'hardSelect');
        this.connect(this.newButton, 'onClick', 'newItem');
        this.connect(this.editButton, 'onClick', 'editItem');
        this.connect(this.selectButton, 'onClick', 'selectItem');

    },
    
    setSaveCallback: function(callback) {
        this.saveCallback = callback;
    },
    
    setEditCallback: function(callback) {
        this.editCallback = callback;
    },
    
    setDeleteCallback: function(callback) {
        this.deleteCallback = callback;
    },
    
    setSelectCallback: function(callback) {
        this.selectCallback = callback;
    },
    
    lightSelect: function(idx) {
        this.selected = this.grid.getItem(idx);
        console.log("Light selected: ", this.selected);
    },

    hardSelect: function(evt) {
        var selected = this.grid.selection.getSelected();
        console.log("Hard selected: ", selected);
        //prompt for save?
        this.current = selected[0];
        this.selectItem();
    },    
    
    newItem: function(evt) {
        this.current = this.db.newItem();
        this.grid.selection.select(this.grid.getItemIndex(this.current));
        this.selectItem();
    },
    
    selectItem: function() {
        if(this.selectCallback)
            this.selectCallback(this.selected);
    },
    
    editItem: function() {
        if(this.editCallback)
            this.editCallback(this.selected);
    },

    startup: function() {
        this.grid.startup();
    },
    
    getCurrentItem: function() {
        return this.current;
    }


});
