'use client'
import { useEffect, useRef } from 'react'

export default function MonetagAd() {
  const m = useRef(false)
  useEffect(() => {
    if (m.current) return; m.current = true
    const s = document.createElement('script')
    s.src = '//pl24949463.effectiveratecpm.com/36/c2/c7/36c2c76673b07cd1a0f8ebb7206c6c87.js'
    s.async = true; s.setAttribute('data-cfasync', 'false')
    document.body.appendChild(s)
  }, [])
  return null
}
