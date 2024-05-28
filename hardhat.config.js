require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      accounts: process.env.PRIVATE_KEY,
    },
    sepolia: {
      url: 'https://ethereum-sepolia.publicnode.com',
      accounts: process.env.PRIVATE_KEY,
    },
    greencandle: {
      url: 'https://rpc-testnet.gca.io',
      accounts: process.env.PRIVATE_KEY,
    }
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
};
