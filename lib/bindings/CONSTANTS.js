const {refType, types} = require('ref');
const array = require('ref-array');
const struct = require('ref-struct');

/**
 * @file Node.js bindings for TrailDB.
 * Note: At this time, supports synchronous execution only.
 */

// traildb types
const T_TDB = refType(types.void);
const T_TDB_CONS = refType(types.void);
const T_TDB_FIELD = types.uint32;
const T_TDB_VAL = types.uint64;
const T_TDB_ITEM = types.uint64;
const T_TDB_CURSOR = refType(types.void);
const T_TDB_ERROR = types.int;

// array types
const T_UINT64_ARRAY = array(types.uint64);
const T_STRING_ARRAY = array(types.CString);

// tdb_event struct
const T_TDB_EVENT = struct({
  timestamp: types.uint64,
  num_items: types.uint64,
  items: array(T_TDB_ITEM)
});

// tdb_event_filter struct
const T_TDB_FILTER = refType(types.void);

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

module.exports = {
  T_TDB, T_TDB_CONS, T_TDB_FIELD, T_TDB_VAL, T_TDB_ITEM, T_TDB_CURSOR, T_TDB_ERROR,
  T_UINT64_ARRAY, T_STRING_ARRAY, T_TDB_EVENT, T_TDB_FILTER, UUID_REGEX
};
