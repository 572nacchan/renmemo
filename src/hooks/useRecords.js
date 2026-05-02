import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useRecords() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('records')
      .select('*, pieces(id, title, type)')
      .order('date', { ascending: false })
    if (error) setError(error.message)
    else setRecords(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const addRecord = async (values) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('records').insert({ ...values, user_id: user.id })
    if (error) throw new Error(error.message)
    await fetch()
  }

  const updateRecord = async (id, values) => {
    const { error } = await supabase.from('records').update(values).eq('id', id)
    if (error) throw new Error(error.message)
    await fetch()
  }

  const deleteRecord = async (id) => {
    const { error } = await supabase.from('records').delete().eq('id', id)
    if (error) throw new Error(error.message)
    await fetch()
  }

  return { records, loading, error, addRecord, updateRecord, deleteRecord, refetch: fetch }
}
