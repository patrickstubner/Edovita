export interface QrCodeSvgProps {
  readonly size: number;
  readonly path: string;
  readonly label: string;
}

/**
 * Rendert eine lokal erzeugte QR-Code-Matrix rein als React-SVG-Element (kein `innerHTML`,
 * kein `DOMParser`, kein Netzabruf). Nutzt stets dunkle Module auf weissem Hintergrund,
 * damit der QR-Code im Hell- und Dunkelmodus zuverlässig scanbar bleibt.
 */
export function QrCodeSvg({ size, path, label }: QrCodeSvgProps) {
  return (
    <div className="edo-qrbox" data-testid="qr-code-box">
      <svg
        className="edo-qr-svg"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={label}
        shapeRendering="crispEdges"
      >
        <rect x="0" y="0" width={size} height={size} fill="#FFFFFF" />
        <path d={path} fill="#14211F" />
      </svg>
    </div>
  );
}
