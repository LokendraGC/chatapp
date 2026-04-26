import { Footer } from "@/components/ui/landing/footer";
import Navbar from "@/components/ui/landing/nav";

export default function Terms() {
  return (
    <main className="w-full max-w-[100vw] overflow-x-hidden flex flex-col relative z-10">
      <Navbar />
      <div className="min-h-screen bg-black text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto mt-10">
          <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight">
            Terms of Service
          </h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By accessing or using the Sahayak Webtech Bot, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. Use License
              </h2>
              <p className="leading-relaxed">
                Permission is granted to temporarily use the Sahayak Webtech Bot for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Modify or copy the materials.</li>
                <li>Use the materials for any commercial purpose.</li>
                <li>Attempt to decompile or reverse engineer any software contained in the bot.</li>
                <li>Remove any copyright or other proprietary notations from the materials.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. Disclaimer
              </h2>
              <p className="leading-relaxed">
                The materials within the Sahayak Webtech Bot are provided on an 'as is' basis. Sahayak Webtech makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Limitations
              </h2>
              <p className="leading-relaxed">
                In no event shall Sahayak Webtech or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Sahayak Webtech Bot, even if Sahayak Webtech or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. Modifications
              </h2>
              <p className="leading-relaxed">
                Sahayak Webtech may revise these terms of service for its bot at any time without notice. By using this service you are agreeing to be bound by the then current version of these Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
