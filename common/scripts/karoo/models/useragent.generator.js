"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

/*
 * Class UserAgentGenerator 
 */

var UserAgentGenerator = function() {
  this.name = "ua.cfg";
  this.includeName = "user-agent";
  this.includeFiles = [
    "%KAROO_CONFIG_DIRECTORY%/config/redis_client.cfg",
    "%KAROO_CONFIG_DIRECTORY%/config/channel_limits.cfg"
  ];

  ConfigGenerator.call(this, this.name, this.includeName, this.includeFiles);
}

UserAgentGenerator.prototype = Object.create(ConfigGenerator.prototype);

UserAgentGenerator.prototype.validate = function(config) {
  return (config && config.useragent);
}

UserAgentGenerator.prototype.writeRoot = function(config, root, configWriter) {
  var userAgent = root.addGroup("user-agent");
  userAgent.addString("user-agent-name").set(config.useragent.user_agent_name)
  userAgent.addBool("register-state-in-contact-params").set(config.useragent.register_state_in_contact_params);
  userAgent.addBool("dialog-state-in-contact-params").set(config.useragent.dialog_state_in_contact_params);
  userAgent.addBool("enable-options-routing").set(config.useragent.enable_options_routing);
  userAgent.addBool("disable-options-keep-alive").set(config.useragent.disable_options_keep_alive);
  userAgent.addBool("require-rtp-for-registrations").set(config.useragent.require_rtp_for_registrations);

};

module.exports = UserAgentGenerator;