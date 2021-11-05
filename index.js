const open = require('open')
const reduce = require('./reduce')
const static = require('./static')

const main = () => {
  const decimalPrecision = 7
  const tidyOptions = {
    minimumDistance: 50, // Minimum distance between points in metres
    maximumPoints: 35   // Maximum points in a feature  
  }
  reduce(decimalPrecision, tidyOptions)
  const images = static()

  for (const image of images) {
    console.log(JSON.stringify(image,null,4))
    open(image.data.url)
  }
}
main()