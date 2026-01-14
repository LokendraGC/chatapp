import React from 'react'

const SocialProof = () => {
    return (
        <section className='py-12 border-y border-white/5 bg-black/20'>
            <div className='max-w-6xl mx-auto px-6 text-center'>
                <p className='text-xs font-medium text-zinc-600 uppercase tracking-widest mb-8'>
                    Trusted by developers worldwide
                </p>

                <div className='flex flex-wrap justify-center gap-12 md:gap-20 opacity-zinc/700'>
                    <span className='text-xl font-bold tracking-tight text-white flex items-center gap-1'>
                        Webtech
                    </span>

                    <span className='text-xl font-bold tracking-tight text-white flex items-center gap-1'>
                        Heritage
                    </span>


                    <span className='text-xl font-bold tracking-tight text-white italic font-serif'>
                        DevStudio
                    </span>

                    <span className='text-xl font-bold tracking-tight text-white italic font-serif'>
                        Amazon
                    </span>

                    <span className='text-xl font-bold tracking-tight text-white italic font-serif'>
                        Daraz
                    </span>

                </div>

            </div>

        </section>
    )
}

export default SocialProof