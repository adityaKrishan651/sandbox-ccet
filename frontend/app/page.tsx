import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="container-page text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Connect skills with impact
          </h1>
          <p className="mt-4 text-xl text-slate-600">
            AI-powered civic infrastructure for volunteer–NGO matching
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-2xl font-bold text-slate-900">
          Why SkillBridge?
        </h2>
        <p className="mt-4 max-w-2xl text-slate-600">
          NGOs struggle to find skilled volunteers; volunteers struggle to find
          meaningful work. SkillBridge uses AI to evaluate compatibility between
          your skills, availability, and impact goals—delivering ranked matches
          with trust scores and transparent explanations.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="font-semibold text-slate-900">Structured matching</h3>
            <p className="mt-2 text-sm text-slate-600">
              Skills and availability are matched against task requirements for
              precise fit.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="font-semibold text-slate-900">AI evaluation</h3>
            <p className="mt-2 text-sm text-slate-600">
              Gemini AI scores compatibility and explains strengths and gaps.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="font-semibold text-slate-900">Trust scoring</h3>
            <p className="mt-2 text-sm text-slate-600">
              Impact points and reliability scores build a verified track record.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
