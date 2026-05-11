export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-3xl p-10 text-center border border-pink-100">
        
        <h1 className="text-4xl md:text-5xl font-bold text-pink-600 mb-6">
          AchieveX Submissions Closed
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

        <div className="inline-block bg-pink-100 text-pink-700 px-6 py-3 rounded-full font-semibold">
          — Team AchieveX
        </div>
      </div>
    </main>
  )
}
