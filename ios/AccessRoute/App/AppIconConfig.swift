import Foundation

// App Icon設定の骨格
// 実際のアイコン画像はAssets.xcassetsのAppIconセットに配置
//
// 必要なアイコンサイズ:
// - iPhone: 60x60pt (@2x: 120px, @3x: 180px)
// - iPad: 76x76pt (@2x: 152px), 83.5x83.5pt (@2x: 167px)
// - App Store: 1024x1024px
// - Notification: 20x20pt (@2x: 40px, @3x: 60px)
// - Settings: 29x29pt (@2x: 58px, @3x: 87px)
// - Spotlight: 40x40pt (@2x: 80px, @3x: 120px)
//
// デザインガイドライン:
// - AccessRouteロゴ: 地図ピン + アクセシビリティシンボル
// - 背景色: ブランドブルー (#007AFF)
// - 角丸は自動適用（アイコン画像は正方形で作成）

// Assets.xcassets/AppIcon.appiconset/Contents.json の構造
enum AppIconConfig {
    static let iconSetContents = """
    {
      "images" : [
        {
          "idiom" : "universal",
          "platform" : "ios",
          "size" : "1024x1024",
          "filename" : "app_icon_1024.png"
        }
      ],
      "info" : {
        "author" : "xcode",
        "version" : 1
      }
    }
    """
}
