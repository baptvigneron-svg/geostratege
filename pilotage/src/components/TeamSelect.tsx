import type { TeamLike } from "@/lib/teams";
import { buildTeamTree, flattenTree } from "@/lib/teams";

// Liste déroulante indentée des équipes (pour choisir une équipe parente).
export function TeamSelect({
  teams,
  name,
  defaultValue,
  excludeId,
  emptyLabel = "Aucune (équipe de premier niveau)",
}: {
  teams: TeamLike[];
  name: string;
  defaultValue?: string | null;
  excludeId?: string;
  emptyLabel?: string;
}) {
  const flat = flattenTree(buildTeamTree(teams)).filter((t) => t.id !== excludeId);
  return (
    <select name={name} defaultValue={defaultValue ?? ""} className="input">
      <option value="">{emptyLabel}</option>
      {flat.map((t) => (
        <option key={t.id} value={t.id}>
          {"  ".repeat(t.depth * 2)}
          {t.name}
        </option>
      ))}
    </select>
  );
}
