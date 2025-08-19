
const trimLeft = /^\s+/;
const trimRight = /\s+$/;

export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

export interface HSVColor {
  h: number;
  s: number;
  v: number;
  a: number;
}

export interface PercentageRGBColor {
  r: string;
  g: string;
  b: string;
  a: number;
}

export interface TinyColorOptions {
  format?: string;
  gradientType?: boolean;
}

export interface WCAG2Options {
  level?: "AA" | "AAA";
  size?: "small" | "large";
}

export interface MostReadableOptions extends WCAG2Options {
  includeFallbackColors?: boolean;
}

export enum ColorFormat {
  RGB = "rgb",
  PRGB = "prgb", 
  HEX = "hex",
  HEX3 = "hex3",
  HEX4 = "hex4", 
  HEX6 = "hex6",
  HEX8 = "hex8",
  NAME = "name",
  HSL = "hsl",
  HSV = "hsv"
}

interface ParsedColor {
  r?: any;
  g?: any;
  b?: any;
  h?: any;
  s?: any;
  l?: any;
  v?: any;
  a?: any;
  format?: string;
  ok?: boolean;
}

export interface TinyColor {
  _originalInput: any;
  _r: number;
  _g: number;
  _b: number;
  _a: number;
  _roundA: number;
  _format: string;
  _gradientType?: boolean;
  _ok: boolean;

  isDark(): boolean;
  isLight(): boolean;
  isValid(): boolean;
  getOriginalInput(): any;
  getFormat(): string;
  getAlpha(): number;
  getBrightness(): number;
  getLuminance(): number;
  setAlpha(value: number): TinyColor;
  toHsv(): HSVColor;
  toHsvString(): string;
  toHsl(): HSLColor;
  toHslString(): string;
  toHex(allow3Char?: boolean): string;
  toHexString(allow3Char?: boolean): string;
  toHex8(allow4Char?: boolean): string;
  toHex8String(allow4Char?: boolean): string;
  toRgb(): RGBColor;
  toRgbString(): string;
  toPercentageRgb(): PercentageRGBColor;
  toPercentageRgbString(): string;
  toName(): string | false;
  toFilter(secondColor?: any): string;
  toString(format?: ColorFormat): string;
  clone(): TinyColor;
  _applyModification(fn: Function, args: any[]): TinyColor;
  lighten(amount?: number): TinyColor;
  brighten(amount?: number): TinyColor;
  darken(amount?: number): TinyColor;
  desaturate(amount?: number): TinyColor;
  saturate(amount?: number): TinyColor;
  greyscale(): TinyColor;
  spin(amount?: number): TinyColor;
  _applyCombination(fn: Function, args: any[]): TinyColor | TinyColor[];
  analogous(results?: number, slices?: number): TinyColor[];
  complement(): TinyColor;
  monochromatic(results?: number): TinyColor[];
  splitcomplement(): TinyColor[];
  triad(): TinyColor[];
  tetrad(): TinyColor[];
}

export type ColorInput = string | RGBColor | HSLColor | HSVColor | TinyColor | ParsedColor;

interface TinyColorConstructor {
  new (color?: ColorInput, opts?: TinyColorOptions): TinyColor;
  (color?: ColorInput, opts?: TinyColorOptions): TinyColor;
  prototype: any;
  fromRatio: (color: ColorInput, opts?: TinyColorOptions) => TinyColor;
  equals: (color1: ColorInput, color2: ColorInput) => boolean;
  random: () => TinyColor;
  mix: (color1: ColorInput, color2: ColorInput, amount?: number) => TinyColor;
  readability: (color1: ColorInput, color2: ColorInput) => number;
  isReadable: (color1: ColorInput, color2: ColorInput, wcag2?: WCAG2Options) => boolean;
  mostReadable: (baseColor: ColorInput, colorList: ColorInput[], args?: MostReadableOptions) => TinyColor | null;
  names: Record<string, string>;
  hexNames: Record<string, string>;
}

function tinycolor(this: TinyColor, color?: ColorInput, opts?: TinyColorOptions): TinyColor {
  color = color ? color : "";
  opts = opts || {};

  if (color instanceof tinycolor) {
    return color as TinyColor;
  }
  if (!(this instanceof tinycolor)) {
    return new (tinycolor as any)(color, opts);
  }

  var rgb = inputToRGB(color);
  this._originalInput = color;
  this._r = rgb.r || 0;
  this._g = rgb.g || 0;
  this._b = rgb.b || 0;
  this._a = rgb.a !== undefined ? rgb.a : 1;
  this._roundA = Math.round(100 * this._a) / 100;
  this._format = opts.format || rgb.format || "rgb";
  this._gradientType = opts.gradientType;

  if (this._r < 1) this._r = Math.round(this._r);
  if (this._g < 1) this._g = Math.round(this._g);
  if (this._b < 1) this._b = Math.round(this._b);

  this._ok = rgb.ok || false;
  
  return this;
}

