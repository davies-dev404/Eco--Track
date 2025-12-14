import { format, subDays } from 'date-fns';

export type UserRole = 'individual' | 'organization' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface WasteRecord {
  id: string;
  userId: string;
  type: 'plastic' | 'paper' | 'glass' | 'metal' | 'organic' | 'ewaste';
  weight: number; // in kg
  date: string;
  carbonSaved: number; // in kg CO2e
}

export interface PickupRequest {
  id: string;
  userId: string;
  date: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  wasteTypes: string[];
  notes?: string;
}

export const mockUser: User = {
  id: 'u1',
  name: 'Alex Green',
  email: 'alex@example.com',
  role: 'individual',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

// Generate some fake historical data
const generateWasteRecords = (): WasteRecord[] => {
  const records: WasteRecord[] = [];
  const types = ['plastic', 'paper', 'glass', 'metal', 'organic'] as const;
  
  for (let i = 0; i < 30; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const weight = Number((Math.random() * 5 + 0.5).toFixed(1));
    
    records.push({
      id: `w${i}`,
      userId: 'u1',
      type,
      weight,
      date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
      carbonSaved: Number((weight * 1.5).toFixed(1)), // Rough estimate
    });
  }
  return records;
};

export const mockWasteRecords = generateWasteRecords();

export const mockPickupRequests: PickupRequest[] = [
  {
    id: 'p1',
    userId: 'u1',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'pending',
    wasteTypes: ['ewaste', 'metal'],
    notes: 'Old computer monitor and some scrap metal',
  },
  {
    id: 'p2',
    userId: 'u1',
    date: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    status: 'completed',
    wasteTypes: ['paper', 'plastic'],
  },
];

export const wasteTypeColors = {
  plastic: 'hsl(var(--chart-1))',
  paper: 'hsl(var(--chart-2))',
  glass: 'hsl(var(--chart-3))',
  metal: 'hsl(var(--chart-4))',
  organic: 'hsl(var(--chart-5))',
  ewaste: 'hsl(var(--destructive))',
};
