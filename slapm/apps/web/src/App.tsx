import './index.css'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">SLA</h1>
        <p className="text-slate-400">SLA Pharma Project Management</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-slate-800 text-blue-300 px-4 py-2 rounded-full text-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          React app loaded — building features...
        </div>
      </div>
    </div>
  )
}
