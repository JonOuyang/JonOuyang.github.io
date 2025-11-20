import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load components that aren't immediately visible
const Highlights = lazy(() => import('./components/Highlights'));
const Features = lazy(() => import('./components/Features'));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const Footer = lazy(() => import('./components/Footer'));
const GlowingHeader = lazy(() => import('./components/GlowingHeader'));
const ResearchPage = lazy(() => import('./components/ResearchPage'));
const ExperienceGraph = lazy(() => import('./experience-components/ExperienceGraph'));
const Opener = lazy(() => import('./Opener/Opener'));
const PersonalSite = lazy(() => import('./components/PersonalSite.tsx'));

import { experienceData } from './experience-components/experiences';
import { researchData } from './research-components/researchData';

// Loading fallback component
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: 'white' }}>
    Loading...
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ // homepage
          <main className="bg-black">
            <Navbar />
            <Hero />
            <Suspense fallback={<Loading />}>
              <Highlights />
              <Features />
              <HowItWorks/>
              <Footer/>
            </Suspense>
         </main>
        } />
        <Route path="/test-home" element={ // test dev homepage
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <Opener />
              <Highlights />
              <Features />
              <HowItWorks/>
              <Footer />
            </Suspense>
         </main>
        } />
        <Route path="/work-history" element={ // work history page
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <GlowingHeader>Experience</GlowingHeader>
              <h1 style={{ textAlign: 'center', color: '#e2e8f0' }}>
                Professional Work History. For Research history, please view the Research page.
              </h1>
              <ExperienceGraph
                experiences={experienceData.experiences}
                branches={experienceData.branches}
              />
            </Suspense>
         </main>
        } />
        <Route path="/research" element={ // research page
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <GlowingHeader>Research</GlowingHeader>
              <ResearchPage></ResearchPage>
            </Suspense>
         </main>
        } />
        <Route path="/contact" element={ // contact page
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <GlowingHeader>Contacts</GlowingHeader>
            </Suspense>
         </main>
        } />
        <Route path="/beta" element={ // beta testing page
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <Opener />
              <Highlights />
              <Features />
              <HowItWorks/>
              <Footer />
            </Suspense>
         </main>
        } />
        <Route path="/beta-2" element={ // beta 2 page
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <PersonalSite />
            </Suspense>
         </main>
        } />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
