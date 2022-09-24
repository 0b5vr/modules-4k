import { GL_ARRAY_BUFFER, GL_STATIC_DRAW } from './gl-constants';
import { TRIANGLE_STRIP_QUAD } from '@0b5vr/experimental';
import { gl } from './gl';

export const bufferP = gl.createBuffer()!;

gl.bindBuffer( GL_ARRAY_BUFFER, bufferP );
gl.bufferData( GL_ARRAY_BUFFER, new Float32Array( TRIANGLE_STRIP_QUAD ), GL_STATIC_DRAW );
