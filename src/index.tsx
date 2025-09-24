/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import { Route, Router } from "@solidjs/router";
import test from "./pages/test";
import Index from "./pages/default";
import Edit from "./pages/Edit";

render(
  () => (
    <Router root={App}>
      <Route path="/test" component={test} />
      <Route path="/" component={Index} />
      <Route path="/edit/:id" component={Edit} />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
