import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Highlights = lazy(() => import('./components/Highlights'));
const Features = lazy(() => import('./components/Features'));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const Footer = lazy(() => import('./components/Footer'));
const GlowingHeader = lazy(() => import('./components/GlowingHeader'));
const ResearchPage = lazy(() => import('./components/ResearchPage'));
const GitHubExperience = lazy(() => import('./experience-components/GitHubExperience'));
const GitHubRepoViewer = lazy(() => import('./experience-components/GitHubRepoViewer'));
const ProjectsPage = lazy(() => import('./projects-components/ProjectsPage'));
const PersonalSite = lazy(() => import('./components/PersonalSite.tsx'));
const PublicHome = lazy(() => import('./components/PublicHome'));

const Opener = lazy(() => import('./hidden/home/Opener/Opener'));
const NetflixProjectsPage = lazy(() => import('./hidden/projects/NetflixProjectsPage'));
const ProjectDetailPage = lazy(() => import('./hidden/projects/ProjectDetailPage'));

import { experienceData } from './experience-components/experiences';
import { extracurricularData } from './experience-components/extracurriculars';
import { contributorsData } from './experience-components/contributors';

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: 'white' }}>
    Loading...
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* === VISIBLE ROUTES === */}
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
        <Route path="/work-history" element={
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
        <Route path="/work-history/:folderPath" element={
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <GitHubRepoViewer />
            </Suspense>
         </main>
        } />
        <Route path="/work-history/:folderPath/:fileName" element={
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <GitHubRepoViewer />
            </Suspense>
         </main>
        } />
        <Route path="/research" element={
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <ResearchPage></ResearchPage>
            </Suspense>
         </main>
        } />
        <Route path="/projects" element={
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <NetflixProjectsPage />
            </Suspense>
         </main>
        } />
        <Route path="/projects/:projectId" element={
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <ProjectDetailPage />
            </Suspense>
         </main>
        } />

        {/* === HIDDEN/EXPERIMENTAL ROUTES === */}
        <Route
          path="/experimental-home"
          element={
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
          }
        />
        <Route path="/test-home" element={
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
        <Route path="/beta" element={
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
        <Route path="/beta-2" element={
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <PersonalSite />
            </Suspense>
         </main>
        } />
        <Route path="/old-projects" element={
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <ProjectsPage />
            </Suspense>
         </main>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
