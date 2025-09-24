import { AiOutlineUser } from "solid-icons/ai";
import NavLink from "../components/NavLink";
import { KnownCategories, KnwonServices } from "../store/constant";
import {
  CustomContext,
  CustomContextType,
  FilteredByServices,
  KeyValueType,
  RustKeyValue,
} from "../store/sharedState";
import { createSignal, For, Show, useContext } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "@solidjs/router";
import { RiSystemLockPasswordLine } from "solid-icons/ri";

function convert_to_rust_struct(val: KeyValueType[]): RustKeyValue[] {
  let rust_type: RustKeyValue[] = val.map((item: KeyValueType) => ({
    key: item.service,
    email: item.email,
    value: item.password,
  }));

  return rust_type;
}

export default function Create() {
  const [new_email, Setnewemail] = createSignal("");
  const [service_type, Setservicetype] = createSignal("Other");
  const [new_password, Setnewpassword] = createSignal("");
  const [customError, SetCustomEror] = createSignal("");
  const [showPassword, SetShowPassword] = createSignal(false);
  const ctx = useContext(CustomContext) as CustomContextType;
  const navigate = useNavigate();

  function AddNewFeild(
    new_data: KeyValueType,
    currentdata: FilteredByServices
  ) {
    if (new_data.password.length <= 5) {
      SetCustomEror("Password needs to be more than 5 words");
      setTimeout(() => {
        SetCustomEror("");
      }, 5000);
      return;
    }
    let newList: KeyValueType[];

    newList = [
      ...currentdata.cloud,
      ...currentdata.mail,
      ...currentdata.other,
      ...currentdata.shopping,
      ...currentdata.social,
      ...currentdata.streaming,
      new_data,
    ];
    const rust_data = convert_to_rust_struct(newList);

    console.log(rust_data);
    invoke("onsave", { plaintext: JSON.stringify(rust_data) });
    // navigate("/");
  }

  return (
    <>
      <div class="p-5 space-y-5">
        <div>
          <NavLink to="/">
            <button class="btn btn-neutral">Go back</button>
          </NavLink>
        </div>
        <h1>Create New Credential</h1>
        <div class="flex flex-col space-y-3">
          <input
            type="text"
            class="input"
            placeholder="Service Name"
            list="categorytype"
            onInput={(e) => Setservicetype(e.target.value)}
          />
          <datalist id="categorytype">
            {/* <option disabled={true}>Pick a browser</option> */}
            <For each={KnwonServices}>
              {(item, index) => (
                // Displaying know category name
                <option value={item}></option>
              )}
            </For>
          </datalist>

          <label class="input validator">
            <AiOutlineUser />
            <input
              type="email"
              required
              value={new_email()}
              onInput={(e) => Setnewemail(e.target.value)}
              placeholder="Email"
              minlength="5"
              maxlength="30"
              title="Only letters, numbers or dash"
            />
          </label>
          <label class="input validator pr-0">
            <RiSystemLockPasswordLine />
            <input
              type={`${showPassword() ? "text" : "password"}`}
              required
              placeholder="Password"
              value={new_password()}
              onInput={(e) => Setnewpassword(e.target.value)}
              minlength="6"
              maxlength="50"
              title="Everything allowed"
            />
            <button
              class="btn ml-auto px-2"
              onClick={() => SetShowPassword((prev) => !prev)}
            >
              Show Password
            </button>
          </label>
          <Show when={customError() !== ""}>
            <span>{customError()}</span>
          </Show>
          <button
            class="btn btn-neutral btn-wide mt-5"
            onClick={() => {
              AddNewFeild(
                {
                  email: new_email(),
                  password: new_password(),
                  service: service_type(),
                },
                ctx.filtered_password_data.getdata()
              );
            }}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
