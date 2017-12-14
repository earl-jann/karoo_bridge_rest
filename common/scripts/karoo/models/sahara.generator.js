"use strict"

var console = require("console");
var common = require("./common.js");
var ConfigGenerator = require("./config.generator");
var fs = require("filesystem");

/*
 * Class SaharaGenerator 
 */

var SaharaGenerator = function() {
  this.name = "sahara.cfg";

  ConfigGenerator.call(this, this.name);
}

SaharaGenerator.prototype = Object.create(ConfigGenerator.prototype);

SaharaGenerator.prototype.validate = function(config) {
    /* We only generate sahara.cfg if it's missing*/
    return !fs.exists(common.karooConfigPath + "/config/" + this.name);
}

SaharaGenerator.prototype.writeRoot = function(config, root, configWriter) {
  var karoo = root.addGroup("karoo");
  karoo.addString("start-cmd").set("%KAROO_BINARY_PATH%/karoo -D");
  karoo.addString("stop-cmd").set("/usr/bin/kill -9 `/bin/cat %KAROO_PID_FILE%`");
  karoo.addString("pid-file").set("%KAROO_PID_FILE%");
  karoo.addInt("high-mem-count-max").set(60);
  karoo.addInt("high-mem-percent-max").set(80);
  karoo.addInt("high-cpu-count-max").set(60);
  karoo.addInt("high-cpu-percent-max").set(80);
};


module.exports = SaharaGenerator;