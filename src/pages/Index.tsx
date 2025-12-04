import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StudioSpecs from "@/components/StudioSpecs";
import Gallery from "@/components/Gallery";
import Packages from "@/components/Packages";
import Services from "@/components/Services";
import Availability from "@/components/Availability";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Sunday Studio - Largest Infinity Wall in Lahore | Films, Ads & Fashion</title>
        <meta 
          name="description" 
          content="Sunday Studio offers the largest infinity wall in Lahore. Perfect for films, advertisements & fashion shoots. 105 ft seamless wall, professional lighting & equipment." 
        />
        <meta name="keywords" content="infinity wall, Lahore studio, film production, fashion shoots, advertising studio, professional photography studio" />
      </Helmet>
      
      <Navbar />
      <main>
        <Hero />
        <StudioSpecs />
        <Gallery />
        <Packages />
        <Services />
        <Availability />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default Index;
