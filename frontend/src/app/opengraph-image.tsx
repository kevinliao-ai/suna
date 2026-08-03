import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AniSora Studio — AI anime video and voice workspace';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '76px',
          background:
            'radial-gradient(circle at 80% 20%, #7c3aed 0, #18181b 36%, #09090b 70%)',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.7 }}>AniSora Studio</div>
        <div
          style={{
            maxWidth: 900,
            marginTop: 28,
            fontSize: 74,
            lineHeight: 1.05,
            fontWeight: 600,
            letterSpacing: '-3px',
          }}
        >
          AI anime video &amp; voice workspace
        </div>
        <div style={{ marginTop: 36, fontSize: 24, opacity: 0.65 }}>
          Projects · Video · Voice · Assets
        </div>
      </div>
    ),
    size,
  );
}
