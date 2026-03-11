import SwiftUI

// アプリのエントリーポイント
@main
struct AccessRouteApp: App {
    // オンボーディング完了フラグ
    @AppStorage("onboardingCompleted") private var onboardingCompleted = false

    var body: some Scene {
        WindowGroup {
            if onboardingCompleted {
                ContentView()
            } else {
                OnboardingView(isOnboardingCompleted: $onboardingCompleted)
            }
        }
    }
}
