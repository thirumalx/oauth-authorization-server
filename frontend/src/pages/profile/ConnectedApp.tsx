import { AppWindow } from 'lucide-react';
import Placeholder from './Placeholder';

export default function ConnectedApp() {
    return (
        <Placeholder 
            title="Connected App" 
            icon={AppWindow} 
            description="Manage third-party applications and services that have access to your account data."
        />
    );
}
