import React from 'react';
import { getUserFromSession } from '../../core/appUtils';
import {dataMap} from '../../config';
import {
  RaisedButton,
  FlatButton,
  Table,
  TableBody,
  TableHeader,
  FloatingActionButton,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from '../../common/common.css';


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
        let startedProjects = [];
        let completedProjects = [];
        var projects = this.state.projectList.forEach((item, index) => {
                    item.stage_id < 10 ?
                    startedProjects.push(<TableRow key={item.id}>
                        <TableRowColumn><a href={`/projectDetails/${item.id}`}>{item.title}</a></TableRowColumn>
                        <TableRowColumn>{item[dataMap.PROJECT_FIELD_MAP.filmingDates]}</TableRowColumn>
                        <TableRowColumn>{item[dataMap.PROJECT_FIELD_MAP.finalDeadline]}</TableRowColumn>
                        <TableRowColumn>
                            {item.stage_id === 6 && <span><RaisedButton href={`/pickCrew/${item.id}`} primary={true} label="Pick the Crew"></RaisedButton>&nbsp;
                            <FlatButton className="btn-warning" onClick={()=>this.deleteProject(item.id)}>Delete Project</FlatButton></span>}
                            {item.stage_id === 8 && (item.person_id.value === this.state.currentUser.id) && <span>Pending</span>}
                            {item.stage_id === 8 && (item.person_id.value !== this.state.currentUser.id) && (!item.accepted) && <span><Button onClick={()=>this.responseToInvite(true, item)}>Accept</Button>
                            &nbsp;<RaisedButton onClick={()=>this.responseToInvite(false, item)}>Decline</RaisedButton></span>}
                            {item.stage_id === 8 && (item.person_id.value !== this.state.currentUser.id) && (item.accepted) && <span>Accepted (Waiting for other crew members)</span>}

                            {item.stage_id === 9 && <span>Confirmed</span>}
                            {item.stage_id === 10 && <span>Complete</span>}
                        </TableRowColumn>
                    </TableRow>) :
                    completedProjects.push(<TableRow key={item.id}>
                          <TableRowColumn><a href={`/projectDetails/${item.id}`}>{item.title}</a></TableRowColumn>
                          <TableRowColumn>{item[dataMap.PROJECT_FIELD_MAP.filmingDates]}</TableRowColumn>
                          <TableRowColumn>{item[dataMap.PROJECT_FIELD_MAP.finalDeadline]}</TableRowColumn>
                          <TableRowColumn>
                              {item.stage_id === 10 && <span>Complete</span>}
                          </TableRowColumn>
                     </TableRow>)

                });

        return(
            <div>
                <div className={s.flexRowSpread}>
                    <h3>My Projects</h3>
                    <FloatingActionButton href="/createProject">
                        <i className={s.materialIcons}>add</i>
                    </FloatingActionButton>
                </div>
                <br/>
                 <Table responsive striped>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderColumn>Project Name</TableHeaderColumn>
                        <TableHeaderColumn>Filming Dates</TableHeaderColumn>
                        <TableHeaderColumn>Final Deadline</TableHeaderColumn>
                        <TableHeaderColumn>Status</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {startedProjects}
                    </TableBody>
                  </Table>
                  {completedProjects.length > 0 &&
                    <div>
                        <h3>Completed Projects</h3>
                        <Table responsive striped>
                            <TableBody>
                              <TableRow>
                                <TableHeaderColumn>Project Name</TableHeaderColumn>
                                <TableHeaderColumn>Filming Dates</TableHeaderColumn>
                                <TableHeaderColumn>Final Deadline</TableHeaderColumn>
                                <TableHeaderColumn>Status</TableHeaderColumn>
                              </TableRow>
                            </TableBody>
                            <TableBody>
                                {completedProjects}
                            </TableBody>
                        </Table>
                    </div>
                  }
            </div>
        );
    }
}
export default withStyles(s)(MyProjects);