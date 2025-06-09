'use client'

import React, { useRef, RefObject } from 'react'
import ScrollVelocity from './ScrollVelocity'
import ContactForm from './ContactForm'
import styles from '../page.module.css'

export default function ContactSection() {
  // This one is used for the forwarded `ref` (must be HTMLDivElement)
  const scrollContainerDivRef = useRef<HTMLDivElement>(null)
  // And we cast it to RefObject<HTMLElement> for the scrollContainerRef prop
  const scrollContainerRef = scrollContainerDivRef as RefObject<HTMLElement>

  return (
    <section className={styles.contactSection}>
      {/* left animated text */}
      <ScrollVelocity
        ref={scrollContainerDivRef}
        scrollContainerRef={scrollContainerRef}
        texts={['"Have Goals Not Dreams"']}
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
