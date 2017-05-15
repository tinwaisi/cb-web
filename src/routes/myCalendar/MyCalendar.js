import React from 'react';
import { Button, Collapse, FormGroup, ControlLabel, FormControl, Grid, Row, Col,
Modal, Table, Alert} from 'react-bootstrap';
import { getUserFromSession } from '../../core/appUtils';
import {dataMap, stringConsts} from '../../core/appConfig';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';


class MyCalendar extends React.Component{
    constructor(props){
        super();
        this.state = {eventList: []};
        this.updateCalendar = this.updateCalendar.bind(this);
        this.createCrewbrickCalendar = this.createCrewbrickCalendar.bind(this);
        this.handleSelectEvent = this.handleSelectEvent.bind(this);
        BigCalendar.momentLocalizer(moment);
    }
    componentDidMount(){
        this.setState({currentUser: getUserFromSession()});
        this.updateCalendar();
    }
    componentWillMount(){
        (!this.state.currentUser && typeof localStorage !== 'undefined') ? this.setState({currentUser: getUserFromSession()}): null;
    }
    updateCalendar(){
        fetch(`/users/${this.state.currentUser.id}/calendar`, {credentials: 'include'}).then((res) => {return res?res.json():null;}).then(response => {
            console.log(response);
            var events = [];
            if(response && response.items){
                for(var i=0; i<response.items.length; i++){
                    let event = response.items[i];
                    events.push({
                        title: event.summary,
                        start: new Date(event.start.dateTime ? event.start.dateTime : event.start.date),
                        end: new Date(event.end.dateTime ? event.end.dateTime : event.end.date),
                        allDay: !!event.start.date
                    });
                }
                this.setState({eventList:events});
            }
        });
    }
    createCrewbrickCalendar(){
        fetch(`/users/${this.state.currentUser.id}/calendar`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
            credentials: 'include'
        })
        .then((res) => {
            return res.json();
        }).then(()=>{
            this.updateCalendar();
        });
    }
    handleSelectEvent(event){
        alert(event.title);
    }
    render(){

        return(
            <div>
                <Grid>
                    <h2>My Calendar
                        <div className="pull-right">
                            <a href="/login/google"><button><h4>Import my Google Calendar</h4></button></a>
                        </div>
                    </h2>
                    <br/>
                    <BigCalendar {...this.props} events={this.state.eventList} defaultDate={new Date()}
                           onSelectEvent={this.handleSelectEvent}
                    />
                </Grid>

            </div>

        );
    }
}
export default MyCalendar ;