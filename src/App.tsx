import { AnimatedBackground } from './components/AnimatedBackground'
import { Intro } from './components/intro/Intro'
import { Nav } from './components/Nav'
import { Preloader } from './components/Preloader'
import { About } from './sections/About'
import { Projects } from './sections/Projects'
import { Skills } from './sections/Skills'

export default function App() {
  return (
    <>
      <Preloader />
      <AnimatedBackground />
      <Nav />
      <main>
        <Intro />
        <About />
        <Skills />
        <Projects />
      </main>
    </>
  )
}
