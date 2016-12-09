const ffi = require('ffi');
const {refType, types} = require('ref');
const array = require('ref-array');
const {
  T_TDB, T_TDB_CONS, T_TDB_ERROR,
  T_TDB_ITEM, T_TDB_FIELD, T_TDB_VAL,
  T_TDB_CURSOR, T_TDB_EVENT, T_TDB_FILTER,
  T_STRING_ARRAY, T_UINT64_ARRAY
} = require('./CONSTANTS');

module.exports = ffi.Library('libtraildb', {
  tdb_cons_init: [T_TDB_CONS, []],
  tdb_cons_open: [T_TDB_ERROR, [
    T_TDB_CONS,
    types.CString,
    T_STRING_ARRAY,
    types.uint64
  ]],
  tdb_cons_close: [types.void, [T_TDB]],
  tdb_cons_add: [T_TDB_ERROR, [
    T_TDB_CONS,
    refType(types.byte),
    types.uint64,
    T_STRING_ARRAY,
    T_UINT64_ARRAY
  ]],
  tdb_cons_append: [T_TDB_ERROR, [T_TDB_CONS, T_TDB]],
  tdb_cons_finalize: [T_TDB_ERROR, [T_TDB_CONS]],

  tdb_init: [T_TDB, []],
  tdb_open: [T_TDB_ERROR, [T_TDB, types.CString]],
  tdb_close: [types.void, [T_TDB]],
  tdb_dontneed: [types.void, [T_TDB]],
  tdb_willneed: [types.void, [T_TDB]],

  tdb_lexicon_size: [T_TDB_ERROR, [T_TDB, T_TDB_FIELD]],

  tdb_get_field: [T_TDB_ERROR, [
    T_TDB,
    types.CString,
    refType(types.uint32)
  ]],
  tdb_get_field_name: [types.CString, [T_TDB, T_TDB_FIELD]],

  tdb_get_item: [T_TDB_ITEM, [
    T_TDB,
    T_TDB_FIELD,
    types.CString,
    types.uint64
  ]],
  tdb_get_value: [types.CString, [
    T_TDB,
    T_TDB_FIELD,
    T_TDB_VAL,
    refType(types.uint64)
  ]],
  tdb_get_item_value: [types.CString, [
    T_TDB,
    T_TDB_ITEM,
    refType(types.uint64)
  ]],

  tdb_get_uuid: [refType(types.byte), [T_TDB, types.uint64]],
  tdb_get_trail_id: [T_TDB_ERROR, [
    T_TDB,
    array(types.byte),
    refType(types.uint64)
  ]],

  tdb_error_str: [types.CString, [T_TDB_ERROR]],

  tdb_num_trails: [types.uint64, [T_TDB]],
  tdb_num_events: [types.uint64, [T_TDB]],
  tdb_num_fields: [types.uint64, [T_TDB]],
  tdb_min_timestamp: [types.uint64, [T_TDB]],
  tdb_max_timestamp: [types.uint64, [T_TDB]],

  tdb_version: [types.uint64, [T_TDB]],

  tdb_cursor_new: [T_TDB_CURSOR, [T_TDB]],
  tdb_cursor_free: [types.void, [T_TDB]],
  tdb_cursor_next: [refType(T_TDB_EVENT), [T_TDB_CURSOR]],
  tdb_cursor_set_event_filter: [T_TDB_ERROR, [T_TDB_CURSOR, T_TDB_FILTER]],
  tdb_cursor_unset_event_filter: [types.void, [T_TDB_CURSOR]],
  tdb_get_trail: [T_TDB_ERROR, [T_TDB_CURSOR, types.uint64]],
  tdb_get_trail_length: [types.uint64, [T_TDB_CURSOR]],

  tdb_event_filter_new: [T_TDB_FILTER, []],
  tdb_event_filter_free: [types.void, [T_TDB_FILTER]],
  tdb_event_filter_add_term: [T_TDB_ERROR, [T_TDB_FILTER, T_TDB_ITEM, types.int]],
  tdb_event_filter_new_clause: [T_TDB_ERROR, [T_TDB_FILTER]],
//  tdb_event_filter_num_clauses: [ref.types.uint64, [T_TDB_FILTER]],
//  tdb_event_filter_get_item: [T_TDB_ERROR, [T_TDB_FILTER,ref.types.uint64,ref.types.uint64,T_TDB_ITEM,ref.types.uint64]]
});