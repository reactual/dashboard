import React from 'react'
import { Link } from 'react-router';
import IndexTermsList from './IndexTermsList'

export default function IndexCard({info, path}) {
  var active = info.active;
  var unique = info.unique;
  var source = info.source && info.source.value;

  return (
    <div className="IndexInfo">

      <div className="ms-Grid">
        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-u-sm6">
            Index: {info.name}
          </div>
          <div className="ms-Grid-col ms-u-sm6">
            Source: {source ?
              <Link to={path ?
                "/db/"+path+"/"+source :
                "/db/"+source}>{source}</Link> :
              " none"}
          </div>
        </div>

        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-u-sm4">
            Active: {active ? "true" : "false"}
          </div>
          <div className="ms-Grid-col ms-u-sm4">
            Unique: {unique ? "true" : "false"}
          </div>
          <div className="ms-Grid-col ms-u-sm4">
            Partitions: {info.partitions}
          </div>
        </div>

        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-u-sm6">
            <h3>Terms</h3>
            <IndexTermsList terms={info.terms}/>
          </div>
          <div className="ms-Grid-col ms-u-sm6">
            <h3>Values</h3>
            <IndexTermsList terms={info.values}/>
          </div>
        </div>
      </div>

    </div>
  )
}

