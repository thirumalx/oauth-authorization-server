import { LogIn } from 'lucide-react';
import Placeholder from './Placeholder';

export default function AppSignIn() {
    return (
        <Placeholder 
            title="App Sign-in" 
            icon={LogIn} 
            description="Configure app-specific passwords and manage sign-in settings for individual applications."
        />
    );
}
