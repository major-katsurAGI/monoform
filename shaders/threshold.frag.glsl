#version 300 es
precision mediump float;

in  vec2 v_texCoord;
out vec4 outColor;

uniform sampler2D u_image;     /* source texture */
uniform float     u_threshold; /* 0 – 1 */

void main () {
    vec3  c  = texture(u_image, v_texCoord).rgb;
    float g  = dot(c, vec3(0.299, 0.587, 0.114));      /* luma */
    float bw = step(u_threshold, g);                   /* 0/1 */
    outColor = vec4(vec3(bw), 1.0);
}
