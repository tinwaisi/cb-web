/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import { Badge } from 'react-bootstrap';

class StatusBadge extends React.Component {
      render(){
          return (<Badge>{this.props.text}</Badge>);
      }
}

export default StatusBadge;