const tinycolorConstructor = tinycolor as TinyColorConstructor;

tinycolorConstructor.prototype = {
  isDark: function (): boolean {
    return this.getBrightness() < 128;
  },
  isLight: function (): boolean {
    return !this.isDark();
  },
  isValid: function (): boolean {
    return this._ok;
  },
  getOriginalInput: function (): any {
    return this._originalInput;
  },
  getFormat: function (): string {
    return this._format;
  },
  getAlpha: function (): number {
    return this._a;
  },
  getBrightness: function (): number {
    var rgb = this.toRgb();
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  },
  getLuminance: function (): number {
    var rgb = this.toRgb();
    var RsRGB, GsRGB, BsRGB, R, G, B;
    RsRGB = rgb.r / 255;
    GsRGB = rgb.g / 255;
    BsRGB = rgb.b / 255;

    if (RsRGB <= 0.03928) R = RsRGB / 12.92;
    else R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
    if (GsRGB <= 0.03928) G = GsRGB / 12.92;
    else G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
    if (BsRGB <= 0.03928) B = BsRGB / 12.92;
    else B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  },
  setAlpha: function (value: number): TinyColor {
    this._a = boundAlpha(value);
    this._roundA = Math.round(100 * this._a) / 100;
    return this;
  },
  toHsv: function (): HSVColor {
    var hsv = rgbToHsv(this._r, this._g, this._b);
    return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
  },
  toHsvString: function (): string {
    var hsv = rgbToHsv(this._r, this._g, this._b);
    var h = Math.round(hsv.h * 360),
      s = Math.round(hsv.s * 100),
      v = Math.round(hsv.v * 100);
    return this._a == 1
      ? "hsv(" + h + ", " + s + "%, " + v + "%)"
      : "hsva(" + h + ", " + s + "%, " + v + "%, " + this._roundA + ")";
  },
  toHsl: function (): HSLColor {
    var hsl = rgbToHsl(this._r, this._g, this._b);
    return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
  },
  toHslString: function (): string {
    var hsl = rgbToHsl(this._r, this._g, this._b);
    var h = Math.round(hsl.h * 360),
      s = Math.round(hsl.s * 100),
      l = Math.round(hsl.l * 100);
    return this._a == 1
      ? "hsl(" + h + ", " + s + "%, " + l + "%)"
      : "hsla(" + h + ", " + s + "%, " + l + "%, " + this._roundA + ")";
  },
  toHex: function (allow3Char?: boolean): string {
    return rgbToHex(this._r, this._g, this._b, allow3Char);
  },
  toHexString: function (allow3Char?: boolean): string {
    return "#" + this.toHex(allow3Char);
  },
  toHex8: function (allow4Char?: boolean): string {
    return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
  },
  toHex8String: function (allow4Char?: boolean): string {
    return "#" + this.toHex8(allow4Char);
  },
  toRgb: function (): RGBColor {
    return {
      r: Math.round(this._r),
      g: Math.round(this._g),
      b: Math.round(this._b),
      a: this._a,
    };
  },
  toRgbString: function (): string {
    return this._a == 1
      ? "rgb(" +
          Math.round(this._r) +
          ", " +
          Math.round(this._g) +
          ", " +
          Math.round(this._b) +
          ")"
      : "rgba(" +
          Math.round(this._r) +
          ", " +
          Math.round(this._g) +
          ", " +
          Math.round(this._b) +
          ", " +
          this._roundA +
          ")";
  },
  toPercentageRgb: function (): PercentageRGBColor {
    return {
      r: Math.round(bound01(this._r, 255) * 100) + "%",
      g: Math.round(bound01(this._g, 255) * 100) + "%",
      b: Math.round(bound01(this._b, 255) * 100) + "%",
      a: this._a,
    };
  },
  toPercentageRgbString: function (): string {
    return this._a == 1
      ? "rgb(" +
          Math.round(bound01(this._r, 255) * 100) +
          "%, " +
          Math.round(bound01(this._g, 255) * 100) +
          "%, " +
          Math.round(bound01(this._b, 255) * 100) +
          "%)"
      : "rgba(" +
          Math.round(bound01(this._r, 255) * 100) +
          "%, " +
          Math.round(bound01(this._g, 255) * 100) +
          "%, " +
          Math.round(bound01(this._b, 255) * 100) +
          "%, " +
          this._roundA +
          ")";
  },
  toName: function (): string | false {
    if (this._a === 0) {
      return "transparent";
    }

    if (this._a < 1) {
      return false;
    }

    return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
  },
  toFilter: function (secondColor?: any): string {
    var hex8String = "#" + rgbaToArgbHex(this._r, this._g, this._b, this._a);
    var secondHex8String = hex8String;
    var gradientType = this._gradientType ? "GradientType = 1, " : "";

    if (secondColor) {
      var s = tinycolorConstructor(secondColor);
      secondHex8String = "#" + rgbaToArgbHex(s._r, s._g, s._b, s._a);
    }

    return (
      "progid:DXImageTransform.Microsoft.gradient(" +
      gradientType +
      "startColorstr=" +
      hex8String +
      ",endColorstr=" +
      secondHex8String +
      ")"
    );
  },
  toString: function (format?: ColorFormat): string {
    var formatSet = !!format;
    format = format || this._format;

    var formattedString: string | false = false;
    var hasAlpha = this._a < 1 && this._a >= 0;
    var needsAlphaFormat =
      !formatSet &&
      hasAlpha &&
      (format === ColorFormat.HEX ||
        format === ColorFormat.HEX6 ||
        format === ColorFormat.HEX3 ||
        format === ColorFormat.HEX4 ||
        format === ColorFormat.HEX8 ||
        format === ColorFormat.NAME);

    if (needsAlphaFormat) {
      if (format === ColorFormat.NAME && this._a === 0) {
        return this.toName() as string;
      }
      return this.toRgbString();
    }
    if (format === ColorFormat.RGB) {
      formattedString = this.toRgbString();
    }
    if (format === ColorFormat.PRGB) {
      formattedString = this.toPercentageRgbString();
    }
    if (format === ColorFormat.HEX || format === ColorFormat.HEX6) {
      formattedString = this.toHexString();
    }
    if (format === ColorFormat.HEX3) {
      formattedString = this.toHexString(true);
    }
    if (format === ColorFormat.HEX4) {
      formattedString = this.toHex8String(true);
    }
    if (format === ColorFormat.HEX8) {
      formattedString = this.toHex8String();
    }
    if (format === ColorFormat.NAME) {
      formattedString = this.toName();
    }
    if (format === ColorFormat.HSL) {
      formattedString = this.toHslString();
    }
    if (format === ColorFormat.HSV) {
      formattedString = this.toHsvString();
    }

    return formattedString || this.toHexString();
  },
  clone: function (): TinyColor {
    return tinycolorConstructor(this.toString());
  },

  _applyModification: function (fn: Function, args: any[]): TinyColor {
    var color = fn.apply(null, [this].concat([].slice.call(args)));
    this._r = color._r;
    this._g = color._g;
    this._b = color._b;
    this.setAlpha(color._a);
    return this;
  },
  lighten: function (amount?: number): TinyColor {
    return this._applyModification(lighten, arguments);
  },
  brighten: function (amount?: number): TinyColor {
    return this._applyModification(brighten, arguments);
  },
  darken: function (amount?: number): TinyColor {
    return this._applyModification(darken, arguments);
  },
  desaturate: function (amount?: number): TinyColor {
    return this._applyModification(desaturate, arguments);
  },
  saturate: function (amount?: number): TinyColor {
    return this._applyModification(saturate, arguments);
  },
  greyscale: function (): TinyColor {
    return this._applyModification(greyscale, arguments);
  },
  spin: function (amount?: number): TinyColor {
    return this._applyModification(spin, arguments);
  },

  _applyCombination: function (fn: Function, args: any[]): TinyColor | TinyColor[] {
    return fn.apply(null, [this].concat([].slice.call(args)));
  },
  analogous: function (results?: number, slices?: number): TinyColor[] {
    return this._applyCombination(analogous, arguments) as TinyColor[];
  },
  complement: function (): TinyColor {
    return this._applyCombination(complement, arguments) as TinyColor;
  },
  monochromatic: function (results?: number): TinyColor[] {
    return this._applyCombination(monochromatic, arguments) as TinyColor[];
  },
  splitcomplement: function (): TinyColor[] {
    return this._applyCombination(splitcomplement, arguments) as TinyColor[];
  },
  triad: function (): TinyColor[] {
    return this._applyCombination(polyad, [3]) as TinyColor[];
  },
  tetrad: function (): TinyColor[] {
    return this._applyCombination(polyad, [4]) as TinyColor[];
  },
};

