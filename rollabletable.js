on("chat:message", function(msg) {
  if(msg.type == "api" && msg.content == "!tableread") {
    var locsMalus = [8,6,5,5,3,7,8,4,6,8];
    var oTable = findObjs({name: "locs",_type: "rollabletable"});
    var oItems = findObjs({_type: "tableitem", _rollabletableid: oTable[0].id});
    for(var i=0;i<oItems.length;i++)
    {
      log("aLocsModifier["+i+"] = ["+locsMalus[i]+",'"+oItems[i].get('avatar')+"'];");
    }
  }
  else if(msg.type == "api" && msg.content == "!tableinsert")
  {
    var newtable = findObjs({name: "locs",_type: "rollabletable"});
    if(newtable.length==0)
    {
      var newtable = createObj('rollabletable', {
          name: 'locs',
          showplayers: true
      });
      var tableID = newtable.id;
    }
    else
      var tableID = newtable[0].id;
    //var tableitems = [{"name":"0","avatar":"","weight":461,"_type":"tableitem","_id":"-J8QHoCt42TdpBplS9oX","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"1","avatar":"","weight":462,"_type":"tableitem","_id":"-J8QIuTCgRNyr0LFXzi1","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"2","avatar":"","weight":1666,"_type":"tableitem","_id":"-J8QIuvScT-_3s-bBs74","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"3","avatar":"","weight":1157,"_type":"tableitem","_id":"-J8QIvzpB5sN2SB2IDrz","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"4","avatar":"","weight":2500,"_type":"tableitem","_id":"-J8QIxMKFIqP2ClF4ZkD","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"5","avatar":"","weight":1157,"_type":"tableitem","_id":"-J8QIxwsqYX3aU9OiqFg","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"6","avatar":"","weight":972,"_type":"tableitem","_id":"-J8QIyYcFhGLeyOWrz0G","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"7","avatar":"","weight":694,"_type":"tableitem","_id":"-J8QIzqzPlnGoOSdeH5q","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"8","avatar":"","weight":739,"_type":"tableitem","_id":"-J8QJ-vycgGZ0b3YHa6I","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"9","avatar":"","weight":184,"_type":"tableitem","_id":"-J8QJ0OT0h4DZSZG0Aqs","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"}];
    var tableitems = [{"name":"0","avatar":"https://s3.amazonaws.com/files.staging.d20.io/images/150503/Rl95xiAD4-fJ5Y8d6jDieg/med.gif?1384730029","weight":461,"_type":"tableitem","_id":"-J8QHoCt42TdpBplS9oX","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"1","avatar":"https://s3.amazonaws.com/files.staging.d20.io/images/150504/JI4_dVJDiVsKxCZ80_Gt0g/med.gif?1384730043","weight":462,"_type":"tableitem","_id":"-J8QIuTCgRNyr0LFXzi1","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"2","avatar":"https://s3.amazonaws.com/files.staging.d20.io/images/150505/sp_lWTQ4NwV9elbMSdZxrg/med.gif?1384730054","weight":1666,"_type":"tableitem","_id":"-J8QIuvScT-_3s-bBs74","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"3","avatar":"https://s3.amazonaws.com/files.staging.d20.io/images/150506/apdCQfPKyG73lVbpfo3eMg/med.gif?1384730065","weight":1157,"_type":"tableitem","_id":"-J8QIvzpB5sN2SB2IDrz","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"4","avatar":"https://s3.amazonaws.com/files.staging.d20.io/images/150507/dTrGG5X3y7TfapsgnDqVjA/med.gif?1384730076","weight":2500,"_type":"tableitem","_id":"-J8QIxMKFIqP2ClF4ZkD","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"5","avatar":"https://s3.amazonaws.com/files.staging.d20.io/images/150508/XPHuTpfmREF_7JFIZoJCEw/med.gif?1384730086","weight":1157,"_type":"tableitem","_id":"-J8QIxwsqYX3aU9OiqFg","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"6","avatar":"https://s3.amazonaws.com/files.staging.d20.io/images/150510/Y2WntlS3msebP8EO252s3w/med.gif?1384730098","weight":972,"_type":"tableitem","_id":"-J8QIyYcFhGLeyOWrz0G","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"7","avatar":"https://s3.amazonaws.com/files.staging.d20.io/images/150511/VUGwLYlG2RCiMhDetC6RoQ/med.gif?1384730112","weight":694,"_type":"tableitem","_id":"-J8QIzqzPlnGoOSdeH5q","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"8","avatar":"https://s3.amazonaws.com/files.staging.d20.io/images/150512/k6IL6s3eBsx-nkITcPKSkA/med.gif?1384730121","weight":739,"_type":"tableitem","_id":"-J8QJ-vycgGZ0b3YHa6I","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"},{"name":"9","avatar":"https://s3.amazonaws.com/files.staging.d20.io/images/150513/2S0X60TcHRqMkJHS24S48A/med.gif?1384730133","weight":184,"_type":"tableitem","_id":"-J8QJ0OT0h4DZSZG0Aqs","_rollabletableid":"-J8QHlvsefgGdV8kF0oo"}];
     _.each(tableitems, function(item) {
      createObj('tableitem', {
        name: item.name,
        avatar: item.avatar,
        weight: item.weight,
        _rollabletableid: tableID
      });
    });
  }
});