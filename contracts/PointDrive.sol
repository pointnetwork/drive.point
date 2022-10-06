// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "point-contract-manager/contracts/IIdentity.sol";

/// @title Identity contract
/// @notice This contracts control drive related features in Point Network.
contract PointDrive is Initializable, UUPSUpgradeable, OwnableUpgradeable{

    /// Stricture to store elements, files or folders
    struct StorageElement {
        string eElementId;
        string eName;
        string eFullPath;
        address owner;
        uint256 createdAt;
        uint256 sizeInBytes;
        bool isFolder;
        bool isPublic;
        string eSymmetricObj;
        bool isShared;
    }
    //the address of the identity contract to be used 
    address private _identityContractAddr;
    //the handle that was used to register this contract
    string private _identityHandle;
    //maps the owner and path pair to a StorageElement
    mapping(address => mapping(string => StorageElement)) private _ownerPathToElementMap;
    //maps the owner and path pair to a list of childrens of this path
    mapping(address => mapping(string => string[])) private _ownerPathToChildrensPathsMap;

    //event of adding a file
    event FileAdd(string eId,
        string eName, 
        string eFullPath,
        string eParentPath,
        uint256 size, 
        bool isPublic);
    
    //event of adding a folder
    event FolderAdd(string eName, 
        string eFullPath,
        string eParentPath,
        bool isPublic);

    /// Initializer method, called once by the proxy when it is deployed.
    /// Setup and initialize constant values for the contract.
    /// @param identityContractAddr - the address of identity contract
    /// @param identityHandle - the handle tha will be used to register this contract
    function initialize(address identityContractAddr, string calldata identityHandle) public initializer onlyProxy {
        __Ownable_init();
        __UUPSUpgradeable_init();
        _identityContractAddr = identityContractAddr;
        _identityHandle = identityHandle;
    }
    
    /// Function that is called to authorize upgrade of the proxy, if don't revert is authorized.
    /// Only the owner of the contract can authorize the upgrade of the proxy.
    function _authorizeUpgrade(address) internal view override {
        require(IIdentity(_identityContractAddr).isIdentityDeployer(_identityHandle, msg.sender), 
            "You are not a deployer of this identity");
    }

    /// Modifier to check if an address is authorized to access certain path
    /// @param owner - the address to be checked
    /// @param eFullPath - the path to be checked
    modifier onlyAuthorized(address owner, string memory eFullPath) {
        require (isAuthorized(owner, eFullPath), "Access denied");
        _;
    }

    /// Checks if an address is authorized to access certain path
    /// @param owner - the address to be checked
    /// @param eFullPath - the path to be checked
    function isAuthorized(address owner, string memory eFullPath) public view returns(bool){
        return  bytes(eFullPath).length == 0 || 
                _ownerPathToElementMap[owner][eFullPath].isPublic == true || 
                _ownerPathToElementMap[owner][eFullPath].owner == msg.sender;
    }

    /// Creates a new file
    /// @param eId - the id of the file in arweave
    /// @param eName - the encrypted name of the file
    /// @param eFullPath - the encrypted full path of the file
    /// @param eParentPath - the encrypted parent path of the file
    /// @param size - the size of the file
    /// @param isPublic - if the file is public
    /// @param eSymmetricObj - the encrypted symmetric object used to encrypt the file and its metadata (name and path)
    function newFile(string calldata eId, 
        string calldata eName, 
        string calldata eFullPath, 
        string calldata eParentPath,
        uint256 size, 
        bool isPublic, 
        string calldata eSymmetricObj) public{
        
        //empty 
        require(bytes(eId).length != 0, "Id cannot be empty");
        require(bytes(eName).length != 0, "Name cannot be empty");
        require(bytes(eFullPath).length != 0, "Path cannot be empty");

        //already exists
        StorageElement memory _intendedPah = _ownerPathToElementMap[msg.sender][eFullPath];
        require(bytes(_intendedPah.eName).length == 0, "Path already exists");

        //compatible parent permission
        if(bytes(eParentPath).length != 0){
            //if parent is not root

            //parent must exists
            StorageElement memory _parent = _ownerPathToElementMap[msg.sender][eParentPath];
            require(bytes(_parent.eName).length != 0, "Parent path does not exists");

            //if is public parent must be public
            if(isPublic){
                require(_parent.isPublic, "Cannot create a public file inside a private one");
            }
        }
        //else root is always public

        //link the file with the folder
        _ownerPathToChildrensPathsMap[msg.sender][eParentPath].push(eFullPath);

        //add the file to the storage
        _ownerPathToElementMap[msg.sender][eFullPath] = StorageElement(
            eId,
            eName,
            eFullPath,
            msg.sender,
            block.timestamp,
            size,
            false,
            isPublic,
            eSymmetricObj,
            false
        );

        emit FileAdd(eId, eName, eFullPath, eParentPath, size, isPublic);
    }

    /// Create a new folder
    /// @param eName - the encrypted name of the folder
    /// @param eFullPath - the encrypted path of the folder
    /// @param eParentPath - the encrypted path from the parent of the folder
    /// @param isPublic - if the folder is public
    /// @param eSymmetricObj - the encrypted symmetric object used to encrypt the folder and its metadata (name and path)
    function newFolder(string calldata eName,
        string calldata eFullPath, 
        string calldata eParentPath,
        bool isPublic,
        string calldata eSymmetricObj) public{
        
        //empty 
        require(bytes(eName).length != 0, "Name cannot be empty");
        require(bytes(eFullPath).length != 0, "Path cannot be empty");

        //already exists
        StorageElement memory _intendedPah = _ownerPathToElementMap[msg.sender][eFullPath];
        require(bytes(_intendedPah.eName).length == 0, "Path already exists");

        //compatible parent permission
        if(bytes(eParentPath).length != 0){
            //if parent is not root

            //parent must exists
            StorageElement memory _parent = _ownerPathToElementMap[msg.sender][eParentPath];
            require(bytes(_parent.eName).length != 0, "Parent path does not exists");

            //if is public parent must be public
            if(isPublic){
                require(_parent.isPublic, "Cannot create a public folder inside a private one");
            }
        }
        //else root is always public

        //link the folder with the parent folder
        _ownerPathToChildrensPathsMap[msg.sender][eParentPath].push(eFullPath);

        _ownerPathToElementMap[msg.sender][eFullPath] = StorageElement(
            eFullPath, 
            eName, 
            eFullPath, 
            msg.sender,
            block.timestamp,
            0,
            true,
            isPublic,
            eSymmetricObj,
            false
        );

        emit FolderAdd(eName, eFullPath, eParentPath, isPublic);
    }


    /// List the elementos of a folder
    /// @param owner - the owner of the folder
    /// @param eFullPath - the encrypted path of the folder
    /// @param shared - If the file is shared
    function listElements(address owner, string memory eFullPath, bool shared) public view 
                onlyAuthorized(owner, eFullPath) returns (StorageElement[] memory) {
        
        //get all paths which are children from the parameter path
        string[] memory paths = _ownerPathToChildrensPathsMap[owner][eFullPath];
        
        //check the authorization for each path found, and add to the list only the authorized ones
        bool[] memory authorizedIndex = new bool[](paths.length);
        uint256 aCount = 0;
        for (uint256 i = 0; i < paths.length; i++) {
            if (isAuthorized(owner, paths[i]) == true){
                if(shared == true){
                    if(_ownerPathToElementMap[owner][paths[i]].isShared == true){
                        authorizedIndex[i] = true; 
                        aCount++;    
                    }
                }else{
                    if (_ownerPathToElementMap[owner][paths[i]].isShared == false){
                        authorizedIndex[i] = true; 
                        aCount++;
                    }
                }
            }
        }
        
        //create the return array with the correct size of authorized paths and fill it
        StorageElement[] memory elements = new StorageElement[](aCount);
        uint256 j = 0;
        for (uint256 i = 0; i < paths.length; i++) {
            if(authorizedIndex[i] == true){
                if(shared == true){
                    if(_ownerPathToElementMap[owner][paths[i]].isShared == true){
                        elements[j] = _ownerPathToElementMap[owner][paths[i]];
                        j++;
                    }
                }else{
                    if (_ownerPathToElementMap[owner][paths[i]].isShared == false){
                        elements[j] = _ownerPathToElementMap[owner][paths[i]];
                        j++;
                    }
                }
                
            }
        }
        //return the elements
        return elements;
    }


    /// Get the element metadata from a file or folder
    /// @param owner - the owner of the file or folder
    /// @param eFullPath - the encrypted path of the folder
    function getElementMetadata(address owner, string calldata eFullPath) public view 
                onlyAuthorized(owner, eFullPath) returns (StorageElement memory){
        return _ownerPathToElementMap[owner][eFullPath];
    }



    /// Share a file with public
    /// @param eFullPath - the encrypted path of the file
    /// @param symmetricObj - the decrypted symmetric object of the file
    function shareToPublic(string memory eFullPath, string memory symmetricObj) public{
        require(bytes(_ownerPathToElementMap[msg.sender][eFullPath].eFullPath).length != 0, "Element cannot be empty or root folder");
        require(!_ownerPathToElementMap[msg.sender][eFullPath].isFolder, "Cannot change visibility to public of a folder");
        require(bytes(symmetricObj).length != 0, "SymmetricObj cannot be empty");
        
        _ownerPathToElementMap[msg.sender][eFullPath].isPublic = true;
        _ownerPathToElementMap[msg.sender][eFullPath].eSymmetricObj = symmetricObj;
    }


    /// Share file with specific identities
    /// @param sharedWith - the address to share the file
    /// @param eFullOriginalPath - the original full path of the file been shared
    /// @param eId - the id of the file in arweave
    /// @param eName - the encrypted name of the file
    /// @param eFullPath - the encrypted full path of the file
    /// @param size - the size of the file    
    /// @param eSymmetricObj - the encrypted symmetric object used to encrypt the file and its metadata (name and path)
    function shareFileWith(address sharedWith,
                    string calldata eFullOriginalPath,
                    string calldata eId, 
                    string calldata eName, 
                    string calldata eFullPath,
                    uint256 size, 
                    string memory eSymmetricObj) onlyAuthorized(msg.sender, eFullOriginalPath) public {
        
        //todo: more validations?

        //link the file with the folder
        _ownerPathToChildrensPathsMap[sharedWith][""].push(eFullPath);

        //add the file to the storage
        _ownerPathToElementMap[sharedWith][eFullPath] = StorageElement(
            eId,
            eName,
            eFullPath,
            sharedWith,
            block.timestamp,
            size,
            false,
            false,
            eSymmetricObj,
            true
        );
    }

}
