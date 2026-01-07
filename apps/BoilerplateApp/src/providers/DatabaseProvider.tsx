import React, { createContext, useContext, ReactNode } from 'react';
import { Database } from '@nozbe/watermelondb';
import { database } from '../database';

interface DatabaseContextType {
  database: Database;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  return (
    <DatabaseContext.Provider value={{ database }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase(): Database {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context.database;
}
