#!/usr/bin/env node

var revercss = require( '../')
var argv = require('minimist')(process.argv.slice(2))
var fs = require( 'fs' )



// var lineSep = '\n\n'
// var selectorSep = '\n'
// var declarationSep = ';\n'
// var declarationPrefix = options.tabs ? '\t' : '  '
// var space = ' '

// if ( options.compact ) {
//   lineSep = '\n'
//   declarationSep = '; '
//   selectorSep = declarationPrefix = ''
// }
// if ( options.minified ) {
//   declarationSep = ';'
//   lineSep = selectorSep = declarationPrefix = space = ''
// }

var done = function ( outputCss ) {
  try {
    if ( argv.output ) {
      outputStream = fs.createWriteStream( argv.output )
    } else {
      outputStream = process.stdout
    }
    outputStream.write( outputCss )
  } catch ( e ) {
    console.log( 'Could not write to output stream.' )
  }
}

if ( argv._.length > 0 ) {
  revercss( fs.createReadStream( process.cwd() + '/' + argv._[0] ), done )
} else {
  revercss( process.stdin, done )
}