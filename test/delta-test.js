var tape = require("tape"),
    internals = require("../build/topojson-internals"),
    delta = internals.delta;

tape("delta converts arcs to delta encoding", function(test) {
  test.deepEqual(delta([
    [[0, 0], [9999, 0], [0, 9999], [0, 0]]
  ]), [
    [[0, 0], [9999, 0], [-9999, 9999], [0, -9999]]
  ]);
  test.end();
});

tape("delta skips coincident points", function(test) {
  test.deepEqual(delta([
    [[0, 0], [9999, 0], [9999, 0], [0, 9999], [0, 0]]
  ]), [
    [[0, 0], [9999, 0], [-9999, 9999], [0, -9999]]
  ]);
  test.end();
});

tape("delta preserves at least two positions", function(test) {
  test.deepEqual(delta([
    [[12345, 12345], [12345, 12345], [12345, 12345], [12345, 12345]]
  ]), [
    [[12345, 12345], [0, 0]]
  ]);
  test.end();
});
