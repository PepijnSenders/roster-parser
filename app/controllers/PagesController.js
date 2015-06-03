module.exports = (function() {

  var PagesController = {

    welcome: function(req, res) {
      res.render('welcome');
    }

  };

  return PagesController;

})();