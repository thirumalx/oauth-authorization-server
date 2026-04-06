import { Lock } from 'lucide-react';
import Placeholder from './Placeholder';

export default function PasswordChange() {
    return (
        <Placeholder 
            title="Password" 
            icon={Lock} 
            description="Update your account password to maintain high security for your identity."
        />
    );
}
