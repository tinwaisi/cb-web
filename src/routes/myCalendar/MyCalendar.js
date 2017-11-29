import React from 'react';
import { getUserFromSession } from '../../core/appUtils';
import {dataMap, stringConsts} from '../../core/appConfig';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import s from './common.css';
import _ from 'lodash';
import {Snackbar} from 'material-ui';



class MyCalendar extends React.Component{
    state = {
        alertMessage: ""
    }
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

    showAlert(alertMessage){
        this.setState({alertMessage});
    }
    updateCalendar(){
        fetch(`/users/${this.state.currentUser.id}/calendar`, {credentials: 'include'}).then(
        (res) =>{
            if(res.ok){
                return res.json();
            }
            return this.showAlert('Cannot Get User Calendar');
        }).then(response => {
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
        })
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
        const {alertMessage} = this.state;
        return(
            <div>
                <div>
                    <div className={s.flexRow}>
                        <h2>My Calendar</h2>
                        <div className="pull-right">
                            <a href="/login/google"><button><h4>Import my Google Calendar</h4></button></a>
                        </div>
                    </div>
                    <br/>
                    <BigCalendar {...this.props} events={this.state.eventList} defaultDate={new Date()}
                           onSelectEvent={this.handleSelectEvent}
                    />
                    {alertMessage &&
                    <Snackbar
                      open={!_.isEmpty(alertMessage)}
                      message={alertMessage}
                      autoHideDuration={4000}
                      onRequestClose={()=>this.setState({alertMessage:""})}
                    />
                    }
                </div>

            </div>

        );
    }
}
export default MyCalendar ;