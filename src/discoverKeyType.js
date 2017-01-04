import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

// this is bad tech debt, will fix when
// https://github.com/faunadb/core/issues/3546 makes admin keys able to do what server keys can do
// and https://github.com/faunadb/core/issues/3584 allows keys to know what kind they are
export default function discoverKeyType(client) {
  if (!client) return Promise.resolve({});
  const nonce = Math.random().toString(12).slice(2);
  return client.query(q.Create(Ref("databases"), { name: nonce+"console_key_type_discovery_db_created_and_deleted_automatically_always_safe_to_delete" }))
  .then(()=>{
    // we are an admin key, lets fix our mess
    return client.query(q.Delete(Ref("databases/"+nonce+"console_key_type_discovery_db_created_and_deleted_automatically_always_safe_to_delete"))).then(()=>{
      return {adminClient : client};
    })
  }, (error) => {
    // console.log("admin error", error)
    if (error.name === "PermissionDenied") {
      return client.query(q.Create(Ref("classes"), {
        name: nonce+"console_key_type_discovery_class_created_and_deleted_automatically_always_safe_to_delete"
      })).then(()=>{
        // we are a server key, lets fix our mess
        // console.log("server key", client)
        return client.query(q.Delete(Ref("classes/"+nonce+"console_key_type_discovery_class_created_and_deleted_automatically_always_safe_to_delete"))).then(()=>{
          return {serverClient : client};
        })
      }, (error) => {
        // console.log("server error", error)
        return client.query(q.Delete(Ref("classes/"+nonce+"console_key_type_discovery_class_created_and_deleted_automatically_always_safe_to_delete")))

      })
    } else {
      // delete the test db in case we are out of sync
      return client.query(q.Delete(Ref("databases/"+nonce+"console_key_type_discovery_db_created_and_deleted_automatically_always_safe_to_delete")))
    }
  }).catch((err)=>{
    console.error(err)
  })
}
