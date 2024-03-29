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
          "test.txt",
          "",
          200,
          false,
          ''
        )
      ).to.be.emit(driveContract, 'FileAdd');
    });

    it("Should add new folder", async function () {
      await expect(
        driveContract.newFolder(
          "diogo",
          "diogo",
          "",
          false,
          ''
        )
      ).to.be.emit(driveContract, 'FolderAdd');
    });

    it("Should get file metadata", async function () {
      const id = "hashId";
      const name = "test.txt";
      const fullPath = "test.txt";
      const parent = "";
      const size = 200;
      const isPublic = false;

      await driveContract.newFile(
        id,
        name,
        fullPath,
        parent,
        size,
        isPublic,
        ''
      );

      let element = await driveContract.getElementMetadata(owner.address, fullPath);
      expect(element.eElementId).to.equal(id);
      expect(element.eName).to.equal(name);
      expect(element.eFullPath).to.equal(fullPath);
      expect(element.owner).to.equal(owner.address);
      expect(element.sizeInBytes).to.equal(size);
      expect(element.isPublic).to.equal(isPublic);
    });

    it("Should denny access to get private file metadata from other users", async function () {
      const id = "hashId";
      const name = "test.txt";
      const fullPath = "test.txt";
      const parent = "";
      const size = 200;
      const isPublic = false;

      await driveContract.connect(addr1).newFile(
        id,
        name,
        fullPath,
        parent,
        size,
        isPublic,
        ''
      );
      await expect(
        driveContract.getElementMetadata(addr1.address, fullPath)
      ).to.be.revertedWith('Access denied');
    });

    it("Should grant access to get public file metadata from other users", async function () {
      const id = "hashId";
      const name = "test.txt";
      const fullPath = "test.txt";
      const parent = "";
      const size = 200;
      const isPublic = true;

      await driveContract.connect(addr1).newFile(
        id,
        name,
        fullPath,
        parent,
        size,
        isPublic,
        ''
      );
      await expect(
        driveContract.getElementMetadata(addr1.address, fullPath)
      ).not.to.be.revertedWith('Access denied');
    });

    it("Should list public elements", async function () {
      const id = "hashId";
      const name1 = "test1.txt";
      const name2 = "test2.txt";
      const fullPath1 = "test1.txt";
      const fullPath2 = "test2.txt";
      const parent = "";
      const size = 200;
      const isPublic = true;

      await driveContract.newFile(
        id,
        name1,
        fullPath1,
        parent,
        size,
        isPublic,
        ''
      );

      await driveContract.newFile(
        id,
        name2,
        fullPath2,
        parent,
        size,
        isPublic,
        ''
      );

      let elements = await driveContract.listElements(owner.address, parent, false);
      expect(elements.length).to.equal(2);
      expect(elements[0].eName).to.equal(name1);
      expect(elements[1].eName).to.equal(name2);
      expect(elements[0].eFullPath).to.equal(fullPath1);
      expect(elements[1].eFullPath).to.equal(fullPath2);
    });

    it("Should list my private elements", async function () {
      const id = "hashId";
      const name1 = "test1.txt";
      const name2 = "test2.txt";
      const fullPath1 = "test1.txt";
      const fullPath2 = "test2.txt";
      const parent = "";
      const size = 200;
      const isPublic = false;

      await driveContract.newFile(
        id,
        name1,
        fullPath1,
        parent,
        size,
        isPublic,
        ''
      );

      await driveContract.newFile(
        id,
        name2,
        fullPath2,
        parent,
        size,
        isPublic,
        ''
      );

      let elements = await driveContract.listElements(owner.address, parent, false);
      expect(elements.length).to.equal(2);
      expect(elements[0].eName).to.equal(name1);
      expect(elements[1].eName).to.equal(name2);
      expect(elements[0].eFullPath).to.equal(fullPath1);
      expect(elements[1].eFullPath).to.equal(fullPath2);
    });

    it("Should not list private elements of other users", async function () {
      const id1 = "hashId1";
      const id2 = "hashId1";
      const name1 = "test1.txt";
      const name2 = "test2.txt";
      const fullPath1 = "home/test1.txt";
      const fullPath2 = "home/test2.txt";
      const parent = "home";
      const size = 200;

      await driveContract.connect(addr1).newFolder(
        "home",
        "home",
        "",
        true,
        ''
      )

      await driveContract.connect(addr1).newFile(
        id1,
        name1,
        fullPath1,
        parent,
        size,
        true,
        ''
      );

      await driveContract.connect(addr1).newFile(
        id2,
        name2,
        fullPath2,
        parent,
        size,
        false,
        ''
      );

      await driveContract.connect(addr1).newFolder(
        "diogo",
        "home/diogo",
        "home",
        true,
        ''
      )

      let elements = await driveContract.listElements(addr1.address, parent, false);
      expect(elements.length).to.equal(2);
      expect(elements[0].eName).to.equal(name1);
      expect(elements[0].eFullPath).to.equal(fullPath1);
      expect(elements[1].eName).to.equal("diogo");
      expect(elements[1].eFullPath).to.equal("home/diogo");

      elements = await driveContract.listElements(addr1.address, parent, true);
      expect(elements.length).to.equal(0);
    });

  });

  describe("Testing data sharing functions", function () {

    const id1 = "hashId1";
    const name1 = "test1.txt";
    const fullPath1 = "home/test1.txt";
    const parent = "home";
    const size = 200;
    const symmetricObject = "symmetricObject";

    it("Share to public", async function () {
      await driveContract.connect(addr1).newFolder(
          "home",
          "home",
          "",
          true,
          ''
      )

      await driveContract.connect(addr1).newFile(
          id1,
          name1,
          fullPath1,
          parent,
          size,
          false,
          ''
      );

      let fileMetadata = await driveContract.connect(addr1).getElementMetadata(
          addr1.address,
          fullPath1
      );
      // should be not public because create as private
      expect(fileMetadata.isPublic).false;

      //Access to a private element from thirdparty account should be denied
      await expect(driveContract.connect(addr2).getElementMetadata(
          addr1.address,
          fullPath1
      )).to.be.revertedWith("Access denied");

      await driveContract.connect(addr1).shareToPublic(
          fullPath1,
          symmetricObject
      );

      fileMetadata = await driveContract.connect(addr1).getElementMetadata(
          addr1.address,
          fullPath1
      );

      // Should be public because access shared with public
      expect(fileMetadata.isPublic);
    });

    it("Share with address", async function () {
      await driveContract.connect(addr1).newFolder(
          parent,
          parent,
          "",
          true,
          ''
      )

      await driveContract.connect(addr1).newFile(
          id1,
          name1,
          fullPath1,
          parent,
          size,
          false,
          ''
      );

      let fileMetadata = await driveContract.connect(addr1).getElementMetadata(
          addr1.address,
          fullPath1
      );

      // should be not public because create as private
      expect(fileMetadata.isPublic).false;

      //Access to a private element from thirdparty account should be denied
      await expect(driveContract.connect(addr2).getElementMetadata(
          addr2.address,
          fullPath1
      )).to.be.revertedWith("Access denied");

      await driveContract.connect(addr1).shareFileWith(
          addr2.address,
          fullPath1,
          id1,
          name1,
          fullPath1,
          size,
          symmetricObject
      );

      fileMetadata = await driveContract.connect(addr1).getElementMetadata(
          addr1.address,
          fullPath1
      );

      // Should be not public because access shared with specific address
      expect(fileMetadata.isPublic).false;

      fileMetadata = await driveContract.connect(addr2).getElementMetadata(
          addr2.address,
          fullPath1
      );
      
      //It should be shared file from other account
      expect(fileMetadata.isShared);

      //Should find this element shared
      elements = await driveContract.connect(addr2).listElements(addr2.address, "", true);
      expect(elements.length).to.equal(1);
      
      //Should not show any not shared elements
      elements = await driveContract.connect(addr2).listElements(addr2.address, "", false);
      expect(elements.length).to.equal(0);
    });
  });
});
