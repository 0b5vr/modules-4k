#version 300 es

//[
precision highp float;
//]

// #pragma shader_minifier_plugin bypass

#define lofi(i,j) (floor((i)/(j))*(j))
#define lofir(i,j) (round((i)/(j))*(j))

in vec2 v;

uniform float time; // in seconds
uniform float fft;

out vec4 outColor;

const float PI=acos(-1.);
const float TAU=PI*2.;

float gridd;
vec3 grids, gridc, gridh;

mat2 r2d(float x){
  float c=cos(x),s=sin(x);
  return mat2(c, s, -s, c);
}

mat3 orthbas(vec3 z){
  z=normalize(z);
  vec3 up=abs(z.y)>.999?vec3(0,0,1):vec3(0,1,0);
  vec3 x=normalize(cross(up,z));
  return mat3(x,cross(z,x),z);
}

uvec3 pcg3d(uvec3 s){
  s=s*1145141919u+1919810u;
  s+=s.yzx*s.zxy;
  s^=s>>16;
  s+=s.yzx*s.zxy;
  return s;
}

vec3 pcg3df(vec3 s){
  uvec3 r=pcg3d(floatBitsToUint(s));
  return vec3(r)/float(0xffffffffu);
}

void dogrid(vec3 ro,vec3 rd){
  grids=vec3(2,2,100);
  for(int i=0;i<3;i++){
    gridc=(floor(ro/grids)+.5)*grids;
    gridh=pcg3df(gridc);

    if(gridh.x<.4){
      break;
    }else if(i==0){
      grids=vec3(2,1,100);
    }else if(i==1){
      grids=vec3(1,1,100);
    }
  }
  
  vec3 src=-(ro-gridc)/rd;
  vec3 dst=abs(.501*grids/rd);
  vec3 bv=src+dst;
  float b=min(min(bv.x,bv.y),bv.z);
  gridd=b;
}

float sdbox(vec2 p,vec2 s){
  vec2 d=abs(p)-s;
  return length(max(d,0.))+min(0.,max(d.x,d.y));
}

float sdbox(vec3 p,vec3 s){
  vec3 d=abs(p)-s;
  return length(max(d,0.))+min(0.,max(max(d.x,d.y),d.z));
}

