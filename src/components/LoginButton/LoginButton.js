/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import { Button, Collapse, FormGroup, ControlLabel, FormControl, HelpBlock, Grid, Row, Col,
Modal, Navbar, Nav, NavItem, Well, Alert} from 'react-bootstrap';
import history from '../../core/history';
import { setUserToSession } from '../../core/appUtils';


class LoginButton extends React.Component {

    constructor(props){
        super(props);
        this.state = {showModal:false, form: {}, formError: ""};
        this.close = this.close.bind(this);
        this.processLogin = this.processLogin.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.responseGoogle = this.responseGoogle.bind(this);
    }
    handleChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.setState({
          [name]: value
        });
    }
    open(){
        this.setState({ showModal: true });
    }
    close() {
        this.setState({ showModal: false });
    }
    processLogin(){
        var personId,
        email = this.state.email,
        password = this.state.password,
        _this = this;

        if(email && password){
          fetch('/login', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({
              email: email,
              password: password,
            }),
            credentials: 'include'
          })
          .then((res) => { return res.json(); })
          .then(function(responseData){
                setUserToSession(responseData);
                history.push('/myProjects');
                _this.close();
          }).catch(function(error){
              _this.setState({formError:error});
          });
        } else {
          _this.setState({formError:"Invalid Credential"});
        }
    }
      responseGoogle(response){
        this.close();
        console.log(response);
        var person = response.profileObj;
        var signinObj = this;
        Config.pipeClient.savePerson(person.name, person.email).then(response => {
                console.log(response);
                if(response){
                     setUserToSession(response);
                     signinObj.props.updateUser(response);
                     signinObj.close();
                }

        });
      }
      render(){
          return !this.props.signedIn && (
                <span>
                     <Button bsStyle="primary" onClick={ ()=> this.setState({ showModal: !this.state.showModal, formError:""})} >Login</Button>
                      <div className="static-modal">
                         <Modal show={this.state.showModal} onHide={this.close}>
                           <Modal.Header>
                             <Modal.Title>Modal title</Modal.Title>
                           </Modal.Header>

                           <Modal.Body>
                                {this.state.formError && <Alert bsStyle="danger" className="text-center">{this.state.formError}<br/></Alert>}
                                <FormGroup
                                  controlId="formBasicText">
                                  <ControlLabel>Email</ControlLabel>
                                  <FormControl type="email" name="email" value={this.state.form.email} placeholder="Email" onChange={this.handleChange}/>
                                  <ControlLabel>Password</ControlLabel>
                                  <FormControl type="password" name="password" value={this.state.form.password} placeholder="Password" onChange={this.handleChange}/>
                                </FormGroup>
                           </Modal.Body>

                           <Modal.Footer>
                             <Button onClick={this.close}>Close</Button>
                             <Button bsStyle="primary" type="submit" onClick={this.processLogin}>Login</Button>
                           </Modal.Footer>

                         </Modal>
                       </div>
                 </span>
          );
      }
}

export default LoginButton;
