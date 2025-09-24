import "./App.css";
import { CustomContextProvider } from "./store/sharedState";
import { JSXElement } from "solid-js";

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
