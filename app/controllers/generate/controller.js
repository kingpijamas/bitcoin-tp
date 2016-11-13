'use strict';

var commons = require('../../commons.js');

module.exports = function generateControllerController(req, res) {
    var myService = commons.service("generateContract");

    if (req.method === "GET") {
        myService(); // call the service
        res.render('generate');
    } else if (req.method === "POST") {

    }
};
