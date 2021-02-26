export const Charcoal = {
  lighter: '#212127',
  // light: '#1c1b1f',
  light: '#19191B',
  normal: '#121114',
  dark: '#020203',
};

export const Ink = {
  normal: '#ffffff',
  dark: '#a4a4a5',
};

export const Orange = {
  normal: '#e0892b',
  dark: '#794d1f',
};

export const Lavender = {
  normal: '#9995a3',
  dark: '#434252',
};

export const Blue = {
  normal: '#2c59f8',
};

export function toRGBA(hex: string, alpha: number) {
  if (hex.length === 3) {
    hex = `#${hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]}`;
  }

  let r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
      return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
      return "rgb(" + r + ", " + g + ", " + b + ")";
  }
}
