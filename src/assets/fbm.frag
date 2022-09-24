#version 300 es

//[
precision highp float;
//]

in vec2 v;

out float outColor;

uint pcg2d( uvec2 x ) {
  x = x * 1145141u + 919810u;

  x.xy += x.yx * 1145141919u;

  x ^= x >> 16u;

  x.xy += x.yx * 1145141919u;

  return x.x;
}

vec2 getDir( uvec2 p ) {
  float t = 2.0 * acos( -1.0 ) * float( pcg2d( p ) ) / float( 0xffffffffu );
  return vec2( cos( t ), sin( t ) );
}

float perlin2d( vec2 p, float m ) {
  uint um = uint( m );
  p *= m;

  vec2 cell = floor( p );
  vec2 t = p - cell;
  uvec2 cellIndex = uvec2( cell );

  vec2 tSmooth = ( t * t * t * ( t * ( t * 6.0 - 15.0 ) + 10.0 ) );

  return mix(
    mix(
      dot( getDir( cellIndex % um ), t ),
      dot( getDir( ( cellIndex + uvec2( 1, 0 ) ) % um ), t - vec2( 1.0, 0.0 ) ),
      tSmooth.x
    ),
    mix(
      dot( getDir( ( cellIndex + uvec2( 0, 1 ) ) % um ), t - vec2( 0.0, 1.0 ) ),
      dot( getDir( ( cellIndex + uvec2( 1, 1 ) ) % um ), t - 1.0 ),
      tSmooth.x
    ),
    tSmooth.y
  ) / m * 4.0;
}

void main() {
  vec2 p = 0.5 + 0.5 * v;
  float m = 8.0;

  outColor += perlin2d( p, m );
  m *= 2.0;
  outColor += perlin2d( p, m );
  m *= 2.0;
  outColor += perlin2d( p, m );
  m *= 2.0;
  outColor += perlin2d( p, m );
  m *= 2.0;
}
