import React from 'react';
import { getUserFromSession } from '../../core/appUtils';
import {dataMap} from '../../config';
import {SelectField, MenuItem, RaisedButton, FlatButton, Dialog, TextField} from 'material-ui';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './theme.css';


class MyProfile extends React.Component{
  constructor(props){
    super();
    this.state = {projectList: []};
    this.updateProjects = this.updateProjects.bind(this);
    this.pickCrew = this.pickCrew.bind(this);
  }
  componentDidMount(){
    this.setState({currentUser: getUserFromSession()});
    this.updateProjects();
  }
  handleChange(event, val, fieldName ) {
    const target = event.target;
    const name = fieldName || target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value || val;
    var newForm = _.extend({}, this.state.form);
    newForm[name] = value;
    this.setState({ form: newForm });
  }
  submitProfile(){

  }
  render(){
    return(
      <Tabs>
        <Tab icon={<FontIcon className="material-icons">account_box</FontIcon>} label="Profile">
          <div>
            <div><TextField type="text" name="name" value={form.name} placeholder="Name" onChange={this.handleChange}/></div>
            <div className={s.flexRow}>
              <SelectField value={form.role} floatingLabelText="Role in team" onChange={(event, index, value) => this.handleChange(event, value, 'role')}>
                <MenuItem value="Cinematographer" primaryText="Cinematographer" />
                <MenuItem value="Audio" primaryText="Audio" />
                <MenuItem value="Lighting" primaryText="Lighting" />
                <MenuItem value="Editor" primaryText="Editor" />
              </SelectField>
              <FlatButton onClick={this.toggleRole2.bind(this)} label="Add role"></FlatButton>
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
                <FlatButton label="Cancel" primary={true} onClick={this.close} />
                <RaisedButton label="Sign Up" primary={true} keyboardFocused={true} onClick={this.submitProfile.bind(this)} />
            </div>
          </div>
        </Tab>
        <Tab icon={<FontIcon className="material-icons">payment</FontIcon>} label="Payment" >
        </Tab>
      </Tabs>
    );
  }
}
export default withStyles(s)(MyProfile);