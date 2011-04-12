dojo.provide('game.KeyMash');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('game.ProfileEditor');

dojo.declare('game.KeyMash', [ dijit._Widget, dijit._Templated ], {
    templatePath: dojo.moduleUrl('game', 'KeyMash.html'),
    widgetsInTemplate: true,
    
    sayTextQueue: [], //queue used for keeping text to say until the audio instance arrives
    
    audio: {},
    soundEnabled: false,
    
    keyDownHandle: {},
    keyUpHandle: {},
    
    game: {},
	
	numErrors: 0,
    segNum: 0,
    segIndex: 0,
    currentSegment: null,
    
    keysOn: false,
    practice: false,
    listeningForSegment: false,
    
    postCreate: function() {
        this.inherited(arguments);
        
        //get test game data
        var def = dojo.xhrGet({
            url:"protoSchema.json",
            handleAs:"json",
            load: dojo.hitch(this, function(data) {
                this.game = data;
            }),
            error: function(err) {
                console.log(err);
            }
        }).then(dojo.hitch(this, uow.getAudio().then(dojo.hitch(this, function(a) {
            this.audio = a;
            this.soundEnabled = true;
            this.playDeferredSounds();
            
            //do rest of startup
            for(prop in this.game.keys) {
                console.log(prop, this.game.keys[prop]);
            }
            
            //register key events
            dojo.subscribe('/uow/key/down/initial', dojo.hitch(this, this.handleKeyDown));
            
            //this.connect(null, 'onkeydown', this.handleKeyDown);
            this.connect(null, 'onkeyup', this.handleKeyUp);
            
            this.setupKeys();
            
            this.startGame();
            console.log("all done");
        }))));
    
    },
    
    setupKeys: function() {
        
        this.profile = new game.ProfileEditor({'keysUsed':this.game.keys});
        dojo.place(this.profile.domNode, this.at_keys);
        
//        for(key in this.game.keys) {
//            
//            var keyblock = dojo.create('span', {
//                id:key, 
//                innerHTML:key
//            });
//            dojo.addClass(keyblock, 'keyblock');
//            
//            dojo.place(keyblock, this.at_keys);
//            
//        }
        
    },
    
    startGame: function() {

        //you can now start messing with the keys
        this.keysOn = true;
        
        //display the standard start messages
        this.at_messages.innerHTML = "Practice by pressing the keys to hear the sounds they make. <br> Press the space bar to continue...";
        this.sayText("Practice by pressing the keys to hear the sounds they make, then press the space bar when you are ready to continue");
        
        //listen once
        var handle = dojo.connect(this, 'spaceKey', this, function() {
            //first segment stuff
            this.keysOn = false;
            
            this.sayText("Start listening when you hear this sound,").callAfter(
                dojo.hitch(this, function() {
                    this.playSound("../sounds/ding1").callAfter(
                        dojo.hitch(this, function() {
                            this.sayText("And then start repeating the segment when you hear this sound,").callAfter(
                                dojo.hitch(this, function() {
                                    this.playSound("../sounds/ding2").callAfter(
                                        dojo.hitch(this, function() {
                                            this.sayText("Now you are all set to go! Enjoy the game!");
                                        })
                                    );
                                    setTimeout(dojo.hitch(this, function() {
                                        this.nextSegment();
                                    }), 5000);
                                })
                            );
                        })
                    );
                })
            );
        
            //this.nextSegment();
            dojo.disconnect(handle);
        });
    },
    
    nextSegment: function() {
    
        console.log("next segment");
        this.currentSegment = this.game.segments[this.segNum];
        
        if(this.currentSegment.type == "keyBlock") {
            this.at_messages.innerHTML = "Listen to the sequence of sounds, then try to repeat them!";
            this.playSound("../sounds/ding1").callAfter(
                dojo.hitch(this, function() {
                
                    this.keysOn = false;
                    setTimeout(dojo.hitch(this, this.playSegment), 750);
                    
                })
            );
        } 
        else if(this.currentSegment.type == "audioBlock") {
            
            this.keysOn = false;
            this.playSound(this.currentSegment.url).callAfter(
                dojo.hitch(this, function() {
                
                    this.keysOn = false;
                    setTimeout(dojo.hitch(this, this.nextSegment), 0);
                })
            );
            
        }
        
        this.segNum++;
    
    },
    
    listenSegment: function() {
        console.log("listen segment");
        this.segIndex = 0;
        this.listeningForSegment = true;
        this.keysOn = true;
        
        this.at_messages.innerHTML = "Try to replicate the segment!";
        this.playSound("../sounds/ding2");
    },
    
    playSegment: function() {
        
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
            var index = args.index;
            var key_to_sound = this.game.keys;
            console.log(time, list, index);
            
            highlight(list[index]);
            this.playSound(key_to_sound[list[index]]).callAfter(dojo.hitch(this, function() {
            
                setTimeout(dojo.hitch(this, function() {
                    d.callback({time:time, list:list, index:++index});
                }), time);
            
            }));
            
            if(index < list.length - 1) {
                console.log("play next sound");
                dojo.when(d, playNextSound);
            } else {
                //listening(true);
                dojo.when(d, dojo.hitch(this, function() { 
                    this.listenSegment(); 
                }));
            }
        });

        console.log("PLAY SEGMENT!");
        playNextSound({time:this.currentSegment.pause, 'list':this.currentSegment.segment, index:0});
    
        
    },
    
    processSegment: function(key) {
    
        if(this.listeningForSegment) {
        
            console.log(key, " processed!");
            if(key == this.currentSegment.segment[this.segIndex]) {
                console.log("CORRECT!");
                this.segIndex += 1;
                
                if(this.segIndex == this.currentSegment.segment.length) {
                    console.log("Segment completed!!!!!!");
                    //setTimeout(dojo.hitch(this, function() { this.playSound("../sounds/win"); }), 500);
                    //setTimeout(dojo.hitch(this, function() { this.sayText("Press the space bar to hear the next section"); }), 1000);
                    setTimeout(dojo.hitch(this, function() { this.nextSegment(); }), 1000);
                }
                
            } else {
                
				this.numErrors++;
				
				if(numErrors < 3) {
					//wait a few seconds, then tell them to keep trying!
					
					this.waitSay("Try to find the next key!", 3000);
					
				} else if(numErrors < 5) {
					//play the note for them
					
					this.waitSay("This is what the next key sounds like, try to find it!", 3000);
					this.waitPlay(this.keys[this.segIndex], 4000);
					
				} else {
					//start the segment over again
				}
				
                this.playSound("../sounds/error");
                console.log("WRONG KEY!");
                
                //restart segment
                this.segIndex = 0;   
            }
        }
    },
    
    handleKeyDown: function(evt) {
    
        if(evt.keyCode == dojo.keys.SPACE) {
            this.spaceKey();
        }
    
        var key = String.fromCharCode(evt.keyCode);
        if(evt.keyCode == 186) { //semi colon
            key = ';';
        }
        console.log("KEY DOWN: ", key);
        
        if(this.keysOn) {
            
            if( key in this.game.keys ) {
            
                console.log(this.game.keys[key], key);
                this.playSound(this.game.keys[key]);
                this.colorKey(key);
                
                if(this.listeningForSegment) { 
                    this.processSegment(key);
                }
            }
            
        }
        
    },

    handleKeyUp: function(evt) {
        var key = String.fromCharCode(evt.keyCode);
//        console.log("KEY UP: ", key);
        if(evt.keyCode == 186) { //semi colon
            key = ';';
        }
        
        if (this.keysOn) {
			
			if (key in this.game.keys) {
				this.uncolorKey(key);
			}
			
		}
    },
    
    spaceKey: function() {
        console.log("Space key fired!");
    },

    //returns the JSonicDeferred
    sayText: function(text) {

        if(this.soundEnabled) {    
            this.audio.stop();
            return this.audio.say({'text':text});   
        } else {
            this.sayTextQueue.push(text);
        }

    },
	
	//Wait say delays for 'wait' miliseconds, then says the specified text UNLESS there is an interruption
	waitSay: function(text, wait) {
		
		if(this.soundEnabled) {
			
			this.waitSay_waiting = true;
			
			var handle = dojo.subscribe('/uow/key/down/initial', dojo.hitch(this, function() {
				this.waitSay_waiting = false;
			}));
			
			setTimeout(dojo.hitch(this, function() {
				if(this.waitSay_waiting) {
					this.sayText(text);
				}
				dojo.unsubscribe(handle);
			}), wait);
			
		}
		
	},
	
	//Wait play delays for 'wait' milis, then plays the specified sound UNLESS there is an interruption 
	waitPlay: function(soundURL, wait) {
		
		if(this.soundEnabled) {
			
			this.waitPlay_waiting = true;
			
			var handle = dojo.subscribe('/uow/key/down/initial', dojo.hitch(this, function() {
				this.waitPlay_waiting = false;
			}));
			
			setTimeout(dojo.hitch(this, function() {
				if(this.waitPlay_waiting) {
					this.sayText(text);
				}
				dojo.unsubscribe(handle);
			}), wait);
			
		}
	},
    
    playDeferredSounds: function() {
        
        if(this.sayTextQueue.length > 1) {
            this.audio.say({'text':this.sayTextQueue.pop() });
            this.playDeferredSounds();
            //.then(dojo.hitch(this, function() { this.playDeferredSounds }));
        }
        else if(this.sayTextQueue.length > 0) {
            return this.audio.say({'text':this.sayTextQueue.pop() });
        }
        
    },

    playSound: function(audioURL) {
        console.log("play sound?");
        
        if(this.soundEnabled) {
            this.audio.stop();
            return this.audio.play({url : audioURL});
        }
    },
    
    colorKey: function(id) {
        //dojo.addClass(id, 'pressed');
        this.profile.selectKey(id);
    },
    
    uncolorKey: function(id) {
        //dojo.removeClass(id, 'pressed');
        this.profile.selectKey(id);
    }


});
