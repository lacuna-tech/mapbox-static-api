const mbxStatic = require('@mapbox/mapbox-sdk/services/static')

// output is an array of 
  /* 
    Array<{
      type: "Geography" | "Policy", 
      id: uuid,
      data: {
        url: <static mapbox url>, 
        urlLength: int
      }
    }>
  */
module.exports = (results, mapboxToken) => {
  const staticClient = mbxStatic({ accessToken: mapboxToken})

  const overlays = results
    .reduce((acc, {color, data}) => [
      ...acc, 
      data.features.map(feature => ({
        path: {
          coordinates: feature.geometry.coordinates,
          strokeWidth: 2,
          strokeColor: color,
          strokeOpacity: 0.8,
          fillColor: color,
          fillOpacity: 0.5
        }
      }))
    ], []).flat()
  
  return staticClient.getStaticImage({
    ownerId: 'mapbox',
    styleId: 'light-v9',
    width: 393,
    height: 139,
    position: 'auto',
    overlays
  }).url()
}