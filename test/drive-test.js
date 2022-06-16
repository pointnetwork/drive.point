const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("PointDrive", function () {

  let driveContract;
  let identityContract;
	let owner;
	let addr1;
	let addr2;
  let addr3;
	let addrs;
  let handle = 'drive';

  beforeEach(async function () {
		[owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

    const identityFactory = await ethers.getContractFactory("Identity");
    identityContract = await upgrades.deployProxy(identityFactory, [], {kind: 'uups'});
    await identityContract.deployed();

    const driveFactory = await ethers.getContractFactory("PointDrive");
    driveContract = await upgrades.deployProxy(driveFactory, [identityContract.address, handle], {kind: 'uups'});
    await driveContract.deployed();
  });

  describe("Testing deployment functions", function () {

    it("Should upgrade the proxy by a deployer", async function () {
      await identityContract.setDevMode(true);
      await identityContract.register(
        handle, 
        owner.address, 
        '0xed17268897bbcb67127ed550cee2068a15fdb6f69097eebeb6e2ace46305d1ce',
        '0xe1e032c91d4c8fe6bab1f198871dbafb8842f073acff8ee9b822f748b180d7eb');
      
      await identityContract.addIdentityDeployer(handle, addr1.address);
      const driveFactory = await ethers.getContractFactory("PointDrive");
      let driveFactoryDeployer = driveFactory.connect(addr1);

      await upgrades.upgradeProxy(driveContract.address, driveFactoryDeployer);
    });

    it("Should not upgrade the proxy by a non-deployer", async function () {
      await identityContract.setDevMode(true);
      await identityContract.register(
        handle, 
        owner.address, 
        '0xed17268897bbcb67127ed550cee2068a15fdb6f69097eebeb6e2ace46305d1ce',
        '0xe1e032c91d4c8fe6bab1f198871dbafb8842f073acff8ee9b822f748b180d7eb');
      
      const driveFactory = await ethers.getContractFactory("PointDrive");
      let driveFactoryDeployer = driveFactory.connect(addr1);
      await expect(
        upgrades.upgradeProxy(driveContract.address, driveFactoryDeployer)
      ).to.be.revertedWith('You are not a deployer of this identity');
    });

  });

  describe("Testing owner functions", function () {

    it("Should add new file", async function () {
      await expect(
        driveContract.newFile(
          "hashId",
          "test.txt",
          "/home/diogo/test.txt",
          "/home/diogo",
          200,
          false
        )
      ).to.be.emit(driveContract, 'FileAdd');
    });

    it("Should add new folder", async function () {
      await expect(
        driveContract.newFolder(
          "diogo",
          "/home/diogo",
          "/home",
          false
        )
      ).to.be.emit(driveContract, 'FolderAdd');
    });

    it("Should get file metadata", async function () {
      const id = "hashId";
      const name = "test.txt";
      const fullPath = "/home/diogo/test.txt";
      const parent = "/home/diogo";
      const size = 200;
      const isPublic = false;

      await driveContract.newFile(
        id,
        name,
        fullPath,
        parent,
        size,
        isPublic
      );

      let element = await driveContract.getElementMetadata(owner.address, fullPath);
      expect(element.eElementId).to.equal(id);
      expect(element.eName).to.equal(name);
      expect(element.eFullPath).to.equal(fullPath);
      expect(element.owner).to.equal(owner.address);
      expect(element.sizeInBytes).to.equal(size);
      expect(element.isPublic).to.equal(isPublic);
    });

    it("Should list elements", async function () {
      const id = "hashId";
      const name1 = "test1.txt";
      const name2 = "test2.txt";
      const fullPath1 = "/home/diogo/test1.txt";
      const fullPath2 = "/home/diogo/test2.txt";
      const parent = "/home/diogo";
      const size = 200;
      const isPublic = false;

      await driveContract.newFile(
        id,
        name1,
        fullPath1,
        parent,
        size,
        isPublic
      );
      
      await driveContract.newFile(
        id,
        name2,
        fullPath2,
        parent,
        size,
        isPublic
      );

      let elements = await driveContract.listElements(owner.address, parent);
      expect(elements.length).to.equal(2);
      expect(elements[0].eName).to.equal(name1);
      expect(elements[1].eName).to.equal(name2);
      expect(elements[0].eFullPath).to.equal(fullPath1);
      expect(elements[1].eFullPath).to.equal(fullPath2);
    });

  });
  
});
