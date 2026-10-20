import { and, asc, count, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { kbArticles, products } from "@/db/schema";
import type { Tx } from "@/db/client";
import { notFound } from "./errors";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const ListArticlesQuery = z.object({
  q: z.string().trim().min(1).max(200).optional(),
  product: z.uuid().optional(),
  language: z.string().regex(/^[a-z]{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListArticlesQuery = z.infer<typeof ListArticlesQuery>;

const doc = sql`to_tsvector('simple', ${kbArticles.title} || ' ' || ${kbArticles.body})`;

/** List articles; with q, keyword search ranked by PostgreSQL full-text search. Chapter 4 adds semantic search. */
export async function listArticles(tx: Tx, f: ListArticlesQuery) {
  const tsq = f.q ? sql`websearch_to_tsquery('simple', ${f.q})` : null;
  const where = and(
    f.product ? eq(kbArticles.productId, f.product) : undefined,
    f.language ? eq(kbArticles.language, f.language) : undefined,
    tsq ? sql`${doc} @@ ${tsq}` : undefined,
  );
  const rows = await tx.select({
    id: kbArticles.id, slug: kbArticles.slug, title: kbArticles.title, language: kbArticles.language,
    product: products.name,
    snippet: sql<string>`left(${kbArticles.body}, 240)`,
    ...(tsq ? { rank: sql<number>`ts_rank(${doc}, ${tsq})` } : {}),
  })
    .from(kbArticles)
    .leftJoin(products, eq(products.id, kbArticles.productId))
    .where(where)
    .orderBy(tsq ? sql`ts_rank(${doc}, ${tsq}) desc` : asc(kbArticles.title))
    .limit(f.pageSize)
    .offset((f.page - 1) * f.pageSize);
  const [{ total } = { total: 0 }] = await tx.select({ total: count() }).from(kbArticles).where(where);
  return { items: rows, page: f.page, pageSize: f.pageSize, total };
}

/** One article by id or slug. */
export async function getArticle(tx: Tx, ref: string) {
  const [a] = await tx.select({
    id: kbArticles.id, slug: kbArticles.slug, title: kbArticles.title, body: kbArticles.body,
    language: kbArticles.language, product: products.name, updatedAt: kbArticles.updatedAt,
  })
    .from(kbArticles)
    .leftJoin(products, eq(products.id, kbArticles.productId))
    .where(UUID.test(ref) ? eq(kbArticles.id, ref) : eq(kbArticles.slug, ref));
  if (!a) throw notFound(`Article ${ref}`);
  return a;
}
