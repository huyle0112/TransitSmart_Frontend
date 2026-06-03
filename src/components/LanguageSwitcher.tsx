import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'ja', label: '日本語', flag: '🇯🇵' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' }
    ];

    const currentLang = languages.find(l => i18n.language?.startsWith(l.code)) || languages[0];

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 hover:border-orange bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange cursor-pointer"
            >
                <Globe className="h-4 w-4 text-orange" />
                <span>{currentLang.flag} {currentLang.label}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-navy border border-white/10 rounded-lg shadow-xl overflow-hidden z-[1000] animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="py-1">
                        {languages.map((lang) => {
                            const isSelected = i18n.language?.startsWith(lang.code);
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`flex items-center w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors cursor-pointer ${
                                        isSelected ? 'text-orange font-semibold bg-white/5' : 'text-white/80'
                                    }`}
                                >
                                    <span className="mr-2 text-base">{lang.flag}</span>
                                    <span>{lang.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
