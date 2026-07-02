function initTrimlyGlow() {
    'use strict';

    const connection = navigator.connection || navigator.webkitConnection;
    if (connection?.saveData) {
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.id = 'glow-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        powerPreference: 'low-power',
    });

    if (!gl) {
        canvas.remove();
        return;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const vertSrc = `
        attribute vec2 a_pos;
        void main() {
            gl_Position = vec4(a_pos, 0.0, 1.0);
        }
    `;

    const fragSrc = `
        precision highp float;

        uniform vec2 u_resolution;
        uniform float u_time;
        uniform float u_intensity;
        uniform float u_theme;
        uniform vec2 u_pointer;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
                u.y
            );
        }

        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
            for (int i = 0; i < 3; i++) {
                v += a * noise(p);
                p = rot * p * 2.05 + vec2(1.7, 9.2);
                a *= 0.5;
            }
            return v;
        }

        float neonSpill(vec2 p, float cx, float topY, float width, float reach, float sharpness) {
            vec2 delta = p - vec2(cx, topY);
            float beam = exp(-pow(delta.x / width, 2.0) * sharpness);
            float falloff = exp(-max(-delta.y, 0.0) * reach);
            float rim = exp(-pow(abs(delta.y - 0.06) / 0.18, 2.0) * 2.5)
                * exp(-pow(delta.x / (width * 1.4), 2.0));
            return max(beam * falloff, rim * 0.35);
        }

        float softPool(vec2 p, vec2 center, float radius) {
            return exp(-pow(length(p - center) / radius, 2.4));
        }

        float edgeGlow(vec2 p, vec2 edge, vec2 dir, float reach, float tightness) {
            vec2 n = normalize(dir);
            float along = dot(p - edge, n);
            float across = length(p - edge - n * along);
            return exp(-max(-along, 0.0) * reach) * exp(-pow(across, 2.0) * tightness);
        }

        float caustics(vec2 p, float t) {
            vec2 q = p;
            float c = 0.0;
            q += vec2(fbm(q * 2.2 + t * 0.04), fbm(q * 2.2 - t * 0.035 + 2.1)) * 0.12;
            c += sin(q.x * 5.5 + t * 0.35) * sin(q.y * 4.8 - t * 0.28);
            c += sin((q.x + q.y) * 3.6 + t * 0.22) * 0.5;
            return c * 0.5 + 0.5;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution;
            vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
            vec2 p = (uv - 0.5) * aspect;

            vec2 parallax = (u_pointer - 0.5) * mix(0.018, 0.028, u_theme);
            float t = u_time;
            p += parallax;

            vec3 blue = vec3(0.300, 0.470, 0.520);
            vec3 cyan = vec3(0.420, 0.570, 0.570);
            vec3 green = vec3(0.300, 0.540, 0.380);
            vec3 copper = vec3(0.680, 0.450, 0.310);
            vec3 warm = vec3(1.000, 0.720, 0.480);
            vec3 sky = vec3(0.620, 0.780, 0.980);
            vec3 peach = vec3(0.980, 0.780, 0.620);

            float topBlue = neonSpill(p, -0.16 + sin(t * 0.18) * 0.03, 0.52, 0.20, 3.0, 3.4);
            float topCyan = neonSpill(p, 0.26 + cos(t * 0.15) * 0.025, 0.50, 0.16, 3.2, 3.8);
            float sideGreen = edgeGlow(p, vec2(-0.72, -0.05), vec2(1.0, 0.15), 1.6, 18.0);
            float sidePurple = edgeGlow(p, vec2(0.74, 0.12), vec2(-1.0, -0.08), 1.4, 16.0);

            vec3 spillDark = vec3(0.0);
            spillDark += blue * topBlue * 0.070;
            spillDark += cyan * topCyan * 0.050;
            spillDark += green * sideGreen * 0.032;
            spillDark += copper * sidePurple * 0.026;

            float poolWarm = softPool(p, vec2(-0.22, 0.08), 0.55);
            float poolSky = softPool(p, vec2(0.30, -0.06), 0.48);
            float poolPeach = softPool(p, vec2(0.08, 0.32), 0.42);

            vec3 spillLight = vec3(0.0);
            spillLight += warm * poolWarm * 0.14;
            spillLight += sky * poolSky * 0.16;
            spillLight += peach * poolPeach * 0.10;
            spillLight += sky * topBlue * 0.08;
            spillLight += warm * neonSpill(p, 0.0, 0.54, 0.28, 2.4, 2.8) * 0.10;

            vec3 spill = mix(spillLight, spillDark, u_theme);

            float caust = caustics(p * mix(1.6, 2.1, u_theme), t);
            vec2 specCenter = (u_pointer - 0.5) * aspect * 0.55;
            float specular = exp(-dot(p - specCenter, p - specCenter) * mix(10.0, 14.0, u_theme));
            vec3 glassSheen = mix(vec3(1.0), vec3(0.70, 0.78, 0.76), u_theme);
            spill += glassSheen * caust * mix(0.035, 0.014, u_theme);
            spill += glassSheen * specular * mix(0.04, 0.016, u_theme);

            float shimmer = noise(p * 9.0 + vec2(t * 0.07, -t * 0.05)) * 0.03;
            spill *= 0.97 + shimmer;
            spill *= (0.94 + 0.06 * sin(t * 0.28)) * u_intensity;

            float strength = pow(max(max(spill.r, spill.g), spill.b), mix(1.25, 1.12, u_theme));
            float alphaMax = mix(0.14, 0.070, u_theme);
            float alpha = clamp(strength * mix(0.62, 0.34, u_theme), 0.0, alphaMax);

            gl_FragColor = vec4(spill * alpha, alpha);
        }
    `;

    function compile(type, src) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.warn('Glow shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vert = compile(gl.VERTEX_SHADER, vertSrc);
    const frag = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vert || !frag) {
        canvas.remove();
        return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn('Glow program link error:', gl.getProgramInfoLog(program));
        canvas.remove();
        return;
    }

    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uIntensity = gl.getUniformLocation(program, 'u_intensity');
    const uTheme = gl.getUniformLocation(program, 'u_theme');
    const uPointer = gl.getUniformLocation(program, 'u_pointer');

    const darkMq = window.matchMedia('(prefers-color-scheme: dark)');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const themes = {
        light: { intensity: 0.72, theme: 0.0 },
        dark: { intensity: 0.28, theme: 1.0 },
    };

    let theme = darkMq.matches ? themes.dark : themes.light;
    let pointer = { x: 0.5, y: 0.5 };
    let targetPointer = { x: 0.5, y: 0.5 };
    let running = true;
    let start = performance.now();
    let elapsed = 0;
    let frameHandle = 0;
    let activeUntil = 0;
    let lastFrame = 0;
    const frameInterval = 1000 / 24;

    function activate(duration = 1600) {
        activeUntil = Math.max(activeUntil, performance.now() + duration);
        if (!frameHandle && running) {
            frameHandle = requestAnimationFrame(frame);
        }
    }

    function applyTheme() {
        theme = darkMq.matches ? themes.dark : themes.light;
        activate(600);
    }

    darkMq.addEventListener('change', applyTheme);

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.floor(window.innerWidth * dpr);
        const h = Math.floor(window.innerHeight * dpr);
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
            gl.viewport(0, 0, w, h);
            activate(600);
        }
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    window.addEventListener('pointermove', (e) => {
        targetPointer.x = e.clientX / window.innerWidth;
        targetPointer.y = 1.0 - e.clientY / window.innerHeight;
        activate(900);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
        running = !document.hidden;
        if (running) {
            start = performance.now() - elapsed;
            activate(600);
        }
    });

    function frame(now) {
        frameHandle = 0;
        if (!running) {
            return;
        }
        if (now - lastFrame < frameInterval && now < activeUntil) {
            frameHandle = requestAnimationFrame(frame);
            return;
        }
        lastFrame = now;

        elapsed = now - start;
        const t = motionMq.matches ? 0 : elapsed * 0.001;

        pointer.x += (targetPointer.x - pointer.x) * 0.03;
        pointer.y += (targetPointer.y - pointer.y) * 0.03;

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.uniform1f(uTime, t);
        gl.uniform1f(uIntensity, theme.intensity);
        gl.uniform1f(uTheme, theme.theme);
        gl.uniform2f(uPointer, pointer.x, pointer.y);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        if (now < activeUntil) {
            frameHandle = requestAnimationFrame(frame);
        }
    }

    document.documentElement.classList.add('glow-ready');
    frameHandle = requestAnimationFrame(frame);
}

(function scheduleTrimlyGlow() {
    const start = () => {
        const requestIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 900));
        requestIdle(initTrimlyGlow, { timeout: 1800 });
    };

    if (document.readyState === 'complete') {
        start();
    } else {
        window.addEventListener('load', start, { once: true });
    }
})();
