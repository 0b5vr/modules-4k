#version 300 es

//[
precision highp float;
//]

// #pragma shader_minifier_plugin bypass

uniform float r;
uniform sampler2D f;

out vec2 dest;

const float PI = acos( -1.0 );
const float TAU = 2.0 * PI;
const float LN2 = log( 2.0 );
const float BPS = 128.0 / 60.0;
const float B2T = 1.0 / BPS;

float p2f( float i ) {
  return exp2( ( i - 69.0 ) / 12.0 ) * 440.0;
}

vec2 orbit( float t ) {
  return vec2( cos( TAU * t ), sin( TAU * t ) );
}

vec2 shotgun( float t, float bias, float spread, float snap ) {
  vec2 sum = vec2( 0.0 );

  for ( int i = 0; i < 64; i ++ ) {
    float dice = fract( float( i ) * 0.618 );

    float partial = exp2( bias + spread * dice );
    partial = mix ( partial, floor( partial + 0.5 ), snap );

    vec2 pan = mix( vec2( 2, 0 ), vec2( 0, 2 ), fract( dice * 73.0 ) );
    sum += ( 0.5 - step( 0.5, fract( 440.0 * t * partial ) ) ) * pan;
  }

  return sum / 32.0;
}

void main() {
  dest = vec2( 0.0 ); // you might want to ditch this

  uint sampleIndex = uint( gl_FragCoord.x ) + 4096u * uint( gl_FragCoord.y );
  uvec4 moddedIndex = sampleIndex % uvec4( r * B2T * vec4( 1u, 4u, 16u, 64u ) );
  vec4 time = vec4( moddedIndex ) / r;

  float sidechain = smoothstep( 0.0, 0.5, time.x );

  // kick
  if ( time.w < 61.0 * B2T ) {
    float t = time.x;
    float env = smoothstep( 0.3, 0.1, t );

    dest += 0.5 * env * tanh( 1.5 * sin(
      360.0 * t
      - 45.0 * exp( -35.0 * t )
      - 20.0 * exp( -500.0 * t )
    ) );
  }

  // hihat
  {
    float st = floor( time.y * 4.0 / B2T );
    float t = mod( time.x, 0.25 * B2T );
    float env = exp( -exp( 3.0 + fract( 0.62 * st ) ) * t );

    dest += 0.2 * env * shotgun( t * 2.5, 2.0, 1.4, 0.1 );
  }

  // tambo
  {
    float t = mod( time.x - 0.5 * B2T, B2T );
    if ( time.z > 15.5 * B2T ) { t = mod( time.x, B2T / 8.0 ); }
    float env = exp( -30.0 * t );

    dest += 0.3 * env * shotgun( t * 8.3, 1.0, 1.5, 0.5 );
  }

  // clap
  {
    float t = mod( time.y - B2T, 2.0 * B2T );

    float env = mix(
      exp( -20.0 * t),
      exp( -200.0 * mod( t, 0.017 ) ),
      exp( -60.0 * max( 0.0, t - 0.02 ) )
    );

    vec2 uv = orbit( 59.0 * t ) + 34.0 * t;

    dest += 0.2 * tanh( 20.0 * env * ( vec2(
      texture( f, uv ).x,
      texture( f, uv + 0.05 ).x
    ) ) );
  }
}
