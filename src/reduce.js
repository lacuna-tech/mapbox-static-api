const gp = require('geojson-precision')
const geojsonTidy = require('@mapbox/geojson-tidy')
const geojsonTools = require('geojson-tools')
const simplifyGeojson = require('simplify-geojson')

// take some feature, turn it into a coordinate array... 
// return an array of arrays of coordinates, Array<Array<Coordinate>>
const toArray = (feature) => {
  switch (feature.type) {
    case "FeatureCollection": 
      return [...feature.features.map(toArray)].flat()
    case "Feature":
      const { geometry } = feature
      switch (geometry?.type) {
        case "Point":
          return [[geojsonTools.toArray(geometry)]]
        case "Polygon":
        case "LineString": 
          return [geojsonTools.toArray(geometry)]
        case 'MultiPolygon':
          return geojsonTools.toArray(geometry)
        default: // seing some geometry.type = "Multiline" geometry types in here, might need to double check
          console.error(`Unexpected geometry type ${geometry?.type}`, geometry)
          return geojsonTools.toArray(geometry)
      }
  }
  throw new Error(`Unexpected feature.type "${feature.type}"`, feature)
}

module.exports = (geographies, options) => {
  const { decimalPrecision, ramerDouglasPeukerThreshold, ...tidyOptions } = options

  const results = [...geographies
    .reduce((acc, cur) => {
      acc.set(cur.geography_id, cur)
      return acc
    }, new Map())
    .values()
  ] // removed duplicate geographies
  .map(({geography_json, ...rest}) => ({
    data: toArray(geography_json), // [[lat,lng]] | [[[lat, lng]]]
    ...rest
  })) // turned wild geography_json GeoJSON into arrays of coordinates
  .reduce((acc, {data, ...rest}) => {
    acc.push(...data.map(coordinates => ({data: coordinates, ...rest})))
    return acc
  }, [])
  .map(({data, ...rest}) => ({
    data: geojsonTools.toGeoJSON(data, 'linestring'), // only data[0]?  I need to double check this....
    ...rest
  })) // turned coordinate arrays into "linestring" features because "@mapbox/geojson-tidy" package needs LineStrings, and LineStrings are probably better for url params
  .map(({data, ...rest}) => ({
    data: gp({...data}, decimalPrecision),
    ...rest
  })) // decimal precision, removes decimal precision from coordinates lat lngs, using "geojson-precision"
  .map(({data, ...rest}) => {
    const coordinates = data.coordinates
    
    const first = coordinates[0]
    const last = coordinates[coordinates.length - 1]

    if (first[0] != last[0] && first[1] != last[1]) { // polygons must wrap
      coordinates.push(first)
    }

    return { 
      data: {
        ...data,
        coordinates: coordinates
      },
      ...rest  
    }
  }) // making sure all lines start and end at the same point, - should prob be moved until after tidy?
  .map(({data, ...rest}) => ({
    data: {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {
          coordTimes: []
        },
        geometry: data
      }]
    },
    ...rest
  })) // formatting for "tidy"
  .map(({data, ...rest}) => {
    const reduced = simplifyGeojson(data, ramerDouglasPeukerThreshold)
    console.log('compare data to reduced', {dataLength: data.features[0].geometry.coordinates.length, reducedLength: reduced.features[0].geometry.coordinates.length})
    return ({
      data: reduced,
      ...rest
    })
  })
  .map(({data, ...rest}) => ({
    data: geojsonTidy.tidy(data, tidyOptions),
    ...rest
  })) // tidied linestring features!

  return results
}