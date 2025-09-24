/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import { Route, Router } from "@solidjs/router";
import Index from "./pages/default";
import Edit from "./pages/Edit";
import Create from "./pages/Create";
import ActualVault from "./pages/ActualVault";

render(
  () => (
    <Router root={App}>
      <Route path="/" component={Index} />
      <Route path="/edit/:email/:category" component={Edit} />
      <Route path="/create" component={Create} />
      <Route path="/category/:id" component={ActualVault} />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
