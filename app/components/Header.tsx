'use client'

import React from 'react'
import styles from './Header.module.css'
import GlitchText from './GlitchText'
import RotatingText from './RotatingText'
import GooeyNav from './GooeyNav'

export default function Header() {
  const navItems = [
    { label: 'About',   href: '#about'   },
    { label: 'Domains', href: '#features'},
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <header className={styles.header}>
      {/* Left: logo + rotating text */}
      <div className={styles.leftGroup}>
        <GlitchText
          speed={1}
          enableShadows
          enableOnHover
          className={styles.logo}
        >
          AIC
        </GlitchText>

        <RotatingText
          texts={['Academic', 'Industrial', 'Club']}
          rotationInterval={2000}
          auto
          loop
          splitBy="words"
          mainClassName={styles.tagline}
          elementLevelClassName={styles.rotatingWord}
        />
      </div>

      {/* Center: gooey nav */}
      <div className={styles.navContainer}>
        <GooeyNav items={navItems} />
      </div>
    </header>
  )
}
