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
import s from './Home.css';
import SignUpButton from '../../components/SignUpButton';
import store from '../../store/contextStore';

class Home extends React.Component {
  static propTypes = {
    news: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      content: PropTypes.string,
    })).isRequired,
  };

  render() {
    const currentUser = store.getCurrentUser();
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className="text-center">
            <h1 >Artwork Portal</h1>
            <p>New way of film/video production</p>
            {!currentUser && <SignUpButton/>}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Home);
