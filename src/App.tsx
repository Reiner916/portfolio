import { AnimatedBackground } from './components/AnimatedBackground'
import { CustomCursor } from './components/CustomCursor'
import { Intro } from './components/intro/Intro'
import { Nav } from './components/Nav'
import { Preloader } from './components/Preloader'
import { About } from './sections/About'
import { HorizontalWords } from './sections/HorizontalWords'
import { Projects } from './sections/Projects'
import { Skills } from './sections/Skills'

export default function App() {
  return (
    <>
      <Preloader />
      <CustomCursor />
      <AnimatedBackground />
      <Nav />
      <main>
        <Intro />
        <About />
        <HorizontalWords />
        <Skills />
        <Projects />
      </main>
    </>
  )
}