tinycolorConstructor.fromRatio = function (color: ColorInput, opts?: TinyColorOptions): TinyColor {
  if (typeof color == "object") {
    var newColor: any = {};
    for (var i in color) {
      if ((color as any).hasOwnProperty(i)) {
        if (i === "a") {
          newColor[i] = (color as any)[i];
        } else {
          newColor[i] = convertToPercentage((color as any)[i]);
        }
      }
    }
    color = newColor;
  }

  return tinycolorConstructor(color, opts);
};

//
//
function inputToRGB(color: ColorInput): ParsedColor {
  var rgb = { r: 0, g: 0, b: 0 };
  var a = 1;
  var s: any = null;
  var v: any = null;
  var l: any = null;
  var ok = false;
  var format: string | false = false;

  if (typeof color == "string") {
    const parsed = stringInputToObject(color);
    if (parsed === false) {
      return {
        ok: false,
        format: "rgb",
        r: 0,
        g: 0,
        b: 0,
        a: 1,
      };
    }
    color = parsed;
  }

  if (typeof color == "object" && color !== null) {
    if (
      isValidCSSUnit((color as any).r) &&
      isValidCSSUnit((color as any).g) &&
      isValidCSSUnit((color as any).b)
    ) {
      rgb = rgbToRgb((color as any).r, (color as any).g, (color as any).b);
      ok = true;
      // Preserve an existing format if provided by the parser (e.g., "name" for 'transparent')
      // otherwise infer based on whether r was specified as a percentage.
      format = (color as any).format || (String((color as any).r).substr(-1) === "%" ? "prgb" : "rgb");
    } else if (
      isValidCSSUnit((color as any).h) &&
      isValidCSSUnit((color as any).s) &&
      isValidCSSUnit((color as any).v)
    ) {
      s = convertToPercentage((color as any).s);
      v = convertToPercentage((color as any).v);
      rgb = hsvToRgb((color as any).h, s, v);
      ok = true;
      format = ColorFormat.HSV;
    } else if (
      isValidCSSUnit((color as any).h) &&
      isValidCSSUnit((color as any).s) &&
      isValidCSSUnit((color as any).l)
    ) {
      s = convertToPercentage((color as any).s);
      l = convertToPercentage((color as any).l);
      rgb = hslToRgb((color as any).h, s, l);
      ok = true;
      format = ColorFormat.HSL;
    }

    if ((color as any).hasOwnProperty("a")) {
      a = (color as any).a;
    }
  }

  a = boundAlpha(a);

  return {
    ok: ok,
    format: format || "rgb",
    r: Math.min(255, Math.max(rgb.r, 0)),
    g: Math.min(255, Math.max(rgb.g, 0)),
    b: Math.min(255, Math.max(rgb.b, 0)),
    a: a,
  };
}


