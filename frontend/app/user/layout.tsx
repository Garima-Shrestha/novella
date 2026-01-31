import Header from "./_components/Header";
import Footer from "./_components/Footer";

export default function Layout({children}: {children: React.ReactNode}) {
    return (
        <section>
            <Header/>
            {children}
            <Footer/>
        </section>
    );
}