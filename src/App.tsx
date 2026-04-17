import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProtectedApp from './pages/ProtectedApp';
import TicketCollection from './components/TicketCollection';
import TicketForm from './components/TicketForm';
import Settings from './components/Settings';
import TicketDetail from './pages/TicketDetail';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Anything under /app requires auth */}
            <Route path="/app/*" element={<ProtectedApp />}>
                <Route index element={<Navigate to="collection" replace />} />
                <Route path="collection" element={<TicketCollection />} />
                <Route path="new" element={<TicketForm />} />
                <Route path="ticket/:id" element={<TicketDetail />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}