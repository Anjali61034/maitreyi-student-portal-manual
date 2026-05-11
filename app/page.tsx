export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full bg-green-50/90 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-3xl p-10 text-center border border-green-100 scale-[1.02] transition-all duration-300">

        <h1 className="text-4xl md:text-5xl font-bold text-green-600 mb-6 leading-tight">
          AchieveX Submissions <br />
          Closed
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          Thank you to all students for submitting your achievements and participating in the AchieveX portal.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          The submission deadline is now officially over.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          We appreciate everyone’s efforts and enthusiasm.
          Looking forward to seeing you all on Annual Day 🎉
        </p>

        <div className="inline-block bg-green-100 text-green-600 px-6 py-3 rounded-full font-semibold shadow-sm">
          — Team AchieveX
        </div>

      </div>
    </main>
  )
}
