import {
  DX,
  Errors,
  fX,
  ML,
  mX,
  NX,
  oN,
  QD,
  SX,
  TX,
  UL,
  wB,
  _X,
} from './utils';

export class PX {
  name = 'BeautyProcessor';
  fps = 30;
  canvas;
  video;
  manager = new OX();
  overloadDetector = new DX();
  stopChromeBackgroundLoop = null;
  onOverload;
  stopLoop;
  lastRenderTime = 0;
  _enabled = false;

  async onEnableChange(e) {
    this.manager.setEnableBeauty(e),
      this.context &&
        this.inputTrack &&
        (e
          ? await this.startEffect(this.inputTrack, this.context)
          : await this.stopEffect(this.inputTrack, this.context));
  }
  async setBeautyEffectOptions(options: any) {
    if (!options.smoothnessLevel) {
      UL(options.smoothnessLevel, 'options.smoothnessLevel', 0, 1, false);
    }
    if (!options.lighteningLevel) {
      UL(options.lighteningLevel, 'options.lighteningLevel', 0, 1, false);
    }

    if (!options.lighteningLevel) {
      UL(options.rednessLevel, 'options.rednessLevel', 0, 1, false);
    }
    if (!options.lighteningContrastLevel) {
      ML(
        options.lighteningContrastLevel,
        'options.lighteningContrastLevel',
        [0, 1, 2]
      );
    }

    if (!options.smoothnessLevel) {
      const t = Math.max(0.1, 10 * options.smoothnessLevel);
      this.manager.setDenoiseLevel(t);
    }
    if (!options.lighteningLevel) {
      const t = Math.max(0.1, options.lighteningLevel / 2);
      this.manager.setLightLevel(t);
    }
    if (!options.rednessLevel) {
      const t = Math.max(0.01, options.rednessLevel);
      this.manager.setRednessLevel(t);
    }
    if (!options.lighteningContrastLevel) {
      const t = options.lighteningContrastLevel;
      this.manager.setContrastLevel(t);
    }
  }

  async onTrack(e, t) {
    let i;
    this.video &&
      this.enabled &&
      (null === (i = this.stopLoop) || void 0 === i || i.call(this),
      await this.stopEffect(e, t));
    await this.startEffect(e, t);
  }
  async startEffect(e, t) {
    if (!this.enabled) return;
    const i = oN();
    const r = await this.renderWithWebGL(e);
    this.output(r, t),
      console.info('start video effect, output:', this.outputTrack),
      this.overloadDetector
        .startRecordBeautyEffectOutput(this.fps)
        .then((e) => {
          e || (this.onOverload && this.onOverload());
        });
    let n = !1;
    this.stopLoop = () => {
      n = !0;
    };
    const o = () => {
      this.enabled && !n && requestAnimationFrame(o);
      const e = Date.now(),
        t = 1e3 / this.fps,
        i = this.lastRenderTime ? e - this.lastRenderTime : t;
      i < t ||
        ((this.lastRenderTime = e - (i - t)),
        this.video && this.video.paused && this.video.play(),
        this.enabled &&
          this.video &&
          (this.manager.render(this.video),
          this.outputTrack &&
            this.outputTrack.requestFrame &&
            this.outputTrack.requestFrame(),
          this.overloadDetector.addFrame()));
    };
    requestAnimationFrame(o),
      i.name === tN.CHROME &&
        document.addEventListener(
          'visibilitychange',
          () => {
            document.hidden
              ? (this.stopChromeBackgroundLoop = Nj(() => {
                  this.enabled && this.video && this.manager.render(this.video),
                    this.outputTrack &&
                      this.outputTrack.requestFrame &&
                      this.outputTrack.requestFrame(),
                    this.overloadDetector.addFrame();
                }, this.fps))
              : this.stopChromeBackgroundLoop &&
                (this.stopChromeBackgroundLoop(),
                (this.stopChromeBackgroundLoop = null));
          },
          !1
        );
  }
  async renderWithWebGL(e) {
    this.canvas && (this.canvas.remove(), (this.canvas = void 0)),
      this.video && (this.video.remove(), (this.video = void 0)),
      (this.canvas = document.createElement('canvas')),
      (this.video = document.createElement('video')),
      this.video.setAttribute('autoplay', ''),
      this.video.setAttribute('muted', ''),
      (this.video.muted = !0),
      this.video.setAttribute('playsinline', ''),
      this.video.setAttribute('style', 'display:none'),
      (this.video.srcObject = new MediaStream([e]));
    const t = new Promise((e) => {
      const t = () => {
        this.video && this.video.removeEventListener('playing', t), e(void 0);
      };
      this.video && this.video.addEventListener('playing', t);
    });

    this.video.play();
    await t;
    const i = e.getSettings(),
      r = i.width || this.video.videoWidth,
      n = i.height || this.video.videoHeight;
    if (
      (i.frameRate &&
        this.fps !== i.frameRate &&
        ((this.fps = i.frameRate),
        console.debug('beauty video processor: set fps to', this.fps)),
      console.debug(
        'beauty video processor: width '.concat(r, ' height ').concat(n)
      ),
      !r || !n)
    )
      throw new QD(
        Errors.BEAUTY_PROCESSOR_INTERNAL_ERROR,
        'can not get track resolution'
      );
    (this.canvas.width = r),
      (this.canvas.height = n),
      this.video.setAttribute('width', r.toString()),
      this.video.setAttribute('height', n.toString()),
      this.manager.init(r, n, this.canvas);
    const o = wB();
    return this.canvas
      .captureStream(o.supportRequestFrame ? 0 : this.fps)
      .getVideoTracks()[0];
  }

