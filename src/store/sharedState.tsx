import { createContext, createSignal, JSX } from "solid-js";

export interface KeyValueType {
  service: string;
  email: string;
  password: string;
}

export interface FilteredByServices {
  other: KeyValueType[];
  shopping: KeyValueType[];
  cloud: KeyValueType[];
  streaming: KeyValueType[];
  mail: KeyValueType[];
  social: KeyValueType[];
}

export interface RustKeyValue {
  key: string;
  email: string;
  value: string;
}

export interface CustomContextType {
  Tabs: { selectedTabs: () => string; SetSelectedTabs: (v: string) => void };
  loader: {
    password: { getloader: () => boolean; Setloader: (v: boolean) => void };
  };
  filtered_password_data: {
    getdata: () => FilteredByServices;
    Setdata: (v: FilteredByServices) => void;
  };
}

export const CustomContext = createContext<CustomContextType>();

export function CustomContextProvider(props: { children: JSX.Element }) {
  const emptyFilteredByServices: FilteredByServices = {
    other: [],
    shopping: [],
    cloud: [],
    streaming: [],
    mail: [],
    social: [],
  };

  const [selectedTabs, SetSelectedTabs] = createSignal("passwords");
  const [loader, Setloader] = createSignal(true);
  const [FilteredData, SetFilteredData] = createSignal<FilteredByServices>(emptyFilteredByServices);

  const ctx: CustomContextType = {
    Tabs: {
      selectedTabs: selectedTabs,
      SetSelectedTabs: SetSelectedTabs,
    },
    loader: { password: { getloader: loader, Setloader: Setloader } },
    filtered_password_data: { getdata: FilteredData, Setdata: SetFilteredData },
  };

  return (
    <CustomContext.Provider value={ctx}>
      {props.children}
    </CustomContext.Provider>
  );
}
