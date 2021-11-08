import fs from 'fs'
import https from 'https'
import getStaticUrl from '@lacuna/mapbox-static-api'

const saveImage = (fileName, url) => {
  const file = fs.createWriteStream(`./output/${fileName}.png`)
  https.get(url, (response, error) => {
    // const extension = response.headers['content-type'] === 'image/png' ? 'png' : 'json'
    // if (extension === 'json') {
    //   fs.writeFileSync(`./output/${fileName}.json`, response.body, {encoding: 'utf-8'})
    //   return
    // }
    response.pipe(file)
  })
}

const responseFiles = {
  cityDev: 'response.json',
  laProd: 'responseProd.json'
}

const main = (responseFile) => {
  
  // loading data
  const response = JSON.parse(fs.readFileSync(`./input/${responseFile}`, {encoding: 'utf-8'}))
  let policiesArr
  if (responseFile === responseFiles.laProd) {
    // production doesn't yet have pagination in responses
    policiesArr = response.data.policies
  } else {
    // city dev does have pagination, requires another unwrapping of policies array form pagination response of policies
    policiesArr = response.data.policies.data
  }

  // creating output dir if not available
  try {
    fs.accessSync('./output')
  } catch (e) {
    fs.mkdirSync('./output')
  }

  // 
  const mapboxToken = 'pk.eyJ1IjoibGFjdW5hLW1hcGJveCIsImEiOiJjanBva3A0cjEwZXdkNDJydW91Ym82aGpyIn0.Qh-ak-vPBz7EL3ngRdNRZQ'
  const policies = policiesArr.map(({rules, policy_id}) => ({
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
    ramerDouglasPeukerThreshold: 0.00025,
    mapboxToken
  }

  // const data = [
  //   ...policies.map(({policy_id, geographies}) => {

  //     const TIME_TAG = `time policy ${policy_id}`
  //     console.time(TIME_TAG)
  //     const url = getStaticUrl(geographies, options)
  //     console.timeEnd(TIME_TAG)

  //     return {
  //       fileName: `Policy_${policy_id}`,
  //       url
  //     }
  //   }),
  //   ...allGeographies.map(geography => ({
  //     fileName: `Geography_${geography.geography_id}`, 
  //     url: getStaticUrl([geography], options)
  //   }))
  // ]

  // point has trouble: "6dc968c7-19f4-421c-b9d1-683dd3cdb632", it is a point and can't be represented as a LineString
  // geography has trouble "0c444869-1674-4234-b4f3-ab5685bcf0d9" squiggly lines all over the place
  const data = allGeographies
    // .filter(geo => geo.geography_id === '6dc968c7-19f4-421c-b9d1-683dd3cdb632')
    // .filter(({geography_id}) => geography_id === '0c444869-1674-4234-b4f3-ab5685bcf0d9')
    .map(geo => ({
      fileName: `Geography_${geo.geography_id}`, 
      url: getStaticUrl([geo], options)
    }))


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

main(responseFiles.laProd)