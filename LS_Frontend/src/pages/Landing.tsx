import { ArrowRight, BadgeCheck, BellRing, Clock3, MapPin, ShieldCheck, Sparkles, Truck, User, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Landing() {
  const isBrowser = typeof window !== 'undefined'
  const token = isBrowser ? localStorage.getItem('access_token') : null
  const userName = isBrowser ? localStorage.getItem('user_name') : null
  const role = isBrowser ? localStorage.getItem('role') : null

  const getDashboardPath = () => {
    if (!token) return '/login'
    switch (role) {
      case 'admin':
        return '/admin/dashboard'
      case 'driver':
        return '/driver/dashboard'
      case 'support_agent':
        return '/agent/dashboard'
      default:
        return '/dashboard'
    }
  }

  const primaryCta = getDashboardPath()
  const secondaryCta = token ? '/track' : '/register'

  const stats = [
    { label: 'On-time deliveries', value: '99.2%', detail: 'tracked last quarter' },
    { label: 'Driver network', value: '1.2k', detail: 'trusted partners' },
    { label: 'Avg. response', value: '<2 min', detail: 'pickup confirmation' },
    { label: 'Cities covered', value: '120+', detail: 'pan-India reach' }
  ]

  const features = [
    {
      title: 'Unified control tower',
      desc: 'Track every shipment, SLA, and exception in a single pane built for operations teams.',
      icon: <ShieldCheck className="w-5 h-5 text-primary" />
    },
    {
      title: 'Real-time visibility',
      desc: 'Live status, proof-of-delivery moments, and proactive alerts for shippers and customers.',
      icon: <BellRing className="w-5 h-5 text-primary" />
    },
    {
      title: 'Smart pricing',
      desc: 'Distance + weight slabs with transparent surcharges so finance never wonders “how”.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Role-ready access',
      desc: 'Purpose-built flows for admins, shippers, and drivers with least clicks to done.',
      icon: <Users className="w-5 h-5 text-primary" />
    }
  ]

  const roles = [
    {
      title: 'For Shippers',
      bullets: ['Book in under a minute', 'Instant price estimates', 'Live ETA + customer updates'],
      accent: 'from-primary/10 to-blue-100 dark:from-primary/10 dark:to-slate-800',
      cta: token ? '/new-delivery' : '/register'
    },
    {
      title: 'For Drivers',
      bullets: ['Clear assignment queue', 'Status updates in two taps', 'Payout clarity per job'],
      accent: 'from-green-50 to-emerald-100 dark:from-emerald-900/30 dark:to-slate-900',
      cta: token ? '/driver/dashboard' : '/login'
    },
    {
      title: 'For Admins',
      bullets: ['Network-wide visibility', 'Exception handling in one view', 'Usage and SLA insights'],
      accent: 'from-amber-50 to-orange-100 dark:from-amber-900/30 dark:to-slate-900',
      cta: token ? '/admin/deliveries' : '/login'
    }
  ]

  const steps = [
    { title: 'Create', detail: 'Book a delivery with pickup & drop in seconds.' },
    { title: 'Assign', detail: 'Auto-assign to best-fit driver or pick manually.' },
    { title: 'Track', detail: 'Realtime status + notifications to every stakeholder.' },
    { title: 'Deliver', detail: 'Proof captured, charges settled, customer informed.' }
  ]

  return (
    <div className="min-h-screen bg-bg text-textPrimary">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-10 w-80 h-80 bg-primary/10 blur-3xl" />
          <div className="absolute top-10 right-0 w-96 h-96 bg-emerald-400/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-10 pb-16 md:pt-16 md:pb-24">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
                  <Sparkles className="w-4 h-4" /> Smart logistics for every role
                </span>
                {token && userName && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border-2 border-gray-100 dark:border-gray-800 text-sm font-semibold shadow-sm">
                    <User className="w-4 h-4 text-primary" /> Welcome back, {userName}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Ship, track, and deliver with <span className="text-primary">clarity</span> and <span className="text-primary">speed</span>.
              </h1>
              <p className="text-lg text-textSecondary max-w-2xl">
                LogiShift unifies shippers, drivers, and admins into one responsive workspace. Book deliveries in seconds, keep customers informed, and resolve issues before they become escalations.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={primaryCta}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:translate-y-[1px] transition-all"
                >
                  {token ? 'Open dashboard' : 'Login to continue'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to={secondaryCta}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-textPrimary font-semibold hover:border-primary hover:bg-primary/5 transition-all"
                >
                  {token ? 'Track a delivery' : 'Create an account'}
                </Link>
                {!token && (
                  <Link to="/track" className="text-sm text-primary underline underline-offset-4 font-semibold">
                    Track a delivery without logging in
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-surface p-4 shadow-sm">
                    <p className="text-xs uppercase text-textSecondary tracking-wide">{item.label}</p>
                    <p className="text-2xl font-bold mt-1">{item.value}</p>
                    <p className="text-xs text-textSecondary mt-1">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/15 via-blue-500/5 to-emerald-400/10 blur-2xl" />
              <div className="relative rounded-3xl border-2 border-gray-100 dark:border-gray-800 bg-surface shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-textSecondary">Next pickup</p>
                    <p className="text-lg font-semibold">Warehouse → Connaught Place</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold">
                    <BadgeCheck className="w-4 h-4" /> SLA locked
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-primary/5 p-3">
                    <p className="text-textSecondary">ETA</p>
                    <p className="text-lg font-semibold">42 mins</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/5 p-3">
                    <p className="text-textSecondary">Distance</p>
                    <p className="text-lg font-semibold">18.4 km</p>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-textSecondary">Pickup</p>
                      <p className="font-semibold">Sector 62, Noida</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-textSecondary">Drop</p>
                      <p className="font-semibold">Connaught Place, New Delhi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-orange-500" />
                    <p className="font-semibold">Live status: Out for delivery</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-4 py-3 text-white">
                  <div>
                    <p className="text-sm text-white/80">Ready to move faster?</p>
                    <p className="font-semibold">Book and track without leaving this screen.</p>
                  </div>
                  <Link
                    to={token ? '/new-delivery' : '/register'}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white/15 rounded-lg font-semibold hover:bg-white/25 transition"
                  >
                    Get started <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 pb-16 space-y-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-[2px] bg-primary" />
          <p className="text-sm uppercase tracking-[0.2em] text-textSecondary">Why teams pick LogiShift</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feat) => (
            <div key={feat.title} className="rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-surface p-5 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-semibold">{feat.title}</h3>
              </div>
              <p className="text-textSecondary mt-3 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface border-y-2 border-gray-100 dark:border-gray-800 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-textSecondary">Built for every role</p>
              <h2 className="text-2xl font-bold">Tailored workspaces that keep people in flow</h2>
            </div>
            <Link
              to={token ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold shadow-md shadow-primary/20"
            >
              {token ? 'Open dashboard' : 'Start now'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {roles.map((role) => (
              <div key={role.title} className={`rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gradient-to-br ${role.accent} p-5 shadow-sm`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{role.title}</h3>
                  <ArrowRight className="w-4 h-4 text-textSecondary" />
                </div>
                <ul className="mt-4 space-y-2 text-sm text-textSecondary">
                  {role.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={role.cta}
                  className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-primary hover:underline"
                >
                  View workspace <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14 space-y-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-[2px] bg-primary" />
          <p className="text-sm uppercase tracking-[0.2em] text-textSecondary">How it flows</p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">{index + 1}</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold mt-3">{step.title}</h3>
              <p className="text-sm text-textSecondary mt-2 leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-primary to-blue-700 text-white p-8 md:p-10 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-white/80">Go live now</p>
            <h3 className="text-2xl md:text-3xl font-bold leading-tight">Move your deliveries to LogiShift today.</h3>
            <p className="text-white/80">Launch in minutes, invite your team, and keep every stakeholder informed from booking to proof of delivery.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={primaryCta}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-primary font-semibold shadow-lg hover:translate-y-[1px] transition"
            >
              {token ? 'Open dashboard' : 'Login'} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={token ? '/track' : '/register'}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition"
            >
              {token ? 'Track a delivery' : 'Create account'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
