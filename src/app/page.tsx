'use client';

// import dynamic from 'next/dynamic';

// Динамический импорт Scene компонента с отключенным SSR
// const Scene = dynamic(() => import('@/components/Scene/index'), {
//   ssr: false,
// });

export default function Home() {
  return (
    <main className='min-h-screen'>
      <div className='w-screen h-screen relative'>
        {/* <Scene /> */}
        <div className='absolute top-4 left-4 text-white'>
          <h1 className='text-2xl font-bold'>3D Viewer</h1>
        </div>
      </div>
    </main>
  );
}
