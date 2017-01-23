import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

// Actions

const Actions = {
  UPDATE_INDEX_INFO: "UPDATE_INDEX_INFO",
  UPDATE_SELECTED_INDEX: "UPDATE_SELECTED_INDEX",
  FETCHING_INDEXES: "FETCHING_INDEXES"
}

export function updateIndexInfo(result) {
  if(!Array.isArray(result))
    result = [result]

  return {
    type: Actions.UPDATE_INDEX_INFO,
    result: result
  }
}

export function updateSelectedIndex(name) {
  return {
    type: Actions.UPDATE_SELECTED_INDEX,
    name: name
  }
}

export function fetchingIndexes(fetching) {
  return {
    type: Actions.FETCHING_INDEXES,
    fetching: fetching
  }
}

export function createIndex(client, config) {
  return (dispatch, getState) => {
    const indexes = getState().indexes

    if(indexes.fetchingData)
      return Promise.resolve()

    dispatch(fetchingIndexes(true))

    return client.query(q.CreateIndex(config))
      .then(index => {
         dispatch(updateIndexInfo(index))
         dispatch(fetchingIndexes(false))
      })
      .catch(error => {
        dispatch(fetchingIndexes(false))
        throw error
      })
  }
}


export function getAllIndexes(client) {
  return (dispatch, getState) => {
    const indexes = getState().indexes

    if(indexes.fetchingData || indexes.byName)
      return Promise.resolve()

    dispatch(fetchingIndexes(true))

    return client.query(q.Map(q.Paginate(Ref("indexes")), index => q.Get(index)))
      .then(result => {
         dispatch(updateIndexInfo(result.data))
         dispatch(fetchingIndexes(false))
      })
      .catch(error => {
        dispatch(updateIndexInfo([]))
        dispatch(fetchingIndexes(false))
        throw error
      })
  }
}

// Reducers

/*
  Shape of data

  indexes: {
    byName: {
      "index-0": {},
      "index-1": {}
    },
    selectedIndex: "index-0",
    fecthingData: true
  }

*/

export function reduceIndexes(state = {}, action) {
  switch(action.type) {
    case Actions.UPDATE_INDEX_INFO: {
      var byName = state.byName || {}

      action.result.forEach(index => {
        byName = {...byName,
          [index.name]: {
            indexInfo: index,
            scopedClient: action.scopedClient
          }
        }
      })

      return {...state, byName: byName}
    }

    case Actions.UPDATE_SELECTED_INDEX:
      return {...state, selectedIndex: action.name}

    case Actions.FETCHING_INDEXES:
      return {...state, fetchingData: action.fetching}

    default:
      return state
  }
}

