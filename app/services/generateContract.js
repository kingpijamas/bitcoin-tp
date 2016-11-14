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


module.exports = function sendMoneyToMultisig(amountMultisig, originPrivKey, destPubKey) {
    const origin = new Origin(originPrivKey);
    const oracle = new Oracle(ORACLE_PRIV_KEY);

    const pubKeys = [origin.pubKey, destPubKey, oracle.pubKey];
    const multisigAddress = new bitcore.Address(pubKeys, 2);

    const originAddress = origin.address;
    return origin.getUtxos(originAddress).then((utxos) => {

        const multisigTx = bitcore.Transaction()
            .from(utxos)
            .to(multisigAddress, amountMultisig)
            .change(originAddress)
            .sign(originPrivKey); // firmo para mandar mi plata

        origin.broadcast(multisigTx);
        const link = "https://test-insight.bitpay.com/address/" + multisigAddress.toString();
        return link;
    }).catch(console.log);
}

proto = module.exports.prototype;
