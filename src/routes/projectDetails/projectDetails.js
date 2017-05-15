import React from 'react';
import { Button, Collapse, FormGroup, ControlLabel, FormControl, Grid, Row, Col,
Modal, Table, Alert} from 'react-bootstrap';
import { getUserFromSession } from '../../core/appUtils';
import PersonCard from '../../components/PersonCard';
import {dataMap} from '../../core/appConfig';
import _ from 'lodash';
import history from '../../core/history';

class ProjectDetails extends React.Component{
    constructor(props){
            super(props);
            this.state = {project:{}, showResponsePopup: false, responseAccept: null, crewMembers: [], canRespond: false, selfPosition: null};
            this.closeResponsePopup = this.closeResponsePopup.bind(this);
            this.openResponsePopup = this.openResponsePopup.bind(this);
            this.personMap = {};
        }
    componentDidMount(){
        this.setState({currentUser: getUserFromSession()});
        if(this.props.context && this.props.context.params.projectId){
             fetch(`/deals/${this.props.context.params.projectId}`) .then((res) => {return res.json();}).then(
                response => {
                     var crewMembers = JSON.parse(response[dataMap.PROJECT_FIELD_MAP.positionsNeeded]).items;
                     response.id ? this.setState({project: response, crewMembers: crewMembers }) : null;
                     let promises = [];
                     crewMembers.map((position)=>{
                        if(position.personId && position.personId !== this.state.currentUser.id) {
                            promises.push(fetch(`/users/${position.personId}`).then((res) => {return res.json();}).then(person=>{
                                position.person = person;
                                return position;
                            }));
                        } else if(position.personId === this.state.currentUser.id ){
                           position.personResponse === 'pending' ? this.setState({canRespond: true}) : null;
                           position.person = this.state.currentUser;
                           this.setState({selfPosition: position});
                        }
                     });
                     if(!this.state.selfPosition){
                        this.setState({selfPosition: {position: 'Project Owner', person: this.state.currentUser}});
                     }
                     Promise.all(promises).then((persons)=>{
                        this.setState({crewMembers: persons});
                     });

                 }

             );
        }
    }
    closeResponsePopup(){
        this.setState({showResponsePopup: false});
    }
    openResponsePopup(response){
        this.setState({showResponsePopup: true, responseAccept: response})
    }
    submitResponse(isAccept){
        fetch(`/deals/${this.state.project.id}/respond`, {
                method: 'PUT',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  response: !!isAccept ? "accepted" : "declined"
                }),
                credentials: 'include'
            })
            .then((res) => {
                return res.json();
            }).then((response)=>{
                this.setState({canRespond: false});
        });

    }
    render(){
        var crewMembers = this.state.crewMembers.map((position, index)=>{
            return position.person ? (<div className="col-md-3" key={index}>{position.position}: <PersonCard person={position.person}/></div>): null;
            });
        return (
         <Grid>
            <h3>{this.state.project.title}</h3>
            <br/>
            <div><b>Type</b>&nbsp;&nbsp;<span>Wedding</span></div>
            <div><b>Filming Date(s)</b>&nbsp;&nbsp;<span>{this.state.project[dataMap.PROJECT_FIELD_MAP.filmingDates]}</span></div>
            <div><b>Final Deadline</b>&nbsp;&nbsp;<span>{this.state.project[dataMap.PROJECT_FIELD_MAP.finalDeadline]}</span></div>
            <br/>
            <h4>Description</h4>
            <p>{this.state.project[dataMap.PROJECT_FIELD_MAP.description]}</p>
            <br/>
            {this.state.selfPosition && <h3>Your Position: <b>{this.state.selfPosition.position}</b> {this.state.selfPosition.budget && <span>with day rate <b>${this.state.selfPosition.budget}</b></span>}</h3>}
            <br/>
            <h4>Crew members</h4>
            <div className="row">{crewMembers.length > 0 && crewMembers}</div>
            <br/>
            {this.state.canRespond && <div>
                <Button onClick={()=>{this.openResponsePopup(true)}}  bsStyle="success">Accept Project</Button>&nbsp;
                <Button onClick={()=>{this.openResponsePopup(false)}}  bsStyle="danger">Decline</Button>
            </div>}
            <Modal show={this.state.showResponsePopup} onHide={this.close}>
              <Modal.Header>
                <Modal.Title>Response to project invitation</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                { this.state.responseAccept === true &&
                    <div><p>By accepting this project invitation, a new event will be created in your Calendar, and for other users, you will be shown as not available during this project's' filming day(s).</p>
                    <p>You will be paid once every crew member accepted the invitation.</p></div>
                }
                { this.state.responseAccept === false &&
                    <p>By declining this project invitation, the project owner will receive a notice of your action, and will look for another fit for the project.</p>
                }
              </Modal.Body>

              <Modal.Footer>
                <Button onClick={this.closeResponsePopup}>Close</Button>
                { this.state.responseAccept === true &&
                    <Button bsStyle="success" onClick={()=>this.submitResponse()}>Accept Project</Button>
                }
                { this.state.responseAccept === false &&
                    <Button bsStyle="danger" onClick={()=>this.submitResponse()}>Decline Project</Button>
                }

              </Modal.Footer>

            </Modal>
         </Grid>
        )
    }
}
export default ProjectDetails;