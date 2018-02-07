import React from 'react';
import { getUserFromSession } from '../../core/appUtils';
import {dataMap} from '../../config';
import _ from 'lodash';
import PeopleList from '../../components/PeopleList';
import history from '../../core/history';
import store from '../../store/contextStore';
import {RaisedButton, FlatButton, Dialog, TextField} from 'material-ui';



class PickCrew extends React.Component{

    state = {
      paymentMethod:{},
      project: {},
      positionSelections: {},
      openSubmitPopup: false,
      positionsNeeded: {},
      candidatesTable: [],
      form: {}
    };

    constructor(props){
            super(props);
            this.clickPeople = this.clickPeople.bind(this);
            this.submitSelections = this.submitSelections.bind(this);
            this.closeSubmitPopup = this.closeSubmitPopup.bind(this);
            this.openSubmitPopup = this.openSubmitPopup.bind(this);
            this.personMap = {};
        }
    componentDidMount(){
        var _this = this;
        if(this.props.context && this.props.context.params.projectId){
             fetch(`/deals/${this.props.context.params.projectId}`) .then((res) => {return res.json();}).then(projectRes =>{
                _this.setState({project: projectRes, positionsNeeded: JSON.parse(projectRes[dataMap.PROJECT_FIELD_MAP.positionsNeeded])});
                fetch(`/deals/${this.props.context.params.projectId}/candidates`) .then((res) => {return res.json();}).then(
                     response => {
                          var initPositionSelections = {};
                          for (var i=0; i<response.length; i++){
                             initPositionSelections[response[i].position] = [];
                          }
                          _this.setState({candidatesTable: response, positionSelections: initPositionSelections});
                      }
                );
             });

        }
    }
    clickPeople(person, position, params){
        var updatedFits = _.extend({}, this.state.positionSelections);
        var index = updatedFits[position].indexOf(person.id);
        index > -1 ? updatedFits[position].splice(index, 1): updatedFits[position].push(person.id);
        this.personMap[person.id] = person;
        var positionsNeeded = _.extend({}, this.state.positionsNeeded);
        positionsNeeded.items[params.positionsNeededIndex].personId = person.id;
        positionsNeeded.items[params.positionsNeededIndex].personResponse = 'pending';
        this.setState({positionSelections: updatedFits, positionsNeeded: positionsNeeded});
    }
    closeSubmitPopup(){
        this.setState({openSubmitPopup: false});
    }
    openSubmitPopup(){
        this.setState({openSubmitPopup: true})
    }
    submitSelections(){
        var fits = this.state.positionSelections;
        var _this = this;
        var people = [],
        crewDetailsString = '';

        for (var position in fits) {
          if (fits.hasOwnProperty(position)) {
                crewDetailsString += position + ': ';
                for (var i=0, l= fits[position].length; i<l; i++){
                    people.push(fits[position][i]);
                    crewDetailsString += this.personMap[fits[position][i]].name + (i !== l-1 ? ", ":"")
                }
                crewDetailsString += "\n";
          }
        }

        fetch(`/deals/${this.state.project.id}/participants`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              participants: people
            })
        })
        .then((res) => {
            return res.json();
        })
        .then((response)=>{
            //update field 'crew' in the deal
            var project = {};
            project[dataMap.PROJECT_FIELD_MAP.crew] = crewDetailsString;
            project[dataMap.PROJECT_FIELD_MAP.positionsNeeded] = JSON.stringify(_this.state.positionsNeeded);
            project.stage_id = 8;
            fetch(`/deals/${_this.state.project.id}`, {
                method: 'PUT',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  project: project
                })
            })
            .then((res) => {
                return res.json();
            }).then(()=>{
                this.closeSubmitPopup();
                history.replace( '/myProjects');
            });
        }).catch(function(error){
            this.setState({formError:error});
        });
    }
    render(){
        const lists = this.state.candidatesTable.map((candidates, index)=>{return <div key={index}><PeopleList clickable="true" clickPeople={this.clickPeople} list={candidates.candidates} position={candidates.position} extraData={{positionsNeededIndex: index}}/></div>});
        //For submition popup
        const currentUser = store.getCurrentUser();
        if(Object.keys(this.personMap).length !== 0 ){
            var selections = this.state.positionsNeeded.items.map((position, index)=>{
                return <div key={index}><PeopleList list={position.personId ? [this.personMap[position.personId]]: []} position={position.position}/></div>
            }, this);
        }

        const actions = [
              <FlatButton
                label="Cancel"
                primary={true}
                onClick={this.closeSubmitPopup}
              />,
              <RaisedButton
                label="Submit"
                primary={true}
                keyboardFocused={true}
                onClick={()=>this.submitSelections()}
              />,
            ];

        const {paymentMethod} = this.state;
        return (
         <div>
            <h2>Pick the crew for {this.state.project.title}</h2>
            {lists}
            <br/>
            {currentUser && !currentUser.paymentMethod && <div>
                 <div >
                    <h4>Payment Method</h4>
                    <form>

                    </form>
                </div>
            </div>}
            <RaisedButton onClick={this.openSubmitPopup}>Finish</RaisedButton>
            <Dialog
              title="Submit Crew Selection"
              actions={actions}
              modal={false}
              open={this.state.openSubmitPopup}
              onRequestClose={this.close} >
              {selections}
              <p>By submitting the selections, the crew members will receive a project invite. Once all of the crew member accepts the invite, your
              account will be charged half of the total price. The crew will receive the amount and show up at the project.</p>
            </Dialog>
         </div>
        )
    }
}
export default PickCrew;