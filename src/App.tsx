import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { CustomContextProvider } from "./store/sharedState";
import { A } from "@solidjs/router";
import { JSXElement } from "solid-js";
import NavLink from "./components/NavLink";

function App(props: { children: JSXElement }) {
  return (
    <>
      {/* <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/test">Test</NavLink>
      </nav> */}
      <CustomContextProvider>{props.children}</CustomContextProvider>
    </>
  );
}

export default App;
