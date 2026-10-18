// Full-screen pass: blueprint grain, a moving scan line, glow, and vignette.
export const postVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const postFragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform float time;
  uniform vec2 pixel;
  varying vec2 vUv;

  float random(vec2 point) {
    return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;
    float scanPosition = mod(-time, 5.0) * 0.5;
    float line = step(scanPosition - 0.005, uv.y)
      * step(uv.y, scanPosition + 0.005);
    uv += line * 0.01;

    vec3 color = texture2D(map, uv).rgb;
    vec3 glow = vec3(0.0);

    for (int x = -2; x <= 2; x++) {
      for (int y = -2; y <= 2; y++) {
        vec2 offset = vec2(float(x), float(y)) * pixel * 3.0;
        vec3 sampleColor = texture2D(map, uv + offset).rgb;
        glow += max(sampleColor - vec3(0.35), vec3(0.0)) / 25.0;
      }
    }

    color += glow * 0.95;
    vec2 vignette = (vUv - 0.5) * 0.75;
    color = mix(color, vec3(0.0), dot(vignette, vignette) * 0.4);
    color = pow(max(color, vec3(0.0)), vec3(1.0 / 2.2));
    color *= 1.0 - 0.56 * smoothstep(0.15, 0.72, length(vUv - 0.5));
    color = color * 1.12 - random(uv + time * 0.01) * 0.02;

    gl_FragColor = vec4(color, 1.0);
  }
`;
