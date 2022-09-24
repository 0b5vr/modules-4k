import { Plugin } from 'vite';
import { promisify } from 'util';
import cp from 'child_process';
import fs from 'fs';
import path from 'path';

const exec = promisify( cp.exec );

const fileRegex = /\?shader$/;

export interface ShaderMinifierOptions {
  hlsl?: boolean;
  fieldNames?: string;
  preserveExternals?: boolean;
  preserveAllGlobals?: boolean;
  noRenaming?: boolean;
  noRenamingList?: string[];
  noSequence?: boolean;
  smoothstep?: boolean;
}

function buildMinifierOptionsString( options: ShaderMinifierOptions ): string {
  let str = '';

  if ( options.hlsl ) {
    str += '--hlsl ';
  }

  str += '--format text ';

  if ( options.fieldNames ) {
    str += `--field-names ${ options.fieldNames } `;
  }

  if ( options.preserveExternals ) {
    str += '--preserve-externals ';
  }

  if ( options.preserveAllGlobals ) {
    str += '--preserve-all-globals ';
  }

  if ( options.noRenaming ) {
    str += '--no-renaming ';
  }

  if ( options.noRenamingList ) {
    str += `--no-renaming-list ${ options.noRenamingList.join( ',' ) } `;
  }

  if ( options.noSequence ) {
    str += '--no-sequence ';
  }

  if ( options.smoothstep ) {
    str += '--smoothstep ';
  }

  return str;
}

export interface ShaderMinifierPluginOptions {
  minify: boolean;
  minifierOptions: ShaderMinifierOptions;
}

export const shaderMinifierPlugin: (
  options: ShaderMinifierPluginOptions
) => Plugin = ( { minify, minifierOptions } ) => {
  return {
    name: 'shader-minifier',
    enforce: 'pre',
    async transform( src: string, id: string ) {
      if ( fileRegex.test( id ) ) {
        if ( !minify ) {
          return `export default \`${ src }\`;`;
        }

        if ( /^#pragma shader_minifier_plugin bypass$/m.test( src ) ) {
          console.warn( `#pragma shader_minifier_plugin detected in ${ id }. Bypassing shader minifier` );

          return `export default \`${ src }\`;`;
        }

        const name = path.basename( id ).split( '?' )[ 0 ];

        const minifierOptionsString = buildMinifierOptionsString( minifierOptions );

        const tempy = await import( 'tempy' );

        const minified = await tempy.temporaryFileTask( async ( pathOriginal ) => {
          await fs.promises.writeFile( pathOriginal, src, { encoding: 'utf8' } );

          return await tempy.temporaryFileTask( async ( pathMinified ) => {
            const command = `shader_minifier.exe ${ pathOriginal } ${ minifierOptionsString }-o ${ pathMinified }`;

            await exec( command ).catch( ( error ) => {
              throw new Error( error.stdout );
            } );

            return await fs.promises.readFile( pathMinified, { encoding: 'utf8' } );
          }, { name } );
        }, { name } );

        return {
          code: `export default \`${ minified }\`;`,
        };
      }
    }
  };
};
