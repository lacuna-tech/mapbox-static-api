const mbxStatic = require('@mapbox/mapbox-sdk/services/static')
const open = require('open')
const fs = require ('fs')

const colors = JSON.parse(fs.readFileSync('./input/colors.json'))

const idToColor = (id) => {
  const uuidIntIsh = parseInt(id.split('-').join('').slice(6), 16)
  return colors[uuidIntIsh % colors.length]
}

module.exports = () => {
  const TOKEN = 'pk.eyJ1IjoibGFjdW5hLW1hcGJveCIsImEiOiJjanBva3A0cjEwZXdkNDJydW91Ym82aGpyIn0.Qh-ak-vPBz7EL3ngRdNRZQ'

  const staticClient = mbxStatic({ accessToken: TOKEN})

  const geoOverlays = JSON.parse(fs.readFileSync('./output/results.json', {encoding: 'utf-8'}))
    .map(({id, data, ...rest}) => {
      const color = idToColor(id)
      return {
        id,
        data: {
          overlays: data.features.map(feature => ({
            path: {
              coordinates: feature.geometry.coordinates,
              strokeWidth: 2,
              strokeColor: color,
              strokeOpacity: 0.8,
              fillColor: color,
              fillOpacity: 0.5
            }
          }))
        },
        ...rest,
      }
    })
    .reduce((acc, cur) => {
      acc.set(cur.id, cur)
      return acc
    }, new Map())

  const geoUrls = [...geoOverlays.values()].map(({data, ...rest}) => {
    return {
      data: staticClient.getStaticImage({
        ownerId: 'mapbox',
        styleId: 'light-v9',
        width: 393,
        height: 139,
        position: 'auto',
        overlays: data.overlays
      }).url(),
      ...rest
    }
  })
  // for (const geoUrl of geoUrls) {
  //   console.log(`opening geography "${geoUrl.id}", |${geoUrl.data.length}| = "${geoUrl.data}"`)
  //   open(geoUrl.data)
  // }

  const policies = JSON.parse(fs.readFileSync('./input/response.json', {encoding: 'utf-8'})).data.policies.data

  // TODO this geoegraphies are invalid somehow, rendering them messes up the static image url
  const badGeos = new Set(['b9aeec53-625d-4bfc-a9fd-debd07f24152', '70edd951-3988-4a9e-9306-ff90ece3345f'])

  const policyUrls = policies.map(({policy_id, rules}) => {
    const uniqueGeoIds = [...new Set(rules.map(({geographies}) => geographies.map(({geography_id}) => geography_id)).flat())]
      .filter(geoId => !badGeos.has(geoId))
    console.log('geos', uniqueGeoIds)
    const overlays = uniqueGeoIds.map(geoId => geoOverlays.get(geoId).data.overlays).reduce((acc, cur) => acc.concat(cur), [])
    return {
      data: staticClient.getStaticImage({
        ownerId: 'mapbox',
        styleId: 'light-v9',
        width: 393,
        height: 139,
        position: 'auto',
        overlays
      }).url(),
      id: policy_id
    }
  })
  // console.log(imageUrls.map(url => url.length))
  // imageUrls.forEach(image => open(image))

  return [
    geoUrls.map((geo) => ({...geo, type: "Geography"})), 
    policyUrls.map((policy) => ({...policy, type: "Policy"}))
  ].flat().map(({data, ...rest}) => ({
    data: {url: data, length: data.length},
    ...rest
  }))
}