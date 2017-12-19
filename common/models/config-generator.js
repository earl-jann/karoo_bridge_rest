'use strict';

var shortid = require("shortid");
var fs = require("fs-extra");
var async = require("async");
var redis = require("redis");
var spawn = require("child_process").spawn;

const EventEmitter = require('events').EventEmitter;
const util = require('util');

/*
 * class ConfigPublisher
 */

function ConfigPublisher(id, options) {
  EventEmitter.call(this);

  this.id = id;
  this.deployPath = "";
  this.deployConfig = "";
  this.deployFiles = "";
  this.deployScripts = "";

  this.options = Object.assign({
    generatorPath: "/etc/karoo.conf.d/web/generator",
    configPath: "/etc/karoo.conf.d/web/generator/current",
    backupPath: "/etc/karoo.conf.d/web/generator/backup",
    publishConfig: "/etc/karoo.conf.d/config",
    publishFiles: "/etc/karoo.conf.d/config/uploads",
    publishScripts: "/usr/lib64/oss_modules/karoo",
    uploadedFiles: "./files",
    uploadedScripts: "./scripts",
    karooGeneratorScript: "./common/scripts/karoo/karoo.generator.js"
  }, options);

  //if redisSettings is set use it otherwise use default settings.
  this.redisClient = redis.createClient(this.options.redisSettings ? this.options.redisSettings : {});
}

util.inherits(ConfigPublisher, EventEmitter)


ConfigPublisher.prototype.ensureDirPaths = function(callback) {
  this.deployPath = this.options.generatorPath + "/karoo-config-"
    + new Date().toISOString().replace(/\..+/, '').replace(new RegExp(":", "g"), ".");

  this.deployConfig = this.deployPath + "/config";
  this.deployFiles = this.deployPath + "/files";
  this.deployScripts = this.deployPath + "/scripts";

  async.series([
    /** Ensure generator directory exists**/
    (next) => {
      fs.ensureDir(this.deployConfig)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },

    (next) => {
      fs.ensureDir(this.deployFiles)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },

    (next) => {
      fs.ensureDir(this.deployScripts)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },
    /** Ensure publish directory exists**/
    (next) => {
      fs.ensureDir(this.options.configPath)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },

    (next) => {
      fs.ensureDir(this.options.backupPath)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },

    (next) => {
      fs.ensureDir(this.options.publishConfig)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },
    (next) => {
      fs.ensureDir(this.options.publishFiles)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },
    (next) => {
      fs.ensureDir(this.options.publishScripts)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },
  ], (err) => {
    if(err) {
      return callback(err);
    } else {
      callback(null);
    }
  });
}

ConfigPublisher.prototype.aggregateConfig = function(callback)
{
  fs.readdir(this.options.configPath, (err, files) => {
    if (!files) {
      return callback(new Error('No Files found in ConfigPath: ' + this.options.configPath));
    }
    var filterFiles = files.filter((file) => { return file.substr(-5) === '.json'; })
    if(err) {
      console.error("ConfigPublisher:aggregateConfig:%s readDir error: %s", this.id, err);
      return callback(err);
    } else {
      console.log("ConfigPublisher:aggregateConfig:%s Aggregate json files: %s", this.id, filterFiles);
      if(filterFiles.length > 0) {
        callback(null, filterFiles);
      } else {
        return callback(new Error("No generated json files in: " + this.options.configPath));
      }
    }
  });
}

ConfigPublisher.prototype.aggregateJson = function(files, callback) {
  var config = {depList: {}};
  async.each(files, (file, next) => {
    fs.readFile(this.options.configPath + "/" + file, "utf8", function (err, data) {
      if (err) {
        return next(err);
      } else {
        var dataJson = JSON.parse(data);
        var depList = Object.assign(config.depList, dataJson.depList)
        config = Object.assign(config, dataJson, {depList: depList});
        next(null);
      }
    });
  }, (err) => {
    if(err) {
      console.error("ConfigPublisher:aggregateJson:%s receive error: ", this.id, err);
      return callback(err);
    } else {
      console.log("ConfigPublisher:aggregateJson:%s Aggregation Done", this.id);
      callback(null, config);
    }
  });
}

