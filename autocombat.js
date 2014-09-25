/*
The macro sends the ID or name of the attacker, the ID or name of the defender, and optionally some other modifiers to the script:

attmod     - Default = 0, optional OCV modifier (because of status like SET, BRACE or various types of bonus/malus);
distance   - Default = 0, optional distance (in meters) - In case you have to manually specify a distance in metres;
shots      - optional modifiers - can be: shots[n] - Number of shots firing for that phase for weapons with selective autofire [1 (max = autofire value)];
abort      - optional modifier needed for "abort" type maneuvers like block and dodge.
manualroll - optional in case players want to roll manually to hit

macro example:

!heroHit mainhand;@{selected|token_id};@{target|token_id};manualroll?{dice roll total?|0}

The weapon string in token's gmnotes has to be:

{weaponname}[a]|[optionals]{/weaponname}

Note: use ":" to separate the name of the parameter from its value ONLY when the value is NOT numeric. For example, efftype MUST have a column before its value, while maxammo doesn't require it (i.e. efftype:e, maxammo10).
      Other parameters are true/false, so it is only required their presence to activate their effect (i.e. ind - the weapon is indestructible).

a   NUMBER   Number of dice of damage. This is the only compulsory parameter. If it is 0 all the others can be omitted, since it means it is a spell (but probably you will use some optionals - see below); use "." for half die and "+" for 1 pip,
             "-" for -1. If the damage is other than 0, other 2 parameters are required: "efftype:" and "damtype:" - see below.
             Set it to 0 for spells, -1 for maneuvers.

OPTIONAL PARAMETERS - they can be in any order

efftype:[n] n = p for Physical, e for Energy; Required if damage is other than 0.
damtype:[n] n = k for Killing Damage, n for Normal Damage; Required if damage is other than 0;
currammo[n] Number of current rounds/arrows for ranged weapons, number of current durability for melee weapons - i.e. currammo12; Note that if you use currammo you MUST insert also maxammo in the string - they go always together;
maxammo[n]  Number of max rounds/arrows for ranged weapons, number of max durability for melee weapons - i.e. maxammo12; Note that if maxammo is not present, the weapon is considered to have the parameters "ind" and "noammo"
tocv[n]     Temp OCV the maneuver linked to the use of the weapon bestows the wielder until he/she changes weapon, hence maneuver - i.e. tocv2;
tdcv[n]     Temp DCV the maneuver linked to the use of the weapon bestows the wielder until he/she changes weapon, hence maneuver;
trange[n]   Temp Range Modifier the maneuver linked to the use of the weapon bestows the wielder until he/she changes weapon, hence maneuver;
ap[n]       Armor Piercing [n times];
pe[n]       Penetrating [n times];
af[n]       Autofire [n shots max, default = 3];
wr[n]       Weapon Range modifier [n];
wo[n]       Weapon OCV mod (positive or negative) [n];
wd[n]       Weapon DCV mod (positive or negative) [n];
so          Stun Only weapon;
norange     For melee weapons; it says that the weapon is a hand-to-hand weapon and checks for the range before a token can attack its target
reach[n]    For melee weapons, in metres; if not present, reach is 2m;
str[n]      STR minimum to wield the weapon, if not present, STR Min is 0; If you want to consider bonus to damage (up to 2x base weapon damage) for really strong characters, you have to use it
ind         Indestructible weapon
los         No range modifiers apply
psi         omcv/dmcv apply instead of OCV/DCV
nohitroll   No roll to hit is required. The attack automatically hits.
end[n]      END cost to use the weapon, if not presents, the end cost is considered to be 1;
noammo      Ranged weapon that doesn't consume ammo;
spellroll[n]  Spell that requires a roll, n = modifier to spell skill roll (i.e. -1 every 10 active points of spell); If followed by a "/" and a name, that name will be used instead of "spellroll"
self        Spell is self-only (automatically hits - no need to use nohitroll);
nohitlocs   No hit locations used for damage. BODYx1 and STUNx1/2d6 used instead. Locations still used for armour purposes;
nobleed     Weapon causes no bleeding effect;
nostun      Weapon causes no stun;
nocrits     Weapon cannot cause critical hits;
stunx[n]    +StunX advantage, n is the value added to the stun multiplier.
effect:     Name of Effect applied on hit AND at least 1 body damage dealt; also add the parameter "effself" in case the effect is applied on attacker instead of target. If amount of effect depends on damage dealt, add also "effvar" parameter
effself:[0/1]     Effect is applied on attacker instead of target;
effvar[n]   Parameter to use the damage dealt with the attack as the amount for the effect applied. n = divider, ignored if no "effect:" parameter is present. Normally n = number of attributes affected. If effvar is present
            the effect "spell" in the Abilities must have "[amount]" instead of a numerical value:
            i.e. For a vampiric weapon that heals the wielder with an amount of body/stun equal to the body damage dealt, the string in the Character's Abilities would be:
            {effect}aid:[amount]f|body/stun|hasdef:pd|freq:o|duration:0s|counter:0|on|desc:Vampiric Heal|nostatus|heal{/effect} - the name of the ability would be [vampiric], and the parameter in the weapon string would be effect:vampiric. The
            weapon string would also contain "effself" and "effvar2" (see example below).
effonhit:[0/1]    Effect is applied on hit instead of on at least 1 body damage dealt. Ignored if no "effect:" parameter is present.
effchance[n] Effect has a n% chance of being applied. Still needs "effonhit" in case it doesn't take a minimum damage to trigger the chance.

Examples:
{katana}2|efftype:p|damtype:k|currammo100|maxammo100|tocv2|tdcv2|end2|norange{/katana}
{firebolt}6|efftype:e|damtype:n|end3|spellroll-3{/firebolt}
{bow}1.|efftype:p|damtype:k|currammo24|maxammo24|end3|wo1|wr2{/bow}
{block}-1|tocv2|tdcv1{/block}
{dodge}-1|tdcv3{/dodge}

Weapons with effects:
{demonsword}2|efftype:p|damtype:k|ind|norange|wo1|end2|str11|effect:vampiric|effself:1|effvar2{/demonsword} **this weapon needs an Ability named [vampiric] with this content: {effect}aid:[amount]f|body/stun|hasdef:no|freq:o|duration:0s|counter:0|on|desc:Vampiric Heal|nostatus|heal{/effect}
{holysword}2|efftype:p|damtype:k|ind|norange|wo1|end2|str11|effect:heal/lightning|effself:1/0|effonhit:1/1{/demonsword}   **this weapon is like the one above, but applies two effects. it will need two distinct "spells" in character's journal:
[heal] with this content (for example): {effect}aid:2d|body/stun|hasdef:no|freq:o|duration:0s|counter:0|on|desc:Heal|nostatus|heal{/effect}
and [lightning] with this: {effect}dam:2d|killing|hasdef:red|freq:o|duration:0s|counter:0|on|desc:Lightning|nostatus{/effect}

Spells with effects:
Also spells can apply Effects. See comments in effects.js

The script will look for some specific strings within GMNotes in attacker or defender Token or specific values in combathelper token's bars:

DEFENDER:
{shield}n{/shield} - n is a number between 1 and 9, it represents the DCV of the shield in use
{nostun} - token doesn't take STUN damage;
{nobleed} - token doesn't bleed;
{damagereduction}{/damagereduction} - The string in gmnotes has to be: {damagereduction}zxxx0.yy{/damagereduction} where z can be "n" or "r" (normal or resistant), xxx can be any combination of  "e", "m" and "p" (energy, mental, physical 
                                      - in no specific order) and y has to be 25, 50 or 75.
                                      Note that 0.25 means a Damage Reduction of 75%, so basically  25 and 75 are inverted. for example, a character with 25% Physical Damage Reduction, Resistant would have:
                                      {damagereduction}rpxx0.75{/damagereduction} (the "xx" is because any letter other than "e", "m" or "p" is fine, is a filler)
{nohitlocs} - Token always takes BODYx1 and STUNx3 in case of Killing damage, and no multipliers in case of Normal damage (you can still aim at a specific location for armour purposes, though);
{mods}dcv[n]|ocv[n]|rpd[n]|red[n]|omcv[n]|dmcv[n]{/mods} - Modifier to DCV/OCV/rPD/rED/omcv/dmcv, if any (for example because of impairment, poison, a barrier or other special effects that you don't want/can to track on the character sheet)

ATTACKER:
Aim at a specific location: the Bar1_value (green) of the combathelper token has to be 0-9: 0 head, 1 hands, 2 arms, 3 shoulders, 4 chest, 5 abdomen, 6 vitals, 7 thighs, 8 legs, 9 feet.
                            If the value is "" then a normal hit is considered, with random location.

ARMOUR
The armour is represented by a string in token's gmnotes:
{armor}head/10/10/|7|7#hand|1|1#arm|1|1#shoulder/10/10/|6|6#chest/10/10/|6|6#abdomen/10/10/|6|6#vitals/10/10/|6|6#thigh|1|1#leg/10/10/|6|6#foot/10/10/|6|6{/armor}

Basically armour strings contain always 10 entries, one for each location. What changes is the protection value - the numbers separated by pipes "|", and the durability values, if any - the numbers separated by slashes "/"
In the example above, the head location has a durability of 10 (on a 10 max), and a protection of 7 PD and 7 ED.
So, for any location, the meaning of the numbers is:
locname/current durability/max durability/|rPD value|rED value

Durability values are optional. If not present, the armour will never degrade its protection.

Entries are separated by the "#" character.


SPELLS:   to tell the script that a particular "weapon" is in fact a special Spell, put the damage to 0.
          If a spell requires a spell roll, and the character has a skill in his/her character's journal called "spellroll" (containing only the value of his/her total skill), the "weapon" string needs the argument "spellroll"
          followed by a number representing the skill roll modifier (usually -1 every 10 active points of spell). Without the parameter "spellroll" the spell always succeeds.

MANEUVERS:  Block and Dodge can be simulated using these strings in characters journal's gmnotes (the values represented here are for the standard HERO Block and Dodge):
            
            {block}-1|tdcv0|tocv2{/block}
            {dodge}-1|tdcv3|self{/dodge}

            The macroes to use the maneuvers are (respectively):

            !heroHit block;@{selected|token_id};@{target|token_id};abort
            !heroHit dodge;@{selected|token_id};;abort

** Due to a bug in the Roll20 API, it is not possible to retrieve journal's gmnotes content. For the time being, just put the strings in TOKEN's gmnotes.

*/
var waf = 1;
var gmLogShow = false;

