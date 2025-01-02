import argv from 'minimist'

export const options = argv(process.argv.slice(2))
export const isProduction = options.env === ' production'
