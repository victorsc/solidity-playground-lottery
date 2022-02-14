const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const {interface, bytecode} = require('../compile');

let lottery;
let accounts;

beforeEach(async() => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000'});
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('adds a player to the lottery', async () => {
        await lottery.methods.enter()
            .send({
                from: accounts[1],
                value: web3.utils.toWei('0.02', 'ether')
            });
        const players = await lottery.methods.getPlayers().call(); 
        assert.equal(accounts[1], players[0]);
        assert.equal(1, players.length);
    });

    it('adds two players to the lottery', async () => {
        await lottery.methods.enter()
            .send({
                from: accounts[1],
                value: web3.utils.toWei('0.02', 'ether')
            });
        await lottery.methods.enter()
            .send({
                from: accounts[2],
                value: web3.utils.toWei('0.03', 'ether')
            });
        const players = await lottery.methods.getPlayers().call(); 
        assert.deepEqual([accounts[1], accounts[2]], players);
        assert.equal(2, players.length);
    });

    it('accepts players with minimum amount to enter', async () => {
        let e;
        try {
            await lottery.methods.enter()
            .send({
                from: accounts[1],
                value: web3.utils.toWei('0.009', 'ether')
            });
        } catch (err) {
            e = err;
        }
        assert(e);
    });

    it('accepts only manager to call pickWinner', async () => {
        let e;
        try {
            await lottery.methods.pickWinner()
            .send({
                from: accounts[1]
            });
        } catch (err) {
           e = err;
        }
        assert(e);

    });

    it('sends money to the winner and resets players array', async() => {
        const playerAddress = accounts[3];
        await lottery.methods.enter()
            .send({
                from: playerAddress,
                value: web3.utils.toWei('10', 'ether')
            });
        
        const initialBalance = await web3.eth.getBalance(playerAddress);

        await lottery.methods.pickWinner().send({from: accounts[0]});
        
        const finalBalance = await web3.eth.getBalance(playerAddress);

        assert(finalBalance - initialBalance > web3.utils.toWei('9.99', 'ether'));
    })
});