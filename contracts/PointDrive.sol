// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "point-contract-manager/contracts/IIdentity.sol";


contract PointDrive is Initializable, UUPSUpgradeable, OwnableUpgradeable{

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
    }
    address private _identityContractAddr;
    string private _identityHandle;

    mapping(address => mapping(string => StorageElement)) private _ownerPathToElementMap;
    mapping(address => mapping(string => string[])) private _ownerPathToChildrensPathsMap;

    event FileAdd(string eId,
        string eName, 
        string eFullPath,
        string eParentPath,
        uint256 size, 
        bool isPublic);
    
    event FolderAdd(string eName, 
        string eFullPath,
        string eParentPath,
        bool isPublic);

    function initialize(address identityContractAddr, string calldata identityHandle) public initializer onlyProxy {
        __Ownable_init();
        __UUPSUpgradeable_init();
        _identityContractAddr = identityContractAddr;
        _identityHandle = identityHandle;
    }
    
    function _authorizeUpgrade(address) internal view override {
        require(IIdentity(_identityContractAddr).isIdentityDeployer(_identityHandle, msg.sender), 
            "You are not a deployer of this identity");
    }

    modifier onlyAuthorized(address owner, string memory eFullPath) {
        require (isAuthorized(owner, eFullPath), "Access denied");
        _;
    }

    function isAuthorized(address owner, string memory eFullPath) public view returns(bool){
        return  bytes(eFullPath).length == 0 || 
                _ownerPathToElementMap[owner][eFullPath].isPublic == true || 
                _ownerPathToElementMap[owner][eFullPath].owner == msg.sender;
    }

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
            eSymmetricObj
        );

        emit FileAdd(eId, eName, eFullPath, eParentPath, size, isPublic);
    }

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
            eSymmetricObj
        );

        emit FolderAdd(eName, eFullPath, eParentPath, isPublic);
    }

    function listElements(address owner, string memory eFullPath) public view 
                onlyAuthorized(owner, eFullPath) returns (StorageElement[] memory) {

        string[] memory paths = _ownerPathToChildrensPathsMap[owner][eFullPath];
        
        bool[] memory authorizedIndex = new bool[](paths.length);
        uint256 aCount = 0;
        for (uint256 i = 0; i < paths.length; i++) {
            if (isAuthorized(owner, paths[i]) == true){
                authorizedIndex[i] = true; 
                aCount++;
            }
        }
        
        StorageElement[] memory elements = new StorageElement[](aCount);
        uint256 j = 0;
        for (uint256 i = 0; i < paths.length; i++) {
            if(authorizedIndex[i] == true){
                elements[j] = _ownerPathToElementMap[owner][paths[i]];
                j++;
            }
        }
        return elements;
    }

    function getElementMetadata(address owner, string calldata eFullPath) public view 
                onlyAuthorized(owner, eFullPath) returns (StorageElement memory){
        return _ownerPathToElementMap[owner][eFullPath];
    }


    function shareToPublic(string memory eFullPath, string memory symmetricObj) public{
        require(bytes(_ownerPathToElementMap[msg.sender][eFullPath].eFullPath).length != 0, "Element cannot be empty or root folder");
        require(!_ownerPathToElementMap[msg.sender][eFullPath].isFolder, "Cannot change visibility to public of a folder");
        require(bytes(symmetricObj).length != 0, "SymmetricObj cannot be empty");
        
        _ownerPathToElementMap[msg.sender][eFullPath].isPublic = true;
        _ownerPathToElementMap[msg.sender][eFullPath].eSymmetricObj = symmetricObj;
    }

}
