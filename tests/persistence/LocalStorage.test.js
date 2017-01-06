import localStorage from '../../src/persistence/LocalStorage'

const testData = { "test-data": 42 }

describe("When local storage api is available", () => {
  const mockLocalStorage = {
    getItem: jest.fn(() => '{"test-data":42}'),
    setItem: jest.fn()
  }

  beforeAll(() => { window.localStorage = mockLocalStorage })
  afterAll(() => { window.localStorage = undefined })

  it("should save an object to local storate", () => {
    localStorage.set("test", testData)
    expect(mockLocalStorage.setItem).toBeCalledWith("test", '{"test-data":42}')
  })

  it("should load an object from local storage", () => {
    expect(localStorage.get("test")).toEqual(testData)
    expect(mockLocalStorage.getItem).toBeCalledWith("test")
  })
})

describe("When local storage api os NOT available", () => {
  it("should not fail when trying to save an object", () => {
    localStorage.set("test", testData)
  })

  it("should return undefined when trying to load an object", () => {
    expect(localStorage.get("test")).toBeUndefined()
  })
})
