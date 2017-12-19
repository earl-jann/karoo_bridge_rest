'use strict'

var ListenersGenerator = require("./listeners.generator");
var CarpGenerator = require("./carp.generator");
var TlsGenerator = require("./tls.generator");
var AutobanGenerator = require("./autoban.generator");
var CallLimitsGenerator = require("./calllimits.generator");
var PortsGenerator = require("./ports.generator");
var HomerGenerator = require("./homer.generator");
var VoipMonitorGenerator = require("./voipmonitor.generator");
var UserAgentGenerator = require("./useragent.generator");
var RedisAgentGenerator = require("./redisagent.generator");
var FirewallGenerator = require("./firewall.generator");
var SipGenerator = require("./sip.generator");
var PathsGenerator = require("./paths.generator");
var SaharaGenerator = require("./sahara.generator");
var RtpProxyGenerator = require("./rtpproxy.generator");
var ScriptsGenerator = require("./scripts.generator");

module.exports = {
  generators: [
      new ListenersGenerator(),
      new CarpGenerator(),
      new TlsGenerator(),
      new AutobanGenerator(),
      new CallLimitsGenerator(),
      new PortsGenerator(),
      new HomerGenerator(),
      new VoipMonitorGenerator(),
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
    this.generators.forEach(function(generator){
      if(generator.validate(config)) {
        generator.generate(config, path);
      }
    });
  }
};