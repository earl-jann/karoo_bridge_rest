"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var ListenersGenerator = function()
{
  this.name = "listeners.cfg";
  this.includeName = "listeners";
  this.includeFiles = [
    "%KAROO_CONFIG_DIRECTORY%/config/carp.cfg",
    "%KAROO_CONFIG_DIRECTORY%/config/tls.cfg",
    "%KAROO_CONFIG_DIRECTORY%/config/autoban.cfg",
    "%KAROO_CONFIG_DIRECTORY%/config/ports.cfg",
    "%KAROO_CONFIG_DIRECTORY%/config/homer.cfg"
  ];
}

ListenersGenerator.prototype.generate = function(config, path)
{
  var configGenerator = new ConfigGenerator(this.name, this.includeName, this.includeFiles);
  configGenerator.generate(config, path, function(root, configWriter) {
    var listeners = root.addGroup("listeners");
    
    var interfaces = listeners.addList("interfaces");
    config.listeners.forEach(function(listener) {
      var group = interfaces.addGroup();
      group.addString("ip-address").set(listener.ip_address);
      group.addString("external-address").set(listener.external_address);
      group.addBool("tcp-enabled").set(listener.tcp_enabled);
      group.addBool("udp-enabled").set(listener.udp_enabled);
      group.addBool("ws-enabled").set(listener.ws_enabled);
      group.addBool("wss-enabled").set(listener.wss_enabled);
      group.addInt("sip-port").set(listener.sip_port);
      group.addInt("tls-port").set(listener.tls_port);
      group.addInt("ws-port").set(listener.ws_port);
      group.addInt("wss-port").set(listener.wss_port);
      group.addString("subnets").set(listener.subnets);
    });
  });
}

module.exports = ListenersGenerator;