import { IoAddCircle, IoBagOutline as Shopping } from "solid-icons/io";
import { FiInstagram as Social } from "solid-icons/fi";
import {
  AiOutlineRight as Right,
  AiOutlineCloud as Cloud,
} from "solid-icons/ai";
import { FiMail as Mail } from "solid-icons/fi";
import { IoPlayOutline as Streaming } from "solid-icons/io";
import { BsGlobe as Other } from "solid-icons/bs";

import { createSignal, For, onMount, useContext } from "solid-js";
import {
  CustomContext,
  CustomContextType,
  KeyValueType,
  RustKeyValue,
} from "../store/sharedState";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import NavLink from "./NavLink";

export default function FirstPage() {
  const ctx = useContext(CustomContext) as CustomContextType;

  const knownService = [
    { service: "other", svg: <Other class="w-full h-full" /> },
    { service: "discord", svg: <Social class="w-full h-full" /> },
    { service: "netflix", svg: <Streaming class="w-full h-full" /> },
  ];

  const knownCategory = [
    { category: "other", svg: <Other class="w-full h-full" /> },
    {
      category: "Social",
      svg: <Social class="w-full h-full" />,
    },
    {
      category: "Streaming",
      svg: <Streaming class="w-full h-full" />,
    },
    {
      category: "Email",
      svg: <Mail class="w-full h-full" />,
    },
    {
      category: "Cloud",
      svg: <Cloud class="w-full h-full" />,
    },
  ];

  function getSvgForSerice(service: string) {
    const serviceItem = knownService.find(
      (item) => item.service === service.toLocaleLowerCase()
    );
    return serviceItem ? serviceItem.svg : knownService[0].svg;
  }

  listen<RustKeyValue[]>("init-load", (event) => {
    let converted = convert_from_rust_struct(event.payload);
    console.log(converted);
    ctx.password_data.Setdata(converted);
  });

  onMount(() => {
    setTimeout(() => {
      invoke("onload").then(() => console.log("Invoked onLoad"));
    }, 100);
  });

  function convert_from_rust_struct(data: RustKeyValue[]): KeyValueType[] {
    if (data.length == 0) {
      return [];
    }
    const returnVal: KeyValueType[] = data.map((val) => ({
      service: val.key,
      password: val.value,
    }));
    return returnVal;
  }

  function copy(password: string) {
    navigator.clipboard.writeText(password);
  }

  const [hoveredRow, setHoveredRow] = createSignal(-1);
  return (
    <>
      <div class="w-full">
        <ul class="p-5 list">
          <li class="list-row">
            <h1>Password Manager</h1>
          </li>
          <For each={ctx?.password_data.getdata()}>
            {(item, index) => (
              <li class="flex list-row place-content-center items-center">
                <div class="h-10 w-10">{getSvgForSerice(item.service)}</div>
                <h2 class="font-semibold text-2xl">{item.service}</h2>
                <div class="ml-auto flex space-x-5 place-content-center items-center">
                  <p
                    tabIndex={0}
                    onMouseEnter={() => setHoveredRow(index())}
                    onMouseLeave={() => setHoveredRow(-1)}
                    class="blur-[1.5px] hover:blur-none transition-none duration-75"
                    onClick={() => copy(item.password)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        copy(item.password);
                      }
                    }}
                  >
                    {hoveredRow() == index() ? item.password : "•••••••••••••"}
                  </p>
                  <NavLink to={`/edit/${item.service}`}>
                    <div
                      tabindex={0}
                      role="button"
                      class="scale-[1.6] hover:cursor-pointer"
                    >
                      <Right />
                    </div>
                  </NavLink>
                </div>
              </li>
            )}
          </For>
        </ul>
      </div>
      <div class="fab fab-flower">
        {/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
        <div tabIndex={0} role="button" class="btn btn-lg btn-ghost btn-circle">
          <IoAddCircle class="w-10 h-full" />
        </div>

        {/* Main Action button replaces the original button when FAB is open */}
        <button class="fab-main-action btn btn-circle btn-lg btn-success">
          M
        </button>

        {/* buttons that show up when FAB is open */}
        <div class="tooltip tooltip-left" data-tip="Label A">
          <button class="btn btn-lg btn-circle">A</button>
        </div>
        <div class="tooltip tooltip-left" data-tip="Label B">
          <button class="btn btn-lg btn-circle">B</button>
        </div>
        <div class="tooltip" data-tip="Label C">
          <button class="btn btn-lg btn-circle">C</button>
        </div>
        <div class="tooltip" data-tip="Label D">
          <button class="btn btn-lg btn-circle">D</button>
        </div>
      </div>
    </>
  );
}

// <Sidebar />
// <div class="flex flex-col w-full space-y-2">
//   <TopRight />
//   <BottomRight />
// </div>
