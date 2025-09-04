import { int, text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const linksTable = sqliteTable('links_table', {
    id: int().notNull().primaryKey( { autoIncrement: true }),
    original_link: text().notNull(),
    code: text().notNull(),
    created_at: int().notNull()
})