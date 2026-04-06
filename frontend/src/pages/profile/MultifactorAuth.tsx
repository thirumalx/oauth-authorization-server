import { Fingerprint } from 'lucide-react';
import Placeholder from './Placeholder';

export default function MultifactorAuth() {
    return (
        <Placeholder 
            title="Multifactor Authentication" 
            icon={Fingerprint} 
            description="Add an extra layer of security to your account with 2FA, biometric, or hardware keys."
        />
    );
}
