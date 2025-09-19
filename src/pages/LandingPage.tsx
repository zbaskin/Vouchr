import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <section style={{ maxWidth: 900, textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '0.5rem' }}>
                Vouchr
            </h1>
            <p style={{ fontSize: '1.125rem', opacity: 0.8, marginBottom: '2rem' }}>
                Catalog every film you’ve seen. Share your Ticket Collection. Relive your movie life.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
                to="/login"
                style={{
                padding: '0.875rem 1.25rem',
                borderRadius: 12,
                fontWeight: 600,
                textDecoration: 'none',
                background: 'black',
                color: 'white',
                }}
            >
                Log in / Create account
            </Link>

            <a
                href="#learn-more"
                style={{
                padding: '0.875rem 1.25rem',
                borderRadius: 12,
                fontWeight: 600,
                textDecoration: 'none',
                background: '#f2f2f2',
                color: '#111',
                }}
            >
                Learn more
            </a>
            </div>

            <div id="learn-more" style={{ marginTop: '3rem', textAlign: 'left' }}>
            <h2>What you can do</h2>
            <ul style={{ lineHeight: 1.8 }}>
                <li>Save tickets with dates, theaters, formats, and notes</li>
                <li>Track rewatches and favorites</li>
                <li>Show off your Collection on your profile</li>
                <li>More social features coming soon (feeds, tagging)</li>
            </ul>
            </div>
        </section>
        </main>
    );
}
