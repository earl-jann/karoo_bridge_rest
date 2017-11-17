"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var SaharaGenerator = function() {
  this.name = "sahara.cfg";
}

SaharaGenerator.prototype.generate = function(config, path) {
  var configGenerator = new ConfigGenerator(this.name);
  configGenerator.generate(config, path, function(root, configWriter) {
    var karoo = root.addGroup("karoo");
    karoo.addString("start-cmd").set("%KAROO_BINARY_PATH%/karoo -D");
    karoo.addString("stop-cmd").set("/usr/bin/kill -9 `/bin/cat %KAROO_PID_FILE%`");
    karoo.addString("pid-file").set("%KAROO_PID_FILE%");
    karoo.addInt("high-mem-count-max").set(60);
    karoo.addInt("high-mem-percent-max").set(80);
    karoo.addInt("high-cpu-count-max").set(60);
    karoo.addInt("high-cpu-percent-max").set(80);
  });
}

module.exports = SaharaGenerator;