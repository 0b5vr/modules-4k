import { GL_FRAMEBUFFER, GL_TEXTURE0, GL_TEXTURE_2D, GL_TRIANGLE_STRIP } from './gl-constants';
import { HEIGHT, WIDTH } from './constants';
import { audio } from './audio';
import { fbmTexture } from './fbmTexture';
import { gl } from './gl';
import { musicBeginTime } from './music';
import { programRaymarch } from './programRaymarch';

let programRaymarchHot = programRaymarch;

export function render(): void {
  const time = audio.currentTime - musicBeginTime;

  // -- program ------------------------------------------------------------------------------------
  gl.useProgram( programRaymarchHot );

  // -- uniforms -----------------------------------------------------------------------------------
  gl.activeTexture( GL_TEXTURE0 );
  gl.bindTexture( GL_TEXTURE_2D, fbmTexture );

  gl.uniform1f(
    gl.getUniformLocation( programRaymarchHot, 'time' ),
    time,
  );
  gl.uniform1i(
    gl.getUniformLocation( programRaymarchHot, 'f' ),
    0
  );

  // -- render -------------------------------------------------------------------------------------
  gl.bindFramebuffer( GL_FRAMEBUFFER, null );
  gl.viewport( 0, 0, WIDTH, HEIGHT );
  gl.drawArrays( GL_TRIANGLE_STRIP, 0, 4 );
}

// -- hot ------------------------------------------------------------------------------------------
if ( import.meta.hot ) {
  import.meta.hot.accept( './programRaymarch', ( { programRaymarch } ) => {
    programRaymarchHot = programRaymarch;
  } );
}
