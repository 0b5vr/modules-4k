#!/usr/bin/env node

// it just inputs a file from glob pattern
// and outputs its first line (discards following lines)

// =================================================================================================

// -- sanity check ---------------------------------------------------------------------------------
if ( process.argv[ 3 ] == null ) {
  console.error( '\x1b[31mUsage: \x1b[35mnode postprocess.js input.js output.js\x1b[0m' );
  process.exit( 1 );
}

// -- modules --------------------------------------------------------------------------------------
const fs = require( 'fs' );
const { resolve } = require( 'path' );
const glob = require( 'glob-promise' );

// -- main -----------------------------------------------------------------------------------------
console.info( 'Postprocessing the file...' );

( async () => {
  const inputMatches = await glob( process.argv[ 2 ] );
  const inputPath = inputMatches[ 0 ];

  const outputPath = resolve( process.cwd(), process.argv[ 3 ] );

  const inputFile = await fs.promises.readFile( inputPath, { encoding: 'utf8' } );
  const processed = inputFile.split( '\n' )[ 0 ];

  await fs.promises.writeFile( outputPath, processed );

  console.info( 'Done \x1b[32m✓\x1b[0m' );
} )();
