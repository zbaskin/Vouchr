import { useAuthenticator } from '@aws-amplify/ui-react';
import { Navigate } from 'react-router-dom';
import AppShell from '../AppShell';

export default function ProtectedApp() {
    const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

    // "configuring" is Amplify's initial state while it resolves an existing session.
    // Redirecting here would cause a loop: /app → /login → /app → …
    if (authStatus === 'configuring') {
        return <main className="bg-background min-h-screen" />;
    }

    if (authStatus !== 'authenticated') {
        return <Navigate to="/login" replace />;
    }

    return <AppShell />;
}
