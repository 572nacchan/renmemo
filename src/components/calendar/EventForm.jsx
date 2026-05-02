import { useState } from 'react'

const DEFAULT = { title: '', date: '', type: 'concert', memo: '' }

const TYPE_OPTIONS = [
  { value: 'concert',   label: '🎼 演奏会' },
  { value: 'rehearsal', label: '🎹 練習' },
  { value: 'other',     label: '📌 その他' },
]

export default function EventForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...DEFAULT, ...initial })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(values)
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
        <label className={label}>イベント名 <span className="text-red-400">*</span></label>
        <input type="text" value={values.title} onChange={set('title')} required className={field} placeholder="定期演奏会など" />
      </div>

      <div>
        <label className={label}>日付 <span className="text-red-400">*</span></label>
        <input type="date" value={values.date} onChange={set('date')} required className={field} />
      </div>

      <div>
        <label className={label}>種別</label>
        <div className="flex gap-3 flex-wrap">
          {TYPE_OPTIONS.map(({ value, label: optLabel }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio" name="type" value={value}
                checked={values.type === value}
                onChange={set('type')}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-700">{optLabel}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={label}>メモ</label>
        <textarea value={values.memo} onChange={set('memo')} rows={2} className={field} placeholder="（任意）" />
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
