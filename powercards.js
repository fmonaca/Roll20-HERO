var PowerCardScript = PowerCardScript || {};

// USER CONFIGUATION
var ROUNDED_CORNERS = true;
var ROUNDED_INLINE_ROLLS = true;
var BORDER_SIZE = 1;
var BORDER_COLOR = "#000";


function PowerCard(msg){	

		// DEFINE VARIABLES
		var n = msg.split(" --");
		var PowerCard = {};
		var DisplayCard = "";
		var NumberOfAttacks = 1;
		var Tag = "";
		var Content = "";
		var i = 1;
        var InlineBorderRadius = 0;
		
		// CREATE POWERCARD OBJECT ARRAY
		while (n[i]) {
			Tag = n[i].substring(0, n[i].indexOf("|"));
			Content = n[i].substring(n[i].indexOf("|")+1);
			if (Tag.substring(0, 6).toLowerCase() == "attack") {
				NumberOfAttacks = Tag.substring(6);
				if(NumberOfAttacks === 0 || !NumberOfAttacks) NumberOfAttacks = 1;
				Tag = "attack";
			}
			PowerCard[Tag] = Content;
			i++;
		}
		
		// CREATE TITLE STYLE
		var TitleStyle = " font-family: Georgia; font-size: large; font-weight: normal; text-align: center; vertical-align: middle; padding: 5px 0px; margin-top: 0.2em; border: " + BORDER_SIZE + "px solid " + BORDER_COLOR + ";";
        
        // ROUNDED CORNERS ON TOP OF POWER CARD
        TitleStyle += (ROUNDED_CORNERS) ? " border-radius: 10px 10px 0px 0px;" : "";
        
		// LIST OF PRE-SET TITLE TEXT & BACKGROUND COLORS
		var AtWill     = " color: #FFF; background-color: #040;";
		var Encounter  = " color: #FFF; background-color: #400;";
		var Daily      = " color: #FFF; background-color: #444;";
		var Item       = " color: #FFF; background-color: #e58900;";
        
		// CHECK FOR PRESET TITLE COLORS
		if (PowerCard.usage !== undefined && PowerCard.txcolor === undefined && PowerCard.bgcolor === undefined) {
			// PRESET TITLE COLORS
			TitleStyle += AtWill;
			if (PowerCard.usage.toLowerCase() == "encounter") TitleStyle += Encounter;
			if (PowerCard.usage.toLowerCase() == "daily") TitleStyle += Daily;
			if (PowerCard.usage.toLowerCase() == "item") TitleStyle += Item;
		} else {
			// CUSTOM TITLECARD TEXT & BACKGROUND COLORS
			TitleStyle += (PowerCard.txcolor !== undefined) ? " color: " + PowerCard.txcolor + ";" : " color: #FFF;";
			TitleStyle += (PowerCard.bgcolor !== undefined) ? " background-color: " + PowerCard.bgcolor + ";" : " background-color: #444;";
		}
        
		// BEGIN DISPLAYCARD CREATION
		DisplayCard += "<div style='" + TitleStyle + "'>" + PowerCard.name;
		DisplayCard += (PowerCard.usage !== undefined && PowerCard.action !== undefined) ? "<br><span style='font-family: Tahoma; font-size: small; font-weight: normal;'>" + PowerCard.usage +  " ♦ " + PowerCard.action + "</span></div>" : "</div>";
        
		// ROW STYLE VARIABLES
		var OddRow        = " background-color: #CEC7B6; color: #000;";
		var EvenRow       = " background-color: #B6AB91; color: #000;";
		var RowStyle      = " padding: 5px; border-left: " + BORDER_SIZE + "px solid " + BORDER_COLOR + "; border-right: " + BORDER_SIZE + "px solid " + BORDER_COLOR + ";";
		var RowBackground = OddRow;
		var RowNumber     = 1;
        var Indent        = 0;
		var KeyCount      = 0;
        
        // IF ROUNDED CORNERS
        RowStyle += " border-radius: 0px;";
		
		// KEY LOOP
		var Keys = Object.keys(PowerCard);
        var ReservedTags = "attack, damage";
        var IgnoredTags = "emote, name, usage, action, defense, dmgtype, txcolor, bgcolor";
        while (KeyCount < Keys.length) {
            Tag = Keys[KeyCount];
            Content = PowerCard[Keys[KeyCount]];
            if (Tag.charAt(0) === "^") {
                Indent = (parseInt(Tag.charAt(1)) > 0) ? Tag.charAt(1) : 1;
                Tag = (parseInt(Tag.charAt(1)) > 0) ? Tag.substring(2) : Tag.substring(1);
                RowStyle += " padding-left: " + (Indent * 1.5) + "em;";
            }
            // Check for RESERVED or IGNORED tags
            if (ReservedTags.indexOf(Tag) != -1) {
                // ATTACK ROLLS
                if (Tag.toLowerCase() == "attack") {
                    var AttackMessage = PowerCard.attack.substring(PowerCard.attack.indexOf("]]")+2);
                    var AttackNumber = parseInt(PowerCard.attack.slice(PowerCard.attack.indexOf("[[")+2, PowerCard.attack.indexOf("]]")));
                    for (var AttackCount = 0; AttackCount < NumberOfAttacks; AttackCount++) {
                        RowBackground = (RowNumber%2 == 1) ? OddRow : EvenRow;
                        RowNumber += 1;
                        DisplayCard += "<div style='" + RowStyle + RowBackground + "'><table style='width: 100%;'><tr><td style='width: 1.75em;'>$[[" + AttackNumber + "]]</td><td style='padding-left: 5px;'> vs " + PowerCard.defense + AttackMessage + "</td></tr></table></div>";
                        if (NumberOfAttacks > 1) AttackMessage = "";
                    }
                }
                // DAMAGE ROLLS
                if (Tag.toLowerCase() == "damage") {
                    var DamageMessage = PowerCard.damage.substring(PowerCard.damage.indexOf("]]")+2);
                    var DamageNumber = parseInt(PowerCard.damage.slice(PowerCard.damage.indexOf("[[")+2, PowerCard.damage.indexOf("]]")));
                    if (PowerCard.dmgtype == undefined) PowerCard.dmgtype = "";
                    RowBackground = (RowNumber%2 == 1) ? OddRow : EvenRow;
                    RowNumber += 1;
                    DisplayCard += "<div style='" + RowStyle + RowBackground + "'><table width='100%'><tr><td style='width: 1.74em;'>$[[" + DamageNumber + "]]</td><td style='text-align: left; padding-left: 5px;'>" + PowerCard.dmgtype + " damage " + DamageMessage + "</td></tr></table></div>";
                }
            } else if (IgnoredTags.indexOf(Tag.toLowerCase()) != -1) {
                // Do nothing
            } else {
                RowBackground = (RowNumber%2 == 1) ? OddRow : EvenRow;
                RowNumber += 1;
                DisplayCard += "<div style='" + RowStyle + RowBackground + "'><b>" + Tag + ":</b> " + Content + "</div>";
            }            
            KeyCount++;
        }
        // ADD ROUNDED CORNERS & BORDER TO BOTTOM OF POWER CARD
        if (ROUNDED_CORNERS && KeyCount == (Keys.length)) DisplayCard = DisplayCard.replace(/border-radius: 0px;(?!.*border-radius: 0px;)/g, "border-radius: 0px 0px 10px 10px; border-bottom: " + BORDER_SIZE + "px solid " + BORDER_COLOR + ";");
        if (!ROUNDED_CORNERS && BORDER_SIZE) DisplayCard = DisplayCard.replace(/border-radius: 0px;(?!.*border-radius: 0px;)/g, "border-bottom: " + BORDER_SIZE + "px solid " + BORDER_COLOR + ";");
        
        // INLINE ROLLS REPLACEMENT
		var Count = 0;
		if (msg.inlinerolls !== undefined) {
			while (Count < msg.inlinerolls.length) {
				// Replace inline roll placeholder in DisplayCard
				var numCopies = DisplayCard.split("$[[" + Count + "]]").length - 1;
				for (var i = 0; i < numCopies; i++) {
					sendChat("", Count + " [[" + msg.inlinerolls[Count].expression + "]]", function(m) {
						var idx = parseInt(m[0].content.split(" ")[0]);
						var rolldata = m[0].inlinerolls[1];
						var inlineroll = PowerCardScript.buildInline(
							rolldata.expression,
							rolldata.results.rolls
						);
						DisplayCard = DisplayCard.replace("$[[" + idx + "]]", inlineroll);
						if (DisplayCard.search(/\$\[\[\d+\]\]/g) == -1) {
							// SEND OUTPUT TO CHAT
							if (PowerCard.emote !== undefined) sendChat(msg.who, "/emas " + PowerCard.emote);
							sendChat("", "/direct " + DisplayCard);
						}
					});
				}
			Count += 1;
			}
		} else {
			if (PowerCard.emote !== undefined) sendChat(msg.who, "/emas " + PowerCard.emote);
			sendChat("", "/direct " + DisplayCard);
		}
}

