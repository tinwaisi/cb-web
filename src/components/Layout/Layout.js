/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Layout.css';
import Header from '../Header';
import Feedback from '../Feedback';
import Footer from '../Footer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import store from '../../store/contextStore';


class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };
   contextTypes: {
        currentUser: React.PropTypes.object
    }

  componentWillReceiveProps(nextProps) {
    this.setState({
      children: nextProps.children
    });
  }

  render() {
    return (
    <MuiThemeProvider>
      <div>
        <Header store={store}/>
        {this.props.children}
      </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(s)(Layout);
