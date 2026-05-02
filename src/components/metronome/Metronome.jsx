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

const BPM_LABEL = (bpm) => {
  if (bpm < 60)  return 'Largo'
  if (bpm < 76)  return 'Adagio'
  if (bpm < 108) return 'Andante'
  if (bpm < 120) return 'Moderato'
  if (bpm < 156) return 'Allegro'
  if (bpm < 200) return 'Presto'
  return 'Prestissimo'
}

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
  const [timeSig, setTimeSig] = useState(TIME_SIGS[2])
  const [active, setActive] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(-1)

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
    setCurrentBeat(-1)
  }, [])

  useEffect(() => () => stop(), [stop])

  const tapTimesRef = useRef([])
  const handleTap = () => {
    const now = Date.now()
    tapTimesRef.current.push(now)
    if (tapTimesRef.current.length > 4) tapTimesRef.current.shift()
    if (tapTimesRef.current.length >= 2) {
      const diffs = tapTimesRef.current.slice(1).map((t, i) => t - tapTimesRef.current[i])
      const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length
      setBpm(Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(60000 / avg))))
    }
  }

  return (
    <div className="space-y-4">
      {/* 拍子選択 */}
      <div className="flex gap-2">
        {TIME_SIGS.map((ts) => (
          <button
            key={ts.label}
            onClick={() => { setTimeSig(ts); beatRef.current = 0; setCurrentBeat(-1) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              timeSig.label === ts.label
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-400 hover:text-indigo-500 shadow-sm'
            }`}
          >
            {ts.label}
          </button>
        ))}
      </div>

      {/* BPMメインカード */}
      <div className="bg-indigo-950 rounded-3xl p-6 shadow-xl">
        {/* ビートインジケーター */}
        <div className="flex justify-center gap-3 mb-6">
          {Array.from({ length: timeSig.beats }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                active && currentBeat === i
                  ? i === 0
                    ? 'w-10 h-10 bg-rose-400 shadow-lg shadow-rose-500/50 scale-110'
                    : 'w-9 h-9 bg-indigo-400 shadow-md shadow-indigo-400/50 scale-105'
                  : 'w-7 h-7 bg-indigo-900'
              }`}
              style={{ transitionDuration: active && currentBeat === i ? '30ms' : '200ms' }}
            />
          ))}
        </div>

        {/* BPM数字 */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <button
            onClick={() => setBpm((v) => Math.max(BPM_MIN, v - 1))}
            onPointerDown={(e) => { e.currentTarget._iv = setInterval(() => setBpm((v) => Math.max(BPM_MIN, v - 1)), 80) }}
            onPointerUp={(e) => clearInterval(e.currentTarget._iv)}
            onPointerLeave={(e) => clearInterval(e.currentTarget._iv)}
            className="w-11 h-11 rounded-full bg-indigo-900 hover:bg-indigo-800 text-indigo-300 text-xl font-bold transition-colors active:scale-90 select-none"
          >
            −
          </button>
          <div className="text-center w-32">
            <input
              type="number" value={bpm} min={BPM_MIN} max={BPM_MAX}
              onChange={(e) => setBpm(Math.max(BPM_MIN, Math.min(BPM_MAX, Number(e.target.value))))}
              className="w-full text-center text-6xl font-black text-white bg-transparent border-none outline-none leading-none"
            />
            <p className="text-indigo-400 text-xs font-medium mt-1">{BPM_LABEL(bpm)}</p>
          </div>
          <button
            onClick={() => setBpm((v) => Math.min(BPM_MAX, v + 1))}
            onPointerDown={(e) => { e.currentTarget._iv = setInterval(() => setBpm((v) => Math.min(BPM_MAX, v + 1)), 80) }}
            onPointerUp={(e) => clearInterval(e.currentTarget._iv)}
            onPointerLeave={(e) => clearInterval(e.currentTarget._iv)}
            className="w-11 h-11 rounded-full bg-indigo-900 hover:bg-indigo-800 text-indigo-300 text-xl font-bold transition-colors active:scale-90 select-none"
          >
            ＋
          </button>
        </div>

        {/* スライダー */}
        <input
          type="range" min={BPM_MIN} max={BPM_MAX} value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full accent-indigo-400 mt-4"
        />
        <div className="flex justify-between text-[10px] text-indigo-700 font-medium mt-1 px-0.5">
          <span>40</span><span>Andante</span><span>Allegro</span><span>240</span>
        </div>
      </div>

      {/* タップテンポ + 開始/停止 */}
      <div className="flex gap-3">
        <button
          onPointerDown={handleTap}
          className="flex-1 py-4 rounded-2xl border-2 border-indigo-200 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 active:bg-indigo-100 active:scale-95 transition-all select-none"
        >
          👆 タップ
        </button>
        <button
          onClick={active ? stop : start}
          className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-md transition-all active:scale-95 ${
            active ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {active ? '⏹ 停止' : '▶ 開始'}
        </button>
      </div>
    </div>
  )
}
