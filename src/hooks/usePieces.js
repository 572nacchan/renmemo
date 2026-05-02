import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePieces() {
  const [pieces, setPieces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('pieces')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setPieces(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const addPiece = async (values) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('pieces').insert({ ...values, user_id: user.id })
    if (error) throw new Error(error.message)
    await fetch()
  }

  const updatePiece = async (id, values) => {
    const { error } = await supabase.from('pieces').update(values).eq('id', id)
    if (error) throw new Error(error.message)
    await fetch()
  }

  const deletePiece = async (id) => {
    const { error } = await supabase.from('pieces').delete().eq('id', id)
    if (error) throw new Error(error.message)
    await fetch()
  }

  return { pieces, loading, error, addPiece, updatePiece, deletePiece }
}
