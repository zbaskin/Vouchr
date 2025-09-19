import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Single-file drop-in replacement for src/pages/LandingPage.tsx
// • Uses Tailwind utility classes (no import needed if Tailwind is configured)
// • Smooth, lightweight animations via Framer Motion
// • Mobile-first, accessible, and dark-mode friendly
// If you don't use Tailwind, you can still copy the structure and inline styles.

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <svg className="absolute inset-x-0 top-0 -z-10 h-[500px] w-full opacity-50" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="url(#g)" d="M0,128L60,149.3C120,171,240,213,360,229.3C480,245,600,235,720,224C840,213,960,203,1080,181.3C1200,160,1320,128,1380,112L1440,96L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0%" stopColor="#a78bfa"/>
              <stop offset="50%" stopColor="#22d3ee"/>
              <stop offset="100%" stopColor="#fb7185"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top nav */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="group inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-fuchsia-500 to-sky-400 shadow-md" />
            <span className="text-lg font-bold tracking-tight">Vouchr</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <a href="#features" className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Features</a>
            <a href="#how" className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">How it works</a>
            <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800">Log in</Link>
            <Link to="/login" className="hidden sm:inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-black dark:bg-white dark:text-zinc-900">Create account</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 pb-16 pt-10 sm:pt-16 md:grid-cols-2 md:gap-12 lg:pt-24">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5}}>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Your movie life, <span className="bg-gradient-to-r from-fuchsia-500 via-sky-400 to-rose-400 bg-clip-text text-transparent">beautifully organized</span>
          </h1>
          <p className="mt-4 max-w-prose text-pretty text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
            Vouchr turns crumpled ticket stubs and fading memories into a living collection. Save screenings, formats, theaters, and notes—then share a profile that actually feels like <em>you</em>.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/login" className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-black dark:bg-white dark:text-zinc-900">
              Get started — it’s free
            </Link>
            <a href="#demo" className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800">
              See a quick demo
            </a>
          </div>
          <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">No spam. You control your collection’s visibility.</div>
        </motion.div>

        {/* Mockup card */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6, delay:0.1}} className="relative">
          <div className="relative isolate mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 bg-white/60 p-4 shadow-2xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 dark:from-zinc-900 dark:to-zinc-900/60">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">Your Ticket Collection</div>
                <div className="text-xs text-zinc-500">Sample</div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({length:6}).map((_, i) => (
                  <div key={i} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-5 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                      <span className="text-xs text-zinc-500">IMAX</span>
                    </div>
                    <div className="mt-2 text-sm font-medium">Movie Title #{i+1}</div>
                    <div className="text-xs text-zinc-500">AMC Lincoln Square · 07/12/2024</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Built for cinephiles, designed for humans</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">Everything you need to capture screenings and relive them anytime.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, idx) => (
            <motion.div key={idx} initial={{opacity:0, y:10}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.35, delay:idx*0.05}} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-3 h-9 w-9 rounded-lg bg-gradient-to-br from-fuchsia-500 to-sky-400" />
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Three steps to your first collection</h2>
            <ol className="mt-4 space-y-3">
              {howItWorks.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">{i+1}</span>
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex gap-3">
              <Link to="/login" className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-zinc-900">Start now</Link>
              <a href="#demo" className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800">Watch demo</a>
            </div>
          </div>
          <div id="demo" className="aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200 bg-black/90 shadow-lg ring-1 ring-zinc-200 dark:border-zinc-800 dark:ring-zinc-800">
            {/* Replace with actual video or screenshot */}
            <div className="flex h-full items-center justify-center text-zinc-300">Demo video placeholder</div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-10">
          <blockquote className="text-balance text-center text-lg italic text-zinc-700 dark:text-zinc-300">
            “Finally, a clean way to remember every screening — formats, theaters, the whole story. My Letterboxd looks great; my Vouchr feels personal.”
          </blockquote>
          <div className="mt-3 text-center text-sm text-zinc-500">— Early Vouchr user</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white/70 py-8 text-sm dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="text-zinc-500">© {new Date().getFullYear()} Vouchr</div>
          <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-300">
            <a className="hover:underline" href="#">Privacy</a>
            <a className="hover:underline" href="#">Terms</a>
            <Link className="font-semibold hover:underline" to="/login">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: 'Smart ticket fields',
    desc: 'Record title, theater, date, format (IMAX, Dolby, 70mm), seat, and custom notes without friction.',
  },
  {
    title: 'Shareable profiles',
    desc: 'Make your Ticket Collection public or private. Send a clean link that looks great anywhere.',
  },
  {
    title: 'Rewatches & trends',
    desc: 'See patterns in your viewing — directors, formats, theaters — and relive the highlights.',
  },
  {
    title: 'Fast add flow',
    desc: 'Optimized form for adding tickets in seconds, from your phone or desktop.',
  },
  {
    title: 'Own your data',
    desc: 'Export any time. You decide what’s visible, and what stays just for you.',
  },
  {
    title: 'Social coming soon',
    desc: 'Follow friends, see when they add tickets, and tag who you watched with.',
  },
]

const howItWorks = [
  {
    title: 'Create your account',
    desc: 'Use email or your preferred login. No fuss — you can stay private.',
  },
  {
    title: 'Add a few tickets',
    desc: 'Log a couple of recent screenings to see your Collection come to life.',
  },
  {
    title: 'Share (or don’t)',
    desc: 'Make your profile public to show friends, or keep it personal for your records.',
  },
]
