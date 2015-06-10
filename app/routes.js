module.exports = (function() {

  var PagesController = require(__dirname + '/controllers/PagesController'),
      ParseController = require(__dirname + '/controllers/ParseController');

  return function routes(app) {
    app.get('/', PagesController.welcome);
    app.post('/parse', ParseController.parse);
  };

})();