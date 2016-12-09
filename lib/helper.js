const {reinterpret} = require('ref');

const {UUID_REGEX} = require('./bindings/CONSTANTS');
const TrailDBError = require('./TrailDBError');

//
// Helper functions
//

/**
 * Returns a UUID buffer.
 * @param {String} uuid - UUID string.
 * @return {Array[Byte]} uuid - UUID buffer.
 */
function uuidRaw(uuid) {
  if (!UUID_REGEX.test(uuid)) throw new TrailDBError('Invalid UUID');
  return new Buffer(uuid.replace(/-/g, ''), 'hex');
}

/**
 * Returns a UUID hex string.
 * @param {Array[Byte]} uuid - UUID buffer.
 * @return {String} uuid - UUID string.
 */
function uuidHex(uuid) {
  uuid = reinterpret(uuid, 16).toString('hex');
  return [
    uuid.slice(0, 8),
    uuid.slice(8, 12),
    uuid.slice(12, 16),
    uuid.slice(16, 20),
    uuid.slice(20, 32)
  ].join('-');
}

function tdb_item_is_32(item) { return !(item & 128); };

/**
 * Returns field part of an item. Ported from tdb_types.h.
 * @param {T_TDB_ITEM} item
 * @return {T_TDB_FIELD} field
 */
function tdb_item_field(item) {
  if (tdb_item_is_32(item)) return item & 127;
  return (item & 127) | (((item >> 8) & 127) << 7);
}

module.exports = {
  uuidRaw, uuidHex, tdb_item_is_32, tdb_item_field
};
