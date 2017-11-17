'use strict'

var AutobanGenerator = require("./autoban.generator");
var CallLimitsGenerator = require("./calllimits.generator");
var CarpGenerator = require("./carp.generator");
var HomerGenerator = require("./homer.generator");
var ListenersGenerator = require("./listeners.generator");
var PortsGenerator = require("./ports.generator");
var RedisAgentGenerator = require("./redisagent.generator");
var TlsGenerator = require("./tls.generator");
var UserAgentGenerator = require("./useragent.generator");
var FirewallGenerator = require("./firewall.generator");
var SipGenerator = require("./sip.generator");
var PathsGenerator = require("./paths.generator");
var SaharaGenerator = require("./sahara.generator");
var ScriptsGenerator = require("./scripts.generator");
var RtpProxyGenerator = require("./rtpproxy.generator");

module.exports = {
  generators: [
      new ListenersGenerator(),
      new CarpGenerator(),
      new TlsGenerator(),
      new AutobanGenerator(),
      new CallLimitsGenerator(),
      new PortsGenerator(),
      new HomerGenerator(),
      new UserAgentGenerator(),
      new RedisAgentGenerator(),
      new FirewallGenerator(),
      new SipGenerator(),
      new PathsGenerator(),
      new SaharaGenerator(),
      new ScriptsGenerator(),
      new RtpProxyGenerator()
    ],

  generate: function(config, path) {
    this.generators.forEach(function(generators){
      generators.generate(config, path);
    });
  }
};