'use client'

import React from 'react'
import Threads from './Threads'
import FuzzyText from './FuzzyText'
import styles from './About.module.css'

export default function About() {
  return (
    <div className={styles.wrapper} id="about">
   
      {/* 2) Foreground content */}
      <div className={styles.content}>
        {/* Fuzzy “About AIC” heading */}
        <div className={styles.heading}>
          <FuzzyText
            fontSize="clamp(2rem, 8vw, 6rem)"
            fontWeight={800}
            color="#ffffff"
            enableHover
            baseIntensity={0.15}
            hoverIntensity={0.45}
          >
            About AIC
          </FuzzyText>
        </div>

        <p>
          The Academic Industrial Club (AIC) connects students with industry
          mentors across Hardware, AI, Software, and Electrical Engineering.
        </p>
        <p>
          Our mission is to give you real-world experience: build projects,
          get feedback, and showcase your work to potential employers.
        </p>
        <p>
          Ready to join? <a href="#contact">Get in touch</a> and we’ll pair
          you with a mentor.
        </p>
      </div>
    </div>
  )
}
