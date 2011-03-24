{
    //games name
    "name": "test game",
    
    "keys": {
        'A' : '../sounds/A2',
        'S' : '../sounds/B2',
        'D' : '../sounds/C3',
        'F' : '../sounds/D3'
    },
    
    //array of segments
    "segments": [
        {type:'keyBlock', segment:['A', 'S', 'D', 'F']},
        {type:'audioBlock', url:'../sounds/synbass'},
        {type:'keyBlock', segment:['S', 'D', 'F', 'A']}
    ]
}
