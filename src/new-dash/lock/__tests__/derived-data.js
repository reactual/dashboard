import Immutable from "immutable"

import { isLocked } from "../"

describe("isLocked", () => {
  it("should tell if lock is enabled", () => {
    const locked = isLocked(Immutable.fromJS({
      lock: {
        isLocked: true
      }
    }))

    expect(locked).toBeTruthy()
  })

  it("should tell if lock is disabled", () => {
    const locked = isLocked(Immutable.fromJS({
      lock: {
        isLocked: false
      }
    }))

    expect(locked).toBeFalsy()
  })
})
