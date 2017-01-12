class User {
  constructor(endpoint, secret, settings = {}) {
    this.endpoint = endpoint
    this.secret = secret
    this.settings = settings
  }
}

export class UnknownUser extends User {}

export class CloudUser extends User {
  constructor(endpoint, secret, email, userId, settings = {}) {
    super(endpoint, secret, settings)
    this.email = email
    this.userId = userId
  }
}
