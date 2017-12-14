"use strict"

var console = require("console");
var common = require("./common.js");
var ConfigGenerator = require("./config.generator");
var fs = require("filesystem");

/*
 * Class SipGenerator 
 */

var SipGenerator = function() {
  this.name = "sip.cfg";
  this.includeName = "";
  this.includeFiles = [
    "%KAROO_CONFIG_DIRECTORY%/config/listeners.cfg",
    "%KAROO_CONFIG_DIRECTORY%/config/ua.cfg"
  ]

  ConfigGenerator.call(this, this.name, this.includeName, this.includeFiles);
}

SipGenerator.prototype = Object.create(ConfigGenerator.prototype);

SipGenerator.prototype.validate = function(config) {
    /* We only generate sip.cfg if it's missing*/
    return !fs.exists(common.karooConfigPath + "/config/" + this.name);
}

module.exports = SipGenerator;