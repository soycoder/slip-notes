import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Countries } from '@/types/'

function Page() {
  const [countries, setCountries] = useState<Countries['Row'][] | null>([])

  useEffect(() => {
    myFunction()
  }, [])

  const myFunction = async () => {
    let { data } = await supabase.from('countries').select()
    setCountries(data)
  }

  return (
    <ul>
      {countries?.map((country) => (
        <li key={country.id}>{country.name}</li>
      ))}
    </ul>
  )
}

export default Page
