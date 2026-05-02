const STYLES = {
  concert:   'bg-pink-500 text-white',
  rehearsal: 'bg-green-500 text-white',
  other:     'bg-gray-400 text-white',
}

const LABELS = {
  concert:   '演奏会',
  rehearsal: '練習',
  other:     'その他',
}

export default function EventBadge({ type, title }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium truncate max-w-full ${STYLES[type] ?? STYLES.other}`}>
      {title ?? LABELS[type]}
    </span>
  )
}
