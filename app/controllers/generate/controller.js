'use strict';

var commons = require('../../commons.js');

module.exports = function generateControllerController(req, res) {
    //var myService = commons.service("my");
    //myService(); // call the service
    res.render('generate', {title:'data', link: 'myLink', json:'{lalal}'});

};
