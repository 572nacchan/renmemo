import { useState, useEffect, useRef, useCallback } from 'react'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const A4_MIDI = 69

function freqToNoteInfo(freq, a4) {
  if (!freq || freq <= 0) return null
  const semitones = 12 * Math.log2(freq / a4) + A4_MIDI
  const midi = Math.round(semitones)
  const cents = Math.round((semitones - midi) * 100)
  const octave = Math.floor(midi / 12) - 1
  const name = NOTE_NAMES[midi % 12]
  return { name, octave, cents, freq: freq.toFixed(1) }
}

// 自己相関関数による基本周波数推定
function detectPitch(buffer, sampleRate) {
  const SIZE = buffer.length
  const MAX_SAMPLES = Math.floor(SIZE / 2)
  let bestOffset = -1
  let bestCorr = 0
  let lastCorr = 1
  let foundGoodCorr = false
  const threshold = 0.9

  const corr = new Float32Array(MAX_SAMPLES)
  for (let i = 0; i < MAX_SAMPLES; i++) {
    let c = 0
    for (let j = 0; j < MAX_SAMPLES; j++) c += buffer[j] * buffer[j + i]
    corr[i] = c
  }

  for (let i = 1; i < MAX_SAMPLES; i++) {
    const normalized = corr[i] / corr[0]
    if (normalized > threshold && normalized > lastCorr) {
      foundGoodCorr = true
      if (normalized > bestCorr) { bestCorr = normalized; bestOffset = i }
    } else if (foundGoodCorr) {
      break
    }
    lastCorr = normalized
  }

  if (!foundGoodCorr || bestOffset === -1) return null

  // 補間で精度向上
  const shift =
    bestOffset > 0 && bestOffset < MAX_SAMPLES - 1
      ? (corr[bestOffset + 1] - corr[bestOffset - 1]) / (2 * (2 * corr[bestOffset] - corr[bestOffset - 1] - corr[bestOffset + 1]))
      : 0

  return sampleRate / (bestOffset + shift)
}

const CENT_MAX = 50

export default function Tuner() {
  const [a4, setA4] = useState(442)
  const [active, setActive] = useState(false)
  const [noteInfo, setNoteInfo] = useState(null)
  const [error, setError] = useState('')

  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    analyserRef.current = null
    streamRef.current = null
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
      const loop = () => {
        analyser.getFloatTimeDomainData(buf)
        const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length)
        if (rms > 0.01) {
          const freq = detectPitch(buf, ctx.sampleRate)
          setNoteInfo(freqToNoteInfo(freq, a4))
        } else {
          setNoteInfo(null)
        }
        rafRef.current = requestAnimationFrame(loop)
      }
      rafRef.current = requestAnimationFrame(loop)
      setActive(true)
    } catch (e) {
      setError('マイクへのアクセスが拒否されました')
    }
  }, [a4])

  // a4変更時に再起動
  useEffect(() => {
    if (active) { stop(); start() }
  }, [a4]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stop(), [stop])

  const cents = noteInfo?.cents ?? 0
  const needleAngle = Math.max(-90, Math.min(90, (cents / CENT_MAX) * 90))
  const inTune = Math.abs(cents) <= 5
  const needleColor = inTune ? '#22c55e' : Math.abs(cents) <= 15 ? '#f59e0b' : '#ef4444'

  return (
    <div className="space-y-6">
      {/* A4 ピッチ選択 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-medium text-gray-500 mb-2">A4 基準ピッチ</p>
        <div className="flex gap-2 flex-wrap">
          {[440, 441, 442, 443, 444].map((hz) => (
            <button
              key={hz}
              onClick={() => setA4(hz)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                a4 === hz ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {hz}
            </button>
          ))}
        </div>
      </div>

      {/* メーター */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4">
        {/* 針メーター */}
        <div className="relative w-64 h-36 overflow-hidden">
          {/* 目盛り弧 */}
          <svg viewBox="0 0 200 110" className="w-full h-full">
            {/* 背景弧 */}
            <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
            {/* チューン範囲（中央±5cent） */}
            <path d="M 90 10 A 90 90 0 0 1 110 10" fill="none" stroke="#86efac" strokeWidth="12" strokeLinecap="round" />
            {/* 目盛り */}
            {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => {
              const angle = (i / 4) * 80 * (Math.PI / 180)
              const cx = 100 + 78 * Math.sin(angle)
              const cy = 100 - 78 * Math.cos(angle)
              return <circle key={i} cx={cx} cy={cy} r={i === 0 ? 3 : 1.5} fill={i === 0 ? '#4f46e5' : '#9ca3af'} />
            })}
            {/* 針 */}
            {(() => {
              const angle = needleAngle * (Math.PI / 180)
              const x = 100 + 70 * Math.sin(angle)
              const y = 100 - 70 * Math.cos(angle)
              return (
                <line
                  x1="100" y1="100" x2={x} y2={y}
                  stroke={needleColor} strokeWidth="3" strokeLinecap="round"
                  style={{ transition: 'all 0.1s ease-out' }}
                />
              )
            })()}
            <circle cx="100" cy="100" r="5" fill={needleColor} style={{ transition: 'fill 0.1s' }} />
          </svg>
          {/* セント表示 */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-gray-400">
            <span>-50</span><span>0</span><span>+50</span>
          </div>
        </div>

        {/* 音名表示 */}
        <div className="text-center min-h-[80px] flex flex-col items-center justify-center">
          {noteInfo ? (
            <>
              <p className="text-6xl font-bold text-indigo-700 leading-none">
                {noteInfo.name}
                <span className="text-3xl text-indigo-400">{noteInfo.octave}</span>
              </p>
              <p className="text-gray-400 text-sm mt-2">{noteInfo.freq} Hz</p>
              <p className={`text-sm font-medium mt-1 ${inTune ? 'text-green-500' : 'text-gray-500'}`}>
                {inTune ? '♪ チューニング OK' : `${cents > 0 ? '+' : ''}${cents} cent`}
              </p>
            </>
          ) : (
            <p className="text-gray-300 text-lg">{active ? '音を鳴らしてください' : '―'}</p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      {/* 開始/停止ボタン */}
      <button
        onClick={active ? stop : start}
        className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-md transition-colors ${
          active ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {active ? '⏹ 停止' : '🎤 チューナー開始'}
      </button>
    </div>
  )
}
