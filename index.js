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
  getFundsTxHash(header=0, amount, fee, txCount, sender, recipient){
    let that = this;
    return new Promise(function(resolve, reject) {
      let requestURL = that.formatFundsTxHash(header, amount, fee, txCount, sender, recipient, reject);
      if (requestURL) {
        axios.post(requestURL)
        .then((res) => {
          resolve(res.data.content[0].detail);
        })
        .catch((err) => {
          reject(err);
        })
      } else {
        reject()
      }
    });
  }


  getAccTxHash(header=0, fee, issuer) {
    let that = this;
    return new Promise(function(resolve, reject) {
      let requestURL = that.formatAccTxHash(header, fee, issuer);
      if (requestURL) {
        axios.post(requestURL)
        .then((res) => {
          resolve(res.data.content);
        })
        .catch((err) => {
          reject(err);
        })
      } else {
        reject()
      }
    });
  }
  getConfigTxHash(header=0, id, payload, fee, txCnt) {
    let that = this;
    return new Promise(function(resolve, reject) {
      let requestURL = that.formatConfigTxHash(header, id, payload, fee, txCnt);
      if (requestURL) {
        axios.post(requestURL)
        .then((res) => {
          resolve(res.data.content);
        })
        .catch((err) => {
          reject(err);
        })
      } else {
        reject()
      }
    });
  }
  sendRawFundsTx(txHash, txSignature){
    let that = this;
    return new Promise(function(resolve, reject) {
      if (that.formatFundsTxURL(txHash, txSignature) === '') {
        reject()
      }
      axios.post(that.formatFundsTxURL(txHash, txSignature))
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      })
    });
  }
  sendRawAccTx(txHash, txSignature){
    let that = this;
    return new Promise(function(resolve, reject) {
      if (that.formatAccTxURL(txHash, txSignature) === '') {
        reject()
      }
      axios.post(that.formatAccTxURL(txHash, txSignature))
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      })
    });
  }
  sendRawConfigTx(txHash, txSignature){
    let that = this;
    return new Promise(function(resolve, reject) {
      if (that.formatConfigTxURL(txHash, txSignature) === '') {
        reject()
      }
      axios.post(that.formatConfigTxURL(txHash, txSignature))
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      })
    });
  }
  createAndSubmitFundsTx(header, amount, fee, sender, recipient, privateKey) {
    let that = this;
    return new Promise(function(resolve, reject) {
      if (!(amount && fee && sender && recipient && privateKey)) {
        reject();
      }
      that.getAccountInfo(sender)
      .then((res) => {
        that.getFundsTxHash(header, amount, fee, res.txCnt, sender, recipient)
        .then((res) => {
          let signature = that.signHash(res, privateKey, reject)
          that.sendRawFundsTx(res, signature)
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
  createAndSubmitAccTx(header, fee, issuer, privateKey) {
    let that = this;
    let newAccount;
    return new Promise(function(resolve, reject) {
      if (!(fee && issuer && privateKey)) {
        reject();
      }
        that.getAccTxHash(header, fee, issuer)
        .then((res) => {
          newAccount = res;
          let signature = that.signHash(res[3].detail, privateKey, reject)
          that.sendRawAccTx(res[3].detail, signature)
          .then((res) => {
            resolve(newAccount)
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

  createAndSubmitConfigTx(header, id, payload, fee, sender, privateKey) {
    let that = this;
    return new Promise(function(resolve, reject) {
      if (!(id && fee && payload && sender && privateKey)) {
        reject();
      }
      that.getAccountInfo(sender)
      .then((res) => {
        that.getConfigTxHash(header, id, payload, fee, res.txCnt)
        .then((res) => {
          let signature = that.signHash(res[0].detail, privateKey, reject)
          that.sendRawFundsTx(res[0].detail, signature)
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
  formatFundsTxHash(header, amount, fee, txCount, sender, recipient) {
    if (!(amount > 0 && fee > 0 && (txCount !== undefined) &&  (txCount !== '') && sender && recipient)) {
      return '';
    }
    return `${this.formatServerAddress()}createFundsTx/${header}/${amount}/${fee}/${txCount}/${sender}/${recipient}`;
  }
  formatAccTxHash(header, fee, issuer) {
    if (!(fee > 0 && issuer)) {
      return '';
    }
    return `${this.formatServerAddress()}createAccTx/${header}/${fee}/${issuer}`;
  }
  formatConfigTxHash(header, id, payload, fee, txCnt) {
    if (!(fee > 0 && (txCnt !== undefined) &&  (txCnt !== '') && id && payload)) {
      return '';
    }
    return `${this.formatServerAddress()}createConfigTx/${header}/${id}/${payload}/${fee}/${txCnt}`;
  }
  formatFundsTxURL(txHash, signature) {
    if (!(signature && txHash)) {
      return '';
    }
    return `${this.formatServerAddress()}sendFundsTx/${txHash}/${signature}`
  }
  formatConfigTxURL(txHash, signature) {
    if (!(signature && txHash)) {
      return '';
    }
    return `${this.formatServerAddress()}sendConfigTx/${txHash}/${signature}`
  }
  formatAccTxURL(txHash, signature) {
    if (!(signature && txHash)) {
      return '';
    }
    return `${this.formatServerAddress()}sendAccTx/${txHash}/${signature}`
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
