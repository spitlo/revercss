Revercss
========

Declaration-first paradigm for lean, consistent CSS and increased project maintainibility.

## Installation
````
npm install -g spitlo/revercss
```

## Syntax
In Revercss, style declarations are first-class citizens. Selectors belong to one or many declarations:
```CSS
color: red {
  a, h1
}

color: rgba(100, 0, 0, .5) {
  #logo,
  ul.menu>li a
}

border: 2px solid {
  button,
  #logo,
  ul.menu>li a
}

text-decoration: none {
  ul.menu>li a
}

min-width: 200px {
  button,
  input[type="text"]
}

padding: 8px {
  button,
  input,
  ul.menu>li a
}

box-sizing: border-box {
  html
}

box-sizing: inherit {
  *, *:before, *:after
}

```

## Usage
#### Console output:
```BASH
$ revercss example.revcss
```
#### File output
```BASH
$ revercss example.revcss -o parsed.css
```
#### From stdin
```BASH
$ cat example.revcss | revercss
```

## Options
```
  -c, --compact          Output compact CSS
  -m, --minified         Output minified CSS
  -t, --tabs             Use tabs instead of two spaces in output
  -o, --output FILE      Write to FILE rather than the console
  -h, --help             Display help and usage details
```
