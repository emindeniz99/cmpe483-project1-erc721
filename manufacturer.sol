pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyProducttContract is ERC721 {
        using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address manufacturer;
        address stateContractAddress;//local vm 

    constructor(address _stateContractAddress) ERC721("GameItem", "ITM") {
        manufacturer=msg.sender;
stateContractAddress=_stateContractAddress;
    }

        struct Owner{
            address add;
            bool isVerified;
        }

          event Success(bool success,bool isVerified);
          event Log(string log);

    mapping(uint => Owner[]) private prev_owners;

    // hash of serial number and zipcode
    mapping(uint => uint256) private hashes;

    mapping(uint => address ) public waitingtransfers;

//TODO: 
    mapping(string => uint256 ) public serialNumbers;  // serialnumber -> tokenid
    // ??? 0 means not minted token, we use 1 for startindex


/**
    mapping(address => bool ) manufacturers;

    function registerFabrika(address fabrika) public {
        manufacturers[fabrika]=true;
    }
*/
    function mint(string memory serial_number,string memory zipcode) public  {
        emit Log("gas price:");

        emit Log(string(Strings.toString( tx.gasprice   )));
        emit Log("gas current:");

        emit Log(string(Strings.toString( gasleft()   )));


        require(serialNumbers[serial_number]==0); // indicator for unminted token for the serial no

        _tokenIds.increment();

                emit Log(zipcode);
        emit Log(serial_number);

        emit Log("aa1");

        uint256 newItemId = _tokenIds.current();
        serialNumbers[serial_number]=newItemId; // serial no

                emit Log("aa2");

        _mint(msg.sender, newItemId);
                emit Log("aa3");

        hashes[newItemId]=uint256(keccak256( abi.encodePacked(serial_number,zipcode)));
                emit Log("aa4");
        emit Log(string(Strings.toString(hashes[newItemId])));
        emit Log(string(Strings.toString(newItemId)));

       // require(manufacturers[msg.sender]==true);
        require(msg.sender==manufacturer);
        emit Log("aa5");


      prev_owners[newItemId].push(
            Owner(
                msg.sender,
                callQueryVerified(stateContractAddress, msg.sender)
             )
        );
        emit Log("aa6");
 emit Log("gas current:");

        emit Log(string(Strings.toString( gasleft()   )));

    }

//view olacak mı???
     function callQueryVerified(address contractaddr, address newOwner) public  returns(bool) { 
        //_addr.call{value: msg.value, gas: 5000}(
            // buradaki memory????

        (bool  success, bytes memory data) = contractaddr.call(
            abi.encodeWithSignature("queryVerified(address)", newOwner)
        );

            (bool isVerified) = abi.decode(data, (bool));
        emit Success(success,isVerified);
       return  isVerified;
    }  

    // User will do transfer using safeTransferFrom public function and this function will be envoked 
    // emin , gönderici
    // gözdeye alım izni verir
    function transfer(
        address to,
        uint256 tokenId
    ) public virtual { // TODO? virtual ne??

    require(waitingtransfers[tokenId]==address(0));

        require(prev_owners[tokenId][prev_owners[tokenId].length-1].add==msg.sender);

        waitingtransfers[tokenId]=to;
        

    }

        // should be called by next owner
        // gözde, alıcı
        function approveTransfer(uint256 tokenId) public {
            require(msg.sender==waitingtransfers[tokenId]);
        address from=prev_owners[tokenId][prev_owners[tokenId].length-1].add;
        address to = msg.sender;
                _transfer(from, to, tokenId);
            //    require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");

                    prev_owners[tokenId].push(Owner(
                to,
                callQueryVerified(stateContractAddress, to)
             ));

           delete waitingtransfers[tokenId];

        }

        function trace(uint256 tokenId) public view returns (Owner  [] memory){
        
        
     //   emit Log(string(Strings.toString(prev_owners[tokenId])));

    Owner [] memory temp=new Owner[](prev_owners[tokenId].length);
    for(uint256 i=0;i<prev_owners[tokenId].length;i++){
    
    temp[i]=(prev_owners[tokenId][i]);
    }

        return temp;


        }

}
