pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyContract is ERC721 {

// Stores the address of the owner of the contract
address state;
// Stores verified addresses in a mapping. If it is verified then it has a value True in this mapping
mapping (address => bool) verified;

// When the contract is deployed, the address of the owner of this contract, who is in another words the chairman of the state, is stored
// in the -state- variable
constructor() ERC721("MyNFT", "MNFT") {
    state=msg.sender;
    }

// When this function is called by the owner of this contract, the manufacturer or the customer address is verified and stored in the -verified- mapping 
// with the value True
function verify(address a) external{
    require(msg.sender==state);
    verified[a]=true;
}

// When this function is called, the address given as the parameter is checked whether it has been verified or not. 
// If it is then function returns true or else false
function queryVerified(address a) external view returns (bool){
    if(verified[a]==true){
        return true;
    }else{
        return false;
    }
}
}
