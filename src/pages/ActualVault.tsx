import { useParams } from "@solidjs/router";
import NavLink from "../components/NavLink";
import { createSignal, For, JSXElement, useContext } from "solid-js";
import {
  CustomContext,
  CustomContextType,
  FilteredByServices,
} from "../store/sharedState";

import { AiOutlineRight as Right } from "solid-icons/ai";
import { BsDiscord } from "solid-icons/bs";
import { SiNetflix } from "solid-icons/si";

export default function ActualVault() {
  const params = useParams();
  console.log(params.id);
  
  const ctx = useContext(CustomContext) as CustomContextType;
  const [hoveredRow, setHoveredRow] = createSignal(-1);

  function copy(password: string) {
    navigator.clipboard.writeText(password);
  }

  function getSvgForSerice(service: string): JSXElement {
    switch (service) {
      case "discord":
        return <BsDiscord class="w-full h-full" />;
      case "netflix":
        return <SiNetflix class="w-full h-full" />;
      case "email":
        return <SiNetflix class="w-full h-full" />;
      default:
        break;
    }
  }

  return (
    <>
      <div class="p-5">
        <NavLink to="/">
          <button class="btn bg-base-200">Go back</button>
        </NavLink>
        <div class="mt-10">
          <For
            each={
              ctx.filtered_password_data.getdata()[
                params.id.toLowerCase() as keyof FilteredByServices
              ]
            }
          >
            {(item, index) => (
              <li class="flex list-row place-content-between items-center">
                <div class="flex items-center space-x-5">
                  <div class="h-10 w-10">
                    {getSvgForSerice(item.service.toLocaleLowerCase())}
                  </div>
                  <h2 class="font-semibold text-sm">{item.email}</h2>
                </div>
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
                  <NavLink to={`/edit/${item.email}/${params.id}`}>
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
        </div>
      </div>
    </>
  );
}
