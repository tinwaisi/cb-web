/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import { Button, Well} from 'react-bootstrap';
import {dataMap, imageConfig} from '../../core/appConfig';
import s from './PersonCard.css';
import withStyles from 'isomorphic-style-loader/lib/withStyles';


class PersonCard extends React.Component {
    constructor(props){
        super(props);
        this.state={active: false};
        this.clickHandle = this.clickHandle.bind(this);
    }
    clickHandle(){
        this.setState({active: !this.state.active});
        this.props.onClick ? this.props.onClick(): null;
    }
    render(){
          return (
                <Well className={`${this.props.clickable? s.rootClickable : ''}  ${this.props.clickable && this.state.active? s.active : ''} ${s.root}`} onClick={this.clickHandle}>
                     <div>
                         <img className="pull-left" width="64px" height="64px" href="#" alt={this.props.person.name} src={this.props.person.picture_id ?this.props.person.picture_id.pictures['128']: imageConfig.DEFAULT_AVATOR_IMAGE_URL} />
                         <div className="text-center">
                             {this.props.person.name}<br/>
                             {this.props.person.availability ? <span><span className="glyphicon glyphicon-ok"></span> Available</span> : <span>Unknown</span>}<br/>
                             <a href="#">Portfolio</a>
                         </div>
                     </div>
                 </Well>

          )
    }
}

export default withStyles(s)(PersonCard);
