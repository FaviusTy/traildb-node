const fs = require('fs');
const {TrailDBConstructor, TrailDB, EventCursor} = require('../');

const user1 = '771799eb-6a0d-4555-9917-0a5d449b35ab';
const user2 = '8ff9b509-84a6-4888-8215-e66d7aefd1bc';
const filepath = `${__dirname}/test.tdb`;
const cons = new TrailDBConstructor({
  path: filepath,
  fieldNames: ['field1', 'field2']
});
if(fs.existsSync(filepath)) {
  const tdb = new TrailDB({path: filepath});
  cons.append(tdb);
}
cons.add(user1, new Date(), ['a']);
cons.add(user1, new Date(), ['b', 'c']);
cons.add(user2, new Date(), ['b', 'e']);
cons.add(user2, new Date(), ['d', 'e']);
cons.close();

/*
 * Unfiltered
 */
console.log('\nOutput (unfiltered):');
const tdb = new TrailDB({path: filepath});

tdb.trailIndexes().forEach((trailID) => {
  const UserId = tdb.getUserID(trailID);
  const cursor = new EventCursor(tdb, trailID, {toMap: true});
  for (const event of cursor) {
    console.log(UserId, event.timestamp, event.values);
  }
});

/*
 * Using TDB Filters
 *
 * Where `filters` is an array comprised of each `filter` object below:
 *
 * filter.field = {String} field name (mandatory)
 * filter.value = {String} field value (mandatory, can be empty string)
 * filter.neg = {Boolean} negative logic flag
 * filter.and = {Boolean} is this filter a new clause (AND) or part of the
 * previous clause (OR). Disregarded on the first filter statement.
 */
console.log('\nOutput (filtered):');

// This filter reads, "( field1 == 'b' && field2 == 'e' )"
const filters = [
  {
    field: 'field1',
    val: 'b',
    neg: false,
    and: false // this is disregarded for the first filter element
  },
  {
    field: 'field2',
    val: 'e',
    neg: false,
    and: true // Join to previous filter with a new 'and' clause
  }
];

tdb.trailIndexes().forEach((trailID) => {
  const UserID = tdb.getUserID(trailID);
  const cursor = new EventCursor(tdb, trailID, {toMap: true, filter: filters});
  for (const event of cursor) {
    console.log(UserID, event.timestamp, event.values);
  }
});

tdb.close();
