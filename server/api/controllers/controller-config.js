'use strict'

var async = require('async');
var fs = require('fs');

const EventEmitter = require('events');

/*
 * Define karoo models here:
 */
const karoo_models = [
  { id: "listeners", name: "config_sip_listeners_interfaces", list: true },
  { id: "carp", name: "config_sip_listeners_carp", list: false },
  { id: "tls", name: "config_tls", list: false },
  { id: "autoban", name: "config_sip_listeners_autoban", list: false },
  { id: "autoban_whitelist", name: "config_sip_listeners_autoban_packetratewhitelist", list: true },
  { id: "firewall", name: "config_sip_listeners_firewall", list: false },
  { id: "firewall_rules", name: "config_sip_listeners_firewallrules", list: true },
  { id: "sip_ports", name: "config_sip_listeners_ports", list: false },
  { id: "useragent", name: "config_useragent", list: false },
  { id: "channel_limits", name: "config_useragent_channellimits", list: true },
  { id: "homer", name: "config_sipcapture_homer", list: false },
  { id: "voipmonitor", name: "config_sipcapture_voipmonitor", list: false }
];

class ConfigEmitter extends EventEmitter {
  constructor(delay) {
    super();
    this.delay = delay || 10000;
    this.queue = [];
    this.ready = true;
    this.path = ".";

    this.on("generate", (models) => {
      this.exec(models);
    });

    this.on("generate.error", (err, model) => {
      /*
       * TODO: Notify user for generate error. 
       */
      console.log(err);
    });
  }

  generate(models) {
    this.emit("generate", models);
  }

  exec(models) {
    this.queue.push(models);
    this.process();
  }

  process() {
    if (this.queue.length === 0) return;
    if (!this.ready) return;
    
    var self = this;
    this.ready = false;
    
    var models = this.queue.shift();
    var queue_models = karoo_models.slice(0);
    var config = {};
    this.dumpConfig(models, queue_models, config);

    setTimeout(function () {
      self.ready = true;
      self.process();
    }, this.delay);
  }

  dumpConfig(models, queue_models, config) {
    var queue_model = queue_models.shift();
    if(queue_model !== undefined) {
      (queue_model.list ? models[queue_model.name].find()
                        : models[queue_model.name].findOne())
        .then((result) => {
            config[queue_model.id] = result;
            this.dumpConfig(models, queue_models, config);
          })
        .catch((err) => {
            this.emit("generate.error", err, queue_model.name);
          });
    } else {
      if(Object.keys(config).length) {
        var configDump = this.path + "/config-dump-" + Date.now() + ".json" 
        fs.writeFile(configDump, JSON.stringify(config, null, 4), (err) => {
            if(!err) {
              this.generateConfig(configDump);
            } else {
              this.emit("generate.error", err, null);
            }
          });
      } else {
        this.emit("generate.error", { error: "no keys in config"}, null);
      } 
      
    }
  }

  generateConfig(configDump) {
    console.log("Start generating config from: ", configDump);
  }
};

const configEmitter = new ConfigEmitter();

module.exports = {

  generate : function(req, res) {
      configEmitter.generate(req.models);
      res.send("OK!");
    }
}