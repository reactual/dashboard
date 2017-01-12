export default class Lead {
  static from(user) {
    if (!user || !user.settings || !user.settings.intercom)
      return null

    const {
      email,
      userId,
      settings: {
        intercom: { appId, userHash }
      }
    } = user

    if (!appId || !userId || !email) return null;
    return new Lead(userId, email, appId, userHash)
  }

  constructor(userId, email, appId, hash) {
    this.userId = userId
    this.email = email
    this.appId = appId
    this.hash = hash
  }

  get settings() {
    return {
      app_id: this.appId,
      user_id: this.userId,
      email: this.email,
      user_hash: this.hash
    }
  }
}
