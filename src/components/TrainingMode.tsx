import { useEffect, useRef, useState } from 'react'
import type { TypedKey } from '../lib/types'
import { m } from '../messages'

type Attempt = {
  ms: number
  cpm: number
  errors: number
  at: number
}

type Props = {
  password: string
  keys: TypedKey[]
  onCursor: (index: number | null) => void
}

export function TrainingMode({ password, keys, onCursor }: Props) {
  const [input, setInput] = useState('')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)
  const [best, setBest] = useState<Attempt | null>(null)
  const [last, setLast] = useState<Attempt | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password])

  // Keyboard shortcuts: Esc restarts at any time, Enter restarts once finished.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Escape' && (done || input.length > 0)) {
        e.preventDefault()
        reset()
        return
      }
      if (e.key === 'Enter' && done) {
        // Leave Enter alone on controls that already react to it
        const target = e.target
        if (
          target instanceof HTMLElement &&
          target.closest('button, a, summary, input, select, textarea')
        ) {
          return
        }
        e.preventDefault()
        reset()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, input.length])

  useEffect(() => {
    if (!startedAt || done) return
    const id = window.setInterval(() => {
      setElapsed(performance.now() - startedAt)
    }, 50)
    return () => window.clearInterval(id)
  }, [startedAt, done])

  useEffect(() => {
    onCursor(!done && password ? Math.min(input.length, password.length - 1) : null)
    return () => onCursor(null)
  }, [input, done, password, onCursor])

  function reset() {
    setInput('')
    setStartedAt(null)
    setElapsed(0)
    setDone(false)
    onCursor(null)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  function finish(ms: number, errors: number) {
    const minutes = ms / 60000
    const cpm = minutes > 0 ? Math.round(password.length / minutes) : 0
    const attempt: Attempt = { ms, cpm, errors, at: Date.now() }
    setLast(attempt)
    setBest((prev) => (!prev || ms < prev.ms ? attempt : prev))
    setDone(true)
  }

  function onChange(value: string) {
    if (done) return
    if (!startedAt && value.length > 0) {
      setStartedAt(performance.now())
    }

    // Bloque la saisie trop longue
    if (value.length > password.length) return
    setInput(value)

    if (value.length === password.length) {
      const ms = (startedAt ? performance.now() - startedAt : 0) || 1
      let errors = 0
      for (let i = 0; i < password.length; i++) {
        if (value[i] !== password[i]) errors++
      }
      setElapsed(ms)
      finish(ms, errors)
    }
  }

  const nextKey = !done && input.length < keys.length ? keys[input.length] : null
  const perfect = done && last && last.errors === 0

  return (
    <section className="training">
      <div className="training-header">
        <h2>{m.training.title}</h2>
        <p>{m.training.intro}</p>
      </div>

      <div className="training-target" aria-hidden="true">
        {keys.map((k, i) => {
          const typed = input[i]
          let state = 'pending'
          if (typed != null) state = typed === k.char ? 'ok' : 'bad'
          if (!done && i === input.length) state = 'current'
          return (
            <span key={`${k.char}-${i}`} className={`train-char is-${state}`}>
              {k.char}
            </span>
          )
        })}
      </div>

      <label className="training-field">
        <span className="sr-only">{m.training.inputLabel}</span>
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={input}
          disabled={done || !password}
          placeholder={m.training.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>

      <div className="training-meta">
        <div>
          <span className="meta-label">{m.training.time}</span>
          <strong>{formatMs(done ? (last?.ms ?? elapsed) : elapsed)}</strong>
        </div>
        <div>
          <span className="meta-label">{m.training.nextFinger}</span>
          <strong>
            {nextKey
              ? `${m.fingers[nextKey.finger]}${nextKey.shifted ? ` + ${m.training.shift}` : ''}`
              : done
                ? '—'
                : m.training.ready}
          </strong>
        </div>
        {best && (
          <div>
            <span className="meta-label">{m.training.record}</span>
            <strong>
              {formatMs(best.ms)} · {best.cpm} {m.training.cpm}
            </strong>
          </div>
        )}
      </div>

      {done && last && (
        <div className={`training-result ${perfect ? 'is-perfect' : ''}`}>
          <p>
            {perfect ? m.training.perfect : m.training.finished}{' '}
            <em>{formatMs(last.ms)}</em> · {last.cpm} {m.training.cpm}
            {last.errors > 0 ? ` · ${m.training.errors(last.errors)}` : ''}
          </p>
          <button
            type="button"
            className="btn-retry"
            onClick={reset}
            aria-keyshortcuts="Enter"
          >
            {m.training.retry} <kbd>{m.training.retryKey}</kbd>
          </button>
        </div>
      )}

      {!done && input.length > 0 && (
        <button
          type="button"
          className="btn-ghost training-reset"
          onClick={reset}
          aria-keyshortcuts="Escape"
        >
          {m.training.reset} <kbd>{m.training.resetKey}</kbd>
        </button>
      )}
    </section>
  )
}

function formatMs(ms: number): string {
  const s = ms / 1000
  if (s < 10) return `${s.toFixed(2)}s`
  return `${s.toFixed(1)}s`
}
