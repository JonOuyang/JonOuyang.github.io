import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import Model from './components/Model';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import GlowingHeader from './components/GlowingHeader';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { experiencesData } from './experience-components/experience';
import { extracurricularData } from './experience-components/extracurriculars';
import Timeline from './experience-components/ExperienceTimeline';
import ContactsSection from './contact-components/ContactSection';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ // homepage
          <main className="bg-black">
          <Navbar />
          <Hero />
          <Highlights />
          <Model />
          <Features />
          <HowItWorks/>
          <Footer/>
         </main>
        } />
        <Route path="/work-history" element={ // homepage
          <main className="bg-black">
          <Navbar />
          <GlowingHeader>Experience</GlowingHeader>
          <h1 style={{ textAlign: 'center', color: '#e2e8f0' }}>
            Professional Work History. For Research history, please view the Research page.
          </h1>
          <Timeline experiences={experiencesData} />
          <GlowingHeader>Extracurriculars</GlowingHeader>
          <Timeline experiences={extracurricularData} />
         </main>
        } />
        <Route path="/research" element={ // homepage
          <main className="bg-black">
          <Navbar />
          <GlowingHeader>Research</GlowingHeader>
         </main>
        } />
        <Route path="/contact" element={ // homepage
          <main className="bg-black">
          <Navbar />
          <GlowingHeader>Contacts</GlowingHeader>
         </main>
        } />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
