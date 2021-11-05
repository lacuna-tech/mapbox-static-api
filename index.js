const fs = require('fs')
const https = require('https')

const reduce = require('./reduce')
const static = require('./static')

const main = () => {
  // expected results from a query such as 
  /*
  // https://city.develop.api.lacuna-tech.io/graphql, 
  // currently targeting : 8a2cc228-ec05-404a-8ae6-61bfac9b57eb, "one policy to rule them all"
	query {
    policies(policy_ids:["8a2cc228-ec05-404a-8ae6-61bfac9b57eb"]) {
      data {
        name
        policy_id
        rules {
          geographies {
            geography_id
            geography_json
          }
        }
      }
    }
  }
  */
  const response = JSON.parse(fs.readFileSync('./input/response.json', {encoding: 'utf-8'}))

  console.time('time')
  const decimalPrecision = 7
  const tidyOptions = {
    minimumDistance: 75, // Minimum distance between points in meters
    // maximumPoints: 35    // Maximum points in a feature  
  }
  const results = reduce(response, decimalPrecision, tidyOptions)
  // fs.writeFileSync('./output/results.json', JSON.stringify(results,null,2))
  const images = static(results, response)

  console.timeEnd('time')

  //write results to json so you can find urls individually and stuff
  fs.writeFileSync('./output/results.json', JSON.stringify(results,null,2))

  // write images to ./output
  for (const image of images) {
    const imageName = `./output/${image.type}-${image.id}.jpg`
    console.log('writing image ', imageName, 'url length is', image.data.urlLength)
    const file = fs.createWriteStream(imageName)
    https.get(image.data.url, function(response) {
      response.pipe(file);
    });

  }
}
main()