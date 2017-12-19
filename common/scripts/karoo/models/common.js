'use strict'

var system = require("system");

module.exports = {
  uploadPath : "%KAROO_CONFIG_DIRECTORY%/config/uploads",
  karooConfigPath : system.CONFDIR + "/karoo.conf.d"
}