const state = artifacts.require("StateContract");
const product = artifacts.require("ProductContract");
//Revert Assertions
const assert = require("chai").assert;
const truffleAssert = require("truffle-assertions");

contract("state", () => {
  //Checks Whether The state contract is deployed properly or not
  it("Should deploy the state contract properly", async () => {
    const stateDep = await state.deployed();
    //console.log("adres "+stateDep.address);

    assert(stateDep.address !== "");
  });
  //checks whether verify and queryVerified function works properly
  //First we will assert that accounts[1] is unverified
  //Then we will apply verify(accounts[1])
  //Then we will assert that accounts[1] is verified
  // If all assertions hold, that means our functions work properly
  it("Should verify an address", async () => {
    const stateDep = await state.deployed();
    var accounts = await web3.eth.getAccounts();
    var beforeVerify = await stateDep.queryVerified(accounts[1]);
    assert(beforeVerify === false);
    await stateDep.verify(accounts[1]);
    var afterVerify = await stateDep.queryVerified(accounts[1]);
    assert(afterVerify === true);
  });
  //Here I try to verify accounts[2] by using accounts[1] instead of state address
  //I assert an error, since only state can verify the users
  it("Another address other than state should NOT verify an address", async () => {
    const stateDep = await state.deployed();
    var accounts = await web3.eth.getAccounts();
    await truffleAssert.reverts(
      stateDep.verify(accounts[2], { from: accounts[1], gas: 3000000 }),
      "Only state can verify the users"
    );
  });
});

