import React  from 'react';
import history from '../../core/history';
import { getUserFromSession } from '../../core/appUtils';
import {TextField, RaisedButton, SelectField, MenuItem, DatePicker, FlatButton, FontIcon} from 'material-ui';
import s from './CreateProject.css';
import withStyles from 'isomorphic-style-loader/lib/withStyles';




class CreateProject extends React.Component{
    constructor(props){
        super();
        this.state = {form: {positionsNeeded:[{}], title: "", description:""}, formError: ""};
        this.handleChange = this.handleChange.bind(this);
        this.addPosition = this.addPosition.bind(this);
        this.removePosition = this.removePosition.bind(this);
        this.removePosition = this.removePosition.bind(this);
        this.handlePositionChange = this.handlePositionChange.bind(this);
        this.createProject = this.createProject.bind(this);

    }
    componentDidMount(){
        this.setState({currentUser: getUserFromSession()});
    }
    handleChange(event, checked) {
        const target = event.target;
        const name = target.name;
        const value = target.value;
         var newForm = _.extend({}, this.state.form);
        target.type === 'checkbox' ? (target.checked? newForm[name].push(value): newForm[name].splice(newForm[name].indexOf(value), 1)): newForm[name] = value;
        this.setState({ form: newForm });
    }
    handleDateChange(name, evt, value){
        var newForm = _.extend({}, this.state.form);
        newForm[name] = value
        this.setState({ form: newForm });
    }
    addPosition(){
        var newForm = _.extend({}, this.state.form);
        newForm.positionsNeeded.push({});
        this.setState({form: newForm});
    }
    removePosition(index){
        var newForm = _.extend({}, this.state.form);
        newForm.positionsNeeded.splice(index, 1);
        this.setState({form: newForm});
    }
    handlePositionChange(idx, event, index, value){
        var newForm = _.extend({}, this.state.form);
        const target = event.target;
        newForm.positionsNeeded[idx].position = value;
        this.setState({form: newForm});
    }
    handlePositionBudgetChange(index, event, value){
        var newForm = _.extend({}, this.state.form);
        const target = event.target;
       newForm.positionsNeeded[index].budget = parseInt(value) ;
        this.setState({form: newForm});
    }
    handleTransferFileMethodChange(event, index, value){
        this.setState({form: {...this.state.form, transferFileMethod:value}});
    }

    createProject(){
        var user = JSON.parse(sessionStorage.getItem("crewbrick"));
        var customFields = {};
        var form = this.state.form,
            _this = this;
        form.positionsNeeded = JSON.stringify({items: form.positionsNeeded});

        fetch('/deals', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: this.state.currentUser.id,
              form: form
            }),
            credentials: 'include'
        })
        .then((response) => {
            return response.json();
        })
        .then(function(responseData){
            responseData.id? history.push('/pickCrew/'+responseData.id): null;
        }).catch(function(error){
            _this.setState({formError:error});
        });
    }
    render(){
        var positionList = this.state.form.positionsNeeded.map((position, index)=>{
            return (
                <div className={s.flexRow} key={index}>
                    <div className={s.roleItem}>
                        <SelectField hintText="Select a position" value={position.position}
                          onChange={this.handlePositionChange.bind(this, index)}>
                          <MenuItem value="Cinematographer" primaryText="Cinematographer" />
                          <MenuItem value="Audio" primaryText="Audio" />
                          <MenuItem value="Lighting" primaryText="Lighting" />
                          <MenuItem value="Editor" primaryText="Editor" />
                        </SelectField>
                    </div>
                    <div className={s.roleItem}>
                        <FontIcon iconClassName="muidocs-icon-custom-github"
                                          href="https://github.com/callemall/material-ui"  />

                        <TextField type="number" hintText="Budget for person" value={position.budget} onChange={this.handlePositionBudgetChange.bind(this, index)} />
                    </div>
                    <div className={s.roleItem}>
                        {index === 0 &&
                        <RaisedButton className={s.iconButton} onClick={this.addPosition}  primary={true}>
                          <i className={s.materialIcons}>person_add</i>
                        </RaisedButton>}
                        {index > 0 &&
                        <FlatButton onClick={this.removePosition.bind(this, index)} secondary={true} >
                          <i className={s.materialIcons}>hightlight_off</i>
                        </FlatButton>
                        }
                    </div>
                    <br/>
                    <br/>
                </div>
            )
        }, this);
        return(
        <div>

            <form className={s.projectForm}>
              <h2>Create Project</h2>
              <br/>
              {this.state.formError && <div bsStyle="danger" className="text-center">{this.state.formError}<br/></div>}
                <div>
                    <TextField
                          hintText="Give a name to your project"
                          floatingLabelText="Project Name"
                          value={this.state.form.title}
                          name="title"
                          onChange={this.handleChange}
                        />

                </div>
                <div className={s.formField}>
                      <label>Positions of your crew (Add duplicate entries if you need more than 1 person for the position)</label>
                       <br/>
                      {positionList}

                </div>
                <div>
                     <TextField
                      hintText="Dates for the shooting to happen."
                      floatingLabelText="Filming Date(s)"
                      value={this.state.form.filmingDates}
                      onChange={this.handleChange}
                     />
                </div>
                <div>
                    <DatePicker minDate={new Date()} floatingLabelText="Final Deadline" hintText="Deadline of the project" value={this.state.form.finalDeadline} onChange={this.handleDateChange.bind(this, 'finalDeadline')}/>
                </div>
                <div>
                      <SelectField hintText="Method to transfer files" onChange={this.handleTransferFileMethodChange.bind(this)} name="transferFileMethod" value={this.state.form.transferFileMethod}>

                        <MenuItem value="Provide SD card" primaryText="Provide SD card" />
                        <MenuItem value="Upload to Web" primaryText="Upload to Web" />
                      </SelectField>
                </div>
                <div>
                    <TextField floatingLabelText="Description" value={this.state.form.description} name="description"
                      hintText="Description for the crew to understand your project details." multiLine={true} rows={5} fullWidth={true} onChange={this.handleChange}
                    />
                </div>
                <div className={s.formActions}>
                    <FlatButton label="Cancel" href="/myProjects" />
                    <RaisedButton label="Create" primary={true} onClick={this.createProject} />
                </div>

            </form>
        </div>
        );
    }
}
export default withStyles(s)(CreateProject);