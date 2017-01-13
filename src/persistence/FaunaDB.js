import { parse as parseURL } from 'url'
import faunadb from 'faunadb'

export function createClient(user, onSuccess = () => null, onError = () => null) {
  if (!user) return null;

  var opts = {
    secret: user.secret,
    observer : observerCallback(onSuccess, onError)
  }

  if (user.endpoint) {
    const endpointURL = parseURL(user.endpoint)
    opts.domain = endpointURL.hostname
    opts.scheme = endpointURL.protocol.replace(/:$/,'')

    if (endpointURL.port) {
      opts.port = endpointURL.port
    }
  }

  return new faunadb.Client(opts)
}

function observerCallback(onSuccess, onError) {
  return response => {
    if (!response.responseContent.errors) {
      onSuccess()
    } else {
      const errors = response.responseContent.errors.map(buildErrorMessage)
      onError(errors)
    }
  }
}

function buildErrorMessage(error) {
  var message = ""

  if (error.description) {
    message += error.description
  }

  if (error.failures) {
    error.failures.forEach(failure => {
      message += " ("+ failure.field.join('.') +") " + failure.description
    })
  }

  return message
}

// https://github.com/faunadb/core/issues/3546 will admin keys able to do what server keys can do
export function clientForSubDB(adminClient, dbName, type) {
  if (!adminClient) return null;
  if (!dbName) return adminClient;

  var path, encoded = adminClient._secret,
    parts = encoded.split(":"),
    secret = parts.shift();

  if (parts.length === 2) {
    path = parts[0] + "/" + dbName
  } else {
    path = dbName
  }

  var newSecret = secret + ":" + path + ":" + type;
  var baseUrl = parseURL(adminClient._baseUrl);

  return new faunadb.Client({
    domain : baseUrl.hostname,
    port : baseUrl.port,
    scheme : baseUrl.protocol.replace(':',''),
    observer : adminClient._observer,
    secret : newSecret
  })
}
