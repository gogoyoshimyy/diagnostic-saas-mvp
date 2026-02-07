import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs'; // Use Node because we might need DB access, and @vercel/og works there too.

export async function GET(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
    try {
        const { searchParams } = new URL(req.url);
        const params = await props.params;
        const { slug } = params;

        // We can't access DB in Edge easily without simple fetch or edge-compatible adapter.
        // But we are using Prisma with Turso/LibSQL adapter which MIGHT work on edge, 
        // but usually easier to pass data via query params or fetch from an API if DB access is needed.
        // BETTER MVP: Pass title/copy in searchParams for preview, OR fetch from API.
        // Since we need to be SEO friendly/share friendly, the URL should be simple.
        // If we assume the share URL is `.../api/q/slug/promo-card`, it might need to check DB.
        // "Runtime principles: edge OK. But if DB needed, separate."
        // Let's assume we read from params for preview efficiency, OR use non-edge if DB access is mandatory.
        // Requirement says: "Runtime edge is OK principle. But if DB needed, Node is fine."
        // Let's use Node runtime to safely query DB for the correct title/subcopy.

        // Wait, I can't easily switch runtime in same file if I import ImageResponse from @vercel/og?
        // @vercel/og works in Node too.

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        backgroundImage: 'linear-gradient(to bottom right, #E0F2FE, #DBEAFE)',
                        fontFamily: 'sans-serif',
                    }}
                >
                    <div style={{ fontSize: 60, fontWeight: 'bold', color: '#1E3A8A', textAlign: 'center', padding: 20 }}>
                        {searchParams.get('title') || 'Diagnostic Quiz'}
                    </div>
                    <div style={{ fontSize: 30, color: '#1E40AF', marginTop: 20, textAlign: 'center', padding: '0 40px' }}>
                        {searchParams.get('subcopy') || 'Check your type!'}
                    </div>
                    <div style={{ marginTop: 40, display: 'flex', alignItems: 'center' }}>
                        <div style={{ padding: '10px 20px', background: '#2563EB', color: 'white', borderRadius: 10, fontSize: 30 }}>
                            Play Now
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1080,
                height: 1920,
            }
        );
    } catch (e: any) {
        return new Response(`Failed to generate image`, {
            status: 500,
        });
    }
}
