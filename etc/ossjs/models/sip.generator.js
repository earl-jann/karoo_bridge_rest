"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var SipGenerator = function() {
  this.name = "sip.cfg";
  this.includeName = "";
  this.includeFiles = [
    "%KAROO_CONFIG_DIRECTORY%/config/listeners.cfg",
    "%KAROO_CONFIG_DIRECTORY%/config/ua.cfg"
  ]
}

SipGenerator.prototype.generate = function(config, path) {
  var configGenerator = new ConfigGenerator(this.name, this.includeName, this.includeFiles);
  configGenerator.generate(config, path);
}

module.exports = SipGenerator;