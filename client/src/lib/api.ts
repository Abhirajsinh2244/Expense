import { hc } from 'hono/client';
import type { AppType } from '../../../server/src/index';

// Instantiate the network client pointing to your local Node server
export const apiClient = hc<AppType>('http://localhost:3000');