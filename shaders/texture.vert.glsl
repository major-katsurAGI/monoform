#version 300 es
precision mediump float;

layout (location = 0) in vec2 a_pos;  /* -1‥1 fullscreen triangle */
out vec2 v_texCoord;

void main () {
    v_texCoord  = (a_pos + 1.0) * 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
}
