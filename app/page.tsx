// app/page.tsx  (still a Server Component — no 'use client' here)
'use client'
import React from 'react'
import Header            from './components/Header'
import About             from './components/About'
import Features          from './components/Features'
import HomeClientSections from './components/HomeClientSections'
import styles            from './page.module.css'

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

      <main className={styles.main}>
        {/* 4) Domains / Features */}
        <Features />

        {/* 5) Future Interviews section */}
        <section id="about-teams" className={styles.aboutTeams}>
          <h2>Future Interviews for Teams</h2>
          <p>More info coming soon—stay tuned!</p>
        </section>
      </main>

      {/* 3 + 6) These are client‐only */}
      <HomeClientSections />
    </div>
  )
}
