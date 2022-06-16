// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./Identity.sol";


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
        require(Identity(_identityContractAddr).isIdentityDeployer(_identityHandle, msg.sender), 
            "You are not a deployer of this identity");
    }

    function newFile(string calldata eId, 
        string calldata eName, 
        string calldata eFullPath, 
        string calldata eParentPath,
        uint256 size, 
        bool isPublic) public{
        
        //any other data integrity verification?
        //check if already exists?
        //allow override? history?

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
            isPublic
        );

        emit FileAdd(eId, eName, eFullPath, eParentPath, size, isPublic);
    }

    function newFolder(string calldata eName, 
        string calldata eFullPath, 
        string calldata eParentPath,
        bool isPublic) public{
        //any other data integrity verification?
        //check if already exists?
        //allow overide? history?

        //link the folder with the parent folder
        _ownerPathToChildrensPathsMap[msg.sender][eParentPath].push(eFullPath);

        _ownerPathToElementMap[msg.sender][eFullPath] = StorageElement(
            "", 
            eName, 
            eFullPath, 
            msg.sender,
            block.timestamp,
            0,
            false,
            isPublic
        );

        emit FolderAdd(eName, eFullPath, eParentPath, isPublic);
    }

    function listElements(address owner, string calldata eFullPath) public view returns (StorageElement[] memory){
        string[] memory paths = _ownerPathToChildrensPathsMap[owner][eFullPath];
        
        StorageElement[] memory elements = new StorageElement[](paths.length);
        for (uint256 i = 0; i < paths.length; i++) {
            elements[i] = _ownerPathToElementMap[owner][paths[i]];
        }
        return elements;
    }

    function getElementMetadata(address owner, string calldata eFullPath) public view returns (StorageElement memory){
        return _ownerPathToElementMap[owner][eFullPath];
    }

}
