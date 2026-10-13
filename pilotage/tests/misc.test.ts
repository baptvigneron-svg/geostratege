import { describe, expect, it } from "vitest";
import { can } from "@/lib/permissions";
import { safeNext } from "@/lib/redirects";
import { slugify } from "@/lib/slug";
import { hashToken } from "@/lib/tokens";

describe("permissions", () => {
  it("réserve la gestion des membres et équipes aux administrateurs", () => {
    expect(can("ADMIN", "members.manage")).toBe(true);
    expect(can("ANIMATEUR", "members.manage")).toBe(false);
    expect(can("ANIMATEUR", "teams.manage")).toBe(false);
  });
  it("donne la gestion des actions à l'animateur, pas au contributeur", () => {
    expect(can("ANIMATEUR", "actions.editAny")).toBe(true);
    expect(can("CONTRIBUTEUR", "actions.editAny")).toBe(false);
    expect(can("CONTRIBUTEUR", "actions.create")).toBe(true);
  });
  it("laisse le lecteur en lecture seule", () => {
    expect(can("LECTEUR", "org.view")).toBe(true);
    expect(can("LECTEUR", "actions.create")).toBe(false);
  });
});

describe("safeNext", () => {
  it("n'accepte que des chemins internes", () => {
    expect(safeNext("/o/acme")).toBe("/o/acme");
    expect(safeNext("https://evil.example")).toBe("/app");
    expect(safeNext("//evil.example")).toBe("/app");
    expect(safeNext("/\\evil.example")).toBe("/app");
    expect(safeNext(undefined)).toBe("/app");
  });
});

describe("slugify", () => {
  it("normalise accents et ponctuation", () => {
    expect(slugify("Société Générale d'Usinage ")).toBe("societe-generale-d-usinage");
  });
});

describe("hashToken", () => {
  it("est déterministe et ne renvoie pas le jeton", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).not.toContain("abc");
  });
});
