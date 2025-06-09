// app/page.tsx

'use client'

import React from 'react'
import Head from 'next/head'
import Header from './components/Header'
import About from './components/About'
import Features from './components/Features'
import Particles from './components/Particles'
import ContactSection from './components/ContactSection'

export default function Home() {
  return (
    <>
      <Head>
        <style>{`
          body {
            margin: 0;
            background: #000;
            color: #fff;
            font-family: sans-serif;
          }

          .container {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background: #000;
            color: #fff;
          }

          .main {
            flex: 1;
            position: relative;
            padding: 2rem 1rem;
            z-index: 1;
          }

          .aboutTeams {
            text-align: center;
            margin: 4rem 0;
            opacity: 0.6;
          }

          .aboutTeams h2 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }

          .aboutTeams p {
            font-size: 1rem;
          }

          .footer {
            background: #111;
            padding: 2rem 1rem;
            text-align: center;
            color: #bbb;
            opacity: 0.8;
          }

          .particles-container,
          .threads-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
          }

          .features {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 3rem;
            margin: 3rem 0;
          }

          .featureItem {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
          }

          .profileCard {
            width: 300px;
          }
        `}</style>
      </Head>

      <div className="container">
        <Header />
        <About />

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

        <main className="main">
          <Features />

          <section id="about-teams" className="aboutTeams">
            <h2>Future Interviews for Teams</h2>
            <p>More info coming soon—stay tuned!</p>
          </section>
        </main>

        <footer className="footer" id="contact">
          <ContactSection />
          <p>© {new Date().getFullYear()} AIC. All rights reserved.</p>
        </footer>
      </div>
    </>
  )
}
