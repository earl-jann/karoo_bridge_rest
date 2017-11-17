"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var RTPProxyGenerator = function() {
  this.name = "rtp_proxy.cfg";
}

RTPProxyGenerator.prototype.generate = function(config, path) {
  var configGenerator = new ConfigGenerator(this.name, this.includeName, this.includeFiles);
  configGenerator.generate(config, path, function(root, configWriter) {
    //TODO: update once rtp proxy has model
    root.addInt("rtp-proxy-read-timeout").set(300);
    root.addInt("rtp-proxy-transport-thread-count").set(10);
  });
}

module.exports = RTPProxyGenerator;