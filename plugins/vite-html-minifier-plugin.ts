import { Plugin } from 'vite';

const fileRegex = /\?html$/;

export interface HTMLMinifierPluginOptions {
  minify: boolean;
}

export const htmlMinifierPlugin: (
  options: HTMLMinifierPluginOptions
) => Plugin = ( { minify } ) => {
  return {
    name: 'html-minifier',
    enforce: 'pre',
    async transform( src: string, id: string ) {
      if ( fileRegex.test( id ) ) {
        if ( !minify ) {
          return `export default \`${ src }\`;`;
        }

        const result = src.replaceAll( '\n', '' );

        return {
          code: `export default \`${ result }\`;`,
        };
      }
    }
  };
};
