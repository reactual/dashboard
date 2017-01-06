class User {
  constructor(endpoint, secret) {
    this.endpoint = endpoint
    this.secret = secret
  }
}

export class UnknownUser extends User {}

export class CloudUser extends User {
  constructor(endpoint, secret, email, userId) {
    super(endpoint, secret)
    this.email = email
    this.userId = userId
  }
}
