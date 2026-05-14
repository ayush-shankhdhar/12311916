'use client';

import React from 'react';
import { Card, CardContent, Box, Skeleton } from '@mui/material';

export default function NotificationSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Card key={i} sx={{ mb: 2, opacity: 0.7 }}>
          <CardContent sx={{ p: '20px !important' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <Skeleton variant="rounded" width={110} height={24} sx={{ borderRadius: 4 }} />
                  <Skeleton variant="text" width={80} height={20} />
                </Box>
                <Skeleton variant="text" width="90%" height={24} />
                <Skeleton variant="text" width="65%" height={24} />
              </Box>
              <Skeleton variant="circular" width={40} height={40} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
