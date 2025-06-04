import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import theme from './styles/theme';
import Battle from './pages/Battle';
import Results from './pages/Results';
import GlobalRanking from './pages/GlobalRanking';
import Callback from './pages/Callback';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Battle />} />
            <Route path="/battle" element={<Navigate to="/" replace />} />
            <Route path="/results" element={<Results />} />
            <Route path="/global-ranking" element={<GlobalRanking />} />
            <Route path="/callback" element={<Callback />} />
          </Routes>
        </Layout>
      </Router>
    </ChakraProvider>
  );
}

export default App; 