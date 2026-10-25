import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controls } from './components/Controls'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { KeyboardViz } from './components/KeyboardViz'
import { PasswordDisplay } from './components/PasswordDisplay'
import { ScorePanel } from './components/ScorePanel'
import { SecurityPanel } from './components/SecurityPanel'
import { HeroTestimonial, Testimonials } from './components/Testimonials'
import { TrainingMode } from './components/TrainingMode'
import { m } from './messages'
import {
  GeneratorError,
  estimateMaxLength,
  generatePassword,
} from './lib/generator'
import type {
  CharsetOptions,
  GenerationResult,
  HandMode,
  LayoutId,
  RowScope,
} from './lib/types'
import './App.css'

type AppError =
  | { kind: 'copy' }
  | { kind: 'generate' }
  | { kind: 'not-enough-keys'; available: number; requested: number }

const DEFAULT_CHARSET: CharsetOptions = {
  lowercase: true,
  uppercase: false,
  digits: false,
  symbols: false,
}

function detectLayout(): LayoutId {
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('fr') || lang.startsWith('be')) return 'azerty'
  if (lang.startsWith('de') || lang.startsWith('at') || lang.startsWith('ch'))
    return 'qwertz'
  return 'qwerty'
}

export default function App() {
  const [layout, setLayout] = useState<LayoutId>(() => detectLayout())
  const [handMode, setHandMode] = useState<HandMode>('right')
  const [rowScope, setRowScope] = useState<RowScope>('home-top')
  const [length, setLength] = useState(12)
  const [charset, setCharset] = useState<CharsetOptions>(DEFAULT_CHARSET)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<AppError | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [trainCursor, setTrainCursor] = useState<number | null>(null)
  // Each replay gets a token; a newer replay (or unmount) cancels older ones,
  // so two loops never fight over the highlighted key.
  const replayToken = useRef(0)
  const copiedTimer = useRef<number | undefined>(undefined)

  const maxLength = useMemo(
    () => estimateMaxLength(layout, handMode, charset, rowScope),
    [layout, handMode, charset, rowScope],
  )

  const highlightIndex = playing ? activeIndex : trainCursor

  useEffect(() => {
    if (length > maxLength) setLength(Math.max(6, maxLength))
  }, [maxLength, length])

  function handleGenerate() {
    setError(null)
    setCopied(false)
    setTrainCursor(null)
    try {
      const next = generatePassword({
        layout,
        handMode,
        length,
        charset,
        rowScope,
      })
      setResult(next)
      void replayPath(next.keys.length)
    } catch (e) {
      // Keep the previous password on screen: the error explains what to
      // change, it should not wipe the last good result.
      setError(
        e instanceof GeneratorError
          ? {
              kind: e.code,
              available: e.available,
              requested: e.requested,
            }
          : { kind: 'generate' },
      )
    }
  }

  async function replayPath(count: number) {
    const token = ++replayToken.current
    setPlaying(true)
    for (let i = 0; i < count; i++) {
      if (token !== replayToken.current) return
      setActiveIndex(i)
      await wait(140)
    }
    if (token !== replayToken.current) return
    setActiveIndex(null)
    setPlaying(false)
  }

  useEffect(
    () => () => {
      replayToken.current++
      window.clearTimeout(copiedTimer.current)
    },
    [],
  )

  async function handleCopy() {
    if (!result) return
    const ok = await copyText(result.password)
    if (!ok) {
      setError({ kind: 'copy' })
      return
    }
    setError((prev) => (prev?.kind === 'copy' ? null : prev))
    setCopied(true)
    window.clearTimeout(copiedTimer.current)
    copiedTimer.current = window.setTimeout(() => setCopied(false), 1600)
  }

  const handleTrainCursor = useCallback((index: number | null) => {
    setTrainCursor(index)
  }, [])

  useEffect(() => {
    handleGenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true" />

      <header className="hero">
        <div className="hero-copy">
          <p className="brand">{m.brand}</p>
          <h1>{m.heroTitle}</h1>
          <p className="lede">{m.heroLede}</p>
        </div>
        <HeroTestimonial />
      </header>

      {/* DOM order = reading order on narrow screens: result, settings,
          practice, verdicts. Wide screens move the settings into the right
          column with grid areas (App.css), keeping the same tab order. */}
      <main className="stage">
        <section className="stage-result" aria-label={m.password.resultAria}>
          <PasswordDisplay
            password={result?.password ?? ''}
            keys={result?.keys ?? []}
            onCopy={() => void handleCopy()}
            copied={copied}
            highlightIndex={highlightIndex}
          />

          {error && (
            <p className="error-banner" role="alert">
              {error.kind === 'not-enough-keys'
                ? m.password.notEnoughKeys(error.available, error.requested)
                : error.kind === 'copy'
                  ? m.password.copyError
                  : m.password.generateError}
            </p>
          )}

          <KeyboardViz
            layout={layout}
            handMode={handMode}
            rowScope={rowScope}
            path={result?.keys ?? []}
            activeIndex={highlightIndex}
          />
        </section>

        <aside className="stage-controls">
          <Controls
            layout={layout}
            handMode={handMode}
            rowScope={rowScope}
            length={length}
            maxLength={maxLength}
            charset={charset}
            onLayout={setLayout}
            onHandMode={setHandMode}
            onRowScope={setRowScope}
            onLength={setLength}
            onCharset={setCharset}
            onGenerate={handleGenerate}
          />

          <p className="aside-note">{m.asideNote}</p>
        </aside>

        {result && (
          <TrainingMode
            password={result.password}
            keys={result.keys}
            onCursor={handleTrainCursor}
          />
        )}

        {result && (
          <div className="verdicts">
            <ScorePanel
              result={result}
              playing={playing}
              onReplay={() => {
                if (result) void replayPath(result.keys.length)
              }}
            />
            <SecurityPanel result={result} length={result.keys.length} />
          </div>
        )}
      </main>

      <Testimonials />

      <Faq />

      <Footer />
    </div>
  )
}

/**
 * Clipboard API first; falls back to a hidden textarea + execCommand for
 * browsers or contexts where the async API is missing or refused (older
 * Safari, embedded webviews, non-secure origins).
 */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }
  const active = document.activeElement as HTMLElement | null
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  area.style.pointerEvents = 'none'
  document.body.appendChild(area)
  area.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  area.remove()
  active?.focus({ preventScroll: true })
  return ok
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
