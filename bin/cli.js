#!/usr/bin/env node

var revercss = require( '../')
var fs = require( 'fs' )
var path = require('path')
var minimist = require('minimist')

var argv = minimist( process.argv.slice( 2 ), {
  alias: { 
    i: 'infile',
    o: 'outfile',
    c: 'compact',
    m: 'minified',
    t: 'tabs',
    s: 'spaces',
    h: 'help',
  },
  default: {
    outfile: '-',
    spaces: 2
  }
} )

var options = {}
if ( argv.compact ) options.compact = true
if ( argv.minified ) options.minified = true
if ( argv.tabs ) options.tabs = true
if ( argv.spaces ) options.spaces = argv.spaces

var infile = argv.infile || argv._[0];

var input = infile === '-' || !infile
  ? process.stdin
  : fs.createReadStream(infile)

var output = argv.outfile === '-'
  ? process.stdout
  : fs.createWriteStream(argv.outfile)

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

revercss( input, options, done )