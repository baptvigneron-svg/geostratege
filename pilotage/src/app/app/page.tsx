import { requireUser } from "@/lib/auth";
import { redirectToFirstOrg } from "@/lib/access";

export default async function AppEntry() {
  const user = await requireUser();
  return redirectToFirstOrg(user.id);
}
