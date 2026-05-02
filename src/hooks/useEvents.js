import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
    if (error) setError(error.message)
    else setEvents(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const addEvent = async (values) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('events').insert({ ...values, user_id: user.id })
    if (error) throw new Error(error.message)
    await fetch()
  }

  const updateEvent = async (id, values) => {
    const { error } = await supabase.from('events').update(values).eq('id', id)
    if (error) throw new Error(error.message)
    await fetch()
  }

  const deleteEvent = async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw new Error(error.message)
    await fetch()
  }

  return { events, loading, error, addEvent, updateEvent, deleteEvent }
}
