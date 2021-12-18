var state = artifacts.require("StateContract");
var ProductContract = artifacts.require("ProductContract");

module.exports = function (deployer) {
  deployer
    .deploy(state)
    .then(() => state.deployed())
    .then((_instance) => deployer.deploy(ProductContract, _instance.address));
};
