'use client'

import React from 'react'
import PixelCard from './PixelCard'
import ProfileCard from './ProfileCard'
import styles from '../page.module.css'
import {
  FaMicrochip,
  FaBrain,
  FaCode,
  FaBolt,
} from 'react-icons/fa'

interface Leader {
  avatarUrl: string
  miniAvatarUrl?: string
  name: string
  title: string
  handle: string
  status: string
}

// A tiny black head‐and‐shoulders silhouette encoded as an SVG data URI:
const SILHOUETTE =
  'data:image/svg+xml;utf8,' +
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">` +
    `<path d="M64 24a24 24 0 1024 24A24 24 0 0064 24z` +
             `M0 96c0-26.7 37.5-40 64-40s64 13.3 64 40v32H0z"` +
          ` fill="%23000"/>` +
  `</svg>`

const features: {
  icon: React.ComponentType<{ size?: number }>
  title: string
  leader: Leader
}[] = [
  {
    icon: FaMicrochip,
    title: 'Hardware',
    leader: {
      avatarUrl: SILHOUETTE,
      miniAvatarUrl: SILHOUETTE,
      name: 'Empty',
      title: 'Hardware Lead',
      handle: 'Empty_HW',
      status: 'Not available',
    },
  },
  {
    icon: FaBrain,
    title: 'AI',
    leader: {
      avatarUrl: SILHOUETTE,
      miniAvatarUrl: SILHOUETTE,
      name: 'Empty',
      title: 'AI Lead',
      handle: 'Empty_AI',
      status: 'Not available',
    },
  },
  {
    icon: FaCode,
    title: 'Software',
    leader: {
      avatarUrl: SILHOUETTE,
      miniAvatarUrl: SILHOUETTE,
      name: 'Empty',
      title: 'Software Lead',
      handle: 'Empty_SW',
      status: 'Not available',
    },
  },
  {
    icon: FaBolt,
    title: 'Electrical Engineering',
    leader: {
      avatarUrl: SILHOUETTE,
      miniAvatarUrl: SILHOUETTE,
      name: 'Empty',
      title: 'EE Lead',
      handle: 'Empty_EE',
      status: 'Not available',
    },
  },
]

export default function Features() {
  return (
    <section id="features" className={styles.features}>
      {features.map(({ icon: Icon, title, leader }) => (
        <div key={title} className={styles.featureItem}>
          <PixelCard variant="blue">
            <Icon size={48} />
            <h3>{title}</h3>
          </PixelCard>

          <ProfileCard
            avatarUrl={leader.avatarUrl}
            miniAvatarUrl={leader.miniAvatarUrl}
            name={leader.name}
            title={leader.title}
            handle={leader.handle}
            status={leader.status}
            contactText="Message"
            onContactClick={() =>
              console.log(`Contact ${leader.handle}`)
            }
            className={`${styles.profileCard} ${styles.anonymous}`}
          />
        </div>
      ))}
    </section>
  )
}
