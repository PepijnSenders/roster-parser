module.exports = (function() {

  var PagesController = require(__dirname + '/controllers/PagesController');

  return function routes(app) {
    app.get('/', PagesController.welcome);
  };

})();