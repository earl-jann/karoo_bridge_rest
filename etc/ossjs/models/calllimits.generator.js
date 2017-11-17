"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var CallLimitsGenerator = function() {
  this.name = "channel_limits.cfg";
}

CallLimitsGenerator.prototype.generate = function(config, path) {
  var configGenerator = new ConfigGenerator(this.name);
  configGenerator.generate(config, path, function(root, configWriter) {
    var channelLimits = root.addList("channel-limits");
    var domainLimits = root.addList("domain-limits");
    config.channel_limits.forEach(function(channel) {
      if(channel.type === "CHANNEL") {
        var limit = channelLimits.addGroup();
        limit.addBool("enabled").set(channel.enabled);
        limit.addString("prefix").set(channel.id);
        limit.addInt("max-channels").set(channel.max_channels);
      } else if(channel.type === "DOMAIN") {
        var limit = domainLimits.addGroup();
        limit.addBool("enabled").set(channel.enabled);
        limit.addString("domain").set(channel.id);
        limit.addInt("max-channels").set(channel.max_channels);
      }
    });
  });
}

module.exports = CallLimitsGenerator;