function arrayHasOwnIndex(array, prop) {
    return array.hasOwnProperty(prop) && /^0$|^[1-9]\d*$/.test(prop) && prop <= 4294967294; // 2^32 - 2
}

function checkTurn(attackerName){
    var oAttName = attackerName[0];
    if( typeof oAttName != "object")
        oAttName = attackerName;

    var actingID = "";
    var c = Campaign();
    var turn_order = JSON.parse(c.get('turnorder'));
    var turn = turn_order.shift();
    actingID = oAttName.get('_id');
    var actingName = oAttName.get('name');

    if (turn.id != actingID && !abort) { // abort maneuvers are always allowed
        sendChat("GM", whisper + actingName + ", it is not your turn.");
        return true;
    }

}

function checkMods(attacker, modifier){
  var oAttName = attacker[0];
  if( typeof oAttName != "object")
        oAttName = attacker;
  var gmnotes = decodeURI(oAttName.get('gmnotes'));
  var startPos = decodeURI(gmnotes).indexOf("{mods}");
  if(startPos >= 0){
    var endPos = decodeURI(gmnotes).indexOf("{/mods}");
    var charMods = decodeURI(gmnotes).substr(startPos+6, (endPos-startPos)-6).split("|");
    var found = -1;
    for(var i=0;i<charMods.length;i++){
        if(charMods[i].indexOf(modifier) != -1){ found = i; }
    }
    if(found >=0)
      return parseInt(charMods[found].replace(modifier, ""));
    else
      return 0;
  }  else return 0;
}

function weaponEffects(damage){
    applySpellEffect = false;
    for(var eff=0; eff<wEffect.length; eff++)
    {        
        if(effOnHit[eff] == "true" || effOnHit[eff] == "1" && effOnHit[eff] != null && effOnHit[eff] != undefined)
            var onHit = true;
        else
            var onHit = false;
        if(effChance[eff] != "" && !isNaN(effChance[eff]) && effChance[eff] != null && effChance[eff] != undefined)
            var Chance = parseInt(effChance[eff]);
        else
            var Chance = 0;
        if(effSelf[eff] == "true" || effSelf[eff] == "1" && effSelf[eff] != null && effSelf[eff] != undefined)
            var onAttacker = true;
        else
            var onAttacker = false;
        if(onHit || damage >= 1) // Effect is applied on hit or if at least 1 body has been inflicted
        {
            var otempChar = getObj("character", oAttacker.get("represents"));
            var oTempObj = findObjs({name: "["+wEffect[eff]+"]",_type: "ability", _characterid: otempChar.id}, {caseInsensitive: true})[0];
            if(oTempObj == "")
              {
                sendChat("Script", "/w gm Put the spell named '[" + wEffect[eff] + "]' into attacker's journal first!");
                return;
              }
            
            var sEffect = oTempObj.get("action");
            if(parseInt(effVar[eff])>0)
            {
                var amount = parseInt(damage/parseInt(effVar[eff]));
                sEffect = sEffect.replace("[amount]", amount);
            }
            var oTarget = oDefender;
            if(onAttacker)
                oTarget = oAttacker;
            if(Chance>0){
                var chanceRoll = randomInteger(100);
                if(chanceRoll<=Chance){
                    insertEffect(oTarget, sEffect, "", "");
                    sendChat("Script", "/w gm Effect " + wEffect[eff] + " triggers! Applied on " + oTarget.get("name"));
                }
            }
            else{
                insertEffect(oTarget, sEffect, "", "");
                sendChat("Script", "/w gm Effect " + wEffect[eff] + " applied on " + oTarget.get("name"));
            }
            
        }
    }
}

function parseWeapon(weaponName, attackerName, shotsFired){
         var oAttName = attackerName[0];
        if( typeof oAttName != "object")
            oAttName = attackerName;
        var unwrapped = unwrapString(weaponName, "|", oAttName, "");
        var noAmmo = false;
        var indestructible = false;
        var gmnotes = decodeURI(oAttName.get('gmnotes'));
        gmnotes = gmnotes.replace(/%23/g, '#');
        gmnotes = gmnotes.replace(/%3A/g, ':');

        if(unwrapped.uString == "")
        {
            if(weaponName == "block" || weaponName == "dodge") // if Block or Dodge and they are not present in token gmnotes, look for them in journal
                unwrapped = unwrapString(weaponName, "|" , oAttName, "journal");

            if(unwrapped.uString == "")
            {
                sendChat("parseWeapon","/w GM  no '" + weaponName + "' present for " + oAttName.get("name") + " (or malformed string)!");
                return -1;
            }
        }
        var aAmmo = unwrapped.uArray;
        var weaponString = unwrapped.uString;

        var newWeaponString = "";

        if (aAmmo.length>1){
            for(var i=1;i<aAmmo.length;i++){
                if(aAmmo[i].indexOf("damtype:") !== -1){ damNK = aAmmo[i].replace("damtype:", ""); }
                if(aAmmo[i].indexOf("currammo") !== -1){ currAmmo = parseInt(aAmmo[i].replace("currammo", "")); }
                if(aAmmo[i].indexOf("maxammo") !== -1){ maxAmmo = parseInt(aAmmo[i].replace("maxammo", "")); }
                if(aAmmo[i].indexOf("af") !== -1){ waf = parseInt(aAmmo[i].replace("af", "")); }
                if(aAmmo[i].indexOf("noammo") !== -1){ noAmmo = true; }
                if(aAmmo[i].indexOf("ind") !== -1){ indestructible = true;}
            }
        }
        if(maxAmmo == 0)
        {
          indestructible = true;
          noAmmo = true;
        }
        if(shotsFired > 0){
            if(shotsFired>waf) {AF = waf;} else if (shotsFired==0){ AF = 1;} else if(shotsFired<waf && shotsFired>1 || shotsFired == waf){ AF = waf;}
        }else{
            AF = waf;
        }

        if (currAmmo == 0){
            if(noAmmo && !indestructible){
                sendChat("GM", whisper + oAttName.get("name") + " Your weapon breaks!");
                AF = 0;
            }else if(noAmmo && indestructible)
            {
              return aAmmo;
            }
            else{
                sendChat("GM", whisper + oAttName.get("name") + " Your " + weaponName + " is out of ammo!");
                sendChat("parseWeapon", whisper + "gm " + oAttName.get("name") + ": " + weaponName + " is out of ammo.");
                AF = 0;
                }
            oAttName.set('status_spanner', true);
        } else // Ammo is > 0
        {
            if(noAmmo==false){
                if(currAmmo<AF)
                {
                  AF = currAmmo; currAmmo = 0; oAttName.set('status_spanner', true);
                  sendChat("GM", whisper + oAttName.get("name") + " You are out of ammo on your " + weaponName + "!");
                  sendChat("parseWeapon", whisper + "gm " + oAttName.get("name") + ": " + weaponName + " is out of ammo.");
                }
                else{
                    currAmmo -= AF;
                }
                for(var a=0;a<aAmmo.length;a++)
                {
                  if(aAmmo[a].indexOf("currammo")>=0)
                  {
                    aAmmo[a] = "currammo" + currAmmo;
                    break;
                  }
                }
                for(var rs=0; rs<aAmmo.length;rs++){
                    newWeaponString += aAmmo[rs] + "|";
                }
                newWeaponString = newWeaponString.substring(0,newWeaponString.length-1);
                gmnotes = gmnotes.replace("{"+weaponName+"}"+weaponString+"{/"+weaponName+"}", "{"+weaponName+"}"+newWeaponString+"{/"+weaponName+"}");
                oAttName.set('gmnotes', gmnotes);
            } else // Weapon doesn't use ammo
            {
                if(indestructible==false) // Check for weapon degradation
                {
                    currAmmo -= AF;
                    for(var a=0;a<aAmmo.length;a++)
                    {
                      if(aAmmo[a].indexOf("currammo")>=0)
                      {
                        aAmmo[a] = "currammo" + currAmmo;
                        break;
                      }
                    }
                    var halfAmmo = parseInt(maxAmmo/2);
                    if(currAmmo==halfAmmo)
                    {
                        sendChat("Master", whisper + oAttName.get("name") + " Your weapon is starting to show signs of wear!");
                        for(var d=0; d<dmgClasses.length; d++)
                        {
                            if(dmgClasses[d]==aAmmo[0]) break;
                        }
                        var oldDmg = aAmmo[0];
                        if(damNK=="n")
                            aAmmo[0] = parseInt(aAmmo[0])-1;
                        else
                            aAmmo[0] = dmgClasses[d-1];
                        var newWeaponString = "";
                        //var tail = "{/"+aAmmo.pop();
                        aAmmo.pop();
                        aAmmo.push("DEG" + oldDmg);
                        //aAmmo.push(tail);
                        for(var rs=0; rs<aAmmo.length;rs++){
                            newWeaponString += aAmmo[rs] + "|";
                        }
                        newWeaponString = newWeaponString.substring(0,newWeaponString.length-1);
                        gmnotes = gmnotes.replace("{"+weaponName+"}"+weaponString+"{/"+weaponName+"}", "{"+weaponName+"}"+newWeaponString+"{/"+weaponName+"}");
                        oAttName.set('gmnotes', gmnotes);
                    }
                    else
                    {
                        for(var rs=0; rs<aAmmo.length;rs++){
                            newWeaponString += aAmmo[rs] + "|";
                        }
                        newWeaponString = newWeaponString.substring(0,newWeaponString.length-1);
                        gmnotes = gmnotes.replace("{"+weaponName+"}"+weaponString+"{/"+weaponName+"}", "{"+weaponName+"}"+newWeaponString+"{/"+weaponName+"}");
                        oAttName.set('gmnotes', gmnotes);
                    }
                }
            }
        }
        return aAmmo;
}

