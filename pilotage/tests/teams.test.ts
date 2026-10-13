import { describe, expect, it } from "vitest";
import { buildTeamTree, flattenTree, wouldCreateCycle } from "@/lib/teams";

const teams = [
  { id: "dir", parentId: null, name: "Direction" },
  { id: "prod", parentId: "dir", name: "Production" },
  { id: "usi", parentId: "prod", name: "Usinage" },
  { id: "ass", parentId: "prod", name: "Assemblage" },
  { id: "mkt", parentId: "dir", name: "Marketing" },
];

describe("buildTeamTree", () => {
  it("trie chaque niveau et calcule la profondeur", () => {
    const flat = flattenTree(buildTeamTree(teams));
    expect(flat.map((t) => `${t.depth}:${t.name}`)).toEqual([
      "0:Direction",
      "1:Marketing",
      "1:Production",
      "2:Assemblage",
      "2:Usinage",
    ]);
  });

  it("traite une équipe dont le parent est absent comme une racine", () => {
    const roots = buildTeamTree([{ id: "x", parentId: "absent", name: "X" }]);
    expect(roots).toHaveLength(1);
  });
});

describe("wouldCreateCycle", () => {
  it("refuse de rattacher une équipe à elle-même ou à un descendant", () => {
    expect(wouldCreateCycle(teams, "prod", "prod")).toBe(true);
    expect(wouldCreateCycle(teams, "prod", "usi")).toBe(true);
    expect(wouldCreateCycle(teams, "dir", "ass")).toBe(true);
  });

  it("accepte un déplacement valide", () => {
    expect(wouldCreateCycle(teams, "usi", "mkt")).toBe(false);
    expect(wouldCreateCycle(teams, "mkt", null)).toBe(false);
  });
});
