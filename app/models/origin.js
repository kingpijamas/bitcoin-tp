'use strict';

var commons = require('../commons.js');
const ContractSignatory = commons.model('contractSignatory');

const bitcore = require('bitcore-lib');

const bitcoreExplorers = require('bitcore-explorers');
const Insight = bitcoreExplorers.Insight;

const network = 'testnet';

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