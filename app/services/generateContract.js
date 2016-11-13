'use strict';

var commons = require('../commons.js');
var proto, repo = commons.repository;

//const Origin = commons.model('origin');

const bitcore = require('bitcore-lib');
const Script = bitcore.Script;
const MultiSigScriptHashInput = bitcore.Transaction.Input.MultiSigScriptHash;
const Output = bitcore.Transaction.Output;

const bitcoreExplorers = require('bitcore-explorers');
const Insight = bitcoreExplorers.Insight;

const buffer = require('buffer');

const network = 'testnet';
const MIN_SATOSHIS = 100000;
const ORACLE_PRIV_KEY = 'cSXfd8DuArnMr3HhRzZh1yXd7QKNv3ChEuvS6WV4Df8NTv7nZjAW';

module.exports = function startContract(originPrivKey, destPrivKey, condition, amountDest) {
    const destAddress = getAddress(destPrivKey);
    const amountForFee = amountDest;

    var contract = {
        condition: condition,
        expression: generateContractExpression(condition, destAddress, amountDest),
        destAddress: destAddress
    };

    const pubKeys = [getPublicKey(originPrivKey), getPublicKey(destPrivKey), getPublicKey(ORACLE_PRIV_KEY)];

    const multisigAddress = new bitcore.Address(pubKeys, 2);
    console.log(multisigAddress);


    return getUtxos(multisigAddress).then((utxos) => {
        console.log(utxos);
        contract.incompleteTx = bitcore.Transaction()
            .from(utxos[0], pubKeys, 2)
            .to(destAddress, amountDest)
            .addData(safeHash(contract.expression))
            .change(multisigAddress)
            .fee(amountForFee);

        return contract.incompleteTx.toJSON();

    }).catch(console.log);
};

module.exports = function getPublicKey(privKey) {
    const privK = bitcore.PrivateKey.fromWIF(privKey);
    return privK.toPublicKey();
}

module.exports = function getAddress(privKey) {
    const privK = bitcore.PrivateKey.fromWIF(privKey);
    return privK.toAddress();
}

module.exports = function generateContractExpression(contractCondition, destAddress, amountDest) {
    return `if (${contractCondition}) { ({ destAddress: '${destAddress}', amount: ${amountDest} }) }`;
}

module.exports = function getUtxos(fromAddress) {
    return new Promise(
        (resolve, reject) => {
            let insight = new Insight(network);
            insight.getUnspentUtxos(fromAddress, (error, utxos) => {
                if (error) { reject(error) }
                resolve(utxos);
            });
        }
    );
}

module.exports = function broadcast(tx) {
    const insight = new Insight(network);
    insight.broadcast(tx.toString(), (err, res) =>
        console.log({err: err, res: res})
    );
}

module.exports = function sendMoneyToMultisig(amountMultisig, originPrivKey, destPrivKey) {
    const pubKeys = [getPublicKey(originPrivKey), getPublicKey(destPrivKey), getPublicKey(ORACLE_PRIV_KEY)];
    const multisigAddress = new bitcore.Address(pubKeys, 2);

    const originAddress = getAddress(originPrivKey);
    return getUtxos(originAddress).then((utxos) => {

        const multisigTx = bitcore.Transaction()
            .from(utxos)
            .to(multisigAddress, amountMultisig)
            .change(originAddress)
            .sign(originPrivKey); // firmo para mandar mi plata

        broadcast(multisigTx);
        const link = "https://test-insight.bitpay.com/address/" + multisigAddress.toString();
        return link;
    }).catch(console.log);
}

module.exports = function MyService() {

    const safeHash = (value) => { return bitcore.crypto.Hash.sha256(new Buffer(value)).toString() };


    const startContract = (originPrivKey, destPrivKey, condition, amountDest) => {
        //const origin = new Origin(originPrivKey);
        //const dest = new Destination(destPrivKey);
        //const oracle = new Oracle(ORACLE_PRIV_KEY);

        const destAddress = getAddress(destPrivKey);
        const amountForFee = amountDest;

        var contract = {
            condition: condition,
            expression: generateContractExpression(condition, destAddress, amountDest),
            destAddress: destAddress
        };

        const pubKeys = [getPublicKey(originPrivKey), getPublicKey(destPrivKey), getPublicKey(ORACLE_PRIV_KEY)];

        const multisigAddress = new bitcore.Address(pubKeys, 2);
        console.log(multisigAddress);


        return getUtxos(multisigAddress).then((utxos) => {
            console.log(utxos);
            contract.incompleteTx = bitcore.Transaction()
                .from(utxos[0], pubKeys, 2)
                .to(destAddress, amountDest)
                .addData(safeHash(contract.expression))
                .change(multisigAddress)
                .fee(amountForFee);

            return contract.incompleteTx.toJSON();

        }).catch(console.log);
    }

    const sendMoneyToMultisig = (amountMultisig, originPrivKey, destPrivKey) => {
        const pubKeys = [getPublicKey(originPrivKey), getPublicKey(destPrivKey), getPublicKey(ORACLE_PRIV_KEY)];
        const multisigAddress = new bitcore.Address(pubKeys, 2);

        const originAddress = getAddress(originPrivKey);
        return getUtxos(originAddress).then((utxos) => {

          const multisigTx = bitcore.Transaction()
                .from(utxos)
                .to(multisigAddress, amountMultisig)
                .change(originAddress)
                .sign(originPrivKey); // firmo para mandar mi plata

            broadcast(multisigTx);
            const link = "https://test-insight.bitpay.com/address/" + multisigAddress.toString();
            return link;
        }).catch(console.log);
    }

    const getPublicKey = (privKey) => {
        const privK = bitcore.PrivateKey.fromWIF(privKey);
        return privK.toPublicKey();
    }

    const getAddress = (privKey) => {
        const privK = bitcore.PrivateKey.fromWIF(privKey);
        return privK.toAddress();
    }

    const generateContractExpression = (contractCondition, destAddress, amountDest) => {
        return `if (${contractCondition}) { ({ destAddress: '${destAddress}', amount: ${amountDest} }) }`;
    }

    const getUtxos = (fromAddress) => {
        return new Promise(
            (resolve, reject) => {
                let insight = new Insight(network);
                insight.getUnspentUtxos(fromAddress, (error, utxos) => {
                    if (error) { reject(error) }
                    resolve(utxos);
                });
            }
        );
    }

    const broadcast = (tx) => {
        const insight = new Insight(network);
        insight.broadcast(tx.toString(), (err, res) =>
            console.log({err: err, res: res})
        );
    }

    const originPrivK = 'cSXBqf5rXKeJzZ8kvM7PbmZ5xgDRxeSxCJiJoqvqdYSVLpY6rDKj';
    const destPrivK = 'cMbjKHpbGvU2BbhjTs1wcBmVs3ePyPR83L9r3vEV2y7yecTMXgiR';
    const condition = 'true';
    const amountForDestination = 300000;
    const amountForMultisig = 600000;


    const link = sendMoneyToMultisig(amountForMultisig, originPrivK, destPrivK);
    //const contractIncomplete = startContract(originPrivK, destPrivK, condition, amountForDestination);

   // contractIncomplete.then((transactionJson) =>
     //   console.log(transactionJson)
        //success, I have the incomplete transaction from the multisig address
 //   ).catch(console.log);
};

proto = module.exports.prototype;
