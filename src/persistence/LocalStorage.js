const withLocalStorage = (fn) => {
  const storage = window.localStorage
  if (!storage) return undefined

  try {
    return fn(storage)
  } catch (err) {
    return undefined
  }
}

export default class LocalStorage {
  static set(key, value) {
    withLocalStorage((storage) => {
      const json = JSON.stringify(value)
      storage.setItem(key, json)
    })
  }

  static get(key) {
    return withLocalStorage((storage) => {
      return JSON.parse(storage.getItem(key))
    })
  }
}
