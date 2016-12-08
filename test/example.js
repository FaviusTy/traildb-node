const fs = require('fs');
const traildb = require('../');
const TrailDBConstructor = traildb.TrailDBConstructor;
const TrailDB = traildb.TrailDB;

const user1 = '771799eb-6a0d-4555-9917-0a5d449b35ab';
const user2 = '8ff9b509-84a6-4888-8215-e66d7aefd1bc';
const filepath = `${__dirname}/test.tdb`;
const cons = new TrailDBConstructor({
  path: filepath,
  fieldNames: ['field1', 'field2']
});
if(fs.existsSync(filepath)) cons.append(new TrailDB({path: filepath}));
cons.add(user1, new Date(), ['a']);
cons.add(user1, new Date(), ['b', 'c']);
cons.add(user2, new Date(), ['b', 'e']);
cons.add(user2, new Date(), ['d', 'e']);
cons.finalize();
cons.close();

/*
 * Unfiltered
 */
console.log('Output (unfiltered):');
const tdb = new TrailDB({path: filepath});
for (const trail of tdb.trails()) {
  const trailUuid = trail.getUuid();
  for (const event of trail.events({ toMap: true })) {
    console.log(trailUuid, event.timestamp, event.map);
  }
}

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
console.log('Output (filtered):');

for (const trail of tdb.trails()) {
  const trailUuid = trail.getUuid();

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

  for (const event of trail.events({ toMap: true, filter: filters })) {
    console.log(trailUuid, event.timestamp, event.map);
  }
}
