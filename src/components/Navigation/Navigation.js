/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Link from '../Link';
import LoginButton from '../LoginButton';
import SignUpButton from '../SignUpButton';
import { getUserFromSession, removeUserFromSession, setUserToSession } from '../../core/appUtils';
import { Button} from 'react-bootstrap';



class Navigation extends React.Component {
  contextTypes: {
      currentUser: React.PropTypes.object
  }
  constructor(props){
    super(props);
    this.state = {currentUser: null};
    this.signout = removeUserFromSession.bind(this);
  }
  componentDidMount(){
    fetch('/user', {credentials: 'include'})
    .then((res) => {
        return res ?res.json():null;}).then(response => {
        response && response.user ? setUserToSession(response.user) : null;
        this.setState({currentUser: response.user});
    });
  }
  componentWillMount(){
    (!this.state.currentUser && typeof localStorage !== 'undefined') ? this.setState({currentUser: getUserFromSession()}): null;
  }
  render() {
    return (
      <div className={s.root} role="navigation">
        <Link className={s.link} to="/myProjects">My Projects</Link>
        <Link className={s.link} to="/myCalendar">My Calendar</Link>
        <Link className={s.link} to="/contact">Contact</Link>
        <span className={s.spacer}> | </span>
        <span className={s.spacer}></span>
        {!this.state.currentUser && <span><span className="pull-right"><LoginButton/></span>
        <span className="pull-right">&nbsp;&nbsp;</span>
        <span className="pull-right"><SignUpButton/></span>&nbsp;&nbsp;</span>}

        <span className="pull-right">{this.state.currentUser && <a href="/signout"><Button className="btn" onClick={this.signout}>Sign out</Button></a>}  </span>
      </div>
    );
  }
}

export default withStyles(s)(Navigation);
