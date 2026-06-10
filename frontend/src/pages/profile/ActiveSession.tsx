import { Activity } from 'lucide-react';
import Placeholder from './Placeholder';

export default function ActiveSession() {
    return (
        <Placeholder 
            title="Active Session" 
            icon={Activity} 
            description="View and terminate your current active sessions across different browsers and devices."
        />
    );
}
