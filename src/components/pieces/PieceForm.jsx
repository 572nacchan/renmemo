import { useState } from 'react'

const DEFAULT = {
  title: '', type: 'piece', composer: '',
  image_url: '', external_url: '', memo: '', is_active: true,
}

export default function PieceForm({ initial = DEFAULT, onSubmit, onCancel }) {
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
        <label className={label}>タイトル <span className="text-red-400">*</span></label>
        <input type="text" value={values.title} onChange={set('title')} required className={field} placeholder="曲名・教本名" />
      </div>

      <div>
        <label className={label}>種別</label>
        <div className="flex gap-3">
          {[['piece', '曲'], ['textbook', '教本']].map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio" name="type" value={val}
                checked={values.type === val}
                onChange={set('type')}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={label}>作曲者</label>
        <input type="text" value={values.composer} onChange={set('composer')} className={field} placeholder="（任意）" />
      </div>

      <div>
        <label className={label}>画像URL</label>
        <input type="url" value={values.image_url} onChange={set('image_url')} className={field} placeholder="https://..." />
      </div>

      <div>
        <label className={label}>外部URL（YouTube・Amazon等）</label>
        <input type="url" value={values.external_url} onChange={set('external_url')} className={field} placeholder="https://..." />
      </div>

      <div>
        <label className={label}>メモ</label>
        <textarea value={values.memo} onChange={set('memo')} rows={3} className={field} placeholder="練習のポイントなど" />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox" id="is_active" checked={values.is_active}
          onChange={(e) => setValues((v) => ({ ...v, is_active: e.target.checked }))}
          className="accent-indigo-600 w-4 h-4"
        />
        <label htmlFor="is_active" className="text-sm text-gray-700">練習中</label>
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
