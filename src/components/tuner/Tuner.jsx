import { useState, useEffect, useRef, useCallback } from 'react'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const A4_MIDI = 69
const FREQ_ALPHA = 0.08
const CENTS_ALPHA = 0.06
const STABLE_FRAMES = 4
const FRAME_INTERVAL = 33
const RMS_THRESHOLD = 0.015
const CORR_THRESHOLD = 0.92
const CENT_MAX = 50

function freqToNoteInfo(freq, a4) {
  if (!freq || freq <= 0) return null
  const semitones = 12 * Math.log2(freq / a4) + A4_MIDI
  const midi = Math.round(semitones)
  const cents = Math.round((semitones - midi) * 100)
  const octave = Math.floor(midi / 12) - 1
  const name = NOTE_NAMES[((midi % 12) + 12) % 12]
  return { name, octave, cents, freq: freq.toFixed(1) }
}

function detectPitch(buffer, sampleRate) {
  const SIZE = buffer.length
  const MAX_SAMPLES = Math.floor(SIZE / 2)
  let bestOffset = -1
  let bestCorr = 0
  let lastCorr = 1
  let foundGoodCorr = false
  const corr = new Float32Array(MAX_SAMPLES)
  for (let i = 0; i < MAX_SAMPLES; i++) {
    let c = 0
    for (let j = 0; j < MAX_SAMPLES; j++) c += buffer[j] * buffer[j + i]
    corr[i] = c
  }
  for (let i = 1; i < MAX_SAMPLES; i++) {
    const normalized = corr[i] / corr[0]
    if (normalized > CORR_THRESHOLD && normalized > lastCorr) {
      foundGoodCorr = true
      if (normalized > bestCorr) { bestCorr = normalized; bestOffset = i }
    } else if (foundGoodCorr) break
    lastCorr = normalized
  }
  if (!foundGoodCorr || bestOffset === -1) return null
  const shift =
    bestOffset > 0 && bestOffset < MAX_SAMPLES - 1
      ? (corr[bestOffset + 1] - corr[bestOffset - 1]) /
        (2 * (2 * corr[bestOffset] - corr[bestOffset - 1] - corr[bestOffset + 1]))
      : 0
  return { freq: sampleRate / (bestOffset + shift) }
}

