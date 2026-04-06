import { Phone } from 'lucide-react';
import Placeholder from './Placeholder';

export default function MobileNumber() {
    return (
        <Placeholder 
            title="Mobile Number" 
            icon={Phone} 
            description="Update your mobile number for SMS-based two-factor authentication and account alerts."
        />
    );
}
