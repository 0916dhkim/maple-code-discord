import { text, pgTable, jsonb } from "drizzle-orm/pg-core";

export const channelTable = pgTable("channel", {
  id: text().primaryKey(),
  name: text().notNull(),
  type: text().notNull(),
  parentId: text(),
  messages: jsonb(),
});
