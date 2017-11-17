"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var AutoBanGenerator = function() {
  this.name = "autoban.cfg";
}

AutoBanGenerator.prototype.generate = function(config, path) {
  var configGenerator = new ConfigGenerator(this.name);
  configGenerator.generate(config, path, function(root, configWriter) {
    root.addString("packet-rate-ratio").set(config.autoban.packet_rate_min_treshold 
      + "/" + config.autoban.packet_rate_max_treshold
      + "/" + config.autoban.packet_rate_treshold_ban_duration);
    
    var whitelist = root.addList("packet-rate-white-list");
    config.autoban_whitelist.forEach(function(source) {
      var sourceList = whitelist.addGroup();
      if(source.type === "SOURCE_IP") {
        sourceList.addString("source-ip").set(source.address);
      } else if(source.type === "SOURCE_NETWORK") {
        sourceList.addString("source-network").set(source.address);
      }
    });

    var script = "";
    if(config.autoban.execute_on_ban.length > 0 && config.autoban.execute_on_ban.trim()) {
      script = "%KAROO_CONFIG_DIRECTORY%/config/uploads/autoban/execute_ban/" + config.autoban.execute_on_ban;
    }

    root.addString("execute-on-ban").set(script);
    root.addBool("auto-null-route-on-ban").set(config.autoban.auto_null_route_on_ban);
  });
}

module.exports = AutoBanGenerator;