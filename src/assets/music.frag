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
const float BPS = 120.0 / 60.0;
const float B2T = 1.0 / BPS;

mat2 r2d(float x){
  float c=cos(x),s=sin(x);
  return mat2(c, s, -s, c);
}

mat3 orthbas( vec3 z ) {
  z = normalize( z );
  vec3 x = normalize( cross(
    abs( z.z ) < 0.99 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 ),
    z
  ) );
  return mat3( x, cross( z, x ), z );
}

vec3 cyclicNoise( vec3 p, float pump ) {
  vec4 sum = vec4( 0.0 );
  mat3 basis = orthbas( vec3( -1.0, 2.0, -3.0 ) );

  for ( int i = 0; i < 5; i ++ ) {
    p *= basis;
    p += sin( p.yzx );
    sum += vec4(
      cross( cos( p ), sin( p.zxy ) ),
      1.0
    );
    sum *= pump;
    p *= 2.0;
  }

  return sum.xyz / sum.w;
}

float p2f( float i ) {
  return exp2( ( i - 69.0 ) / 12.0 ) * 440.0;
}

vec2 orbit( float t ) {
  return vec2( cos( TAU * t ), sin( TAU * t ) );
}

void main() {
  dest = vec2( 0.0 ); // you might want to ditch this

  int chord[8] = int[](0, 5, 7, 10, 14, 17, 19, 24);

  uint sampleIndex = uint( gl_FragCoord.x ) + 4096u * uint( gl_FragCoord.y );
  float wholeTime = float( sampleIndex ) / r;
  uvec4 moddedIndex = sampleIndex % uvec4( r * B2T * vec4( 1u, 4u, 16u, 64u ) );
  vec4 time = vec4( moddedIndex ) / r;

  float sidechain;

  // kick
  {
    float t = mod( mod( time.y, 2.0 * B2T ), 0.75 * B2T );
    sidechain = 1.0 - 0.7 * smoothstep( 0.0, 0.001, t ) * smoothstep( 0.2, 0.001, t );

    dest += 0.8 * smoothstep( 0.3, 0.1, t ) * tanh( 1.5 * sin(
      360.0 * t
      - 45.0 * exp( -35.0 * t )
      - 20.0 * exp( -500.0 * t )
    ) );
  }

  // hihat
  {
    float t=mod(time.x,0.25*B2T);
    dest += exp(-exp(4.+fract(.422*floor(time.y/.25/B2T)+.4))*t)
      *sidechain
      *cyclicNoise(90.*orbit(30.*t).xyy,1.).xy;
  }

  // snare
  {
    float t=mod(time.y-B2T,2.0*B2T);
    dest += exp(-30.*t)*tanh(
      sin(1900.*t-20.*exp(-400.*t))
      + cyclicNoise(300.*orbit(t).xyy,1.).xy
    );
  }

  // clav
  {
    float t=mod(mod(time.y,1.25*B2T),0.5*B2T);
    dest+=vec2(.2,-.2)*exp(-t*200.)*vec2(sin(17000.*t));
  }

  dest*=step(32.*B2T,wholeTime) * step(wholeTime,96.*B2T);

  // bass
  {
    float t8=mod(time.y+0.5*B2T,2.*B2T);
    float t=mod(t8,.75*B2T);
    float rest=(2.+step(t8,1.5*B2T))/4.*B2T-t;

    float freq=p2f(21.);
    float env=smoothstep(0.,.001,t)*smoothstep(0.,.01,rest)
      *smoothstep(0.,.001,time.y)*smoothstep(0.,.01,4.*B2T-time.y)
      *exp(-3.*t);
    float cutoff=p2f(80.*mix(exp(-10.*t),1.,.8));

    float fm=env*sin(3.*TAU*freq*t);
    float osc=sin(TAU*freq*t+2.*fm);

    dest+=sidechain*env*tanh(2.*osc);
  }

  dest*=smoothstep(16.*B2T,32.*B2T,wholeTime);

  // chord
  {
    const int chord[8]=int[](0,7,10,12,14,15,26,29);

    vec2 sum=vec2(0);

    for(int iDelay=0;iDelay<3;iDelay++){
      float t5=mod(time.y-0.516*B2T*float(iDelay),1.25*B2T);
      float t=mod(t5,.75*B2T);
      float rest=(2.+step(t5,0.75*B2T))/4.*B2T-t;

      mat2 amp=smoothstep(0.,.001,t)*smoothstep(0.,.01,rest)*smoothstep(0.,.01,4.*B2T-time.y)
        *exp(-5.*t)
        *r2d(.5*float(iDelay)*sin(float(iDelay)+time.w)) // delaypan
        *exp(-float(iDelay));

      for(int i=0;i<16;i++){
        float fi=float(i);
        float freq=p2f(45.+float(chord[i%8]))
          *(1.+.005*(fract(fi*.622)-.5));
        sum+=amp
          *r2d(fi+wholeTime)
          *cyclicNoise(
            vec3(
              1.*orbit(freq*t),
              9.*t-fi+step(8.,fi)*8.*max(0.,wholeTime-32.)
            ),
            exp2(4.-4.*exp(-8.*t))
          ).xy;
      }
    }

    dest+=.22
      *sidechain
      *sum;
  }

  dest*=smoothstep(128.*B2T,108.*B2T,wholeTime);

  dest=tanh(.5*dest);
}
