declare module 'culori' {
  export function formatHex(color: any): string;
  export function parse(color: any): any;
  export function converter(mode: string): (color: any) => any;
  export function differenceCiede2000(c1?: any, c2?: any): any;
  export function differenceEuclidean(mode: string): (c1: any, c2: any) => number;
  export function interpolate(colors: any[], mode?: string): any;
  export type Oklab = any;
  export type Rgb = any;
}
