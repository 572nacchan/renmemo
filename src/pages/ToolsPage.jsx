import { useState } from 'react'
import Layout from '../components/layout/Layout'
import Tuner from '../components/tuner/Tuner'
import Metronome from '../components/metronome/Metronome'

const TABS = [
  { id: 'tuner',     label: 'チューナー',  icon: '🎤' },
  { id: 'metronome', label: 'メトロノーム', icon: '🥁' },
]

export default function ToolsPage() {
  const [tab, setTab] = useState('tuner')

  return (
    <Layout title="ツール">
      {/* ピル型タブセレクター */}
      <div className="px-4 pt-3 pb-0 bg-white border-b border-indigo-50">
        <div className="flex bg-indigo-50 rounded-xl p-1 gap-1 max-w-sm mx-auto">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                tab === id
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-indigo-300 hover:text-indigo-500'
              }`}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 max-w-sm mx-auto">
        {tab === 'tuner' && <Tuner />}
        {tab === 'metronome' && <Metronome />}
      </div>
    </Layout>
  )
}
