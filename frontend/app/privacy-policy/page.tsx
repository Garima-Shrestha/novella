export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="max-w-[800px] mx-auto bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-gray-100">
        
        {/* Header Section */}
        <div className="text-left mb-10">
          <h1 className="text-3xl font-black text-[#001F2B] tracking-tight">Privacy Policy</h1>
          <div className="h-1 w-10 bg-[#2d51df] mt-4 rounded-full"></div>
        </div>

        <div className="space-y-10">
          {/* Intro */}
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            Smart Book access values your privacy. This policy explains how we collect, use, and protect your data when you use our book rental app.
          </p>

          <div className="grid gap-8">
            {/* 1. Information We Collect */}
            <section>
              <h2 className="text-[11px] font-bold text-[#2d51df] uppercase tracking-[0.15em] mb-3">
                1. Information We Collect
              </h2>
              <p className="text-slate-700 mb-2 font-bold text-[13px]">We may collect:</p>
              <ul className="space-y-2">
                {[
                  "Name and email",
                  "Payment-related details (processed securely by third-party services)",
                  "Book rental history and reading activity",
                  "Device and usage data (e.g., IP address, app interactions)",
                  "Saved notes or quotes (optional)"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600">
                    <span className="text-[#2d51df] font-bold">•</span> {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* 2. How We Use Your Data */}
            <section>
              <h2 className="text-[11px] font-bold text-[#2d51df] uppercase tracking-[0.15em] mb-3">
                2. How We Use Your Data
              </h2>
              <p className="text-slate-700 mb-2 font-bold text-[13px]">We use your information to:</p>
              <ul className="space-y-2">
                {[
                  "Process book rentals and verify payments",
                  "Provide access to books during the rental period",
                  "Manage rental expiration and restrictions",
                  "Improve app performance and features",
                  "Send important updates and notifications",
                  "Keep the platform safe and prevent misuse"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600">
                    <span className="text-[#2d51df] font-bold">•</span> {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* 3. Sharing Your Data */}
            <section>
              <h2 className="text-[11px] font-bold text-[#2d51df] uppercase tracking-[0.15em] mb-3">
                3. Sharing Your Data
              </h2>
              <p className="text-slate-600 text-[13px] mb-3 leading-relaxed">
                We do not sell your data. We only share:
              </p>
              <ul className="space-y-2">
                {[
                  "Payment information with secure payment providers",
                  "Data with services that help us operate the app",
                  "Information if required by law or for safety purposes"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600">
                    <span className="text-[#2d51df] font-bold">•</span> {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* 4. Your Rights */}
            <section>
              <h2 className="text-[11px] font-bold text-[#2d51df] uppercase tracking-[0.15em] mb-3">
                4. Your Rights
              </h2>
              <p className="text-slate-700 mb-2 font-bold text-[13px]">You can:</p>
              <ul className="space-y-2">
                {[
                  "View or update your profile",
                  "Request deletion of your account",
                  "Access your stored data",
                  "Manage notification settings",
                  "Contact us with any privacy questions"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600">
                    <span className="text-[#2d51df] font-bold">•</span> {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* 5, 6, 7 Paragraphs */}
            <section>
              <h2 className="text-[11px] font-bold text-[#2d51df] uppercase tracking-[0.15em] mb-3">5. Data Security</h2>
              <p className="text-slate-600 text-[13px] leading-relaxed">We use secure systems to protect your data, but no system is completely risk-free. Please keep your account details safe.</p>
            </section>

            <section>
              <h2 className="text-[11px] font-bold text-[#2d51df] uppercase tracking-[0.15em] mb-3">6. Children's Privacy</h2>
              <p className="text-slate-600 text-[13px] leading-relaxed">Our app is not intended for children under 13. We do not knowingly collect their data.</p>
            </section>

            <section>
              <h2 className="text-[11px] font-bold text-[#2d51df] uppercase tracking-[0.15em] mb-3">7. Policy Updates</h2>
              <p className="text-slate-600 text-[13px] leading-relaxed">We may update this policy. If changes are significant, we will notify you via the app.</p>
            </section>

            {/* 8. Contact Us */}
            <section className="pt-4 border-t border-slate-100">
              <h2 className="text-[11px] font-bold text-[#2d51df] uppercase tracking-[0.15em] mb-3">
                8. Contact Us
              </h2>
              <p className="text-slate-600 text-[13px] mb-4">Have questions? Contact us at:</p>
              <div className="inline-flex items-center bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
                <span className="text-[13px] font-bold italic text-[#001F2B]">
                  📧 novella@gmail.com
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}