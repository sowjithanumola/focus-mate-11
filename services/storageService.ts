import { DailyEntry, User } from '../types';

const STORAGE_KEY_PREFIX = 'focusmate_entries_';
const USER_SESSION_KEY = 'focusmate_user_session';
const USERS_DB_KEY = 'focusmate_users_db';

interface StoredUser extends User {
  password?: string; // Optional for Google users
  authProvider: 'email' | 'guest';
  createdAt: number;
}

// --- User Database Management (Simulating a Backend) ---

const getUsersDB = (): StoredUser[] => {
  try {
    const json = localStorage.getItem(USERS_DB_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

const saveUserToDB = (user: StoredUser) => {
  const users = getUsersDB();
  const index = users.findIndex(u => u.email === user.email);
  
  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

const findUserByEmail = (email: string): StoredUser | undefined => {
  const users = getUsersDB();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

// --- Authentication Methods ---

export const signupUser = (email: string, password: string, name: string): User => {
  if (findUserByEmail(email)) {
    throw new Error("Account already exists with this email.");
  }

  const newUser: StoredUser = {
    id: btoa(email), // Simple ID generation
    email,
    name,
    password, // In a real app, this must be hashed!
    authProvider: 'email',
    createdAt: Date.now(),
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`
  };

  saveUserToDB(newUser);
  
  // Auto login after signup
  const { password: _, ...sessionUser } = newUser;
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionUser));
  return sessionUser;
};

export const loginUser = (email: string, password: string): User => {
  const user = findUserByEmail(email);
  
  if (!user) {
    throw new Error("No account found. Please Sign Up first.");
  }

  if (user.password !== password) {
    throw new Error("Incorrect password.");
  }

  const { password: _, ...sessionUser } = user;
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionUser));
  return sessionUser;
};

export const loginAsGuest = (): User => {
  const guestUser: User = {
    id: 'guest_user',
    email: 'guest@focusmate.app',
    name: 'Guest User',
    avatar: 'https://ui-avatars.com/api/?name=Guest&background=e2e8f0&color=64748b'
  };
  
  // We don't save guests to the DB, just the session
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(guestUser));
  return guestUser;
};

export const logoutUser = (): void => {
  localStorage.removeItem(USER_SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  try {
    const userJson = localStorage.getItem(USER_SESSION_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
};

// --- Data Management (Scoped to User) ---

const getDataKey = (): string => {
  const user = getCurrentUser();
  if (!user) throw new Error("User not authenticated");
  return `${STORAGE_KEY_PREFIX}${user.id}`;
};

export const saveEntry = (entry: DailyEntry): void => {
  const key = getDataKey();
  const existingJson = localStorage.getItem(key);
  const entries: DailyEntry[] = existingJson ? JSON.parse(existingJson) : [];
  
  const index = entries.findIndex(e => e.id === entry.id);
  if (index >= 0) {
    entries[index] = entry;
  } else {
    entries.push(entry);
  }
  
  localStorage.setItem(key, JSON.stringify(entries));
};

export const getEntries = (): DailyEntry[] => {
  try {
    const key = getDataKey();
    const existingJson = localStorage.getItem(key);
    return existingJson ? JSON.parse(existingJson) : [];
  } catch (e) {
    return [];
  }
};

export const deleteEntry = (id: string): void => {
  const key = getDataKey();
  const entries = getEntries();
  const filtered = entries.filter(e => e.id !== id);
  localStorage.setItem(key, JSON.stringify(filtered));
};

export const getEntriesByMonth = (year: number, month: number): DailyEntry[] => {
  const entries = getEntries();
  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getFullYear() === year && entryDate.getMonth() === month;
  });
};

export const getRecentEntries = (limit: number = 5): DailyEntry[] => {
  const entries = getEntries();
  // Sort descending by date
  return entries.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
};