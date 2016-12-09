const {alloc, allocCString, types} = require('ref');

const API = require('./bindings/API');
const TrailDBError = require('./TrailDBError');

class EventFilter {

  /**
   * Create a new TrailDB Event Filter.
   * @param {Object} options
   * @return {Object} tdbFilter - T_TDB_FILTER Event Filter struct.
   * options.db = the TrailDB._db object
   * options.filter = the filter array as detailed below:
   *
   * -> options.filter is an array of individual filters to apply to the TDB
   * cursor. The filters are applied in the order as they appear in the filter
   * array. The mandatory properties for each filter are noted below.
   *
   * In the event that a Trail field name is not found, the filter is thus invaild
   * and a T_TDB_ERROR is thrown. If a field value (item) is not found,
   * then the current filter clause is not applied and no errors are thrown.
   *
   *
   * options.filter.field = field name (mandatory)
   * options.filter.value = field value for this filter (mandatory)
   * options.filter.operator = filter operator (not used, only '==' is supported)
   * options.filter.neg = negative logic flag {Boolean}
   * options.filter.and = is this filter a new clause (AND) or part of the
   * previous clause (OR). Disregarded on the first filter statement.
   */
  constructor(options) {
    /*\
    |*| Create the filter object
    \*/
    this._filter = API.tdb_event_filter_new();
    if (!this._filter) throw new TrailDBError('Filter initialization failed');

    /*\
    |*| Check for empty filter. If the filter is empty just reurn a new filter.
    |*| The function calling this class should avoid doing this because an
    |*| empty filter will return zero results,
    |*| eg: `tdb dump -i a.tdb --filter ''`
    \*/
    if (options.filter.length <= 0) return this;

    /*\
    |*| Iterate over the filters and process them into one filter struct
    \*/
    let validFilterClauses = 0;
    for (let i = 0; i < options.filter.length; i++) {
      /*\
      |*| Get the field ID
      \*/
      const fieldID = alloc(types.uint32, 1);
      if (API.tdb_get_field(options.db, allocCString(options.filter[i].field), fieldID)) {
        throw new TrailDBError(`Unable to locate field ID for: ${options.filter[i].field}`);
      }

      /*\
      |*| Double check this field ID
      |*|
      |*| May consider not throwing an error here.
      \*/
      if (fieldID.deref() == 0) throw new TrailDBError(`Unknown field name: ${options.filter[i].field}`);

      /*\
      |*| Setup item varaibles. Empty strings are ok.
      \*/
      const valString = allocCString(options.filter[i].val);
      const len = options.filter[i].val.length;
      const valLength = alloc(types.uint64, len);

      /*\
      |*| Get the item for this filter value.
      |*| If we did not find a maching item for this filter value, we
      |*| should use the 0 return value as the item.
      \*/
      const thisItem = API.tdb_get_item(
        options.db,
        fieldID.deref(),
        valString,
        valLength.deref());

      /*\
       |*| Check if we have another filter clause to join with this filter.
       |*|
       |*| The value of the 'and' property is ignored on the first filter
       |*| element in the incoming filter array as it will not be joined to an
       |*| existing filter
       \*/
      if (validFilterClauses) {
        const newClause = options.filter[i].and || false;
        /*\
        |*| We only need to add a new filter clause if this is an 'AND',
        |*| other wise this statement joins the current clause with an 'OR'
        \*/
        if (newClause && API.tdb_event_filter_new_clause(this._filter)) {
          throw new TrailDBError('Failed to add new clause to filter');
        }
      }
      /*\
      |*| Now we can add a new item to the filter
      \*/
      const neg = options.filter[i].neg ? 1 : 0;
      if (API.tdb_event_filter_add_term(this._filter, thisItem, neg)) {
        throw new TrailDBError('Unable to add item to event filter');
      }

      validFilterClauses++;
    }
  }

  free() {
    API.tdb_event_filter_free(this._filter);
  }
}

module.exports = EventFilter;
