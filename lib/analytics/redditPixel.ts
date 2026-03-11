declare global {
  interface Window {
    rdt?: (...args: unknown[]) => void;
    redditNormalizeEmail?: (email: string) => string;
  }
}

export const PIXEL_ID =
  process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID || "a2_iix54zm8kzmc";

export const REDDIT_PIXEL = `!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js?pixel_id=${PIXEL_ID}",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','${PIXEL_ID}');rdt('track', 'PageVisit');`;

export function redditInit(email: string) {
  if (typeof window === "undefined") return;
  if (!window.rdt) return;

  window.rdt("init", PIXEL_ID, {
    email: window.redditNormalizeEmail?.(email) || email,
  });
}

export function redditTrack(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!window.rdt) return;

  window.rdt("track", event, data);
}
