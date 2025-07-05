// src/lib/firebase/actions/resource-schemas.ts
// This file does NOT have 'use server' and can be safely imported by clients and servers.
import type { Timestamp } from 'firebase/firestore';

export interface Resource {
  id: string;
  userId: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  createdAt: Timestamp;
}
