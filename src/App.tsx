import { AnimatedBackground } from './components/AnimatedBackground'
import { SkipLink } from './components/SkipLink'
import { CustomCursor } from './components/CustomCursor'
import { Intro } from './components/intro/Intro'
import { NavBar } from './components/nav/NavBar'
import { Preloader } from './components/Preloader'
import { About } from './sections/About'
import { HorizontalWords } from './sections/HorizontalWords'
import { Contact } from './sections/Contact'
import { Parcours } from './sections/Parcours'
import { Projects } from './sections/Projects'
import { Resume } from './sections/Resume'
import { Skills } from './sections/Skills'

export default function App() {
  return (
    <>
      <SkipLink />
      <Preloader />
      <CustomCursor />
      <AnimatedBackground />
      <NavBar />
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
