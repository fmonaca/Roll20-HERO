/*
USAGE:

Select tokens and

!combatstart    Initiate combat
!nextphase      Advance to next phase in which at least one of the tokens in combat acts
!combatend      End combat
!combatadd      Add token(s) into combat
!combatremove   Remove token(s) from combat

*/

var iii = 1;
//var iTurn = iTurn || {};
//var whisper = "/w ";
var whisper = "";
var iTurn;
var combatBegun = combatBegun || {};
var aChars = new Array();
var aSPDchart = new Array();
var aBleedingTable = new Array();
var tempTurnOrder = new Array();
var needle;
var Pins;
var pinExists;
var MasterID = "-J5R2trPC6jWXlClBuAL";
aSPDchart = ['','12','6,12','4,8,12','3,6,9,12','3,5,8,10,12','2,4,6,8,10,12','2,4,6,7,9,11,12','2,3,5,6,8,9,11,12','2,3,4,6,7,8,10,11,12','2,3,4,5,6,8,9,10,11,12','2,3,4,5,6,7,8,9,10,11,12','1,2,3,4,5,6,7,8,9,10,11,12'];
aBleedingTable = [[],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[2,2,5],[2,2,5],[2,2,5],[2,2,5],[2,2,5],[3,3,9],[3,3,9],[3,3,9],[3,3,9],[3,3,9],[4,4,13],[4,4,13],[4,4,13],[4,4,13],[4,4,13],[5,5,17],[5,5,17],[5,5,17],[5,5,17],[5,5,17],[6,6,21],[6,6,21],[6,6,21],[6,6,21],[6,6,21],[6,6,21],[6,6,21],[6,6,21],[6,6,21],[6,6,21]];

(function() { // Workaround for newly created object bug by Shu Zong C.
    var oldCreateObj = createObj;
    createObj = function() {
        var obj = oldCreateObj.apply(this, arguments);
        if (obj && !obj.fbpath) {
            obj.fbpath = obj.changed._fbpath.replace(/([^\/]*\/){4}/, "/");
        }
        return obj;
    }
}())

function addTokens()
{
    if(Campaign().get("turnorder") == "")
        {
            turnorder = [];
        } else turnorder = JSON.parse(Campaign().get("turnorder"));
    var phase = iii;
    var delayedChars = new Array();
    tempTurnOrder = turnorder;
    turnorder.length = 0;
    needle = "";
    var currSPD = 0;
    for(var a=0;a<tempTurnOrder.length;a++) // Check for any delayed phase characters
    {
        if(tempTurnOrder[a].pr == "d" || tempTurnOrder[a].pr == "D")
        {
            delayedChars[delayedChars.length] = tempTurnOrder[a].id;
        }
    }
    
    Campaign().set("turnorder", JSON.stringify(turnorder));
    if(phase<3) {needle = phase+",";} else {needle = phase;}
    turnorder.push({
            id: "-1",
            pr: " ",
            custom: "TURN " + iTurn + " - Phase " + phase
        });
    for(var a = 0;a < delayedChars.length;a++)
    {
        turnorder.push({
            id: delayedChars[a],
            pr: "D",
            custom: ""
        });
    }
    for (var a = 0; a < aChars.length; a++) { // cycles through the characters to see if they act during this phase
        currSPD = aChars[a][1];
        var phases = aSPDchart[currSPD];
        var pos = phases.indexOf(needle);
        if(pos>-1)
        {
            turnorder.push({
                    id: aChars[a][0],
                    pr: aChars[a][2],
                    custom: ""
                });
        }
    }
    
    Campaign().set("turnorder", JSON.stringify(turnorder));
    delayedChars.length = 0;
}

function removeToken(IDsString, tokensArray)
{
    var newChars = new Array();
    for (var a = 0; a < aChars.length; a++) {
        if(IDsString.indexOf(aChars[a][0])==-1)
            newChars.push(aChars[a]);
    }
    aChars.length = 0;
    aChars = newChars;
    updateAttackers(tokensArray);
}

