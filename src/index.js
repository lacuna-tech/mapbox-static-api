
const getStaticUrl = require('./getStaticUrl')
module.exports = getStaticUrl

// const fs = require('fs')
// const https = require('https')
// const getStaticUrl = require('./getStaticUrl')

// const main = () => {
//   const response = JSON.parse(fs.readFileSync('./input/response.json', {encoding: 'utf-8'}))
//   const policies = response.data.policies.data.map(({rules, policy_id}) => ({
//     policy_id, 
//     geographies: [...rules.map(rule => rule.geographies).flat().reduce((acc, geo) => {
//       acc.set(geo.geography_id, geo)
//       return acc
//     }, new Map()).values()]
//   }))

//   const urls = policies.map(policy => getStaticUrl(policy.geographies, {
//     mapboxToken: 'pk.eyJ1IjoibGFjdW5hLW1hcGJveCIsImEiOiJjanBva3A0cjEwZXdkNDJydW91Ym82aGpyIn0.Qh-ak-vPBz7EL3ngRdNRZQ',
//     decimalPrecision: 5,
//     minimumDistance: 75
//   }))
//   console.log('urls', urls)

  
// }
// main()

// // const reduce = require('./reduce')
// // const static = require('./static')

// // const main = () => {
// //   // expected results from a query such as 
// //   /*
// //   // https://city.develop.api.lacuna-tech.io/graphql, 
// //   // currently targeting : 8a2cc228-ec05-404a-8ae6-61bfac9b57eb, "one policy to rule them all"
// // 	query {
// //     policies(policy_ids:["8a2cc228-ec05-404a-8ae6-61bfac9b57eb"]) {
// //       data {
// //         name
// //         policy_id
// //         rules {
// //           geographies {
// //             color
// //             geography_id
// //             geography_json
// //           }
// //         }
// //       }
// //     }
// //   }
// //   */
// //   const response = JSON.parse(fs.readFileSync('./input/response.json', {encoding: 'utf-8'}))

// //   console.time('time')
// //   const decimalPrecision = 7
// //   const tidyOptions = {
// //     minimumDistance: 75, // Minimum distance between points in meters
// //     // maximumPoints: 35    // Maximum points in a feature  
// //   }

// //   const policies = response.data.policies.data.map(({rules, policy_id}) => ({
// //     policy_id, 
// //     geographies: [...rules.map(rule => rule.geographies).flat().reduce((acc, geo) => {
// //       acc.set(geo.geography_id, geo)
// //       return acc
// //     }, new Map()).values()]
// //   }))


// //   const results = reduce(geographies, {decimalPrecision, tidyOptions})
// //   // fs.writeFileSync('./output/results.json', JSON.stringify(results,null,2))
// //   const images = static(results, response)

// //   console.timeEnd('time')

// //   //write results to json so you can find urls individually and stuff
// //   fs.writeFileSync('./output/results.json', JSON.stringify(results,null,2))

// //   // write images to ./output
// //   for (const image of images) {
// //     const imageName = `./output/${image.type}-${image.id}.jpg`
// //     console.log('writing image ', imageName, 'url length is', image.data.urlLength)
// //     const file = fs.createWriteStream(imageName)
// //     https.get(image.data.url, function(response) {
// //       response.pipe(file);
// //     })
// //   }
// // }
// // main()