export default function(objects, bbox, n) {
  var x0 = bbox[0],
      y0 = bbox[1],
      x1 = bbox[2],
      y1 = bbox[3],
      kx = x1 - x0 ? (n - 1) / (x1 - x0) : 1,
      ky = y1 - y0 ? (n - 1) / (y1 - y0) : 1;

  function quantizePoint(input) {
    return [
      Math.round((input[0] - x0) * kx),
      Math.round((input[1] - y0) * ky)
    ];
  }

  function quantizeLine(input) {
    var i = 0,
        j = 1,
        n = input.length,
        output = new Array(n), // pessimistic
        pi = output[0] = quantizePoint(input[0]),
        px = pi[0],
        py = pi[1],
        x,
        y;

    while (++i < n) {
      pi = quantizePoint(input[i]);
      x = pi[0];
      y = pi[1];
      if (x !== px || y !== py) { // skip coincident points
        output[j++] = pi;
        px = x;
        py = y;
      }
    }

    if (j < 2) output[1] = output[0].slice(), j = 2; // must have 2+
    output.length = j;
    return output;
  }

  function quantizeRing(input) {
    var output = quantizeLine(input);
    while (output.length < 4) output.push(output[0].slice()); // must have 4+
    return output;
  }

  function quantizePolygon(input) {
    return input.map(quantizeRing);
  }

  function quantizeGeometry(o) {
    if (o != null && quantizeGeometryType.hasOwnProperty(o.type)) quantizeGeometryType[o.type](o);
  }

  var quantizeGeometryType = {
    GeometryCollection: function(o) { o.geometries.forEach(quantizeGeometry); },
    Point: function(o) { o.coordinates = quantizePoint(o.coordinates); },
    MultiPoint: function(o) { o.coordinates = o.coordinates.map(quantizePoint); },
    LineString: function(o) { o.coordinates = quantizeLine(o.coordinates); },
    MultiLineString: function(o) { o.coordinates = o.coordinates.map(quantizeLine); },
    Polygon: function(o) { o.coordinates = quantizePolygon(o.coordinates); },
    MultiPolygon: function(o) { o.coordinates = o.coordinates.map(quantizePolygon); }
  };

  for (var key in objects) {
    quantizeGeometry(objects[key]);
  }

  return {
    scale: [1 / kx, 1 / ky],
    translate: [x0, y0]
  };
}
