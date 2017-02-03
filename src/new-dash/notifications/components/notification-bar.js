import React from "react"
import { connect } from "react-redux"
import { MessageBar, MessageBarType } from "office-ui-fabric-react"

import "./notification-bar.css"
import { NotificationType } from "../"

const messageBarTypeFor = (notificationType) => {
  switch (notificationType) {
    case NotificationType.ERROR:   return MessageBarType.error
    case NotificationType.SUCCESS: return MessageBarType.success
    default:                       return MessageBarType.info
  }
}

const NotificationBar = (props) => {
  return <div className="notification-bar">
      <ul>{
      props.notifications.map((notification, index) => (
        <li key={index} className="ms-u-fadeIn100">
          <MessageBar
            messageBarType={messageBarTypeFor(notification.type)}>
            {notification.message}
          </MessageBar>
        </li>
      ))
    }</ul>
  </div>
}

export default connect(
  state => ({
    notifications: state.get("notifications")
  })
)(NotificationBar)