vec4 map(vec3 p){
  p-=gridc;
  p.z+=.4*smoothstep(31.8,33.,time)*sin(time+.5*sin(71.*gridh.z)+.3*(gridc.x+gridc.y));

  gridh.y*=step(24.,gridc.x);

  float d=sdbox(p+vec3(0,0,50),grids/2.-.02)-.02;

  float pcol=1.;

  vec3 pt=p;

  if(grids==vec3(2,2,100)){//2x2
    if(gridh.y<.3){//speaker
      vec3 c=vec3(0);
      pt.xy*=r2d(PI/4.);
      c.xy=lofir(pt.xy,.1);
      pt=pt-c;
      pt.xy*=r2d(-PI/4.);
      
      float r=.02*smoothstep(.85,.7,abs(p.x))*smoothstep(.85,.7,abs(p.y));
      float hole=length(pt.xy)-r;
      d=max(d,-hole);
    }else if(gridh.y<.5){//eq
      vec3 c=vec3(0);
      c.x=clamp(lofir(pt.x,.2),-.6,.6);
      pt-=c;
      float hole=sdbox(pt.xy,vec2(0.,.7))-.03;
      d=max(d,-hole);
      
      pt.y-=.5-smoothstep(-.5,.5,sin(time+c.x+gridh.z*100.));
      float d2=sdbox(pt,vec3(.02,.07,.07))-.03;
      
      if(d2<d){
        float l=step(abs(pt.y),.02);
        return vec4(d2,2.*l,l,0);
      }
      
      pt=p;
      c.y=clamp(lofir(pt.y,.2),-.6,.6);
      pt-=c;
      pcol*=smoothstep(.0,.01,sdbox(pt.xy,vec2(.07,.0))-.005);

      pt=p;
      c.y=clamp(lofir(pt.y,.6),-.6,.6);
      pt-=c;
      pcol*=smoothstep(.0,.01,sdbox(pt.xy,vec2(.1,.0))-.01);
      
      pcol=mix(1.,pcol,smoothstep(.0,.01,sdbox(pt.xy,vec2(.03,1.))-.01));

    }else if(gridh.y<.6){//kaosspad
      float hole=sdbox(p.xy,vec2(.9,.9)+.02);
      d=max(d,-hole);

      float d2=sdbox(p,vec3(.9,.9,.05));

      if(d2<d){
        float l=step(abs(p.x),.7)*step(abs(p.y),.7);
        return vec4(d2,4.*l,0,0);
      }
    }else if(gridh.y<1.){//bigass knob
      float ani=smoothstep(-.5,.5,sin(time+gridh.z*100.));
      pt.xy*=r2d(PI/6.*5.*mix(-1.,1.,ani));

      float metal=step(length(pt.xy),.45);
      float wave=metal*sin(length(pt.xy)*500.)/1000.;
      float d2=length(pt.xy)-.63+.05*pt.z-.02*cos(8.*atan(pt.y,pt.x));
      d2=max(d2,abs(pt.z)-.4-wave);

      float d2b=length(pt.xy)-.67+.05*pt.z;
      d2b=max(d2b,abs(pt.z)-.04);
      d2=min(d2,d2b);
      
      if(d2<d){
        float l=smoothstep(.01,.0,length(pt.xy-vec2(0,.53))-.03);
        return vec4(d2,3.*metal,l,0);
      }
      
      pt=p;
      float a=clamp(lofir(atan(-pt.x,pt.y),PI/12.),-PI/6.*5.,PI/6.*5.);
      pt.xy*=r2d(a);
      pcol*=smoothstep(.0,.01,length(pt.xy-vec2(0,.74))-.015);

      pt=p;
      a=clamp(lofir(atan(-pt.x,pt.y),PI/6.*5.),-PI/6.*5.,PI/6.*5.);
      pt.xy*=r2d(a);
      pcol*=smoothstep(.0,.01,length(pt.xy-vec2(0,.74))-.03);
      
      float d3=length(p-vec3(.7,-.7,0))-.05;
      
      if(d3<d){
        float led=1.-ani;
        led*=.5+.5*sin(time*exp2(3.+3.*gridh.z));
        return vec4(d3,2,led,0);
      }
    }
  }
  if(grids==vec3(2,1,100)){//2x1
    if(gridh.y<.8){//fader
      float hole=sdbox(p.xy,vec2(.9,.05));
      d=max(d,-hole);
      
      float ani=smoothstep(-.2,.2,sin(time+gridh.z*100.));
      pt.x-=mix(-.8,.8,ani);
      
      float d2=sdbox(pt,vec3(.07,.25,.4))+.05*p.z;
      d2=max(d2,-p.z);

      if(d2<d){
        float l=smoothstep(.01,.0,abs(p.y)-.02);
        return vec4(d2,0,l,0);
      }
      
      pt=p;
      vec3 c=vec3(0);
      c.x=clamp(lofir(pt.x,.2),-.8,.8);
      pt-=c;
      pcol*=smoothstep(.0,.01,sdbox(pt.xy,vec2(.0,.15))-.005);

      pt=p;
      c.x=clamp(lofir(pt.x,.8),-.8,.8);
      pt-=c;
      pcol*=smoothstep(.0,.01,sdbox(pt.xy,vec2(.0,.18))-.01);
      
      pcol=mix(1.,pcol,smoothstep(.0,.01,sdbox(p.xy,vec2(1.,.08))));
    }else if(gridh.y<1.){//meter
      float hole=sdbox(p.xy,vec2(.9,.3)+.02);
      d=max(d,-hole);

      float d2=sdbox(p,vec3(.9,.3,.1));

      if(d2<d){
        float l=step(abs(p.x),.8)*step(abs(p.y),.2);
        return vec4(d2,l,0,0);
      }
    }
  }
  if(grids==vec3(1,1,100)){//1x1
    if(gridh.y<.5){//knob
      float hole=length(p.xy)-.25;
      d=max(d,-hole);
      
      float ani=smoothstep(-.5,.5,sin(2.*time+gridh.z*100.));
      pt.xy*=r2d(PI/6.*5.*mix(-1.,1.,ani));
      
      float d2=length(pt.xy)-.23+.05*pt.z;
      d2=max(d2,abs(pt.z)-.4);
      
      if(d2<d){
        float l=smoothstep(.01,.0,abs(pt.x)-.015);
        l*=smoothstep(.01,.0,-pt.y+.05);
        return vec4(d2,0,l,0);
      }
      
      pt=p;
      float a=clamp(lofir(atan(-pt.x,pt.y),PI/6.),-PI/6.*5.,PI/6.*5.);
      pt.xy*=r2d(a);
      pcol*=smoothstep(.0,.01,sdbox(pt.xy-vec2(0,.34),vec2(.0,.02))-.005);

      pt=p;
      a=clamp(lofir(atan(-pt.x,pt.y),PI/6.*5.),-PI/6.*5.,PI/6.*5.);
      pt.xy*=r2d(a);
      pcol*=smoothstep(.0,.01,sdbox(pt.xy-vec2(0,.34),vec2(.0,.03))-.01);
    }else if(gridh.y<.8){//jack
      float hole=length(p.xy)-.1;
      d=max(d,-hole);
      
      float d2=length(p.xy)-.15;
      d2=max(d2,abs(p.z)-.12);
      
      pt.xy*=r2d(100.*gridh.z);
      float d3=abs(pt.y)-.2;
      pt.xy*=r2d(PI/3.*2.);
      d3=max(d3,abs(pt.y)-.2);
      pt.xy*=r2d(PI/3.*2.);
      d3=max(d3,abs(pt.y)-.2);
      d3=max(d3,abs(p.z)-.03);

      d2=min(d2,d3);
      d2=max(d2,-hole);
      
      if(d2<d){
        return vec4(d2,3,0,0);
      }
    }else if(gridh.y<.99){//button
      pt.y+=.08;
      
      float hole=sdbox(pt.xy,vec2(.22))-.05;
      d=max(d,-hole);
      
      float ani=sin(2.*time+gridh.z*100.);
      float push=smoothstep(.3,.0,abs(ani));
      ani=smoothstep(-.1,.1,ani);
      pt.z+=.06*push;

      float d2=sdbox(pt,vec3(.2,.2,.05))-.05;

      if(d2<d){
        return vec4(d2,0,0,0);
      }
      
      float d3=length(p-vec3(0,.3,0))-.05;
      
      if(d3<d){
        float led=ani;
        return vec4(d3,2,led,0);
      }
    }else if(gridh.y<1.){//0b5vr
      pt=abs(pt);
      pt.xy=pt.x<pt.y?pt.yx:pt.xy;
      pcol*=smoothstep(.0,.01,sdbox(pt.xy,vec2(.05)));
      pcol*=smoothstep(.0,.01,sdbox(pt.xy-vec2(.2,0),vec2(.05,.15)));
    }
  }
  
  return vec4(d,0,pcol,0);
}

