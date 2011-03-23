dojo.provide('editor.GridEditor');

dojo.require('dijit._Templated');
dojo.require('dijit._Widget');
dojo.require('dijit._Container');
dojo.require('dijit.form.Button');
dojo.require('dijit.Dialog');
dojo.require('dojox.grid.DataGrid');

/*
 * A trimmed down generic editor.
 * Used for wrapping grids with some basic functionality and behavior.
 */

dojo.declare('editor.GridEditor', [dijit._Widget, dijit._Templated, dijit._Container ], {
    templatePath: dojo.moduleUrl('editor', 'GridEditor.html'),
    widgetsInTemplate: true,

    store: {},
    gridLayout: {},

    current: null, //item being edited if it is from the collection

    postCreate: function() {
        this.inherited(arguments);

        this.grid = new dojox.grid.DataGrid({
            store: this.store,
            structure: this.gridLayout});
        dojo.place(this.grid.domNode, this.gridGoesHere);
        this.connect(this.grid, 'onSelected', 'lightSelect');
        this.connect(this.grid, 'onRowDblClick', 'hardSelect');
        this.connect(this.editButton, 'onClick', 'hardSelect');
        this.connect(this.grid, 'onSelectionChanged', function(i) {
            var noneSelected = this.grid.selection.getSelectedCount() === 0;
            this.deleteButton.attr('disabled', noneSelected);
            this.editButton.attr('disabled', noneSelected);
        });
        this.editButton.attr('disabled', true);
        this.connect(this.deleteButton, 'onClick', 'deleteItem');
        this.deleteButton.attr('disabled', true);
        this.connect(this.newButton, 'onClick', 'newItem');
        this.connect(this.saveButton, 'onClick', 'save');
        this.saveButton.attr('disabled', true);
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
        if(this.current.name) this.setSelectedTitle(this.current.name); 
        else if(this.current.Name) this.setSelectedTitle(this.current.Name);
        this.editItem();
    },

    startup: function() {
        this.grid.startup();
    },

    editItem: function() {
        console.log("GridEditor - editItem");
        this.saveButton.attr('disabled', false);
        console.log("GridEditor - editItem DONE");
    },

    //Note: Does not fire through 'hardSelect', but follows same behavior
    newItem: function(evt) {
        this.current = this.store.newItem();
        this.grid.selection.select(this.grid.getItemIndex(this.current));
        this.editItem();
    },

    //save 'current', not selected
    save: function() {
        var value = this.form.attr('value');

        this.store.changing(this.current);
        dojo.mixin(this.current, value);
        var a = this.store.save({
            onComplete: function() {
                console.log('save complete, does grid update?');
                // apparently they don't trigger this when changing is used.
                this.store.onSet(this.current);
            },
            scope: this
        });
        console.log('actions=', a);
    },

    deleteItem: function() {
        console.log('deleteItem');
        this.grid.removeSelectedRows();
        this.store.save();
        return;
        
        // this appears to have quit working.
        var deleteCallback = dojo.hitch(this, function(del) {
            console.log('d callback', del);
            if(del) {
                console.log('deleting');
                this.store.deleteItem(this.selected);
                console.log('saving');
                this.store.save();
            }
            else {
                 ("delete canceled");
            }
        });
        this.yesNoDialog("Delete Item?", dojo.replace("Are you sure you want to delete {0}?", 
                [this.selected.name]), deleteCallback);
    },

    yesNoDialog: function(title, content, callback) {

        var dialog = new dijit.Dialog({id: 'yesNoDialog', title:title });

        var callbackwrapper = function(mouseEvent) {
            dialog.hide();
            dialog.destroyRecursive();
            console.log(mouseEvent);
            if(mouseEvent.explicitOriginalTarget.id = 'yesButton') {
                callback(true);
            } else {
                callback(false);
            }
        };

        var questionDiv = dojo.create('div', { innerHTML: content });
        var yesButton = new dijit.form.Button(
                { label: 'Yes', id: 'yesButton', onClick: callbackwrapper });
        var noButton = new dijit.form.Button(
                { label: 'No', id: 'noButton', onClick: callbackwrapper });

        dialog.containerNode.appendChild(questionDiv);
        dialog.containerNode.appendChild(yesButton.domNode);
        dialog.containerNode.appendChild(noButton.domNode);

        dialog.show();

    },
    
    setSelectedTitle: function(value) {
        this.selectedGoesHere.innerHTML = "Currently Open: " 
            + value;
    },
    
    getCurrentItem: function() {
        return this.current;
    }

});
