import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL が設定されていません。Vercelの環境変数を確認してください。");
}

export const sql = neon(process.env.DATABASE_URL);