vec3 nmap(vec3 p,float dd){
  vec2 d=vec2(0,dd);
  return normalize(vec3(
    map(p+d.yxx).x-map(p-d.yxx).x,
    map(p+d.xyx).x-map(p-d.xyx).x,
    map(p+d.xxy).x-map(p-d.xxy).x
  ));
}

void main(void)
{
  vec2 p = v;
  p.x *= 16.0 / 9.0;

  vec3 col=vec3(0);

  vec3 co=mix(vec3(0,-2,-38),vec3(-8,-10,-38),smoothstep(15.8,17.,time));
  vec3 ct=vec3(0,0,-50);
  co.xy+=time;
  ct.xy+=time;
  mat3 cb=orthbas(co-ct);
  vec3 ro=co+cb*vec3(
    (4.+smoothstep(31.8,33.,time))*p*r2d(.5*smoothstep(15.8,17.,time)),
    0
  );
  vec3 rd=cb*normalize(vec3(0,0,-2));
  
  float rl=1E-2;
  vec3 rp=ro+rd*rl;
  vec4 isect;
  float gridlen=rl;

  for(int i=0;i<100;i++){
    if(gridlen<=rl){
      dogrid(rp,rd);
      gridlen+=gridd;
    }
    
    isect=map(rp);
    rl=min(rl+isect.x*.8,gridlen);
    rp=ro+rd*rl;
    
    if(abs(isect.x)<1E-4){break;}
    if(rl>50.){break;}
  }

  if(isect.x<1E-2){
    vec3 basecol=vec3(.5);
    vec3 speccol=vec3(.2);
    float specpow=30.;
    float ndelta=1E-4;
    
    float mtl=isect.y;
    float mtlp=isect.z;
    if(mtl==0.){
      mtlp=mix(mtlp,1.-mtlp,step(pcg3df(gridh).z,.1));
      basecol=mix(vec3(.04),vec3(.9),mtlp);
    }else if(mtl==1.){
      basecol=vec3(0);
      speccol=vec3(.5);
      specpow=60.;
      
      vec2 size=vec2(.05,.2);
      vec2 pp=(rp-gridc).xy;
      vec2 c=lofi(pp.xy,size)+size/2.;
      vec2 cc=pp-c;
      vec3 led=vec3(1);
      led*=exp(-60.*sdbox(cc,vec2(0.,.08)));
      led*=c.x>.5?vec3(5,1,1):vec3(1,5,2);
      float lv=smoothstep(-60.,0.,fft+gridh.z*30.);
      col+=led*step(c.x,-.8+1.6*lv);
      basecol=.04*led;
    }else if(mtl==2.){//led
      basecol=vec3(0);
      speccol=vec3(1.);
      specpow=100.;
      
      col+=mtlp*vec3(2,.5,.5);
    }else if(mtl==3.){//metal
      basecol=vec3(.2);
      speccol=vec3(1.8);
      specpow=60.;
      ndelta=3E-2;
    }else if(mtl==4.){//kaoss
      basecol=vec3(0);
      speccol=vec3(.5);
      specpow=60.;
      
      vec2 size=vec2(.1);
      vec2 pp=(rp-gridc).xy;
      vec2 c=lofi(pp.xy,size)+size/2.;
      vec2 cc=pp-c;
      vec3 led=vec3(1);
      led*=exp(-60.*sdbox(cc,vec2(0.,.0)));
      led*=vec3(2,1,2);
      float plasma=sin(length(c)*10.-10.*time+gridh.z*.7);
      plasma+=sin(c.y*10.-7.*time);
      led*=.5+.5*sin(plasma);
      col+=2.*led;
      basecol=.04*led;
    }
    
    vec3 n=nmap(rp,ndelta);
    vec3 V=-rd;
    
    ro=rp;

    {
      vec3 l=normalize(vec3(1,3,5));
      vec3 h=normalize(l+V);
      float dotnl=max(0.,dot(n,l));
      float dotnh=max(0.,dot(n,h));

      rd=l;
      rl=gridlen=1E-2;
      rp=ro+rd*rl;

      for(int i=70;i<100;i++){
        if(gridlen<=rl){
          dogrid(rp,rd);
          gridlen+=gridd;
        }
        
        isect=map(rp);
        rl=min(rl+isect.x*.8,gridlen);
        rp=ro+rd*rl;
        
        if(abs(isect.x)<1E-4){break;}
        if(rl>50.){break;}
      }
      float shadow=step(1E-2,isect.x);

      vec3 diff=basecol/PI;
      vec3 spec=speccol*pow(dotnh,specpow);
      col+=shadow*dotnl*(diff+spec)*vec3(.5,.6,.7);
    }

    {
      vec3 l=normalize(vec3(-1,-1,5));
      vec3 h=normalize(l+V);
      float dotnl=max(0.,dot(n,l));
      float dotnh=max(0.,dot(n,h));

      rd=l;
      rl=gridlen=1E-2;
      rp=ro+rd*rl;

      for(int i=70;i<100;i++){
        if(gridlen<=rl){
          dogrid(rp,rd);
          gridlen+=gridd;
        }
        
        isect=map(rp);
        rl=min(rl+isect.x*.8,gridlen);
        rp=ro+rd*rl;
        
        if(abs(isect.x)<1E-4){break;}
        if(rl>50.){break;}
      }
      float shadow=step(1E-2,isect.x);

      vec3 diff=basecol/PI;
      vec3 spec=speccol*pow(dotnh,specpow);
      col+=shadow*dotnl*(diff+spec);
    }
  }
  
  col=pow(col,vec3(.4545));
  col=smoothstep(vec3(0,-.1,-.2),vec3(1,1.1,1.2),col);
  col*=smoothstep(0.0,2.0,time);
  col*=smoothstep(64.0,62.0,time);
  outColor = vec4(col,1);
}
