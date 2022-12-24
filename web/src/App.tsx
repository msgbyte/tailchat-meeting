import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { EntryPage } from './pages/Entry';
import { MainPage } from './pages/Main';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/main/:meetingId" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
