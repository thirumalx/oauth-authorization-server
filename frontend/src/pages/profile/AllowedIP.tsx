import { Shield } from 'lucide-react';
import Placeholder from './Placeholder';

export default function AllowedIP() {
    return (
        <Placeholder 
            title="Allowed IP Address" 
            icon={Shield} 
            description="Configure a whitelist of IP addresses allowed to access your account."
        />
    );
}
