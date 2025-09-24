import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import FirstPage from "./components/FirstPage";
import { CustomContextProvider } from "./store/sharedState";

function App() {
  return (
    <CustomContextProvider>

    <main class="min-h-screen flex bg-base-200 flex-row space-x-10">
      <FirstPage />
    </main>
    </CustomContextProvider>
  );
}

export default App;
