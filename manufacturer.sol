// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/** Product Provenance Contract
 */
contract ProductContract is ERC721 {
    // Counter is used for tokenID increment
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;

    // manufacturer address so it is deployer of the contract
    // it is only allowed address for minting
    address public manufacturer;

    // when deploying the contract,
    // state contract address is necessary for checking verified status
    address public stateContractAddress;

    // modifier allows only owner of the contract
    modifier onlyContractOwner() {
        require(msg.sender == manufacturer, "Only manufacturer can mint token");
        _;
    }

    // modifier allows only owner of the token that is given as parameter
    modifier onlyTokenOwner(uint256 tokenId) {
        // check ownership
        require(
            prev_owners[tokenId][prev_owners[tokenId].length - 1].add ==
                msg.sender,
            "You should be the last owner of the token"
        );
        _;
    }

    // constructor takes the state address
    constructor(address _stateContractAddress) ERC721("GameItem", "ITM") {
        // deployer is manufacturer and owner of the contractor
        manufacturer = msg.sender;
        stateContractAddress = _stateContractAddress;
    }

    // record of transaction(new ownership)
    struct Owner {
        address add;
        bool isVerified;
    }

    // Event type for logging
    event Success(bool success, bool isVerified);
    event Log(string log);

    // array of all (current and previous) owners
    // last element of it shows to current owner
    mapping(uint256 => Owner[]) public prev_owners;

    // hash of serial number and zipcode
    mapping(uint256 => uint256) public hashes;

    // when a owner transfer tokenIDX to addressY, the transfer will wait at the this address
    // tokenIDX: addressY // it means waiting transfer
    // when the next owner approve the transfer,
    //it will be removed from waiting transfers and the new record will be added to prev_owners
    // tokenIDX: 0 // it means no waiting transfer for this token
    mapping(uint256 => address) public waitingtransfers;

    // validate the uniqueness of serial number
    // map of serial number and tokenID
    // 0 means not minted token, we use 1 for startindex of tokenIDs
    mapping(string => uint256) public serialNumbers; // serialnumber -> tokenid

    function getLastOwner(uint256 key) public view returns (address) {
        address fromAdd = prev_owners[key][prev_owners[key].length - 1].add;
        return fromAdd;
    }

    // serial_number: unique number for product
    // zipcode: zipcode of manufacturer
    function mint(string memory serial_number, string memory zipcode)
        public
        onlyContractOwner
    {
        emit Log("gas price:");

        emit Log(string(Strings.toString(tx.gasprice)));
        emit Log("gas current:");

        emit Log(string(Strings.toString(gasleft())));

        // check the uniqueness of serial number
        require(
            serialNumbers[serial_number] == 0,
            "Token should be already unminted"
        ); // indicator for unminted token for the serial no

        // increase counter for next available token ID
        _tokenIds.increment();

        emit Log(zipcode);
        emit Log(serial_number);

        emit Log("aa1");

        // new Token ID
        uint256 newItemId = _tokenIds.current();

        // serial number - tokenID map
        serialNumbers[serial_number] = newItemId;

        emit Log("aa2");

        // new Token ID minting process that provided by ERC721Contract to sender adress
        _mint(msg.sender, newItemId);
        emit Log("aa3");

        // hash of serial number and zipcode
        hashes[newItemId] = uint256(
            keccak256(abi.encodePacked(serial_number, zipcode))
        );

        emit Log("aa4");
        emit Log(string(Strings.toString(hashes[newItemId])));
        emit Log(string(Strings.toString(newItemId)));

        // write new(minter) owner to owners history array
        prev_owners[newItemId].push(
            Owner(
                msg.sender,
                // check current verification status of minter
                callQueryVerified(stateContractAddress, msg.sender)
            )
        );
        emit Log("aa6");
        emit Log("gas current:");

        emit Log(string(Strings.toString(gasleft())));
    }

    //view olacak mı???
    // calls queryVerify function of state
    // helper function
    // contractaddr: state contract address
    // newOwner: the address that will be queried for verified status
    function callQueryVerified(address contractaddr, address newOwner)
        internal
        returns (bool)
    {
        //_addr.call{value: msg.value, gas: 5000}(
        // buradaki memory????

        (bool success, bytes memory data) = contractaddr.call(
            abi.encodeWithSignature("queryVerified(address)", newOwner)
        );

        bool isVerified = abi.decode(data, (bool));
        emit Success(success, isVerified);
        return isVerified;
    }

    // to: the address to send the tokenId and the address which is the prospective new owner of the token
    // tokenId: token id of the unique product
    // User can do tokenId transfer by calling this function. If the token is not waiting any user to be accepted by its ownership
    // and if the caller of this function is the last owner of this token then this token is saved in the waitingtransfers mapping.
    // In this mapping, the key is the tokenId in question and the value is the address that is wanted to send. The ownership of the token
    // does not change until the new address accepts this transfer so until that, the tokenId is saved in the waitingtransfers mapping in order
    // to prevent token to be sent to others.
    function transfer(address to, uint256 tokenId)
        public
        virtual
        onlyTokenOwner(tokenId)
    {
        // TODO? virtual ne??

        require(
            waitingtransfers[tokenId] == address(0),
            "Waiting token can not be transferred"
        );

        waitingtransfers[tokenId] = to;
    }

    function cancelTransfer(uint256 tokenId)
        public
        virtual
        onlyTokenOwner(tokenId)
    {
        // TODO? virtual ??

        // check whether waiting transfer for this token exists or not
        require(
            waitingtransfers[tokenId] != address(0),
            "Token should be in waiting list"
        );

        // cancel waiting transfer
        waitingtransfers[tokenId] = address(0);
    }

    // tokenId: the id of the token whose ownership will be changed via this function
    // The address of the user who is requested to be the new owner of a token calls this function to approve the transfer and take its ownership.
    // If the caller of this function is the address waited for the transfer, _transfer function of ERC721.sol library is executed. The new owner is
    // pushed into the prevOwner mapping which stores the address of the users and the boolean variable which states them whether they are verified or not.
    // The new owner and token tuple is deleted from the waitingtransfer mapping.
    function approveTransfer(uint256 tokenId) public {
        require(
            msg.sender == waitingtransfers[tokenId],
            "Token should be sent to you to approve the transfer"
        );
        address from = prev_owners[tokenId][prev_owners[tokenId].length - 1]
            .add;
        address to = msg.sender;
        // _transfer function of the ERC721.sol library is executed
        _transfer(from, to, tokenId);
        //    require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");

        // The address of the new owner is stored in this mapping with its verification status. The new owner stored as an Owner object.
        prev_owners[tokenId].push(
            Owner(to, callQueryVerified(stateContractAddress, to))
        );
        // The address is delted from the waiting transfers mapping because the transfer has been executed successfully.
        delete waitingtransfers[tokenId];
    }

    // get owner history of a token
    // tokenId: which token is traced
    // view function
    function trace(uint256 tokenId) public view returns (Owner[] memory) {
        //   emit Log(string(Strings.toString(prev_owners[tokenId])));

        // create a fixed size temporary array
        Owner[] memory temp = new Owner[](prev_owners[tokenId].length);
        for (uint256 i = 0; i < prev_owners[tokenId].length; i++) {
            temp[i] = (prev_owners[tokenId][i]);
        }

        return temp;
    }
}
