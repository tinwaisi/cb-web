/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import { Button, Collapse, FormGroup, ControlLabel, FormControl, HelpBlock, Grid, Row, Col,
Modal, Navbar, Nav, NavItem, Well, Alert} from 'react-bootstrap';
import history from '../../core/history';
import {dataMap, imageConfig} from '../../core/appConfig';
import PersonCard from '../PersonCard';
import s from './PeopleList.css';
import withStyles from 'isomorphic-style-loader/lib/withStyles';


class PeopleList extends React.Component {
    constructor(props){
        super(props);
        this.state = {list:props.list?props.list:[], dataMap: dataMap};
        this.handleClick = this.handleClick.bind(this);

    }
    componentDidMount(){
        if(!this.state.list){
            fetch('/users').then((res) => {return res.json();}).then((response)=>{
                this.setState({list:response});
            });

        }
    }
    handleClick(index){
        var list = this.state.list.slice();
        list[index].active = !list[index].active;
        this.setState({list: list});
        this.props.clickPeople? this.props.clickPeople(this.state.list[index], this.props.position, this.props.extraData): null;
    }
    componentWillReceiveProps(nextProps) {
      this.setState({ list: nextProps.list });
    }
    render(){
          var list = this.state.list.length > 0 ? this.state.list.map((item, index) => {
              //if not busy, show person
              if(!(item.availability && item.availability.calendars[Object.keys(item.availability.calendars)[0]].busy.length >0 )){
                  return (<Col xs={12} md={3} key={item.id}>
                  <PersonCard person={item} clickable={this.props.clickable} onClick={this.props.clickable? ()=>this.handleClick(index) : null}/>
                  </Col>)
              }
          }, this) : <Col xs={12}><div className="alert alert-info text-center">Cannot find match for this position</div></Col>;
          return (
           <div>
              {this.props.position && <h4>{this.props.position}</h4>}
              <Row className="show-grid">{list}</Row>
           </div>
          )
    }
}

export default withStyles(s)(PeopleList);
