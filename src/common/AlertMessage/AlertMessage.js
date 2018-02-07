/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './theme.css';
const classnames = require('classnames');

class AlertMessage extends React.Component {
  render() {
    const {text, type='error'} = this.props;

    return (
      <div className={classnames(s.container, s[type])}>
        {text}
      </div>
  );
  }
}

export default withStyles(s)(AlertMessage);
