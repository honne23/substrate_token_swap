const JURToken = artifacts.require("JURToken.sol");
const JURBridge = artifacts.require("JURBridge.sol");

module.exports = function(deployer, network, accounts) {
  console.log(accounts);
  deployer.deploy(JURToken, 1000000000, {from: accounts[0]}).then(()=>{
    console.log("deploying bridge");
    return deployer.deploy(JURBridge, JURToken.address, {from: accounts[0]});
  });
  
};