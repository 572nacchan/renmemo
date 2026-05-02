import { useState, useEffect, useRef, useCallback } from 'react'

const TIME_SIGS = [
  { label: '2/4', beats: 2 },
  { label: '3/4', beats: 3 },
  { label: '4/4', beats: 4 },
  { label: '6/8', beats: 6 },
]

const BPM_MIN = 40
const BPM_MAX = 240
const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD_SEC = 0.1

function scheduleClick(ctx, time, isAccent) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = isAccent ? 1200 : 900
  gain.gain.setValueAtTime(isAccent ? 0.9 : 0.5, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06)
  osc.start(time)
  osc.stop(time + 0.07)
}

export default function Metronome() {
  const [bpm, setBpm] = useState(120)
  const [timeSig, setTimeSig] = useState(TIME_SIGS[2]) // 4/4
  const [active, setActive] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0) // 0-indexed, 表示用

  const ctxRef = useRef(null)
  const timerRef = useRef(null)
  const nextTimeRef = useRef(0)
  const beatRef = useRef(0)
  const bpmRef = useRef(bpm)
  const timeSigRef = useRef(timeSig)

  bpmRef.current = bpm
  timeSigRef.current = timeSig

  const scheduler = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx) return
    while (nextTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_SEC) {
      const beat = beatRef.current
      scheduleClick(ctx, nextTimeRef.current, beat === 0)
      setCurrentBeat(beat)
      beatRef.current = (beat + 1) % timeSigRef.current.beats
      nextTimeRef.current += 60 / bpmRef.current
    }
  }, [])

  const start = useCallback(async () => {
    const ctx = new AudioContext()
    ctxRef.current = ctx
    await ctx.resume()
    beatRef.current = 0
    nextTimeRef.current = ctx.currentTime + 0.05
    timerRef.current = setInterval(scheduler, LOOKAHEAD_MS)
    setActive(true)
    setCurrentBeat(0)
  }, [scheduler])

  const stop = useCallback(() => {
    clearInterval(timerRef.current)
    ctxRef.current?.close()
    ctxRef.current = null
    setActive(false)
    setCurrentBeat(0)
  }, [])

  useEffect(() => () => stop(), [stop])

  // タップテンポ
  const tapTimesRef = useRef([])
  const handleTap = () => {
    const now = Date.now()
    tapTimesRef.current.push(now)
    if (tapTimesRef.current.length > 4) tapTimesRef.current.shift()
    if (tapTimesRef.current.length >= 2) {
      const diffs = tapTimesRef.current.slice(1).map((t, i) => t - tapTimesRef.current[i])
      const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length
      const newBpm = Math.round(60000 / avg)
      setBpm(Math.max(BPM_MIN, Math.min(BPM_MAX, newBpm)))
    }
  }

  const beats = timeSig.beats

  return (
    <div className="space-y-6">
      {/* 拍子選択 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-medium text-gray-500 mb-2">拍子</p>
        <div className="flex gap-2">
          {TIME_SIGS.map((ts) => (
            <button
              key={ts.label}
              onClick={() => { setTimeSig(ts); beatRef.current = 0; setCurrentBeat(0) }}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                timeSig.label === ts.label
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {ts.label}
            </button>
          ))}
        </div>
      </div>

      {/* BPM */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">BPM</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBpm((v) => Math.max(BPM_MIN, v - 1))}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
            >−</button>
            <input
              type="number" value={bpm} min={BPM_MIN} max={BPM_MAX}
              onChange={(e) => setBpm(Math.max(BPM_MIN, Math.min(BPM_MAX, Number(e.target.value))))}
              className="w-16 text-center text-2xl font-bold text-indigo-700 border-none outline-none"
            />
            <button
              onClick={() => setBpm((v) => Math.min(BPM_MAX, v + 1))}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
            >＋</button>
          </div>
        </div>

        <input
          type="range" min={BPM_MIN} max={BPM_MAX} value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />

        <div className="flex justify-between text-xs text-gray-400">
          <span>Largo 40</span><span>Andante 76</span><span>Allegro 160</span><span>Presto 240</span>
        </div>
      </div>

      {/* ビートインジケーター */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex justify-center gap-3">
          {Array.from({ length: beats }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-75 ${
                active && currentBeat === i
                  ? i === 0
                    ? 'w-10 h-10 bg-pink-500 shadow-lg shadow-pink-200'
                    : 'w-8 h-8 bg-indigo-500 shadow-md shadow-indigo-200'
                  : 'w-7 h-7 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* タップテンポ */}
      <button
        onPointerDown={handleTap}
        className="w-full py-4 rounded-2xl border-2 border-indigo-200 text-indigo-600 font-medium text-sm hover:bg-indigo-50 active:bg-indigo-100 transition-colors select-none"
      >
        👆 タップテンポ
      </button>

      {/* 開始/停止 */}
      <button
        onClick={active ? stop : start}
        className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-md transition-colors ${
          active ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {active ? '⏹ 停止' : '▶ 開始'}
      </button>
    </div>
  )
}
