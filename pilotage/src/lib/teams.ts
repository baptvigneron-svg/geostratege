export type TeamLike = { id: string; parentId: string | null; name: string };
export type TeamNode<T extends TeamLike> = T & { children: TeamNode<T>[]; depth: number };

// Construit l'arbre des équipes, trié par nom à chaque niveau.
export function buildTeamTree<T extends TeamLike>(teams: T[]): TeamNode<T>[] {
  const nodes = new Map<string, TeamNode<T>>();
  for (const t of teams) nodes.set(t.id, { ...t, children: [], depth: 0 });

  const roots: TeamNode<T>[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const sortAndDepth = (list: TeamNode<T>[], depth: number) => {
    list.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    for (const n of list) {
      n.depth = depth;
      sortAndDepth(n.children, depth + 1);
    }
  };
  sortAndDepth(roots, 0);
  return roots;
}

export function flattenTree<T extends TeamLike>(roots: TeamNode<T>[]): TeamNode<T>[] {
  const out: TeamNode<T>[] = [];
  const walk = (list: TeamNode<T>[]) => {
    for (const n of list) {
      out.push(n);
      walk(n.children);
    }
  };
  walk(roots);
  return out;
}

// Vrai si rattacher `teamId` sous `newParentId` créerait une boucle.
export function wouldCreateCycle(
  teams: TeamLike[],
  teamId: string,
  newParentId: string | null,
): boolean {
  const parentOf = new Map(teams.map((t) => [t.id, t.parentId]));
  let current = newParentId;
  const seen = new Set<string>();
  while (current) {
    if (current === teamId) return true;
    if (seen.has(current)) return true;
    seen.add(current);
    current = parentOf.get(current) ?? null;
  }
  return false;
}
