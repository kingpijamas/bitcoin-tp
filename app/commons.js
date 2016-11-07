'use strict';

var path = require('path');

var commons = module.exports = {};

commons.controller = function controller(controllerName) {
  return require(path.join(__dirname, 'controllers', controllerName));
};

commons.service = function service(serviceName) {
  return require(path.join(__dirname, 'services', serviceName));
};

commons.repository = function repository(repoName) {
  return require(path.join(__dirname, 'repositories', repoName));
};
