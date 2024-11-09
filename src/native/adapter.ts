interface Device {
  explicitConnectionRequired: boolean;
  // getProfiles: () => (any[]);
  // getEid: () => string;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  transmit: (s: string) => Promise<string>;
  execute: (s: string, args: any[]) => Promise<any>;
}

interface Adapter {
  explicitConnectionRequired: boolean;
  // getProfiles: () => (any[]);
  // getEid: () => string;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  transmit: (s: string) => Promise<string>;
  execute: (s: string, args: any[]) => Promise<any>;
}

