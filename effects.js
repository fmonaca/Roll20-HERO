// {effect}[id]|[type:n[fixed/dice]]|[attribute]|[defence]|[frequency(type)][duration(number and type)][counter(0)][active][description][marker]{/effect}

// id                                     															a numeric, unique id - It is auto-generated when the Effect is applied by the macro
// dam:n[d/f]|aid:n[d/f]|fla:n[d]|ent:n[d]															dam = damage (can also be used as a drain), aid = aid, fla = flash (not implemented yet), ent = entangle,
// 																									n = number of dice | fixed value of effect, I.e. 3 dice of damage is dam:3d
//																									Special: if dam is set to 0 fixed, it means the attribute(s) is zeroed, if it is set to -1 fixed, the attribute(s) is halved - i.e. dam:0f, dam:-1f
// normal|killing|body|stun|str|dex|con|int|ego|pre|run|ocv|dcv|omcv|dmcv|end|pd|ed|rec|spd	 		stat affected, can be more than one separated by "/". Type and hasDef are then common to all attributes in the list, though.
// hasdef:[pd][ed][rpd][red][powerdef][flashdef][mentaldef][no]										if the effect can be mitigated by an appropriate defense, use "no" in case no defence applies
// freq:[o][s][p][t][m][h][d][w]																	frequency of occurrence once every: once|segment|phase|turn|minute|hour|day|week
// duration:n[s][t][m][h][d]																		duration of effect, number of: segments|turns|minutes|hours|days - it is always expressed in phases in the string, but the script handles the conversion
// counter:n		   																				counter of how many times the effect was applied, or "ticked" - the script controls it, leave it at 0 when you create a new spell
// on|off																							on = effect active | off = effect inactive (expired or deactivated)
// desc:[]																							description of the effect, string, appears in the chat
// marker:[name]|nostatus																			any of the markers like blue or net, etc. Use "nostatus" if no status icon is needed/wanted

// sustained 																						OPTIONAL = In case a spell needs End to be maintained. In this case it will consume the End amount every duration period until it is put to "off" 																						
// heal 																							OPTIONAL = For healing spells, it avoids the aid value to go over the max amount of the affected attribute
// def[n] 																							OPTIONAL = def used for Entangle spells (pd/ed to overcome to damage the body of the entangle), n is the value.
// tra:[attrib]/[...] 																				OPTIONAL = For Transfer effects, the caster attribute(s) where the drained amount goes. If more than one, the amount is divided equally before considering the attribute cost
// casterid:[id]																					OPTIONAL = in case of sustained spells it is the id of the source token - automatically addedd by the script
// end:[n]																							OPTIONAL = in case of sustained spells it is the end cost applied to the caster every "duration" - automatically added by the script

// Note: For Drains (usually everything having the stat affected anything other than BODY or Stun), the Frequency has to be set to "o" (one-off) and the duration represents the time needed to have a recovery.
// For example, a STR drain of 2d6, with recovery once per minute (with power defense applying), would be: {effect}dice:2|str|hasdef:powerdef|freq:o|duration:1m|counter:0|on|desc:weakening poison|back-pain{/effect}
// Note2: Only Frequency up to minutes is taken into account during combat. It is in fact impossible that a combat will go into the realm of, say, hours.
// For Entangle Freq has to be set to "o", duration is whatever value you want the spell to last (until broken earlier). The stat affected is the stat used to breal free from it (typically STR), the status MUST BE fishing-net.
//
// Examples (to be put under Abilities with title = [nameofthespell] (and the macro in gmnotes must have the same name):
//
// [paralysis]
// {effect}ent:2d|ego|hasdef:no|freq:p|duration:5m|counter:0|on|desc:Paralysis|fishing-net|def2{/effect}
// [entangle]
// {effect}ent:2d|str|hasdef:powdef|freq:p|duration:5m|counter:0|on|desc:Entangle|fishing-net|def2{/effect}
// [poison]
// {effect}dam:3d|normal|hasdef:pd|freq:t|duration:100d|counter:0|on|desc:Poison|green{/effect}
// [holymight]
// {effect}aid:10f|str|hasdef:no|freq:o|duration:10m|counter:0|on|desc:Holy Might|strong|sustained{/effect}
// [regeneration]
// {effect}0|aid:1f|body|hasdef:no|freq:t|duration:100d|counter:0|on|desc:Regeneration|blue|heal{/effect}
// [healing]
// {effect}aid:3d|normal|hasdef:no|freq:o|duration:0s|counter:0|on|desc:Healing Hands|nostatus|heal{/effect}
// [energyarmor]
// {effect}aid:8f|rpd/red|hasdef:no|freq:o|duration:5m|counter:0|on|desc:Armor of Energy|aura|sustained{/effect}
//
// The corresponding strings in token's gmnotes would be:
//
// {paralysis}0|spellroll-4|end4|los|psi{/paralysis}
// {entangle}0|spellroll-3|end3{/entangle}
// {poison}0|nohitroll{/poison}    // in case of an environmental posison, that is.
// {holymight}0|spellroll-1|end1|self{/holymight}
// {effect}0|aid:1f|body|hasdef:no|freq:t|duration:100d|counter:0|on|desc:Racial Regeneration|green|heal{/effect}   //  for a racial regeneration of 1 Body/turn, the effect string has to be put directly in the gmnotes instead
//  																												    of the weapon string, and there is no need to have an ability "spell", since it is an ability "always on" when
//																														combat starts
// {healing}0|spellroll-3|end3{/healing}
// {energyarmor}0|end2|self{/energyarmor}
//
// A transfer spell in HERO 6 is a compound power that includes a drain to the target and an aid to the caster.
// It would be like this:
// String in token's Gmnotes: {transfer}0|end4|spellroll-4|effect:aid|effself:1|effvar1{/transfer}
// In character's journal you would need 2 "spells": [transfer] with this content: {effect}dam:3d|body|hasdef:powerdef|freq:o|duration:1t|counter:0|on|desc:Drain|blue{/effect}
// and [aid] with this content: {effect}aid:[amount]f|body|hasdef:no|freq:o|duration:0s|counter:0|on|desc:Transfer|nostatus|heal{/effect}

