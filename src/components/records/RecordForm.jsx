import { useState } from 'react'

const today = () => new Date().toISOString().slice(0, 10)

const DEFAULT = {
  date: today(),
  piece_id: '',
  duration_minutes: 30,
  memo: '',
}

export default function RecordForm({ initial, pieces = [], onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...DEFAULT, ...initial, piece_id: initial?.piece_id ?? '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        piece_id: values.piece_id || null,
        duration_minutes: Number(values.duration_minutes),
      }
      await onSubmit(payload)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const field = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm'
  const label = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={label}>練習日 <span className="text-red-400">*</span></label>
        <input type="date" value={values.date} onChange={set('date')} required className={field} />
      </div>

      <div>
        <label className={label}>練習時間（分） <span className="text-red-400">*</span></label>
        <input
          type="number" value={values.duration_minutes} onChange={set('duration_minutes')}
          required min={1} max={720} className={field}
        />
      </div>

      <div>
        <label className={label}>曲・教本（任意）</label>
        <select value={values.piece_id} onChange={set('piece_id')} className={field}>
          <option value="">なし</option>
          {pieces.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>練習内容メモ</label>
        <textarea value={values.memo} onChange={set('memo')} rows={3} className={field} placeholder="今日練習したこと…" />
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          キャンセル
        </button>
        <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition-colors">
          {submitting ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}