function rgbToRgb(r: any, g: any, b: any): { r: number; g: number; b: number } {
  return {
    r: bound01(r, 255) * 255,
    g: bound01(g, 255) * 255,
    b: bound01(b, 255) * 255,
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r = bound01(r, 255);
  g = bound01(g, 255);
  b = bound01(b, 255);

  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h: number, s: number, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
        break;
    }

    h /= 6;
  }

  return { h: h, s: s, l: l };
}

function hslToRgb(h: any, s: any, l: any): { r: number; g: number; b: number } {
  var r: number, g: number, b: number;

  h = bound01(h, 360);
  s = bound01(s, 100);
  l = bound01(l, 100);

  function hue2rgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r = bound01(r, 255);
  g = bound01(g, 255);
  b = bound01(b, 255);

  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h: number, s: number, v = max;

  var d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
        break;
    }
    h /= 6;
  }

  return { h: h, s: s, v: v };
}

function hsvToRgb(h: any, s: any, v: any): { r: number; g: number; b: number } {
  h = bound01(h, 360) * 6;
  s = bound01(s, 100);
  v = bound01(v, 100);

  var i = Math.floor(h),
    f = h - i,
    p = v * (1 - s),
    q = v * (1 - f * s),
    t = v * (1 - (1 - f) * s),
    mod = i % 6,
    r = [v, q, p, p, t, v][mod],
    g = [t, v, v, q, p, p][mod],
    b = [p, p, t, v, v, q][mod];

  return { r: r * 255, g: g * 255, b: b * 255 };
}

function rgbToHex(r: number, g: number, b: number, allow3Char?: boolean): string {
  var hex = [
    pad2(Math.round(r).toString(16)),
    pad2(Math.round(g).toString(16)),
    pad2(Math.round(b).toString(16)),
  ];

  if (
    allow3Char &&
    hex[0].charAt(0) == hex[0].charAt(1) &&
    hex[1].charAt(0) == hex[1].charAt(1) &&
    hex[2].charAt(0) == hex[2].charAt(1)
  ) {
    return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
  }

  return hex.join("");
}

