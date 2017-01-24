import { parse as parseURL } from 'url'
import faunadb from 'faunadb'

import {
  Notification,
  NotificationType,
  pushNotification,
  removeNotification
} from '../notification'

var errors = []

const onSuccess = dispatch => () => {
  if (errors.length > 0) {
    dispatch(removeNotification(errors))
    errors = []
  }
}

const onError = dispatch => newErrors => {
  const oldErrors = errors
  errors = errors.concat(newErrors)

  setTimeout(
    () => dispatch(removeNotification(oldErrors)),
    2000
  )

  dispatch(pushNotification(newErrors))
}

const buildErrorMessage = error => {
  var message = ""
  if (error.description) message += error.description

  if (error.failures) {
    error.failures.forEach(failure => {
      message += " ("+ failure.field.join('.') +") " + failure.description
    })
  }

  return new Notification(NotificationType.ERROR, message)
}

const observerCallback = (onSuccess, onError) => response => {
  const errors = response.responseContent.errors

  if (errors) {
    onError(errors.map(buildErrorMessage))
    return
  }

  onSuccess()
}

export function createClient(endpoint, secret, dispatch) {
  var opts = {
    secret,
    observer : observerCallback(
      onSuccess(dispatch),
      onError(dispatch)
    )
  }

  if (endpoint) {
    const endpointURL = parseURL(endpoint)
    opts.domain = endpointURL.hostname
    opts.scheme = endpointURL.protocol.replace(/:$/,'')

    if (endpointURL.port) {
      opts.port = endpointURL.port
    }
  }

  return new faunadb.Client(opts)
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
