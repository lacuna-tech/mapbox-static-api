import fs from 'fs'
import https from 'https'
import getStaticUrl from '@lacuna/mapbox-static-api'

const saveImage = (fileName, url) => {
  const file = fs.createWriteStream(`./output/${fileName}.jpg`)
  https.get(url, (response) => {
    response.pipe(file)
  })
}

const main = () => {

  try {
    fs.accessSync('./output')
  } catch (e) {
    fs.mkdirSync('./output')
  }


  const mapboxToken = 'pk.eyJ1IjoibGFjdW5hLW1hcGJveCIsImEiOiJjanBva3A0cjEwZXdkNDJydW91Ym82aGpyIn0.Qh-ak-vPBz7EL3ngRdNRZQ'
  const response = JSON.parse(fs.readFileSync('./input/response.json', {encoding: 'utf-8'}))
  const policies = response.data.policies.data.map(({rules, policy_id}) => ({
    policy_id, 
    geographies: [...rules.map(rule => rule.geographies).flat().reduce((acc, geo) => {
      acc.set(geo.geography_id, geo)
      return acc
    }, new Map()).values()]
  }))

  const allGeographies = [...policies.map(({geographies}) => geographies).flat().reduce((acc, geo) => {
    acc.set(geo.geography_id, geo)
    return acc
  }, new Map())
    .values()]

  const ALL_GEOGRAPHIES_PATH = './output/geographies.json'
  console.log('writing to', ALL_GEOGRAPHIES_PATH)
  fs.writeFileSync(ALL_GEOGRAPHIES_PATH, JSON.stringify(allGeographies, null, 2))

  const options = {
    decimalPrecision: 5,
    minimumDistance: 15,
    ramerDouglasPeukerThreshold: 0.001,
    mapboxToken
  }

  const data = [
    ...policies.map(({policy_id, geographies}) => {

      const TIME_TAG = `time policy ${policy_id}`
      console.time(TIME_TAG)
      const url = getStaticUrl(geographies, options)
      console.timeEnd(TIME_TAG)

      return {
        fileName: `Policy_${policy_id}`,
        url
      }
    }),
    ...allGeographies.map(geography => ({
      fileName: `Geography_${geography.geography_id}`, 
      url: getStaticUrl([geography], options)
    }))
  ]


  const staticUrlInfo = data.map(({fileName, url}) => ({
    fileName,
    url,
    urlLength: url.length
  }))


  const STATIC_URL_INFO_PATH = './output/static-url-info.json'
  console.log('writing static url info to', ALL_GEOGRAPHIES_PATH)
  console.log('avg url length', staticUrlInfo.reduce((acc, cur) => acc + cur.urlLength, 0) / staticUrlInfo.length)
  console.log('max url length', Math.max(...staticUrlInfo.map(({urlLength}) => urlLength)))
  fs.writeFileSync(STATIC_URL_INFO_PATH, JSON.stringify(staticUrlInfo, null, 2))
  
  console.log('saving images to ./output')
  data.forEach(({fileName, url}) => saveImage(fileName, url))

  console.log('Done!')
}
main()