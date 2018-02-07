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
import store from '../../store/contextStore';
import {RaisedButton, Dialog, TextField, FlatButton} from 'material-ui';
import AlertMessage from '../../common/AlertMessage/AlertMessage';



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
      const {onLogin} = this.props;


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
            .then((responseData)=>{
              if(!responseData.error){
                store.dispatch({ type: 'INIT_CURRENT_USER', currentUser:responseData });
                setUserToSession(responseData);
                history.push('/myProjects');
                this.close();
              } else {
                this.setState({formError:responseData.error});
              }

            }).catch((error)=>{
            this.setState({formError:error});
          });
        } else {
          this.setState({formError:"Invalid Credential"});
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
          const actions = [
                <FlatButton
                  label="Cancel"
                  primary={true}
                  onClick={this.close}
                />,
                <RaisedButton
                  label="Login"
                  primary={true}
                  keyboardFocused={true}
                  onClick={this.processLogin.bind(this)}
                />,
          ];
          return !this.props.signedIn && (
                <span>
                     <RaisedButton label="Login" onClick={ ()=> this.setState({ showModal: !this.state.showModal, formError:""})} primary={true} />
                      <div className="static-modal">
                         <Dialog
                             title="Login to Crewbrick"
                             actions={actions}
                             modal={false}
                             open={this.state.showModal}
                             onRequestClose={this.close}
                           >
                               {this.state.formError && <div className="text-center"><AlertMessage text={this.state.formError}></AlertMessage></div>}

                             <div>
                                  <div><TextField type="email" name="email" value={this.state.form.email} placeholder="Email" onChange={this.handleChange}/></div>
                                  <div><TextField type="password" name="password" value={this.state.form.password} placeholder="password" onChange={this.handleChange}/></div>
                             </div>
                         </Dialog>
                       </div>
                 </span>
          );
      }
}

export default LoginButton;
