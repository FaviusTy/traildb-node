const {alloc, allocCString, readUInt64LE, types} = require('ref');

const API = require('./bindings/API');
const {tdb_item_field, uuidRaw, uuidHex} = require('./helper');
const TrailDBError = require('./TrailDBError');

//
// TrailDB class
// Query a TrailDB.
//
class TrailDB {

  /**
   * Opens a TrailDB at path.
   * @param {String} options.path - TrailDB output path (without .tdb).
   * @return {Object} tdb - TrailDB object.
   */
  constructor(options) {
    this._db = API.tdb_init();

    const r = API.tdb_open(this._db, allocCString(options.path));
    if (r !== 0) throw new TrailDBError(`Could not open TrailDB: ${r}`);

    this.version = API.tdb_version(this._db);
    this.numTrails = API.tdb_num_trails(this._db);
    this.numEvents = API.tdb_num_events(this._db);
    this.numFields = API.tdb_num_fields(this._db);

    this.fieldNames = [];
    this.fieldNameToId = {};
    for (let i = 0; i < this.numFields; i++) {
      this.fieldNames[i] = API.tdb_get_field_name(this._db, i);
      this.fieldNameToId[this.fieldNames[i]] = i;
    }
  }

  /**
   * Closes current TrailDB.
   */
  close() {
    API.tdb_close(this._db);
  }

  dontneed() {
    API.tdb_dontneed(this._db);
  }

  willneed() {
    API.tdb_willneed(this._db);
  }

  trailIndexes() {
    return Array.from(Array(this.numTrails).keys());
  }

  getUserID(trailID) {
    return uuidHex(API.tdb_get_uuid(this._db, trailID));
  }

  getTrailID(UserID) {
    return API.tdb_get_trail_id(this._db, uuidRaw(UserID));
  }

  /**
   * Return the string key corresponding to an item.
   * @param {T_TDB_ITEM} item - The item from EventsIterator.
   * @return {String} key - Item string key.
   */
  getItemKey(item) {
    return API.tdb_get_field_name(this._db, tdb_item_field(item));
  }

  /**
   * Return the string value corresponding to an item.
   * @param {T_TDB_ITEM} item - The item from EventsIterator.
   * @return {String} value - Item string value.
   */
  getItemValue(item) {
    const length = alloc(types.uint64);
    const value = API.tdb_get_item_value(this._db, item, length);
    return value ? value.slice(0, readUInt64LE(length, 0)) : '';
  }

  /**
   * Return the minimum timestamp of this TrailDB.
   */
  minTimestamp() {
    return API.tdb_min_timestamp(this._db);
  }

  /**
   * Return the maximum timestamp of this TrailDB.
   */
  maxTimestamp() {
    return API.tdb_max_timestamp(this._db);
  }
}

module.exports = TrailDB;
