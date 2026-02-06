import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";

// Logo

const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी (Hindi)" },
    { code: "bn", name: "বাংলা (Bengali)" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "mr", name: "मराठी (Marathi)" },
];

const navItems = [
    { name: "Home", sectionId: "hero" },
    { name: "Features", sectionId: "features" },
    { name: "About", sectionId: "about" },
    { name: "Programs", sectionId: "programs" },
    { name: "Contact", sectionId: "contact" },
];

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(languages[0]);
    const [activeSection, setActiveSection] = useState("hero");

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const scrollToSection = (sectionId: string) => {
        const section = document.getElementById(sectionId);
        if (section) {
            setIsMenuOpen(false);
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        sectionId: string
    ) => {
        e.preventDefault();
        scrollToSection(sectionId);
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 120;

            for (const item of navItems) {
                const section = document.getElementById(item.sectionId);
                if (section) {
                    const { offsetTop, offsetHeight } = section;
                    if (
                        scrollPosition >= offsetTop &&
                        scrollPosition < offsetTop + offsetHeight
                    ) {
                        setActiveSection(item.sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo */}
                    <a
                        href="#hero"
                        onClick={(e) => handleNavClick(e, "hero")}
                        className="flex items-center gap-2"
                    >
                        <img src="/logo.jpg" alt="logo" className="w-10 h-10" />
                        <span className="text-2xl font-bold gradient-text">GreenGrow</span>
                    </a>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <a
                                key={item.sectionId}
                                href={`#${item.sectionId}`}
                                onClick={(e) => handleNavClick(e, item.sectionId)}
                                className={`text-sm font-medium transition ${activeSection === item.sectionId
                                    ? "text-agri-600 border-b-2 border-agri-500"
                                    : "text-gray-700 hover:text-agri-600"
                                    }`}
                            >
                                {item.name}
                            </a>
                        ))}

                        {/* Static Language Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-agri-600"
                            >
                                <Globe className="h-4 w-4" />
                                {currentLanguage.code.toUpperCase()}
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {isLangOpen && (
                                <div className="absolute right-0 mt-2 w-44 rounded-md border bg-white shadow-md">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setCurrentLanguage(lang);
                                                setIsLangOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-agri-50"
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Auth Buttons */}
                        <Button asChild variant="outline" size="sm">
                            <Link to="/login">Login</Link>
                        </Button>
                        <Button asChild size="sm" className="bg-agri-500 text-white">
                            <Link to="/signup">Sign Up</Link>
                        </Button>
                    </div>

                    {/* Mobile Controls */}
                    <div className="md:hidden flex items-center gap-2">
                        <button onClick={() => setIsLangOpen(!isLangOpen)}>
                            <Globe className="h-5 w-5 text-gray-700" />
                        </button>

                        <Button asChild size="icon" variant="ghost">
                            <Link to="/login">
                                <User className="h-5 w-5" />
                            </Link>
                        </Button>

                        <button onClick={toggleMenu}>
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t">
                    {navItems.map((item) => (
                        <a
                            key={item.sectionId}
                            href={`#${item.sectionId}`}
                            onClick={(e) => handleNavClick(e, item.sectionId)}
                            className="block px-4 py-3 text-gray-700 hover:bg-agri-50"
                        >
                            {item.name}
                        </a>
                    ))}
                </div>
            )}
        </nav>
    );
}
