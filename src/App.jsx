import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import GlowingHeader from './components/GlowingHeader';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { experienceData } from './experience-components/experiences';
import { researchData } from './research-components/researchData';
import ExperienceGraph from './experience-components/ExperienceGraph';
import ResearchPage from './components/ResearchPage';
import Opener from './Opener/Opener';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ // homepage
          <main className="bg-black">
          <Navbar />
          <Hero />
          <Highlights />
          <Features />
          <HowItWorks/>
          <Footer/>
         </main>
        } />
        <Route path="/test-home" element={ // test dev homepage
          <main className="bg-black">
          <Navbar />
          <Opener />
          <Highlights />
          <Features />
          <HowItWorks/>
          <Footer />
         </main>
        } />
        <Route path="/work-history" element={ // work history page
          <main className="bg-black">
          <Navbar />
          <GlowingHeader>Experience</GlowingHeader>
          <h1 style={{ textAlign: 'center', color: '#e2e8f0' }}>
            Professional Work History. For Research history, please view the Research page.
          </h1>
          <ExperienceGraph
            experiences={experienceData.experiences}
            branches={experienceData.branches}
          />
         </main>
        } />
        <Route path="/research" element={ // research page
          <main className="bg-black">
          <Navbar />
          <GlowingHeader>Research</GlowingHeader>
          {/* <Timeline experiences={researchData} /> */}
          <ResearchPage></ResearchPage>
         </main>
        } />
        <Route path="/contact" element={ // contact page
          <main className="bg-black">
          <Navbar />
          <GlowingHeader>Contacts</GlowingHeader>
         </main>
        } />
        <Route path="/beta" element={ // beta testing page
          <main className="bg-black">
          <Navbar />
          <Opener />
          <Highlights />
          <Features />
          <HowItWorks/>
          <Footer />
         </main>
        } />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
