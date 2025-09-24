import { IoAdd } from "solid-icons/io";
import { AiOutlineRight as Right, AiOutlineDelete } from "solid-icons/ai";

import { IoBagOutline as Shopping } from "solid-icons/io";
import { FiInstagram as Social } from "solid-icons/fi";
import { AiOutlineCloud as Cloud } from "solid-icons/ai";
import { FiMail as Mail } from "solid-icons/fi";
import { IoPlayOutline as Streaming } from "solid-icons/io";
import { BsGlobe as Other } from "solid-icons/bs";

import { For, onMount, useContext } from "solid-js";
import {
  CustomContext,
  CustomContextType,
  FilteredByServices,
  KeyValueType,
  RustKeyValue,
} from "../store/sharedState";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import NavLink from "./NavLink";
import { KnownCategories } from "../store/constant";

function FilterPasswordByCategory(val: KeyValueType[]): FilteredByServices {
  let filtered: FilteredByServices = {
    other: [],
    cloud: [],
    mail: [],
    shopping: [],
    social: [],
    streaming: [],
  };
  val.forEach((item) => {
    switch (item.service.toLowerCase()) {
      case "discord":
        filtered.social.push(item);
        break;
      case "netflix":
        filtered.streaming.push(item);
        break;

      case "google":
        filtered.mail.push(item);
        break;
        
      default:
        filtered.other.push(item);
    }
  });

  return filtered;
}

export default function FirstPage() {
  const ctx = useContext(CustomContext) as CustomContextType;

  function getSvgForCategory(category: string) {
    switch (category) {
      case "Social":
        return <Social class="w-full h-full" />;
      case "Streaming":
        return <Streaming class="w-full h-full" />;
      case "Email":
        return <Mail class="w-full h-full" />;
      case "Cloud":
        return <Cloud class="w-full h-full" />;
      case "Shopping":
        return <Shopping class="w-full h-full" />;
      default:
        return <Other class="w-full h-full" />;
    }
  }

  listen<RustKeyValue[]>("init-load", (event) => {
    const converted = convert_from_rust_struct(event.payload);
    console.log(converted);
    const filtered = FilterPasswordByCategory(converted);
    ctx.filtered_password_data.Setdata(filtered);
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
      email: val.email,
      password: val.value,
    }));
    return returnVal;
  }

  return (
    <>
      <div class="w-full">
        <ul class="p-5 list">
          <li class="list-row">
            <h1>Password Manager</h1>
          </li>
          <For each={KnownCategories}>
            {(item, _index) => (
              <li class="flex list-row place-content-center items-center">
                <div class="fill-black w-10 h-10">
                  {getSvgForCategory(item.Icon)}
                </div>
                <h2 class="font-semibold text-2xl">{item.category}</h2>
                <p>
                  {
                    // Safely access filtered data array length by Icon string key (e.g. 'mail', 'shopping')
                    ctx.filtered_password_data.getdata()
                      ? ctx.filtered_password_data.getdata()[
                          item.Icon.toLowerCase() as keyof FilteredByServices
                        ].length
                      : 0
                  }
                </p>
                <div class="ml-auto flex space-x-5 place-content-center items-center">
                  <NavLink to={`/category/${item.category}`}>
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
      <div class="fab">
        {/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
        <div tabIndex={0} role="button" class="btn btn-lg btn-circle btn-info">
          <IoAdd />
        </div>

        {/* close button should not be focusable so it can close the FAB when clicked. It's just a visual placeholder */}
        <div class="fab-close">
          Close <span class="btn btn-circle btn-lg btn-error">✕</span>
        </div>

        {/* buttons that show up when FAB is open */}
        <div>
          Create New
          <NavLink to="/create">
            <button class="btn btn-lg btn-circle">
              <IoAdd />
            </button>
          </NavLink>
        </div>
        <div>
          Delete Selected
          <button class="btn btn-lg btn-circle">
            <AiOutlineDelete />
          </button>
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