function checkArmor(target){
        
        var aLocs = new Array();
        var unwrapped = unwrapString("armor", "#", target, "");
        if(unwrapped.uString == "")
        {
          aLocs = ["head|0|0","hand|0|0","arm|0|0","shoulder|0|0","chest|0|0","abdomen|0|0","vitals|0|0","thigh|0|0","leg|0|0","foot|0|0"];
          return aLocs;
        }
        else
          return unwrapped.uArray;
}

function updateAttacker(attacker, applyManeuver){
    var oObj = attacker[0];
      if( typeof oObj != "object")
    oObj = attacker;

    var shooterEnd = parseInt(oObj.get('bar2_value'));
    var shooterStun = parseInt(oObj.get('bar1_value'));
    var shooterBody = parseInt(oObj.get('bar3_value'));
    
    if((shooterEnd - endCost)<0){
        // Use Stun instead of END
        var diceEndStun = Math.round((shooterEnd - endCost)/2);
        if(diceEndStun<=0) diceEndStun = 1;
        var damageEndStun = 0;
        for(var nn=0; nn<diceEndStun; nn++){
            damageEndStun += randomInteger(6);
        }

        if((shooterStun-damageEndStun)<=0 && (shooterStun-damageEndStun) > -11 && shooterBody >= 0){
            oObj.set('status_pummeled', true);
            oObj.set('status_sleepy', false);
            oObj.set('bar1_value', (shooterStun-damageEndStun));
            oObj.set('bar2_value', (shooterStun-damageEndStun));
        }else if ((shooterStun-damageEndStun) < -10 || shooterBody <= 0){
            oObj.set('status_dead', true);
            oObj.set('status_pummeled', false);
            oObj.set('bar1_value', (shooterStun-damageEndStun));
            oObj.set('bar2_value', (shooterStun-damageEndStun));
        }else{
            oObj.set('bar1_value', (shooterStun-damageEndStun));
            oObj.set('bar2_value', 0);
        }
    }
    else{
        oObj.set('bar2_value', (shooterEnd - endCost));
    }
    if(applyManeuver) // Apply temporary modifiers depending on maneuver used (taken from weapon fired)
    {
        var oShooter = getObj("character", oObj.get("represents"));
        oShooterTOCV = findObjs({name: "tempOCV",_type: "attribute", _characterid: oShooter.id}, {caseInsensitive: true})[0];
        oShooterTDCV = findObjs({name: "tempOCV",_type: "attribute", _characterid: oShooter.id}, {caseInsensitive: true})[0];
        oShooterRange = findObjs({name: "tempRange",_type: "attribute", _characterid: oShooter.id}, {caseInsensitive: true})[0];
        oShooterTOCV.set("current", attTOCV);
        oShooterTDCV.set("current", attTDCV);
        oShooterRange.set("current", attTRange);
    }

}

