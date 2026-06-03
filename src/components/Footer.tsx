import { useTranslation } from "react-i18next";

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-navy text-white py-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4">TransitSmart</h3>
                        <p className="text-gray-300 text-sm">
                            {t('footer.desc')}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4">{t('footer.links')}</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="#" className="hover:text-orange transition-colors">{t('footer.aboutUs')}</a></li>
                            <li><a href="#" className="hover:text-orange transition-colors">{t('footer.terms')}</a></li>
                            <li><a href="#" className="hover:text-orange transition-colors">{t('footer.privacy')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4">{t('footer.contact')}</h3>
                        <p className="text-gray-300 text-sm">
                            Email: transitsmart@gmail.com<br />
                            Phone: (84) 0326 312 501
                        </p>
                    </div>
                </div>
                <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} TransitSmart. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

