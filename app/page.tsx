// app/page.tsx  (Server Component – no 'use client')
import React from 'react'
import Header      from './components/Header'
import About       from './components/About'
import Features    from './components/Features'
import Threads     from './components/Threads'
import Particles   from './components/Particles'
import ContactSection from './components/ContactSection'
import styles      from './page.module.css'

export const metadata = {
  title: 'AIC – Academic Industrial Club',
  description: 'Connecting Students and Industry',
}

export default function Home() {
  return (
    <div className={styles.container}>
      {/* 1) Header */}
      <Header />

      {/* 2) About section */}
      <About />

      {/* 3) Particles background */}
      <Particles
        particleCount={300}
        particleSpread={8}
        speed={0.05}
        particleColors={['#0af', '#0ff', '#a0f']}
        moveParticlesOnHover
        particleHoverFactor={2}
        alphaParticles={false}
        particleBaseSize={80}
        sizeRandomness={1}
        cameraDistance={25}
      />

      <main className={styles.main}>
        {/* 4) Domains / Features */}
        <Features />


        {/* 5) Future Interviews section */}
        <section id="about-teams" className={styles.aboutTeams}>
          <h2>Future Interviews for Teams</h2>
          <p>More info coming soon—stay tuned!</p>
        </section>
      </main>

      {/* 6) Contact + animated tickers */}
      <footer className={styles.footer} id="contact">
        <ContactSection />
        <p>© {new Date().getFullYear()} AIC. All rights reserved.</p>
      </footer>
    </div>
  )
}
