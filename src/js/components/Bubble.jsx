'use strict';

import React from 'react';
import Draggable from 'react-draggable';
import FontAwesome from 'react-fontawesome';

export default React.createClass({

  render() {
    return (
      
      <Draggable>
          <div className="bubble-outer-container">
            <div className="bubble-container">
              <div className="bubble-content">
                <FontAwesome
                   className='bubble-icon'
                   name='rocket'
                   size='2x' />
              </div>
              <div className="bubble-label">
                Label
              </div>
            </div>

          </div>
          
      </Draggable>
    );
  },
});
