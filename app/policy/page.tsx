import { Footer } from "@/components/ui/landing/footer";
import Navbar from "@/components/ui/landing/nav";

const PolicyPage = () => {
  return (
    <main className="w-full max-w-[100vw] overflow-x-hidden flex flex-col relative z-10">
      <Navbar />
      <div className="min-h-screen bg-black text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto mt-10">
          <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight">
            Privacy Policy
          </h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. Introduction
              </h2>
              <p className="leading-relaxed">
                Welcome to the Privacy Policy for Sahayak Webtech Bot. We are
                committed to protecting your personal information and your right
                to privacy. If you have any questions or concerns about this
                privacy notice, or our practices with regards to your personal
                information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. Information We Collect
              </h2>
              <p className="leading-relaxed">
                When you use the Sahayak Webtech Bot, we may collect personal
                information that you voluntarily provide to us when expressing
                an interest in obtaining information about us or our products
                and services, or otherwise when you contact us. The personal
                information that we collect depends on the context of your
                interactions with us and the bot, the choices you make, and the
                products and features you use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. How We Use Your Information
              </h2>
              <p className="leading-relaxed">
                We use personal information collected via our Sahayak Webtech
                Bot for a variety of business purposes described below. We
                process your personal information for these purposes in reliance
                on our legitimate business interests, in order to enter into or
                perform a contract with you, with your consent, and/or for
                compliance with our legal obligations.
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>To facilitate account creation and logon process.</li>
                <li>To send administrative information to you.</li>
                <li>To fulfill and manage your orders.</li>
                <li>
                  To deliver and facilitate delivery of services to the user.
                </li>
                <li>To respond to user inquiries/offer support to users.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Will Your Information Be Shared With Anyone?
              </h2>
              <p className="leading-relaxed">
                We only share information with your consent, to comply with
                laws, to provide you with services, to protect your rights, or
                to fulfill business obligations. We may process or share your
                data that we hold based on the following legal basis: Consent,
                Legitimate Interests, Performance of a Contract, or Legal
                Obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. How Long Do We Keep Your Information?
              </h2>
              <p className="leading-relaxed">
                We will only keep your personal information for as long as it is
                necessary for the purposes set out in this privacy notice,
                unless a longer retention period is required or permitted by
                law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                6. Contact Us
              </h2>
              <p className="leading-relaxed">
                If you have questions or comments about this notice, you may
                email us at support@sahayakwebtech.com.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default PolicyPage;
