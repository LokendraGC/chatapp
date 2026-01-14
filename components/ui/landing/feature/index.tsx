import { BookOpen, MessageCircleHeart, ShieldCheck } from 'lucide-react'
import React from 'react'

const Features = () => {
    return (
        <section id="features" className="py-32 px-6 max-w-6xl mx-auto">
            <div className="mb-20 flex flex-col items-center text-center gap-4">
                <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight">
                    Designed for trust.
                </h2>
                <p className="text-xl text-zinc-500 font-light max-w-xl leading-relaxed mt-4">
                    Built with privacy and security at its core, our chatbot ensures your
                    data remains confidential and protected.
                </p>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                <div className="group p-8 rounded-3xl border border-white/5 bg-linear-to-b from-white/3 to-transparent hover:border-white transition-colors">
                    <BookOpen className="w-6 h-6 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-3">
                        Knowledge Graph
                    </h3>
                    <p className="text-sm text-zinc-400 font-light leading-relaxed">
                        We crawl your site and docs to build a structured understanding
                        of your product. No manual training required.
                    </p>
                </div>

                <div className="group p-8 rounded-3xl border border-white/5 bg-linear-to-b from-white/3 to-transparent hover:border-white transition-colors">
                    <ShieldCheck className="w-6 h-6 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-3">
                        Strict  Guardrails
                    </h3>
                    <p className="text-sm text-zinc-400 font-light leading-relaxed">
                        Define exactly what the AI can and cannot say. It will politely
                        decline out-of-scope questions.
                    </p>
                </div>


                <div className="group p-8 rounded-3xl border border-white/5 bg-linear-to-b from-white/3 to-transparent hover:border-white transition-colors">
                    <MessageCircleHeart className="w-6 h-6 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-3">
                        Tone Matching
                    </h3>
                    <p className="text-sm text-zinc-400 font-light leading-relaxed">
                        Define exactly what the AI can and cannot say. It will politely
                        decline out-of-scope questions.
                    </p>
                </div>

            </div>


        </section >

    )
}

export default Features