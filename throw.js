var aThrowingDistance = new Array();
aThrowingDistance = [[0,0,0],[2,1,0.5],[3,1.5,0.75],[4,2,1],[6,3,1.5],[8,4,2],[10,5,2.5],[11,5.5,2.75],[12,6,3],[14,7,3.5],[16,8,4],[18,9,4.5],[19,9.5,4.75],[20,10,5],[22,11,5.5],[24,12,6],[26,13,6.5],[27,13.5,6.75],[28,14,7],[30,15,7.5],[32,16,8],[33,16.5,8.5],[34,17,8.5],[36,18,9],[38,18.5,9.5],[39,19,9.5],[40,20,10],[41,21,10],[43,21,10.5],[44,22,11],[46,23,11]]; // Runing, Standing, Prone
var maxTrhowingDist = 0;
function calcDistanceBetweenTokens(token1, token2)
{

    if (typeof token1 == "object")
    {
        var x1 = token1.get('left');
        var y1 = token1.get('top');
    }
    else if (typeof token1 == "string")
    {
        var aCoords = token1.split(",");
        var x1 = aCoords[0];
        var y1 = aCoords[1];
    }
    if (typeof token2 == "object")
    {
        var x2 = token2.get('left');
        var y2 = token2.get('top');
    }
    else if (typeof token2 == "string")
    {
        var aCoords = token2.split(",");
        var x2 = aCoords[0];
        var y2 = aCoords[1];
    }
    var gridscale = 1.5;
    var yDif = Math.abs(y1/70 - y2/70);
    var xDif = Math.abs(x1/70 - x2/70);
    var distance1 = Math.round((Math.sqrt((xDif)*(xDif) + (yDif)*(yDif)))*1000)/1000;
    return distance1*gridscale;
    
}
on('chat:message', function(msg) {
    var tCommand = msg.content.toLowerCase();
    if(msg.type == "api" && msg.content.indexOf("!throw") !== -1) {
        var tStringa = msg.content.replace("!throw ", "");
        var tStringa = tStringa.split(";");
        var numOptions = tStringa.length;
        var throwerName = tStringa[0];
        //log("name "+throwerName);

        var tPosition = tStringa[1];
        var tGrenadeType = tStringa[2];
        var tOCVMod = tStringa[3];
        var tIndex = 1;
        if(tPosition == "r") tIndex = 0;
        if(tPosition == "p") tIndex = 2;
        var tSelected = msg.selected;
        var thrower = findObjs({
                    _type: "graphic",
                    _name: throwerName,
                    _pageid: Campaign().get("playerpageid"),
                });
        
        if (InitiativeCheck() == false)
            {
                sendChat("Master", whisper + thrower[0].get("name") + " You are not in combat.");
                return;
            }
      
        if(checkTurn(thrower)) return;


        if(thrower[0].get("status_sleepy") || thrower[0].get("status_pummeled")) {sendChat("Master", whisper + thrower[0].get("name") + " You are stunned."); return;}
        if(thrower[0].get("status_dead")) {sendChat("Master", whisper + thrower[0].get("name") + " You cannot act."); return;}
        if(thrower[0].get("status_archery-target")) {sendChat("Master", whisper + thrower[0].get("name") + " You already acted this phase."); return;}

        var gmnotes = decodeURI(thrower[0].get('gmnotes'));
        if(!gmnotes)
            return;
        var startPos = decodeURI(gmnotes).indexOf("{" + tGrenadeType + "}");
        if(startPos < 0){
            sendChat("throw script","/w GM no grenade found named " + tGrenadeType + " in " + thrower[0].get("name") + "'s gmnotes!");
            return;
        }

        var endPos = decodeURI(gmnotes).indexOf("{/" + tGrenadeType + "}");
        var gtrail = tGrenadeType.length+3;
        var grenadeString = decodeURI(gmnotes).substr(startPos, (endPos-startPos)+gtrail)
        //log(grenadeString);
        var gSpecs = grenadeString.split("/");
        var gSpecsBlast = gSpecs.slice(0);
        gSpecsBlast.shift();
        gSpecsBlast.pop();
        gSpecsBlast.pop();
        gSpecsBlast.unshift("{grenade}");
        gSpecsBlast.push("{");
        gSpecsBlast.push("grenade}");
        var dadi = gSpecs[1];
        var danno = gSpecs[2];
        var tipo = gSpecs[3];
        var qt = gSpecs[4];

        if(qt==0)
        {
          sendChat("Master", whisper + msg.who + " You don't have any more grenades of that type!");
          return;
        }
        qt -= 1;
        gSpecs[4] = qt;
        var newGrenade = "";
        var newGrenadeBlast = "";
        for(var gp=0; gp<gSpecs.length;gp++){
            newGrenade += gSpecs[gp] + "/";
            newGrenadeBlast += gSpecsBlast[gp] + "/";
        }
        newGrenade = newGrenade.substring(0,newGrenade.length-1);
        newGrenadeBlast = newGrenadeBlast.substring(0,newGrenadeBlast.length-1);
        gmnotes = gmnotes.replace(grenadeString, newGrenade);
        thrower[0].set('gmnotes', gmnotes);
                //var tToken = getObj("graphic", thrower._id);
                var tCharacter = getObj('character', thrower[0].get('represents'));
                var tCleft = parseFloat(thrower[0].get("left"));
                var tCtop = parseFloat(thrower[0].get("top"));
                tCleft += 35;
                tCtop += 35;

                if (tCharacter != undefined ) { 
                   
                    var oSTR = findObjs({name: "STR", _type: "attribute", _characterid: tCharacter.id}, {caseInsensitive: true})[0];
                    if (oSTR != undefined ){var curSTR = parseInt(oSTR.get('current'));}
                    curSTR += 19;
                }
        var oGZ = findObjs({
                    _type: "graphic",
                    _name: "throwing_target",
                    _pageid: Campaign().get("playerpageid"),
                });
        if(oGZ != "")
        {
            maxThrowingDist = aThrowingDistance[curSTR][tIndex];
            //log("maxThrowingDist: "+maxThrowingDist);

            if(maxThrowingDist>9)
            {
                var tens = maxThrowingDist.toString().substr(0,1);
                var ones = maxThrowingDist.toString().substr(1);
                oGZ[0].set("status_purple", parseInt(ones));
                oGZ[0].set("status_pink", parseInt(tens));
            }
            else
            {
                oGZ[0].set("status_purple", parseInt(Math.round(maxThrowingDist)));
            }
            oGZ[0].set("left", tCleft);
            oGZ[0].set("top", tCtop);
            var controllers = oGZ[0].get("controlledby");
            controllers += "," + thrower[0].id;
            oGZ[0].set("controlledby", controllers);
            gmnotes = newGrenadeBlast;
            gmnotes += "<br>{coords}"+thrower[0].get("left")+"|"+thrower[0].get("top")+"{/coords}";
            gmnotes += "<br>{toknam}"+thrower[0].get("name")+"{/toknam}";
            gmnotes += "<br>{tokid}"+thrower[0].id+"{/tokid}";
            gmnotes += "<br>{ocvmod}"+tOCVMod+"{/ocvmod}";
            oGZ[0].set('gmnotes', gmnotes);
        }
        else
        {
            sendChat("Throwing Script", "/w GM Please copy the 'throwing_target' token into this page first!");
            return;
        }
        /*
        var gmnotes = decodeURI(oGZ[0].get('gmnotes'));
        var startPos = decodeURI(gmnotes).indexOf("{coords}");
        var endPos = decodeURI(gmnotes).indexOf("{/coords}");
        var trail = gmnotes.length+3;
        var coordString = decodeURI(gmnotes).substr(startPos, (endPos-startPos)+trail);
        log(coordString);
        */
        
    }

});
    