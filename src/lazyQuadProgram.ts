import { GL_ARRAY_BUFFER, GL_COMPILE_STATUS, GL_FLOAT, GL_FRAGMENT_SHADER, GL_LINK_STATUS, GL_VERTEX_SHADER } from './gl-constants';
import { bufferP } from './bufferP';
import { gl } from './gl';
import quadVert from './assets/quad.vert?shader';

export function lazyQuadProgram( frag: string ): WebGLProgram {
  // -- vert ---------------------------------------------------------------------------------------
  const vertexShader = gl.createShader( GL_VERTEX_SHADER )!;

  gl.shaderSource( vertexShader, quadVert );
  gl.compileShader( vertexShader );

  if ( import.meta.env.DEV ) {
    if ( !gl.getShaderParameter( vertexShader, GL_COMPILE_STATUS ) ) {
      console.error( quadVert );
      throw new Error( gl.getShaderInfoLog( vertexShader ) ?? undefined );
    }
  }

  // -- frag ---------------------------------------------------------------------------------------
  const fragmentShader = gl.createShader( GL_FRAGMENT_SHADER )!;

  gl.shaderSource( fragmentShader, frag );
  gl.compileShader( fragmentShader );

  if ( import.meta.env.DEV ) {
    if ( !gl.getShaderParameter( fragmentShader, GL_COMPILE_STATUS ) ) {
      console.error( frag );
      throw new Error( gl.getShaderInfoLog( fragmentShader ) ?? undefined );
    }
  }

  // -- program ------------------------------------------------------------------------------------
  const program = gl.createProgram()!;

  gl.attachShader( program, vertexShader );
  gl.attachShader( program, fragmentShader );

  gl.linkProgram( program );

  if ( import.meta.env.DEV ) {
    if ( !gl.getProgramParameter( program!, GL_LINK_STATUS ) ) {
      throw new Error( gl.getProgramInfoLog( program! ) ?? undefined );
    }
  }

  // -- assign attrib in prior ---------------------------------------------------------------------
  const attribLocation = gl.getAttribLocation( program, 'p' );

  gl.bindBuffer( GL_ARRAY_BUFFER, bufferP );
  gl.enableVertexAttribArray( attribLocation );
  gl.vertexAttribPointer( attribLocation, 2, GL_FLOAT, false, 0, 0 );

  // -- return -------------------------------------------------------------------------------------
  return program;
}
