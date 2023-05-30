import React, { Component } from "react";
import Layout from '../components/Layout';
import { Divider,Header,Card,Container } from 'semantic-ui-react';
import 'highlight.js/styles/agate.css';
const hljs = require('highlight.js');
import Link from 'next/link';


class About extends Component {

  componentDidMount() {
    hljs.initHighlightingOnLoad();
  }
	

  render() {

  	const factoryCode = `
contract DexTraderFactory {

    address public bot;
    address[] public deployedDexTraders;

    constructor(address _bot) {
        bot = _bot;
    }

    function createDexTrader() public {
        address newDexTrader = address(new DexTrader(msg.sender, bot));
        deployedDexTraders.push(newDexTrader);
    }
    
    function getDeployedDexTraders() public view returns (address[] memory) {
        return deployedDexTraders;
    }
}
`;

const dexTraderCode = `
contract DexTrader {

    address payable public owner;
    address public bot;
    uint256 public amountDeposited = 0;

    ISwapRouter public immutable swapRouter;
    address public constant swapRouterAddress = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address public constant usdcAddress = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant wethAddress = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    uint24 public constant feeTier = 3000;
    bool public isTradeOpen = false;

    USDC usdc;
    WETH weth;
    
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyBot() {
        require(msg.sender == bot);
        _;
    }

    constructor(address _owner, address _bot) {
        owner = payable(_owner);
        bot = _bot;
        swapRouter = ISwapRouter(swapRouterAddress);
        usdc = USDC(usdcAddress);
        weth = WETH(wethAddress);
    }

    function deposit() external payable onlyOwner{
        weth.deposit{value: msg.value}();
        convertWrapToStable();
        amountDeposited += msg.value;
    }

    function withdraw() external onlyOwner {
        convertStableToWrap();
        uint256 wethBalance = weth.balanceOf(address(this));
        weth.withdraw(wethBalance);
        owner.transfer(wethBalance);
        amountDeposited = 0;
        isTradeOpen = false;
    }

    function openTrade() public onlyBot {
        if (!isTradeOpen) {
            convertStableToWrap();
            isTradeOpen = true;
        }
    }

    function closeTrade() public onlyBot {
        if (isTradeOpen) {
            convertWrapToStable();
            isTradeOpen = false;
        }
    }

    function convertStableToWrap() private {
        uint256 usdcBalance = usdc.balanceOf(address(this));

        TransferHelper.safeApprove(usdcAddress, address(swapRouter), usdcBalance);

        ISwapRouter.ExactInputSingleParams memory params =
          ISwapRouter.ExactInputSingleParams({
              tokenIn: usdcAddress,
              tokenOut: wethAddress, 
              fee: feeTier,
              recipient: address(this),
              deadline: block.timestamp+600,
              amountIn: usdcBalance,
              amountOutMinimum: 0,
              sqrtPriceLimitX96: 0
          });

        swapRouter.exactInputSingle(params);
    }

    function convertWrapToStable() private {
        uint256 wethBalance = weth.balanceOf(address(this));
        TransferHelper.safeApprove(wethAddress, address(swapRouter), wethBalance);

        ISwapRouter.ExactInputSingleParams memory params =
          ISwapRouter.ExactInputSingleParams({
              tokenIn: wethAddress,
              tokenOut: usdcAddress,
              fee: feeTier,
              recipient: address(this),
              deadline: block.timestamp+600,
              amountIn: wethBalance,
              amountOutMinimum: 0,
              sqrtPriceLimitX96: 0
          });

        swapRouter.exactInputSingle(params);
    }

    function getSummary() public view returns (uint256, uint256, uint256, uint256) {
        return (
            usdc.balanceOf(address(this)),
            weth.balanceOf(address(this)),
            address(this).balance,
            amountDeposited
        );
    }

    receive() external payable {}

}  
`;

    return (
      <Layout>
        <Card fluid>
            <Card.Content>
                <Card.Description>
                    <Header as='h1'>About</Header>
                    <Divider />
                    This is the beta version of dex trader, it is not currently open for puclic use. Trading signals is generated off chain using a strategy optimised for the ETHUSDC trading pair.
                    <br />
                    Dextrader uses a factory contract that has been deployed here: <Link target="_blank" href="https://etherscan.io/address/0x202160f3778Bc6ed113ca7Fc93Fa51325328B39B">0x202160f3778Bc6ed113ca7Fc93Fa51325328B39B</Link>
                    <br />
                    The project source code is available on github: <Link target="_blank" href="https://github.com/jostheron/dextrader.org" ><i aria-hidden="true" class="github icon"></i></Link>
                    <br />
                    Or it can be viewed further down below.
                    <br />
                    <Header as='h2'>Summary</Header>
                    <Divider />
                    Once ether is deposited it will be converted into USDC, the USDC balance will be held untill an open trade signal is recieved at which point it will be converted into wrapped ether. 
                    The contract will keep the wrapped ether untill a closed signal is recieved when it will convert it back to USDC. At any stage you can withdraw your contract balance, this will convert any USDC in
                    the contract to wrapped ether and convert that back to ether before sending it back to the owner. Only the owner of a trader can deposit or withdraw ether.
                    <pre><code class="language-cpp">
                    {factoryCode}
                    </code></pre>

                    A deployed dextrader from the factory uses the below source code.

                    <pre><code class="language-cpp">
                    {dexTraderCode}
                    </code></pre>
                </Card.Description>
            </Card.Content>
        </Card>
        <br />
        <br />
        <br />
      </Layout>
    );
  }
}

export default About;
