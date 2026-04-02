import { useAuthenticator } from '@aws-amplify/ui-react';
import { Navigate } from 'react-router-dom';
import AppShell from '../AppShell';

export default function ProtectedApp() {
    const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

    if (authStatus !== 'authenticated') {
        return <Navigate to="/login" replace />;
    }

    return <AppShell />;
}
