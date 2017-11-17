'use strict';

module.exports = function(app) {
  var config = require('../api/controllers/controller-config.js');

  app.use('/api/config/generate', function(req, res, next) {
      var AccessToken = app.models.AccessToken;
      var token = new AccessToken({id: req.query['access_token']});
      
      token.validate((err, isValid) => {
        if(err) return res.sendStatus(500);
        if(!isValid) return res.sendStatus(403);
        next();
      });
    });
  
  app.use('/api/config/generate', function(req, res, next) {
      req.models = app.models;
      next();
    });

  app.route('/api/config/generate')
     .post(config.generate);
};