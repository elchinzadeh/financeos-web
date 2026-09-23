import type { Category } from './api/categories';

export interface CategoryTreeNode extends Category {
  depth: number;
  children: CategoryTreeNode[];
}

/** `parentId`-ə görə istənilən dərinlikdə ağac qurur (render qatında sırf hesablama, backend dəyişmir). */
export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const byParent = new Map<string | null, Category[]>();
  for (const category of categories) {
    const list = byParent.get(category.parentId) ?? [];
    list.push(category);
    byParent.set(category.parentId, list);
  }

  function build(parentId: string | null, depth: number): CategoryTreeNode[] {
    const children = (byParent.get(parentId) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));
    return children.map((category) => ({ ...category, depth, children: build(category.id, depth + 1) }));
  }

  return build(null, 0);
}

/** Ağacı dropdown/option render üçün düz siyahıya salır, hər sətirdə `depth` saxlanılır. */
export function flattenCategoryTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = [];
  function walk(list: CategoryTreeNode[]) {
    for (const node of list) {
      result.push(node);
      walk(node.children);
    }
  }
  walk(nodes);
  return result;
}

/** Native `<select>` `<option>`-larda iyerarxiyanı göstərmək üçün — DOM-da həqiqi ağac mümkün deyil. */
export function indentLabel(name: string, depth: number): string {
  return `${'— '.repeat(depth)}${name}`;
}

/** `categoryId`-nin özü və bütün nəvələrinin id-lərini qaytarır (məs. valideyn seçimində dövrün qarşısını almaq üçün). */
export function collectDescendantIds(categories: Category[], categoryId: string): Set<string> {
  const byParent = new Map<string | null, Category[]>();
  for (const category of categories) {
    const list = byParent.get(category.parentId) ?? [];
    list.push(category);
    byParent.set(category.parentId, list);
  }
  const ids = new Set<string>([categoryId]);
  function walk(id: string) {
    for (const child of byParent.get(id) ?? []) {
      if (!ids.has(child.id)) {
        ids.add(child.id);
        walk(child.id);
      }
    }
  }
  walk(categoryId);
  return ids;
}
