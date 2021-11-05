const open = require('open')
const fs = require('fs')

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

  for (const image of images) {
    console.log(JSON.stringify(image,null,4))
    open(image.data.url) // <-- popping image open in your browser, super annoying, write to /output the images?
  }
  console.timeEnd('time')

  fs.writeFileSync('./output/results.json', JSON.stringify(results,null,2))
}
main()