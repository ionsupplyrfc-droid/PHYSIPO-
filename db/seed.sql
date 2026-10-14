-- フィジポッ（Physipo）初期データ
-- 本人専用アプリのため、利用者（role: player）を1名のみ投入する。
-- パスワード・合言葉はこのテーブルには保存しない（APP_SHARED_PASSWORDで一括管理）。

insert into users (name, role) values
  ('MUKAIE TOMOHIRO', 'player')
on conflict do nothing;
