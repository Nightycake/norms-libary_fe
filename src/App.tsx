import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import Home from '../src/pages/Home/Home';
import Header from '../src/components/Header/Header';
import Footer from '../src/components/Footer/Footer';

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        {/* <Route path="/component" element={<Component />} /> */}
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
