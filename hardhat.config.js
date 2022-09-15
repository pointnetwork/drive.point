require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
        {
            version: "0.8.0",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 1000
                }
            }
        },
        {
            version: "0.8.4",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 1000
                }
            }
        },
        {
            version: "0.8.7",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 1000
                }
            }
        }
    ],   
    },
    networks: {
        development: {
            url: 'http://localhost:7545'
        }
    },
};