function rgbaToHex(r: number, g: number, b: number, a: number, allow4Char?: boolean): string {
  var hex = [
    pad2(Math.round(r).toString(16)),
    pad2(Math.round(g).toString(16)),
    pad2(Math.round(b).toString(16)),
    pad2(convertDecimalToHex(a)),
  ];

  if (
    allow4Char &&
    hex[0].charAt(0) == hex[0].charAt(1) &&
    hex[1].charAt(0) == hex[1].charAt(1) &&
    hex[2].charAt(0) == hex[2].charAt(1) &&
    hex[3].charAt(0) == hex[3].charAt(1)
  ) {
    return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
  }

  return hex.join("");
}

function rgbaToArgbHex(r: number, g: number, b: number, a: number): string {
  var hex = [
    pad2(convertDecimalToHex(a)),
    pad2(Math.round(r).toString(16)),
    pad2(Math.round(g).toString(16)),
    pad2(Math.round(b).toString(16)),
  ];

  return hex.join("");
}

tinycolorConstructor.equals = function (color1: ColorInput, color2: ColorInput): boolean {
  if (!color1 || !color2) return false;
  return tinycolorConstructor(color1).toRgbString() == tinycolorConstructor(color2).toRgbString();
};

tinycolorConstructor.random = function (): TinyColor {
  return tinycolorConstructor.fromRatio({
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
    a: 1,
  });
};


function desaturate(color: TinyColor, amount?: number): TinyColor {
  amount = amount === 0 ? 0 : amount || 10;
  var hsl = tinycolorConstructor(color).toHsl();
  hsl.s -= amount / 100;
  hsl.s = clamp01(hsl.s);
  return tinycolorConstructor(hsl);
}

function saturate(color: TinyColor, amount?: number): TinyColor {
  amount = amount === 0 ? 0 : amount || 10;
  var hsl = tinycolorConstructor(color).toHsl();
  hsl.s += amount / 100;
  hsl.s = clamp01(hsl.s);
  return tinycolorConstructor(hsl);
}

function greyscale(color: TinyColor): TinyColor {
  return tinycolorConstructor(color).desaturate(100);
}

function lighten(color: TinyColor, amount?: number): TinyColor {
  amount = amount === 0 ? 0 : amount || 10;
  var hsl = tinycolorConstructor(color).toHsl();
  hsl.l += amount / 100;
  hsl.l = clamp01(hsl.l);
  return tinycolorConstructor(hsl);
}

function brighten(color: TinyColor, amount?: number): TinyColor {
  amount = amount === 0 ? 0 : amount || 10;
  var rgb = tinycolorConstructor(color).toRgb();
  rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * -(amount / 100))));
  rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * -(amount / 100))));
  rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * -(amount / 100))));
  return tinycolorConstructor(rgb);
}

function darken(color: TinyColor, amount?: number): TinyColor {
  amount = amount === 0 ? 0 : amount || 10;
  var hsl = tinycolorConstructor(color).toHsl();
  hsl.l -= amount / 100;
  hsl.l = clamp01(hsl.l);
  return tinycolorConstructor(hsl);
}

function spin(color: TinyColor, amount?: number): TinyColor {
  var hsl = tinycolorConstructor(color).toHsl();
  var hue = (hsl.h + (amount || 0)) % 360;
  hsl.h = hue < 0 ? 360 + hue : hue;
  return tinycolorConstructor(hsl);
}


function complement(color: TinyColor): TinyColor {
  var hsl = tinycolorConstructor(color).toHsl();
  hsl.h = (hsl.h + 180) % 360;
  return tinycolorConstructor(hsl);
}

function polyad(color: TinyColor, number: number): TinyColor[] {
  if (isNaN(number) || number <= 0) {
    throw new Error("Argument to polyad must be a positive number");
  }
  var hsl = tinycolorConstructor(color).toHsl();
  var result = [tinycolorConstructor(color)];
  var step = 360 / number;
  for (var i = 1; i < number; i++) {
    result.push(tinycolorConstructor({ h: (hsl.h + i * step) % 360, s: hsl.s, l: hsl.l, a: hsl.a }));
  }

  return result;
}

function splitcomplement(color: TinyColor): TinyColor[] {
  var hsl = tinycolorConstructor(color).toHsl();
  var h = hsl.h;
  return [
    tinycolorConstructor(color),
    tinycolorConstructor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l, a: hsl.a }),
    tinycolorConstructor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l, a: hsl.a }),
  ];
}

function analogous(color: TinyColor, results?: number, slices?: number): TinyColor[] {
  results = results || 6;
  slices = slices || 30;

  var hsl = tinycolorConstructor(color).toHsl();
  var part = 360 / slices;
  var ret = [tinycolorConstructor(color)];

  for (hsl.h = (hsl.h - ((part * results) >> 1) + 720) % 360; --results; ) {
    hsl.h = (hsl.h + part) % 360;
    ret.push(tinycolorConstructor(hsl));
  }
  return ret;
}

