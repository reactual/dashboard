import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export function updateIndexInfo(client, database, result) {
  if(!Array.isArray(result))
    result = [result]

  return {
    type: "UPDATE_INDEX_INFO",
    scopedClient: client,
    database: database,
    result: result
  }
}

export function updateSelectedIndex(database, name) {
  return {
    type: "UPDATE_SELECTED_INDEX",
    database: database,
    name: name
  }
}

export function getAllIndexes(client, database) {
  return (dispatch, getState) => {
    const indexes = getState().indexes[database]

    if(indexes /*&& Object.keys(indexes).length > 0*/)
      return Promise.resolve()

    return client.query(q.Map(q.Paginate(Ref("indexes")), index => q.Get(index))).then(
      result => dispatch(updateIndexInfo(client, database, result.data))
    )
  }
}

export function getIndexInfo(client, database, name) {
  return (dispatch, getState) => {
    const indexes = getState().indexes[database]

    if(indexes && indexes[name]) {
      dispatch(updateSelectedIndex(database, name))
      return Promise.resolve()
    }

    return client.query(q.Get(q.Index(name))).then(result => {
      dispatch(updateIndexInfo(client, database, result))
    }).then(() => {
      dispatch(updateSelectedIndex(database, name))
    })
  }
}

