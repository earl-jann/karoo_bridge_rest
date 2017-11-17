"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var ScriptsGenerator = function() {
  this.name = "scripts.cfg";
}

ScriptsGenerator.prototype.generate = function(config, path) {
  var configGenerator = new ConfigGenerator(this.name);
  configGenerator.generate(config, path, function(root, configWriter) {
    var sbc = root.addGroup("sbc");
    var transactionHandlers = sbc.addGroup("transaction-handlers");

    var invite = transactionHandlers.addGroup("invite");
    invite.addString("inbound").set("%KAROO_CONFIG_DIRECTORY%/scripts/inbound.js");
    invite.addString("authenticator").set("%KAROO_CONFIG_DIRECTORY%/scripts/authenticate.js");
    invite.addString("route").set("%KAROO_CONFIG_DIRECTORY%/scripts/route.js");
    invite.addString("failover").set("%KAROO_CONFIG_DIRECTORY%/scripts/route.js");
    invite.addString("outbound").set("%KAROO_CONFIG_DIRECTORY%/scripts/outbound.js");
    invite.addString("response").set("%KAROO_CONFIG_DIRECTORY%/scripts/response.js");

    var register = transactionHandlers.addGroup("register");
    register.addString("inbound").set("%KAROO_CONFIG_DIRECTORY%/scripts/inbound.js");
    register.addString("authenticator").set("%KAROO_CONFIG_DIRECTORY%/scripts/authenticate.js");
    register.addString("route").set("%KAROO_CONFIG_DIRECTORY%/scripts/route.js");
    register.addString("outbound").set("%KAROO_CONFIG_DIRECTORY%/scripts/outbound.js");
    register.addString("response").set("%KAROO_CONFIG_DIRECTORY%/scripts/response.js");

    var def = transactionHandlers.addGroup("default");
    def.addString("inbound").set("%KAROO_CONFIG_DIRECTORY%/scripts/inbound.js")
    def.addString("authenticator").set("%KAROO_CONFIG_DIRECTORY%/scripts/authenticate.js")
    def.addString("route").set("%KAROO_CONFIG_DIRECTORY%/scripts/route.js")    
  });
}

module.exports = ScriptsGenerator;