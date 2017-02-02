import faunadb from "faunadb"
import { parse as parseURL } from "url"

export default class FaunaClient {
  static KeyType = {
    ADMIN: "admin",
    SERVER: "server"
  }

  constructor(endpoint, secret, keyType) {
    const config = {}

    if (endpoint) {
      const endpointURL = parseURL(endpoint)
      config.domain = endpointURL.hostname
      config.scheme = endpointURL.protocol.replace(/:$/,'')

      if (endpointURL.port) {
        config.port = endpointURL.port
      }
    }

    this.endpoint = endpoint
    this.secret = secret
    this.config = config
    this.keyType = keyType
  }

  query(dbPath, keyType, expr) {
    if (!this.hasPrivileges(keyType))  {
      return Promise.reject(
        new Error(`Your key does not have ${keyType} privileges. Current key is a ${this.keyType} key`)
      )
    }

    const config = { ...this.config, secret: this.__secretForSubDB(dbPath, keyType) }
    return new faunadb.Client(config).query(expr)
  }

  queryWithPrivilegesOrElse(dbPath, keyType, orElse, expr) {
    if (this.hasPrivileges(keyType))
      return this.query(dbPath, keyType, expr)

    return Promise.resolve(orElse)
  }

  hasPrivileges(keyType) {
    return this.keyType === FaunaClient.KeyType.ADMIN || keyType === this.keyType
  }

  __secretForSubDB(dbPath, keyType) {
    const dbName = dbPath.join("/")
    if (!dbName) return this.secret

    const parts = this.secret.split(":")
    const secret = parts.shift()
    const path = parts.length === 2 ? `${parts[0]}/${dbName}` : dbName

    return `${secret}:${path}:${keyType}`
  }
}

export const KeyType = FaunaClient.KeyType
