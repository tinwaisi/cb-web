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

class SignUpButton extends React.Component {
      constructor(props){
              super(props);
              this.state={form:{}, open: false};
              this.handleChange = this.handleChange.bind(this);
              this.submitForm = this.submitForm.bind(this);
              this.close = this.close.bind(this);
              this.responseGoogle = this.responseGoogle.bind(this);

      }
      handleChange(event) {
          const target = event.target;
          const name = target.name;
          const value = target.type === 'checkbox' ? target.checked : target.value;
          var newForm = _.extend({}, this.state.form);
          newForm[name] = value;
          this.setState({ form: newForm });
        }
      close() {
              this.setState({ open: false });
            }
      submitForm(){
          var form = this.state.form;
          var signinObj = this;
          var customFields = {};
          customFields[Config.PERSON_FIELD_MAP['role']] = form.role;
          customFields[Config.PERSON_FIELD_MAP['password']] = form.password;

          Config.pipeClient.savePerson(this.state.form.name, this.state.form.email, null, null, null, customFields).then(response => {
                      console.log(response);
                      if(response){
                           sessionStorage.setItem('crewbrick', JSON.stringify(response));
                           signinObj.props.updateUser(response);
                           signinObj.close();
                      }

              });

      }
      responseGoogle(response){
        this.close();
        console.log(response);
        var person = response.profileObj;
        var signinObj = this;
        Config.pipeClient.savePerson(person.name, person.email).then(response => {
                console.log(response);
                if(response){
                     sessionStorage.setItem('crewbrick', JSON.stringify(response));
                     signinObj.props.updateUser(response);
                     signinObj.close();
                }

        });
      }
      render(){
          return !this.props.signedIn && (
          <span>
              <Button bsStyle="info" onClick={ ()=> this.setState({ open: !this.state.open })}>
                               Sign Up
                             </Button>
              <div className="static-modal">
                  <Modal show={this.state.open} onHide={this.close}>
                    <Modal.Header>
                      <Modal.Title>Sign Up to Crewbrick</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <FormGroup
                             controlId="formBasicText">
                             <ControlLabel>Full Name</ControlLabel>
                             <FormControl type="text" name="name" value={this.state.form.name} placeholder="Name" onChange={this.handleChange}/>
                             <ControlLabel>Role in Team</ControlLabel>
                             <FormControl type="text" name="role" value={this.state.form.role} placeholder="Role" onChange={this.handleChange}/>
                             <ControlLabel>Email</ControlLabel>
                             <FormControl type="email" name="email" value={this.state.form.email} placeholder="Email" onChange={this.handleChange}/>
                             <ControlLabel>Password</ControlLabel>
                             <FormControl type="password" name="password" value={this.state.form.password} placeholder="Password" onChange={this.handleChange}/>
                         </FormGroup>
                    </Modal.Body>

                    <Modal.Footer>
                      <Button onClick={this.close}>Close</Button>
                      <Button bsStyle="primary" onClick={()=>this.submitForm()}>Sign Up</Button>
                    </Modal.Footer>

                  </Modal>
                </div>
          </span>
          );
      }
}

export default SignUpButton;
