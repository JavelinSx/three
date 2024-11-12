// src/components/ParticleBackground/ParticleBackgroundWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const ParticleBackground = dynamic(() => import('../index'), {
  ssr: false,
});

export default function ParticleBackgroundWrapper() {
  return <ParticleBackground />;
}
