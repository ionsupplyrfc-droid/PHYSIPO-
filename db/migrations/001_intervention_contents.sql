-- 介入内容を複数保存できるようにするためのマイグレーション
-- 本番（Neon）の SQL Editor で、新しいコードを公開する「前」に1回だけ実行してください。
-- 何度実行しても結果は同じになるように書いています（既存データは削除・変更しません）。

-- 1. 介入内容を複数入れられる列（文字列の配列）を追加する
alter table sessions
  add column if not exists intervention_contents text[] not null default '{}';

-- 2. 既存の記録（介入内容が1つだけ）を、新しい列にも1件の配列としてコピーする
--    元の intervention_content 列はそのまま残します（過去データ保護・互換のため）
update sessions
set intervention_contents = array[btrim(intervention_content)]
where cardinality(intervention_contents) = 0
  and intervention_content is not null
  and btrim(intervention_content) <> '';
