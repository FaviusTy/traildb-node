const {deref, sizeof, reinterpret} = require('ref');

const {T_TDB_ITEM} = require('./bindings/CONSTANTS');
const API = require('./bindings/API');
const TrailDBError = require('./TrailDBError');
const EventFilter = require('./EventFilter');

class EventCursor {
  constructor(tdb, trailID, options = {}) {
    this.tdb = tdb;
    this.toMap = options.toMap;
    this._cursor = API.tdb_cursor_new(this.tdb._db);
    this.resetTrail(trailID);
    if(options.filter) this.setFilter(options.filter);
  }

  resetTrail(trailID) {
    if(!trailID) throw new TrailDBError(`undefined trailID: ${trailID}`);
    const r = API.tdb_get_trail(this._cursor, trailID);
    if (r) throw new TrailDBError(`Failed to open trail cursor: ${trailID}`);
    this.targetTrail = trailID;
  }

  setFilter(filter) {
    if(!filter) return;
    this.filter = new EventFilter({db: this.tdb._db, filter});
    const err = API.tdb_cursor_set_event_filter(this._cursor, this.filter._filter);
    if(err) throw new TrailDBError(`Unable to set event filter: ${this.tdb.id}`);
  }

  unsetFilter() {
    if(!this.filter) return;
    API.tdb_cursor_unset_event_filter(this._cursor);
    this.filter.free();
    this.filter = null;
  }

  get length() {
    return API.tdb_get_trail_length(this._cursor);
  }

  [Symbol.iterator]() {
    return {
      next: () => {
        const eventPtr = API.tdb_cursor_next(this._cursor);

        if(!eventPtr || !eventPtr.length) {
          this.free();
          return {done: true}
        }

        const event = deref(eventPtr);
        const list = [];
        const map = {};

        for (let i = 0; i < event.num_items; i++) {
          let addr = reinterpret(eventPtr, T_TDB_ITEM.size, 2 * sizeof.uint64 + T_TDB_ITEM.size * i);
          addr.type = T_TDB_ITEM;
          addr = deref(addr);

          const value = this.tdb.getItemValue(addr);
          list.push(value);
          if (this.toMap) map[this.tdb.getItemKey(addr)] = value;
        }

        const value = {
          timestamp: event.timestamp,
          values: this.toMap ? map : list
        };

        return { value: value, done: false };
      }
    }
  }

  free() {
    if(this.filter) this.filter.free();
    API.tdb_cursor_free(this._cursor);
    this.filter = null;
    this._cursor = null;
  }
}

module.exports = EventCursor;
