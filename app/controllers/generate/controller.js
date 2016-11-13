'use strict';

var commons = require('../../commons.js');

module.exports = function generateControllerController(req, res) {
    var myService = commons.service("generateContract");
    myService(); // call the service
    res.render('generate');

};
