import { GL_COLOR_ATTACHMENT0, GL_FLOAT, GL_FRAMEBUFFER, GL_RG, GL_RG32F, GL_TEXTURE0, GL_TEXTURE_2D, GL_TRIANGLE_STRIP } from './gl-constants';
import { audio, sampleRate } from './audio';
import { fbmTexture } from './fbmTexture';
import { gl } from './gl';
import { programMusic } from './programMusic';

// -- texture --------------------------------------------------------------------------------------
const SIZE = 4096;

const texture = gl.createTexture()!;

gl.bindTexture( GL_TEXTURE_2D, texture );
gl.texStorage2D( GL_TEXTURE_2D, 1, GL_RG32F, SIZE, SIZE );

// -- framebuffer ----------------------------------------------------------------------------------
const framebuffer = gl.createFramebuffer()!;

gl.bindFramebuffer( GL_FRAMEBUFFER, framebuffer );
gl.framebufferTexture2D(
  GL_FRAMEBUFFER,
  GL_COLOR_ATTACHMENT0,
  GL_TEXTURE_2D,
  texture,
  0,
);

// -- program --------------------------------------------------------------------------------------
gl.useProgram( programMusic );

// -- uniforms -------------------------------------------------------------------------------------
gl.activeTexture( GL_TEXTURE0 );
gl.bindTexture( GL_TEXTURE_2D, fbmTexture );

gl.uniform1f(
  gl.getUniformLocation( programMusic, 'r' ),
  sampleRate,
);
gl.uniform1i(
  gl.getUniformLocation( programMusic, 'f' ),
  0
);

// -- render ---------------------------------------------------------------------------------------
gl.viewport( 0, 0, SIZE, SIZE );
gl.drawArrays( GL_TRIANGLE_STRIP, 0, 4 );

// -- read pixels ----------------------------------------------------------------------------------
const pixels = new Float32Array( 2 * SIZE * SIZE );
gl.readPixels( 0, 0, SIZE, SIZE, GL_RG, GL_FLOAT, pixels );

// -- audio ----------------------------------------------------------------------------------------
const buffer = audio.createBuffer( 2, SIZE * SIZE, sampleRate );
const channels = [
  buffer.getChannelData( 0 ),
  buffer.getChannelData( 1 ),
];
pixels.map( ( v, i ) => (
  channels[ i % 2 ][ ~~( i / 2 ) ] = v
) );

let bufferSource = audio.createBufferSource();
bufferSource.buffer = buffer;

// -- play -----------------------------------------------------------------------------------------
export let musicBeginTime: number;

export function playMusic(): void {
  audio.resume();

  musicBeginTime = audio.currentTime;

  bufferSource.connect( audio.destination );
  bufferSource.start();
}

// -- hot ------------------------------------------------------------------------------------------
if ( import.meta.hot ) {
  import.meta.hot.accept( './programMusic', ( { programMusic } ) => {
    // -- program ----------------------------------------------------------------------------------
    gl.useProgram( programMusic );

    // -- uniforms ---------------------------------------------------------------------------------
    gl.activeTexture( GL_TEXTURE0 );
    gl.bindTexture( GL_TEXTURE_2D, fbmTexture );

    gl.uniform1f(
      gl.getUniformLocation( programMusic, 'r' ),
      sampleRate,
    );
    gl.uniform1i(
      gl.getUniformLocation( programMusic, 'f' ),
      0
    );

    // -- render -----------------------------------------------------------------------------------
    gl.bindFramebuffer( GL_FRAMEBUFFER, framebuffer );
    gl.viewport( 0, 0, SIZE, SIZE );
    gl.drawArrays( GL_TRIANGLE_STRIP, 0, 4 );

    // -- read pixels ----------------------------------------------------------------------------------
    const pixels = new Float32Array( 2 * SIZE * SIZE );
    gl.readPixels( 0, 0, SIZE, SIZE, GL_RG, GL_FLOAT, pixels );

    // -- audio ----------------------------------------------------------------------------------------
    const buffer = audio.createBuffer( 2, SIZE * SIZE, sampleRate );
    const channels = [
      buffer.getChannelData( 0 ),
      buffer.getChannelData( 1 ),
    ];
    pixels.map( ( v, i ) => (
      channels[ i % 2 ][ ~~( i / 2 ) ] = v
    ) );

    bufferSource.stop();

    const offset = audio.currentTime - musicBeginTime;

    bufferSource = audio.createBufferSource();
    bufferSource.buffer = buffer;

    bufferSource.connect( audio.destination );
    bufferSource.start( 0.0, offset );
  } );
}
