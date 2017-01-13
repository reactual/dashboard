import React from "react"
import { connect } from "react-redux"
import { MessageBar, MessageBarType } from "office-ui-fabric-react"
import { removeNotification, NotificationType } from "."

const messageBarTypeFor = (notificationType) => {
  switch (notificationType) {
    case NotificationType.ERROR:   return MessageBarType.error
    case NotificationType.SUCCESS: return MessageBarType.success
    default:                       return MessageBarType.info
  }
}

function NotificationBar({ notifications, dispatch }) {
  return <ul className="message-bar">{
    notifications.map(notification => (
      <li key={notification.id}>
        <MessageBar
          messageBarType={messageBarTypeFor(notification.type)}
          onDismiss={() => dispatch(removeNotification(notification))}>
          {notification.message}
        </MessageBar>
      </li>
    ))
  }</ul>
}

export default connect(
  state => ({
    notifications: state.notifications
  })
)(NotificationBar)
