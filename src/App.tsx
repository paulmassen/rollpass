import { useCallback, useEffect, useMemo, useState } from 'react'
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
      setResult(null)
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
    setPlaying(true)
    for (let i = 0; i < count; i++) {
      setActiveIndex(i)
      await wait(140)
    }
    setActiveIndex(null)
    setPlaying(false)
  }

  async function handleCopy() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.password)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setError({ kind: 'copy' })
    }
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

      <main className="stage">
        <section className="stage-primary">
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

          <ScorePanel
            result={result}
            playing={playing}
            onReplay={() => {
              if (result) void replayPath(result.keys.length)
            }}
          />

          <SecurityPanel result={result} length={result?.keys.length ?? length} />

          {result && (
            <TrainingMode
              password={result.password}
              keys={result.keys}
              onCursor={handleTrainCursor}
            />
          )}
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
      </main>

      <Testimonials />

      <Faq />

      <Footer />
    </div>
  )
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
