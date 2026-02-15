import Header from "./_components/Header";
import Footer from "./_components/Footer";

export default function BookBeforeRentingLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header />
      <main className="flex-grow px-4 md:px-10 py-6">
        {children}
      </main>
      <Footer />
    </div>
    );
}