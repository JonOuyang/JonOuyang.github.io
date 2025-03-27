import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import Model from './components/Model';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
          <div>
            <h1>work history</h1>
          </div>
         </main>
        } />
        <Route path="/research" element={ // homepage
          <main className="bg-black">
          <Navbar />
          <div>
            <h1>research</h1>
          </div>
         </main>
        } />
        <Route path="/contact" element={ // homepage
          <main className="bg-black">
          <Navbar />
          <div>
            <h1>contact</h1>
          </div>
         </main>
        } />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
