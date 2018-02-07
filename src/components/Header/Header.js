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
import s from './Header.css';
import Navigation from '../Navigation';
import logoUrl from './logo-small.png';
import logoUrl2x from './logo-small@2x.png';

class Header extends React.Component {
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <Navigation store={this.props.store} />
          <a className={s.brand} href="/">
            <span className={s.brandTxt}>
              <img src="https://dewey.tailorbrands.com/production/brand_version_mockup_image/760/439918760_702c7121-8bcb-4e44-a652-0074b0ef54c6.png?cb=1512775004" role="presentation"/>
            </span>
          </a>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Header);
