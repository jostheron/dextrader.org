import web3 from './web3';
import campaignFactory from '../artifacts/contracts/DexTrader.sol/DexTraderFactory.json';

const instance = new web3.eth.Contract(
	campaignFactory.abi, '0x202160f3778Bc6ed113ca7Fc93Fa51325328B39B'
);

export default instance;