import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <Card className="max-w-md text-center p-10">
        <div className="text-6xl font-bold mb-4 text-gradient">404</div>
        <h2 className="text-2xl font-bold mb-2 text-gradient">Page Not Found</h2>
        <p className="text-sm text-gradient mb-8">
          The requested route does not exist within the Arsenal workspace.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="primary" onClick={() => navigate('/')}>
            Return Home
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  );
}

