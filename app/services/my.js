'use strict';

var commons = require('../commons.js');
var proto, repo = commons.repository;

const bitcore = require('bitcore-lib');
const Script = bitcore.Script;
const MultiSigScriptHashInput = bitcore.Transaction.Input.MultiSigScriptHash;
const Output = bitcore.Transaction.Output;

const bitcoreExplorers = require('bitcore-explorers');
const Insight = bitcoreExplorers.Insight;

const buffer = require('buffer');
const network = 'testnet';
const MIN_SATOSHIS = 100000;

module.exports = function MyService() {
    const safeHash = (value) => { return bitcore.crypto.Hash.sha256(new Buffer(value)).toString() };

    class KeyedEntity {
        constructor(privKeyWIF) {
            this.privKey = bitcore.PrivateKey.fromWIF(privKeyWIF); // TODO: polymorphism'd be nice
        }

        get pubKey() {
            return this.privKey.toPublicKey();
        }

        get address() {
            return this.pubKey.toAddress();
        }
    }

    class ContractSignatory extends KeyedEntity {
        generateContractExpression(contractCondition, dest, amountDest) {
            return `if (${contractCondition}) { ({ destAddress: '${dest.address}', amount: ${amountDest} }) }`;
        }

        broadcast(tx) {
            const insight = new Insight(network);
            insight.broadcast(tx.toString(), (err, res) =>
                console.log({err: err, res: res})
            );
        }
    }

    class Origin extends ContractSignatory { // 'grandparent'

        startContract({condition, amountDest, amountFee, dest, pubKeys}) {
            // FIXME: change this for custom JSON evaluation!
            var contract = {
                condition: condition,
                expression: this.generateContractExpression(condition, dest, amountDest),
                destAddress: dest.address
            };

            const multisigAddress = new bitcore.Address(pubKeys, 2);
            console.log(multisigAddress);


            return this.getUtxos(multisigAddress).then((utxos) => {
                console.log(utxos);
                contract.incompleteTx = bitcore.Transaction()
                    .from(utxos[0], pubKeys, 2)
                    .to(dest.address, amountForDestination)
                    .addData(safeHash(contract.expression))
                    .change(fromAddress)
                    .fee(amountForFee);

                return contract;

            }).catch(console.log);
        }

        getUtxos(fromAddress) {
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

        //Used to send the grandparent´s money to the multisig address
        payToMultisig(multisigAddress) {
            return this.getUtxos(this.address).then((utxos) => {

                const multisigTx = bitcore.Transaction()
                    .from(utxos)
                    .to(multisigAddress, amountForMultisig)
                    .change(this.address)
                    .sign(this.privKey); // firmo para mandar mi plata

                this.broadcast(multisigTx);
            }).catch(console.log);
        }

    }

    class Destination extends ContractSignatory { // destination: grandson

        signContract(contract) {
            const completeTransaction = contract.incompleteTx.sign(this.privKey);
            console.log(completeTransaction);
            console.log(completeTransaction.isFullySigned());
            contract.incompleteTx = completeTransaction;
            return contract;
        }
    }

    class Oracle extends KeyedEntity {

        signContract(contract) {

            //Verify that the hash of the plane expression is the same as the one in the transaction
            const planeExpression = contract.expression;
            const scriptWithHashedExpression = contract.incompleteTx.outputs[1].script;

            const expectedScript = new Script()
                .add('OP_RETURN')
                .add(new Buffer(safeHash(planeExpression)));
            if (expectedScript.toString() !== scriptWithHashedExpression.toString()) {
                throw "Contract mismatch!";
            }

            //Verify if the condition is true
            if (!this.verifyCondition(contract)) {
                console.log("condition is false");
                return null;
            }

            // If everything is fine, the oracle signs the transaction
            const signedByOracleTransaction = contract.incompleteTx.sign(this.privKey);
            console.log(signedByOracleTransaction);
            contract.incompleteTx = signedByOracleTransaction;
            return contract;
        }

        verifyCondition(contract) {
            let result = eval(contract.expression);
            return result != undefined;
        }
    }

    const originPrivKeyWIF = 'cSXBqf5rXKeJzZ8kvM7PbmZ5xgDRxeSxCJiJoqvqdYSVLpY6rDKj'; // address with BTC in it
    // bitcore.PrivateKey(network).toWIF(); // TODO: receive from user input!
    const origin = new Origin(originPrivKeyWIF); // TODO: check!
    // https://test-insight.bitpay.com/address/mvUvWYqbsAVWqB98GoFya4GeP6nDXAMT2p

    const destPrivKeyWIF = 'cMbjKHpbGvU2BbhjTs1wcBmVs3ePyPR83L9r3vEV2y7yecTMXgiR';
    // bitcore.PrivateKey(network).toWIF(); // TODO: receive from user input!
    const dest = new Destination(destPrivKeyWIF); // TODO: check!
    // https://test-insight.bitpay.com/address/n3ViTrhCPkiGtbEtst33VjLyyTpdc4LULr

    const oraclePrivKeyWIF = 'cSXfd8DuArnMr3HhRzZh1yXd7QKNv3ChEuvS6WV4Df8NTv7nZjAW';
    // bitcore.PrivateKey(network).toWIF(); // TODO: load from file in server!
    const oracle = new Oracle(oraclePrivKeyWIF); // TODO: check!
    // https://test-insight.bitpay.com/address/moTKEPux7HoTTzkCNNGDcyLYFoP7em97e8

    const fromAddress = origin.address;
    const amountForMultisig = 600000;
    const amountForDestination = 300000;
    const amountForFee = 300000;
    const condition = 'true'; // some boolean expression


    //First, grandparent sends the money to a new multisig address
    //The money will leave this address if two of them sign
    const pubKeys = [origin.pubKey, dest.pubKey, oracle.pubKey];
    const multisigAddress = new bitcore.Address(pubKeys, 2);
    console.log(multisigAddress);

    //success, money sent to this address
    // bitcore.Address('2NEYmpFiq3bh446jvmjXztEN3Xo5JYt2PQc')
    // https://test-insight.bitpay.com/address/2NEYmpFiq3bh446jvmjXztEN3Xo5JYt2PQc
    //we already have the money there
    //TODO uncomment this line if you want to send money to the multisig address
    //origin.payToMultisig(multisigAddress);

    //Now the grandparent creates the incomplete transaction and sends it to the grandson

    const contractIncomplete = origin.startContract({condition, amountForDestination, amountForFee, dest, pubKeys});

    const contractSignedByOracle = contractIncomplete.then((contract) =>
         //console.log(contract.incompleteTx);
        //success, I have the incomplete transaction from the multisig address
        oracle.signContract(contract)
    ).catch(console.log);


    var contractSignedBySon = null;

    contractSignedBySon = contractSignedByOracle.then(function(contract) {
            if (contract != null) {
                dest.signContract(contract)
            }
        }
    ).catch(console.log);


    console.log(contractSignedBySon.incompleteTx);

    //TODO uncomment broadcast to make it work


    const fullySignedContract = contractSignedBySon.then(function(contract) {
        if (contract != null ){
        //success, I have a fully signed transaction
            console.log(contract.incompleteTx.isFullySigned())
            //dest.broadcast(contract.incompleteTx)
        }
    }).catch(console.log);



};

proto = module.exports.prototype;
