import { createContext, createSignal, JSX } from "solid-js";

export interface KeyValueType {
  service: string,
  password: string,
}
export interface RustKeyValue {
  key: string,
  value: string
}

export interface CustomContextType {
  Tabs: { selectedTabs: () => string; SetSelectedTabs: (v: string) => void };
  loader: { password: {getloader: () => boolean , Setloader: (v: boolean) => void } };
  password_data: { getdata: () => KeyValueType[], Setdata: (v: KeyValueType[]) => void }
}

export const CustomContext = createContext<CustomContextType>();

export function CustomContextProvider(props: { children: JSX.Element }) {
  const [selectedTabs, SetSelectedTabs] = createSignal("passwords");
  const [loader,Setloader] = createSignal(true);
  const [pw_data,Setpwdata] = createSignal<KeyValueType[]>([]);
  
  const ctx: CustomContextType = {
    Tabs: {
        selectedTabs: selectedTabs,
        SetSelectedTabs: SetSelectedTabs
    }
    ,
    loader: { password: { getloader: loader , Setloader: Setloader} },
    password_data: { getdata:  pw_data, Setdata: Setpwdata}
  };

  return (
    <CustomContext.Provider value={ctx}>
      {props.children}
    </CustomContext.Provider>
  );
}
