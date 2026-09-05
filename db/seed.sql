-- フィジポッ（Physipo）初期データ
-- 一般利用者（player）2名・管理者（staff）2名のサンプルユーザーを投入する。
-- パスワード・合言葉はこのテーブルには保存しない（APP_SHARED_PASSWORDで一括管理）。

insert into users (name, role) values
  ('山田 太郎', 'player'),
  ('佐藤 花子', 'player'),
  ('鈴木 一郎', 'staff'),
  ('田中 次郎', 'staff')
on conflict do nothing;
