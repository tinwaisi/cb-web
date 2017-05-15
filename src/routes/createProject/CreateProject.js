import React  from 'react';
import { Button, Collapse, ButtonGroup, FormGroup, ControlLabel, FormControl, Grid, Row, Col,
Modal, Table, Alert} from 'react-bootstrap';
import Link from '../../components/Link';
import history from '../../core/history';
import { getUserFromSession } from '../../core/appUtils';


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
    handlePositionChange(index, event){
        var newForm = _.extend({}, this.state.form);
        const target = event.target;
        target.type === 'select-one' ? newForm.positionsNeeded[index].position = target.value : newForm.positionsNeeded[index].budget = target.value ;
        this.setState({form: newForm});
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
                <div className="row" key={index}>
                    <div className="col-md-4">
                        <FormControl componentClass="select" placeholder="select" value={position.position} onChange={(evt)=>this.handlePositionChange(index, evt)}>
                           <option value="" >-Select a position-</option>
                           <option value="Cinematographer">Cinematographer</option>
                           <option value="Audio">Audio</option>
                           <option value="Lighting">Lighting</option>
                           <option value="Editor">Editor</option>
                        </FormControl>
                    </div>
                    <div className="col-md-3">
                        <div className="input-group">
                          <span className="input-group-addon">$</span>
                          <input type="number" className="form-control" onChange={(evt)=>this.handlePositionChange(index, evt)} placeholder="Budget for person"/>
                        </div>
                    </div>
                    <div className="col-md-3">
                        {index === 0 && <Button bsStyle="success" onClick={this.addPosition}>Add Another Position</Button>}
                        {index > 0 && <Button bsStyle="danger" onClick={()=>this.removePosition(index)}>Remove Position</Button>}
                    </div>
                    <br/>
                    <br/>
                </div>
            )
        }, this);
        return(
        <Grid>
            <h2>Create Project</h2>
            <br/>
            <form>
              {this.state.formError && <Alert bsStyle="danger" className="text-center">{this.state.formError}<br/></Alert>}
                <FormGroup>
                    <ControlLabel>Project Name</ControlLabel>
                    <FormControl type="text" name="title" value={this.state.form.title} placeholder="Give a name to your project" onChange={this.handleChange}/>
                </FormGroup>
                <FormGroup >
                      <ControlLabel>Positions of your crew (Add duplicate entries if you need more than 1 person for the position)</ControlLabel>
                       <br/>
                      {positionList}

                </FormGroup>
                <FormGroup>
                    <ControlLabel>Filming Date(s)</ControlLabel>
                    <FormControl type="text" name="filmingDates" value={this.state.form.filmingDates} placeholder="Dates for the shooting to happen." onChange={this.handleChange}/>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Final Deadline (format dd-mm-yyyy)</ControlLabel>
                    <FormControl type="text" name="finalDeadline" value={this.state.form.finalDeadline} placeholder="Final Deadline as a reference for your crew." onChange={this.handleChange}/>
                </FormGroup>
                <FormGroup controlId="formControlsSelect">
                      <ControlLabel>Method to transfer files (for the crew to know what to expect)</ControlLabel>
                      <FormControl componentClass="select" placeholder="select" onChange={this.handleChange}>
                        <option value="Provide SD card">Provide Own SD card</option>
                        <option value="Upload to Web">Upload to Web</option>
                      </FormControl>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Description</ControlLabel>
                    <FormControl componentClass="textarea" name="description" value={this.state.form.description} placeholder="Description for the crew to understand your project details." onChange={this.handleChange}/>
                </FormGroup>
                <Link buttonClass="btn" to="/myProjects">Cancel</Link>&nbsp;
                <Button bsStyle="primary" onClick={this.createProject}>Create</Button>
            </form>
        </Grid>
        );
    }
}
export default CreateProject;