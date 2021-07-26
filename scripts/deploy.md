# Timelock deploy

## What

Contract module which acts as a timelocked controller. When set as the

owner of an Ownable smart contract, it enforces a timelock on all

onlyOwner maintenance operations. This gives time for users of the

controlled contract to exit before a potentially dangerous maintenance

operation is applied

## How

Here is an example using the rinkeby test network 

### Step 1. Configure the .env file, adding the private key and  network-specific url
```properties
## .env
RINKEBY_PRIVATE_KEY=0x9977fdeb37d51a2d53a43a8b7b8b61fff3fd839de0ed50859f7632884721a8bd
RINKEBY_URL=https://eth-rinkeby.alchemyapi.io/v2/XsJhY4PwGyjTlByPl5Z59PN-35EZZId

```

### Step 2. Deploy the Contracts with Proxy
```shell
npx hardhat run --network ropsten scripts/deploy-proxy.js
```
A message should appear saying your contract was deployed to an Address, in this example:

Proxy: **0x719A8D43aE6418D6ea87E84BC6Cb3d2DEcA0BC91**

Proxy admin: **0xe57aef8ffafbff621a9d8bb7ba0588be6cf7c4bd**

Navigate to Etherscan and go to your Contract.
The example Proxy Contract is:
https://rinkeby.etherscan.io/address/0x719A8D43aE6418D6ea87E84BC6Cb3d2DEcA0BC91#code

Click More Options, and click “Is this a Proxy?”, Click Verify

Now the **implementation address** is shown: 

Implementation: **0xca6b95e6443fa8d925e9d69e5bb0ea5fd28a6dd6**

### Step 3. Deploy the TimeLock Contract
```shell
npx hardhat run --network rinkeby scripts/deploy-timelock.js 
```
Timelock: **0xE4D924daD589430Ee09B25B48c0FA982cB34367E**

### Step 4. Transfer Ownership of the Proxy Admin (Administrator of the Proxy, not the actual Proxy) to the TimeLock.
```shell
npx hardhat run --network rinkeby scripts/transfer_ownership.js 
```
### Step 5. Prepare the new upgrade

```shell
npx hardhat run --network rinkeby scripts/prepare_upgrade.js
```
Copy down the new Implementation Address

For details, please refer to
https://forum.openzeppelin.com/t/tutorial-on-using-a-gnosis-safe-multisig-with-a-timelock-to-upgrade-contracts-and-use-functions-in-a-proxy-contract/7272
Step 26 ~ Step 30
