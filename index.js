var byline = require( 'byline' )  // https://github.com/jahewson/node-byline
var StringDecoder = require( 'string_decoder' ).StringDecoder
var decoder = new StringDecoder( 'utf8' )

var selectors = {}
var declaration = ''
var outputCss

var separators = {
  lineSep: '\n\n',
  selectorSep: '\n',
  declarationSep: ';\n',
  indentationChar: ' ',
  indentationLength: 2,
  space: ' '
}

var removeTrailingChar = function ( str, char ) {
  char = char || ','
  var rx = new RegExp( char + '+$' )
  return str.trim().replace( rx, '' )
}

var readLine = function ( line ) {
  var selector = ''

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
    if (separators.minAll) declaration = declaration.replace(/([\:\,])\s/g, function ( str, grp1 ) { return grp1 } )
    _selectors = _selectors.join( ',' ).trim().split( ',' )
    _selectors.forEach( function ( tag ) {
      tag = tag.trim()
      if ( selectors[ tag ] ) {
        if ( selectors[ tag ].indexOf( declaration ) < 0 ) {
          selectors[ tag ].push( declaration )
        }
      } else {
        selectors[ tag ] = [ declaration ]
      }
    } )
  }
}

var createOutput = function () {
  var outputCss = ''
  for ( selector in selectors ) {
    var declarations = selectors[ selector ]
    outputCss += [ selector, '{', separators.selectorSep ].join( separators.space )
    declarations.forEach( function( declaration ) {
      outputCss += [ separators.indentation, declaration, separators.declarationSep ].join( '' )
    } )
    outputCss += '}' + separators.lineSep
  }
  return outputCss
}

var revercss = function ( stream, options, cb ) {
  if ( typeof options == 'function' ) {
    cb = options
    options = false
  }

  options = options || {}
  if ( options.tabs ) { 
    separators.indentationChar = '\t'
  }
  if ( options.spaces ) {
    separators.indentationLength = ~~options.spaces
  }
  separators.indentation = new Array( separators.indentationLength + 1).join( separators.indentationChar )
  if ( options.compact ) {
    separators.lineSep = '\n'
    separators.declarationSep = '; '
    separators.selectorSep = separators.indentation = declarationPrefix = ''
  }
  if ( options.minified ) {
    separators.declarationSep = ';'
    separators.lineSep = separators.selectorSep = separators.indentation = separators.space = ''
    separators.minAll = true
  }

  stream = byline.createStream( stream )

  stream.on( 'data', function ( line ) {
    readLine( decoder.write( line ) )
  } )
  stream.on( 'end', function() {
    outputCss = createOutput()
    cb( outputCss )
  } )
  stream.on( 'error', function () {
    cb( new Error( 'Stream error' ) )
  } )
}

module.exports = revercss