const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require('ethereum-cryptography/secp256k1');
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak")
const { utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  // private: a7caf1620206fc7dccab0c3947548d124bc8ea6219fac4b6f81a3abfda54ba15
  "0x496dc550849046720411f57dd5a5ec117b00d155": 100,
  // private: d4a7038e4fde7b0d36cc27e7ab86025a4bbdd2a789b9e42a5a6df8395185ae8e
  "0xf81eb8cfa5ab5158f63c0e23109ed268c2e8e243": 50,
  // private: 4727b1c501db4982e1812ab9bdeffb194d8b52ded83f847d8563f76a85000399
  "0xa5b7193ab3f8f25570af7ea42e8229f27fe072da": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { message, messageHash, signature, recoveryBit } = req.body;
  const mess_obj = JSON.parse(message);
  const recipient = mess_obj.to;
  const amount = mess_obj.amount;
  const senderPublicKey = secp.recoverPublicKey(messageHash, signature, recoveryBit);
  const sender = `0x${toHex(keccak256(senderPublicKey.slice(1)).slice(-20))}`;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
