import { redirect } from "react-router";
import { getAccessibleProjects } from "~/services/jira";

export function loader() {
  const projects = getAccessibleProjects();
  return redirect(`/projects/${projects[0].key}/issues`);
}
