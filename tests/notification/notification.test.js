import {
  reduceNotifications,
  pushNotification,
  removeNotification,
  resetNotifications,
  Notification,
  NotificationType
} from "../../src/notification"

import { createStore } from "redux"

describe("Given an notification store", () => {
  var store, state

  beforeEach(() => {
    store = createStore(reduceNotifications)
    store.subscribe(() => state = store.getState())
  })

  describe("when no notifications are present", () => {
    it("should be able to push new notification", () => {
      store.dispatch(pushNotification(
        new Notification(NotificationType.ERROR, "A new error")
      ))

      expect(state.length).toEqual(1)
      expect(state[0].message).toEqual("A new error")
    })
  })

  describe("when notifications are present", () => {
    beforeEach(() => {
      store.dispatch(pushNotification([
        new Notification(NotificationType.ERROR, "first error"),
        new Notification(NotificationType.ERROR, "second error")
      ]))
    })

    it("should be able to reset errors", () => {
      store.dispatch(resetNotifications())
      expect(state).toEqual([])
    })

    it("should be able to remove errors", () => {
      store.dispatch(removeNotification(state[0]))
      expect(state[0].message).toEqual("second error")
    })
  })
})
