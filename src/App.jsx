import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const ResearchPage = lazy(() => import('./components/ResearchPage'));
const GitHubExperience = lazy(() => import('./experience-components/GitHubExperience'));
const GitHubRepoViewer = lazy(() => import('./experience-components/GitHubRepoViewer'));
const PublicHome = lazy(() => import('./components/PublicHome'));
const WIP = lazy(() => import('./components/WIP'));

const NetflixProjectsPage = lazy(() => import('./hidden/projects/NetflixProjectsPage'));
const NetflixProjectsPage2 = lazy(() => import('./hidden/projects/NetflixProjectsPage2'));
const ProjectDetailPage = lazy(() => import('./hidden/projects/ProjectDetailPage'));
const ProjectDetailPage2 = lazy(() => import('./hidden/projects/ProjectDetailPage2'));
const ExperimentalProjectsPage = lazy(() => import('./experimental/projects/ExperimentalProjectsPage'));
const ExperimentalProjectDetailPage = lazy(() => import('./experimental/projects/ExperimentalProjectDetailPage'));

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
        <Route path="/projects2" element={
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <NetflixProjectsPage2 />
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
        <Route path="/projects2/:projectId" element={
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <ProjectDetailPage2 />
            </Suspense>
         </main>
        } />
        <Route path="/experimental-projects" element={
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <ExperimentalProjectsPage />
            </Suspense>
         </main>
        } />
        <Route path="/experimental-projects/:projectId" element={
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <ExperimentalProjectDetailPage />
            </Suspense>
         </main>
        } />
        <Route path="/wip" element={
          <main className="bg-black">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <WIP />
            </Suspense>
         </main>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App