function monochromatic(color: TinyColor, results?: number): TinyColor[] {
  results = results || 6;
  var hsv = tinycolorConstructor(color).toHsv();
  var h = hsv.h,
    s = hsv.s,
    v = hsv.v;
  var ret = [];
  var modification = 1 / results;

  while (results--) {
    ret.push(tinycolorConstructor({ h: h, s: s, v: v, a: 1 }));
    v = (v + modification) % 1;
  }

  return ret;
}


tinycolorConstructor.mix = function (color1: ColorInput, color2: ColorInput, amount?: number): TinyColor {
  amount = amount === 0 ? 0 : amount || 50;

  var rgb1 = tinycolorConstructor(color1).toRgb();
  var rgb2 = tinycolorConstructor(color2).toRgb();

  var p = amount / 100;

  var rgba = {
    r: (rgb2.r - rgb1.r) * p + rgb1.r,
    g: (rgb2.g - rgb1.g) * p + rgb1.g,
    b: (rgb2.b - rgb1.b) * p + rgb1.b,
    a: (rgb2.a - rgb1.a) * p + rgb1.a,
  };

  return tinycolorConstructor(rgba);
};


tinycolorConstructor.readability = function (color1: ColorInput, color2: ColorInput): number {
  var c1 = tinycolorConstructor(color1);
  var c2 = tinycolorConstructor(color2);
  return (
    (Math.max(c1.getLuminance(), c2.getLuminance()) + 0.05) /
    (Math.min(c1.getLuminance(), c2.getLuminance()) + 0.05)
  );
};


tinycolorConstructor.isReadable = function (color1: ColorInput, color2: ColorInput, wcag2?: WCAG2Options): boolean {
  var readability = tinycolorConstructor.readability(color1, color2);
  var wcag2Parms: { level: string; size: string }, out: boolean;

  out = false;

  wcag2Parms = validateWCAG2Parms(wcag2);
  switch (wcag2Parms.level + wcag2Parms.size) {
    case "AAsmall":
    case "AAAlarge":
      out = readability >= 4.5;
      break;
    case "AAlarge":
      out = readability >= 3;
      break;
    case "AAAsmall":
      out = readability >= 7;
      break;
  }
  return out;
};

tinycolorConstructor.mostReadable = function (baseColor: ColorInput, colorList: ColorInput[], args?: MostReadableOptions): TinyColor | null {
  var bestColor: TinyColor | null = null;
  var bestScore = 0;
  var readability: number;
  var includeFallbackColors: boolean | undefined, level: string | undefined, size: string | undefined;
  args = args || {};
  includeFallbackColors = args.includeFallbackColors;
  level = args.level;
  size = args.size;

  for (var i = 0; i < colorList.length; i++) {
    readability = tinycolorConstructor.readability(baseColor, colorList[i]);
    if (readability > bestScore) {
      bestScore = readability;
      bestColor = tinycolorConstructor(colorList[i]);
    }
  }

  if (
    bestColor && tinycolorConstructor.isReadable(baseColor, bestColor, {
      level: level as "AA" | "AAA",
      size: size as "small" | "large",
    }) ||
    !includeFallbackColors
  ) {
    return bestColor;
  } else {
    args.includeFallbackColors = false;
    return tinycolorConstructor.mostReadable(baseColor, ["#fff", "#000"], args);
  }
};

