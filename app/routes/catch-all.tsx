import { data } from "react-router";

export function loader() {
  throw data("Not Found", { status: 404 });
}
