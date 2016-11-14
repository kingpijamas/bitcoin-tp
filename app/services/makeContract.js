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
const MIN_SATOSHIS = 100000;
const ORACLE_PRIV_KEY = 'cSXfd8DuArnMr3HhRzZh1yXd7QKNv3ChEuvS6WV4Df8NTv7nZjAW';

module.exports = function startContract(originPrivKey, destPubKey, condition, amountDest) {
    const safeHash = (value) => { return bitcore.crypto.Hash.sha256(new Buffer(value)).toString() };
    console.log("en make contract");

    const origin = new Origin(originPrivKey);
    const oracle = new Oracle(ORACLE_PRIV_KEY);
    const amountForFee = amountDest;
    var destPubKey = bitcore.PublicKey(destPubKey);
    var destAddress = destPubKey.toAddress('testnet');
    console.log(destAddress);

    var contract = { 
        condition: condition, 
        expression: origin.generateContractExpression(condition, destAddress, amountDest), 
        destAddress: destAddress 
    };  
    const pubKeys = [origin.pubKey, destPubKey, oracle.pubKey];  
    console.log(pubKeys);
    const multisigAddress = new bitcore.Address(pubKeys, 2); 
    console.log(multisigAddress);   

    return origin.getUtxos(multisigAddress).then((utxos) => { 
        console.log(utxos); 
        contract.incompleteTx = bitcore.Transaction() 
            .from(utxos[0], pubKeys, 2) 
            .to(destAddress, amountDest) 
            .addData(safeHash(contract.expression)) 
            .change(multisigAddress) 
            .fee(amountForFee);  

        console.log(JSON.stringify(contract.incompleteTx.toJSON()));

        return contract;  

    }).catch(console.log); 
};

proto = module.exports.prototype;
