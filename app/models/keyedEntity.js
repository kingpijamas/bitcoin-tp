'use strict';

const bitcore = require('bitcore-lib');

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

module.exports = KeyedEntity;