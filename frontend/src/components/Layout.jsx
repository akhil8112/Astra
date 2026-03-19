import Navbar from './common/Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-primary-text">
            <Navbar />
            <main className="pt-24 px-8">
                {/*pt-24 adds padding to push content below the fixed navbar */}
                {children}
            </main>
        </div>
    );
};

export default Layout;