var names = (tinycolorConstructor.names = {
  aliceblue: "f0f8ff",
  antiquewhite: "faebd7",
  aqua: "0ff",
  aquamarine: "7fffd4",
  azure: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "000",
  blanchedalmond: "ffebcd",
  blue: "00f",
  blueviolet: "8a2be2",
  brown: "a52a2a",
  burlywood: "deb887",
  burntsienna: "ea7e5d",
  cadetblue: "5f9ea0",
  chartreuse: "7fff00",
  chocolate: "d2691e",
  coral: "ff7f50",
  cornflowerblue: "6495ed",
  cornsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "0ff",
  darkblue: "00008b",
  darkcyan: "008b8b",
  darkgoldenrod: "b8860b",
  darkgray: "a9a9a9",
  darkgreen: "006400",
  darkgrey: "a9a9a9",
  darkkhaki: "bdb76b",
  darkmagenta: "8b008b",
  darkolivegreen: "556b2f",
  darkorange: "ff8c00",
  darkorchid: "9932cc",
  darkred: "8b0000",
  darksalmon: "e9967a",
  darkseagreen: "8fbc8f",
  darkslateblue: "483d8b",
  darkslategray: "2f4f4f",
  darkslategrey: "2f4f4f",
  darkturquoise: "00ced1",
  darkviolet: "9400d3",
  deeppink: "ff1493",
  deepskyblue: "00bfff",
  dimgray: "696969",
  dimgrey: "696969",
  dodgerblue: "1e90ff",
  firebrick: "b22222",
  floralwhite: "fffaf0",
  forestgreen: "228b22",
  fuchsia: "f0f",
  gainsboro: "dcdcdc",
  ghostwhite: "f8f8ff",
  gold: "ffd700",
  goldenrod: "daa520",
  gray: "808080",
  green: "008000",
  greenyellow: "adff2f",
  grey: "808080",
  honeydew: "f0fff0",
  hotpink: "ff69b4",
  indianred: "cd5c5c",
  indigo: "4b0082",
  ivory: "fffff0",
  khaki: "f0e68c",
  lavender: "e6e6fa",
  lavenderblush: "fff0f5",
  lawngreen: "7cfc00",
  lemonchiffon: "fffacd",
  lightblue: "add8e6",
  lightcoral: "f08080",
  lightcyan: "e0ffff",
  lightgoldenrodyellow: "fafad2",
  lightgray: "d3d3d3",
  lightgreen: "90ee90",
  lightgrey: "d3d3d3",
  lightpink: "ffb6c1",
  lightsalmon: "ffa07a",
  lightseagreen: "20b2aa",
  lightskyblue: "87cefa",
  lightslategray: "789",
  lightslategrey: "789",
  lightsteelblue: "b0c4de",
  lightyellow: "ffffe0",
  lime: "0f0",
  limegreen: "32cd32",
  linen: "faf0e6",
  magenta: "f0f",
  maroon: "800000",
  mediumaquamarine: "66cdaa",
  mediumblue: "0000cd",
  mediumorchid: "ba55d3",
  mediumpurple: "9370db",
  mediumseagreen: "3cb371",
  mediumslateblue: "7b68ee",
  mediumspringgreen: "00fa9a",
  mediumturquoise: "48d1cc",
  mediumvioletred: "c71585",
  midnightblue: "191970",
  mintcream: "f5fffa",
  mistyrose: "ffe4e1",
  moccasin: "ffe4b5",
  navajowhite: "ffdead",
  navy: "000080",
  oldlace: "fdf5e6",
  olive: "808000",
  olivedrab: "6b8e23",
  orange: "ffa500",
  orangered: "ff4500",
  orchid: "da70d6",
  palegoldenrod: "eee8aa",
  palegreen: "98fb98",
  paleturquoise: "afeeee",
  palevioletred: "db7093",
  papayawhip: "ffefd5",
  peachpuff: "ffdab9",
  peru: "cd853f",
  pink: "ffc0cb",
  plum: "dda0dd",
  powderblue: "b0e0e6",
  purple: "800080",
  rebeccapurple: "663399",
  red: "f00",
  rosybrown: "bc8f8f",
  royalblue: "4169e1",
  saddlebrown: "8b4513",
  salmon: "fa8072",
  sandybrown: "f4a460",
  seagreen: "2e8b57",
  seashell: "fff5ee",
  sienna: "a0522d",
  silver: "c0c0c0",
  skyblue: "87ceeb",
  slateblue: "6a5acd",
  slategray: "708090",
  slategrey: "708090",
  snow: "fffafa",
  springgreen: "00ff7f",
  steelblue: "4682b4",
  tan: "d2b48c",
  teal: "008080",
  thistle: "d8bfd8",
  tomato: "ff6347",
  turquoise: "40e0d0",
  violet: "ee82ee",
  wheat: "f5deb3",
  white: "fff",
  whitesmoke: "f5f5f5",
  yellow: "ff0",
  yellowgreen: "9acd32",
} as const);

var hexNames = (tinycolorConstructor.hexNames = flip(names));


function flip(o: Record<string, string>): Record<string, string> {
  var flipped: Record<string, string> = {};
  for (var i in o) {
    if (o.hasOwnProperty(i)) {
      flipped[o[i]] = i;
    }
  }
  return flipped;
}

function boundAlpha(a: any): number {
  a = parseFloat(a);

  if (isNaN(a) || a < 0 || a > 1) {
    a = 1;
  }

  return a;
}

function bound01(n: any, max: number): number {
  if (isOnePointZero(n)) n = "100%";

  var processPercent = isPercentage(n);
  n = Math.min(max, Math.max(0, parseFloat(n)));

  if (processPercent) {
    n = parseInt(String(n * max), 10) / 100;
  }

  if (Math.abs(n - max) < 0.000001) {
    return 1;
  }

  return (n % max) / parseFloat(max.toString());
}

function clamp01(val: number): number {
  return Math.min(1, Math.max(0, val));
}

function parseIntFromHex(val: string): number {
  return parseInt(val, 16);
}

