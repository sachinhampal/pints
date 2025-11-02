import './App.css';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { Routes, Route } from "react-router-dom";
import AddPintPage from './components/AddPint';
import Dashboard from "./components/Dashboard";
import PintTable from "./components/PintTable";
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';

ModuleRegistry.registerModules([ AllCommunityModule ]);

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/history" element={<PintTable />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-pint" element={<AddPintPage />} />
      </Routes>
    </div>
  );
}

export default App;
