'use strict';
var async = require('async');
var app = require('../../server/server');
var debug = require('debug')('model::interfaces');

module.exports = function(Interface) {
  // delete related firewall records
  Interface.observe('after delete', function(ctx, next) {
    if (ctx.instance) { // for single model update
      //
    } else { // for multi-model update
      /*
      * The before/after delete operation hooks do not receive a list of
      * deleted model instance IDs, because backend data stores such as
      * relational or NoSQL databases don’t provide this information.
      * However, when deleting a single model instance hook receives
      * ctx.where that contains the id of the instance being deleted.
      */
      var FirewallModel = app.models.config_sip_listeners_firewallrules;

      debug('About to delete some: ' + FirewallModel.pluralModelName);
      debug('using the WHERE clause: ' + ctx.where);

      var deleteFilter = {'interface_name': ctx.where.id};
      FirewallModel.destroyAll(deleteFilter, (err, info) => {
        if (err) return;
        debug('Deleted ' + info.count + ' records.');
      });
    }
    next();
  });

  // after saving
  Interface.observe('after save', function(ctx, next) {
    if (ctx.instance) { // for single model update
      // save all ports

      var ports = [];

      if (ctx.instance.tcp_enabled) {
        ports.push({'port': ctx.instance.sip_port, 'type': 'TCP'});
      }

      if (ctx.instance.udp_enabled) {
        ports.push({'port': ctx.instance.sip_port, 'type': 'UDP'});
      }

      if (ctx.instance.ws_enabled) {
        ports.push({'port': ctx.instance.ws_port, 'type': 'TCP'});
      }

      if (ctx.instance.wss_enabled) {
        ports.push({'port': ctx.instance.wss_port, 'type': 'TCP'});
      }

      if (ctx.instance.tls_enabled) {
        ports.push({'port': ctx.instance.tls_port, 'type': 'TCP'});
      }

      var buildFirewallRecord = function(interfaceName, port, type) {
        var record = {
          'id': 'SYS-' + interfaceName + ':' + port + ':' + type,
          'description': 'SYSTEM GENERATED for' + interfaceName + ':' + port,
          'port_base': port,
          'port_max': port,
          'type': type,
          'interface_name': interfaceName
        };
        return record;
      };
      debug('ports.length: ' + ports.length);

      var isCreate = ctx.isNewInstance;
      var FirewallModel = app.models.config_sip_listeners_firewallrules;
      var records = [];

      async.series({
        delete: function(callback) {
          // we need to delete all records for the interface first
          var deleteFilter = {'interface_name': ctx.instance.id};
          FirewallModel.destroyAll(deleteFilter, (err, info) => {
            if (err) return;
            debug('Deleted ' + info.count + ' records.');
            // call the callback
          });
          callback(null, 'DELETE OK');
        },
        save: function(callback) {
          // save firewall records
          async.forEachOf(ports, (value, index, callback) => {
            debug('interfaceName: ' + ctx.instance.id
              + ', index: ' + index + ', value: ' + value
              + ', ports[index].port: ' + ports[index].port);

            var record = buildFirewallRecord(ctx.instance.id,
              value.port, value.type);

            var dbRecord = FirewallModel.create(record,
              (err, models) => {
                if (err) return callback(err);
                debug('Created: ' + models);
                records.push(models);
                callback();
              });
            // var filter = {'interface_name': ctx.instance.id,
            //   'port_base': value, 'port_max': value, 'type': 'TCP'};

            // // return record
            // var dbRecord = FirewallModel.upsertWithWhere(filter, record,
            //   (err, obj) => {
            //     if (err) return callback(err);
            //     debug('Created: ' + obj);
            //     records.push(obj);
            //     callback();
            //   });
          }, err => {
            if (err) console.error(err.message);

            debug('Records inserted START');
            for (var i = 0; i < records.length; i++) {
              debug(records[i].id + ':' + records[i].port_base);
            }
            debug('Records inserted END');
          });
          callback(null, 'SAVE OK');
        }
      },
      // optional callback
      function(err, results) {
        debug('RESULTS START');
        debug('results.delete:' + results.delete);
        debug('results.save:' + results.save);
        debug('RESULTS END');
      });
    } else { // for multi-model update
      // not supported
    }
    next();
  });
};
