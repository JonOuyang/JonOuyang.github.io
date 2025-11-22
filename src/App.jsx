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
const GitHubExperience = lazy(() => import('./experience-components/GitHubExperience'));
const GitHubRepoViewer = lazy(() => import('./experience-components/GitHubRepoViewer'));
const ProjectsPage = lazy(() => import('./projects-components/ProjectsPage'));
const Opener = lazy(() => import('./Opener/Opener'));
const PersonalSite = lazy(() => import('./components/PersonalSite.tsx'));
const PublicHome = lazy(() => import('./components/PublicHome'));

import { experienceData } from './experience-components/experiences';
import { extracurricularData } from './experience-components/extracurriculars';
import { contributorsData } from './experience-components/contributors';
import { researchData } from './research-components/researchData';

// Loading fallback component
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: 'white' }}>
    Loading...
  </div>
);

const ExperimentalHome = () => (
  <main className="bg-black">
    <Navbar />
    <Suspense fallback={<Loading />}>
      <Hero />
      <Highlights />
      <Features />
      <HowItWorks />
      <Footer />
    </Suspense>
  </main>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Suspense fallback={<Loading />}>
                <PublicHome />
              </Suspense>
            </>
          }
        />
        <Route
          path="/experimental-home"
          element={<ExperimentalHome />}
        />
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
              <GitHubExperience
                workData={experienceData}
                extracurricularData={extracurricularData}
                contributors={contributorsData}
              />
            </Suspense>
         </main>
        } />
        <Route path="/work-history/:folderPath" element={ // dynamic folder view
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <GitHubRepoViewer />
            </Suspense>
         </main>
        } />
        <Route path="/work-history/:folderPath/:fileName" element={ // dynamic file view
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <GitHubRepoViewer />
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
        <Route path="/projects" element={ // projects page
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <ProjectsPage />
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
