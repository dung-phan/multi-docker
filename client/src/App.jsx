import './App.css'
import { Route, Routes, Link } from 'react-router-dom';
import Fib from './Fib';
import OtherPage from './OtherPage';

function App() {

  return (
    <>
     <header>
          <Link to="/">Home</Link>
          <Link to="/other">Other Page</Link>
      </header>
      <Routes>
            <Route exact path="/" element={<Fib /> } />
            <Route path="/other" element={<OtherPage />} />
      </Routes>
    </>
  )
}

export default App
