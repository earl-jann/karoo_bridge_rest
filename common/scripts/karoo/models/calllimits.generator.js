"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

/*
 * Utility function 
 */

function setChannelLimits(limits, config) {
  var limit = limits.addGroup();
  limit.addBool("enabled").set(config.enabled);
  limit.addString("prefix").set(config.id);
  limit.addInt("max-channels").set(config.max_channels);
}

function setDomainLimits(limits, config) {
  var limit = limits.addGroup();
  limit.addBool("enabled").set(config.enabled);
  limit.addString("domain").set(config.id);
  limit.addInt("max-channels").set(config.max_channels);
}

/*
 * Class CallLimitsGenerator 
 */

var CallLimitsGenerator = function() {
  this.name = "channel_limits.cfg";

  ConfigGenerator.call(this, this.name);
}

CallLimitsGenerator.prototype = Object.create(ConfigGenerator.prototype);

CallLimitsGenerator.prototype.validate = function(config) {
  return (config && config.channel_limits);
}

CallLimitsGenerator.prototype.writeRoot = function(config, root, configWriter) {
  var channelLimits = root.addList("channel-limits");
  var domainLimits = root.addList("domain-limits");
  config.channel_limits.forEach(function(channel) {
    if(channel.type === "CHANNEL") {
      setChannelLimits(channelLimits, channel);
    } else if(channel.type === "DOMAIN") {
      setDomainLimits(domainLimits, channel);
    }
  });
};

module.exports = CallLimitsGenerator;