var effects = new Array();
var attributeCost = [[1,"str"], [2,"dex"], [1,"con"], [1,"ego"], [1,"pre"], [1,"int"], [1,"run"], [5,"ocv"], [5,"dcv"], [3,"omcv"], [3,"dmcv"], [0.2,"end"], [1,"pd"], [1,"ed"], [1,"rec"],[10,"spd"], [1,"rpd"], [1,"red"], [1,"body"], [0.5,"stun"]];
var entangle = new Array();

function entangleEffect(obj, effectString)
{ // Create an array storing the details of the Entangle: 0 = tokenNum (in aChars array), 1 = def, 2 = body, 3 = stat used to escape
	var oObj = obj;
	var aString = effectString;
	var entSize = entangle.length;
	entangle[entSize] = new Array(4);
	var oCharacter = getObj("character", oObj.get("represents"));
	
	if(aChars.length>0) // If in combat
	{
		for(var n=0;n<aChars.length;n++) // find the token n. into the aChar array
		{
			if(aChars[n][0] == oObj.id)
			{
				entangle[entSize][0] = n;
				break;
			}
		}
	}
	
	if(aString.length>10) // Look for the def value, it is in the form of 'defn', where n is the value
	{	
		var defFound = false;
		for(var i=10;i<aString.length;i++)
		{
			if(aString[i].indexOf("def")>=0)
			{
				entangle[entSize][1] = parseInt(aString[i].replace("def","")); // Def of the Entangle
				defFound = true;
				break;
			}
		}
	}
	if(!defFound){ sendChat("script", "/w gm Error: there is no 'def' parameter in Entangle spell!"); return -1;}
	var entDice = aString[1].replace("ent:","");
	entDice = entDice.replace("d","");
	var bodyRolled = 0;
	for(var i=0; i<entDice; i++)  // Body of Entangle
	{
		bodyRolled += parseInt(herodieBody[randomInteger(6)]); 
	}
	entangle[entSize][2] = bodyRolled;
	entangle[entSize][3] = aString[2]; // STR or EGO (or whatever)
	
	var oStat = findObjs({name: aString[2],_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
	var Stat = parseInt(oStat.get('current'));
	Stat -= 5; // For target casual attribute used to check if he/she srhugs off the Entangle as a 0-phase action
	var diceStat = Stat/5;
	var difference = diceStat - parseInt(diceStat);
	diceStat = parseInt(diceStat);
	var halfDie = 0;
	var rolledStat = 0;
	if(difference>0.4)
		halfDie = parseInt(halfdieBody[randomInteger(6)]);
	for(var i=0; i<diceStat; i++)  // Body done to the Entangle
	{
		rolledStat += parseInt(herodieBody[randomInteger(6)]); 
	}
	rolledStat += halfDie;
	rolledStat -= entangle[entSize][1];
	if(rolledStat<0)
		rolledStat = 0;
	if(rolledStat>0)
		entangle[entSize][2] -= rolledStat;
	if(entangle[entSize][2]<=0)
	{
		var entChat = " shrugs the Entangle off!";
		sendChat("GM", whisper + oObj.get("name") + entChat);
		entangle.splice(entSize,1);
		return -1;
	}
	else
	{
		var entChat = " is Entangled!";
		sendChat("GM", whisper + oObj.get("name") + entChat);
	}
	return 0;
}

function spawnCharacter(tokenID) // Check if more tokens are linked to the same character
{
    var oToken = getObj("graphic", tokenID);
    var tokenName = oToken.get("name");
    var sheetID = oToken.get("represents");
        
    var haveDuplicate = false;
    for(var n=0; n<aChars.length; n++)
    {
        if(aChars[n][0]!=tokenID) // Skip the token we are checking
        {
            var tempToken = getObj("graphic", aChars[n][0]);
            if(tempToken.get("represents") == sheetID)
            {
            	haveDuplicate = true;
            	break;
            } // We have at least another token using the same character sheet, we need to duplicate the sheet and assign it to the token
                
        }
    }
 
    if(haveDuplicate)
    {
    	var Character = getObj("character", sheetID);
    	var Attributes = findObjs({ _type: 'attribute', _characterid: Character.id });
	    var Abilities = findObjs({ _type: 'ability', _characterid: Character.id });
	    
	    var character = createObj('character', {
	        name: tokenName,
	        bio: Character.get("bio"),
	        gmnotes: Character.get("gmnotes"),
	        archived: Character.get("archived"),
	        inplayerjournals: Character.get("inplayerjournals"),
	        controlledby: Character.get("controlledby")
	    });
 
	    _.each(Attributes, function(attr) {
	        createObj('attribute', {
	            _characterid: character.id,
	            name: attr.get("name"),
	            current: attr.get("current"),
	            max: attr.get("max")
	        });
	    });
 
	    if(Abilities.length>0)
	    {
	      _.each(Abilities, function(abil) {
	          createObj('ability', {
	              _characterid: character.id,
	              name: abil.get("name"),
	              description: abil.get("description"),
	              action: abil.get("action")
	          });
	      });
	    }
		
	  // Now we need to assign the token to the newly created character sheet
	  oToken.set("represents", character.id);
	  sheetID = character.id; //<--  bugged - workaround inserted in initiative-2.0.js.
	}
	return sheetID;
}

function unwrapString(stringname, separator, obj, opt)
{
// Given a Token object, it returns an array created from a "stringname" entry in its gmnotes,
// where the entry has its contents separated by the "separator" character.
  // log(stringname);
  var oObj = obj[0];
  if( typeof oObj != "object")
        oObj = obj;
  var uArray = new Array();
  var uString = "";
  if(opt=="journal")
  {
  	//log("in journal");
  	var journalID = oObj.get("represents");
    var journal = getObj("character", journalID);
    var gmnotes = decodeURI(journal.get('gmnotes')); // ???Doesn't work???
  }
  else
  	var gmnotes = decodeURI(oObj.get('gmnotes'));
  //log(gmnotes);
  gmnotes = gmnotes.replace(/%3A/g, ':');
  gmnotes = gmnotes.replace(/%23/g, '#');
  if(opt=="" || opt=="journal")
  {
	  var startPos = gmnotes.indexOf("{" + stringname + "}");
	  if(startPos == -1)
	  	return { uString: "", uArray: uArray };
	  else
	  	var endPos = gmnotes.indexOf("{/" + stringname + "}");
  }
  else  // If != "" it is an effect, we need to find the effect ID
  {
  	  var regex = /{effect}/gi, result, indices = [];
	  while ( (result = regex.exec(gmnotes)) ) { // How many Effects on token?
    	indices.push(result.index);
      }
      if(indices.length==0)
    	return;
   	  for(var i=0;i<indices.length;i++)
   	  {
   	  	 var startPos = gmnotes.indexOf("{effect}", indices[i]);
		 var endPos = gmnotes.indexOf("{/effect}", indices[i]);
		 var effectString = gmnotes.substr(startPos+8, (endPos-startPos)-8);
		 var effectArray = effectString.split("|");
		 if(parseInt(effectArray[0])==parseInt(opt))
		 {
		 	break;
		 }
   	  }
  }
  return { uString: gmnotes.substr(startPos+stringname.length+2, (endPos-startPos)-(stringname.length+2)), uArray: gmnotes.substr(startPos+stringname.length+2, (endPos-startPos)-(stringname.length+2)).split(separator) };
}

function convertDuration(duration, frequency, charSPD) // convert Duration in how many times the Effect ticks, depending on Frequency
{
	var durInPhases = duration.replace("duration:", "");
	var freq = frequency.replace("freq:", "");
	var divider = 1;

	if(freq == "w")
		divider = 604800;

	if(freq == "d") 
		divider = 86400;

	if(freq == "h") 
		divider = 3600;

	if(freq == "m") 
		divider = 60;

	if(freq == "t") 
		divider = 12;

	if(freq == "p")
		divider = parseInt(12/charSPD);
	// duration is in absolute ticks, so for example if I have freq:p and duration:3t for a character with 4 SPD, it should
	// tick 4 times x turn, so 4x3t = 12 times. To obtain this value I have to divide 12 segments (1t) by the character SPD,
	// then divide the total segments of the duration (3t= 3*12 = 36 segments) by the value obtained (12/4 = 3). 36/3 = 12 ticks.
	// The "p" frequency is useful for effects that tick depending on a character's metabolism, and essential for Entangles, where
	// a character tries to break free only during the phases in which he/she acts.

	if(durInPhases.indexOf("d")!=-1)
	{
		durInPhases = parseInt(durInPhases.replace("d", ""));
		durInPhases = parseInt(durInPhases*86400); // seconds in a day
	}
	else if(durInPhases.indexOf("h")!=-1)
	{
		durInPhases = parseInt(durInPhases.replace("h", ""));
		durInPhases = parseInt(durInPhases*3600); // seconds in a hour
	}
	else if(durInPhases.indexOf("m")!=-1)
	{
		durInPhases = parseInt(durInPhases.replace("m", ""));
		durInPhases = parseInt(durInPhases*60); // seconds in a minute
	}
	else if(durInPhases.indexOf("t")!=-1)
	{
		durInPhases = parseInt(durInPhases.replace("t", ""));
		durInPhases = parseInt(durInPhases*12); // seconds in a turn
	}
	else if(durInPhases.indexOf("s")!=-1)
	{
		durInPhases = parseInt(durInPhases.replace("p", ""));
		durInPhases = parseInt(durInPhases);		
	}
	durInPhases /= divider;
	if(parseInt(durInPhases)<=0)
		durInPhases = 1;
	return parseInt(durInPhases);
}

function loadEffects(tokenObject, counter) // Load all existing Effects at the beginning of combat
{
	var oObj = tokenObject[0];
  	if( typeof oObj != "object")
        oObj = tokenObject;
    var gmnotes = decodeURI(oObj.get('gmnotes'));
	var aEffects = new Array();
	var regex = /{effect}/gi, result, indices = [];
	while ( (result = regex.exec(gmnotes)) ) { // Load the positions of every Effect string already into gmnotes
    	indices.push(result.index);
    }

	for(var n=0; n<indices.length; n++)
	{
		var startPos = indices[n];
		if(startPos == -1)
		{
			break;
		}
		var endPos = decodeURI(gmnotes).indexOf("{/effect}",startPos);
		var oCharacter = getObj("character", oObj.get("represents"));        
        var oSPD = findObjs({name: "SPD",_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
		var SPD = parseInt(oSPD.get('current'));
		var effect = decodeURI(gmnotes).substr(startPos+8, (endPos-startPos)-8);
		effect = effect.replace(/%3A/g, ':');
		aEffects = effect.split("|");
		var numParams = aEffects.length;

		if(aEffects[7] == "on" && aEffects[4].substr(aEffects[4].length-1) != "h" && aEffects[4].substr(aEffects[4].length-1) != "d" && aEffects[4].substr(aEffects[4].length-1) != "w")
		{
			aEffects[5] = convertDuration(aEffects[5], aEffects[4], SPD);
			aChars[counter][4] = new Array();
			aChars[counter][4][aEffects[0]] = new Array(numParams);
			aChars[counter][4][aEffects[0]][0] = aEffects[0];
			aChars[counter][4][aEffects[0]][1] = aEffects[1];
			aChars[counter][4][aEffects[0]][2] = aEffects[2];
			aChars[counter][4][aEffects[0]][3] = aEffects[3];
			aChars[counter][4][aEffects[0]][4] = aEffects[4];
			aChars[counter][4][aEffects[0]][5] = aEffects[5];
			aChars[counter][4][aEffects[0]][6] = aEffects[6];
			aChars[counter][4][aEffects[0]][7] = aEffects[7];
			aChars[counter][4][aEffects[0]][8] = aEffects[8];
			aChars[counter][4][aEffects[0]][9] = aEffects[9];
			if(numParams>10) // 
			{
				for(var i=10;i<numParams;i++)
				{
					aChars[counter][4][aEffects[0]][i] = aEffects[i];
				}
			}
			if(aEffects[1].indexOf("ent:")>=0) // Entangle needs to be inserted because it needs another array to be filled in
				entangleEffect(oObj, aEffects);
			if(aEffects[9]!="nostatus")
				oObj.set("status_"+aEffects[9], true);
			//oObj.set('gmnotes', gmnotes.replace("{effect}"+effect+"{/effect}", "")) // Delete effect from gmnotes
		}
	}
}

function insertEffect(tokenObject, effectString, casterID, endcost)
{
	// Insert a new Effect into a token's gmnotes and if combat has begun, into the corresponding aChar array
    var oObj = tokenObject[0];
      if( typeof oObj != "object")
    oObj = tokenObject;
	var oCharacter = getObj("character", oObj.get("represents")); 
    var gmnotes = decodeURI(oObj.get('gmnotes'));
	var regex = /{effect}/gi, result, indices = [];
	while ( (result = regex.exec(gmnotes)) ) { // How many Effects already on token?
    	indices.push(result.index);
    }
    effectString = effectString.replace("{effect}", "{effect}"+indices.length+"|");
    var newEffectString = effectString.replace(/%3A/g, ':');
	
	effectString = effectString.replace("{effect}","").replace("{/effect}","");
    var aString = effectString.split("|");
	
	if(newEffectString.indexOf("ent:")>=0) // We have an Entangle spell
	{ 
		var entEff = entangleEffect(oObj, aString);
		if(entEff==-1)
			return;
	}
   
    // casterID and endcost are always the last 2 arguments, if any
    if(casterID != "")
    {
    	aString.push(casterID);
    	newEffectString = newEffectString.replace("{/effect}", "|"+casterID+"{/effect}");
    }
    if(endcost != "")
    {
    	aString.push(endcost);
    	newEffectString = newEffectString.replace("{/effect}", "|"+endcost+"{/effect}");
    }

    oObj.set("gmnotes", gmnotes+newEffectString);
           
    var oSPD = findObjs({name: "SPD",_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
	var SPD = parseInt(oSPD.get('current'));
    var dur = convertDuration(aString[5], aString[4], SPD);
    aString.splice(5, 1, dur);

    // If in combat, puts the Effect into the aChars array
    if(aChars.length>0)
    {
    	for(var n=0;n<aChars.length;n++)
	    {
	    	if(aChars[n][0]==oObj.id) // Found the index corresponding to the token id
	    	{
	    		var indice = aChars[n][4].length;
	    		if(indice == undefined)
	    		{
	    			indice = 0;
	    		}
	    		aChars[n][4] = new Array;
	    		aChars[n][4][indice] = new Array(aString.length);
	    		for(var i=0;i<aString.length;i++)
	    		{
	    			aChars[n][4][indice][i] = aString[i];
	    		}
	    		if(aString[9]!="nostatus")
	    			oObj.set("status_"+aString[9], true);
	    		checkEffect(aChars, n);
	    		break;
	    	}
	    }
    }
    
}

function checkEffect(charArray, counter) // Check Effects on token (each segment) - called from nextPhase() function
{
	if(aChars[counter][4] == undefined || aChars[counter][4] == "")
		return;

	for (var key=0;key<aChars[counter][4].length;key++)
	{
		if(aChars[counter][4][key]!=null && aChars[counter][4][key]!=undefined && aChars[counter][4][key]!="")
		{

			//if(aChars[counter][4][key][7]=="on") // If the Effects has been put to "off" ignore it
			//{
				var freq = aChars[counter][4][key][4].replace("freq:","");
				var dur = aChars[counter][4][key][5];
				var effCount = parseInt(aChars[counter][4][key][6].replace("counter:",""));
				var tempChat = "/w gm Effect "+aChars[counter][4][key][8].replace("desc:","")+" ends on [tokenname]."

				if(freq=="o") // Effect applies once (i.e. drain. aid or explosion)
				{
					effCount++;
					if(effCount==1)
					{
						applyEffect(aChars, counter, key);
						aChars[counter][4][key][6] = "counter:"+effCount;

					}
					else if(dur>=1) // Effect is a Drain or AID
					{
						aChars[counter][4][key][6] = "counter:"+effCount;
						if(effCount/dur==parseInt(effCount/dur)) // Recovery/loss or End cost
						{
							if(aChars[counter][4][key].length>10)
							{
								var sustained = false;
								for(var n=10;n<aChars[counter][4][key].length;n++)
								{
									if(aChars[counter][4][key][n] == "sustained")
									{
										var sustained = true;
										break;
									}
								}
								
							}
							if(sustained)
								sustainedEffect(counter, key); // End expense by caster in order to keep it on
							else
								recoveryAttribute(counter, key, 5); // recovery/loss of attribute
						}
							
					}
					else if(dur==0 && effCount >1 && aChars[counter][4][key][7]=="on") // Duration is one-off, put it off (i.e. a delayed blast)
					{
						updateEffect(counter, key, "delete", tempChat);
					}		
				}
				else if(freq=="s" && aChars[counter][4][key][7]=="on") // Effect applies every Segment (12 times each Turn)
				{
					effCount++;
					if(dur>=effCount)
					{
						applyEffect(aChars, counter, key);
						aChars[counter][4][key][6] = "counter:"+effCount;
					}
					else
					{
						updateEffect(counter, key, "off", tempChat);
					}
				}
				else if(freq=="p" && aChars[counter][4][key][7]=="on") // Effect applies only if character is acting during the current Phase
				{
					if(aSPDchart[aChars[counter][1]].indexOf(needle)>-1)
					{
						effCount++;
						if(dur>=effCount)
						{
							aChars[counter][4][key][6] = "counter:"+effCount;
							applyEffect(aChars, counter, key);
						}
							
						else
						{
							updateEffect(counter, key, "off", tempChat);
						}
					}
				}
				else if(freq=="t" && aChars[counter][4][key][7]=="on") // Effect applies once a Turn (at the end of Phase 12)
				{
					if(iTurn>1 && iii == 1)
					{
						effCount++;
						if(dur>=effCount)
						{
							applyEffect(aChars, counter, key);
							aChars[counter][4][key][6] = "counter:"+effCount;
						}
							
						else
						{
							updateEffect(counter, key, "off", tempChat);
						}
					}
						
				}
				else if(freq=="m" && aChars[counter][4][key][7]=="on") // Effect applies once a Minute
				{
					effCount++;
					if(parseInt(iTurn/5)>=effCount && dur>=effCount)
					{
						applyEffect(aChars, counter, key);;
						aChars[counter][4][key][6] = "counter:"+effCount;
					}
						
					else
					{
						updateEffect(counter, key, "off", tempChat);
					}
				}
			//}
		}
	}

}

function sustainedEffect(counter, key)
{
	if(aChars[counter][4][key][7]=="off") // Caster decided not to pay the End, spell goes off
		recoveryAttribute(counter, key, 100);
	else
	{

		var endCost = aChars[counter][4][key][aChars[counter][4][key].length-1];
		var charID = aChars[counter][4][key][aChars[counter][4][key].length-2];
		var oObj = getObj("graphic", charID);
		var casterName = oObj.get("name");
		var tempChat;
		if(oObj.get('status_dead')) // Caster is unconscious or dead, the sustained spell turns off
		{
			tempChat = whisper + casterName + " Your " + aChars[counter][4][key][8].replace("desc:","") + " spell goes off.";
			recoveryAttribute(counter, key, 100);
			updateEffect(counter, key, "delete", tempChat);
		}
		else
		{
			var casterEnd = parseInt(oObj.get('bar2_value'));
		    var casterStun = parseInt(oObj.get('bar1_value'));
		    var casterBody = parseInt(oObj.get('bar3_value'));
		    
		    if((casterEnd - endCost)<0)
		    {
		        // Use Stun instead of END
		        var diceEndStun = Math.round((casterEnd - endCost)/2);
		        if(diceEndStun<=0) diceEndStun = 1;
		        var damageEndStun = 0;
		        for(var nn=0; nn<diceEndStun; nn++)
		        {
		            damageEndStun += randomInteger(6);
		    	}

		    	if((casterStun-damageEndStun)<=0)
		        {
		            oObj.set('status_pummeled', true);
		            oObj.set('status_sleepy', false);
		            oObj('bar1_value', (casterStun-damageEndStun));
		            oObj.set('bar2_value', (casterStun-damageEndStun));
		            tempChat = whisper + casterName + " Your " + aChars[counter][4][key][8].replace("desc:","") + " spell goes off.";
		            recoveryAttribute(counter, key, 100);
					updateEffect(counter, key, "delete", tempChat);
		        }
		    	else
		    	{
		        	oObj.set('bar1_value', (casterStun-damageEndStun));
		        	oObj.set('bar2_value', 0);
		    	}
			}
		    else
		    {
		    	oObj.set('bar2_value', (casterEnd - endCost));
		    	tempChat = whisper + casterName + " You pay " + endCost + " END for your " + aChars[counter][4][key][8].replace("desc:","") + " spell.";
				updateEffect(counter, key, "tick", tempChat);
		    }
		}
	}
}

function recoveryAttribute(counter, key, quantity)
{
	
	if(quantity == undefined || quantity == "")
		var quant = 5;
	else
		var quant = quantity;

	var type = "dam";
	var chatbit1 = " recovers ";
	var chatbit2 = "";
	var chatbit3 = "";
	var ishealing = false;

	if(typeof counter == "object") // If called from out-of-combat we don't have the aChars array
	{
		var oObj = counter;
		var unwrapped = unwrapString("effect", "|", oObj, key);
		var effectparts = unwrapped.uArray;
		var stat = effectparts[2].split("/");
		var spellDesc = effectparts[8].replace("desc:","");
		if(effectparts[1].indexOf("aid")>=0)
		{
			type = "aid";
			var chatbit1 = " loses ";
			if(effectparts.length > 10)
				for(var i=10;i<effectparts.length;i++)
				{
					if(effectparts[i] == "heal") // Is healing, different text in chat
						ishealing = true;
						break;
				}
		}
		else if(effectparts[1].indexOf("ent")>=0)
		{
			type = "ent";
		}
	}
	else
	{
		var oObj = getObj("graphic", aChars[counter][0]);
		var stat = aChars[counter][4][key][2].split("/");
		var spellDesc = "</b>" + aChars[counter][4][key][8].replace("desc:","") + "</b>";
		if(aChars[counter][4][key][1].indexOf("aid")>=0)
		{
			type = "aid";
			var chatbit1 = " loses ";
			if(aChars[counter][4][key].length > 10)
				for(var i=10;i<aChars[counter][4][key].length;i++)
				{
					if(aChars[counter][4][key][i] == "heal") // Is healing, different text in chat
						ishealing = true;
						break;
				}
		}
		else if(aChars[counter][4][key][1].indexOf("ent")>=0)
		{
			type = "ent";
		}
	}
		
	var oCharacter = getObj("character", oObj.get("represents"));
	var turnitoff = true;

	for(var i=0;i<stat.length;i++)
	{
		var oStat = findObjs({name: stat[i],_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
		var current = parseInt(oStat.get('current'));
		var max = parseInt(oStat.get('max'));
		var chatBitQuant = quant;

		if(type == "aid")
		{
			current -= quant;
			if(current<max)
				current = max;
			if(current == max)
				chatBitQuant = "all";
			else
				turnitoff = false;
				
			chatbit2 += chatBitQuant + " " + stat[i] + ",";
		}
		else
		{
			current += quant;
			if(current>max)
				current = max;
			if(current == max)
				chatBitQuant = "all";
			else
				turnitoff = false;

			chatbit2 += chatBitQuant + " " + stat[i] + ",";
		}
		oStat.set('current', current);

		// If SPD and/or DEX are changed, modify the turnorder (if in combat)
		if((stat[i] == "dex" || stat[i] == "spd") && aChars.length>0)
		{
			if(stat[i] == "spd")
			{
				aChars[counter][1] = current;
			}
			if(stat[i] == "dex")
				aChars[counter][2] = current;

			aChars = aChars.sort(function(a,b) { // sorts characters by SPD and then DEX
	            if (a[1] < b[1]) return  1;
	            if (a[1] > b[1]) return -1;
	            if (a[2] < b[2]) return  1;
	            if (a[2] > b[2]) return -1;
	            return 0;
	        });
		}
	}
	
	chatbit2 = chatbit2.substr(0, chatbit2.length-1);
	
	if(turnitoff)
	{
		chatbit3 = " The effect ends.";
		if(quantity != 100) // If 100 means this function has been called from another function that will take care of the deletion
			updateEffect(counter, key, "delete", "");
	}
	if(type == "ent")
		var chat = oObj.get("name") + entChat;
	else
		if(ishealing)
			var chat =  spellDesc + " on " + oObj.get("name") + " ends.";
		else
			var chat = oObj.get("name") + chatbit1 + chatbit2 + " from " + spellDesc + "." + chatbit3;
	sendChat("Effect", "/w gm " + chat);
}

function applyEffect(arrayChar, charNum, effNum)
{
	// effectResult: 0 = effType, 1 = bodyDam, 2 = stunDam
	var oObj = getObj("graphic", arrayChar[charNum][0]);

	var effectResults = computeEffect(arrayChar[charNum], effNum);

	var effectDef = arrayChar[charNum][4][effNum][3];

	var targetStat = arrayChar[charNum][4][effNum][2].split("/");

	var healing = false;
	var noeffect = false;

	if(arrayChar[charNum][4][effNum].length > 10)
		for(var i=10;i<arrayChar[charNum][4][effNum].length;i++)
		{
			if(arrayChar[charNum][4][effNum][i] == "heal") // Is healing, do not go over the stat max
				healing = true;
				break;
		}

	var isDamage = false;
	var effectDesc =  arrayChar[charNum][4][effNum][8].replace("desc:","");
	var effTypeChat = "";
	var defences = 0;
	var oCharacter = getObj("character", oObj.get("represents"));
	
	if(effectDef!="hasdef:no") // Calculate defences against Effect, if any
	{
		effectDef = effectDef.replace("hasdef:","");
		var oDef = findObjs({name: effectDef,_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
		if(oDef != "")
			var defences = parseInt(oDef.get('current'));
		else
			var defences = 0;
		if(effectDef=="rpd" || effectDef=="red")
		{
			var tempDef = effectDef.substr(1);
			var oDef = findObjs({name: tempDef,_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
			defences += parseInt(oDef.get('current'));
			// Get armour def, if any (if Effect has rPD or rED as a valid defence it means it is an "external" effect, so armour applies)
			var armor = checkArmor(oObj);
			var armorPiece;
			var totArmorDef = 0;
			for(var n=0;n<armor.length;n++)
			{
				armorPiece = armor[n].split("|");
				if(effectDef == "rpd")
					totArmorDef += parseInt(armorPiece[1]);
				else
					totArmorDef += parseInt(armorPiece[2]);
			}
			defences += parseInt(totArmorDef/10);
		}
	}

	for(var i=0;i<targetStat.length;i++)
	{
		var effectResult = effectResults[i].split("|");

		var effectType = effectResult[0];
		var effectValue = parseInt(effectResult[1]);
		var effectStun = parseInt(effectResult[2]);
		// Apply defences
		effectValue -= defences;
		if(effectValue<0) effectValue = 0;
		effectStun -= defences;
		if(effectStun<0) effectStun = 0;

		if(effectType=="dam")
			if(targetStat[i] == "normal" || targetStat[i] == "killing")
				effTypeChat += effectValue+" BODY," + effectStun +" Stun ";
			else if(targetStat[i] == "body")
				effTypeChat += effectValue+" BODY,";
			else if(targetStat[i] == "stun")
				effTypeChat += effectStun+" Stun,";
			else
				effTypeChat += effectValue+" " + targetStat[i] + ",";
		else if(effectType=="aid")
			if(targetStat[i] == "normal")
				effTypeChat += effectValue+" BODY, " + effectStun +" Stun ";
			else
				if(targetStat[i]=="stun")
					effTypeChat += effectStun+" " + targetStat[i] + ",";
				else
					effTypeChat += effectValue+" " + targetStat[i] + ",";

		if(targetStat[i] == "normal" || targetStat[i] == "killing" || targetStat[i] == "body" || targetStat[i] == "stun")
			isDamage = true;
		
		if(isDamage)
		{
			var body = parseInt(oObj.get("bar3_value"));
			var maxbody = parseInt(oObj.get("bar3_max"));
			var stun = parseInt(oObj.get("bar1_value"));
			var maxstun = parseInt(oObj.get("bar1_max"));
			var end = parseInt(oObj.get("bar2_value"));
			var maxend = parseInt(oObj.get("bar2_max"));
			var oCon = findObjs({name: "CON",_type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
			var con = parseInt(oCon.get('current'));
			
			if(effectStun>0)
			{
				if(effectType == "dam")
					stun -= effectStun;
				else if(effectType == "aid")
					stun += effectStun;
				if(healing)
					if(stun>maxstun) {stun = maxstun; noeffect = true;}
				oObj.set("bar1_value", stun);
				if(stun<0)
				{
					oObj.set("bar2_value", stun);
					end = stun;
				}
				if(stun<-10) oObj.set("status_dead", true);
				else if(stun>-11 && stun <=0 && body >= 0) oObj.set("status_pummeled", true);
				else if(effectValue>con) oObj.set("status_sleepy", true);
			}
			if(effectType == "dam")
				body -= effectValue;
			else if(effectType == "aid")
				body += effectValue;
			if(healing)
			{	
				if(effectValue>=1)
					oObj.set("status_red", false); // Healing stops bleeding
				if(body>maxbody)
				{
					body = maxbody; noeffect = true;
				}
			}
			oObj.set("bar3_value", body);
			if(body<0)
			{
				oObj.set("status_dead", true);
				if(stun>0)
					oObj.set("bar1_value", 0);
				else
					oObj.set("bar1_value", stun);
				if(end>0)
					oObj.set("bar2_value", 0);
				else
					oObj.set("bar2_value", end);
			}
		}
		else
		{	
			if(effectType == "ent") // Entangle. Normally the Attribute is STR, but for mental paralysis it has to be set to EGO instead.
			{
				for(var i;i<entangle.length;i++)
				{
					if(entangle[i][0] == charNum)
					{
						break;
					}
				}
				// Check if the target breaks free
				
				var newID = spawnCharacter(oCharacter.id); // Duplicate the character sheet in case it is shared between more than one token, otherwise the Effect will be applied to everyone
				
				//var newID = oCharacter.id;

				var oStat = findObjs({name: entangle[i][3],_type: "attribute", _characterid: newID}, {caseInsensitive: true})[0];
				var Stat = parseInt(oStat.get('current'));
				var diceStat = Stat/5;
				var difference = diceStat - parseInt(diceStat);
				diceStat = parseInt(diceStat);
				var halfDie = 0;
				var rolledStat = 0;
				if(difference>0.4)
					halfDie = parseInt(halfdieBody[randomInteger(6)]);
				for(var n=0; n<diceStat; n++)  // Body of Entangle
				{
					rolledStat += parseInt(herodieBody[randomInteger(6)]); 
				}
				rolledStat += halfDie;
				rolledStat -= entangle[i][1];
				if(rolledStat<0)
					rolledStat = 0;
				if(rolledStat>0)
					entangle[i][2] -= rolledStat;
				if(entangle[i][2]<=0)
				{
					var entChat = " breaks free from Entangle!";
					entangle.splice(i,1);
					updateEffect(charNum, effNum, "delete", whisper+oObj.get("name")+entChat);
					oObj.set("status_black-flag", true); // This is because later in nextPhase() function the status_archery-terget is put to false. So we put it to this and the function will change it.
					return;
				}
				else
				{
					var entChat = " is still Entangled!";
					updateEffect(charNum, effNum, "tick", whisper+oObj.get("name")+entChat);
					return;
				}

			}
			else
			{
				var newID = spawnCharacter(arrayChar[charNum][0]); // Duplicate the character sheet in case it is shared between more than one token, otherwise the Effect will be applied to everyone
				
				//var newID = oCharacter.id;

				var oAttrib = findObjs({name: targetStat[i],_type: "attribute", _characterid: newID}, {caseInsensitive: true})[0];

				var attrib = parseInt(oAttrib.get('current'));

				if(effectType == "dam")
					attrib -= effectValue;
				else if(effectType == "aid")
					attrib += effectValue;
				attrib = parseInt(attrib);

				oAttrib.set("current", attrib);
			}
		}
		
		// If SPD and/or DEX are changed, modify the turnorder
		if(effectValue>0 && targetStat[i] == "dex" || targetStat[i] == "spd")
		{
			if(targetStat[i] == "spd")
			{
				arrayChar[charNum][1] = attrib;
			}
			if(targetStat[i] == "dex")
				arrayChar[charNum][2] = attrib;

			arrayChar = arrayChar.sort(function(a,b) { // sorts characters by SPD and then DEX
	            if (a[1] < b[1]) return  1;
	            if (a[1] > b[1]) return -1;
	            if (a[2] < b[2]) return  1;
	            if (a[2] > b[2]) return -1;
	            return 0;
	        });
		}
		if(wEffect[0]!="" && applySpellEffect) // Spell applies effect(s)
	   {
		weaponEffects(effectValue);
	   }
	}

	// update Effect in token's gmnotes
	effTypeChat = effTypeChat.substr(0,effTypeChat.length-1);
	if(effectType=="dam")
		effTypeChat += " of damage from ";
	else if(effectType=="aid")
		if(healing)
			effTypeChat += " of healing from ";
		else
			effTypeChat += " of AID from ";
	effTypeChat += effectDesc;
	
	var tempChat = "/w gm "+oObj.get("name")+" received "+effTypeChat;

	updateEffect(charNum, effNum, "tick", tempChat);
}

function updateEffect(charNum, effID, action, msgChat) 	// update Effect in token's gmnotes and in aChars array
{
	if(typeof charNum == "object")
	{
		var oObj = charNum;
	}
	else
		var oObj = getObj("graphic", aChars[charNum][0]);
    
	var gmnotes = decodeURI(oObj.get("gmnotes"));
	gmnotes = gmnotes.replace(/%3A/g, ':');
    var regex = /{effect}/gi, result, indices = [];
	while ( (result = regex.exec(gmnotes)) ) { // How many Effects on token?
    	indices.push(result.index);
    }
    if(indices.length==0)
    	return;
   	for(var i=0;i<indices.length;i++)
   	{
   		var startPos = gmnotes.indexOf("{effect}", indices[i]);
		var endPos = gmnotes.indexOf("{/effect}", indices[i]);
		var effectString = gmnotes.substr(startPos+8, (endPos-startPos)-8);
		var effectArray = effectString.split("|");
		//log(effectArray);
		if(effectArray[0]==effID) // Found the effect to update
		{
			if(action == "tick") // Increase the counter by 1
			{
				var count = parseInt(effectArray[6].replace("counter:", ""));
				count++;
				effectArray.splice(6,1,"counter:"+count);
				if(effectArray[9]!="nostatus")
					oObj.set("status_"+effectArray[9], true);
				// it has already been incremented in the array by checkEffect
			}
			else if(action == "off") // Turn off the Effect
			{
				if(aChars.length>0) aChars[charNum][4][effID][7] = "off";
				if(effectArray[9]!="nostatus")
					oObj.set("status_"+effectArray[9], false);
				effectArray.splice(7,1,"off");

			}
			else if(action == "on") // Turn on the Effect
			{
				if(aChars.length>0) aChars[charNum][4][effID][7] = "on";
				if(effectArray[9]!="nostatus")
					oObj.set("status_"+effectArray[9], true);
				effectArray.splice(7,1,"on");
			}
			
			var newEffectString = "{effect}";
			for(key in effectArray)
			{
				newEffectString+=effectArray[key]+"|";
			}
			newEffectString = newEffectString.substr(0, newEffectString.length-1);
			newEffectString+="{/effect}";

			if(action == "delete") // Delete the Effect (the entire string)
			{
				newEffectString = "";
				if(effectArray[9]!="nostatus")
					oObj.set("status_"+effectArray[9], false);
				if(aChars.length>0)
				{
					if(aChars[charNum][4][effID][4] == "o" && aChars[charNum][4][effID][5] >= 1 ) // Spell can still have effects, remove them.
					{
						recoveryAttribute(charNum, effID, 100);
					}
					aChars[charNum][4].splice(effID,1);
				}
				else // out of combat
				{
					recoveryAttribute(charNum, effID, 100);
				}
			}

			msgChat = msgChat.replace("[tokenname]", oObj.get("name"));		
			gmnotes = gmnotes.replace("{effect}"+effectString+"{/effect}", newEffectString);
			oObj.set("gmnotes", gmnotes);
			if(msgChat!="")
			sendChat("Effects", msgChat);
		}
   	}
}

function computeEffect(arrayChar, effNum)
{
	var effects = arrayChar[4];

	var effType = "dam"; // Most common Effect type
	if(effects[effNum][1].indexOf("aid:")!=-1) // AID
		effType = "aid";
	else if(effects[effNum][1].indexOf("ent:")!=-1) // Entangle
		effType = "ent";
	else if(effects[effNum][1].indexOf("fla:")!=-1) // Flash
		effType = "fla";
	
	var effTemp = effects[effNum][1].replace("dam:","");
	effTemp = effTemp.replace("aid:","");
	effTemp = effTemp.replace("ent:","");
	effTemp = effTemp.replace("fla:","");

	var typeDice = true;
	var effectResults = new Array();

	if(effTemp.indexOf("f")!=-1)
		typeDice = false;
	var totEffect = effTemp.replace("d","").replace("f","");
	
	var attribute = effects[effNum][2].split("/");

	for(var i=0;i<attribute.length;i++)
	{
		if(typeDice && totEffect < 1)
		{
			log("Effect set to 0 or -1 damage but with dice value instead of fixed value!");
			break;
		}	
		var bodyDam = 0;
		var stunDam = 0;
		if(typeDice) // Dice effect
		{
			if(attribute[i] == "normal")
			{
				for(var n=0; n<totEffect; n++)
				{
					var temp = randomInteger(6);
					stunDam += temp;
					bodyDam += parseInt(herodieBody[temp]);
				}
			} else if(attribute[i] == "killing")
			{
				bodyDam = randomInteger(6)*totEffect;
				stunDam = bodyDam*randomInteger(3);
			} else if (attribute[i] == "body")
				bodyDam = randomInteger(6)*totEffect;
			  else if (attribute[i] == "stun")
			  	stunDam = randomInteger(6)*totEffect;
			else
			{
				bodyDam = randomInteger(6)*totEffect;
				for(var n=0; n<attributeCost.length; n++)
					if(attributeCost[n][1] == attribute[i])
					{
						bodyDam = bodyDam/attributeCost[n][0];
						break;
					}
			}
		}
		else // fixed effect
		{
			if(attribute[i] != "body" && attribute[i] != "stun") // Attribute other than BODY or Stun
				if(totEffect == 0) // We have a special effect that zeroes the attribute
				{
					var oStat = findObjs({name: attribute[i],_type: "attribute", _characterid: arrayChar[0]}, {caseInsensitive: true})[0];
					bodyDam = parseInt(oStat.get('current'));
				}
				else if(totEffect == -1) // We have a special effect that halves the attribute
				{
					var oStat = findObjs({name: attribute[i],_type: "attribute", _characterid: arrayChar[0]}, {caseInsensitive: true})[0];
					bodyDam = parseInt(parseInt(oStat.get('current'))/2);
				}
				else
				{
					for(var n=0; n<attributeCost.length; n++)
					{
						if(attributeCost[n][1] == attribute[i])
						{
							bodyDam = totEffect/attributeCost[n][0];
						}	
					}
				}
			else // Body and Stun affected
			{
				if(totEffect == 0) // We have a special effect that zeroes the attribute
				{
					var oStat = findObjs({name: "body",_type: "attribute", _characterid: arrayChar[0]}, {caseInsensitive: true})[0];
					bodyDam = parseInt(oStat.get('current'));
					oStat = findObjs({name: "stun",_type: "attribute", _characterid: arrayChar[0]}, {caseInsensitive: true})[0];
					stunDam = parseInt(oStat.get('current'));
				}
				else if(totEffect == -1) // We have a special effect that halves the attribute
				{
					var oStat = findObjs({name: "body",_type: "attribute", _characterid: arrayChar[0]}, {caseInsensitive: true})[0];
					bodyDam = parseInt(parseInt(oStat.get('current'))/2);
					oStat = findObjs({name: "stun",_type: "attribute", _characterid: arrayChar[0]}, {caseInsensitive: true})[0];
					stunDam = parseInt(parseInt(oStat.get('current'))/2);
				}
				else
				{
					if(attribute[i] == "body")
						bodyDam = totEffect;
					if(attribute[i] == "stun")
						stunDam = totEffect;
				}
			}
		}
		effectResults.push(effType+"|"+bodyDam+"|"+stunDam);
	} // end looping attributes

	return(effectResults);
}

function tellDuration(duration) // Tell the remaining duration of an Effect in a readable way instead of the number of ticks. Duration passed to the function is in ticks.
{
	var dP = 0;
	var dT = 0;
	var dM = 0;
	var dH = 0;
	var dD = 0;
	dP = duration;
	dT = dP/12;
	var description = "";
	if(parseInt(dT)>0)
	{
		dP = (dT-parseInt(dT))*10;
		dT = parseInt(dT);
	}
	dM = dT/5;
	if(parseInt(dM)>0)
	{
		dT = (dM-parseInt(dM))*10;
		dM = parseInt(dM);
	}
	dH = dM/60;
	if(parseInt(dH)>0)
	{
		dM = (dH-parseInt(dH))*10;
		dH = parseInt(dH);
	}
	dD = dH/24;
	if(parseInt(dD)>0)
	{
		dH = (dD-parseInt(dD))*10;
		dD = parseInt(dD);
	}
	if(dD>0)
		description += dD + " days, ";
	if(dH>0)
		description += dH + " hours, ";
	if(dM>0)
		description += dM + " minutes, ";
	if(dT>0)
		description += dT + " turns, ";
	if(dP>0)
		description += dP + " phases, ";
	description = description.substr(descriptions.length-2);
	return description;
}