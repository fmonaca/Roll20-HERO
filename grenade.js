var comandoBlast = comandoBlast || {};
on('chat:message', function(msg) {    
    if(msg.type != 'api') return; // We're only deal with API commands

     var parti = msg.content.split(";");
     if(parti[0]!="!blast") return;
     comandoBlast = parti[1];
     var granata;
     var oBlaster;
      _.each(msg.selected, function(obj) {
        oBlaster = getObj("graphic", obj._id);
      });
      var granata = findObjs({
                    _type: "graphic",
                    _name: "throwing_target",
                    _pageid: Campaign().get("playerpageid"),
                });
    if(comandoBlast == "spegni")
    {
        granata[0].set({
                    'aura2_radius': 0,
                    'left': -280,
                    'top': -280,
                    'status_purple': false,
                    'status_pink': false,
                    'gmnotes': '',
                });
        ResetAllPins();
        return;
    }
    if(!oBlaster)
    {
        sendChat("Master", whisper + msg.who + " You have to select your token first!");
        return;
    }
    if(oBlaster.get("name") == "throwing_target")
    {
        var gmnotes = decodeURI(oBlaster.get('gmnotes'));
        if(gmnotes == "")
            return;
        var startPos = decodeURI(gmnotes).indexOf("{tokid}");
        var endPos = decodeURI(gmnotes).indexOf("{/tokid}");
        var charTokenID = decodeURI(gmnotes).substr(startPos+7, (endPos-startPos)-7);
        oBlaster = getObj("graphic", charTokenID);
    }
    if(checkTurn(oBlaster)) return;

    if (InitiativeCheck() == false)
    {
        sendChat("Master", whisper + oBlaster.get("name") + " You are not in combat.");
        return;
    }
    if(oBlaster.get("status_archery-target")) {sendChat("Master", whisper + oBlaster.get("name") + " You already acted this phase."); return;}
    var oThrower = getObj("character", oBlaster.get("represents"));
    var othrowerOCV = findObjs({name: "OCV",_type: "attribute", _characterid: oThrower.id}, {caseInsensitive: true})[0];
    throwerOCV = parseInt(othrowerOCV.get('current'));

    
    if(granata == "") return;
    var attMod = 0;
    var DCVMod = 0;

    var gmnotes = decodeURI(granata[0].get('gmnotes'));
    if(!gmnotes)
        return;
    var startPos = decodeURI(gmnotes).indexOf("{ocvmod}");
    if(startPos>=0)
    {
        var endPos = decodeURI(gmnotes).indexOf("{/ocvmod}");
        attMod = decodeURI(gmnotes).substr(startPos+8, (endPos-startPos)-8)
    }

    var oCombatHelper = findObjs({                              
        _pageid: Campaign().get("playerpageid"),                              
        _type: "graphic",
        _name: "combathelper",
     });
     if(oCombatHelper != undefined)
        DCVMod = parseInt(oCombatHelper[0].get("bar3_value"));
      else
        sendChat("Script", "/w GM Copy the combathelper token into this page!");
    var distance = calcDistanceBetweenTokens(oBlaster, granata[0]);
    var rangeMod = 0;
    // Compute malus depending on distance between tokens
     for(var r=0; r<distanceMod.length;r++){
         rangeMod = r;
         if(distance<=distanceMod[r]) break;
     }
    var attOCVMod = 0;
    attOCVMod = parseInt(checkMods(oBlaster, "ocv")); // Check for any special OCV modifier for attacker

    var targetRoll = 8 + parseInt(throwerOCV) + parseInt(attOCVMod) + parseInt(attMod) - rangeMod - DCVMod;

    var toHitRoll = randomInteger(6) + randomInteger(6) + randomInteger(6);

    var success = toHitRoll - targetRoll; // If negative or 0 is a hit

    if(success > 0) // Miss
    {
        var currentPage = getObj("page", Campaign().get("playerpageid"));
        var maxError = parseInt(distance/2);
        var scale = currentPage.get("scale_number");
        if(success > maxError) success = maxError;
        sendChat("GM", whisper + oBlaster.get("name") + " Your attack is off mark by " + success + "m!");
        var randomAngle = randomInteger(360) * 0.0174532925;
        var targetLeft = granata[0].get('left');
        var targetTop = granata[0].get('top');
        var actualLeft = targetLeft + (success * 70 * Math.cos(randomAngle))/scale;
        var actualTop = targetTop + (success * 70 * Math.sin(randomAngle))/scale;
        var Pins = findObjs({
            _pageid: Campaign().get("playerpageid"),                              
            _type: "graphic",
            name: "XPin",
        });
        if(!Pins) return;
        Pins[0].set({
            'left': targetLeft,
            'top': targetTop,
        });
        granata[0].set({
            'left': actualLeft,
            'top': actualTop,
        });
    }
    else // HIT
    {
        sendChat("GM", whisper + oBlaster.get("name") + " Your attack hits the mark!");
    }

 
    if(granata != "")
    {
         
        if(granata[0].get("left") == -280 && granata[0].get("top") == -280)
        {
            sendChat("Master", whisper + oBlaster.get("name") + " You didn't throw any grenade yet!");
            return;
        }

        granata[0].set("controlledby", MasterID);
        oBlaster.set("status_archery-target", true);
        var gmnotes = decodeURI(granata[0].get('gmnotes'));
        if(!gmnotes)
            return;
        var startPos = decodeURI(gmnotes).indexOf("{grenade}");
        var endPos = decodeURI(gmnotes).indexOf("{/grenade}");
       
        var grenadeString = decodeURI(gmnotes).substr(startPos, (endPos-startPos)+10)
        var gSpecs = grenadeString.split("/");
        var dadi = gSpecs[1];
        var tipo = gSpecs[3];
        var totaleRaggio = (dadi*2);   
        var blastReport = "/direct Blast damage:<br>";
        var totalBodyBlast = 0;
        var totalStunBlast = 0;
        if(tipo=="k")
        {
            totaleRaggio = (dadi * 6);

            for(var n=0;n<dadi;n++)
            {
                totalBodyBlast += randomInteger(6);
            }
            totalStunBlast = totalBodyBlast*3;
            for(var n=0;n<=totaleRaggio;n++)
            {
                blastReport += n + "< <b>" + totalBodyBlast + " BODY, " + totalStunBlast + " Stun</b> >" + (n+2) + "<br>";
                n+=1;
                totalBodyBlast -= 2;
                totalStunBlast -= 6;
                if(totalStunBlast<0) totalStunBlast = 0;
                if(totalBodyBlast<0) totalBodyBlast = 0;
                if(totalStunBlast==0 && totalBodyBlast==0)
                {
                    break;
                }
            }
        } else
        {
            var diceRolled = new Array();
            for(var n = 0; n<dadi; n ++){
              diceRolled[n] = new Array(2);
              temp = randomInteger(6);
              totalBodyBlast += parseInt(herodieBody[temp]);
              totalStunBlast += temp;
              diceRolled[n][0] = parseInt(herodieBody[temp]);
              diceRolled[n][1] = temp;
            }
            diceRolled = diceRolled.sort(function(a,b) { // sorts by BODY, descending
                if (a[0] < b[0]) return  1;
                if (a[0] > b[0]) return -1;
                return 0;
            });
            var dicecounter = 0;
            for(var n=0;n<totaleRaggio;n++)
            {
                blastReport += n + "< <b>" + totalBodyBlast + " BODY, " + totalStunBlast + " Stun</b> >" + (n+2) + "<br>";
                n+=1;
                totalBodyBlast -= diceRolled[dicecounter][0];
                totalStunBlast -= diceRolled[dicecounter][1];
                dicecounter ++;

            }
        }
        sendChat("Blast", blastReport);
        granata[0].set("gmnotes", "");
    
    }

        jrl_initiative_timer = setInterval(function() {

               


                var raggio = granata[0].get('aura2_radius');
                if(raggio=="") raggio = 0;
                else raggio = parseInt(raggio);
                if (raggio >= n) raggio = 0;
                if (raggio<n) raggio+=2;
                if (raggio>0 && comandoBlast == "on")
                {
                    granata[0].set({
                        'aura2_radius': raggio,
                        'aura2_color': '#DD0000',
                        'aura2_square': false
                    });
                }
    /*
                 else {
                    granata.set({
                        'aura2_radius': 0
                    });
                }
                */
    
            
    }, 1500);


});