import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

// Actions
const Actions = {
  UPDATE_CLASS_INFO: "UPDATE_CLASS_INFO",
  UPDATE_SELECTED_CLASS: "UPDATE_SELECTED_CLASS",
  FETCHING_CLASSES: "FETCHING_CLASSES",
  FETCHING_INDEXES_OF_CLASS: "FETCHING_INDEXES_OF_CLASS",
  UPDATE_INDEX_OF_CLASS: "UPDATE_INDEX_OF_CLASS"
}

export function updateClassInfo(result) {
  if(!Array.isArray(result))
    result = [result]

  return {
    type: Actions.UPDATE_CLASS_INFO,
    result: result
  }
}

export function updateSelectedClass(name) {
  return {
    type: Actions.UPDATE_SELECTED_CLASS,
    name: name
  }
}

export function fetchingClasses(fetching) {
  return {
    type: Actions.FETCHING_CLASSES,
    fetching: fetching
  }
}

export function fetchingIndexesOfClass(fetching) {
  return {
    type: Actions.FETCHING_INDEXES_OF_CLASS,
    fetching: fetching
  }
}

export function getAllClasses(client) {
  return (dispatch, getState) => {
    const classes = getState().classes

    if(classes.fetchingData || classes.byName)
      return Promise.resolve()

    dispatch(fetchingClasses(true))

    return client.query(q.Map(q.Paginate(Ref("classes")), clazz => q.Get(clazz)))
      .then(result => {
        dispatch(updateClassInfo(result.data))
        dispatch(fetchingClasses(false))
      })
      .catch(error => {
        dispatch(fetchingClasses(false))
        throw error
      })
  }
}

export function updateIndexOfClass(clazz, indexes) {
  return {
    type: Actions.UPDATE_INDEX_OF_CLASS,
    clazz: clazz,
    indexes: indexes
  }
}

export function queryForIndexes(client, classRef) {
  return (dispatch, getState) => {
    const name = classRef.id
    const classes = getState().classes

    if(classes.fetchingIndexes || (classes.indexes && classes.indexes[name]))
      return Promise.resolve()

    const allIndexes = q.Filter(
      q.Map(q.Paginate(Ref("indexes")), indexRef => q.Get(indexRef)),
      indexInstance => {
        return q.If(q.Contains("source", indexInstance),
          q.Equals(classRef, q.Select("source", indexInstance)),
          true
        )
      }
    )

    dispatch(fetchingIndexesOfClass(true))

    return client.query(q.Map(allIndexes, index => q.Select(['name'], index)))
      .then(result => {
        dispatch(updateIndexOfClass(name, result.data))
        dispatch(fetchingIndexesOfClass(false))
      })
      .catch(error => {
        dispatch(fetchingIndexesOfClass(false))
        throw error
      })
  }
}

export function createClass(client, config) {
  return (dispatch, getState) => {
    if(getState().classes.fetchingData)
      return Promise.resolve()

    dispatch(fetchingClasses(true))

    return client.query(q.CreateClass(config))
      .then(clazz => {
        dispatch(updateClassInfo(clazz))
        dispatch(fetchingClasses(false))
        return clazz
      })
      .catch(error => {
        dispatch(fetchingClasses(false))
        throw error
      })
  }
}

export function createInstance(client, classRef, data) {
  return (dispatch, getState) => {
    if(getState().classes.fetchingData)
      return Promise.resolve()

    dispatch(fetchingClasses(true))

    return client.query(q.Create(classRef, { data: data }))
      .then(() => dispatch(fetchingClasses(false)))
      .catch(error => {
        dispatch(fetchingClasses(false))
        throw error
      })
  }
}

// Reducers

/*
  Shape of data

  classes: {
    byName: {
      "class-0": {},
      "class-1": {}
    },
    indexes: {
      "class-0": ["index-0", "index-1"],
      "class-1": ["index-1"]
    },
    selectedClass: "class-0",
    fecthingData: true,
    fetchingIndexes: false
  }

*/

export function reduceClasses(state = {}, action) {
  switch(action.type) {
    case Actions.UPDATE_CLASS_INFO: {
      var byName = state.byName || {}

      action.result.forEach(clazz => {
        byName = {...byName,
          [clazz.name]: {
            classInfo: clazz
          }
        }
      })
      return {...state, byName: byName}
    }

    case Actions.UPDATE_SELECTED_CLASS:
      return {...state, selectedClass: action.name}

    case Actions.UPDATE_INDEX_OF_CLASS: {
      const indexes = {...state.indexes, [action.clazz]: [...action.indexes]}
      return {...state, indexes: indexes}
    }

    case Actions.FETCHING_CLASSES:
      return {...state, fetchingData: action.fetching}

    case Actions.FETCHING_INDEXES_OF_CLASS:
      return {...state, fetchingIndexes: action.fetching}

    default:
      return state
  }
}

