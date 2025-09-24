import { useParams } from "@solidjs/router";
import NavLink from "../components/NavLink";
import { AiOutlineDelete } from "solid-icons/ai";

export default function Edit() {
  const params = useParams();
  return (
    <>
      <div class="p-5">
        <NavLink to="/">
          <button class="btn btn-neutralt">Go back</button>
        </NavLink>
        <div class="mt-5">
          <div class="flex place-content-between">
            <h1>Edit {params.id}'s creds</h1>
            <button class="btn btn-error px-2"><AiOutlineDelete class="w-10 h-8" /></button>
          </div>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Enter New Password</legend>
            <input type="password" class="input" placeholder="Password" />
          </fieldset>
        </div>
      </div>
    </>
  );
}
