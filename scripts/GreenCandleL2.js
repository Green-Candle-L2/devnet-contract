const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Green Candle", function () {
  let GreenCandleL2, token, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    GreenCandleL2 = await ethers.getContractFactory("contracts/GreenCandleL2.sol:GreenCandleL2");
    token = await GreenCandleL2.deploy("Green Candle", "GCA", ethers.utils.parseEther("1000"));
    await token.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right name, symbol, and decimals", async function () {
      expect(await token.name()).to.equal("Green Candle");
      expect(await token.symbol()).to.equal("GCA");
      expect(await token.decimals()).to.equal(18);
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      await token.transfer(addr1.address, ethers.utils.parseEther("50"));
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(ethers.utils.parseEther("50"));

      await token.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("50"));
      const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(ethers.utils.parseEther("50"));
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);

      await expect(
        token.connect(addr1).transfer(owner.address, ethers.utils.parseEther("1"))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should not allow self-transfers", async function () {
      await expect(
        token.transfer(owner.address, ethers.utils.parseEther("0"))
      ).to.be.revertedWith("ERC20: transfer to self not allowed");
    });
  });

  describe("Allowance", function () {
    it("Should allow only contract to approve tokens", async function () {
      await expect(token.approve(addr1.address, ethers.utils.parseEther("100"))).to.be.revertedWith("Approve must be called via the token contract");

      await token.transfer(addr1.address, ethers.utils.parseEther("100"));
      await token.connect(addr1).transfer(token.address, ethers.utils.parseEther("100"));
      await token.connect(token).approve(addr1.address, ethers.utils.parseEther("100"));

      expect(await token.allowance(addr1.address, addr1.address)).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should update allowances properly", async function () {
      await token.transfer(addr1.address, ethers.utils.parseEther("100"));
      await token.connect(addr1).transfer(token.address, ethers.utils.parseEther("100"));
      await token.connect(token).approve(addr1.address, ethers.utils.parseEther("100"));

      await token.connect(addr1).increaseAllowance(addr2.address, ethers.utils.parseEther("50"));
      expect(await token.allowance(addr1.address, addr2.address)).to.equal(ethers.utils.parseEther("50"));

      await token.connect(addr1).decreaseAllowance(addr2.address, ethers.utils.parseEther("25"));
      expect(await token.allowance(addr1.address, addr2.address)).to.equal(ethers.utils.parseEther("25"));
    });

    it("Should fail if trying to increase/decrease allowance without contract call", async function () {
      await expect(token.increaseAllowance(addr1.address, ethers.utils.parseEther("50"))).to.be.revertedWith("Increase allowance must be called via the token contract");
      await expect(token.decreaseAllowance(addr1.address, ethers.utils.parseEther("50"))).to.be.revertedWith("Decrease allowance must be called via the token contract");
    });
  });
});
