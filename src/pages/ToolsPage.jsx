import { useState } from 'react'
import Layout from '../components/layout/Layout'
import Tuner from '../components/tuner/Tuner'
import Metronome from '../components/metronome/Metronome'

const TABS = [
  { id: 'tuner',     label: 'チューナー', icon: '🎤' },
  { id: 'metronome', label: 'メトロノーム', icon: '🎵' },
]

export default function ToolsPage() {
  const [tab, setTab] = useState('tuner')

  return (
    <Layout title="ツール">
      {/* タブ */}
      <div className="flex border-b border-gray-200 bg-white">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              tab === id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'tuner' && <Tuner />}
        {tab === 'metronome' && <Metronome />}
      </div>
    </Layout>
  )
}
