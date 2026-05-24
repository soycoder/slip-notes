import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  onDone: () => void
}

export default function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return <div className="toast">{message}</div>
}

export function useToast() {
  const [msg, setMsg] = useState('')
  const [key, setKey] = useState(0)

  const show = (message: string) => {
    setMsg(message)
    setKey((k) => k + 1)
  }

  const clear = () => setMsg('')

  return { msg, key, show, clear }
}
