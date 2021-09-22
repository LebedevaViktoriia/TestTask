export interface User {
  userId?: string;
  name?: string;
}

export interface Reminder {
  note: string;
  date: string;
  id: string;
  userId: string;
  status?: string;
}