function computeDamage(nShot){
  var shots = nShot;
  var armorTable = checkArmor(oDefender);
  var locationHit = armorTable[locHit];
  var armorPart = locationHit.split("|");
  var resilience = armorPart[0].split("/");

  defAP = 0;
  defP = 0;
  if(damType == "p") {aDef = parseInt(armorPart[1]);} else{ aDef = parseInt(armorPart[2]); }
  if (armorPart.length>3){ // See whether the armor has AP or Penetrating hardness
       for(var part=3;part<armorPart.length;part++){
           if(armorPart[part].indexOf("ap") !== -1){ defAP = parseInt(armorPart[part].replace("ap", "")); }
           if(armorPart[part].indexOf("pe") !== -1){ defP = parseInt(armorPart[part].replace("pe", "")); }
       }
  }
  //log("aDef: "+aDef);
  // Check if there is a durability value - if not, the armour is indestructible
  // Durability values have to follow the name of the location. I.e.: #chest/10/10|2|2# for a chest location with a durability of 10 (standard) and a PD/ED of 2
  if(resilience.length>1) 
  {
      var armorLoss = parseInt(resilience[1])/parseInt(resilience[2]);
      aDef = Math.round(aDef*armorLoss);
      if(aDef == 0)
      {
          sendChat("Master", whisper + defName + " Your " + resilience[0] + " armour has fallen to pieces!");
          sendChat("Script", "/w GM " + defName + resilience[0] + " armour has fallen to pieces!");
      }
  }

  sImg1 = '<img src="';
  sImg2 = '"/>';

  var left = "";
  var right = "";
  if(locHit == 1 || locHit == 2 || locHit == 3 || locHit == 7 || locHit == 8 || locHit == 9){
      var leftright = randomInteger(2);
      if(leftright == 1){ right = "<b><(right)</b>"; left = "";} else {right = ""; left = "<b>(left)></b>";}
  }
  //log("shots: " + shots);
  //hits
  hits[shots] = new Array();
  hits[shots][0] = "<div align='center'>" + left + sImg1 + locImg + sImg2 + right + "</div>";
  
  var damageTot = 0;
  var damageStun = 0;
  var absoluteDamage = 0;
  var bodyRolled = 0;
  var stunRolled = 0;

  if(damNK == "k"){ // Killing Damage
      
      if(strDamMod>0) // In case of melee weapons, if the character's STR is higher than the STR Minimum for the weapon, increase the damage up to base damage * 2
      {
          
        for(var i=0;i<dmgClasses.length;i++){
            if(dmgClasses[i] == numdice){
                if(i+strDamMod > i*2)
                    i = i*2;
                else if(strDamMod>0)
                    i+=strDamMod;
                numdice = dmgClasses[i];
                if(numdice.indexOf(".")>=0)
                    halfdie = true;
                if(numdice.indexOf("+")>=0)
                    pip = 1;
                if(numdice.indexOf("-")>=0)
                    pip = -1;
                numdice = numdice.replace("-","");
                numdice = numdice.replace("+","");
                numdice = numdice.replace(".","");
                nd = parseInt(numdice);
                break;
            }
        }
         
      }
      if(isCrit){
          //log("entered killing critical");
          damageTot = nd * 6;
          if (halfdie){
              damageTot += 3;
          }
      } else {
          for(var dice = 0; dice < nd; dice ++){
              damageTot += randomInteger(6);
          }
          if (halfdie){
              damageTot += parseInt(halfdieBody[randomInteger(6)]);
          }
      }

      // Apply totals against defenses and check for AP or Penetrating
      damageTot += pip; // Add 1 Pip in case it exists
      gmLog += "<br/>Damage rolled: " + damageTot;

      bodyRolled = damageTot;
      // Armor degradation
      if(damageTot>= Math.round(aDef/3)) // Check if the damage is enough to ruin the armour
      {
          var armorDmg = 1;
          if(armorPart[0].indexOf("/") != -1) // Check if the armour is indestructible
          {
              var armorRes = armorPart[0].split("/");
              if(damageTot >= aDef*2) armorDmg = 2;
              armorRes[1] = parseInt(armorRes[1]) - armorDmg;
              var newArmor = "{armor}";
              var oldArmor = newArmor;
              var oldArmorPart;
              for(var ls=0; ls<10; ls++)
              {
                  oldArmorPart = armorTable[ls];
                  if(ls == locHit) // Armor part hit
                  {
                      var armorTemp = armorTable[ls].split("/");
                      armorTemp[1] = armorRes[1];
                      armorTable[ls] = armorTemp[0] + "/" + armorTemp[1] + "/" + armorTemp[2] + "/" + armorTemp[3];
                  }
                  //log("armorpart: "+armorTable[ls]);
                  oldArmor += oldArmorPart + "#";
                  newArmor += armorTable[ls] + "#";
              }
              newArmor = newArmor.substr(0, newArmor.length-1) + "{/armor}";
              oldArmor = oldArmor.substr(0, oldArmor.length-1) + "{/armor}";

              // write the new armour string into gmnotes
              var gmnotes = decodeURI(oDefender.get('gmnotes'));
              gmnotes = gmnotes.replace(/%23/g, '#');
              gmnotes = gmnotes.replace(oldArmor, newArmor);
              oDefender.set('gmnotes', gmnotes);
          }
          
      }
      // See if there are special Mods with rPD/rED or PD/ED
      var whattolookfor = "";
      var modsNormalDef = 0;
      var modsResDef = 0;
      if(damType == "p")
          whattolookfor = "pd";
        else
          whattolookfor = "ed";

      modsNormalDef = checkMods(oAttacker, whattolookfor);
      modsResDef = checkMods(oAttacker, "r"+whattolookfor);

      nDef += modsNormalDef;
      rDef += modsResDef;

       if(AP>defAP){
        var numTimes = AP - defAP;
        for(var h=0;h<numTimes;h++)
            AP *= 2;
      
        if(aDef>0){
            aDef = Math.round(aDef/AP);
            if(aDef<1)
                aDef = 1;
        }   
        if(rDef>0){
            rDef = Math.round(rDef/AP);
            if(rDef<1)
                rDef = 1;
        }  
        if(nDef>0){
            nDef = Math.round(nDef/AP);
            if(nDef<1)
                nDef = 1;
        }
      }

      var BodyMultiplier;
      var StunMultiplier;

      if(!noHitLocs)
      {
        BodyMultiplier = parseFloat(damBody[locHit]);
        StunMultiplier = parseInt(damKStun[locHit]);
      } else  // No Hit Locations Advantage
      {
        BodyMultiplier = 1;
        StunMultiplier = randomInteger(3);
      }
      if(oDefender.get("status_dead"))
        StunMultiplier *= 2;
      StunMultiplier += StunX; // StunX advantage

      var totalDefsBody = parseInt(aDef) + parseInt(rDef);
      var totalDefsStun = parseInt(aDef) + parseInt(nDef) + parseInt(rDef);

      stunRolled = bodyRolled * StunMultiplier;
      absoluteDamage = damageTot - totalDefsBody;
      damageStun = (damageTot * StunMultiplier) - totalDefsStun;
      damageTot = parseInt((damageTot - totalDefsBody) * BodyMultiplier);
      if(damageTot>absoluteDamage) absoluteDamage = damageTot;
      if(damageTot<0) damageTot = 0;
      if(damageStun<0) damageStun = 0;
      if (Penetrating>defP && damageTot < nd) damageTot = nd;
      if (damageStun < damageTot) damageStun = damageTot;

  } else { // Normal Damage - No Autofire possible
      // Add damage mod due to str over the str min, if any (max damage = 2x base damage)
      if(nd + strDamMod > nd * 2)
        nd = nd * 2;
      else
        nd += strDamMod;
      var whattolookfor = "";
      var modsNormalDef = 0;
      var modsResDef = 0;
      if(damType == "p")
          whattolookfor = "pd";
        else
          whattolookfor = "ed";
      // See if there are special Mods with rPD/rED or PD/ED
      modsNormalDef = checkMods(oAttacker, whattolookfor);
      modsResDef = checkMods(oAttacker, "r"+whattolookfor);

      nDef += modsNormalDef;
      rDef += modsResDef;

      if(isCrit){
              //log("critical normal damage");
              damageTot = nd * 2;
              damageStun = nd * 6;
              stunRolled = damageStun;
              bodyRolled = damageTot;
      } else {
          //log("normal damage");
          for(var dice = 0; dice < nd; dice ++){
              temp = randomInteger(6);
              damageTot += parseInt(herodieBody[temp]);
              damageStun += temp;
              stunRolled = damageStun;
              bodyRolled = damageTot;
          }
       }
       // Armor degradation
          if(damageTot>= Math.round(aDef/3)) // Check if the damage is enough to ruin the armour
          {
              var armorDmg = 1;
              if(armorPart[0].indexOf("/") != -1) // Check if the armour is indestructible
              {
                  var armorRes = armorPart[0].split("/");
                  if(damageTot >= aDef*2) armorDmg = 2;
                  armorRes[1] = parseInt(armorRes[1]) - armorDmg;
                  var newArmor = "{armor}";
                  var oldArmor = newArmor;
                  var oldArmorPart;
                  for(var ls=0; ls<10; ls++)
                  {
                      oldArmorPart = armorTable[ls];
                      if(ls == locHit) // Armor part hit
                      {
                          var armorTemp = armorTable[ls].split("/");
                          armorTemp[1] = armorRes[1];
                          armorTable[ls] = armorTemp[0] + "/" + armorTemp[1] + "/" + armorTemp[2] + "/" + armorTemp[3];
                      }
                      //log("armorpart: "+armorTable[ls]);
                      oldArmor += oldArmorPart + "#";
                      newArmor += armorTable[ls] + "#";
                  }
                  newArmor = newArmor.substr(0, newArmor.length-1) + "{/armor}";
                  oldArmor = oldArmor.substr(0, oldArmor.length-1) + "{/armor}";

                  // write the new armour string into gmnotes
                  var gmnotes = decodeURI(oDefender.get('gmnotes'));
                  gmnotes = gmnotes.replace(/%23/g, '#');
                  gmnotes = gmnotes.replace(oldArmor, newArmor);
                  oDefender.set('gmnotes', gmnotes);
              }
          }
            if(AP>defAP){
                var numTimes = AP - defAP;
                for(var h=0;h<numTimes;h++)
                    AP *= 2;
              
                if(aDef>0){
                    aDef = Math.round(aDef/AP);
                    if(aDef<1)
                        aDef = 1;
                }   
                if(rDef>0){
                    rDef = Math.round(rDef/AP);
                    if(rDef<1)
                        rDef = 1;
                }  
                if(nDef>0){
                    nDef = Math.round(nDef/AP);
                    if(nDef<1)
                        nDef = 1;
                }
            }
          var BodyMultiplier;
          var StunMultiplier;
          if(!noHitLocs) // No Hit Locations Advantage
          {
            BodyMultiplier = parseFloat(damBody[locHit]);
            StunMultiplier = parseFloat(damNStun[locHit]);
          } else
          {
            BodyMultiplier = 1;
            StunMultiplier = 1;
          }
          if(oDefender.get("status_dead"))
            StunMultiplier *= 2;
          StunMultiplier += StunX;
          var totalDefsBody = parseInt(aDef) + parseInt(rDef) + parseInt(nDef);
          var totalDefsStun = totalDefsBody;
          absoluteDamage = damageTot - totalDefsBody;
          damageStun = parseInt((damageStun * StunMultiplier) - totalDefsStun);
          damageTot = parseInt((damageTot * BodyMultiplier) - totalDefsBody);
          if(damageTot>absoluteDamage) absoluteDamage = damageTot;
          if(damageTot<0) damageTot = 0;
          if(damageStun<0) damageStun = 0;
          if (Penetrating>defP && damageTot < nd) damageTot = nd;
          if (damageStun < damageTot) damageStun = damageTot; 
  }
  // Check other special defenses/status like No Stun, Damage Reduction, Stun Only
  if(stunOnly) damageTot = 0;
  if(noStun) damageStun = 0;
  if(damMultiplier < 1)
  {
      if(typeofReduction.indexOf(damType) >= 0)
      {   
          if(typeofReduction.indexOf("r")>=0 || damNK == "n")
          {
              damageStun = parseInt(damageStun*damMultiplier);
              damageTot = parseInt(damageTot*damMultiplier);
          }
      }
  }
  // Final damage:
  hits[shots][1] = damageTot;
  hits[shots][2] = damageStun;

  // Weapon Effects, if any
  if(wEffect[0]!="") // Weapon applies effect(s)
  {
    weaponEffects(hits[shots][1]);
  }
  // HIT results -----------------------------------
  var damageChat = "<br/>";
  var critChat = "";
  if (isCrit) {critChat = " - <b>Critical Hit!</b> -";}
  for (key in hits) {
      if (arrayHasOwnIndex(hits, key)) {
          damageChat += hits[key][0];
          damageChat += critChat + "<br/><b>" + hits[key][1] + "</b> BODY, <b>" + hits[key][2] + "</b> STUN";
          damageChat += "<br>(rolled " + bodyRolled + " BODY, " + stunRolled + " STUN of dice damage)";
          // Applies the damage to the token/sheet
          var target = oDefender;

          var oTarget = getObj("character", target.get("represents"));
          
          oCON = findObjs({name: "CON",_type: "attribute", _characterid: oTarget.id}, {caseInsensitive: true})[0];
          var targetCON = parseInt(oCON.get('current'));

          var targetBody = parseInt(target.get('bar3_value'));
          var maxBody = parseInt(target.get('bar3_max'));
          var maxStun = parseInt(target.get('bar1_max'));
          var targetEnd = parseInt(target.get('bar2_value'));
          var targetStun = parseInt(target.get('bar1_value'));

          if(hits[key][1] > 0 && !noBleed){
              target.set('status_red', true);
          }
          targetBody -= hits[key][1];
          targetStun -= hits[key][2];
          var impaired = false;
          var disabled = false;
          var stunned = false;
          var passedout = false;
          if((targetStun<=0 && targetStun > -11) && targetBody >= 0){
              passedout = true;
              target.set('status_pummeled', true);
              target.set('status_sleepy', false);
              target.set('bar2_value', targetStun);
          }else if (targetStun < -10 || targetBody <= 0){
              passedout = true;
              target.set('status_dead', true);
              target.set('status_pummeled', false);
              target.set('bar2_value', targetStun);
          }
          if(!passedout && hits[key][2]>targetCON && !noStun){
              stunned = true;
              target.set('status_sleepy', true);
          }
          if(absoluteDamage >= maxBody){
              disabled = true;
              target.set('status_broken-heart', true);
          }
          if(!disabled && absoluteDamage > parseInt(maxBody/2)){
              impaired = true;
              target.set('status_half-heart', true);
          }
          if(isNaN(targetBody))
            targetBody = 0;
          if(isNaN(targetStun))
            targetStun = 0;
          target.set('bar3_value', targetBody);
          target.set('bar1_value', targetStun);
      }
  }
  // Apply END cost to attacker and set the temporary modifiers
  updateAttacker(oAttacker, true);
  sendChat("combat", "/direct " + damageChat);
  return;
}