ConfigPublisher.prototype.saveConfig = function(config, callback) {
  if(!Object.keys(config).length) {
    console.error("ConfigPublisher:saveConfig:%s Config Json is empty", this.id);
  } else {
    async.waterfall([
      async.constant(config),
      this.writeConfig.bind(this),
      this.symlinkConfig.bind(this)
    ], (err) => {
      if(err) {
        return callback(err);
      } else {
        callback(null);
      }
    });
  }
}

ConfigPublisher.prototype.transformConfig = function(callback) {
  var ossjs = spawn("ossjs", [
    this.options.karooGeneratorScript,
    this.options.configPath + "/karoo.aggregate.conf",
    this.deployConfig]);

  ossjs.stdout.on("data", (data) => {
    console.log("ossjs: ", data);
  });

  ossjs.stderr.on("data", (data) => {
    console.log("ossjs: ", data);
  });

  ossjs.on("error", (err) => {
    return callback(new Error("OSSJS exited with event error: " + err));
  });

  ossjs.on('close', (code) => {
    console.log("child process exited with code", code);
    callback(null);
    if(code >= 0) {
      callback(null);
    } else {
      return callback(new Error("OSSJS exit with code: " + code));
    }
  });
}

ConfigPublisher.prototype.saveFiles = function(callback) {
  async.series([
    function configFiles(next) {
        fs.copy("./files", this.deployFiles)
          .then(() => {next(null);})
          .catch((err) => {return next(err);});
      }.bind(this),

    function scriptFiles(next) {
        fs.copy("./scripts", this.deployScripts)
          .then(() => {next(null);})
          .catch((err) => {return next(err);});
      }.bind(this),
  ], (err) => {
    if(err) {
      return callback(err);
    } else {
      callback(null);
    }
  });
}

ConfigPublisher.prototype.snapshotDB = function(callback) {
  async.series([
      this.triggerSnapshotDB.bind(this),
      this.checkSnapshotDb.bind(this),
      this.saveSnapshotDB.bind(this)
    ], (err) => {
      if(err) {
        return callback(err);
      } else {
        callback(null);
      }
    });
}

ConfigPublisher.prototype.backupKaroo = function(callback) {

  var backupPath = this.options.backupPath + "/karoo-config-"
    + new Date().toISOString().replace(/\..+/, '').replace(new RegExp(":", "g"), ".");

  var backupConfig = backupPath + "/config";
  var backupFiles = backupPath + "/files";
  var backupScripts = backupPath + "/scripts";

  async.series([
    /** Ensure backup directory exists**/
    (next) => {
      fs.ensureDir(backupConfig)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },

    (next) => {
      fs.ensureDir(backupFiles)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },

    (next) => {
      fs.ensureDir(backupScripts)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },

    (next) => {
      fs.copy(this.options.publishConfig, backupConfig)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },

    (next) => {
      fs.copy(this.options.publishFiles, backupFiles)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },

    (next) => {
      fs.copy(this.options.publishScripts, backupScripts)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    }
  ], (err) => {
    if(err) {
      return callback(err);
    } else {
      callback(null);
    }
  });
}

ConfigPublisher.prototype.publishKaroo = function(callback) {

  async.series([
    (next) => {
      fs.copy(this.deployConfig, this.options.publishConfig)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },

    (next) => {
      fs.copy(this.deployFiles, this.options.publishFiles)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    },

    (next) => {
      fs.copy(this.deployScripts, this.options.publishScripts)
        .then(() => {next(null);})
        .catch((err) => {return next(err);});
    }
  ], (err) => {
    if(err) {
      return callback(err);
    } else {
      callback(null);
    }
  });
}

