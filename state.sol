pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyContract is ERC721 {

address state;
mapping (address => bool) verified;


constructor() ERC721("MyNFT", "MNFT") {
    state=msg.sender;
    }

// register
function verify(address a) external{
    require(msg.sender==state);
    verified[a]=true;
}

function queryVerified(address a) external view returns (bool){
    if(verified[a]==true){
        return true;
    }else{
        return false;
    }
}
}
