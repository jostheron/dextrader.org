# dextrader.org
Front end app for dex trader

Instructions

1 - To configure the project you have to first specify an end point to create a fork from. In the /harhat.config.js file update infura api key to your infura api key.

2 - In a terminal window install the dependancies: `npm install`

3 - Then you have to start a node: `npx hardhat node` this will create a mainnet fork using the above end point.

4 - In /scripts/deploy.js update the address to a address allowed to place trades.

5 - Once a local node is running, in a new terminal window deploy the factory: `npx hardhat run scripts/deploy.js --network localhost` this will output an address on your local node.

6 - By default it will point to the factory deployed on mainnet, change this to the address that was created by step 4 above.

7 - And finally run the project: `npm run dev`