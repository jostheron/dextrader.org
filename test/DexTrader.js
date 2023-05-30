const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const ercAbi = [
  "function balanceOf(address owner) view returns (uint256)"
];

describe("Dex Trader contract", function () {

  async function deployDexTraderFactoryFixture() {
    const dexTraderFactoryFactory = await ethers.getContractFactory("DexTraderFactory");
    const [owner, bot] = await ethers.getSigners();

    const dexTraderFactory= await dexTraderFactoryFactory.deploy(bot.address);
    await dexTraderFactory.deployed();

    return { dexTraderFactory, bot };
  }

  async function deployDexTraderFixture() {
    const dexTraderFactory = await ethers.getContractFactory("DexTrader");
    const [ dexFactoryOwner, dexOwner, bot ] = await ethers.getSigners();

    const dexTrader = await dexTraderFactory.deploy(dexOwner.address, bot.address);
    await dexTrader.deployed();

    return { dexTrader, dexOwner, bot };
  }

  async function deployDexTraderFixtureWithDeposit() {

    const { dexTrader, dexOwner, bot } = await loadFixture( deployDexTraderFixture );

    const deposit = await dexTrader.connect(dexOwner).deposit({ value: hre.ethers.utils.parseEther("10") });
    await deposit.wait();

    return { dexTrader, dexOwner, bot };
  }

  describe("Factory Tests", function () {
    
    it("deploys a factory and verify it has an address", async () => {

        const { dexTraderFactory, bot } = await loadFixture(deployDexTraderFactoryFixture);

        expect(dexTraderFactory.address).to.be.a('string');
        expect(dexTraderFactory.address).to.have.lengthOf(42);
        expect(dexTraderFactory.address).to.match(/^0x[a-fA-F0-9]{40}$/);

        expect(bot.address).to.equal(await dexTraderFactory.bot());
    });

    it("Deploys a dextrader", async function () {
      const { dexTraderFactory, bot } = await loadFixture(deployDexTraderFactoryFixture);
      await dexTraderFactory.createDexTrader({ gasLimit: 3000000 });
      const deployedDexTraders = await dexTraderFactory.getDeployedDexTraders();  

      expect(await dexTraderFactory.bot()).to.equal(bot.address);
      expect(deployedDexTraders.length).to.equal(1);
      expect(deployedDexTraders[0]).to.be.a('string');
      expect(deployedDexTraders[0]).to.have.lengthOf(42);
      expect(deployedDexTraders[0]).to.match(/^0x[a-fA-F0-9]{40}$/);

      const DexTrader = await ethers.getContractFactory("DexTrader");
      const dexTrader = await DexTrader.attach(deployedDexTraders[0]);

      expect(await dexTrader.amountDeposited()).to.equal(0);
      expect(await dexTrader.bot()).to.equal(bot.address);
    });
  });

  describe("DexTrader Tests", function async () {

    it("deploy a dextrader and verify its variables", async function () {
      const { dexTrader, dexOwner, bot } = await loadFixture( deployDexTraderFixture );

      expect(dexTrader.address).to.be.a('string');
      expect(dexTrader.address).to.have.lengthOf(42);
      expect(dexTrader.address).to.match(/^0x[a-fA-F0-9]{40}$/);

      expect(await dexTrader.amountDeposited()).to.equal(0);
      expect(await dexTrader.owner()).to.equal(dexOwner.address);
      expect(await dexTrader.bot()).to.equal(bot.address);
    });

    it("deposits some funds and and verify we have USDC", async function () {

      const { dexTrader, dexOwner } = await loadFixture( deployDexTraderFixture );
      const weth = new hre.ethers.Contract("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", ercAbi, dexOwner);
      const usdc = new hre.ethers.Contract("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", ercAbi, dexOwner);

      const dexOwnerEthBalanceBefore = await ethers.provider.getBalance(dexOwner.address);
      const wethBalanceBefore = await weth.balanceOf(dexTrader.address);
      const usdcBalanceBefore = await usdc.balanceOf(dexTrader.address);
      const ethBalanceBefore = await ethers.provider.getBalance(dexTrader.address);

      expect(dexOwnerEthBalanceBefore).to.equal(ethers.utils.parseEther("10000")); 
      expect(wethBalanceBefore).to.equal(ethers.utils.parseEther("0")); 
      expect(usdcBalanceBefore).to.equal(ethers.utils.parseEther("0")); 
      expect(ethBalanceBefore).to.equal(ethers.utils.parseEther("0")); 

      const deposit = await dexTrader.connect(dexOwner).deposit({ value: hre.ethers.utils.parseEther("10") });
      await deposit.wait();

      const amountDeposited = await dexTrader.amountDeposited();
      const dexOwnerEthBalanceAfter = await ethers.provider.getBalance(dexOwner.address);
      const wethBalanceAfter = await weth.balanceOf(dexTrader.address);
      const usdcBalanceAfter = await usdc.balanceOf(dexTrader.address);
      const dexTraderEthBalanceAfter = await ethers.provider.getBalance(dexTrader.address);      

      expect(amountDeposited).to.equal(hre.ethers.utils.parseEther("10"))
      expect(dexOwnerEthBalanceAfter).to.be.greaterThan(ethers.utils.parseEther("9989"));
      expect(dexTraderEthBalanceAfter).to.equal(ethers.utils.parseEther("0")); 
      expect(wethBalanceAfter).to.equal(ethers.utils.parseEther("0"));
      expect(usdcBalanceAfter).to.be.greaterThan(0);
    });

    it("withdraw funds", async function () {

      const { dexTrader, dexOwner } = await loadFixture( deployDexTraderFixtureWithDeposit );
      const weth = new hre.ethers.Contract("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", ercAbi, dexOwner);
      const usdc = new hre.ethers.Contract("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", ercAbi, dexOwner);
      const etherBalanceBefore_dexOwner = await ethers.provider.getBalance(dexOwner.address);
          
      const withdraw = await dexTrader.connect(dexOwner).withdraw();
      await withdraw.wait();

      const amountDeposited = await dexTrader.amountDeposited();
      const etherBalanceAfter_dexTrader = await ethers.provider.getBalance(dexTrader.address);
      const etherBalanceAfter_dexOwner = await ethers.provider.getBalance(dexOwner.address);
      const wethBalanceAfter_dexOwner = await weth.balanceOf(dexTrader.address);
      const usdcBalanceAfter_dexOwner = await usdc.balanceOf(dexTrader.address);

      expect(amountDeposited).to.equal(0)
      expect(etherBalanceAfter_dexOwner).to.be.greaterThan(etherBalanceBefore_dexOwner.add(ethers.utils.parseEther("9")));
      expect(wethBalanceAfter_dexOwner).to.equal(ethers.utils.parseEther("0")); 
      expect(usdcBalanceAfter_dexOwner).to.equal(ethers.utils.parseEther("0")); 
      expect(etherBalanceAfter_dexTrader).to.equal(ethers.utils.parseEther("0"));
      expect(await dexTrader.isTradeOpen()).to.be.false;
     });

    it("Open Trade and close a trade", async function() {
      const { dexTrader, dexOwner, bot } = await loadFixture( deployDexTraderFixtureWithDeposit );
      const weth = new hre.ethers.Contract("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", ercAbi, dexOwner);
      const usdc = new hre.ethers.Contract("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", ercAbi, dexOwner);

      const openTrade = await dexTrader.connect(bot).openTrade();
      await openTrade.wait();

      expect(await dexTrader.isTradeOpen()).to.be.true;
      expect(await weth.balanceOf(dexTrader.address)).to.be.greaterThan(0);
      expect(await usdc.balanceOf(dexTrader.address)).to.equal(0);
      expect(await ethers.provider.getBalance(dexTrader.address)).to.equal(0);

      const closeTrade = await dexTrader.connect(bot).closeTrade();
      await closeTrade.wait();

      expect(await dexTrader.isTradeOpen()).to.be.false;
      expect(await weth.balanceOf(dexTrader.address)).to.be.equal(0);
      expect(await usdc.balanceOf(dexTrader.address)).to.greaterThan(0);
      expect(await ethers.provider.getBalance(dexTrader.address)).to.equal(0);
    });
   });
});

