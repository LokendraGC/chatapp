import Image from 'next/image'
import React from 'react'

const Hero = () => {
    return (
        <section className='relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden'>
            <div className="max-w-4xl mx-auto text-center relative z-20">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-6 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                    <span className="text-xs text-zinc-300 tracking-wide font-light">
                        Version 1.0.0 available now
                    </span>
                </div>
                <h1 className='text-5xl md:text-6xl font-extrabold leading-tight tracking-tighter mb-6 text-white'>
                    Your AI-Powered Support Chatbot
                    <br />
                    <span className='text-zinc-500'>Powered by AI</span>
                </h1>
                <p className='text-lg md:text-xl text-zinc-400 font-light mb-10 max-w-2xl mx-auto leading-relaxed'>
                    Instantly resolve customer questions with an assistant that reads your
                    speaks with empathy. No robotic replies, just answers.
                </p>
                <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-20'>
                    <button className='h-11 cursor-pointer px-8 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all flex items-center gap-2'>
                        Start for Free
                    </button>
                    <button className='h-11 cursor-pointer px-8 rounded-full border border-zinc-800  text-zinc-300 text-sm font-medium hover:text-white transition-all flex items-center gap-2 bg-black/30'>
                        Watch Demo
                    </button>
                </div>
            </div>

            {/* floating chat interface */}
            <div className='max-w-3xl mx-auto relative z-10'>
                <div className='absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none'>

                </div>
                <div className='p-1 md:p-2 relative overflow-hidden ring-1 ring-white/10 bg-[#0a0a0e] shadow-2xl rounded-2xl'>
                    {/* Main Chat Container */}
                    <div className='flex flex-col h-125 md:h-150 w-full bg-[#0a0a0e]'>

                        {/* Header Section */}
                        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#0E0E13] shrink-0">
                            <div className="flex items-center gap-2">
                                {/* The Pulsing Dot: Self-closing div to prevent text breaking */}
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                                {/* The Text: Placed outside the dot div */}
                                <span className="text-sm font-medium text-zinc-300">
                                    K Xa Hajur Chatbot.
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-zinc-950/30">
                            <div className="flex flex-col w-full items-start">
                                <div className="flex max-w-[85%] gap-3 items-start"> {/* change to items-center if you want */}

                                    {/* Avatar */}
                                    <div className="shrink-0">
                                        <Image
                                            src="/images/avatar.jpg"
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full object-cover"
                                            alt="User Avatar"
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <div className="p-4 rounded-2xl text-sm leading-relaxed shadow-sm bg-white text-zinc-900 rounded-tl-[24px]">
                                            Hi there, How can I help you today?
                                        </div>

                                        <div className='flex flex-wrap gap-2 pt-1 ml-1'>
                                            <span className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-xs font-medium cursor-default">FAQ</span>
                                            <span className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-xs font-medium cursor-default">Pricing</span>
                                            <span className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-xs font-medium cursor-default">Support</span>
                                        </div>

                                    </div>


                                </div>

                            </div>
                        </div>


                    </div>
                </div>
            </div >
        </section >
    )
}

export default Hero