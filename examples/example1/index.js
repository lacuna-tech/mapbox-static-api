import fs from 'fs'
import https from 'https'
import getStaticUrl from '@lacuna/mapbox-static-test'

const saveImage = (fileName, url) => {
  const file = fs.createWriteStream(`./output/${fileName}.jpg`)
  https.get(url, (response) => {
    response.pipe(file)
  })
}

const main = () => {
  const response = JSON.parse(fs.readFileSync('./input/response.json', {encoding: 'utf-8'}))
  const policies = response.data.policies.data.map(({rules, policy_id}) => ({
    policy_id, 
    geographies: [...rules.map(rule => rule.geographies).flat().reduce((acc, geo) => {
      acc.set(geo.geography_id, geo)
      return acc
    }, new Map()).values()]
  }))

  const urls = policies.map(policy => getStaticUrl(policy.geographies, {
    mapboxToken: 'pk.eyJ1IjoibGFjdW5hLW1hcGJveCIsImEiOiJjanBva3A0cjEwZXdkNDJydW91Ym82aGpyIn0.Qh-ak-vPBz7EL3ngRdNRZQ',
    decimalPrecision: 5,
    minimumDistance: 75
  }))
  console.log('urls', urls)
  urls.forEach(url => saveImage('whatever', url))
}
main()