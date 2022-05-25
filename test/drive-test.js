const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("PointDrive", function () {

  let driveContract;
	let owner;
	let addr1;
	let addr2;
  let addr3;
	let addrs;

  beforeEach(async function () {
		[owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("PointDrive");
    driveContract = await upgrades.deployProxy(factory, [], {kind: 'uups'});
    await driveContract.deployed();
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

      let element = await driveContract.getElementMetadata(fullPath);
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

      let elements = await driveContract.listElements(parent);
      expect(elements.length).to.equal(2);
      expect(elements[0].eName).to.equal(name1);
      expect(elements[1].eName).to.equal(name2);
      expect(elements[0].eFullPath).to.equal(fullPath1);
      expect(elements[1].eFullPath).to.equal(fullPath2);
    });

  });
  
});
