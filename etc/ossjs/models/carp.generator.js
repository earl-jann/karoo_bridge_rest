"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var CarpGenerator = function()
{
  this.name = "carp.cfg";
}

CarpGenerator.prototype.generate = function(config, path)
{
  var configGenerator = new ConfigGenerator(this.name);
  configGenerator.generate(config, path, function(root, configWriter) {
    var interfaces = root.addList("carp-ha-interface");
    var carp = interfaces.addGroup();

    carp.addBool("enabled").set(config.carp.enabled);
    carp.addString("virtual-ip-address").set(config.carp.virtual_ip_address);
    carp.addString("interface-name").set(config.carp.interface_name);
    carp.addString("src-address").set(config.carp.src_address);
    carp.addString("up-script").set(config.carp.up_script);
    carp.addString("down-script").set(config.carp.down_script);
    carp.addString("carp-password").set(config.carp.carp_password);
    carp.addInt("vhid").set(config.carp.vhid);
    carp.addBool("preferred-master").set(config.carp.preferred_master);
    carp.addString("external-address").set(config.carp.external_address);
    carp.addBool("tcp-enabled").set(config.carp.tcp_enabled);
    carp.addBool("udp-enabled").set(config.carp.udp_enabled);
    carp.addBool("ws-enabled").set(config.carp.ws_enabled);
    carp.addBool("wss-enabled").set(config.carp.wss_enabled);
    carp.addInt("sip-port").set(config.carp.sip_port);
    carp.addInt("tls-port").set(config.carp.tls_port);
    carp.addInt("ws-port").set(config.carp.ws_port);
    carp.addInt("wss-port").set(config.carp.wss_port);
    carp.addString("subnets").set(config.carp.subnets);
  });
}

module.exports = CarpGenerator;