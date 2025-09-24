import { useNavigate } from "@solidjs/router";
import { JSXElement } from "solid-js";

export default function NavLink({ to, children }: { to: string, children: JSXElement | null }) {
  const navigate = useNavigate();

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    if ("startViewTransition" in document) {
      (document as any).startViewTransition(() => navigate(to));
    } else {
      navigate(to);
    }
  };

  return (
    <a tabIndex={-1} href={to} onClick={handleClick}>
      {children}
    </a>
  );
}
