import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t bg-background">
            <div className="container py-8">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="flex flex-col gap-2">
                        <Link to="/" className="flex items-center gap-2 mb-2">
                            <Zap className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold font-heading">Astra</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">AI-powered tools for neurodiverse journeys.</p>
                    </div>
                    <div className="grid grid-cols-2 md:col-span-2 gap-8">
                        <div>
                            <h4 className="font-semibold mb-2">Platform</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/screener" className="text-muted-foreground hover:text-primary">Screener</Link></li>
                                <li><Link to="/gym" className="text-muted-foreground hover:text-primary">Sensory Gym</Link></li>
                                <li><Link to="/resources" className="text-muted-foreground hover:text-primary">Resource Hub</Link></li>
                                <li><Link to="/forum" className="text-muted-foreground hover:text-primary">Parent Forum</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                                <li><Link to="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Project Astra. A Submission for SIH.
                </div>
            </div>
        </footer>
    );
};

export default Footer;