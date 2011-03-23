dojo.require('editor.GridEditor');
dojo.require('profile.ProfileEditor');

function init() {

    uow.getDatabase({database:'KeyMash', collection:'Profiles'}).addCallback(function(db) {
    
        var pe = new profile.ProfileEditor({'db':db});
        dojo.place(pe.domNode, 'editorGoesHere');
    });

}

dojo.ready(init);
