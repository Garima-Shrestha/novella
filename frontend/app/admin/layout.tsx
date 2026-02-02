import Header from "./_components/Header";
import Sidebar from "./_components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex w-full min-h-screen bg-white'>
            <Sidebar />
            <div className='flex flex-col flex-grow ml-56 bg-white min-w-0'>
                <Header />
                <main className="p-4 bg-white">
                    {children}
                </main>
            </div>
        </div>
    );
}