import { Clock } from 'lucide-react';
import Placeholder from './Placeholder';

export default function ActivityHistory() {
    return (
        <Placeholder 
            title="Activity History" 
            icon={Clock} 
            description="Review your recent account activities, including sign-ins, security changes, and profile updates."
        />
    );
}
