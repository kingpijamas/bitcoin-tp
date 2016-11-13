'use strict';

// const KeyedEntity = require('../../models/keyedEntity');
const ContractSignatory = require('../../models/keyedEntity');

module.exports = function homeControllerController(req, res) {
    var asd = new ContractSignatory("asd");
    // var myService = commons.service("my");
    // myService(); // call the service
    res.render('index');
};
