const gp = require('geojson-precision')
const geojsonTidy = require('@mapbox/geojson-tidy')
const geojsonTools = require('geojson-tools')

// take some feature, turn it into a coordinate array... 
const toArray = (feature) => {
  switch (feature.type) {
    case "FeatureCollection": 
      return feature.features.map(toArray)
    case "Feature":
      const { geometry } = feature
      switch (geometry?.type) {
        case "Polygon":
        case "LineString":
        case "Point":
          return geojsonTools.toArray(geometry)
        default: // seing some geometry.type = "Multiline" geometry types in here, might need to double check
          console.error(`Unexpected geometry type ${geometry?.type}`, geometry)
          return geojsonTools.toArray(geometry)
      }
  }
  throw new Error("not sure what type of thing this is", feature)
}

module.exports = (geographies, options) => {
  const { decimalPrecision, ...tidyOptions } = options
// const nestedGeos = response.data.policies.data.map(policy => 
//   policy.rules.map(rule => rule.geographies.map(({geography_json, geography_id, ...rest}) => ({
//         data: geography_json,
//         id: geography_id,
//         ...rest
//       })
//     )
//   )
// )
// const geographies = nestedGeos.flat(2) // all geographies nested in the policies

const results = [...geographies
    .reduce((acc, cur) => {
      acc.set(cur.geography_id, cur)
      return acc
    }, new Map())
    .values()
  ] // removed duplicate geographies
  .map(({geography_json, ...rest}) => ({
    data: toArray(geography_json),
    ...rest
  })) // turned wild geography_json GeoJSON into arrays of coordinates
  .map(({data, ...rest}) => ({
    data: geojsonTools.toGeoJSON(data[0], 'linestring'), // only data[0]?  I need to double check this....
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
  .map(({data, ...rest}) => ({
    data: geojsonTidy.tidy(data, tidyOptions),
    ...rest
  })) // tidied linestring features!

  return results
}