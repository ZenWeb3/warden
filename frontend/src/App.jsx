import { useState, useEffect } from "react";
import Landing from "./Landing";
import Warden from "./Warden";

/* Tiny hash router: "/" → landing, "#/app" → the terminal. No dependencies. */
function currentRoute() {
  return window.location.hash === "#/app" ? "app" : "home";
}

export default function App() {
  const [route, setRoute] = useState(currentRoute());

  useEffect(() => {
    const onHash = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const launch = () => {
    window.location.hash = "#/app";
  };

  return route === "app" ? <Warden /> : <Landing onLaunch={launch} />;
}
