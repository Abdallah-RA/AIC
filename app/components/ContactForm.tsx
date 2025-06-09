'use client'

import React, { useState, FormEvent, ChangeEvent } from 'react'
import StarBorder from './StarBorder'
import styles from './ContactForm.module.css'

// ✅ Use direct GAS endpoint — no /api
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwGt6CF6ludvrozBeoISWqxTeyTjDVA-IOq9LVPqarxclIsnd_tBehA0QS-aaaSRUlVbw/exec'

type FormData = {
  name: string
  universityId: string
  email: string
  team: 'hardware' | 'ai' | 'software' | 'electrical'
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    universityId: '',
    email: '',
    team: 'hardware',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setSubmitting(true)

  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors', // <-- this avoids CORS errors!
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    alert('🎉 Form submitted! Thanks for your interst in AIC.')
    setFormData({
      name: '',
      universityId: '',
      email: '',
      team: 'hardware',
    })
  } catch (err: unknown) {
    console.error('Submission error:', err)
    alert('Oops! Something went wrong.')
  } finally {
    setSubmitting(false)
  }
}


  return (
    <StarBorder as="div" className={styles.wrapper} color="#0af" speed="8s">
      <h2 className={styles.title}>Join AIC</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="universityId">University ID</label>
          <input
            id="universityId"
            name="universityId"
            type="text"
            placeholder="e.g. 12345678"
            value={formData.universityId}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <fieldset className={styles.fieldset}>
          <legend>Which team?</legend>
          <div className={styles.radioGroup}>
            {(
              [
                ['hardware', 'Hardware'],
                ['ai', 'AI'],
                ['software', 'Software'],
                ['electrical', 'Electrical'],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="team"
                  value={value}
                  checked={formData.team === value}
                  onChange={handleChange}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </StarBorder>
  )
}
