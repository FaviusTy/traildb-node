const {alloc, allocCString, deref, types} = require('ref');

const {T_STRING_ARRAY, T_UINT64_ARRAY} = require('./bindings/CONSTANTS');
const {
  tdb_cons_init, tdb_cons_open, tdb_cons_close, tdb_cons_add, tdb_cons_append, tdb_cons_finalize
} = require('./bindings/API');
const {uuidRaw} = require('./helper');
const TrailDBError = require('./TrailDBError');

//
// TrailDBConstructor class
// Construct a new TrailDB.
//

class TrailDBConstructor {

  /**
   * Initialize a new TrailDBConstructor.
   * @param {String} options.path - TrailDB output path (without .tdb).
   * @param {Array[String]} options.fieldNames - Array of field names in this TrailDB.
   * @return {Object} cons - TrailDB constructor object.
   */
  constructor(options = {}) {
    if (!options.path) throw new TrailDBError('Path is required');
    if (!options.fieldNames || !options.fieldNames.length) throw new TrailDBError('Field names are required');

    this.path = options.path;
    this.fieldNames = options.fieldNames;
    this.numFields = this.fieldNames.length;

    if (this.path.slice(-4) === '.tdb') {
      this.path = this.path.slice(0, -4);
    }

    this._cons = tdb_cons_init();

    const fieldNamesLength = alloc(types.uint64, this.numFields);
    const fieldNamesArray = new T_STRING_ARRAY(this.numFields);
    this.fieldNames.forEach((field, i) => {
      fieldNamesArray[i] = allocCString(field);
    });

    const r = tdb_cons_open(
      this._cons,
      allocCString(this.path),
      fieldNamesArray,
      deref(fieldNamesLength)
    );

    if (r !== 0) throw new TrailDBError(`Cannot open constructor: ${r}`);
  }

  /**
   * Frees current TrailDB constructor handle.
   */
  close() {
    if(!this.finalized) this.finalize();
    tdb_cons_close(this._cons);
  }

  /**
   * Add an event to TrailDB.
   * @param {String} uuid - UUID of this event.
   * @param {Number/Object} tstamp - Numeric date or Javascript Date object.
   * @param {Array[String]} values - Field values.
   */
  add(uuid, tstamp, values) {
    if (tstamp.constructor === Date) {
      tstamp = tstamp.valueOf();
    }

    const valuesLengths = new T_UINT64_ARRAY(this.numFields);
    const valuesArray = new T_STRING_ARRAY(this.numFields);
    for (let i = 0; i < this.numFields; i++) {
      const value = values[i] || '\0';
      valuesLengths[i] = value.length;
      valuesArray[i] = allocCString(value);
    }

    const r = tdb_cons_add(
      this._cons,
      uuidRaw(uuid),
      tstamp,
      valuesArray,
      valuesLengths
    );

    if (r) throw new TrailDBError(`Too many values: ${r}`);
  }

  /**
   * Merge an existing TrailDB to this constructor. The fields must be equal
   * between the existing and the new TrailDB.
   * @param {TrailDB} tdb - An existing TrailDB object.
   */
  append(tdb) {
    const r = tdb_cons_append(this._cons, tdb._db);
    if (r < 0) throw new TrailDBError(`Wrong number of fields: ${r}`);
    if (r > 0) throw new TrailDBError(`Too many values: ${r}`);
  }

  /**
   * Finalize TrailDB construction.
   */
  finalize() {
    const r = tdb_cons_finalize(this._cons);
    if (r) throw new TrailDBError(`Could not finalize: ${r}`);
    this.finalized = true;
  }
}

module.exports = TrailDBConstructor;
