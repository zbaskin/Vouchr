import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const { authStatus } = useAuthenticator((context) => [context.authStatus]);

    useEffect(() => {
        if (authStatus === 'authenticated') {
            navigate('/app', { replace: true });
        }
    }, [authStatus, navigate]);

    return (
        <div style={{ maxWidth: 420, margin: '4rem auto' }}>
            <Authenticator />
        </div>
    );
}
