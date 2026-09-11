import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const sessions = sqliteTable('sessions', {id:text('id').primaryKey(), exercise:text('exercise').notNull(), level:integer('level').notNull(), correct:integer('correct').notNull(), total:integer('total').notNull(), seconds:integer('seconds').notNull(), created:text('created').notNull()});
export const profile = sqliteTable('profile',{id:integer('id').primaryKey(), name:text('name').notNull(), goal:integer('goal').notNull()});
export const exerciseResults=sqliteTable('exercise_results',{id:text('id').primaryKey(),exerciseId:text('exercise_id').notNull(),finishedAt:text('finished_at').notNull(),payload:text('payload').notNull()});
