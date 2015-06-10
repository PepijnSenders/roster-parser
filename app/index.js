module.exports = (function() {

  var express = require('express'),
      app = express(),
      logger = require('morgan'),
      bodyParser = require('body-parser'),
      multer = require('multer'),
      mustacheExpress = require('mustache-express');

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(multer({ dest: __dirname + '/storage' }));

  app.engine('mustache', mustacheExpress());
  app.set('view engine', 'mustache');
  app.set('public', __dirname + '/../public');
  app.set('views', __dirname + '/views');

  app.use(express.static(__dirname + '/../public'));

  app.listen(process.env.PORT || 4000);

  require(__dirname + '/routes')(app);

  return app;

})();