function isOnePointZero(n: any): boolean {
  return typeof n == "string" && n.indexOf(".") != -1 && parseFloat(n) === 1;
}

function isPercentage(n: any): boolean {
  return typeof n === "string" && n.indexOf("%") != -1;
}

function pad2(c: string): string {
  return c.length == 1 ? "0" + c : "" + c;
}

function convertToPercentage(n: any): any {
  if (parseFloat(n) <= 1) {
    n = parseFloat(n) * 100 + "%";
  }

  return n;
}

function convertDecimalToHex(d: number): string {
  return Math.round(parseFloat(d.toString()) * 255).toString(16);
}
function convertHexToDecimal(h: string): number {
  return parseIntFromHex(h) / 255;
}

var matchers = (function () {
  var CSS_INTEGER = "[-\\+]?\\d+%?";

  var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

  var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

  var PERMISSIVE_MATCH3 =
    "[\\s|\\(]+(" +
    CSS_UNIT +
    ")[,|\\s]+(" +
    CSS_UNIT +
    ")[,|\\s]+(" +
    CSS_UNIT +
    ")\\s*\\)?";
  var PERMISSIVE_MATCH4 =
    "[\\s|\\(]+(" +
    CSS_UNIT +
    ")[,|\\s]+(" +
    CSS_UNIT +
    ")[,|\\s]+(" +
    CSS_UNIT +
    ")[,|\\s]+(" +
    CSS_UNIT +
    ")\\s*\\)?";

  return {
    CSS_UNIT: new RegExp(CSS_UNIT),
    rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
    rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
    hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
    hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
    hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
    hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
    hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
  };
})();

function isValidCSSUnit(color: any): boolean {
  return !!matchers.CSS_UNIT.exec(color);
}

function stringInputToObject(color: string): ParsedColor | false {
  color = color.replace(trimLeft, "").replace(trimRight, "").toLowerCase();
  var named = false;
  if ((names as any)[color]) {
    color = (names as any)[color];
    named = true;
  } else if (color == "transparent") {
    return { r: 0, g: 0, b: 0, a: 0, format: "name" };
  }

  var match: RegExpExecArray | null;
  if ((match = matchers.rgb.exec(color))) {
    return { r: match[1], g: match[2], b: match[3] };
  }
  if ((match = matchers.rgba.exec(color))) {
    return { r: match[1], g: match[2], b: match[3], a: match[4] };
  }
  if ((match = matchers.hsl.exec(color))) {
    return { h: match[1], s: match[2], l: match[3] };
  }
  if ((match = matchers.hsla.exec(color))) {
    return { h: match[1], s: match[2], l: match[3], a: match[4] };
  }
  if ((match = matchers.hsv.exec(color))) {
    return { h: match[1], s: match[2], v: match[3] };
  }
  if ((match = matchers.hsva.exec(color))) {
    return { h: match[1], s: match[2], v: match[3], a: match[4] };
  }
  if ((match = matchers.hex8.exec(color))) {
    return {
      r: parseIntFromHex(match[1]),
      g: parseIntFromHex(match[2]),
      b: parseIntFromHex(match[3]),
      a: convertHexToDecimal(match[4]),
      format: named ? "name" : "hex8",
    };
  }
  if ((match = matchers.hex6.exec(color))) {
    return {
      r: parseIntFromHex(match[1]),
      g: parseIntFromHex(match[2]),
      b: parseIntFromHex(match[3]),
      format: named ? "name" : "hex",
    };
  }
  if ((match = matchers.hex4.exec(color))) {
    return {
      r: parseIntFromHex(match[1] + "" + match[1]),
      g: parseIntFromHex(match[2] + "" + match[2]),
      b: parseIntFromHex(match[3] + "" + match[3]),
      a: convertHexToDecimal(match[4] + "" + match[4]),
      format: named ? "name" : "hex8",
    };
  }
  if ((match = matchers.hex3.exec(color))) {
    return {
      r: parseIntFromHex(match[1] + "" + match[1]),
      g: parseIntFromHex(match[2] + "" + match[2]),
      b: parseIntFromHex(match[3] + "" + match[3]),
      format: named ? "name" : "hex",
    };
  }

  return false;
}

function validateWCAG2Parms(parms?: WCAG2Options): { level: string; size: string } {
  var level: string, size: string;
  parms = parms || { level: "AA", size: "small" };
  level = (parms.level || "AA").toUpperCase();
  size = (parms.size || "small").toLowerCase();
  if (level !== "AA" && level !== "AAA") {
    level = "AA";
  }
  if (size !== "small" && size !== "large") {
    size = "small";
  }
  return { level: level, size: size };
}

export default tinycolorConstructor;
