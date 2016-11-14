'use strict';
var commons = require('../../commons.js');

module.exports = function generateControllerController(req, res) {
    var sendMoneyToMultisig = commons.service("generateContract");

    if (req.method === "GET") {
        res.render('generate');
    } else if (req.method === "POST") {
        if (req.body.bet) {
            var link = sendMoneyToMultisig(600000, 'cSXBqf5rXKeJzZ8kvM7PbmZ5xgDRxeSxCJiJoqvqdYSVLpY6rDKj', 'cMbjKHpbGvU2BbhjTs1wcBmVs3ePyPR83L9r3vEV2y7yecTMXgiR');
            //var link = myService();
            res.render('generate', {title:'data generated', link: link.toString()});
        } else if (req.body.contract) {
            //myService();
            //res.render('generate', {title:'data generated', link: link, json:'{lalal}'});
        }
    }
};