export default function Tuner() {
  const [a4, setA4] = useState(442)
  const [active, setActive] = useState(false)
  const [noteInfo, setNoteInfo] = useState(null)
  const [error, setError] = useState('')

  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const smoothedFreqRef = useRef(null)
  const noteHistoryRef = useRef([])
  const smoothedCentsRef = useRef(0)
  const lastFrameTimeRef = useRef(0)

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    analyserRef.current = null
    streamRef.current = null
    smoothedFreqRef.current = null
    noteHistoryRef.current = []
    setActive(false)
    setNoteInfo(null)
  }, [])

  const start = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyserRef.current = analyser
      ctx.createMediaStreamSource(stream).connect(analyser)
      const buf = new Float32Array(analyser.fftSize)
      const loop = (timestamp) => {
        rafRef.current = requestAnimationFrame(loop)
        if (timestamp - lastFrameTimeRef.current < FRAME_INTERVAL) return
        lastFrameTimeRef.current = timestamp
        analyser.getFloatTimeDomainData(buf)
        const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length)
        if (rms < RMS_THRESHOLD) {
          smoothedFreqRef.current = null
          noteHistoryRef.current = []
          setNoteInfo(null)
          return
        }
        const result = detectPitch(buf, ctx.sampleRate)
        if (!result) return
        smoothedFreqRef.current = smoothedFreqRef.current === null
          ? result.freq
          : FREQ_ALPHA * result.freq + (1 - FREQ_ALPHA) * smoothedFreqRef.current
        const info = freqToNoteInfo(smoothedFreqRef.current, a4)
        if (!info) return
        smoothedCentsRef.current = CENTS_ALPHA * info.cents + (1 - CENTS_ALPHA) * smoothedCentsRef.current
        const smoothedInfo = { ...info, cents: Math.round(smoothedCentsRef.current) }
        const history = noteHistoryRef.current
        history.push(info.name)
        if (history.length > STABLE_FRAMES) history.shift()
        const stable = history.length === STABLE_FRAMES && history.every((n) => n === info.name)
        setNoteInfo((prev) => {
          if (!prev || stable) return smoothedInfo
          return { ...prev, cents: smoothedInfo.cents, freq: smoothedInfo.freq }
        })
      }
      rafRef.current = requestAnimationFrame(loop)
      setActive(true)
    } catch {
      setError('マイクへのアクセスが拒否されました')
    }
  }, [a4])

  useEffect(() => {
    if (active) { stop(); start() }
  }, [a4]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stop(), [stop])

  const cents = noteInfo?.cents ?? 0
  const needleAngle = Math.max(-90, Math.min(90, (cents / CENT_MAX) * 90))
  const inTune = Math.abs(cents) <= 5
  const needleColor = inTune ? '#34d399' : Math.abs(cents) <= 15 ? '#fbbf24' : '#f87171'
  const meterAngle = needleAngle * (Math.PI / 180)
  const needleX = 100 + 72 * Math.sin(meterAngle)
  const needleY = 100 - 72 * Math.cos(meterAngle)

  return (
    <div className="space-y-4">
      {/* メインカード（ダーク） */}
      <div className="bg-indigo-950 rounded-3xl p-6 shadow-xl flex flex-col items-center gap-5">

        {/* 音名 */}
        <div className="text-center min-h-[96px] flex flex-col items-center justify-center">
          {noteInfo ? (
            <>
              <div className="flex items-end justify-center gap-1 leading-none">
                <span className="text-7xl font-black text-white tracking-tight">{noteInfo.name}</span>
                <span className="text-3xl font-bold text-indigo-400 mb-1">{noteInfo.octave}</span>
              </div>
              <p className="text-indigo-400 text-sm mt-2">{noteInfo.freq} Hz</p>
              <p className={`text-sm font-semibold mt-1 ${inTune ? 'text-emerald-400' : 'text-indigo-300'}`}>
                {inTune ? '✓ In Tune' : `${cents > 0 ? '+' : ''}${cents} cent`}
              </p>
            </>
          ) : (
            <p className="text-indigo-600 text-base">
              {active ? '音を鳴らしてください' : '―'}
            </p>
          )}
        </div>

        {/* SVGメーター */}
        <div className="relative w-full max-w-[280px]">
          <svg viewBox="0 0 200 115" className="w-full">
            {/* 外側リング */}
            <path d="M 12 104 A 90 90 0 0 1 188 104" fill="none" stroke="#1e1b4b" strokeWidth="16" strokeLinecap="round" />
            {/* グラデーション弧（赤→黄→緑→黄→赤） */}
            {[
              { from: -80, to: -40, color: '#f87171' },
              { from: -40, to: -15, color: '#fbbf24' },
              { from: -15, to:  15, color: '#34d399' },
              { from:  15, to:  40, color: '#fbbf24' },
              { from:  40, to:  80, color: '#f87171' },
            ].map(({ from, to, color }, idx) => {
              const r = 90
              const cx = 100, cy = 104
              const a1 = (from / 100) * 80 * (Math.PI / 180)
              const a2 = (to / 100) * 80 * (Math.PI / 180)
              const x1 = cx + r * Math.sin(a1), y1 = cy - r * Math.cos(a1)
              const x2 = cx + r * Math.sin(a2), y2 = cy - r * Math.cos(a2)
              const large = Math.abs(to - from) > 50 ? 1 : 0
              return (
                <path
                  key={idx}
                  d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                  fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" opacity="0.7"
                />
              )
            })}
            {/* 中央グリーンゾーン強調 */}
            <path d="M 93 14 A 90 90 0 0 1 107 14" fill="none" stroke="#34d399" strokeWidth="6" strokeLinecap="round" opacity="1" />
            {/* 目盛り */}
            {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => {
              const a = (i / 4) * 80 * (Math.PI / 180)
              const r1 = 80, r2 = i === 0 ? 70 : 75
              return (
                <line
                  key={i}
                  x1={100 + r1 * Math.sin(a)} y1={104 - r1 * Math.cos(a)}
                  x2={100 + r2 * Math.sin(a)} y2={104 - r2 * Math.cos(a)}
                  stroke={i === 0 ? '#818cf8' : '#3730a3'} strokeWidth={i === 0 ? 2.5 : 1.5}
                />
              )
            })}
            {/* 針の影 */}
            <line
              x1="100" y1="104" x2={needleX + 1} y2={needleY + 1}
              stroke="#000" strokeWidth="3.5" strokeLinecap="round" opacity="0.3"
              style={{ transition: 'x2 0.3s ease-out, y2 0.3s ease-out' }}
            />
            {/* 針 */}
            <line
              x1="100" y1="104" x2={needleX} y2={needleY}
              stroke={needleColor} strokeWidth="3" strokeLinecap="round"
              style={{ transition: 'x2 0.3s ease-out, y2 0.3s ease-out, stroke 0.3s' }}
            />
            {/* 軸 */}
            <circle cx="100" cy="104" r="6" fill={needleColor} style={{ transition: 'fill 0.3s' }} />
            <circle cx="100" cy="104" r="3" fill="#0f0e2a" />
          </svg>
          {/* セントラベル */}
          <div className="absolute bottom-1 left-0 right-0 flex justify-between px-3 text-[10px] text-indigo-600 font-medium">
            <span>−50</span><span>0</span><span>+50</span>
          </div>
        </div>

        {/* A4ピッチ選択 */}
        <div className="w-full">
          <p className="text-indigo-500 text-xs text-center mb-2">A4 基準ピッチ</p>
          <div className="flex gap-1.5 justify-center">
            {[440, 441, 442, 443, 444].map((hz) => (
              <button
                key={hz}
                onClick={() => setA4(hz)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  a4 === hz
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'bg-indigo-900 text-indigo-400 hover:bg-indigo-800'
                }`}
              >
                {hz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400 bg-red-950/50 rounded-xl px-4 py-3 text-center">{error}</p>}

      {/* 開始/停止ボタン */}
      <button
        onClick={active ? stop : start}
        className={`w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg transition-all active:scale-95 ${
          active
            ? 'bg-rose-500 hover:bg-rose-600'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {active ? '⏹ 停止' : '🎤 チューナー開始'}
      </button>
    </div>
  )
}
