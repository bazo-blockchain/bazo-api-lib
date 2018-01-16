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
      axios.post(that.formatTxHashRequest(header, amount, fee, txCount, sender, recipient, reject))
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
      axios.post(that.formatTransactionSubmission(txHash, txSignature, reject))
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      })
    });
  }
  createAndSubmitTransaction(header, amount, fee, sender, recipient, privateKey) {
    let that = this;
    return new Promise(function(resolve, reject) {
      if (!(amount && fee && sender && recipient && privateKey)) {
        reject();
      }
      that.getAccountInfo(sender)
      .then((res) => {
        that.getTransactionHash(header, amount, fee, res.txCnt, sender, recipient)
        .then((res) => {
          let signature = that.signHash(res, privateKey, reject)
          that.sendRawTransaction(res, signature)
          .then((res) => {
            resolve(true)
          })
          .catch((err) => {
            reject(err)
          })
        })
        .catch((err) => {
          reject(err)
        })
      })
      .catch((err) => {
        reject(err)
      })
    });
  }
  generateKeyPair() {
    let curve = new elliptic.ec('p256');
    let keypair = curve.genKeyPair();
    let publicKey = `${keypair.getPublic().x.toJSON()}${keypair.getPublic().y.toJSON()}`
    let privateKey = keypair.getPrivate().toJSON();
    return {
      privateKey: privateKey,
      publicKey: publicKey
    };
  }


  formatAccountRequest(publicKey) {
    return `${this.formatServerAddress()}account/${publicKey}`;
  }
  formatTxHashRequest(header, amount, fee, txCount, sender, recipient, reject) {
    if (!(amount > 0 && fee > 0 && txCount && sender && recipient)) {
      //this.throwArgumentError();
      reject();
    }
    return `${this.formatServerAddress()}createFundsTx/${header}/${amount}/${fee}/${txCount}/${sender}/${recipient}`;
  }
  formatTransactionSubmission(txHash, signature) {
    if (!(signature && txHash)) {
      return '';
    }
    return `${this.formatServerAddress()}sendFundsTx/${txHash}/${signature}`
  }
  formatServerAddress() {
    if (this.serverAddress.slice(-1) !== '/') {
      return `${this.serverAddress}/`;
    } return this.serverAddress;
  }
  signHash(txHash, privateKey, reject) {
    if (!(txHash && privateKey)) {
      return '';
    }
    let curve = new elliptic.ec('p256')
    let key = curve.keyFromPrivate(privateKey);
    let signature = ''
    signature = key.sign(txHash);

    return signature.r.toJSON() + signature.s.toJSON();
  }
  responseWasSuccessfull(response) {
    if (typeof response === 'object') {
      return true;
    }
    if (response.match(/does not exist/)) {
      return false;
    }
  }
}

module.exports = Bazojs;
