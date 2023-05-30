// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.19;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

interface WETH {
    function deposit() external payable;
    function balanceOf(address account) external view returns (uint256);
    function withdraw(uint wad) external;
}

interface USDC {
    function balanceOf(address account) external view returns (uint256);
}

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