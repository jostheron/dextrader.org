import React, { Component } from "react";
import Layout from '../../components/Layout';
import DexTrader from '../../ethereum/dextrader';
import { Card, Grid, Button, Form, Input, Message, Divider } from 'semantic-ui-react'; 
import web3 from '../../ethereum/web3'
import Router from 'next/router';

class DexTraderShow extends Component {

  state = {
    depositAmount:'',
    depositErrorMessage:'',
    withdrawelErrorMessage:'',
    loading:false
  };

  static async getInitialProps(props) {

    const dexTrader = DexTrader(props.query.address);
    const summary = await dexTrader.methods.getSummary().call();

    return {
      address:props.query.address,
      usdcBalance: summary[0]/1000000,
      wethBalance: summary[1],
      contractBalance: summary[2],
      amountDeposited: summary[3]
    };
  }

  deposit = async (event) => {
    event.preventDefault();
    this.setState({ loading:true, depositErrorMessage:'', withdrawelErrorMessage:'' });

    try {
      const accounts = await web3.eth.getAccounts();
      const dexTrader = DexTrader(this.props.address);
      
      await dexTrader.methods.deposit().send( { from:accounts[0], value: web3.utils.toWei(this.state.depositAmount, 'ether') } );
      Router.replace(`/dextrader/${this.props.address}`);
    } catch (error) {
      this.setState({ depositErrorMessage: error.message });
    }
    this.setState({ loading:false });
  };

  withdraw = async (event) => {
    event.preventDefault();
    this.setState({ loading:true, withdrawelErrorMessage:'', withdrawelErrorMessage:'' });

    try {
      const accounts = await web3.eth.getAccounts();
      const dexTrader = DexTrader(this.props.address);
      
      await dexTrader.methods.withdraw().send( { from:accounts[0] } );
      Router.replace(`/dextrader/${this.props.address}`);
    } catch (error) {
      this.setState({ withdrawelErrorMessage: error.message });
    }
    this.setState({ loading:false });
  };


  renderCards() {

    const {
      address,
      usdcBalance,
      wethBalance,
      contractBalance,
      amountDeposited
    } = this.props;

    const items = [{
      header:this.props.address,
      meta: 'Address of owner',
      description: 'the owner created the trader and can deposit and withdraw money',
      style: { overflowWrap: 'break-word' }
    },{
      header:usdcBalance,
      meta: 'USDC Balance', 
      description: 'this is how much USDC is contained in the contract',
      style: { overflowWrap: 'break-word' }
    },{
      header:web3.utils.fromWei(wethBalance, 'ether'),
      meta: 'WETH Balance (ether)', 
      description: 'this is how much WETH is contained in the contract',
      style: { overflowWrap: 'break-word' }
    },{
      header:web3.utils.fromWei(contractBalance, 'ether'),
      meta: 'Ether Balance', 
      description: 'this is how much ether is contained in the contract',
      style: { overflowWrap: 'break-word' }
    },{
      header:web3.utils.fromWei(amountDeposited, 'ether'),
      meta: 'Amount deposited (ether)', 
      description: 'this is the amount that has been deposited into this trader',
      style: { overflowWrap: 'break-word' }
    }];

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <h3>Dex Trader Details</h3>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              {this.renderCards()}
            </Grid.Column>
            <Grid.Column width={6}>
              <Divider />              
              <Form  onSubmit={this.deposit} error={!!this.state.depositErrorMessage}>
                <Form.Field>
                  <label>Deposit Amount</label>
                  <Input 
                  label='ether' 
                  labelPosition='right' 
                  value={this.state.depositAmount}
                  onChange={event => this.setState({ depositAmount: event.target.value })}
                  />
                </Form.Field>
                <Message
                  error
                  header='There was some errors with your submission'
                  content={this.state.depositErrorMessage}
                />
                <Button primary loading={this.state.loading}>Deposit!</Button>
              </Form>
              <Divider />              
              <Form  onSubmit={this.withdraw} error={!!this.state.withdrawelErrorMessage}>
                <Form.Field>
                  <label>Withdraw balance</label>
                </Form.Field>

                <Message
                  error
                  header='There was some errors with your submission'
                  content={this.state.withdrawelErrorMessage}
                />
                <Button primary loading={this.state.loading}>Withrdaw!</Button>
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default DexTraderShow;





