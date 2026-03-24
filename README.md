# README

## アーキテクチャ

...existing architecture diagram...

+------------------+       +---------------------+
| Yahoo YOLP API   |       |  (建物内施設・口コミ情報) |
+------------------+       +---------------------+

...rest of the section...

## データフロー

...steps 1-3...
4. ルート沿いのアクセシブルスポット（トイレ、休憩所等）を併せて提示。Yahoo YOLP APIから建物内の施設情報（トイレの位置・アクセシビリティ）やお店の口コミ・詳細情報を取得

...rest of the section...

## 技術スタック

| 技術           | 説明                         |
|----------------|------------------------------|
| CI/CD          | ...                         |
| 地図・施設情報 | Google Maps API / Yahoo YOLP API |

...rest of the table...

## API仕様

...existing shared data models line...
- Backend <-> Yahoo YOLP: [docs/yolp-api-spec.yaml](docs/yolp-api-spec.yaml)