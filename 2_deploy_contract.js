var state = artifacts.require("state");
var ProducttContract = artifacts.require("ProducttContract");

module.exports = function(deployer){
  deployer.deploy(state).then(() => state.deployed())
  .then(_instance => deployer.deploy(ProducttContract,_instance.address));

}

