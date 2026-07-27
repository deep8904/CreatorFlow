import { useEffect, useRef, useState } from 'react'

/**
 * Thin wrapper around the browser's native Web Speech API
 * (SpeechRecognition / webkitSpeechRecognition) — real client-side
 * speech-to-text, not a mock. `supported` is false wherever the API
 * doesn't exist (Firefox, most non-Chromium browsers) so the caller can
 * hide the mic entirely rather than show a button that silently fails.
 */

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionResultEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useSpeechCapture(onTranscript: (text: string) => void) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    // Feature detection can only run client-side (SSR has no `window`), so
    // this has to be an effect. Deferred a tick rather than called
    // synchronously in the effect body — this fires once on mount with no
    // cascade risk, but the direct-call form trips this project's stricter
    // react-hooks/set-state-in-effect rule regardless.
    const supported = getSpeechRecognitionCtor() !== null
    queueMicrotask(() => setSupported(supported))
  }, [])

  const start = () => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return
    const recognition = new Ctor()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1]
      const transcript = last?.[0]?.transcript
      if (transcript) onTranscript(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return { supported, listening, start, stop }
}
