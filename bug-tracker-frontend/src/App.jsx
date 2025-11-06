import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BugList from './pages/BugList';
import CreateBug from './pages/CreateBug';
import EditBug from './pages/EditBug';
import ViewBug from './pages/ViewBug';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<BugList />} />
        <Route path="/create" element={<CreateBug />} />
        <Route path="/edit/:id" element={<EditBug />} />
        <Route path="/bugs/:id" element={<ViewBug />} />
      </Routes>
    </div>
  );
}
