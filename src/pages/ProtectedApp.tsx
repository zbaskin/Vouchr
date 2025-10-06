import { Authenticator } from '@aws-amplify/ui-react';
import AppShell from '../AppShell';

export default function ProtectedApp() {
    return (
        <Authenticator>
            <AppShell />
        </Authenticator>
    );
}
