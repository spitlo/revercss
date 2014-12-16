#!/usr/bin/env node

var revercss = require( '../')
var fs = require( 'fs' )
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
    output.write( outputCss )
  } catch ( e ) {
    console.log( 'Could not write to output stream.' )
  }
}

if ( argv.help ) {
  var helpText = [
    'USAGE: revercss [options] <file>',
    '  Options:',
    '    -c, --compact        \tOutput compact CSS',
    '    -m, --minified       \tOutput minified CSS',
    '    -t, --tabs           \tUse tabs instead of two spaces in output',
    '    -s, --spaces         \tNumber of spaces/tabs to indent (default: 2)',
    '    -o, --outfile <file> \tWrite to FILE rather than the console',
    '    -h, --help           \tDisplay help and usage details'
  ]
  helpText.forEach( function( line ) {
    console.log( line )
  } )
  process.exit( 1 )
}

revercss( input, options, done )