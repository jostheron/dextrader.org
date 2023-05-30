import React, { Component } from 'react';
import Layout from '../../components/Layout';
import { Button, Form, Input, Message, Divider, Card, Header } from 'semantic-ui-react';
import factory from '../../ethereum/factory';
import web3 from '../../ethereum/web3';
import Router from 'next/router';

class DexTraderNew extends Component {

	state = {
		errorMessage:'',
		loading:false
	};

	onSubmit = async (event) => {
		event.preventDefault();
		this.setState({ loading:true, errorMessage:'' });

		try {
			const accounts = await web3.eth.getAccounts();
			await factory.methods.createDexTrader().send( { from:accounts[0] } );
			Router.push('/');
		} catch (error) {
			this.setState({ errorMessage: error.message });
		}
		this.setState({ loading:false });
	};

	render() {
		return (
			<Layout>
		        <Card fluid>
		            <Card.Content>
		                <Card.Description>
		                    <Header as='h3'>Create a Dex trader</Header>
		                    <Divider />
							<Form  onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
								<Message
								    error
								    header='There was some errors with your submission'
								    content={this.state.errorMessage}
								  />
								<Button primary loading={this.state.loading}>Create!</Button>
							</Form>
		                </Card.Description>
		            </Card.Content>
		        </Card>
  

			</Layout>
		)
	}
}

export default DexTraderNew;