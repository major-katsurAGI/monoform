#version 300 es
precision mediump float;

in  vec2 v_texCoord;
out vec4 outColor;

uniform sampler2D u_image;
uniform vec2  u_resolution;

uniform float u_blur;
uniform float u_grain;
uniform float u_hue;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_grayscale;
uniform float u_sepia;
uniform float u_saturate;

/* --------------------------------------------------------------------- */
/* helpers                                                               */
float hash(vec2 v) {
    vec2 s = sin(v*12.9898)+cos(v*78.233);
    return fract(dot(s,vec2(43758.5453,19347.8912))+sin(v.x+v.y));
}

/* 13-tap SVG Gaussian weights */
const float w0 = 0.2270270270;
const float w1 = 0.1945945946;
const float w2 = 0.1216216216;
const float w3 = 0.0540540541;
const float NORM = 1.0 / (w0 + 4.0 * (w1 + w2 + w3));  /* 0.58544 */

/* --------------------------------------------------------------------- */
vec4 gaussianBlur(vec2 uv, float rUV) {
    rUV *= 0.10;                           /* gentler, but no clamp       */
    if (rUV < 1e-6) return texture(u_image, uv);

    vec2 dx = vec2(rUV, 0.0);
    vec2 dy = vec2(0.0, rUV);

    vec4 c = texture(u_image, uv) * w0;

    /* horizontal */
    c += texture(u_image, uv + dx)       * w1;
    c += texture(u_image, uv - dx)       * w1;
    c += texture(u_image, uv + dx*2.0)   * w2;
    c += texture(u_image, uv - dx*2.0)   * w2;
    c += texture(u_image, uv + dx*3.0)   * w3;
    c += texture(u_image, uv - dx*3.0)   * w3;

    /* vertical */
    c += texture(u_image, uv + dy)       * w1;
    c += texture(u_image, uv - dy)       * w1;
    c += texture(u_image, uv + dy*2.0)   * w2;
    c += texture(u_image, uv - dy*2.0)   * w2;
    c += texture(u_image, uv + dy*3.0)   * w3;
    c += texture(u_image, uv - dy*3.0)   * w3;

    return c * NORM;                     /* energy-normalised            */
}

vec3 hueShift(vec3 rgb,float deg) {
    const vec3 k = vec3(0.57735);
    float c = cos(radians(deg));
    float s = sin(radians(deg));
    return rgb*c + cross(k,rgb)*s + k*dot(k,rgb)*(1.0-c);
}

/* --------------------------------------------------------------------- */
void main() {
    vec4 col = gaussianBlur(v_texCoord, u_blur);
    vec3 rgb = col.rgb;
    float a  = col.a;

    rgb = hueShift(rgb, u_hue);
    rgb *= u_brightness;
    rgb  = (rgb - 0.5) * u_contrast + 0.5;

    float l = dot(rgb, vec3(0.299,0.587,0.114));
    rgb = mix(rgb, vec3(l), u_grayscale);

    vec3 sep = vec3(
        dot(rgb, vec3(0.393,0.769,0.189)),
        dot(rgb, vec3(0.349,0.686,0.168)),
        dot(rgb, vec3(0.272,0.534,0.131)));
    rgb = mix(rgb, sep, u_sepia);

    float satL = dot(rgb, vec3(0.3,0.59,0.11));
    rgb = mix(vec3(satL), rgb, u_saturate);

    float n = hash(v_texCoord * u_resolution) - 0.5;
    rgb += n * u_grain * 0.5 * smoothstep(0.2,0.8,l);

    outColor = vec4(clamp(rgb,0.0,1.0), a);
}
