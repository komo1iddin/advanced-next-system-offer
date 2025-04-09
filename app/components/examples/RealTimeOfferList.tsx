'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription, ConnectionState } from '@/lib/react-query/subscriptions';
import { LoadingState } from '@/components/ui/LoadingState';
import { DataListSkeleton } from '@/components/ui/skeletons/DataListSkeleton';

// Define query keys for offers
const queryKeys = {
  all: ['offers'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  detail: (id: string) => [...queryKeys.all, 'detail', id] as const,
};

// Example offer type
interface StudyOffer {
  _id: string;
  title: string;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock API client function
const fetchOffers = async (): Promise<StudyOffer[]> => {
  // In a real app, this would be an API call
  return fetch('/api/study-offers')
    .then((res) => res.json())
    .catch((error) => {
      console.error('Error fetching offers:', error);
      return [];
    });
};

// Connection status component
const ConnectionStatus = ({ state }: { state: ConnectionState }) => {
  const colors = {
    [ConnectionState.CONNECTED]: 'bg-green-500',
    [ConnectionState.CONNECTING]: 'bg-yellow-500',
    [ConnectionState.DISCONNECTED]: 'bg-gray-500',
    [ConnectionState.ERROR]: 'bg-red-500',
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`h-3 w-3 rounded-full ${colors[state]}`} />
      <span className="text-sm text-gray-600">{state}</span>
    </div>
  );
};

export default function RealTimeOfferList() {
  const queryClient = useQueryClient();
  
  // Set up standard React Query
  const {
    data: offers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.lists(),
    queryFn: fetchOffers,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Set up real-time subscription
  const connectionState = useSubscription({
    resource: 'study-offers',
    queryKey: queryKeys.lists(),
    enabled: true,
    onMessage: (message) => {
      console.log('Received real-time update:', message);
      // Additional custom handling if needed
    },
  });

  // Simulate a new offer being created (for demo purposes)
  const simulateNewOffer = () => {
    const newOffer: StudyOffer = {
      _id: `temp-${Date.now()}`,
      title: `New Study Offer ${Math.floor(Math.random() * 1000)}`,
      price: Math.floor(Math.random() * 10000) / 100,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update the cache
    queryClient.setQueryData<StudyOffer[]>(queryKeys.lists(), (oldData = []) => {
      return [newOffer, ...oldData];
    });

    // In a real app, you would submit this to the server
    // and the WebSocket would notify all clients
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Study Offers</CardTitle>
          <p className="text-sm text-gray-500">
            Real-time updates using WebSocket subscriptions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus state={connectionState} />
          <Button onClick={simulateNewOffer}>Simulate New Offer</Button>
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <LoadingState
          isLoading={isLoading}
          error={error as Error}
          skeleton={<DataListSkeleton items={5} />}
        >
          <div className="space-y-4">
            {offers?.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No offers found</p>
            ) : (
              offers?.map((offer) => (
                <div
                  key={offer._id}
                  className="rounded-lg border p-4 transition-all hover:bg-gray-50"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{offer.title}</h3>
                      <p className="text-sm text-gray-500">
                        ${offer.price.toFixed(2)}
                      </p>
                    </div>
                    <Badge variant={offer.active ? 'default' : 'outline'}>
                      {offer.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </LoadingState>
      </CardContent>
    </Card>
  );
} 