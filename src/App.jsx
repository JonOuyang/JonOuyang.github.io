import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import MobileDock from './components/MobileDock';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const ResearchPage = lazy(() => import('./components/ResearchPage'));
const GitHubExperience = lazy(() => import('./experience-components/GitHubExperience'));
const GitHubRepoViewer = lazy(() => import('./experience-components/GitHubRepoViewer'));
const PublicHome = lazy(() => import('./components/PublicHome'));
const WIP = lazy(() => import('./components/WIP'));
const WIPHome = lazy(() => import('./wip/home/WIPHome'));
const CardPage = lazy(() => import('./experimental/card/CardPage'));
const AGYHomePage = lazy(() => import('./experimental/home/AGYHomePage'));
const NetflixPage = lazy(() => import('./experimental/netflix/NetflixPage'));
const WalkPage = lazy(() => import('./experimental/walk/WalkPage'));
const KineticHome = lazy(() => import('./experimental/kinetic/KineticHome'));
const ChatPage = lazy(() => import('./experimental/chat/ChatPage'));
const DeloreanPage = lazy(() => import('./experimental/delorean/DeloreanPage'));
const GlassesPage = lazy(() => import('./experimental/glasses/GlassesPage'));
const Labs = lazy(() => import('./components/Labs'));

const ProjectsPage = lazy(() => import('./hidden/projects/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./hidden/projects/ProjectDetailPage2'));
const ExperimentalProjectsPage = lazy(() => import('./experimental/projects/ExperimentalProjectsPage'));
const ProjectsV2Page = lazy(() => import('./experimental/projects-v2/ProjectsV2Page'));
const ExperimentalProjectDetailPage = lazy(() => import('./experimental/projects/ExperimentalProjectDetailPage'));

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
            <main className="bg-black min-h-screen">
              <Suspense fallback={<Loading />}>
                <ChatPage />
              </Suspense>
            </main>
          }
        />
        <Route path="/kinetic" element={
          <main className="bg-black min-h-screen">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <KineticHome />
            </Suspense>
         </main>
        } />
        <Route
          path="/old-home"
          element={
            <>
              <Navbar />
              <MobileDock />
              <Suspense fallback={<Loading />}>
                <PublicHome />
              </Suspense>
            </>
          }
        />
        <Route path="/work-history" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <GitHubExperience />
            </Suspense>
         </main>
        } />
        <Route path="/work-history/:folderPath" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <GitHubRepoViewer />
            </Suspense>
         </main>
        } />
        <Route path="/work-history/:folderPath/:fileName" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <GitHubRepoViewer />
            </Suspense>
         </main>
        } />
        <Route path="/research" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <ResearchPage></ResearchPage>
            </Suspense>
         </main>
        } />
        <Route path="/projects" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <ProjectsPage />
            </Suspense>
         </main>
        } />
        <Route path="/projects/:projectSlug" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <ProjectDetailPage />
            </Suspense>
         </main>
        } />
        <Route path="/projects-v2" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <ProjectsV2Page />
            </Suspense>
         </main>
        } />
        <Route path="/experimental-projects" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <ExperimentalProjectsPage />
            </Suspense>
         </main>
        } />
        <Route path="/experimental-projects/:projectId" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <ExperimentalProjectDetailPage />
            </Suspense>
         </main>
        } />
        <Route path="/wip" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <WIP />
            </Suspense>
         </main>
        } />
        <Route path="/wip/home" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <WIPHome />
            </Suspense>
         </main>
        } />
        <Route path="/card" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <CardPage />
            </Suspense>
         </main>
        } />
        <Route path="/agy-home" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <AGYHomePage />
            </Suspense>
         </main>
        } />
        <Route path="/netflix" element={
          <main className="bg-black">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <NetflixPage />
            </Suspense>
         </main>
        } />
        <Route path="/walk" element={
          <main className="bg-white min-h-screen">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <WalkPage />
            </Suspense>
          </main>
        } />
        <Route path="/delorean" element={
          <main className="bg-black min-h-screen">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <DeloreanPage />
            </Suspense>
         </main>
        } />
        <Route path="/glasses" element={
          <main className="bg-black min-h-screen">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <GlassesPage />
            </Suspense>
         </main>
        } />
        <Route path="/chat" element={
          <main className="bg-black min-h-screen">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <ChatPage />
            </Suspense>
         </main>
        } />
        <Route path="/labs" element={
          <main className="bg-black min-h-screen">
            <Navbar />
            <MobileDock />
            <Suspense fallback={<Loading />}>
              <Labs />
            </Suspense>
          </main>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App
