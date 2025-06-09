// app/components/HomeClientSections.tsx
'use client'

import React from 'react'
import Particles from './Particles'
import ContactSection from './ContactSection'
import styles from '../page.module.css'

export default function HomeClientSections() {
  return (
    <>
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

      {/* 6) Contact + animated tickers */}
      <footer className={styles.footer} id="contact">
        <ContactSection />
        <p>© {new Date().getFullYear()} AIC. All rights reserved.</p>
      </footer>
    </>
  )
}
