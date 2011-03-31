{
    //games name
    "name": "test game",
    
    "keys": {
        'A' : '../sounds/daftsounds/workit',
        'S' : '../sounds/daftsounds/doit',
        'D' : '../sounds/daftsounds/makeit',
        'F' : '../sounds/daftsounds/makesus',
        
        'J' : '../sounds/daftsounds/stronger',
        'K' : '../sounds/daftsounds/faster',
        'L' : '../sounds/daftsounds/better',
        ';' : '../sounds/daftsounds/harder'
    },
    
    //array of segments
    "segments": [
        {type:'audioBlock', url:'../sounds/daftsounds/intro'},
        {type:'keyBlock', segment:['A', 'D', 'S', 'F'], pause:730},
        {type:'audioBlock', url:'../sounds/daftsounds/vamp1', pause:0},
        {type:'keyBlock', segment:[';', 'L', 'K', 'J'], pause:730},
        {type:'audioBlock', url:'../sounds/daftsounds/vamp1', pause:0},
        {type:'keyBlock', segment:['A', 'D', 'S', 'F', ';', 'L', 'K', 'J'], pause:300}
    ]
}
