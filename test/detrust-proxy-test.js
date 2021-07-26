const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");

describe("DeTrust proxy", () => {
  let startReleaseTime,
    initSendBalance,
    timeInterval,
    amountPerTimeInterval,
    nowTimestamp,
    deTrust,
    deployedAddress,
    owner,
    addr1,
    addr2,
    beneficiary,
    beneficiary1,
    trustName,
    revocable;

  beforeEach(async () => {
    const DeTrust = await ethers.getContractFactory("DeTrust");
    [owner, addr1, addr2, beneficiary, beneficiary1] =
      await ethers.getSigners();
    deTrust = await upgrades.deployProxy(DeTrust);

    await deTrust.deployed();

    deployedAddress = deTrust.address;
    initSendBalance = 100;
    timeInterval = 10;
    amountPerTimeInterval = 1;
    nowTimestamp = Math.floor(Date.now() / 1000);
    startReleaseTime = nowTimestamp;
    trustName = "Trust from xxx";
  });

  it("Should get 0 if no balance ", async () => {
    expect(await deTrust.connect(addr1).getBalance(
      addr1.address)).to.equal(0);
  });

  it("Should get balance if send directly to contract", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    expect(await deTrust.connect(addr1).getBalance(
      addr1.address)).to.equal(initSendBalance);
  });

  it("Should get balance if send directly to contract by 1 ether", async () => {
    const decimalInitValue = ethers.utils.parseEther ('1.0') ;
    await addr1.sendTransaction({
      to: deployedAddress,
      value: decimalInitValue,
    });
    expect(await deTrust.connect(addr1).getBalance(
      addr1.address)).to.equal(decimalInitValue);
  });

  it("Should can send balance failed if send more than balance ", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await expect(
      deTrust.connect(addr1).sendBalanceTo(addr2.address, initSendBalance + 1)
    ).to.be.revertedWith("balance insufficient");
  });

  it("Should get left balance after add trust from balance", async () => {
    const totalAmount = 10;
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    expect(await deTrust.connect(addr1).getBalance(
      addr1.address)).to.equal(initSendBalance);
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime,
        timeInterval,
        amountPerTimeInterval,
        totalAmount,
        revocable
      );
    expect(await deTrust.connect(addr1).getBalance(
      addr1.address)).to.equal(initSendBalance - totalAmount);
  });

  it("Should get left balance after add trust success", async () => {
    const overrides = { value: initSendBalance };
    await deTrust
      .connect(addr1)
      .addTrust(
        trustName,
        beneficiary.address,
        startReleaseTime,
        timeInterval,
        amountPerTimeInterval,
        revocable,
        overrides
      );
    const trusts = await deTrust.connect(addr1).getTrustListAsSettlor(
      addr1.address);
    expect(trusts.length).to.equal(1);
  });

  it("Should get settlor trusts size", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime,
        timeInterval,
        amountPerTimeInterval,
        initSendBalance / 2,
        revocable
      );
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary1.address,
        startReleaseTime,
        timeInterval,
        amountPerTimeInterval,
        initSendBalance / 2,
        revocable
      );
    const trusts = await deTrust.connect(addr1).getTrustListAsSettlor(
      addr1.address);
    expect(trusts.length).to.equal(2);
  });

  it("Should get the right trust id", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    expect(
      await deTrust
        .connect(addr1)
        .callStatic.addTrustFromBalance(
          trustName,
          beneficiary.address,
          startReleaseTime,
          timeInterval,
          amountPerTimeInterval,
          initSendBalance,
          revocable
        )
    ).to.equal(1);
  });

  it("Should get the right total amount after top up", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime,
        timeInterval,
        amountPerTimeInterval,
        initSendBalance / 2,
        revocable
      );
    const overrides = { value: initSendBalance / 2 };
    await deTrust.connect(addr1).topUp(1, overrides);
    expect(await deTrust.connect(addr1).getBalance(
      addr1.address)).to.equal(initSendBalance / 2);
  });

  it("Should revert if add more balance for trust", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await expect(
      deTrust
        .connect(addr1)
        .addTrustFromBalance(
          trustName,
          beneficiary.address,
          startReleaseTime,
          timeInterval,
          amountPerTimeInterval,
          initSendBalance + 1,
          revocable
        )
    ).to.be.revertedWith("balance insufficient");
  });

  it("Should revert if add balane to trust not exists", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await expect(
      deTrust.connect(addr1).topUpFromBalance(2, initSendBalance)
    ).to.be.revertedWith("trust not found");
  });

  it("Should get the right total amount after top up from balance", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime,
        timeInterval,
        amountPerTimeInterval,
        initSendBalance / 2,
        revocable
      );
    await deTrust.connect(addr1).topUpFromBalance(1, initSendBalance / 2);
    expect(await deTrust.connect(addr1).getBalance(
      addr1.address)).to.equal(0);
  });

  it("Should get trust list success as settlor", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime,
        timeInterval,
        amountPerTimeInterval,
        initSendBalance / 2,
        revocable
      );
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime,
        timeInterval,
        amountPerTimeInterval,
        initSendBalance / 4,
        revocable
      );

    const d = await deTrust.connect(addr1).getTrustListAsSettlor(
      addr1.address);
    expect(d[0].name).to.equal(trustName);
    expect(d[0].totalAmount).to.equal(initSendBalance / 2);
    expect(d[1].totalAmount).to.equal(initSendBalance / 4);
  });

  it("Should get trust list success as beneficiary", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime,
        timeInterval,
        amountPerTimeInterval,
        initSendBalance / 2,
        revocable
      );
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime,
        timeInterval,
        amountPerTimeInterval,
        initSendBalance / 4,
        revocable
      );

    const d = await deTrust.connect(beneficiary).getTrustListAsBeneficiary(
      beneficiary.address);
    expect(d[0].name).to.equal(trustName);
    expect(d[0].totalAmount).to.equal(initSendBalance / 2);
    expect(d[1].totalAmount).to.equal(initSendBalance / 4);
  });

  it("Should revert if no trust found for release", async () => {
    await expect(deTrust.connect(addr1).release(1)).to.be.revertedWith(
      "trust not found"
    );
  });

  it("Should revert if try to release other's trust", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime,
        timeInterval,
        amountPerTimeInterval,
        initSendBalance,
        revocable
      );
    await expect(deTrust.connect(addr2).release(1)).to.be.revertedWith(
      "beneficiary error"
    );
  });

  it("Should have release success", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        revocable
      );
    await expect(
      await deTrust.connect(beneficiary).release(1)
    ).to.changeEtherBalance(beneficiary, amountPerTimeInterval);
  });

  it("Should have releaseTo success", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        revocable
      );
    await expect(
      await deTrust.connect(beneficiary).releaseTo(1, addr2.address)
    ).to.changeEtherBalance(addr2, amountPerTimeInterval);
  });

  it("Should revert if no trust found for releaseAll", async () => {
    await expect(deTrust.connect(addr1).releaseAll()).to.be.revertedWith(
      "nothing to release"
    );
  });

  it("Should revert if try to get money before startReleaseTime", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime + 1000,
        timeInterval,
        amountPerTimeInterval,
        initSendBalance,
        revocable
      );
    await expect(deTrust.connect(beneficiary).releaseAll()).to.be.revertedWith(
      "nothing to release"
    );
  });

  it("Should have releaseAll success", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        revocable
      );
    await expect(
      await deTrust.connect(beneficiary).releaseAll()
    ).to.changeEtherBalance(beneficiary, amountPerTimeInterval);
  });

  it("Should release works for more than one trust", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        revocable
      );
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval * 2,
        amountPerTimeInterval * 2,
        revocable
      );
    await expect(
      await deTrust.connect(beneficiary).releaseAll()
    ).to.changeEtherBalance(beneficiary, amountPerTimeInterval * 3);
  });

  it("Should have no trust left at all after releaseAll", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        revocable
      );
    await expect(
      await deTrust.connect(beneficiary).releaseAll()
    ).to.changeEtherBalance(beneficiary, amountPerTimeInterval);
    const result = await deTrust
      .connect(beneficiary)
      .getTrustListAsBeneficiary(beneficiary.address);
    expect(result.length).to.be.equal(0);
  });

  it("Should have some trust left after releaseAll", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        revocable
      );

    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        revocable
      );

    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime + 100,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        revocable
      );

    await expect(
      await deTrust.connect(beneficiary).releaseAll()
    ).to.changeEtherBalance(beneficiary, amountPerTimeInterval * 2);

    const trusts = await deTrust
      .connect(beneficiary)
      .getTrustListAsBeneficiary(beneficiary.address);
    expect(trusts.length).to.equal(1);
  });

  it("Should emit trust finished event", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });
    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        initSendBalance,
        initSendBalance,
        revocable
      );
    await expect(await deTrust.connect(beneficiary).releaseAll())
      .to.emit(deTrust, "TrustFinished")
      .withArgs(1);
  });

  it("Should releaseAllTo success", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });

    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        revocable
      );

    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        revocable
      );

    await expect(
      await deTrust.connect(beneficiary).releaseAllTo(addr2.address)
    ).to.changeEtherBalance(addr2, amountPerTimeInterval * 2);
  });

  it("Should revoke failed if settlor error", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });

    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        false
      );

    await expect(
      deTrust.connect(addr2).revoke(1)
    ).to.be.revertedWith('settlor error');
  });

  it("Should revoke failed if trust not found", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });

    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        false
      );

    await expect(
      deTrust.connect(addr2).revoke(2)
    ).to.be.revertedWith('trust not found');
  });

  it("Should revoke failed if trust is not revocable", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });

    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        false
      );

    await expect(
      deTrust.connect(addr1).revoke(1)
    ).to.be.revertedWith('trust irrevocable');
  });

  it("Should revoke success", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });

    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        amountPerTimeInterval,
        true,
      );

    await expect(
      await deTrust.connect(addr1).revoke(1)
    ).to.changeEtherBalance(addr1, amountPerTimeInterval);
  });

  it("Should get empty list after release all trust success", async () => {
    const overrides = { value: initSendBalance };
    await deTrust
      .connect(addr1)
      .addTrust(
        trustName,
        beneficiary.address,
        startReleaseTime - 10,
        timeInterval,
        initSendBalance,
        revocable,
        overrides
      );

    await deTrust.connect(beneficiary).releaseAll();
    const trusts = await deTrust.connect(addr1).getTrustListAsSettlor(
      addr1.address);
    expect(trusts.length).to.equal(0);
  });

  it("Should get trust right after release all success", async () => {
    const overrides = { value: initSendBalance };
    await deTrust
      .connect(addr1)
      .addTrust(
        trustName,
        beneficiary.address,
        startReleaseTime - 10,
        timeInterval,
        amountPerTimeInterval,
        revocable,
        overrides
      );

    await deTrust
      .connect(addr1)
      .addTrust(
        trustName,
        beneficiary.address,
        startReleaseTime - 10,
        timeInterval,
        amountPerTimeInterval,
        revocable,
        overrides
      );

    await deTrust.connect(beneficiary).releaseAll();

    const trusts = await deTrust.connect(addr1).getTrustListAsSettlor(
      addr1.address);
    expect(trusts.length).to.equal(2);
    expect(trusts[1].name).to.equal(trustName);
  });

  it("Should add next release time after release", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });

    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime - timeInterval,
        timeInterval,
        amountPerTimeInterval,
        initSendBalance,
        revocable
      );

    await deTrust.connect(beneficiary).releaseAll();

    const trusts = await deTrust
      .connect(beneficiary)
      .getTrustListAsBeneficiary(beneficiary.address);

    expect(trusts[0].nextReleaseTime).not.to.equal(
      startReleaseTime - timeInterval);
  });

  it("Should release success right after set startTime to now", async () => {
    await addr1.sendTransaction({
      to: deployedAddress,
      value: initSendBalance,
    });

    await deTrust
      .connect(addr1)
      .addTrustFromBalance(
        trustName,
        beneficiary.address,
        startReleaseTime,
        3600,
        amountPerTimeInterval,
        initSendBalance,
        revocable
      );

    await expect(
      await deTrust.connect(beneficiary).releaseAll()
    ).to.changeEtherBalance(beneficiary, amountPerTimeInterval);
  });

  it("Should revert if the time interval is 0", async () => {
    const overrides = { value: initSendBalance };
    await expect(
      deTrust
        .connect(addr1)
        .addTrust(
          trustName,
          beneficiary.address,
          startReleaseTime,
          0,
          amountPerTimeInterval,
          revocable,
          overrides
        )
    ).to.be.revertedWith('timeInterval should be positive');
  });

});
