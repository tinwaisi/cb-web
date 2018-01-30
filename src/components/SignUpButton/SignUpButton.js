/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import {SelectField, MenuItem, RaisedButton, FlatButton, Dialog, TextField, Checkbox} from 'material-ui';
const formUtils = require('../../core/formUtils');
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from '../../common/common.css';
import AlertMessage from '../../common/AlertMessage/AlertMessage';
import history from '../../core/history';

class SignUpButton extends React.Component {
      constructor(props){
              super(props);
              this.state={form:{}, open: false};
              this.handleChange = this.handleChange.bind(this);
              this.submitForm = this.submitForm.bind(this);
              this.close = this.close.bind(this);
              this.responseGoogle = this.responseGoogle.bind(this);

      }
      handleChange(event, val, fieldName ) {
          const target = event.target;
          const name = fieldName || target.name;
          const value = target.type === 'checkbox' ? target.checked : target.value || val;
          var newForm = _.extend({}, this.state.form);
          newForm[name] = value;
          this.setState({ form: newForm });
        }
      close() {
              this.setState({ open: false });
            }
      submitForm(){
          const {form} = this.state;
          fetch('/users', {
             method: 'POST',
             headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/json',
             },
             body: JSON.stringify({
               form: form
             }),
             credentials: 'include'
         })
         .then((response) => {
             return response.json();
         })
         .then(responseData=>{
           sessionStorage.setItem('crewbrick', JSON.stringify(responseData));
           this.close();
           responseData.id? history.replace('/myProjects'): null;
         }).catch(error=>{
             this.setState({formError:error});
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

    const {form, open, showRole2} = this.state;
    const actions = [
      <FlatButton label="Cancel" primary={true} onClick={this.close}/>,
  <RaisedButton label="Sign Up" primary={true} disabled={!form.agree || !form.name} keyboardFocused={true} onClick={this.submitForm.bind(this)}/>,
  ];
    return !this.props.signedIn && (
      <span>
      <FlatButton label="Sign Up" onClick={ ()=> this.setState({ open: !open })}/>
  <Dialog
    title="Sign Up to Crewbrick"
    actions={actions}
    modal={false}
    open={open}
    onRequestClose={this.close}
  >
  <div>
    {this.state.formError && <div className="text-center"><AlertMessage text={this.state.formError}></AlertMessage></div>}
  <div><TextField type="text" name="name" value={form.name} placeholder="Name" onChange={this.handleChange}/></div>
    <div className={s.flexRow}>
      <SelectField value={form.role} floatingLabelText="Role in team" onChange={(event, index, value) => this.handleChange(event, value, 'role')}>
        <MenuItem value="Cinematographer" primaryText="Cinematographer" />
        <MenuItem value="Audio" primaryText="Audio" />
        <MenuItem value="Lighting" primaryText="Lighting" />
        <MenuItem value="Editor" primaryText="Editor" />
      </SelectField>
      <FlatButton onClick={this.toggleRole2.bind(this)} label={showRole2?"Remove additional role":"Add another role"}></FlatButton>
      </div>
      {showRole2 && <div>
      <SelectField value={form.role2} floatingLabelText="Role in team" onChange={(event, index, value) => this.handleChange(event, value, 'role2')}>
        <MenuItem value="Cinematographer" primaryText="Cinematographer" />
        <MenuItem value="Audio" primaryText="Audio" />
        <MenuItem value="Lighting" primaryText="Lighting" />
        <MenuItem value="Editor" primaryText="Editor" />
      </SelectField>
      </div>}
      <div><TextField type="email" name="email" value={form.email} placeholder="Email" onChange={this.handleChange}/></div>
      <div><TextField type="password" name="password" value={form.password} placeholder="Password" onChange={this.handleChange}/></div>
      <div><TextField type="text" name="portfolio" value={form.portfolio} placeholder="Link to your portfolio" onChange={this.handleChange}/></div>
      <div><TextField type="text" name="city" value={form.city} placeholder="City you work in" onChange={this.handleChange}/></div>
      <div>
        <Checkbox id="agreeCheckbox" onCheck={(evt, value)=>{this.handleChange(evt, value, 'agree')}} label={(<label htmlFor="agreeCheckbox">
            I agree to the <a href="" target="_blank">terms and conditions</a>.
        </label>)}/>
      </div>
    </div>
    </Dialog>
    </span>
  );
  }
  toggleRole2(){
        this.setState({showRole2:!this.state.showRole2});
      }
}

export default withStyles(s)(SignUpButton);