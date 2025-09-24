import { useContext } from "solid-js";
import FolderSVG from "../assets/folder.svg";
import Settings from "../assets/gear.svg";
import { CustomContext, CustomContextType } from "../store/sharedState";

export default function Sidebar() {
  const ctx = useContext(CustomContext) as CustomContextType;

  return (
    <div class="w-[300px] px-5 py-2 bg-base-100 flex flex-col">
      <h1 class="p-3 font-extrabold">Encrypter</h1>

      {/* Tabs Starting here */}
      <div class="flex flex-col mt-30 space-y-2 w-full tabs tabs-lift">
        {/* First Content */}
        <div>
          <button
            class={`btn ${
              ctx.Tabs.selectedTabs() === "passwords"
                ? "btn-active"
                : "btn-ghost"
            } flex space-x-2 py-5 w-full rounded`}
            onClick={() => {
              ctx.Tabs.SetSelectedTabs("passwords");
            }}
          >
            <FolderSVG />
            <p>Passwords</p>
          </button>
        </div>
        {/* Second Content */}
        <div>
          <button
            class={`btn ${
              ctx.Tabs.selectedTabs() === "settings"
                ? "btn-active"
                : "btn-ghost"
            } flex space-x-2 py-5 w-full rounded`}
            onClick={() => {
              ctx.Tabs.SetSelectedTabs("settings");
            }}
          >
            <Settings />
            <p>Settings</p>
          </button>
        </div>
      </div>
    </div>
  );
}
