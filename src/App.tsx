import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { SmoothScroll } from './animations/SmoothScroll'
import { initSound } from './audio/sound'
import { ScrollTrigger } from './animations/gsap'
import { useReducedMotion } from './hooks/useMedia'
import { SceneContext } from './three/SceneContext'
import { Nav } from './components/Nav'
import { Cursor } from './components/Cursor'
import { Loader } from './components/Loader'
import { LightboxProvider } from './components/Lightbox'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Toolkit } from './sections/Toolkit'
import { Organizations } from './sections/Organizations'
import { CaseStudies } from './sections/CaseStudies'
import { Projects } from './sections/Projects'
import { Contact } from './sections/Contact'

const Experience = lazy(() => import('./three/Experience'))

/** Fonts the canvas textures draw with must be loaded before the scene builds them. */
const CANVAS_FONTS = ['600 100px "Oswald Variable"', '700 100px Tinos', '400 100px Carlito']

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Page({ introDone }: { introDone: boolean }) {
  return (
    <main id="main">
      <Hero introDone={introDone} />
      <About />
      <Toolkit />
      <Organizations />
      <CaseStudies />
      <Projects />
      <Contact />
    </main>
  )
}

export default function App() {
  const reduced = useReducedMotion()
  const [fontsReady, setFontsReady] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(() => !webglAvailable())
  const [introDone, setIntroDone] = useState(false)

  useEffect(() => {
    Promise.all([document.fonts.ready, ...CANVAS_FONTS.map((f) => document.fonts.load(f))])
      .catch(() => undefined)
      .finally(() => setFontsReady(true))
    // never hold the page hostage to the 3D scene
    const t = setTimeout(() => setSceneReady(true), 6000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => initSound(), [])

  // Pins and trigger positions depend on final font metrics.
  useEffect(() => {
    if (fontsReady) ScrollTrigger.refresh()
  }, [fontsReady])

  const showScene = fontsReady && !sceneFailed
  const ready = fontsReady && (sceneReady || sceneFailed)
  const live = showScene && sceneReady && !reduced

  return (
    <SmoothScroll>
      <LightboxProvider>
        <SceneContext.Provider value={{ live }}>
          <a
            href="#main"
            className="pill fixed top-3 left-3 z-[90] -translate-y-20 rounded-full px-4 py-2 text-caption font-bold text-fg focus:translate-y-0"
          >
            Skip to content
          </a>

          <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[100lvh]"
          >
            {showScene && (
              <SceneBoundary onError={() => setSceneFailed(true)}>
                <Suspense fallback={null}>
                  <Experience reduced={reduced} onReady={() => setSceneReady(true)} />
                </Suspense>
              </SceneBoundary>
            )}
          </div>
          <div className="vignette" aria-hidden />

          <div className="relative z-10">
            <Nav />
            <Page introDone={introDone} />
          </div>

          <div className="grain" aria-hidden />
          <Cursor />
          <Loader ready={ready} reduced={reduced} onExited={() => setIntroDone(true)} />
        </SceneContext.Provider>
      </LightboxProvider>
    </SmoothScroll>
  )
}
