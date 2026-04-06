import { Mail } from 'lucide-react';
import Placeholder from './Placeholder';

export default function EmailAddress() {
    return (
        <Placeholder 
            title="Email Address" 
            icon={Mail} 
            description="Manage your primary and secondary email addresses for account recovery and notifications."
        />
    );
}
