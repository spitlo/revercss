#!/usr/bin/env node

var cli = require( 'cli' )
var _ = require( 'lodash' )

cli.parse( {
  compact:   [ 'c', 'Output compact CSS.' ],
  minified:  [ 'm', 'Output minified CSS.' ],
  output:    [ false, 'Write to FILE rather than the console.', 'file' ]
} )

cli.main(function ( args, options ) {

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
  var declarationPrefix = '\t'
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

  var outputFile = function (file) {
    cli.withInput(file, function (line, sep, eof) {
      if ( !eof ) {
        /*
        * Input phase
        */
        if ( line.indexOf( '{' ) > -1 ) {
          // Start of selector block
          inside = true
          declaration = line.split( '{' )[0].trim()
          declarations[declaration] = []
          _selectors = []
        } else if ( line.indexOf( '}' ) > -1 ) {
          // End of selector block
          inside = false
          declaration = ''
          if ( line.split( '}' ).length > 1 ) {
            selector = line.split( '}' )[0].trim()
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

      } else if (cli.args.length) {
        cli.output('Revercss only supports one file at a time.') // For now ...
        //outputFile(cli.args.shift())
      } else {
        /*
        * Output phase
        */

        _.forEach( selectors, function( declarations, selector ) {
          outputCss += [ selector, '{', selectorSep ].join( space )
          declarations.forEach( function( declaration ) {
            outputCss += [ declarationPrefix, declaration, declarationSep ].join( '' )
          } )
          outputCss += '}' + lineSep
        } )
        
        try {
          if ( options.output ) {
            outputStream = this.native.fs.createWriteStream( options.output )
          } else {
            outputStream = process.stdout
          }
          outputStream.write( outputCss )
        } catch (e) {
          this.fatal('Could not write to output stream.')
        }

        if ( options.echo ) {
          console.log( outputCss )
        }

      }
    })
  }

  if (cli.args.length) {
    outputFile(cli.args.shift())
  }

})