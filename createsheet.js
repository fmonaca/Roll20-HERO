on('chat:message', function(msg) {
    if(msg.type == 'api' && msg.content.indexOf('!newsheet ') != -1)
    {
        var name = msg.content.substring(10);
        var ocharacter = findObjs({                              
            _type: "character",
            _name: name,
        });
        if(ocharacter.length==0)
        {
            var character = createObj('character', {
                name: name,
                bio: '',    
                gmnotes: '',    
                archived: false,    
                inplayerjournals: '',
                controlledby: msg.playerid
            });
        }
        else
        {
            var character = ocharacter[0];
            createObj('attribute', {
                name: 'STR',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'DEX',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'CON',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'INT',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'EGO',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'PRE',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'OCV',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'DCV',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'OMCV',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'DMCV',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'SPD',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'PD',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'ED',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'rPD',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'rED',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'REC',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'END',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'BODY',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'STUN',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'RUN',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'SWIM',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'Leap',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'tempOCV',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'tempDCV',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'tempRange',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'powerdef',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'mentaldef',
                _characterid: character.id
            });
            createObj('attribute', {
                name: 'flashdef',
                _characterid: character.id
            });
        }
    };
});