/**
* © 2015 CodeForOKC. All rights reserved.
* Author: Karl Kirch <karlkrch@gmail.com>
*/

var async = require('async');
var reproject = require('./reproject');
var topojson = require('topojson');
var WKT = require('terraformer-wkt-parser');

var preReplacePatterns = {};
// special cases
var postReplacePatterns = {};

module.exports = exports = {
  parseData: parseData
};

function parseData(stringData) {
  var rows = stringData.split(/\n/);
  var rowAggregator = createRowAggregator(rows);
  var fireStationObjArray = rows.slice(1, rows.length - 1).reduce(rowAggregator, []);
  return featureCollection = {
    type: "FeatureCollection",
    features: fireStationObjArray.map(fireStationToGeoJson)
  };
}

function createRowAggregator(rows) {
  var columnHeaders = rows[0].split(";");

  // clean up the header names a bit
  columnHeaders = columnHeaders.map(function(header) {
    return header.trim().toLowerCase();
  });

  return function aggregateRows(acc, item){
    var columnValues = item.split(/;/),
    rowObj = columnValues.reduce(function(obj, columnValue, index) {
      var columnHeader = columnHeaders[index];
      var val = columnValue.trim();
      obj[columnHeader] = val;
      return obj;
    }, {});

    acc.push(rowObj);

    return acc;
  };
};


function fireStationToGeoJson(fireStation) {
  var point = "POINT (" + fireStation.point_x + " " + fireStation.point_y + ")";
  return geoJson = {
    id: fireStation.objectid,
    type: "Feature",
    geometry: reproject.reprojectGeometry(WKT.parse(point)),
    properties: {
      station_num: fireStation.station_no,
      address: fireStation.station_addr
    }
  };
}
