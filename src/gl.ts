import { canvas } from './ui';

export const gl = canvas.getContext( 'webgl2' )!;
gl.getExtension( 'EXT_color_buffer_float' );
gl.getExtension( 'OES_texture_float_linear' );
