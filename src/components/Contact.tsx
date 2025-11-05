import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Building } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, language }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: t('contact.successTitle'),
          description: t('contact.successMessage'),
        });
        setFormData({ name: "", email: "", company: "", message: "" });
      } else {
        toast({
          title: t('contact.errorTitle') || '发送失败',
          description: data.error || t('contact.errorMessage') || '发送邮件时出现错误，请稍后重试',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: t('contact.errorTitle') || '发送失败',
        description: t('contact.errorMessage') || '发送邮件时出现错误，请稍后重试',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-20 gradient-subtle overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          {t('contact.title')}
        </h2>
        <div className="w-20 h-1 gradient-accent mx-auto mb-12 rounded-full" />
        
        <div className="space-y-12 mx-auto">
          {/* Contact Form Container */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-card p-8 rounded-xl shadow-card border border-border">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-2 text-foreground">
                    {t('contact.name')} {t('contact.required')}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2 text-foreground">
                    {t('contact.email')} {t('contact.required')}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold mb-2 text-foreground">
                    {t('contact.company')}
                  </label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-2 text-foreground">
                    {t('contact.message')} {t('contact.required')}
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary-glow text-primary-foreground shadow-glow transition-smooth"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('contact.sending') || '发送中...' : t('contact.send')}
                </Button>
              </form>
            </div>
          </div>
          
          {/* Company Info and Map Container */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="bg-card p-8 rounded-xl shadow-card border border-border">
              <h3 className="text-2xl font-bold mb-6 text-foreground">{t('contact.companyInfo')}</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">{t('contact.companyName')}</p>
                    <p className="text-muted-foreground leading-snug">
                      Office I, 15/F, Huamin Hanjun Tower, 726 Yan'an West Road,<br />
                      Changning District, Shanghai, China 〒200050
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t('contact.phone')}</p>
                    <p className="text-muted-foreground">{t('contact.phoneValue')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t('contact.emailLabel')}</p>
                    <p className="text-muted-foreground">{t('contact.emailValue')}</p>
                    <p className="text-muted-foreground">{t('contact.emailValue2')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map */}
            <div className="bg-card p-4 rounded-xl shadow-card border border-border">
              <div className="aspect-video bg-secondary/30 rounded-lg overflow-hidden relative">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=121.4346%2C31.2194%2C121.4446%2C31.2244&layer=mapnik&marker=31.2219%2C121.4396"
                  className="w-full h-full border-0"
                  title={t('contact.mapTitle')}
                  allowFullScreen
                />
                <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs">
                  <a 
                    href="https://www.openstreetmap.org/?mlat=31.2219&mlon=121.4396#map=16/31.2219/121.4396"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {t('contact.mapViewLarge')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
