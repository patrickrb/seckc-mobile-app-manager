'use client'

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/LoginForm';
import EventsList from '@/components/EventsList';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Mobile App Management</h1>
          <Button onClick={logout} variant="outline">
            Sign Out
          </Button>
        </div>
        <p className="text-gray-600 mt-2">
          Welcome, {user.email}
        </p>
      </div>
      
      <Separator className="mb-8" />
      
      <EventsList />
    </div>
  );
}
