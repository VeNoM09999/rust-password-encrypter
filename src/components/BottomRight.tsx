import {
  createSignal,
  Match,
  onMount,
  Show,
  Switch,
  useContext,
} from "solid-js";
import PasswordTable from "./PasswordTable";
import {
  CustomContext,
  CustomContextType,
  KeyValueType,
  RustKeyValue,
} from "../store/sharedState";
import SaveSvg from "../assets/save.svg";
import OpenSvg from "../assets/open.svg";
import AddSvg from "../assets/addfolder.svg";

import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export default function BottomRight() {
  const ctx = useContext(CustomContext) as CustomContextType;
  const [val, setVal] = createSignal(0);
  const [password, Setpassword] = createSignal("");
  const [service, Setservice] = createSignal("");

  listen<string>("init-load", (event) => {
    const payload_data: KeyValueType[] = event.payload.map((item) => ({
      service: item.key,
      password: item.value,
    }));
    console.log(payload_data);

    ctx.password_data.Setdata(payload_data);
    ctx.loader.password.Setloader(false);
  });

  onMount(() => {
    setTimeout(() => {
      invoke("onload").then(() => console.log("Invoked On Load!"));
    }, 1000);
  });

  function addfield() {
    const prev = ctx.password_data.getdata();
    ctx.password_data.Setdata([
      ...prev,
      { service: service(), password: password() },
    ]);
    const new_data = ctx.password_data.getdata();
    const rust_converted_data = convert_to_rust_struct(new_data);
    invoke("onsave", { plaintext: JSON.stringify(rust_converted_data) });

    document.getElementById('my_modal_1')?.removeAttribute("open");
  }

  function convert_to_rust_struct(val: KeyValueType[]): RustKeyValue[] {
    let returnVal: RustKeyValue[] = val.map((val) => ({
      key: val.service,
      value: val.password,
    }));

    return returnVal;
  }

  return (
    <>
      <div class="space-y-10">
        {/* <p>{val()}</p> */}
        <h1>Password Encrypter</h1>
        <div class=" place-content-center items-center controls grid grid-cols-1 sm:grid-cols-2 space-x-2 mt-2 px-5 space-y-5">
          <div class="flex">
            {/* Add New  */}
            <div class="tooltip">
              {/* Trigger */}
              <button
                class="p-2 btn btn-dash hover:btn-link rounded-xl mr-5"
                onClick={() => {
                  document.getElementById("my_modal_1").showModal();
                }}
              >
                <AddSvg />
              </button>

              {/* Dialog */}
              <dialog id="my_modal_1" class="modal">
                <div class="modal-box">
                  <h3 class="font-bold text-lg">Add Fields</h3>
                  <form action="#">
                    <div class="space-y-3 place-content-center flex flex-col mt-10">
                      <label htmlFor="Service">Enter Service</label>
                      <input
                        class="input"
                        type="text"
                        placeholder="Google,Github,Discord..."
                        list="service"
                        value={service()}
                        onInput={(e) => {
                          Setservice(e.target.value);
                        }}
                      />
                      <datalist id="service">
                        <option value="Netflix"></option>
                        <option value="Github"></option>
                        <option value="Discord"></option>
                        <option value="Google"></option>
                      </datalist>
                    </div>
                    <div class="space-y-3 place-content-center flex flex-col">
                      <label htmlFor="Service">Enter Password</label>
                      <input
                        class="input"
                        type="password"
                        placeholder="************"
                        value={password()}
                        onInput={(e) => {
                          Setpassword(e.target.value);
                        }}
                      />
                    </div>
                  </form>
                  <div class="modal-action">
                    <form method="dialog">
                      {/* if there is a button in form, it will close the modal */}
                      <button
                        class="btn"
                        onClick={(e) => {
                          e.preventDefault();
                          addfield();
                        }}
                      >
                        Save
                      </button>
                    </form>
                  </div>
                </div>
              </dialog>
              {/* Actual ToolTip Content */}
              <div class="tooltip-content tooltip-info font-['Bangers']">
                <div class="text-primary-content -rotate-6 text-xl">
                  ADD NEW!
                </div>
              </div>
            </div>

            {/* Current Opened File */}
            <div class="breadcrumbs text-sm mr-auto">
              <ul>
                <li>Currently opened</li>
                <li>
                  <a>Secrets .enc</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Buttons for open and Saving  */}
          <div class="space-x-2 flex flex-wrap space-y-2 place-content-center ml-auto">
            <button class="btn btn-info">
              <OpenSvg />
              Load
            </button>
            <button class="btn btn-info">
              <SaveSvg />
              Save
            </button>
          </div>
        </div>

        <Switch>
          <Match when={ctx.Tabs.selectedTabs() === "passwords"}>
            <Show when={!ctx.loader.password.getloader()} fallback={`Loading!`}>
              <PasswordTable />
            </Show>
          </Match>
          <Match when={ctx.Tabs.selectedTabs() === "settings"}>
            <h1>Settings!</h1>
          </Match>
        </Switch>
      </div>
    </>
  );
}
