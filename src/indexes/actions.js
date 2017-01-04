import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export function updateIndexInfo(result) {
  if(!Array.isArray(result))
    result = [result]

  return {
    type: "UPDATE_INDEX_INFO",
    result: result
  }
}

export function updateSelectedIndex(name) {
  return {
    type: "UPDATE_SELECTED_INDEX",
    name: name
  }
}

export function fetchingIndexes(fetching) {
  return {
    type: "FETCHING_INDEXES",
    fetching: fetching
  }
}

export function getAllIndexes(client) {
  return (dispatch, getState) => {
    const indexes = getState().indexes

    if(indexes.fetchingData || Object.keys(indexes.byName || {}).length > 0)
      return Promise.resolve()

    dispatch(fetchingIndexes(true))

    return client.query(q.Map(q.Paginate(Ref("indexes")), index => q.Get(index)))
      .then(result => dispatch(updateIndexInfo(result.data)))
      .then(() => dispatch(fetchingIndexes(false)))
  }
}

