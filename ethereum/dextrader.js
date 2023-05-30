import web3 from "./web3";
import DexTrader from "../artifacts/contracts/DexTrader.sol/DexTrader.json";
 
const dexTrader = (address) => {
  return new web3.eth.Contract(DexTrader.abi, address);
};
export default dexTrader;