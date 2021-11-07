const reduce = require('./reduce')
const static = require('./static')

module.exports = (geographies, {mapboxToken, ...options}) => {
  const reduced = reduce(geographies, options)
  return static(reduced, mapboxToken)
  // TODO call reduce / static and return urls for geographies
}