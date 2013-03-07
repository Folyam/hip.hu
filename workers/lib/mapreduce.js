var commands = {};

// Faction Levels
commands.factionLevels = (function() {
  var _map = function() {
    emit(this.faction, this);
  };
  var _reduce = function(key, values) {
    var result = {
      "L1": 0,
      "L2": 0,
      "L3": 0,
      "L4": 0,
      "L5": 0,
      "L6": 0,
      "L7": 0,
      "L8": 0
    };
    values.forEach(function(member) {
      if (typeof member.level == "undefined") {
        for(var i in member) {
          if (member.hasOwnProperty(i)) {
            result[i] += member[i];
          }
        }
      } else {
        result["L" + member.level]++;
      }
    });
    return result;
  };
  return {
    "mapreduce": "levels",
    "map": _map.toString(),
    "reduce": _reduce.toString(),
    "out": "stat_faction_levels"
  };
})();

// Levels
commands.levels = (function() {
  var _map = function() {
    emit("L" + this.level, this);
  };
  var _reduce = function(key, values) {
    var count = 0;
    var factions = {
      Resistance: 0,
      Enlightened: 0
    };
    values.forEach(function(member) {
      if (typeof member.faction == "undefined") {
        factions.Resistance += member.factions.Resistance;
        factions.Enlightened += member.factions.Enlightened;
        count += member.sum;
      } else {
        factions[member.faction]++;
        count++;
      }
    });
    return { sum: count, factions: factions };
  };
  return {
    "mapreduce": "levels",
    "map": _map.toString(),
    "reduce": _reduce.toString(),
    "out": "stat_levels"
  };
})();

module.exports = commands;