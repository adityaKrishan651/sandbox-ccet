import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page py-16 md:py-20">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            AI-powered civic infrastructure
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600">
            SkillBridge matches volunteers to NGOs using structured compatibility
            scoring, risk prediction, and trust metrics.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/register"
              className="rounded-md bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-14 md:py-16">
        <h2 className="text-lg font-semibold text-slate-900">Why SkillBridge</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          NGOs need reliability; volunteers want clarity before committing. AI
          evaluates compatibility and delivers ranked matches with transparent
          explanations.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="card card-padding">
            <h3 className="text-sm font-semibold text-slate-900">Structured matching</h3>
            <p className="mt-2 text-sm text-slate-600">
              Skills and availability matched against task requirements.
            </p>
          </div>
          <div className="card card-padding">
            <h3 className="text-sm font-semibold text-slate-900">AI evaluation</h3>
            <p className="mt-2 text-sm text-slate-600">
              Compatibility scoring with clear strengths and gaps.
            </p>
          </div>
          <div className="card card-padding">
            <h3 className="text-sm font-semibold text-slate-900">Trust scoring</h3>
            <p className="mt-2 text-sm text-slate-600">
              Impact points and reliability build a verified track record.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
