import SwiftUI

// メインコンテンツ（TabView）
struct ContentView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("ホーム", systemImage: "map.fill")
                }
                .accessibilityLabel("ホームタブ")

            RouteView()
                .tabItem {
                    Label("ルート", systemImage: "point.topleft.down.to.point.bottomright.curvepath.fill")
                }
                .accessibilityLabel("ルート検索タブ")

            ChatView()
                .tabItem {
                    Label("チャット", systemImage: "bubble.left.and.bubble.right")
                }
                .accessibilityLabel("AIチャットタブ")

            SpotView()
                .tabItem {
                    Label("スポット", systemImage: "mappin.and.ellipse")
                }
                .accessibilityLabel("スポット検索タブ")

            ProfileView()
                .tabItem {
                    Label("設定", systemImage: "gearshape.fill")
                }
                .accessibilityLabel("プロファイル設定タブ")
        }
    }
}
