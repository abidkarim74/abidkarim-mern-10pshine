import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";


type SearchContextType = {
  search_param: string;
  setSearchParam: (param: string) => void;
};

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [search_param, setSearchParam] = useState("");

  const contextValue: SearchContextType = {
    search_param,
    setSearchParam
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}


export function useSearch(): SearchContextType {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}