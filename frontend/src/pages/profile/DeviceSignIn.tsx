import { Smartphone } from 'lucide-react';
import Placeholder from './Placeholder';

export default function DeviceSignIn() {
    return (
        <Placeholder 
            title="Device Sign-in" 
            icon={Smartphone} 
            description="Manage and monitor devices that are currently signed into your account."
        />
    );
}
