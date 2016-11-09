'use strict';

var commons = require('../commons.js');
var bitcore = require('bitcore-lib');

var bitcoreExplorers = require('bitcore-explorers');
var Script  = bitcore.Script;

var sjclHash = require('sjcl').hash;

var proto
  , repo = commons.repository
  ;

module.exports = function MyService() {
  var network = 'testnet';

  // origin: grandparent
  // destination: grandson

  var dest = {};
  dest.pubKey = '';


  var Insight = require('bitcore-explorers').Insight

  // create a p2sh multisig output
  // var pubkeys = [
  //   new PublicKey('022df8750480ad5b26950b25c7ba79d3e37d75f640f8e5d9bcd5b150a0f85014da'),
  //   new PublicKey('03e3818b65bcc73a7d64064106a859cc1a5a728c4345ff0b641209fba0d90de6e9'),
  //   new PublicKey('021f2f6e1e50cb6a953935c3601284925decd3fd21bc445712576873fb8c6ebc18'),
  // ];
  // var redeemScript = Script.buildMultisigOut(pubkeys, 2);
  // var script = redeemScript.toScriptHashOut();
  // assert(script.toString() === 'OP_HASH160 20 0x620a6eeaf538ec9eb89b6ae83f2ed8ef98566a03 OP_EQUAL');
  //

  var origin = {};
  origin.privKey = '';
  origin.pubKey = '';
  origin.getUtxos = function(address) {
    var UTXOS = null;
    insight.getUnspentUtxos(address, function (err, utxos) { UTXOS = utxos });
    return UTXOS;
  };
  origin.startContract = function(fromAddress, amount, oracle, dest) {
    var contract = 'if (true) { return ' + dest.pubKey + ' }';

    var oracleScript = Script()
        .add(hash(contract)) // TODO: check !
        .add('OP_DROP 2') // TODO: check!
        .add(dest.pubKey) // TODO: check!
        .add(oracle.pubKey) // TODO: check!
        .add('CHECKMULTISIG');
    // hash(contract) + ' OP_DROP 2 ' + dest.pubKey + ' ' + oracle.pubKey + ' CHECKMULTISIG'

    // var script = redeemScript.toScriptHashOut();

    var utxos = this.getUtxos(fromAddress);
    var incompleteTx = bitcore.Transaction()
        .from(utxos)
        .addOutput(oracleScript.toScriptHashOut())
        .to(address, amount) // TODO: check!
        // .change(address) // TODO: add me eventually
        // .fee(100000) // TODO: add me eventually
        .sign(this.privkey);
  };


  var oracle = {}; // FIXME: cleanup
  oracle.pubKey = ''; // TODO: check!
  oracle.privKey = ''; // TODO: check!
  oracle.measurement = function(expression, outputScript, incompleteTx) {
    if (hash(expression) != outputScript) { // TODO: check!
      throw "";
    }
    if (evaluate(expression) != outputScript.destinationAddress) { // TODO: check!
      throw "";
    }
    incompleteTx.sign();
    return incompleteTx; // TODO: send to dest
  };

  // var privKey = bitcore.PrivateKey(network); // TODO bitcore.PrivateKey.fromWIF(...);
  // var oraclesPubKey = ''; // TODO

  // this.call = function() {
  //   // crear output
  //   // var inputScript = Script('OP_1');
  //   var script = "if (true) return (10.0, 1JxgRXEHBi86zYzHN2U4KMyRCg4LvwNUrp);";
  //   var scriptsHash = sjclHash.sha256(hash);
  //
  //    var tx = bitcore.Transaction()
  //     .from(originUtxos)
  //     .script();
  //
  //   var outputScript = Script(scriptsHash + ' OP_DROP 2 ' + destsPubKey + ' ' + oraclesPubKey + ' CHECKMULTISIG');
  // }
};

proto = module.exports.prototype;
