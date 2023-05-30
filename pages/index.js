import React, { Component } from "react";
import factory from "../ethereum/factory";
import { Card, Button, Icon, Header } from 'semantic-ui-react';
import Layout from '../components/Layout';
import Link from 'next/link'

class DexTraderFactoryIndex extends Component {
	//this is next server side,note the static method
  static async getInitialProps() {
    let dexTraders = [];

    try {
      dexTraders = await factory.methods.getDeployedDexTraders().call();
    } catch (error) {
      console.log("an exception");
    }

    return { dexTraders };
  }
  renderDexTraders() {
    const items = this.props.dexTraders.map((address) => {
      return {
        header: address,
        description: (
               <Link href={`/dextrader/${address}`}>View Trader</Link>
            ),
        fluid: true,
      };
    });
    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <div>
          <Header as='h1'>Current Traders</Header>
          {this.renderDexTraders()}
        </div>
      </Layout>
    );
  }
}

export default DexTraderFactoryIndex;
