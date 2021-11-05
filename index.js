const open = require('open')
const reduce = require('./reduce')
const static = require('./static')

const main = () => {

  console.time('time')

  const decimalPrecision = 7
  const tidyOptions = {
    minimumDistance: 75, // Minimum distance between points in metres
    maximumPoints: 35   // Maximum points in a feature  
  }
  const results = reduce(decimalPrecision, tidyOptions)
  const images = static(results)

  for (const image of images) {
    console.log(JSON.stringify(image,null,4))
    open(image.data.url)
  }
  console.timeEnd('time')
}
main()