function nextPhase(phase){
    if(aChars.length>0){
        var header = true;
        needle = "";
        var currSPD = 0;
        var delayedChars = new Array();
        tempTurnOrder = JSON.parse(Campaign().get("turnorder"));
        pinExists = checkPin();
        if(pinExists)
            ResetAllPins();
        turnorder.length = 0;
        Campaign().set("turnorder", JSON.stringify(turnorder));
        for(var a=0;a<tempTurnOrder.length;a++) // Check for any delayed phase characters
        {
            if(tempTurnOrder[a].pr == "d" || tempTurnOrder[a].pr == "D")
            {
                delayedChars[delayedChars.length] = tempTurnOrder[a].id;
            }
        }
        do{
        if(phase<3) {needle = phase+",";} else {needle = phase;}

        for (var a = 0; a < aChars.length; a++) { // cycles through the characters to see if they act during this phase
            currSPD = aChars[a][1];
            var phases = aSPDchart[currSPD];
            var pos = phases.indexOf(needle);

            checkEffect(aChars, a);
            
            if(pos>-1)
            {
                
                if(header){
                    sendChat("GM", "/desc Phase " + phase + " begins!");
                    turnorder.push({
                        id: "-1",
                        pr: " ",
                        custom: "TURN " + iTurn + " - Phase " + phase
                    });
                    header = false;
                }
                
                turnorder.push({
                    id: aChars[a][0],
                    pr: aChars[a][2],
                    custom: ""
                });
                // black flag check
                var currObj = getObj("graphic", aChars[a][0]);
                if(currObj.get("status_black-flag"))
                {
                    currObj.set("status_black-flag", false);
                    currObj.set("status_archery-target", true);
                }
                else
                    currObj.set("status_archery-target", false);
            }
            var currentPageGraphics = findObjs({                              
              _pageid: Campaign().get("playerpageid"),                              
              _type: "graphic",
              _id: aChars[a][0],                         
            });
                _.each(currentPageGraphics, function(obj) {    
                    aChars[a][3] = obj.get('left')+","+obj.get('top');
                    obj.set("status_interdiction", false);
                    
                    var blockStatus = parseInt(obj.get("status_bolt-shield")); // decrease block phases count
                    if(blockStatus>0)
                    {
                        blockStatus -= 1;
                        if(blockStatus == 0) // block expires
                        {
                            obj.set("status_bolt-shield", false);
                            var otempChar = getObj("character", obj.get("represents"));
                            var oTempAttr = findObjs({name: "tempOCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
                            oTempAttr.set("current", 0);
                            oTempAttr = findObjs({name: "tempDCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
                            oTempAttr.set("current", 0);
                        }
                        else
                            obj.set("status_bolt-shield", blockStatus);
                    }
                    var dodgeStatus = parseInt(obj.get("status_ninja-mask")); // decrease dodge phases count
                    if(dodgeStatus>0)
                    {
                        dodgeStatus -= 1;
                        if(dodgeStatus == 0) // block expires
                        {
                            obj.set("status_ninja-mask", false);
                            var otempChar = getObj("character", obj.get("represents"));
                            var oTempAttr = findObjs({name: "tempDCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
                            oTempAttr.set("current", 0);
                        }
                        else
                            obj.set("status_ninja-mask", dodgeStatus);
                    }

                    
                    if(!obj.get("status_bolt-shield") && !obj.get("status_ninja-mask"))
                    {
                        obj.set("status_archery-target", false);
                    }
                    
                    
                });
            //var CurrentToken = findObjs({_type: 'graphic', _id: aChars[a][0]});
            //log(CurrentToken.content);
            //aChars[a][3] = CurrentToken.get('left')+","+CurrentToken.get('left');
        }
        
        if(header){
            phase++;
            if(phase>12) {phase=1; sendChat("GM", "/desc Recovery time!"); recoveryAll(aChars);} //
            if(phase==1) {iTurn++; sendChat("GM", "/desc New Turn!");}
            iii = phase;
        }
        } while (header)
        var sTurnorder = JSON.stringify(turnorder);
        var tempHeader = turnorder.shift();
        for(var a = 0;a < delayedChars.length;a++)
        {
            if(sTurnorder.indexOf(delayedChars[a]) == -1) // Delayed Character not found in current phase, add to turnorder
            {
                turnorder.unshift({
                    id: delayedChars[a],
                    pr: "d",
                    custom: ""
                });
            }
        }
        delayedChars.length = 0;
        turnorder.unshift(tempHeader); // Put header back into place
        Campaign().set("turnorder", JSON.stringify(turnorder));
        }

    //tempTurnOrder = turnorder;
}

function InitiativeCheck() {
    var c = Campaign();
    var turn_order = JSON.parse(c.get('turnorder'));
    
    if (!turn_order.length) {
        return false;
    }
};

function SetPin(PinName, origPos) {
    Pins[0].set({
        'left': origPos[0],
        'top': origPos[1],
    });
};

function checkPin(){
    Pins = findObjs({
        _pageid: Campaign().get("playerpageid"),                              
        _type: "graphic",
        name: "XPin",
    });
    if(Pins=="")
        return false;
    else
        return true;
}

function createPin(){
    
    var newPin = createObj("graphic", {
            name: "XPin",
            imgsrc: "https://s3.amazonaws.com/files.d20.io/images/2569788/3wMeuzlwq_yLodLGffZXJg/thumb.gif?13878626195",
            width: 35,
            height: 55,
            left: -280,
            top: -280,
            pageid: Campaign().get("playerpageid"),
            layer: "objects"
        });
        /*
        newPin.set({ // BUG! Cannot change any property of a newly created effect without crashing the sandbox.
            'left': -280,
            'top': -280,
        });
        */
    sendChat("Script", "/w GM Created XPin graphic object.");
}

function ResetAllPins() {
        Pins[0].set({
            'left': -280,
            'top': -280,
        });
};

function checkCombatHelper()
{
    var oCH = findObjs({                              
      _pageid: Campaign().get("playerpageid"),                              
      _type: "graphic",
      _name: "combathelper",
   });
   if(oCH == ""){
        
        var newCH = createObj("graphic", {
            name: "combathelper",
            imgsrc: "https://s3.amazonaws.com/files.d20.io/images/2569806/MsxVaPSeqEgDPQ10agmERw/thumb.jpg?138786296055",
            width: 140,
            height: 65,
            left: 300,
            top: 300,
            pageid: Campaign().get("playerpageid"),
            layer: "objects"
        });
        /*
        newCH.set({ // BUG! Cannot change any property of a newly created effect without crashing the sandbox.
            'left': 300,
            'top': 300,
        });
        */
        sendChat("Script", "/w GM Created combathelper graphic object.");
        
        //sendChat("Script", "/w GM Copy the combathelper token into this page!");
        return;
    }
}

function calcDistanceBetweenTokens(token1, token2)
{
    var currentPage = getObj("page", Campaign().get("playerpageid"));
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
    var gridscale = currentPage.get("scale_number");
    var yDif = Math.abs(y1/70 - y2/70);
    var xDif = Math.abs(x1/70 - x2/70);
    var distance1 = Math.round((Math.sqrt((xDif)*(xDif) + (yDif)*(yDif)))*1000)/1000;
    return distance1*gridscale;
    
}

function calcDistance(currentLeft, currentTop, movPath) {
    var currentPage = getObj("page", Campaign().get("playerpageid"));
    var DiagType = currentPage.get("diagonaltype");
    var isHex = false;
    var diag = 0;
    var straight = 0;
    var curLeft = currentLeft;
    var curTop = currentTop;
    var lastLeft = 0;
    var lastTop = 0;
    var wayPoints = movPath.length-1;
    var diagMultiplyer = 1.5;
    var unitsMoved = 0;
    
    //Get the scale for the players map
    scale = currentPage.get("scale_number");
    
    for(var WP = wayPoints; WP >= 0; WP-=2){

        nextTop = movPath[WP];
        nextLeft = movPath[WP-1];

            
        yDif = Math.abs(curTop/70 - nextTop/70);
        xDif = Math.abs(curLeft/70 - nextLeft/70);
        straight = Math.round((Math.sqrt((xDif)*(xDif) + (yDif)*(yDif)))*1000)/1000;
        
        curTop = nextTop;
        curLeft = nextLeft;


        unitsMoved += straight * scale;

    }

    return(unitsMoved);
}

function recoveryAll(tokens, phaseN) {
    for(var idCounter=0; idCounter<tokens.length; idCounter++){
        var currID = tokens[idCounter][0];
        var currChar = getObj("graphic", currID);
            
        var oCharacter = getObj("character", currChar.get("represents"));
        
        var oHealth = findObjs({name: "REC",_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
        if (oHealth != undefined ) { var rec = parseInt(oHealth.get('current')); }
        var oRun = findObjs({name: "RUN",_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
        if (oRun != undefined ) { var RUN = parseInt(oRun.get('current')); }
        var curBODY = parseInt(currChar.get('bar3_value'));
        var curEnd = parseInt(currChar.get('bar2_value'));
        var curStun = parseInt(currChar.get('bar1_value'));
        var maxEnd = parseInt(currChar.get('bar2_max'));
        var maxStun = parseInt(currChar.get('bar1_max'));
        var currTop = currChar.get("top");
        var currLeft = currChar.get("left");
        var charPath = currChar.get("lastmove").split(",");
        var startLeft = charPath[0];
        var startTop = charPath[1];
        
        var distanceMoved = calcDistance(currLeft, currTop, charPath);
        //log(currChar[0].get("name") + ": " + charPath.length);
        currChar.set("lastmove", currLeft + "," + currTop);
        var runFatigue = 0;
        if(distanceMoved>2){ // A movement within 2m doesn't consume End
            runFatigue = Math.round((distanceMoved/10) + 0.35);
            if((curEnd - runFatigue)<0){
                // Use Stun instead of END
                var diceEndStun = Math.round((curEnd - runFatigue)/2);
                var damageEndStun = 0;
                for(var nn=0; nn<diceEndStun; nn++){
                    damageEndStun += randomInteger(6);
                }

                if((curStun-damageEndStun)<=0 && (curStun-damageEndStun) > -11 && curBODY >= 0){
                    currChar.set('status_pummeled', true);
                    currChar.set('status_sleepy', false);
                    currChar.set('bar1_value', (curStun-damageEndStun));
                    currChar.set('bar2_value', (curStun-damageEndStun));
                }else if ((curStun-damageEndStun) < -10 || curBODY < 0){
                    currChar.set('status_dead', true);
                    currChar.set('status_pummeled', false);
                    currChar.set('bar1_value', (curStun-damageEndStun));
                    currChar.set('bar2_value', (curStun-damageEndStun));
                }
            }
            else{
                currChar.set('bar2_value', (curEnd - runFatigue));
            }
        }

        if((parseInt(phaseN) == 1 && curBODY >= 0) || (curStun>-11 && curStun <= 0 && curBODY >= 0)){
            if(curEnd + rec > maxEnd){
                currChar.set('bar2_value', maxEnd);
            }else{
                currChar.set('bar2_value', (curEnd + rec));
            }
            if(curStun + rec > maxStun){
                currChar.set('bar1_value', maxStun);
            }else{
                currChar.set('bar1_value', (curStun + rec));
                if ((curStun + rec) >= 0 && curBODY >= 0) currChar.set('status_dead', false);
            }
        }

    }
}

function updateAttackers(tokens){
       
    for(var idCounter=0; idCounter<tokens.length; idCounter++){
        var currID = tokens[idCounter][0];

        var currChar = getObj("graphic", currID);

        var oCharacter = getObj("character", currChar.get("represents"));
        currChar.set("status_interdiction", false);
        currChar.set("status_archery-target", false);
        currChar.set("status_black-flag", false);
        currChar.set("status_bolt-shield", false);
        currChar.set("status_ninja-mask", false);
        var oShooterTOCV = findObjs({name: "tempOCV",_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
        var oShooterTDCV = findObjs({name: "tempDCV",_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
        var oShooterRange = findObjs({name: "tempRange",_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
        oShooterTOCV.set("current", 0);
        oShooterTDCV.set("current", 0);
        oShooterRange.set("current", 0);

    }

}

on("ready", function() {
    pinExists = checkPin();
});

on("change:campaign:turnorder", function(obj) {
    var tempTO = JSON.parse(obj.get("turnorder")).shift();
    if(combatBegun && tempTO != undefined)
        if(tempTO.custom == "") // We have a token
        {
            var tempTok = getObj("graphic", tempTO.id);
            sendPing(tempTok.get("left"), tempTok.get("top"), Campaign().get('playerpageid'), null, true);
        }
});

on("change:graphic", function(obj, prev) {

    if (InitiativeCheck() == false) return; //Exit if Turn Tracker is empty;
    //if the graphic was not moved, exit
    if (obj.get("top") == prev["top"] && obj.get("left") == prev["left"]) return;

    //Non Players are ignored
    if(obj.get("represents") == "" && obj.get("name") != "throwing_target") return;

    //Check to make sure it is the players turn
    var c = Campaign();
    var turn_order = JSON.parse(c.get('turnorder'));
    var turn = turn_order.shift();
    var oMovedChar = getObj("character", obj.get("represents"));
    if(!oMovedChar)
    {
        var gmnotes = decodeURI(obj.get('gmnotes'));
        var startPos = decodeURI(gmnotes).indexOf("{tokid}");
        var endPos = decodeURI(gmnotes).indexOf("{/tokid}");
       
        var moverID = decodeURI(gmnotes).substr(startPos+7, (endPos-startPos)-7)
    }
        
    else
        var moverID = obj.id;

        if (turn.id != moverID && moverID.indexOf(MasterID) == -1) {
            obj.set("top", prev["top"]);
            obj.set("left", prev["left"]);
            obj.set("status_interdiction", false);
            sendChat("System", "/desc " + obj.get("name") + ", it is not your turn.");
            return;
        }
        else if(obj.get("status_archery-target"))
        {
            sendChat("GM", whisper + obj.get("name") + " You have already acted/attacked this phase, you cannot move.");
            obj.set("top", prev["top"]);
            obj.set("left", prev["left"]);
            return;
        }
        else if(obj.get("status_fishing-net"))
        {
            sendChat("GM", whisper + obj.get("name") + " You are entangled, you cannot move.");
            obj.set("top", prev["top"]);
            obj.set("left", prev["left"]);
            return;
        }
        else if(obj.get("status_pummeled") || obj.get("status_sleepy"))
        {
            sendChat("GM", whisper + obj.get("name") + " You are stunned, you cannot move.");
            obj.set("top", prev["top"]);
            obj.set("left", prev["left"]);
            return;
        }
        else if(obj.get("status_dead"))
        {
            sendChat("GM", whisper + obj.get("name") + " You are downed, you cannot move.");
            obj.set("top", prev["top"]);
            obj.set("left", prev["left"]);
            return;
        }
        // Throwing target case
    
    if (obj.get("name") == "throwing_target")
    {
        var gmnotes = decodeURI(obj.get('gmnotes'));
        if(!gmnotes)
            return;
        var startPos = decodeURI(gmnotes).indexOf("{coords}");
        var endPos = decodeURI(gmnotes).indexOf("{/coords}");
       
        var coordString = decodeURI(gmnotes).substr(startPos+8, (endPos-startPos)-8)
        throwerCoords = coordString.replace("|", ",");

        startPos = decodeURI(gmnotes).indexOf("{toknam}");
        endPos = decodeURI(gmnotes).indexOf("{/toknam}");
        var tokName = gmnotes.substr(startPos+8, (endPos-startPos)-8);
        
        var distBetween = parseInt(Math.round(calcDistanceBetweenTokens(throwerCoords, obj)));

        if(distBetween > maxThrowingDist)
        {
            sendChat("GM", "/w " + tokName + " You cannot throw it that far!");
            obj.set("top", prev["top"]);
            obj.set("left", prev["left"]);
        }

        return;
    }

    oAllowedRun = findObjs({name: "RUN",_type: "attribute", _characterid: oMovedChar.id}, {caseInsensitive: true})[0];
    var allowedRun = parseInt(oAllowedRun.get('current'));
    var splitLastMove = new Array();
    for(var y=0; y < aChars.length; y++){
        if(aChars[y][0] == obj.id)
           
            splitLastMove = aChars[y][3].split(",");

            var currentPath = obj.get("lastmove").split(",");
    }
    currentPath[0] = splitLastMove[0];
    currentPath[1] = splitLastMove[1];
    //var splitLastMove = prev["lastmove"].split(",");

    var unitsMoved = calcDistance(obj.get('left'), obj.get('top'), currentPath);

    
        if(unitsMoved>(allowedRun)){

            obj.set("left", splitLastMove[0]);
            obj.set("top", splitLastMove[1]);
            obj.set("status_interdiction", false);
            sendChat("GM", whisper + obj.get("name") + " You moved a distance greater than your RUN attribute.");
            if(pinExists)
                ResetAllPins();
            return;
        } else if(unitsMoved>(allowedRun/2)){
            sendChat("System", whisper + obj.get("name") + " If you move this distance you won't be able to do anything else!");
            obj.set("status_interdiction", true);
            if(pinExists)
                SetPin("XPin", splitLastMove);
            return;
        } else{
            obj.set("status_interdiction", false);
            if(unitsMoved>1){
                if(pinExists)
                    SetPin("XPin", splitLastMove);
            }else{
                if(pinExists)
                    ResetAllPins();
            }
        }
});

on('chat:message', function(msg) {
    var command = msg.content.toLowerCase();
    if (msg.type == "api" && (command == "!combatstart" || command == "!nextphase" || command == "!combatadd"))
    {
        
       if(command == "!combatstart" || command == "!combatadd")
       {
            var selected = msg.selected;
            var addCount = 0;
            if(command == "!combatstart")
            {
                cambatBegun = true;
                iii = 1;
                iTurn = 1;
                phase = 1;
                if(pinExists){
                    ResetAllPins();
                }else{
                    createPin();
                    //sendChat("Script", "/w GM For a better game experience put a 'pin' graphic token in this page and name it 'XPin'.");
                }
                checkCombatHelper();
                var nCount = 0;
            }
            if(command == "!combatadd")
            {
                if(!combatBegun)
                {
                    sendChat("Script", "/w GM Start a combat first (with the '!combatstart' command).");
                    return;
                }
                var nCount = aChars.length;
            }
            _.each(selected, function(obj) {
               
                if(obj._type != 'graphic') return;
                var token = getObj("graphic", obj._id);
                var oCharacter = getObj("character", token.get("represents"));
                if (oCharacter != "" ) { // gets SPD, DEX from character's sheet and put them into the array together with tokenen's ID
                    var currTop = token.get("top");
                    var currLeft = token.get("left");
                    aChars[nCount] = new Array(4);
                    aChars[nCount][0] = token.get('_id');
                    var oSPD = findObjs({name: "SPD",_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
                    if (oSPD != "" ){aChars[nCount][1] = parseInt(oSPD.get('current'));}
                    else{sendChat("GM", "No SPD attribute for character " + token.get('name')); return;}
                    var oDEX = findObjs({name: "DEX",_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0]; 
                    if (oDEX != "" )
                       aChars[nCount][2] = parseInt(oDEX.get('current'));
                    aChars[nCount][3] = currLeft + "," + currTop;
                    aChars[nCount][4] = new Array();
                    loadEffects(token, nCount);
                   nCount++;
                   addCount++;
                } 
            });    
            if(nCount==0)
            {
                sendChat("script", "/w gm Select some tokens first!");
                return;
            }
            if(command == "!combatadd")
                sendChat("Script", "/w GM added " + addCount + " token(s).");
            aChars = aChars.sort(function(a,b) { // sorts characters by SPD and then DEX
                if (a[1] < b[1]) return  1;
                if (a[1] > b[1]) return -1;
                if (a[2] < b[2]) return  1;
                if (a[2] > b[2]) return -1;
                return 0;
            });
            if(aChars.length>0 && command == "!combatstart") {sendChat("GM", "/desc Combat begins!");}
            else if(aChars.length==0) {sendChat("Script", "/w GM No tokens selected!");}
        }
    
        if(Campaign().get("turnorder") == "")
        {
            turnorder = [];
        } else turnorder = JSON.parse(Campaign().get("turnorder"));

        if (msg.type == "api" && command == "!nextphase" && combatBegun)
        {

            iii++;
            if(iii>12) {iii=1; sendChat("GM", "/desc Recovery time!"); recoveryAll(aChars, iii);} //

            if(iii==1) {
                for (var a = 0; a < aChars.length; a++) { // cycles through the characters to see if they act during this phase
                    var tempChar = getObj("graphic", aChars[a][0]);
                    
                    var special = decodeURI(tempChar.get("gmnotes"));
                    if (special.indexOf("{nostun}") != -1) noStun = true;
                    else    noStun = false;
                    if (special.indexOf("{nobleed}") != -1) noBleed = true;
                    else    noBleed = false;
                    var isBleeding = tempChar.get('status_red');

                    if(isBleeding && !noBleed)
                    {
                        var totalBodyTaken = parseInt(tempChar.get('bar3_max'))-parseInt(tempChar.get('bar3_value'));
                        var temporaryStun = parseInt(tempChar.get('bar1_value'));
                        var temporaryBody = parseInt(tempChar.get('bar3_value'));
                        var bleedBody = 0;
                        var bleedStun = 0;
                        var bleedDice = aBleedingTable[totalBodyTaken][0];
                        var msgBleeding = "";
                        for(var BD = 0; BD < bleedDice; BD++){
                            bleedTmp = randomInteger(6);
                            bleedStun += bleedTmp;
                            if(bleedTmp == 6) {
                                bleedBody = 1;
                                msgBleeding = " and 1 Body ";
                            }
                        }
                        // Apply the bleeding damage
                        if(!noStun)
                            tempChar.set('bar1_value', (temporaryStun-bleedStun));
                        tempChar.set('bar3_value', (temporaryBody-bleedBody));
                        var msgStopBleeding = "";
                        if(bleedStun>=aBleedingTable[totalBodyTaken][1] && bleedStun<=aBleedingTable[totalBodyTaken][2]) {
                            tempChar.set('status_red', false);
                            msgStopBleeding = "<br/>**The bleeding stops!**";
                        }
                        sendChat("GM", "/w " + tempChar.get('name') + " you get " + bleedStun + " Stun " + msgBleeding + "of damage from bleeding!" + msgStopBleeding);
                        sendChat("script", "/w GM " + tempChar.get('name') + " gets " + bleedStun + " Stun " + msgBleeding + "of damage from bleeding!" + msgStopBleeding);
                    }

                }
                iTurn++;
                sendChat("GM", "/desc New Turn!");
            }
        } 
        if(command != "!combatadd")
            nextPhase(iii);
        else
            addTokens();  
    }

    else if (msg.type == "api" && command == "!combatend"){
        if(aChars.length>0)
        {
            turnorder.length = 0;
            Campaign().set("turnorder", JSON.stringify(turnorder));
            sendChat("GM", "/desc Combat ends.");
            if(pinExists)
                ResetAllPins();
            updateAttackers(aChars);
            aChars.length = 0;
        }
    }
    else if (msg.type == "api" && command == "!combatremove"){
        var idlist = "";
        var removeList = new Array;
        var counter = 0;
        var selected = msg.selected;
        _.each(selected, function(obj) {
               
                if(obj._type != 'graphic') return;
                idlist += obj._id + ",";
                removeList[counter] = new Array(1);
                removeList[counter][0] = obj._id;
                counter++;
            });
        removeToken(idlist, removeList);
        addTokens();
        sendChat("Script", "/w GM removed " + counter + " token(s).");
    }
});