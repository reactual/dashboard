import React from 'react';
import NavSchema from './NavSchema'
import NavDBTree from './NavDBTree'

import { connect } from 'react-redux'

function NavTree(props) {
  if (props.adminClient || props.scopedServerClient) {
    return (
      <div className="NavTree ms-Grid-row">
        {/* nav databases */}
        <div className="ms-Grid-col ms-u-sm6 ms-u-md3 ms-u-lg2">
          <NavDBTree nonce={props.nonce} adminClient={props.adminClient}/>
        </div>
        <div className="ms-Grid-col ms-u-sm6 ms-u-md3 ms-u-lg2">
          <NavSchema nonce={props.nonce} splat={props.splat} serverClient={props.scopedServerClient} expanded/>
        </div>
        <div className="ms-Grid-col ms-u-sm12 ms-u-md6 ms-u-lg8">
          {props.children}
        </div>
      </div>
    );
  }
  return null;
}

function mapStateToProps(state) {
  return {
    adminClient: state.currentUser && state.currentUser.adminClient,
    serverClient: state.currentUser && state.currentUser.serverClient
  }
}

export default connect(mapStateToProps)(NavTree)
