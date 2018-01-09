const axios = require('axios');
const elliptic = require('elliptic');

class Bazojs {
  constructor(serverAddress) {
    this.serverAddress = serverAddress || 'http://localhost:8001';
  }
  getAccountInfo(publicKey) {
    let that = this;
    return new Promise(function(resolve, reject) {
      axios.get(that.formatAccountRequest(publicKey))
      .then((res) => {
        if (!that.responseWasSuccessfull(res.data)) {
          reject(res.data);
        }
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      })
    });
  }
  getTransactionHash(header=0, amount, fee, txCount, sender, recipient){
    let that = this;
    return new Promise(function(resolve, reject) {
      axios.post(that.formatTxHashRequest(header, amount, fee, txCount, sender, recipient))
      .then((res) => {
        resolve(res.data.content[0].detail);
      })
      .catch((err) => {
        reject(err);
      })
    });
  }
  sendRawTransaction(txHash, txSignature){
    let that = this;
    return new Promise(function(resolve, reject) {
      axios.post(that.formatTransactionSubmission(txHash, txSignature))
      .then((res) => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      })
    });
  }
  createAndSubmitTransaction(header, amount, fee, sender, recipient, privateKey) {
    let that = this;
    that.getAccountInfo(sender)
    .then((res) => {
      console.log('Queried the txCount.. :', res.txCnt);
      that.getTransactionHash(header, amount, fee, res.txCnt, sender, recipient)
      .then((res) => {
        console.log('Queried the Hash.. :', res)
        let signature = that.signHash(res, privateKey)
        console.log('Computed the signature.. :', signature);
        that.sendRawTransaction(res, signature)
        .then((res) => {
          console.log('Successfully submitted the transaction!');
        })
      })
    })
  }
  formatAccountRequest(publicKey) {
    return `${this.formatServerAddress()}account/${publicKey}`;
  }
  formatTxHashRequest(header, amount, fee, txCount, sender, recipient) {
    if (!(amount > 0 && fee > 0 && txCount && sender && recipient)) {
      this.throwArgumentError();
    }
    return `${this.formatServerAddress()}createFundsTx/${header}/${amount}/${fee}/${txCount}/${sender}/${recipient}`;
  }
  formatTransactionSubmission(txHash, signature) {
    if (!(signature && txHash)) {
      this.throwArgumentError();
    }
    return `${this.formatServerAddress()}sendFundsTx/${txHash}/${signature}`
  }
  formatServerAddress() {
    if (this.serverAddress.slice(-1) !== '/') {
      return `${this.serverAddress}/`;
    } return this.serverAddress;
  }
  signHash(txHash, privateKey) {
    if (!(txHash && privateKey)) {
      this.throwArgumentError();
    }
    let curve = new elliptic.ec('p256')
    let key = curve.keyFromPrivate(privateKey);
    let signature = ''
    try {
      signature = key.sign(txHash);
    } catch (e) {
    }
    return signature.r.toJSON() + signature.s.toJSON();
  }
  responseWasSuccessfull(response) {
    if (typeof response === 'object') {
      return true;
    }
    if (response === '') {
      return false;
    }
    if (response.match(/does not exist/)) {
      return false;
    } return true;
  }
  throwArgumentError() {
    throw new Error('Missing arguments');
  }
}

module.exports = Bazojs;
