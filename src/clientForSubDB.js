import faunadb from 'faunadb';
import {parse} from 'url'

// https://github.com/faunadb/core/issues/3546 will admin keys able to do what server keys can do
export default function clientForSubDB(adminClient, db_name, type) {
  if (!adminClient) return false;
  if (!db_name) return adminClient;
  var path, encoded = adminClient._secret,
    parts = encoded.split(":"),
    secret = parts.shift();
  if (parts.length === 2) {
    path = parts[0] + "/" + db_name
  } else {
    path = db_name
  }
  var newSecret = secret + ":" + path + ":" + type;
  var baseUrl = parse(adminClient._baseUrl);
  return new faunadb.Client({
    domain : baseUrl.hostname,
    port : baseUrl.port,
    scheme : baseUrl.protocol.replace(':',''),
    observer : adminClient._observer,
    secret : newSecret
  })
}
