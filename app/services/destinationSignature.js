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

module.exports = function signByDestination(destPrivKey, contract) {

    const destination = new Destination(destPrivKey);

    return destination.signContract(contract);
};

proto = module.exports.prototype;
