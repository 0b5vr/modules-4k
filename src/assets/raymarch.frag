#version 300 es

//[
precision highp float;
//]

in vec2 v;

uniform float t;
uniform sampler2D f;

out vec4 outColor;

const float PI = acos( -1.0 );
const float BPS = 128.0 / 60.0;

mat2 r2d( float t ) {
  return mat2( cos( t ), sin( t ), -sin( t ), cos( t ) );
}

float sdbox( vec3 p, vec3 s ) {
  vec3 d = abs( p ) - s;
  return length( max( d, 0.0 ) ) + min( 0.0, max( max( d.x, d.y ), d.z ) );
}

vec4 map( vec3 p ) {
  float ease = PI / 2.0 * ( 0.5 - 0.5 * cos( PI * exp( -8.0 * mod( t, 1.0 / BPS ) ) ) );
  p.yz *= r2d( ease );
  float d = sdbox( p, vec3( 1.0 ) );
  return vec4( d, 0, 0, 0 );
}

vec3 nMap( vec3 p ) {
  const vec2 d = vec2( 0.0, 0.001 );
  return normalize( vec3(
    map( p + d.yxx ).x - map( p - d.yxx ).x,
    map( p + d.xyx ).x - map( p - d.xyx ).x,
    map( p + d.xxy ).x - map( p - d.xxy ).x
  ) );
}

void main() {
  vec2 p = v;
  p.x *= 16.0 / 9.0;

  vec3 ro = vec3( 0.0, 0.0, 5.0 );
  vec3 rd = normalize( vec3( p, -2.0 ) );
  vec4 isect;

  for ( int i = 0; i < 64; i ++ ) {
    isect = map( ro );
    ro += rd * isect.x;
  }

  if ( isect.x < 0.01 ) {
    vec3 N = nMap( ro );
    outColor = vec4( 0.5 + 0.5 * N, 1.0 );
  } else {
    outColor = vec4( texture( f, v + 0.1 * t ) );
  }
}
