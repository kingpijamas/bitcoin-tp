'use strict';

module.exports = function homeControllerController(req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
};
