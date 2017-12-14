"use strict"

var console = require("console");
var common = require("./common.js");
var ConfigGenerator = require("./config.generator");

/*
 * Utility Functions 
 */
function addPacketRateWhiteList(whiteList, packetRate) {
  if(packetRate.type === "SOURCE_IP") {
    whiteList.addString("source-ip").set(packetRate.address);
  } else if(packetRate.type === "SOURCE_NETWORK") {
    whiteList.addString("source-network").set(packetRate.address);
  }
}

function setPacketRateRation(autoban, root) {
  var packetRateRatio = autoban.packet_rate_min_treshold 
    + "/" + autoban.packet_rate_max_treshold
    + "/" + autoban.packet_rate_treshold_ban_duration;

  root.addString("packet-rate-ratio").set(packetRateRatio);
}

function setAutoNullRouteOnBan(autoban, root) {
  root.addBool("auto-null-route-on-ban").set(autoban.auto_null_route_on_ban);
}

function setPacketRateWhiteList(autoban_whitelist, root) {
  var whiteList = root.addList("packet-rate-white-list");
  autoban_whitelist.forEach(function(packetRate) {
    var groupList = whiteList.addGroup();
    addPacketRateWhiteList(groupList, packetRate)
  });
}

function setExecuteOnBan(autoban, root) {
  var executeOnBan = "";
  if(autoban && autoban.execute_on_ban.length > 0 && autoban.execute_on_ban.trim()) {
    executeOnBan = common.uploadPath + "/executeOnBan/" + autoban.execute_on_ban;
  }

  root.addString("execute-on-ban").set(executeOnBan);
}

/*
 * Class AutoBanGenerator 
 */

var AutoBanGenerator = function() {
  this.name = "autoban.cfg";

  ConfigGenerator.call(this, this.name);
}

AutoBanGenerator.prototype = Object.create(ConfigGenerator.prototype);

AutoBanGenerator.prototype.validate = function(config) {
  return (config && (config.autoban || config.autoban_whitelist));
}

AutoBanGenerator.prototype.writeRoot = function(config, root, configWriter) {
  var autoban = config.autoban ? config.autoban : config.depList.autoban;
  var autoban_whitelist = config.autoban_whitelist ? config.autoban_whitelist : config.depList.autoban_whitelist;

  setPacketRateRation(autoban, root);
  setExecuteOnBan(autoban, root);
  setAutoNullRouteOnBan(autoban, root);
  setPacketRateWhiteList(autoban_whitelist, root);
};

module.exports = AutoBanGenerator;