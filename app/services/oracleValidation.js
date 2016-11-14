'use strict';

const KeyedEntity = require('../models/keyedEntity');
const ContractSignatory = require('../models/contractSignatory');
const Origin = require('../models/origin');
const Destination = require('../models/destination');
const Oracle = require('../models/oracle');


var commons = require('../commons.js');

var proto, repo = commons.repository;


const bitcore = require('bitcore-lib');

const bitcoreExplorers = require('bitcore-explorers');
const Insight = bitcoreExplorers.Insight;

const buffer = require('buffer');

const network = 'testnet';
const ORACLE_PRIV_KEY = 'cSXfd8DuArnMr3HhRzZh1yXd7QKNv3ChEuvS6WV4Df8NTv7nZjAW';

module.exports = function validateAndSignByOracle(destPrivKey, condition, amountForDest, transactionJson) {

    const destination = new Destination(destPrivKey);
    const oracle = new Oracle(ORACLE_PRIV_KEY);
    var destAddress = destination.address;
    console.log(destAddress);

    var transaction = bitcore.Transaction(transactionJson);

    var contract = {
        condition: condition,
        expression: destination.generateContractExpression(condition, destAddress, amountForDest),
        destAddress: destAddress,
        incompleteTx: transaction
    };

    return oracle.signContract(contract);
};

proto = module.exports.prototype;
