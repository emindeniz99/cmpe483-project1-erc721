var state = artifacts.require("state");
var product = artifacts.require("product");

module.exports = function(deployer){
  let add = "0x98445ab3eaafdd2293981525631730c64adec41a";
  deployer.deploy(state).then(() => state.deployed())
  .then(_instance => deployer.deploy(product,_instance.address));


  //deployer.deploy(product,add);
}

