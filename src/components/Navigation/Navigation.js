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
import LoginButton from '../LoginButton';
import SignUpButton from '../SignUpButton';
import { getUserFromSession, removeUserFromSession, setUserToSession } from '../../core/appUtils';
import { Button} from 'react-bootstrap';
import store from '../../store/contextStore';

class Navigation extends React.Component {
  contextTypes: {
      currentUser: React.PropTypes.object
  }
  constructor(props){
    super(props);
    this.state = {currentUser: null};
    this.signout = removeUserFromSession.bind(this);
  }
  componentWillMount(){
    (!this.state.currentUser && typeof localStorage !== 'undefined') ? this.setState({currentUser: getUserFromSession()}): null;
  }
  render() {
    const currentUser = store.getCurrentUser();
    return (
      <div className={s.root} role="navigation">
        <a className={s.link} href="/myProjects">My Projects</a>
        <a className={s.link} href="/myCalendar">My Calendar</a>
        {!currentUser && <div className={s.flexDiv}>
            <span className="pull-right"><LoginButton/></span>
            <span className="pull-right"><SignUpButton/></span>
        </div>}

        <span className="pull-right">{currentUser && <a href="/signout"><Button className="btn" onClick={this.signout}>Sign out</Button></a>}  </span>
      </div>
    );
  }
}

export default withStyles(s)(Navigation);
