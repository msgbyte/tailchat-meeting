import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { EntryPage } from './pages/Entry';
import { MeetingPage } from './pages/Meeting';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/meeting/:meetingId" element={<MeetingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
