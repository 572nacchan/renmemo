const VARIANTS = {
  piece:     'bg-indigo-100 text-indigo-700',
  textbook:  'bg-amber-100 text-amber-700',
  concert:   'bg-pink-100 text-pink-700',
  rehearsal: 'bg-green-100 text-green-700',
  other:     'bg-gray-100 text-gray-600',
  active:    'bg-emerald-100 text-emerald-700',
  inactive:  'bg-gray-100 text-gray-400',
}

const LABELS = {
  piece:     '曲',
  textbook:  '教本',
  concert:   '演奏会',
  rehearsal: '練習',
  other:     'その他',
  active:    '練習中',
  inactive:  '休止中',
}

export default function Badge({ variant }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${VARIANTS[variant] ?? VARIANTS.other}`}>
      {LABELS[variant] ?? variant}
    </span>
  )
}
