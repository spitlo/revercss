#!/usr/bin/env node

var cli = require( 'cli' )

cli.parse( {
  compact:   [ 'c', 'Output compact CSS.' ],
  minified:  [ 'm', 'Output minified CSS.' ],
  tabs:      [ 't', 'Use tabs instead of two spaces in output' ],
  output:    [ 'o', 'Write to FILE rather than the console.', 'file' ]
} )

var options = cli.options

var inside = false
var declarations = {}
var declaration = ''
var selectors = {}
var _selectors = []
var selector = ''
var outputCss = ''

var lineSep = '\n\n'
var selectorSep = '\n'
var declarationSep = ';\n'
var declarationPrefix = options.tabs ? '\t' : '  '
var space = ' '

if ( options.compact ) {
  lineSep = '\n'
  declarationSep = '; '
  selectorSep = declarationPrefix = ''
}
if ( options.minified ) {
  declarationSep = ';'
  lineSep = selectorSep = declarationPrefix = space = ''
}

var removeTrailingChar = function ( str, char ) {
  char = char || ','
  var rx = new RegExp( char + '+$' )
  return str.trim().replace( rx, '' )
}

var handleInput = function ( line, sep, eof ) {
  if ( !eof ) {
    /*
    * Input phase
    */

    if ( line.indexOf( '{' ) > -1 ) {
      // Start of selector block
      inside = true
      declaration = line.split( '{' )[ 0 ].trim()
      _selectors = []
    } else if ( line.indexOf( '}' ) > -1 ) {
      // End of selector block
      inside = false
      declaration = ''
      if ( line.split( '}' ).length > 1 ) {
        selector = line.split( '}' )[ 0 ].trim()
        selector && _selectors.push( removeTrailingChar( selector ) )
      }
    } else if ( inside ) {
      // Inside selector block
      _selectors.push( removeTrailingChar( line ) )
    }

    if ( _selectors.length > 0 && declaration ) {
      _selectors = _selectors.join( ',' ).trim().split( ',' )
      _selectors.forEach( function ( tag ) {
        if ( selectors[ tag ] ) {
          if ( selectors[ tag ].indexOf( declaration ) < 0 ) {
            selectors[ tag ].push( declaration )
          }
        } else {
          selectors[ tag ] = [ declaration ]
        }
      } )
    }

  } else {
    /*
    * Output phase
    */

    for ( selector in selectors ) {
      var declarations = selectors[ selector ]
      outputCss += [ selector, '{', selectorSep ].join( space )
      declarations.forEach( function( declaration ) {
        outputCss += [ declarationPrefix, declaration, declarationSep ].join( '' )
      } )
      outputCss += '}' + lineSep
    }
    
    try {
      if ( options.output ) {
        outputStream = this.native.fs.createWriteStream( options.output )
      } else {
        outputStream = process.stdout
      }
      outputStream.write( outputCss )
    } catch ( e ) {
      this.fatal( 'Could not write to output stream.' )
    }

  }
}

if ( cli.args.length ) {
  cli.withInput( cli.args.shift(), handleInput )
} else {
  cli.withInput( handleInput )
}

