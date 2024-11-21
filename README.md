# Shape Hackathon

## Setup
This repo is a monorepo with a NextJS frontend and a Hardhat contracts packages, however they are not connected to each other and must be run separately.

```bash 
# change to the packages/contracts directory
cd packages/contracts

# Install dependencies
yarn

# Run the tests
yarn hardhat test
```

```bash 
# change to the packages/frontend directory
cd packages/frontend

# Install dependencies
yarn

# Run the frontend
yarn dev
```
