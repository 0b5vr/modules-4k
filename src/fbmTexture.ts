import { GL_COLOR_ATTACHMENT0, GL_FRAMEBUFFER, GL_R32F, GL_TEXTURE_2D, GL_TRIANGLE_STRIP } from './gl-constants';
import { gl } from './gl';
import { programFbm } from './programs';

// -- texture --------------------------------------------------------------------------------------
const SIZE = 1024;

export const fbmTexture = gl.createTexture()!;

gl.bindTexture( GL_TEXTURE_2D, fbmTexture );
gl.texStorage2D( GL_TEXTURE_2D, 1, GL_R32F, SIZE, SIZE );

// -- framebuffer ----------------------------------------------------------------------------------
const framebuffer = gl.createFramebuffer()!;

gl.bindFramebuffer( GL_FRAMEBUFFER, framebuffer );
gl.framebufferTexture2D(
  GL_FRAMEBUFFER,
  GL_COLOR_ATTACHMENT0,
  GL_TEXTURE_2D,
  fbmTexture,
  0,
);

// -- program --------------------------------------------------------------------------------------
gl.useProgram( programFbm );

// -- render ---------------------------------------------------------------------------------------
gl.viewport( 0, 0, SIZE, SIZE );
gl.drawArrays( GL_TRIANGLE_STRIP, 0, 4 );

gl.bindFramebuffer( GL_FRAMEBUFFER, null );
