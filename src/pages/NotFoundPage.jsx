import { Link } from 'react-router-dom';
import { EmptyState, Button } from '../components/common/ui';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ink-50 grid place-items-center px-4">
      <div className="surface max-w-md w-full">
        <EmptyState
          icon="MapPinOff"
          title="Page not found"
          description="This route does not exist in the DoorCraft portal. Check the address or head back to your dashboard."
          action={<Link to="/dashboard"><Button variant="primary" icon="ArrowLeft">Back to dashboard</Button></Link>}
        />
      </div>
    </div>
  );
}
