import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export function updateIndexInfo(client, result) {
  if(!Array.isArray(result))
    result = [result]

  return {
    type: "UPDATE_INDEX_INFO",
    scopedClient: client,
    result: result
  }
}

export function updateSelectedIndex(name) {
  return {
    type: "UPDATE_SELECTED_INDEX",
    name: name
  }
}

export function getAllIndexes(client) {
  return (dispatch, getState) => {
    if(Object.keys(getState().indexes).length > 0)
      return Promise.resolve()

    return client.query(q.Map(q.Paginate(Ref("indexes")), index => q.Get(index))).then(
      result => dispatch(updateIndexInfo(client, result.data))
    )
  }
}

export function getIndexInfo(client, name) {
  return (dispatch, getState) => {
    if(getState().indexes[name]) {
      dispatch(updateSelectedIndex(name))
      return Promise.resolve()
    }

    return client.query(q.Get(q.Index(name))).then(result => {
      dispatch(updateIndexInfo(client, result))
    }).then(() => {
      dispatch(updateSelectedIndex(name))
    })
  }
}

