import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import Factories from "@/components/Factories";
import Services from "@/components/Services";
import Products from "@/components/Products";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <Philosophy />
      <Factories />
      <Services />
      <Products />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