PowerCardScript.buildInline = function(expression, rolls) {
    InlineBorderRadius = (ROUNDED_INLINE_ROLLS) ? 5 : 0;
	var rollOut = '<span style="text-align: center; vertical-align: text-middle; display: inline-block; min-width: 1.75em; border-radius: ' + InlineBorderRadius + 'px; padding: 2px 0px 0px 0px;" title="Rolling '+expression+' = ';
	var failRoll = critRoll = false;
	var modTotal = 0;
	var math;
	
	for(var k in rolls) {
		var r = rolls[k];
		var max = r.sides;
        
		// ROLL.TYPE Roll	
		if(r.type == 'R') {
			rollOut += '(';
			for(var m = 0; m < r.results.length; m++) {
				var value = r.results[m].v;
				var drop = r.results[m].d
				if (!drop) {
					switch(math) {
						default:
						case '+':
							modTotal += value;
							math = '';
						break;
						case '-':
							modTotal -= value;
							math = '';
						break;
						case '*':
							modTotal *= value;
							math = '';
						break;
						case '/':
							modTotal /= value;
							math = '';
						break;
					}
				}
				critRoll = critRoll || (value == max);
				failRoll = failRoll || (value == 1);
				rollOut += '<span class=\'basicdiceroll'+(value==max?' critsuccess':(value==1?' critfail':''))+'\'>';
				rollOut += value+'</span>+';
			}
			rollOut = rollOut.substring(0, rollOut.length - 1)+')';
		}
		
		// ROLL.TYPE Math
		if(r.type == 'M') {
			rollOut += r.expr;
			if (r.expr.length == 1) {
				math = r.expr;
			} else {
				var operator = ('' + r.expr).substring(0, 1);
				var operand = ('' + r.expr).substring(operator.search(/[\d(]/) === 0 ? 0 : 1);
			}
            
			if (operand.search(/([\d+\-*/() d]|floor\(|ceil\()+\)?/g) === 0) {
				operand = operand.split('floor').join('Math.floor');
				operand = operand.split('ceil').join('Math.ceil');
				operand = eval((operator == '-' ? '-' : '') + operand);
			} else {
				operand = parseInt(operand);
			}
			
			switch(operator) {
				default:
				case '+':
				case '-':
					modTotal += operand;
				break;
				case '*':
					modTotal *= operand;
				break;
				case '/':
					modTotal /= operand;
				break;
			}
		}
	}
	rollOut += '" class="a inlinerollresult showtip tipsy-n';
	rollOut += (critRoll&&failRoll?' importantroll':(critRoll?' fullcrit':(failRoll?' fullfail':'')))+'">'+modTotal+'</span>';
	return rollOut;
};