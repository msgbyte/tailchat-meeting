import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { EntryPage } from './pages/Entry';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
