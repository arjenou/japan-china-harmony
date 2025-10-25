import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="gradient-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.company')}</h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>{t('services.service1.title')}</li>
              <li>{t('services.service2.title')}</li>
              <li>{t('services.service3.title')}</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.contact')}</h4>
            <p className="text-sm text-primary-foreground/80">
              {t('footer.phone')}: {t('contact.phoneValue')}<br />
              {t('footer.email')}: {t('contact.emailValue')}<br />
              <span className="inline-block" style={{ marginLeft: '3.5em' }}>{t('contact.emailValue2')}</span>
            </p>
          </div>
        </div>
        
        <div className="pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/80">
          <p>&copy; {new Date().getFullYear()} {t('footer.company')}. {t('footer.copyright')}。</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
