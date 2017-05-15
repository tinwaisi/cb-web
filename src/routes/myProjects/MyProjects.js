import React from 'react';
import { Button, Collapse, FormGroup, ControlLabel, FormControl, Grid, Row, Col,
Modal, Table, Alert} from 'react-bootstrap';
import { getUserFromSession } from '../../core/appUtils';
import Link from '../../components/Link';
import {dataMap} from '../../config';



class MyProjects extends React.Component{
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
    componentWillMount(){
        (!this.state.currentUser && typeof localStorage !== 'undefined') ? this.setState({currentUser: getUserFromSession()}): null;
    }
    updateProjects(){
        fetch(`/users/${this.state.currentUser.id}/deals`, {credentials: 'include'}) .then((res) => {return res.json();}).then(response => {
            console.log(response);
            for (var i=0; i<response.length; i++){
                var data = response[i];
                data[dataMap.PROJECT_FIELD_MAP.crew] && data[dataMap.PROJECT_FIELD_MAP.crew].indexOf(this.state.currentUser.name+"#true") > -1 ? response[i].accepted = true:null;
            }
            this.setState({projectList:response});
        });
    }
    pickCrew(){

    }
    deleteProject(id){
        var updateFunction = this.updateProjects;
        Config.pipeClient.makeRequest('/deals/'+id, 'delete').then(response => {
              console.log(response);
              updateFunction();
        });
    }

    responseToInvite(action, project){
        var crewText = project[dataMap.PROJECT_FIELD_MAP.crew],
            updatedCrew = crewText.replace(new RegExp(this.state.currentUser.name, 'g'), this.state.currentUser.name+'#'+action),
            isLastToResponse = (updatedCrew.match(/#/g) || []).length >= project.participants_count-1,
            projectObj = {stage_id: isLastToResponse? 9 : 8};
            projectObj[dataMap.PROJECT_FIELD_MAP.crew] = updatedCrew;
         fetch(`/deals/${project.id}`, {
                method: 'PUT',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  project: projectObj
                }),
                credentials: 'include'
            })
            .then((res) => {
                return res.json();
            }).then((response)=>{
                this.updateProjects();

        });
    }
    render(){

        var projects = this.state.projectList.map((item, index) => {
                    return (<tr key={item.id}>
                        <td><Link to={'/projectDetails/'+item.id}>{item.title}</Link></td>
                        <td>{item[dataMap.PROJECT_FIELD_MAP.filmingDates]}</td>
                        <td>{item[dataMap.PROJECT_FIELD_MAP.finalDeadline]}</td>
                        <td>
                            {item.stage_id === 6 && <span><Link to={'/pickCrew/'+item.id}>Pick the Crew</Link>&nbsp;
                            <Button className="btn-warning" onClick={()=>this.deleteProject(item.id)}>Delete Project</Button></span>}
                            {item.stage_id === 8 && (item.person_id.value === this.state.currentUser.id) && <span>Pending</span>}
                            {item.stage_id === 8 && (item.person_id.value !== this.state.currentUser.id) && (!item.accepted) && <span><Button onClick={()=>this.responseToInvite(true, item)}>Accept</Button>
                            &nbsp;<Button onClick={()=>this.responseToInvite(false, item)}>Decline</Button></span>}
                            {item.stage_id === 8 && (item.person_id.value !== this.state.currentUser.id) && (item.accepted) && <span>Accepted (Waiting for other crew members)</span>}

                            {item.stage_id === 9 && <span>Confirmed</span>}
                            {item.stage_id === 10 && <span>Complete</span>}
                        </td>
                    </tr>)
                });

        return(
            <Grid>
            <h2>My Projects <span className="pull-right"><Link buttonClass="btn-success" to="/createProject">Create Project</Link></span> </h2>
            <br/>
             <Table responsive striped>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Filming Dates</th>
                    <th>Final Deadline</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                    {projects}
                </tbody>
              </Table>
            </Grid>
        );
    }
}
export default MyProjects;