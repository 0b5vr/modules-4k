#version 300 es

in vec2 p;
out vec2 v;

void main() {
  v = p;
  gl_Position = vec4( p, 0, 1 );
}
