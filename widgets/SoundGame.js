dojo.provide('widgets.SoundGame');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('widgets.SoundGame', [ dijit._Widget, dijit._Templated ], {
    templatePath: dojo.moduleUrl('widgets', 'SoundGame.html'),
    widgetsInTemplate: true,
    
    sayTextQueue: [], //queue used for keeping text to say until the audio instance arrives
    
    audio: {},
    soundEnabled: false,
    
    keyDownHandle: '',
    keyUpHandle: '',
    
    available_keys: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    
    key_list: [ {keyName:'A', soundURL:'sounds/A2'},
                {keyName:'S', soundURL:'sounds/B2'},
                {keyName:'D', soundURL:'sounds/C3'},
                {keyName:'F', soundURL:'sounds/D3'}
                ],
    key_to_sound: { 'A':'sounds/A2',
                    'S':'sounds/B2',
                    'D':'sounds/C3',
                    'F':'sounds/D3'
                    },
    
    segments: [ ['A', 'S', 'D', 'S', 'A'],
                 ['A', 'D', 'S', 'A'],
                 ['F', 'D', 'F', 'D', 'S', 'A']
            ],
    segNum: 0,
    segIndex: 0,
    
    key_sequence: ['A', 'S', 'D', 'S', 'A'],
    sound_sequence: ['sounds/A2', 'sounds/B2', 'sounds/C3', 'sounds/B2', 'sounds/A2'],
    
    listeningForSegment: false,
    
    postCreate: function() {
        this.inherited(arguments);
        
        uow.getAudio().then(dojo.hitch(this, function(a) {
            this.audio = a;
            this.soundEnabled = true;
            this.playDeferredSounds();
        }));
        
        //register key events
        this.connect(null, 'onkeydown', this.handleKeyDown);
        this.connect(null, 'onkeyup', this.handleKeyUp);
        
        this.setupKeys();
        
        this.startGame();
    
    },
    
    setupKeys: function() {
        
        for(var i = 0; i < this.key_list.length; i++) {
            
            var key = dojo.create('span', {
                id:this.available_keys[i], 
                innerHTML:this.key_list[i].keyName
            });
            dojo.addClass(key, 'keyblock');
            
            dojo.place(key, this.at_keys);
            
        }
        
    },
    
    startGame: function() {

        this.at_messages.innerHTML = "Practice by pressing the keys to hear the sounds they make. <br> Press the space bar to continue...";
        this.sayText("Practice by pressing the keys to hear the sounds they make, then press the space bar when you are ready to continue");
        
        this.practice = true;
        
        
        
    },
    
    nextSegment: function() {
        console.log("next segment");
        this.segNum++;
        
        this.listeningForSegment = false;
        
//        this.at_messages.innerHTML = "Listen to the sequence of sounds, then try to replicate them";
//        this.sayText("Listen to the sequence of sounds, then press the space bar when you are ready to replicate them");
        
        //eventually do some segment setup
    
    },
    
    listenSegment: function() {
        console.log("listen segment");
        this.segIndex = 0;
        this.listeningForSegment = true;
        
        this.at_messages.innerHTML = "Try to replicate the segment!";
        this.sayText("Try to replicate the segment by pressing the keys to make sounds!");
    },
    
    startSegment: function() {
        
        var highlight = dojo.hitch(this, function(key) {
            this.colorKey(key);
            setTimeout(dojo.hitch(this, function() { this.uncolorKey(key); }), 500); 
        });
        
        var play = dojo.hitch(this, function(arg) {
            this.playSound(arg);
        });
        
        var listening = dojo.hitch(this, function(on) {
            this.listeningForSegment = on;
        });
        
        var playNextSound = dojo.hitch(this, function(args) {
            console.log("play sound start");
            var d = new dojo.Deferred();
            
            var time = args.time;
            var list = args.list;
            var sounds = args.sounds;
            var index = args.index;
            var key_to_sound = this.key_to_sound;
            console.log(time, list, sounds, index);
            
            setTimeout(function() {
                highlight(list[index]);
                play(key_to_sound[list[index]]);
                d.callback({time:500, 'list':list, 'sounds':sounds, 'index':++index});
            }, time);   
            //return d;
            
            if(index + 1 < list.length) {
                console.log("now?");
                dojo.when(d, playNextSound);
            } else {
                //listening(true);
                dojo.when(d, dojo.hitch(this, function() { 
                    this.listenSegment(); 
                }));
            }
        });

        console.log(this.key_sequence, this.sound_sequence);
        playNextSound({time:0, 'list':this.segments[this.segNum], 'sounds':this.sound_sequence, index:0});
        
//        playNextSound(0, 'a_key').then(function() {
//            return playNextSound(1000, 's_key');
//        }).then(function() {
//            return playNextSound(1000, 'd_key');
//        }).then(function() {
//            return playNextSound(1000, 's_key');
//        });
        
        
//        playNextNote(1000).then(function() { 
//            highlight('a_key');
//            return defer(1000);
//        }).then(function() {
//            highlight('s_key');
//        })
     
//        highlight('a_key');
//        setTimeout(function() { highlight('s_key') }, 1000);
//        setTimeout(function() { highlight('d_key') }, 2000);
//        setTimeout(dojo.hitch(this, function() { 
//            this.receiveKeyInput(true);
//            this.at_messages.innerHTML = "Copy the sequence!";
//        }), 3000);
        
        //oooor
        
//        var d = new dojo.Deferred();
//        
//        function callDef(time) {
//            d = new Deferred();
//            setTimeout(function() {
//                d.callback();
//            }, time);
//            return d;
//        }
//        
//        callDef(100).then(function() {
//            //do something
//            return callDef(121);
//        });//.then....
        
    },
    
    processSegment: function(key) {
    
        console.log("Seg index",this.segIndex);
    
        if(this.listeningForSegment) {
        
            console.log(key, " processed!");
            if(key == this.segments[this.segNum][this.segIndex]) {
                console.log("CORRECT!");
                this.segIndex += 1;
                
                if(this.segIndex == this.segments[this.segNum].length) {
                    console.log("Segment completed!!!!!!");
                    setTimeout(dojo.hitch(this, function() { this.playSound("sounds/win"); }), 500);
                    setTimeout(dojo.hitch(this, function() { this.sayText("Press the space bar to hear the next section"); }), 1000);
                    this.nextSegment();
                }
                
            } else {
                
                this.playSound("sounds/error");
                console.log("WRONG KEY!");
                
                //restart segment
                this.segIndex = 0;   
            }
        }
    },
    
    handleKeyDown: function(evt) {
    
        if(evt.keyCode == dojo.keys.SPACE) {
            this.startSegment();
            return;
        }
    
        var key = String.fromCharCode(evt.keyCode);
        console.log("KEY DOWN: ", key);
        
        if(this.listeningForSegment || this.practice) {
            
            if( dojo.some(this.key_list, function(item) { return item.keyName == key; }) ) {
            
                console.log(this.key_to_sound[key], key);
                this.playSound(this.key_to_sound[key]);
            
            }
            
        }
        
        //console.log(dojo.indexOf(this.key_list, key));
        if( dojo.some(this.key_list, function(item) { return item.keyName == key; }) ) {
            this.processSegment(key);
            this.colorKey(key);
        }
    },

    handleKeyUp: function(evt) {
        var key = String.fromCharCode(evt.keyCode);
        console.log("KEY UP: ", key);
        
        if( dojo.some(this.key_list, function(item) { return item.keyName == key; }) ) {
            this.uncolorKey(key);
        }
    },

    sayText: function(text) {

        if(this.soundEnabled) {    
            this.audio.say({'text':text});   
        } else {
            this.sayTextQueue.push(text);
        }

    },
    
    playDeferredSounds: function() {
        
        if(this.sayTextQueue.length > 1) {
            this.audio.say({'text':this.sayTextQueue.pop() });
            this.playDeferredSounds();
            //.then(dojo.hitch(this, function() { this.playDeferredSounds }));
        }
        else if(this.sayTextQueue.length > 0) {
            this.audio.say({'text':this.sayTextQueue.pop() });
        }
        
    },

    playSound: function(audioURL) {
        console.log("play sound?");
        if(this.soundEnabled) {
            this.audio.stop();
            this.audio.play({url : audioURL});
        }

    },
    
    colorKey: function(id) {
        dojo.addClass(id, 'pressed');
    },
    
    uncolorKey: function(id) {
        dojo.removeClass(id, 'pressed');
    }


});
