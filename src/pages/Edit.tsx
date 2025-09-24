import { useParams } from "@solidjs/router";
import NavLink from "../components/NavLink";
import { AiOutlineDelete } from "solid-icons/ai";
import { createSignal, onMount, useContext } from "solid-js";
import {
  CustomContext,
  CustomContextType,
  FilteredByServices,
  KeyValueType,
} from "../store/sharedState";

function CreateUpdatedList(
  new_data: KeyValueType,
  old: KeyValueType[]
): KeyValueType[] {
  let filtered = old.filter((item) => item.email !== new_data.email);
  let updated = [...filtered, new_data];

  return updated;
}

export default function Edit() {
  const params = useParams();
  const [newservice, Setnewservice] = createSignal("");
  const [newemail, Setnewemail] = createSignal("");
  const [newpassword, Setnewpassword] = createSignal("");
  const [showPassword, SetShowPassword] = createSignal(false);
  const ctx = useContext(CustomContext) as CustomContextType;

  onMount(() => {
    const filtered_data = ctx.filtered_password_data.getdata();
    if (filtered_data) {
      const category_list =
        filtered_data[
          params.category.toLowerCase() as keyof FilteredByServices
        ];
      const item = category_list?.find((val) => val.email === params.email);

      if (item) {
        Setnewservice(item.service);
        Setnewpassword(item.password);
        Setnewemail(item.email);
      }
    }
  });

  function onSave() {
    const finished_list = CreateUpdatedList(
      {
        email: newemail(),
        password: newpassword(),
        service: newservice(),
      },
      ctx.filtered_password_data.getdata()[
        params.category.toLowerCase() as keyof FilteredByServices
      ]
    );

    console.log(finished_list);
    // todo!

    // Send updated data to backed!
  }

  function onDelete() {
    const currentData = ctx.filtered_password_data.getdata();

    if (!currentData) return; 

    const categoryKey = params.category.toLowerCase() as keyof FilteredByServices;


    const filteredCategory = currentData[categoryKey].filter(
      (item) => item.email !== params.email
    );


    const updatedData: FilteredByServices = {
      ...currentData,
      [categoryKey]: filteredCategory,
    };

    ctx.filtered_password_data.Setdata(updatedData);


    // todo!
    // Send updated data to backend to update.
  }

  return (
    <>
      <div class="p-5">
        <NavLink to="/">
          <button class="btn btn-neutralt">Go back</button>
        </NavLink>
        <div class="mt-5">
          <div class="flex place-content-between items-center">
            <div class="flex place-content-center items-center space-x-3 my-6">
              <label for="serviceInput" class="text-xl font-semibold">
                Edit
              </label>
              <input
                type="text"
                value={newservice()}
                class="border w-30 rounded text-center px-3 py-1 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                placeholder={newservice()}
                onInput={(e) => Setnewservice(e.target.value)}
              />
              <span class="text-xl font-semibold">'s creds</span>
            </div>
            <button class="btn btn-error px-2" onClick={onDelete}>
              <AiOutlineDelete class="w-10 h-8" />
            </button>
          </div>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Enter New Email</legend>
            <input
              type="email"
              value={newemail()}
              onInput={(k) => Setnewemail(k.target.value)}
              class="input"
              disabled
              title="Delete this to create new one"
              placeholder="johdoe@email.com"
            />
            <legend class="fieldset-legend">Enter New Password</legend>
            <label class="input validator pr-0">
              <input
                type={`${showPassword() ? "text" : "password"}`}
                value={newpassword()}
                required
                minlength={5}
                maxlength={50}
                onInput={(k) => Setnewpassword(k.target.value)}
                placeholder="Super Safe Password"
              />

              <button
                class="btn bg-neutral"
                onClick={() => SetShowPassword(!showPassword())}
              >
                Show Password
              </button>
            </label>
          </fieldset>
          <button class="btn btn-primary" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </>
  );
}
