import { int, text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const linksTable = sqliteTable('global_links', {
    id: int().notNull().primaryKey( { autoIncrement: true }),
    original_link: text().notNull(),
    code: text().notNull(),
    created_at: int().notNull()
})

export const usersTable = sqliteTable('users', {
    id: int().notNull().primaryKey( { autoIncrement: true }),
    email: text().notNull(),
    password: text().notNull(),
    created_at: int().notNull()
})

export const googleTable = sqliteTable('googleTable', {
    id: int().notNull().primaryKey( { autoIncrement: true }),
    email: text().notNull(),
    user_id: text().notNull(),
    created_at: int().notNull()
})