function hitRoll(stringa)
{
   var stringa = stringa.split(";");
   numOptions = stringa.length;
   wName = stringa[0];
   attName = stringa[1];
   //attTDC = stringa[3]; // used as various defender DCV modifiers, if any, taken from combathelper bar3 token;
   defName = stringa[2];
   if(defName == "") // in case of maneuvers or other self-only stuff where it is not required to select a target
    defName = attName;

  enableCrits = true; // Put it to false to disable critical hits altogether
  endCost = 1;
  attTOCV = 0;
  attTDCV = 0;
  attTRange = 0;
  attRangeMod = 0;
  noRange = false;
  weaponRange = 0;
  weaponOCV = 0;
  weaponDCV = 0;
  stunOnly = false;
  reach = 2;
  strMin = 0;
  aimed = "";
  aimedMod = 0;
  noStun = false;
  noBleed = false;
  noHitLocs = false;
  strMin = 0;
  strMinMalus = 0;
  isHit = 0;
  isCrit = false;
  herodice = "";
  totBody = 0;
  totStun = 0;
  halfdie = false;
  pip = 0;
  nd = 0;
  gmLog;
  damMultiplier = 1;
  hits.length = 0;
  targetValue = 0;
  attOCVMod = 0;
  defDCVMod = 0;
  los = false;
  psi = false;
  strDamMod = 0;
  spellroll = "";
  spellString = "";
  nohitroll = false;
  attMod = 0;
  distance = 0;
  maxammo = 0;
  selfOnly = false;
  StunX = 0;
  abort = false;
  dodge = false;
  defWeaponOCV = 0;
  shield = 0;
  halfDCV = false;
  wEffect[0] = "";
  effVar[0] = 0;
  effOnHit[0] = false;
  effSelf[0] = false;
  effChance[0] = 0;
  noCrits = false;
  AF = -1;
  applySpellEffect = true;
  spellRollSkill = "spellroll";
  manualroll = 0;

  if (numOptions>3){ // Check for other important parameters
     for(var i=3;i<numOptions;i++){
         if(stringa[i].indexOf("shots") !== -1){ AF = parseInt(stringa[i].replace("shots", "")); }
         if(stringa[i].indexOf("attmod") !== -1){ attMod = parseInt(stringa[i].replace("attmod", "")); }
         if(stringa[i].indexOf("distance") !== -1){ distance = parseInt(stringa[i].replace("distance", "")); }
         if(stringa[i].indexOf("abort") !== -1){ abort = true; }
         if(stringa[i].indexOf("manualroll") !== -1){ manualroll = parseInt(stringa[i].replace("manualroll", "")); }
     }
  }

   if (attTDC == "") attTDC = 0;

   if(attName.indexOf("-") == 0) // Token ID
   {
       Attacker = getObj("graphic", attName);
       attName = Attacker.get("name");
   }
   else
       Attacker = findObjs({                              
          _pageid: Campaign().get("playerpageid"),                              
          _type: "graphic",
          _name: attName,
       });
   if(defName.indexOf("-") == 0) // Token ID
   {
       Defender = getObj("graphic", defName);
       defName = Defender.get("name");
   }
   else
       Defender = findObjs({                              
          _pageid: Campaign().get("playerpageid"),                              
          _type: "graphic",
          _name: defName,
       });

    oAttacker = Attacker[0];
    if( typeof oAttacker != "object")
        oAttacker = Attacker;

     oDefender = Defender[0];
    if( typeof oDefender != "object")
        oDefender = Defender;
   
   oCombatHelper = findObjs({                              
      _pageid: Campaign().get("playerpageid"),                              
      _type: "graphic",
      _name: "combathelper",
   });
   if(oCombatHelper != ""){
      aimed = oCombatHelper[0].get("bar1_value");
      attTDC = parseInt(oCombatHelper[0].get("bar3_value"));
    }
    else
      sendChat("Script", "/w GM Copy the combathelper token into this page!");

  var attChar = getObj("character", oAttacker.get("represents"));
  var oAttrib = findObjs({name: "OCV",_type: "attribute", _characterid: attChar.id}, {caseInsensitive: true})[0];
  attOCV = parseInt(oAttrib.get("current"));
  
  if(isNaN(attTDC) || attTDC == "NaN")
  {
    attTDC = 0;
  }
  var defChar = getObj("character", oDefender.get("represents"));
  oAttrib = findObjs({name: "DCV",_type: "attribute", _characterid: defChar.id}, {caseInsensitive: true})[0];
  defDCV = parseInt(oAttrib.get("current"));
  oAttrib = findObjs({name: "PD",_type: "attribute", _characterid: defChar.id}, {caseInsensitive: true})[0];
  defPD = parseInt(oAttrib.get("current"));
  oAttrib = findObjs({name: "ED",_type: "attribute", _characterid: defChar.id}, {caseInsensitive: true})[0];
  defED = parseInt(oAttrib.get("current"));
  oAttrib = findObjs({name: "rPD",_type: "attribute", _characterid: defChar.id}, {caseInsensitive: true})[0];
  defRPD = parseInt(oAttrib.get("current"));
  oAttrib = findObjs({name: "rED",_type: "attribute", _characterid: defChar.id}, {caseInsensitive: true})[0];
  defRED = parseInt(oAttrib.get("current"));
  oAttrib = findObjs({name: "tempDCV",_type: "attribute", _characterid: defChar.id}, {caseInsensitive: true})[0];
  defTDCV = parseInt(oAttrib.get("current"));
  if(oDefender.get("status_ninja-mask")) // defender is dodging
    dodge = true;

  if (InitiativeCheck() == false)
          {
              sendChat("Master", whisper + oAttacker.get("name") + " You are not in combat.");
              return -1;
          }
  if(checkTurn(oAttacker)) return -1;
  
  if(distance == 0) distance = calcDistanceBetweenTokens(oAttacker, oDefender);
     
  var aWeapon = parseWeapon(wName, oAttacker, AF);

  numWeapOptions = aWeapon.length;

  numdice = aWeapon[0];

  if(AF == 0) return -1; // Weapon broken or out of ammo 

  if (numWeapOptions>1){
     for(var i=1;i<numWeapOptions;i++){
         if(aWeapon[i].indexOf("efftype:") !== -1){ damType = aWeapon[i].replace("efftype:", ""); }
         if(aWeapon[i].indexOf("tocv") !== -1){ attTOCV = parseInt(aWeapon[i].replace("tocv", "")); }
         if(aWeapon[i].indexOf("tdcv") !== -1){ attTDCV = parseInt(aWeapon[i].replace("tdcv", "")); }
         if(aWeapon[i].indexOf("trange") !== -1){ attTRange = parseInt(aWeapon[i].replace("trange", "")); }
         if(aWeapon[i].indexOf("ap") !== -1){ AP = parseInt(aWeapon[i].replace("ap", "")); }
         if(aWeapon[i].indexOf("pe") !== -1){ Penetrating = parseInt(aWeapon[i].replace("pe", "")); }
         if(aWeapon[i].indexOf("wr") !== -1){ weaponRange = parseInt(aWeapon[i].replace("wr", "")); } // range modifier
         if(aWeapon[i].indexOf("wo") !== -1){ weaponOCV = parseInt(aWeapon[i].replace("wo", "")); }
         if(aWeapon[i].indexOf("af") !== -1){ waf = parseInt(aWeapon[i].replace("af", "")); } // autofire
         if(aWeapon[i].indexOf("so") !== -1){ stunOnly = parseInt(aWeapon[i].replace("so", "")); }
         if(aWeapon[i].indexOf("end") !== -1){ endCost = parseInt(aWeapon[i].replace("end", "")); }
         if(aWeapon[i].indexOf("norange") !== -1){ noRange = true; }
         if(aWeapon[i].indexOf("reach") !== -1){ reach = parseInt(aWeapon[i].replace("reach", "")); }
         if(aWeapon[i].indexOf("str") !== -1){ strMin = parseInt(aWeapon[i].replace("str", "")); }
         if(aWeapon[i].indexOf("wd") !== -1){ weaponDCV = parseInt(aWeapon[i].replace("wd", "")); }
         if(aWeapon[i].indexOf("los") !== -1){ los = true; } // no penalty for range
         if(aWeapon[i].indexOf("psi") !== -1){ psi = true; } // to hit based on mental ocv/dcv
         if(aWeapon[i].indexOf("spellroll") !== -1){ var sroll = aWeapon[i].replace("spellroll", "").split("/"); if(sroll.length>1){spellRollSkill = sroll[1];}; spellroll = parseInt(sroll[0]);} // modifier to roll for casting spell
         if(aWeapon[i].indexOf("nohitroll") !== -1){ nohitroll = true; }
         if(aWeapon[i].indexOf("nostun") !== -1){ noStun = true; }
         if(aWeapon[i] == "self"){ selfOnly = true; }
         if(aWeapon[i].indexOf("nohitlocs") !== -1){ noHitLocs = true; }
         if(aWeapon[i].indexOf("nocrits") !== -1){ noCrits = true; }
         if(aWeapon[i].indexOf("nobleed") !== -1){ noBleed = true; }
         if(aWeapon[i].indexOf("stunx") !== -1){ StunX = parseInt(aWeapon[i].replace("stunx", ""));}
         if(aWeapon[i].indexOf("halfdcv") !== -1){ halfDCV = true; }
         if(aWeapon[i].indexOf("effect:") !== -1){ wEffect = aWeapon[i].replace("effect:", "").split("/"); }
         if(aWeapon[i].indexOf("effvar") !== -1){ effVar = aWeapon[i].replace("effvar", "").split("/"); }
         if(aWeapon[i].indexOf("effonhit:") !== -1){ effOnHit = aWeapon[i].replace("effonhit:", "").split("/"); }
         if(aWeapon[i].indexOf("effself:") !== -1){ effSelf = aWeapon[i].replace("effself:", "").split("/");; }
         if(aWeapon[i].indexOf("effchance") !== -1){ effChance = aWeapon[i].replace("effchance", "").split("/");; }
     }
  }
  if(Penetrating=="")
    Penetrating = 0;
  if(AP=="")
    AP = 0;
    // Check width and height of tokens for reach purposes
    var currentPage = getObj("page", Campaign().get("playerpageid"));
    var tokWidth = oAttacker.get("width");
    var tokHeight = oAttacker.get("height");
    if(tokWidth>tokHeight)
        var bigger = tokWidth;
    else
        var bigger = tokHeight;
    var size = (bigger/70)-1;
    tokWidth = oDefender.get("width");
    tokHeight = oDefender.get("height");
    if(tokWidth>tokHeight)
        bigger = tokWidth;
    else
        bigger = tokHeight;
    size += (bigger/70)-1;
    size = size * currentPage.get("scale_number");
    reach += size;
    reach = Math.round(reach);

    if(distance > reach && noRange) // Melee weapons
    {
        sendChat("Master", whisper + attName + " You are not within weapon range (" + reach + "m) from your target!");
        return -1;
    }
    if(oAttacker.get("status_archery-target")) // If character has already attacked, he needs GM's permission (and removal of the archery-target status) in order to attack again
    {
        sendChat("Master", whisper + attName + " You have already acted this phase.");
        return -1;
    }
    if(oAttacker.get("status_sleepy") || oAttacker.get("status_pummeled")) 
    {
        sendChat("Master", whisper + attName + " You are still stunned!");
        return -1;
    }
    if(oAttacker.get("status_spanner"))
    {
        sendChat("Master", whisper + attName + " You are out of ammo!");
        return -1;
    }
    if(oAttacker.get("status_dead"))
    {
        sendChat("Master", whisper + attName + " You are barely able to breath...");
        return -1;
    }
    if(oAttacker.get("status_fishing-net")) 
    {
        sendChat("Master", whisper + attName + " You are entangled!");
        return -1;
    }
    if(selfOnly && (oAttacker.get("id") != oDefender.get("id")))
    {
        sendChat("Master", whisper + attName + " It is a self-only spell!");
        return -1;
    }
    if(oAttacker.get("id") == oDefender.get("id"))
    {
        nohitroll = true;
    }
     // Compute malus depending on distance inputed
     for(var r=0; r<distanceMod.length;r++){
         attRangeMod = r;
         if(distance<=distanceMod[r]) break;
     }

      if(spellroll != "") // We have a spell or weapon with Spell Roll required
      {
        var otempChar = getObj("character", oAttacker.get("represents"));
        var castingroll = randomInteger(6)+randomInteger(6)+randomInteger(6);
        var oTempObj = findObjs({name: spellRollSkill,_type: "ability", _characterid: otempChar.id}, {caseInsensitive: true})[0];
        if(oTempObj == "")
        {
          sendChat("Script", "/w gm Put a spellroll skill named '" + spellRollSkill + "' into caster's sheet first!");
          return;
        }
        var spellSkill = parseInt(oTempObj.get('action'));
        var spellrollmod = 0;
        spellrollmod = checkMods(oAttacker, "spellroll");
        if((spellSkill + parseInt(spellroll) + spellrollmod - castingroll < 0 && castingroll != 3) || castingroll == 18) // Casting failed
        {
          oAttacker.set("status_archery-target", true);
          updateAttacker(oAttacker, false);
          return "fizzle";
        }
      }

     // In case we have a spell
    if(numdice == "0") // Spell with Effect to be applied
    {
      var otempChar = getObj("character", oAttacker.get("represents"));
      
          var oTempObj = findObjs({name: "["+wName+"]",_type: "ability", _characterid: otempChar.id}, {caseInsensitive: true})[0];
          if(oTempObj == "")
          {
            sendChat("Script", "/w gm Put the spell named '[" + wName + "]' into caster's sheet first!");
            return;
          }
          spellString = oTempObj.get('action');
    }
   // Other specials on Defender

    var special = decodeURI(oDefender.get("gmnotes"));
    if (special.indexOf("{nostun}") != -1) noStun = true;
    if (special.indexOf("{nohitlocs}") != -1) noHitLocs = true;
    if (special.indexOf("{nobleed}") != -1) noBleed = true;
    if (special.indexOf("{damagereduction}") >= 0) 
    {
        typeofReduction = special.substr(special.indexOf("{damagereduction}")+17, 4);
        damMultiplier = parseFloat(special.substr(special.indexOf("{damagereduction}")+21, 4));
    }
    if (special.indexOf("{shield}") != -1) // See if character is using a shield in order to count in its DCV value (or OCV for block purposes)
    {
        shield = parseInt(special.substr(special.indexOf("{shield}")+8, 1));
    }

    if(numdice == "-1") // Maneuver, it automatically succeeds
    {
        nohitroll = true;
        if(wName == "block")
        {
            var chatbit = "";
            var tempOCV = attTOCV;
            var tempDCV = attTDCV;
            if(oAttacker.get("_id") != oDefender.get("_id")) // Acting character blocking attacks directed at someone else
            {
                chatbit = " (for " + oDefender.get("name") + ")";
                tempOCV -= 2;
            }
            // Now we need to get the weapon(s) OCV bonus, depending on the equipped weapon
            var weapon = unwrapString("mainhand", "|" , oAttacker, "");
            var aWeapon = weapon.uArray;
            if(aWeapon.length > 0)
            {
                for(var i=0;i<aWeapon.length;i++){
                    if(aWeapon[i].indexOf("wo") !== -1){ defWeaponOCV = parseInt(aWeapon[i].replace("wo", "")); }
                    if(aWeapon[i].indexOf("end") !== -1){ endCost = parseInt(aWeapon[i].replace("end", "")); }
                }
            }
            weapon = unwrapString("offhand", "|" , oAttacker, "");
            aWeapon = weapon.uArray;
            if(aWeapon.length > 0)
            {
                for(var i=0;i<aWeapon.length;i++){
                    if(aWeapon[i].indexOf("wo") !== -1){ defWeaponOCV += parseInt(aWeapon[i].replace("wo", "")); }
                }
                defWeaponOCV += 1; // Off hand weapong gives a +1 on block in any case
            }
            else
            {
                defWeaponOCV += shield; // If no weapon is equipped in offhand then use the shield bonus, if any
            }
            tempOCV += defWeaponOCV;

            var otempChar = getObj("character", oDefender.get("represents"));
            var oTempAttr = findObjs({name: "tempOCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
            oTempAttr.set("current", tempOCV);
            oTempAttr = findObjs({name: "tempDCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
            oTempAttr.set("current", tempDCV);
            otempChar = getObj("character", oAttacker.get("represents"));
            oTempAttr = findObjs({name: "SPD",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
            var attSPD = parseInt(oTempAttr.get("current"));
            /* Block:
            In order to maintain the block effect until after character's next acting phase (and being able to use it on other characters as well), the best way is to compute how many absolute phases it has to last
            from the very phase in which it has been activated.
            We will use the bolt-shield marker using the tag number to represent the number of phases of duration.
            */
            if(iii<3) {var needle = iii+",";} else {var needle = iii;}
            var phases = aSPDchart[attSPD];
            var pos = phases.indexOf(needle);
            var tempPhase = iii;
            if(tempPhase==12)
                tempPhase = 0;
            if(pos>-1) // Character blocking will act during this phase
            {
                var actingPhases = aSPDchart[attSPD].split(",");
                for(s=0;s<actingPhases.length;s++)
                {
                    if(parseInt(actingPhases[s])>tempPhase)
                        break;
                }
                if(parseInt(actingPhases[s])==12)
                    var blockDuration = parseInt(actingPhases[0]);
                else
                    var blockDuration = parseInt(actingPhases[s+1])-parseInt(actingPhases[s]);
                oAttacker.set("status_archery-target", true);
            }
            else
            {
                var actingPhases = aSPDchart[attSPD].split(",");
                for(s=0;s<actingPhases.length;s++)
                {
                    if(parseInt(actingPhases[s])>tempPhase)
                        break;
                }
                if(parseInt(actingPhases[s])==12)
                    var blockDuration = parseInt(actingPhases[s])-tempPhase + parseInt(actingPhases[0]);
                else
                    var blockDuration = parseInt(actingPhases[s])-tempPhase + (parseInt(actingPhases[s+1]) - parseInt(actingPhases[s]));
                oAttacker.set("status_black-flag", true);
            }
                
            oDefender.set("status_bolt-shield", blockDuration);
            oAttacker.set("status_bolt-shield", blockDuration);
            
           
            sendChat("GM", whisper + oAttacker.get("name") + " blocking!" + chatbit);
            return -1;
        }

        if(wName == "dodge") // We will use the ninja-status marker using the tag number to represent the number of phases of duration.
        {
            var tempDCV = attTDCV;
            
            var otempChar = getObj("character", oAttacker.get("represents"));
            var oTempAttr = findObjs({name: "tempDCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
            oTempAttr.set("current", tempDCV);


            oTempAttr = findObjs({name: "SPD",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
            var attSPD = parseInt(oTempAttr.get("current"));
            var tempPhase = iii;
            if(tempPhase==12)
                tempPhase = 0;
            if(iii<3) {var needle = iii+",";} else {var needle = iii;}
            var phases = aSPDchart[attSPD];
            var pos = phases.indexOf(needle);
            if(pos>-1) // Character dodging will act during this phase
            {
                var actingPhases = aSPDchart[attSPD].split(",");
                for(s=0;s<actingPhases.length;s++)
                {
                    if(parseInt(actingPhases[s])>tempPhase)
                        break;
                }
                if(parseInt(actingPhases[s])==12)
                    var dodgeDuration = parseInt(actingPhases[0]);
                else
                    var dodgeDuration = parseInt(actingPhases[s+1])-parseInt(actingPhases[s]);
                oAttacker.set("status_archery-target", true);
            }
            else
            {
                var actingPhases = aSPDchart[attSPD].split(",");
                for(s=0;s<actingPhases.length;s++)
                {
                    if(parseInt(actingPhases[s])>tempPhase)
                        break;
                }
                if(parseInt(actingPhases[s])==12)
                    var dodgeDuration = parseInt(actingPhases[s])-tempPhase + parseInt(actingPhases[0]);
                else
                    var dodgeDuration = parseInt(actingPhases[s])-tempPhase + (parseInt(actingPhases[s+1]) - parseInt(actingPhases[s]));
                oAttacker.set("status_black-flag", true);
            }
                
            oAttacker.set("status_ninja-mask", dodgeDuration);

            sendChat("GM", whisper + oAttacker.get("name") + " dodging!")
            return -1;
        }
    }

    if(aimed!="") // Attacker aimed a specific location
    {
      locHit = parseInt(aimed);
      aimedMod = aLocsModifier[locHit][0];
      locImg = aLocsModifier[locHit][1];
    }

    var whichOCV = "ocv";
    var whichDCV = "dcv";
    
    if(isNaN(attOCVMod)) attOCVMod = 0;
    if(isNaN(defDCVMod)) defDCVMod = 0;

    if(numdice.indexOf(".") !== -1) { halfdie = true; numdice = numdice.replace(".", ""); }
    if(numdice.indexOf("+") !== -1 && damType == "k") { pip = 1; numdice = numdice.replace("+", "");}
    if(numdice.indexOf("-") !== -1 && damType == "k") { pip = -1; numdice = numdice.replace("-", "");}
    nd = parseInt(numdice);
    var formula = nd + pip;
    damageRoll = "/roll " + nd + pip;
    if(damType == "p") {nDef = defPD; rDef = defRPD;}
    else{ nDef = defED; rDef = defRED; }

    oAttacker.set("status_archery-target", true); // Set the attacker as "acted"
    if(oAttacker.get("status_ninja-mask")) // Character was dodging, delete temp modifiers
    {
        oAttacker.set("status_ninja-mask", false);
        var otempChar = getObj("character", oAttacker.get("represents"));
        var oTempAttr = findObjs({name: "tempDCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
        oTempAttr.set("current", 0);
    }
   // Compute the to-hit roll
   if(!los)
   {
    if(attRangeMod>0){ attRangeMod -= (attTRange + weaponRange); }

    if(attRangeMod<0){ attRangeMod = 0; }
   }
   else if(los)
    attRangeMod = 0;

   if((!noRange && !dodge) || psi) // DCV bonus from maneuvers applies only against melee attacks, unless dodging against ranged attacks
    defTDCV = 0;
   
   if(psi)
   {
    whichOCV = "omcv";
    whichDCV = "dmcv";
    var otempChar = getObj("character", oAttacker.get("represents"));
    var oTempObj = findObjs({name: "OMCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
    var OMCV = parseInt(oTempObj.get("current"));
    var otempChar = getObj("character", oDefender.get("represents"));
    var oTempObj = findObjs({name: "DMCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
    var DMCV = parseInt(oTempObj.get("current"));
    attOCV = OMCV;
    defDCV = DMCV;
    defTDCV = 0;
   }
   
   attOCVMod = checkMods(oAttacker, whichOCV); // Check for any special OCV modifier for attacker
   defDCVMod = checkMods(oDefender, whichDCV); // Check for any special DCV modifier for defender
 
   if(oDefender.get("status_bolt-shield")) // blocking - check for block success prior to roll for hitting
   {
        var otempChar = getObj("character", oDefender.get("represents"));
        var oTempObj = findObjs({name: "OCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
        var defOCV = parseInt(oTempObj.get("current"));
        oTempObj = findObjs({name: "tempOCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
        var defTOCV = parseInt(oTempObj.get("current"));
        oTempObj.set("current", parseInt(defTOCV-2));
        var defTempMod = parseInt(oCombatHelper[0].get("bar2_value")); // Use the blue bar on combathelper to add an optional bonus/malus to the block
        if(isNaN(defTempMod))
            defTempMod = 0;

        var blockValue = 11 + defOCV + defTOCV + defTempMod + aimedMod - parseInt(attOCV) - attTOCV - parseInt(attMod) - weaponOCV - attOCVMod;
        rolledDice = randomInteger(6) + randomInteger(6) + randomInteger(6);
        
        if(rolledDice != 18 && (rolledDice <= blockValue || rolledDice == 3)) // Blocked
        {
            sendChat("GM", whisper + oDefender.get("name") + " blocks the attack!");
            return 0;
        }
        else
        {
            oDefender.set("status_bolt-shield", false);
            var otempChar = getObj("character", oDefender.get("represents"));
            var oTempAttr = findObjs({name: "tempOCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
            oTempAttr.set("current", 0);
            oTempAttr = findObjs({name: "tempDCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
            oTempAttr.set("current", 0);
            sendChat("GM", whisper + oDefender.get("name") + " fails to block the attack!");
        }

   } 
   var weaponDef = 0;
   if(noRange) // checks if the weapon(s) equipped by the target have defence bonuses, valid only for melee
   {
       var weapon = unwrapString("mainhand", "|" , oAttacker, "");
       var aWeapon = weapon.uArray;

       if(aWeapon.length > 0)
        {
            for(var i=0;i<aWeapon.length;i++){
                if(aWeapon[i].indexOf("wd") !== -1){ weaponDef = parseInt(aWeapon[i].replace("wd", "")); }
            }
        }
        weapon = unwrapString("offhand", "|" , oAttacker, "");
        aWeapon = weapon.uArray;
        if(aWeapon.length > 0)
        {
            for(var i=0;i<aWeapon.length;i++){
                if(aWeapon[i].indexOf("wd") !== -1){ weaponDef += parseInt(aWeapon[i].replace("wd", "")); }
            }
            weaponDef += 1; // Off hand weapong gives a +1 on block in any case
        }
        else
        {
            weaponDef += shield; // If not weapon is equipped in offhand then use the shield bonus, if any
        }
    }

   var totdefence = parseInt(defDCV) + defTDCV + aimedMod + defDCVMod + weaponDef;

   if((oDefender.get("status_fishing-net") && !psi) || oDefender.get("status_pummeled") || oDefender.get("status_dead")) // Target is Entangled or deeply stunned/unconscious.
   {
      if(distance<2)
        totdefence = 0;
      else
        totdefence = 3;
      if(oDefender.get("status_dead"))
        aimedMod = Math.round(aimedMod/2);
   }
   if(oDefender.get("status_sleepy")) // Target is stunned - half dcv.
   {
      totdefence = Math.round(totdefence/2);
      if(totdefence<3)
        totdefence = 3;
   } 
   
   if(halfDCV) // If half DCV (because of effects or maneuvers) we compute the total malus needed to bring the character's DCV to half its value and store it in tempDCV, so it will last until character's next phase
   {
        totdefence = parseInt(totdefence/2) - defTDCV;
        var otempChar = getObj("character", oAttacker.get("represents"));
        var otempAttrib = findObjs({name: "tempDCV",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
        otempAttrib.set("current", totdefence);
   }

   if(totdefence<3 && !noRange)
        totdefence = 3;
   // targetValue = 11 + parseInt(attOCV) + attTOCV + parseInt(attMod) + weaponOCV + attOCVMod - parseInt(attRangeMod) - parseInt(defDCV) - defTDCV - parseInt(attTDC) - aimedMod - defDCVMod - weaponDef - shield;
   targetValue = 11 + parseInt(attOCV) + attTOCV + parseInt(attMod) + parseInt(attTDC) + weaponOCV + attOCVMod - totdefence;
   //log(targetValue);
   // STR minimum, if any
   if(strMin > 0)
   {
        var otempChar = getObj("character", oAttacker.get("represents"));
        var oSTR = findObjs({name: "STR",_type: "attribute", _characterid: otempChar.id}, {caseInsensitive: true})[0];
        var charSTR = parseInt(oSTR.get('current'));
        var strDiff = strMin - charSTR;
        if(strDiff>0)
        {
          strDiff = strDiff/5;
          strMinMalus = parseInt(strDiff);
          if(strDiff > 0 && strDiff < 1)
              strMinMalus = 1;
          targetValue -= strMinMalus;
          endCost += strMinMalus;
        }
        else
        {
          if(noRange)
          {
            strDiff = (strDiff*-1)/5;
            strDamMod = parseInt(strDiff);
            endCost += strDamMod;
          }
        
        }
   }

   if(manualroll>0)
    {
       if(manualroll<3)
            manualroll = 3;
       if(manualroll>18)
            manualroll = 18;
       rolledDice = manualroll;
    }
   else
        rolledDice = randomInteger(6) + randomInteger(6) + randomInteger(6);
   if((rolledDice<=targetValue || rolledDice == 3) && rolledDice != 18) { 
       isHit = 1;
       if(AF<=1){ // If single shot there is chance it is a critical hit
            if(rolledDice<=parseInt(targetValue/2) && enableCrits && !noCrits) {
                isCrit = true;
            }
        } else { // If the weapon is on AutoFire compute how many shots hit, but no critical chance
            isHit = parseInt((targetValue-rolledDice)/2)+1;
            if(isHit>AF) {isHit = AF;}
        }
   }
   // sends GM the stats used for the roll, just in case
   gmLog = "<br/>Number of dice: " + nd;
   gmLog += "<br/>Killing or Normal " + damNK;
   gmLog += "<br/>Physical or Energy: " + damType;
   gmLog += "<br/>Custom mod inputed: " + attMod;
   gmLog += "<br/>Distance: " + distance;
   gmLog += "<br/>Weapon OCV mod: " + weaponOCV;
   gmLog += "<br/>Weapon range mod: " + weaponRange;
   gmLog += "<br/>AutoFire: " + AF;
   //gmLog += "<br/>Penetrating: " + Penetrating;

   return isHit;
}

/* Look-up tables */
var distanceMod = new Array();
distanceMod = [8,12,16,24,32,48,64,96,128,172,256,384,512,768,1024,1536,2048,3072,4096,10000]; // The index value represents the malus
// Definitions for normal damage dice
    var herodieBody = new Array();
    var halfdieBody = new Array();
    var halfdieStun = new Array();
    herodieBody = ['','0','1','1','1','1','2'];
    halfdieBody = ['','0','0','0','1','1','1'];
    halfdieStun = ['','1','1','2','2','3','3'];
    
// Locations Damage Multipliers
    var damNStun = new Array();
    var damKStun = new Array();
    var damBody = new Array();
    damNStun = [2,0.5,0.5,1,1,1.5,1.5,1,0.5,0.5];
    damKStun = [5,1,2,3,3,4,4,2,2,1];
    damBody = [2,0.5,0.5,1,1,1,2,1,0.5,0.5];

// Weapon degradation for Killing Damage weapons (on normal damage it just decreases by 1 die the damage of the weapon)
    var dmgClasses = new Array();
    dmgClasses = ["0+","0.","1","1+","1.","2","2+","2.","3","3+","3.","4","4+","4.","5","5+","5.","6","6+","6.","7","7+","7.","8","8+","8.","9","9+","9.","10"];

// Modifier to hit for body locations
    var aLocsModifier = new Array();
// Copy-paste from the API output console after having created the "locs" rollable table and having issued the "!tableread" command
// FROM HERE:
    aLocsModifier[0] = [8,"https://s3.amazonaws.com/files.staging.d20.io/images/150503/Rl95xiAD4-fJ5Y8d6jDieg/med.gif?1384730029"];
    aLocsModifier[1] = [6,"https://s3.amazonaws.com/files.staging.d20.io/images/150504/JI4_dVJDiVsKxCZ80_Gt0g/med.gif?1384730043"];
    aLocsModifier[2] = [5,"https://s3.amazonaws.com/files.staging.d20.io/images/150505/sp_lWTQ4NwV9elbMSdZxrg/med.gif?1384730054"];
    aLocsModifier[3] = [5,"https://s3.amazonaws.com/files.staging.d20.io/images/150506/apdCQfPKyG73lVbpfo3eMg/med.gif?1384730065"];
    aLocsModifier[4] = [3,"https://s3.amazonaws.com/files.staging.d20.io/images/150507/dTrGG5X3y7TfapsgnDqVjA/med.gif?1384730076"];
    aLocsModifier[5] = [7,"https://s3.amazonaws.com/files.staging.d20.io/images/150508/XPHuTpfmREF_7JFIZoJCEw/med.gif?1384730086"];
    aLocsModifier[6] = [8,"https://s3.amazonaws.com/files.staging.d20.io/images/150510/Y2WntlS3msebP8EO252s3w/med.gif?1384730098"];
    aLocsModifier[7] = [4,"https://s3.amazonaws.com/files.staging.d20.io/images/150511/VUGwLYlG2RCiMhDetC6RoQ/med.gif?1384730112"];
    aLocsModifier[8] = [6,"https://s3.amazonaws.com/files.staging.d20.io/images/150512/k6IL6s3eBsx-nkITcPKSkA/med.gif?1384730121"];
    aLocsModifier[9] = [8,"https://s3.amazonaws.com/files.staging.d20.io/images/150513/2S0X60TcHRqMkJHS24S48A/med.gif?1384730133"];
// TO HERE    
    var enableCrits = true; // Put it to false to disable critical hits altogether
    var endCost = 1;
    var attTOCV = 0;
    var attTDCV = 0;
    var attTRange = 0;
    var locationRolled;
    var locImg;
    var locHit;
    var armorTable;
    var locationHit;
    var armorPart;
    var resilience;
    var attRangeMod = 0;
    var AP = 0;
    var Penetrating = 0;
    var noRange = false;
    var weaponRange = 0;
    var weaponOCV = 0;
    var weaponDCV = 0;
    var stunOnly = false;
    var reach = 2;
    var strMin = 0;
    var aimed = "";
    var aimedMod = 0;
    var noStun = false;
    var noBleed = false;
    var noHitLocs = false;
    var strMin = 0;
    var strMinMalus = 0;
    var oAttacker;
    var oDefender;
    var oCombatHelper;
    var numdice;
    var damType;
    var damNK;
    var currAmmo;
    var maxAmmo;
    var numOptions;
    var wName;
    var attName;
    var attOCV;
    var attTDC; // used as various defender DCV modifiers, if any, taken from combathelper bar3 token;
    var defName;
    var defDCV;
    var defPD;
    var defED;
    var defRPD
    var defRED;
    var defTDCV;
    var attMod;
    var distance;
    var hits = new Array();
    var isHit = 0;
    var isCrit = false;
    var herodice = "";
    var totBody = 0;
    var totStun = 0;
    var halfdie = false;
    var pip = 0;
    var nd = 0;
    var gmLog;
    var damMultiplier = 1; // normal damage multiplier, needed in case of damage reduction powers or effects, that reduce the multiplier
    var rolledDice
    var strDamMod;
    var spellroll;
    var spellString;
    var attOCVMod;
    var defDCVMod;
    var los;
    var psi;
    var nohitroll;
    var typeofReduction;
    var selfOnly;
    var StunX;
    var abort;
    var dodge;
    var defWeaponOCV;
    var shield;
    var halfDCV;
    var wEffect = new Array();
    var effVar = new Array();
    var effOnHit = new Array();
    var effSelf = new Array();
    var effChance = new Array();
    var AF;
    var noCrits;
    var applySpellEffect;
    var spellRollSkill;
    var manualroll;

on("chat:message", function(msg) {
  if(msg.type == "api" && msg.content.indexOf("!heroHit") !== -1) {
     var stringa = msg.content.replace("!heroHit ", "");

    //log("stringa: "+stringa);
    //return;
    isHit = hitRoll(stringa);
    
    if((nohitroll || (oAttacker.id == oDefender.id)) && isHit != -1)
        isHit = 1;
   
   if(isHit > 0){
        var separator = "<div align='center'>===================</div>";
        if(spellString != "") // Effect spell
        {
          if(spellString.indexOf("sustained")>=0)
            insertEffect(oDefender, spellString, oAttacker.id, endCost);
          else
            insertEffect(oDefender, spellString, "", "");
            //PowerCard("--emote|" + attName + " hits " + defName + " --name|Power");
          sendChat("combat", "/direct " + separator + attName + " hits " + defName +" (rolled " + rolledDice + ")");
          updateAttacker(oAttacker, true);
        }
        else
        {
          var chatHits = " <b>" + isHit + "</b> times!";
          if(isHit==1) {chatHits = "!";}
          //PowerCard("--emote|" + attName + " hits " + defName + " --name|Attack");
          sendChat("combat", "/direct " + separator + attName + " hits " + defName + chatHits + " (rolled " + rolledDice + ")");
          //log("isHit: " + isHit);
          for(var shots = 0; shots < isHit; shots++)
          {

              if(aimed == "") // In case attacker didn't aim for a specific body location
              {
                
                sendChat(attName, "/roll 1t[locs]", function(ops) {
                  var rollresult = JSON.parse(ops[0].content);
                  var loc = rollresult.rolls[0].results[0];
                  tableParts = loc.tableItem.name.split(";");
                  locImg = loc.tableItem.avatar;
                  locHit = parseInt(tableParts[0]);
                  computeDamage(shots);
                });
              }
              else
              {
                computeDamage(shots);
              }
                
// ------------------------>
          }
        }
       hits.length = 0;
       
   }
   else if(isHit == 0){ // MISS ---------------------------------
        sendChat("combat", whisper + attName + " misses " + defName + "! (rolled " + rolledDice + ")");
        // Applies the End expended
        updateAttacker(oAttacker, false);
   }
   else if(isHit == "fizzle")
    {
      sendChat("GM", whisper + attName + " Your spell casting fails!");
      updateAttacker(oAttacker, false);
      return;
    }
   else{
      if(spellroll != "")
        {
            sendChat("GM", whisper + attName + " You successfully cast your spell!");
        }
        updateAttacker(oAttacker, false);
      return;
   }

   // Tells the numbers to the GM
   if(gmLogShow)
    sendChat("script", "/w gm " + attName + " rolled " + rolledDice + " on target roll of " + targetValue + gmLog);

  }
});

on('chat:message', function(msg) {
    var command = msg.content.toLowerCase();
    if (msg.type == "api" && command.indexOf("!reload") >= 0){
      var weap = command.split(" ").pop();
      if(weap == "!reload")
      {
        sendChat("Script", "/w GM You forgot to tell me which weapon to reload.");
        return;
      } else
      {
        var weapon = weap.split("|");
        var selected = msg.selected;
        _.each(selected, function(obj) {
         
          if(obj._type != 'graphic') return;
          var token = getObj("graphic", obj._id);
          var gmnotes = decodeURI(token.get('gmnotes'));
          //log(gmnotes);
          var startPos = decodeURI(gmnotes).indexOf("{"+weapon[0]+"}");
          if(startPos < 0){
              sendChat("Reload script","/w GM no <b>" + weapon[0] + "</b> present for " + token.get("name") + "!");
              return;
          }
          var endPos = decodeURI(gmnotes).indexOf("{/"+weapon[0]+"}");
          if(endPos < 0){
              sendChat("Reload script","/w GM There is a problem with '" + weapon[0] + " in token " + token.get("name") + "'s gmnotes!");
              return;
          }
          var trail = weapon[0].length+3;
          var weaponString = decodeURI(gmnotes).substr(startPos, (endPos-startPos)+trail);
          var aAmmo = weaponString.split("|");
          if(weapon[1] == "max")
            aAmmo[4] = aAmmo[5];
          else
            if(parseInt(weapon[1]) > aAmmo[5])
              aAmmo[4] = aAmmo[5];
            else
              aAmmo[4] = parseInt(weapon[1]);
          var newWeaponString = "";

          for(var rs=0; rs<aAmmo.length;rs++)
          {
              newWeaponString += aAmmo[rs] + "/";
          }
          newWeaponString = newWeaponString.substring(0,newWeaponString.length-1);
          gmnotes = gmnotes.replace(weaponString, newWeaponString);
          token.set('gmnotes', gmnotes);
          token.set("status_spanner", false);
      });    
      }
          
    }
});