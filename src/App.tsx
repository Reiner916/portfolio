import { AnimatedBackground } from './components/AnimatedBackground'
import { SkipLink } from './components/SkipLink'
import { CustomCursor } from './components/CustomCursor'
import { Intro } from './components/intro/Intro'
import { Nav } from './components/Nav'
import { NavBar } from './components/nav/NavBar'
import { NavDock } from './components/nav/NavDock'
import { NavMenu } from './components/nav/NavMenu'
import { Preloader } from './components/Preloader'
import { About } from './sections/About'
import { HorizontalWords } from './sections/HorizontalWords'
import { Contact } from './sections/Contact'
import { Parcours } from './sections/Parcours'
import { Projects } from './sections/Projects'
import { Resume } from './sections/Resume'
import { Skills } from './sections/Skills'

// APERÇU (non appliqué) : ?nav=a | b | c dans l'adresse affiche l'un des 3 menus proposés à la place de la nav actuelle
const navPreview = new URLSearchParams(window.location.search).get('nav')
const PreviewNav = { a: NavBar, b: NavDock, c: NavMenu }[navPreview ?? ''] ?? Nav

export default function App() {
  return (
    <>
      <SkipLink />
      <Preloader />
      <CustomCursor />
      <AnimatedBackground />
      <PreviewNav />
      <main>
        <Intro />
        <About />
        <HorizontalWords />
        <Skills />
        <Projects />
        <Parcours />
        <Resume />
        <Contact />
      </main>
    </>
  )
}
