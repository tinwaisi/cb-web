/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Link from '../Link';
import LoginButton from '../LoginButton';
import SignUpButton from '../SignUpButton';

class Navigation extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
    };
  render() {
    return (
      <div className={s.root} role="navigation">
        <Link className={s.link} to="/about">About</Link>
        <Link className={s.link} to="/contact">Contact</Link>
        <span className={s.spacer}> | </span>
        <span className={s.spacer}>or</span>
        <span className="pull-right"><LoginButton /></span>&nbsp;&nbsp;
        <span className="pull-right"><SignUpButton /></span>&nbsp;&nbsp;
      </div>
    );
  }
}

export default withStyles(s)(Navigation);
