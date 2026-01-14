import Hero from '@/components/ui/landing/hero'
import Navbar from '@/components/ui/landing/nav'

const Page = () => {
  return (
    <main className='w-full flex flex-col relative z-10'>
      <Navbar />
      <Hero />
    </main>
  )
}

export default Page