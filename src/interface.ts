export interface Farmer {
    name: string;
    phoneNumber: string;
    password: string;
    cowRate: string;
    buffaloRate: string;
    userCode: string;
    cowMilk?: {
      activeCowMilk: boolean;
      fixedAmount: boolean;
      fatAmount: boolean;
      snfAmount: boolean;
      morningTimeMilk: boolean;
      eveningTimeMilk: boolean;
    };
    buffaloMilk?: {
      activeBuffaloMilk: boolean;
      fixedAmount: boolean;
      fatAmount: boolean;
      snfAmount: boolean;
      morningTimeMilk: boolean;
      eveningTimeMilk: boolean;
    };
    _id: string;
  }