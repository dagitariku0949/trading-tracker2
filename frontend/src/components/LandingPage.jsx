export default function LandingPage({ onEnter, onNavigate }) {
  const handleCardClick = (tab) => {
    onNavigate(tab)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Logo/Icon */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-block p-6 bg-emerald-500/20 rounded-full backdrop-blur-sm border border-emerald-500/30">
            <svg className="w-16 h-16 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {/* Main title */}
        <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in-up">
          <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Trade with Discipline
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-300 mb-12 animate-fade-in-up delay-200">
          Master your trading journey with precision, analytics, and control
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in-up delay-300">
          <button
            onClick={() => handleCardClick('trades')}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 hover:border-emerald-500/50 hover:bg-slate-800/70 transition transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">Track Every Trade</h3>
            <p className="text-sm text-slate-400">Record and analyze your trading performance with detailed metrics</p>
          </button>
          
          <button
            onClick={() => handleCardClick('overview')}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 hover:border-emerald-500/50 hover:bg-slate-800/70 transition transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">Confluence Analysis</h3>
            <p className="text-sm text-slate-400">Evaluate trade setups across multiple timeframes</p>
          </button>
          
          <button
            onClick={() => handleCardClick('analytics')}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 hover:border-emerald-500/50 hover:bg-slate-800/70 transition transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-3">📈</div>
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">Advanced Analytics</h3>
            <p className="text-sm text-slate-400">Visualize your equity curve and performance metrics</p>
          </button>

          <button
            onClick={() => handleCardClick('learning')}
            className="bg-gradient-to-br from-blue-800/50 to-purple-800/50 backdrop-blur-sm border border-blue-500/50 rounded-lg p-6 hover:border-blue-400/70 hover:from-blue-800/70 hover:to-purple-800/70 transition transform hover:scale-105 text-left relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">NEW</div>
            <div className="text-3xl mb-3">👨‍🏫</div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Learn with Dagim Tariku</h3>
            <p className="text-sm text-slate-400">Access exclusive courses, videos, and trading resources</p>
          </button>
        </div>

        {/* CTA Button */}
        <button
          onClick={onEnter}
          className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-12 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-500/50 animate-fade-in-up delay-500"
        >
          <span>Enter Dashboard</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Bottom text */}
        <p className="mt-8 text-sm text-slate-500 animate-fade-in delay-700">
          Professional trading journal for serious traders
        </p>
      </div>
    </div>
  )
}
