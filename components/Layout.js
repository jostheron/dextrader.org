import React, { useCallback }  from 'react'
import {Container,Divider,Dropdown,Grid,Header,List,Menu,Segment} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import Particles from "react-tsparticles"; 
import { loadFull } from "tsparticles"; 
import data from '../src/particles.json';
import Script from 'next/script';

const FixedMenuLayout = (props) => {
  const particlesInit = async (main) => { 
    await loadFull(main); 
  }; 
  const particlesLoaded = (container) => { 
  }; 

  return (

    <>
      <div className="App" > 
        <Particles
          id="tsparticles" 
          init={particlesInit} 
          loaded={particlesLoaded} 
          options={data} 
        />
        <Menu fixed='top' inverted>
          <Container>
            <Menu.Item as='a' href="/" header>
              Dex Trader
            </Menu.Item>
            <Dropdown item simple text='Actions'>
              <Dropdown.Menu>
                <Dropdown.Item as='a' href="/dextrader/new">Create Trader</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown item simple text='About'>
              <Dropdown.Menu>
                <Dropdown.Item as='a' href="/about"><i aria-hidden="true" className="info icon" />About</Dropdown.Item>
                <Dropdown.Item as='a' target="_blank" href="https://github.com/jostheron/dextrader.org" ><i aria-hidden="true" className="github icon" /> View on github</Dropdown.Item>
                <Dropdown.Item as='a' target="_blank" href="https://etherscan.io/address/0x202160f3778Bc6ed113ca7Fc93Fa51325328B39B" ><i aria-hidden="true" className="ethereum icon" /> View on etherscan</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Container>
        </Menu>
        <Container text style={{ marginTop: '7em' }}>
          {props.children}
        </Container>
        <Segment inverted vertical style={{ padding: '2em', position: 'fixed', bottom: 0, width:"100%"}}> </Segment>
      </div> 

    </>
  );
}

export default FixedMenuLayout


