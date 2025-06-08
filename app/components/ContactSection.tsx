'use client'

import React, { useRef } from 'react'
import ScrollVelocity from './ScrollVelocity'
import ContactForm from './ContactForm'
import styles from '../page.module.css'

export default function ContactSection() {
  // we'll use this div as our scroll container for the velocity effect
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  return (
    <section className={styles.contactSection}>
      {/* left animated text */}
      <ScrollVelocity
        ref={scrollContainerRef}
        scrollContainerRef={scrollContainerRef}
        texts={['\"Have Goals Not  Dreams\"']}
        velocity={50}
        numCopies={1}
        scrollerClassName={styles.leftScroller}
        parallaxClassName={styles.leftParallax}
      />

      {/* the form in the center */}
      <div className={styles.contactFormWrapper}>
        <ContactForm />
      </div>

    </section>
  )
}
