const gp = require('geojson-precision')
const geojsonTidy = require('@mapbox/geojson-tidy')
const geojsonTools = require('geojson-tools')

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
        default:
          console.error('what is this type', geometry)
          return geojsonTools.toArray(geometry)
      }
  }
  throw new Error("not sure what type of thing this is", feature)
}

module.exports = (response, decimalPrecision, tidyOptions) => {
  const nestedGeos = response.data.policies.data.map(policy => 
    policy.rules.map(rule => rule.geographies.map(geography => ({
            data: geography.geography_json,
            id: geography.geography_id
          }
        )
      )
    )
  )

const geographies = nestedGeos.flat(2)

const results = [...geographies
    .reduce((acc, cur) => {
      acc.set(cur.id, cur)
      return acc
    }, new Map())
    .values()
  ]
  .map(({data, ...rest}) => ({
    data: toArray(data),
    ...rest
  }))
  .map(({data, ...rest}) => ({
    data: geojsonTools.toGeoJSON(data[0], 'linestring'), // only data[0]?
    ...rest
  }))
  .map(({data, ...rest}) => ({
    data: gp({...data}, decimalPrecision),
    ...rest
  }))
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
  })
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
  }))
  .map(({data, ...rest}) => ({
    data: geojsonTidy.tidy(data, tidyOptions),
    ...rest
  }))

  return results
}