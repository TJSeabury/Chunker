const fs = require( 'fs' );
const path = require( 'path' );
const jsdom = require( "jsdom" );
const { JSDOM } = jsdom;

const startTime = Date.now();

const fileBasename = 'eane.WordPress.2022-05-26';

const xml = fs.readFileSync( path.resolve( `./${fileBasename}.xml` ) );

let { document } = ( new JSDOM( xml, {
  contentType: "text/xml",
} ) ).window;

const items = Array.from( document.querySelectorAll( 'item' ) );

const count = items.length;
const chunkSize = 500;
const chunkCount = Math.ceil( count / chunkSize );

const chunks = Array( chunkCount ).fill( [] ).map( () => {
  return new Array();
} );
for ( let i = 0, c = 0; i < count; c = Math.floor( ( i + 1 ) / chunkSize ), i++ ) {
  chunks[c].push( items[i] );
}

const template = fs.readFileSync( path.resolve( './template.xml' ) );

const outDirname = 'chunks';

if ( !fs.existsSync( path.resolve( `./${outDirname}/` ) ) ) {
  fs.mkdirSync( path.resolve( `./${outDirname}/` ) );
}

let last = 1;
for ( const chunk of chunks ) {
  let temp = new JSDOM( template, {
    contentType: "text/xml",
  } );

  const channel = temp.window.document.querySelector( 'channel' );
  for ( const item of chunk ) {
    channel.appendChild( item );
  }

  fs.writeFileSync(
    path.resolve( `./${outDirname}/${fileBasename}_${last}-${last += chunk.length - 1}_.xml` ),
    temp.serialize()
  );

  ++last;

}


console.log( `Processing time: ${( Date.now() - startTime ) / 1000}s` );