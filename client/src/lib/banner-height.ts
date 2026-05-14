let _height = 0;
const listeners: ((h: number) => void)[] = [];

export function getBannerHeight() { return _height; }
export function setBannerHeight(h: number) {
  _height = h;
  listeners.forEach(l => l(h));
}
export function onBannerHeight(cb: (h: number) => void) {
  listeners.push(cb);
  return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); };
}
