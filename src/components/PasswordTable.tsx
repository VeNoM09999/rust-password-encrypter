import { createSignal, For, useContext } from "solid-js";
import { CustomContext } from "../store/sharedState";
import DustBinSvg from "../assets/dustbin.svg";

export default function PasswordTable() {
  const ctx = useContext(CustomContext);

  const copy = (password: string) => {
    const toast = document.getElementById("copy-toast");
    toast?.classList.remove("hidden");
    setTimeout(() => toast?.classList.add("hidden"), 2000);
    navigator.clipboard.writeText(password);
  };

  const [hoveredRow, setHoveredRow] = createSignal(-1);
  return (
    <>
      <div id="copy-toast" class="toast hidden z-10">
        <div class="alert alert-info font-['Bangers']">
          <span>Copied to clipboard</span>
        </div>
      </div>
      <div class="px-5 overflow-x-auto overflow-y-scroll max-h-[400px] flex items-center place-content-center">
        <table class="table">
          {/* Head */}
          <thead>
            <tr>
              <th></th>
              <th>Service</th>
              <th>Password</th>
              <th></th>
            </tr>
          </thead>
          <tbody class="table-pin-cols">
            <For each={ctx?.password_data.getdata()}>
              {(item, index) => (
                <tr class="hover:bg-base-300 ">
                  <td>
                    <button class="btn hover:btn-info">
                      <DustBinSvg />
                    </button>
                  </td>
                  <td>{item.service}</td>
                  <td
                    onMouseEnter={() => setHoveredRow(index())}
                    onMouseLeave={() => setHoveredRow(-1)}
                    class="w-48 blur-[3px] hover:blur-none font-mono"
                  >
                    {hoveredRow() === index() ? item.password : "**********"}
                  </td>
                  <td>
                    <button
                      class="btn"
                      onClick={() => {
                        copy(item.password);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        role="button"
                        viewBox="0 -960 960 960"
                        width="24px"
                      >
                        <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </>
  );
}