contract("product", () => {
  //Checks Whether The product contract is deployed properly or not
  it("Should deploy the product contract properly", async () => {
    const productDep = await product.deployed();
    assert(productDep.address !== "");
  });
  //Checks Whether Manufacturer can mint a token
  //checking conditions:
  //number of tokens shsould increment by 1
  //hash value of the produced token should be created
  //we assert both of them
  it("Should mint the token properly", async () => {
    const productDep = await product.deployed(); //deploy satırı
    //var accounts = await web3.eth.getAccounts();
    var manufacturerAddress = await productDep.manufacturer.call();
    var beforeCounter = await productDep._tokenIds.call();
    await productDep.mint("serial", "zip", {
      from: manufacturerAddress,
      gas: 3000000,
    });
    var afterCounter = await productDep._tokenIds.call();
    var hashValue = await productDep.hashes.call(afterCounter.toNumber());
    assert(hashValue !== 0); //hash value is created for this tokenId
    assert(1 === afterCounter.toNumber() - beforeCounter.toNumber()); //token counter is incremented by 1
  });
  //Above Manufacturer has created a token with serial = "serial"
  //Now, I am again trying to mint a token with same serial
  //I got the error as expected
  //Therefore test case passes
  it("Should NOT mint the token having same serial number", async () => {
    const productDep = await product.deployed(); //deploy satırı
    var manufacturerAddress = await productDep.manufacturer.call();
    await truffleAssert.reverts(
      productDep.mint("serial", "zipDifferent", {
        from: manufacturerAddress,
        gas: 3000000,
      }),
      "Token should be already unminted"
    );
  });
  //It is tried to mint a token using accounts[1], different from manufacturer
  //It gives error
  //truffleAssert.reverts catches the error and passes the test
  it("Non-manufacturer users should NOT mint the token", async () => {
    const productDep = await product.deployed(); //deploy satırı
    var accounts = await web3.eth.getAccounts();
    await truffleAssert.reverts(
      productDep.mint("serial5", "zip5", { from: accounts[1], gas: 3000000 }),
      "Only manufacturer can mint token"
    );
  });
  //Checks a manufacturer can transfer token properly
  //I transfer token 1 from manufacturer (deployer of this contract)
  //to accounts[1]
  //this functions should assign accounts[1] to waitingtransfers[1]
  //I checked whether it holds or not by asserting
  //assert(accounts[1] === waitingTransfers[1])

  it("Should transfer token properly", async () => {
    const productDep = await product.deployed();
    var manufacturerAddress = await productDep.manufacturer.call();
    var accounts = await web3.eth.getAccounts();
    await productDep.transfer(accounts[1], 1, {
      from: manufacturerAddress,
      gas: 3000000,
    });
    var expected = await productDep.waitingtransfers.call(1);
    assert(accounts[1] === expected);
  });
  //We have transferred token 1 above. Now it is in waitinglist
  //Therefore, when we try to transfer it we have to get an error
  //truffleAssert handles the error and passes the test
  it("Should NOT transfer waiting token", async () => {
    const productDep = await product.deployed();
    var manufacturerAddress = await productDep.manufacturer.call();
    var accounts = await web3.eth.getAccounts();
    await truffleAssert.reverts(
      productDep.transfer(accounts[2], 1, {
        from: manufacturerAddress,
        gas: 3000000,
      }),
      "Waiting token can not be transferred"
    );
  });
  //Check Approve function works properly
  //In above function Miner have sent token 1 to accounts[1]
  //now accounts[1] will be able to approve it
  //I assert that (owner of the token 1) === accounts[1] after executing approve function
  it("Should approve transfer properly", async () => {
    const productDep = await product.deployed();
    var manufacturerAddress = await productDep.manufacturer.call();
    var accounts = await web3.eth.getAccounts();
    await productDep.approveTransfer(1, { from: accounts[1], gas: 3000000 });
    var lastOwner = await productDep.getLastOwner(1, {
      from: accounts[1],
      gas: 3000000,
    });
    assert(accounts[1] === lastOwner);
  });
  //Here, Manufacturer mint another token with id = 2
  //since it belongs to manufacturer, accounts[1] will not be able to transer it to another
  //Here we try to transfer it from accounts[1] and get error
  it("Should NOT transfer a token belonging to others", async () => {
    const productDep = await product.deployed();
    var manufacturerAddress = await productDep.manufacturer.call();
    var accounts = await web3.eth.getAccounts();
    await productDep.mint("serial1", "zip1", {
      from: manufacturerAddress,
      gas: 3000000,
    });
    await truffleAssert.reverts(
      productDep.transfer(accounts[2], 2, { from: accounts[1], gas: 3000000 }),
      "Transferred token should belong to you"
    );
  });
  //Checks Traceback function works properly or not
  //In above test, Manufacturer has sent the token 1 to accounts[1]
  //Now accounts[1] will send to accounts[2] and accounts[2] will be able to traceback
  //we expect that previous owners of token 1 is :
  //manufacturer - accounts[1] - accounts[2]
  //we will check these conditions by assertions
  it("Consumer can traceback the token owners properly", async () => {
    const productDep = await product.deployed();
    var manufacturerAddress = await productDep.manufacturer.call();
    var accounts = await web3.eth.getAccounts();
    await productDep.transfer(accounts[2], 1, {
      from: accounts[1],
      gas: 3000000,
    });
    await productDep.approveTransfer(1, { from: accounts[2], gas: 3000000 });
    var prevOwners = await productDep.trace(1);
    var firstOwner = prevOwners[0].add;
    var secondOwner = prevOwners[1].add;
    var ThirdOwner = prevOwners[2].add;
    assert(firstOwner === manufacturerAddress);
    assert(secondOwner === accounts[1]);
    assert(ThirdOwner === accounts[2]);
  });
  //Here we mint another token with ID = 3. Then manufacturer sends it to accounts[3]
  //Before accounts[3] approves the transfer, manufacturer can can cancel the transfer
  //Here we assert following things:
  //Before cancellation, waitingTransfer[3] should be accounts[3]
  //after cancellation, waitingTransfer[3] should be manufacturer
  //after cancellation, owner of the token 3 is still manufacturer
  it("Owner of the transfer should be able to cancel it before approval", async () => {
    const productDep = await product.deployed();
    var manufacturerAddress = await productDep.manufacturer.call();
    await productDep.mint("serial3", "zip3", {
      from: manufacturerAddress,
      gas: 3000000,
    });
    var accounts = await web3.eth.getAccounts();
    await productDep.transfer(accounts[3], 3, {
      from: manufacturerAddress,
      gas: 3000000,
    });
    var expectedBefore = await productDep.waitingtransfers.call(3);

    assert(expectedBefore === accounts[3], "1");
    await productDep.cancelTransfer(3, {
      from: manufacturerAddress,
      gas: 3000000,
    });
    var expectedAfter = await productDep.waitingtransfers.call(3);
    assert(expectedAfter === "0x0000000000000000000000000000000000000000", "2");
    var lastOwner3 = await productDep.getLastOwner(3);
    assert(lastOwner3 === manufacturerAddress, "3");
  });
  //In this case, manufacturer has token 3. Now he sends it to accounts[3]
  //and accounts[3] approves it.
  //After that manufacturer tries to cancel the transfer but gets error since
  //transfer is approved
  it("Owner of the transfer should NOT be able to cancel it after approval", async () => {
    const productDep = await product.deployed();
    var manufacturerAddress = await productDep.manufacturer.call();
    var accounts = await web3.eth.getAccounts();
    await productDep.transfer(accounts[3], 3, {
      from: manufacturerAddress,
      gas: 3000000,
    });
    await productDep.approveTransfer(3, { from: accounts[3], gas: 3000000 });

    await truffleAssert.reverts(
      productDep.cancelTransfer(3, { from: manufacturerAddress, gas: 3000000 }),
      "Token should be in waiting list"
    );
  });
  //Now accounts[3] has token 3
  //It sends the token to accounts[1] and accounts[2] tries to cancel the transfer
  //We have to get error
  it("Other people who are not owner of the transfer should NOT be able to cancel it", async () => {
    const productDep = await product.deployed();
    var accounts = await web3.eth.getAccounts();
    await productDep.transfer(accounts[1], 3, {
      from: accounts[3],
      gas: 3000000,
    });

    await truffleAssert.reverts(
      productDep.cancelTransfer(3, { from: accounts[2], gas: 3000000 }),
      "You should be the last owner of the token"
    );
  });
});
