"use client";
import { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";

type AppContextValue = {
  user: null | UserResource | undefined;
};

const AppContext = createContext<AppContextValue>({ user: null });

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useUser();

  return <AppContext.Provider value={{ user }}>{children}</AppContext.Provider>;
};