  async stopEffect(e, t) {
    console.info('stop video effect'),
      this.overloadDetector.stopRecordBeautyEffectOutput(),
      this.manager.release(),
      this.canvas && this.canvas.remove(),
      this.video && this.video.remove(),
      (this.canvas = void 0),
      (this.video = void 0),
      this.output(e, t);
  }
}

class OX {
  gl = null;
  canvas = null;
  programs = [];
  commonProgram = null;
  inputTexture = null;
  outputTextures = [];
  fbos = [];
  originalFrameWidth = 0;
  originalFrameHeight = 0;
  enableBeauty = !1;
  denoiseLevel = 5;
  lightLevel = 0.35;
  rednessLevel = 0.5;
  lighteningContrastLevel = 1;

  setEnableBeauty(e) {
    this.enableBeauty = !!e;
  }
  init(e, t, i) {
    if (!wB().supportWebGL)
      throw new QD(Errors.NOT_SUPPORTED, 'your browser is not support webGL');
    if (((this.gl = i.getContext('webgl')), !this.gl))
      throw new QD(Errors.WEBGL_INTERNAL_ERROR, 'can not get webgl context');
    if ((this.initGL(e, t), !this.inputTexture))
      throw new QD(Errors.WEBGL_INTERNAL_ERROR, 'can not find input texture');
    (this.canvas = i),
      this.programs.push(new fX(this.gl)),
      this.programs.push(new _X(this.gl, e, t)),
      this.programs.push(new SX(this.gl, e, t)),
      this.programs.push(new TX(this.gl, e, t)),
      this.programs.push(new NX(this.gl, this.inputTexture, e, t)),
      (this.commonProgram = this.programs[0].program),
      this.setDenoiseLevel(this.denoiseLevel),
      this.setLightLevel(this.lightLevel),
      this.setRednessLevel(this.rednessLevel),
      this.setContrastLevel(this.lighteningContrastLevel);
  }
  render(e) {
    if (!this.gl || !this.commonProgram || !this.canvas)
      return void console.warn('video effect manager is not init!');
    let t = 0;
    if (
      this.originalFrameHeight === e.videoWidth &&
      this.originalFrameWidth === e.videoHeight
    )
      t = 2;
    else if (
      this.originalFrameHeight !== e.videoHeight ||
      this.originalFrameWidth !== e.videoWidth
    ) {
      if (
        (console.debug(
          'beauty effect: resolution changed '
            .concat(String(this.originalFrameWidth), 'x')
            .concat(String(this.originalFrameHeight), ' -> ')
            .concat(e.videoWidth, 'x')
            .concat(e.videoHeight)
        ),
        0 === e.videoHeight || 0 === e.videoWidth)
      )
        return void console.debug('beauty effect: skip 0 resolution frame');
      (this.canvas.width = e.videoWidth),
        (this.canvas.height = e.videoHeight),
        e.setAttribute('width', e.videoWidth.toString()),
        e.setAttribute('height', e.videoHeight.toString()),
        this.release(),
        this.init(e.videoWidth, e.videoHeight, this.canvas);
    }
    this.gl.viewport(0, 0, e.videoWidth, e.videoHeight),
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.inputTexture),
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        e
      );
    const i = this.enableBeauty ? this.programs.length - 1 : 0;
    for (let e = 0; e <= i; e++) {
      const i = this.programs[e].program;
      this.gl.useProgram(i);
      const r = this.gl.getUniformLocation(i, 'u_image');
      this.programs[e].setUniforms(),
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbos[t + (e % 2)]),
        this.gl.clearColor(0, 0, 0, 1),
        this.gl.clear(this.gl.COLOR_BUFFER_BIT),
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6),
        this.gl.activeTexture(this.gl.TEXTURE0),
        this.gl.bindTexture(
          this.gl.TEXTURE_2D,
          this.outputTextures[t + (e % 2)]
        ),
        this.gl.uniform1i(r, 0);
    }
    this.gl.useProgram(this.commonProgram);
    const r = this.gl.getUniformLocation(this.commonProgram, 'u_flipY');
    this.gl.uniform1f(r, -1),
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null),
      this.gl.clearColor(0, 0, 0, 1),
      this.gl.clear(this.gl.COLOR_BUFFER_BIT),
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }
  setDenoiseLevel(e) {
    this.programs.forEach((t) => {
      t instanceof mX && t.setParameters({ denoiseLevel: e });
    }),
      (this.denoiseLevel = e);
  }
  setLightLevel(e) {
    this.programs.forEach((t) => {
      t instanceof mX && t.setParameters({ lightLevel: e });
    }),
      (this.lightLevel = e);
  }
  setRednessLevel(e) {
    this.programs.forEach((t) => {
      t instanceof mX && t.setParameters({ rednessLevel: e });
    }),
      (this.rednessLevel = e);
  }
  setContrastLevel(e) {
    this.programs.forEach((t) => {
      t instanceof mX && t.setParameters({ lighteningContrastLevel: e });
    }),
      (this.lighteningContrastLevel = e);
  }
  setSize(e, t) {
    this.programs.forEach((i) => {
      i instanceof mX && i.setSize(e, t);
    });
  }
  release() {
    (this.gl = null),
      (this.commonProgram = null),
      (this.inputTexture = null),
      (this.programs = []),
      (this.outputTextures = []),
      (this.fbos = []);
  }
  initGL(e, t) {
    if (!this.gl)
      throw new QD(Errors.WEBGL_INTERNAL_ERROR, 'can not find webgl context');
    (this.inputTexture = this.gl.createTexture()),
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.inputTexture),
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_S,
        this.gl.CLAMP_TO_EDGE
      ),
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_T,
        this.gl.CLAMP_TO_EDGE
      ),
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER,
        this.gl.LINEAR
      ),
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MAG_FILTER,
        this.gl.LINEAR
      );
    for (let i = 0; i < 4; i++) {
      const r = this.gl.createTexture();
      if (!r)
        throw new QD(Errors.WEBGL_INTERNAL_ERROR, 'create texture failed');
      this.gl.bindTexture(this.gl.TEXTURE_2D, r),
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_S,
          this.gl.CLAMP_TO_EDGE
        ),
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_T,
          this.gl.CLAMP_TO_EDGE
        ),
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_MIN_FILTER,
          this.gl.LINEAR
        ),
        i < 2
          ? this.gl.texImage2D(
              this.gl.TEXTURE_2D,
              0,
              this.gl.RGBA,
              e,
              t,
              0,
              this.gl.RGBA,
              this.gl.UNSIGNED_BYTE,
              null
            )
          : this.gl.texImage2D(
              this.gl.TEXTURE_2D,
              0,
              this.gl.RGBA,
              t,
              e,
              0,
              this.gl.RGBA,
              this.gl.UNSIGNED_BYTE,
              null
            );
      const n = this.gl.createFramebuffer();
      if (!n)
        throw new QD(Errors.WEBGL_INTERNAL_ERROR, 'create frame buffer failed');
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, n),
        this.gl.framebufferTexture2D(
          this.gl.FRAMEBUFFER,
          this.gl.COLOR_ATTACHMENT0,
          this.gl.TEXTURE_2D,
          r,
          0
        ),
        this.outputTextures.push(r),
        this.fbos.push(n);
    }
    this.gl.viewport(0, 0, e, t),
      (this.originalFrameWidth = e),
      (this.originalFrameHeight = t);
  }
}