ConfigPublisher.prototype.writeConfig = function(config, callback) {
  var outputFile = this.options.configPath + "/karoo." + this.id + ".conf";
  fs.writeFile(outputFile, JSON.stringify(config, null, 4), (err) => {
      if(err) {
        return callback(err);
      } else {
        callback(null, outputFile);
      }
    });
}

ConfigPublisher.prototype.symlinkConfig = function(configFile, callback) {
  var symlink = this.options.configPath + "/karoo.aggregate.conf";

  /*Delete symlink if exist*/
  if(fs.existsSync(symlink)) {
    fs.unlinkSync(symlink);
  }

  /*Always create symlink*/
  fs.symlink(configFile, symlink, (err) => {
      if(err) {
        return callback(err);
      } else {
        callback(null);
      }
    });
}

ConfigPublisher.prototype.triggerSnapshotDB = function(callback) {
  this.redisClient.bgsave((err, resp) => {
    if(err) {
      return callback(err);
    } else {
      callback(null);
    }
  });
}

ConfigPublisher.prototype.checkSnapshotDb = function(callback) {
  var delay = 1000;
  var self = this;

  setTimeout( function checkRedisSnapshot() {
    self.redisClient.info("persistence", (err, resp) => {
      if(err) {
        return callback(err);
      } else {
        if(self.redisClient.server_info.rdb_bgsave_in_progress === "0"
          && self.redisClient.server_info.rdb_last_bgsave_status === "ok") {
          callback(null);
        } else {
          if( delay <= 60000 ) {
            delay *= 2;
            setTimeout(checkRedisSnapshot, delay);
          } else {
            return callback(new Error("Redis snapshot timeout"));
          }
        }
      }
    });
  });
}

ConfigPublisher.prototype.saveSnapshotDB = function(callback) {
  //TODO: Retrieve db path on redis client
  fs.copy(this.options.publishConfig + "/karoo_redis.db", this.deployPath + "/redis-snapshot.rdb")
    .then(() => {callback(null);})
    .catch((err) => {return callback(err);});
}

ConfigPublisher.prototype.publish = function() {
  async.waterfall([
    this.ensureDirPaths.bind(this),
    this.aggregateConfig.bind(this),
    this.aggregateJson.bind(this),
    this.saveConfig.bind(this),
    this.transformConfig.bind(this),
    this.saveFiles.bind(this),
    this.snapshotDB.bind(this),
    this.checkSnapshotDb.bind(this),
    this.backupKaroo.bind(this),
    this.publishKaroo.bind(this)
  ], (err) => {
    if(err) {
      console.log(err);
      if(this.deployPath) {
        fs.remove(this.deployPath)
          .catch((err) => {
            console.warn("Unable to cleanup temp configs!!!");
          });
      }
    } else {
      console.log("success!");
      fs.remove(this.options.configPath + "/*")
        .catch((err) => {
          console.warn("Unable to cleanup generated configs!!!");
        });
    }
  });
}

module.exports = function(ConfigGenerator) {

  ConfigGenerator.generate = function(cb) {
    var id = shortid.generate();
    var options = {
      configPath : ConfigGenerator.settings.configPath,
      backupPath : ConfigGenerator.settings.backupPath,
      uploadedFiles : ConfigGenerator.settings.uploadedFiles,
      uploadedScripts : ConfigGenerator.settings.uploadedScripts,
      publishConfig : ConfigGenerator.settings.publishConfig,
      publishScripts : ConfigGenerator.settings.publishScripts,
      karooGeneratorScript : ConfigGenerator.settings.karooGeneratorScript,
      redisSettings : ConfigGenerator.app.dataSources.redis.settings
    }

    var configPublisher = new ConfigPublisher(id, options);
    configPublisher.publish();
    cb(null, id);
  }

  ConfigGenerator.remoteMethod('generate', {
        returns: {arg: 'jobId', type: 'string'}
  });

};
