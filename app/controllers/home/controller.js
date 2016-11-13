'use strict';

var commons = require('../../commons.js');

module.exports = function homeControllerController(req, res) {
    //var myService = commons.service("my");
    //myService(); // call the service
    res.render('index');

};