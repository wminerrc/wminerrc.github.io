module.exports = {
    resolve: {
        alias: {
            'node_modules': __dirname + '/node_modules',
            'data': __dirname + '/data'
        }
    },
    entry: ['./src/script.js'],
    output: {
        path: __dirname + "/dist",
        filename: 'bundle.js'
   }
};