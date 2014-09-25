on('chat:message', function(msg) {    
    if(msg.type != 'api') return; // We're only deal with API commands
        //var parts = msg.content.toLowerCase().split(' ');
        var parts = msg.content.split(';');
        var command = parts.shift();
    
        if(command == '!recovery')
        {
        //var page = getObj('page', Campaign().get('playerpageid'));
            var selected = msg.selected;
            _.each(selected, function(obj) {
                if(obj._type != 'graphic') return; // only damage graphics
                var tok = getObj("graphic", obj._id);
                if(tok.get('subtype') != 'token') return; // don't try to damage cards
                var oCharacter = getObj("character", tok.get("represents"));
                if (oCharacter != undefined ) {
                var oHealth = findObjs({name: "REC",_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0]; }
                if (oHealth != undefined ) {
                   var rec = parseInt(oHealth.get('current'));
                }
                var curEnd = parseInt(tok.get('bar2_value'));
                var curStun = parseInt(tok.get('bar1_value'));
                var maxEnd = parseInt(tok.get('bar2_max'));
                var maxStun = parseInt(tok.get('bar1_max'));
                if(curEnd + rec > maxEnd){
                    tok.set('bar2_value', maxEnd);
                }else{
                    tok.set('bar2_value', (curEnd + rec));
                }
                if(curStun + rec > maxStun){
                    tok.set('bar1_value', maxStun);
                }else{
                    tok.set('bar1_value', (curStun + rec));
                }
                tok.set("status_sleepy", false);
                if(curStun + rec > 0)
                    tok.set("status_pummeled", false);
                if(parts.shift()=="")
                    tok.set("status_archery-target", true);
            });
        }

        else if (command == "!inserteffect")
        {
            var stringa = parts.shift();
            stringa = "{effect}"+stringa+"{/effect}";
            var selected = msg.selected;
            _.each(selected, function(obj) {
                if(obj._type != 'graphic') return;
                var oToken = getObj("graphic", obj._id);
                insertEffect(oToken, stringa, "", "");
            });
        }

        else if (command == "!updateeffect")
        {
            var index = parts.shift();
            var action = parts.shift();
            var selected = msg.selected;
            _.each(selected, function(obj) {
                if(obj._type != 'graphic') return;
                var oToken = getObj("graphic", obj._id);
                if(aChars.length>0)
                {
                    for(var n=0;n<aChars.length;n++)
                    {
                        if(aChars[n][0]==oToken[0].id) // Found token within aChars array
                        {
                            updateEffect(n, index, action, "/w gm Effect updated.");
                            break;
                        }
                    }
                }
                else
                {
                    updateEffect(oToken, index, action, "/w gm Effect updated.");
                }
            });
        }

});

