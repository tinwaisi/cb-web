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
import {FlatButton} from 'material-ui';
const {connect} = require('react-redux');
import history from '../../core/history';
let router = require('../../core/router').default;


class Navigation extends React.Component {
  contextTypes: {
      currentUser: React.PropTypes.object
  }
  constructor(props){
    super(props);
    this.state = {currentUser: null};
    this.signout = removeUserFromSession.bind(this);
  }
  test(){
    history.push('/myProjects');
  }
  refreshLoginStatus(){
    history.replace('/myProjects');
  }
  componentWillMount(){
    this.setState({currentUser: this.props.store.getCurrentUser()})
  }
  render() {
    const {currentUser} = this.state;
    return (
      <div className={s.root} role="navigation">
        {currentUser &&
        <div>
          <a className={s.link} href="/myProjects">My Projects</a>
          <a className={s.link} href="/myCalendar">My Calendar</a>
        </div>
        }

        {!currentUser && <div className={s.flexDiv}>
            <span className="pull-right"><LoginButton onLogin={this.refreshLoginStatus.bind(this)}/></span>
            <span className="pull-right"><SignUpButton/></span>
        </div>}

        <span className="pull-right">{currentUser && <a href="/signout"><FlatButton label="Sign out" onClick={this.signout}/></a>}</span>
    <div onClick={this.test.bind(this)}>test</div>

    </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  console.log("test");
  return {

  }
};

export default withStyles(s)(connect(mapStateToProps)(Navigation)) ;
