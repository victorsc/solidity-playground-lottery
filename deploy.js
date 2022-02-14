const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const mnemonicPath = path.resolve(__dirname, 'mnemonic.txt');
const mnemonic = fs.readFileSync(mnemonicPath, {encoding: 'utf-8'});

const provider = new HDWalletProvider(
  'REPLACE_WITH_YOUR_MNEMONIC',
  'https://rinkeby.infura.io/v3/b2545a4597e748a88cfa0e8fe0e7e399'
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ gas: '1000000', from: accounts[0] });

  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();
};
deploy();
