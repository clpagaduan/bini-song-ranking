import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Battle from './pages/Battle';
import Results from './pages/Results';
import GlobalRanking from './pages/GlobalRanking';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/results" element={<Results />} />
          <Route path="/global-ranking" element={<GlobalRanking />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
