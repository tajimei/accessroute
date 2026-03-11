import SwiftUI

// アクセシビリティ関連のユーティリティ
enum AccessibilityHelpers {
    // 最小タップターゲットサイズ（44x44pt）
    static let minimumTapTarget: CGFloat = 44

    // アクセシビリティスコアの色を返す
    static func scoreColor(for score: Int) -> Color {
        switch score {
        case 80...100:
            return .green
        case 50..<80:
            return .orange
        default:
            return .red
        }
    }

    // アクセシビリティスコアのラベルを返す
    static func scoreLabel(for score: Int) -> String {
        switch score {
        case 80...100:
            return "バリアフリー度: 高"
        case 50..<80:
            return "バリアフリー度: 中"
        default:
            return "バリアフリー度: 低"
        }
    }

    // 距離の表示用テキスト
    static func distanceText(meters: Double) -> String {
        if meters >= 1000 {
            return String(format: "%.1fkm", meters / 1000)
        } else {
            return "\(Int(meters))m"
        }
    }

    // 距離の目安カテゴリ表現を返す
    static func distanceCategory(meters: Double) -> String {
        switch meters {
        case ..<300:
            return "ごく短距離（徒歩数分）"
        case 300..<700:
            return "短距離（徒歩10分程度）"
        case 700..<1500:
            return "中距離（徒歩15〜20分程度）"
        case 1500..<3000:
            return "やや長距離（徒歩30分程度）"
        default:
            return "長距離（徒歩1時間前後）"
        }
    }

    // 所要時間の表示用テキスト
    static func durationText(minutes: Double) -> String {
        if minutes < 1 {
            return "1分未満"
        } else if minutes >= 60 {
            let hours = Int(minutes) / 60
            let mins = Int(minutes) % 60
            return mins > 0 ? "\(hours)時間\(mins)分" : "\(hours)時間"
        } else {
            return "\(Int(minutes))分"
        }
    }
}

// タップターゲットを最小サイズに保証するModifier
struct MinimumTapTargetModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .frame(
                minWidth: AccessibilityHelpers.minimumTapTarget,
                minHeight: AccessibilityHelpers.minimumTapTarget
            )
    }
}

extension View {
    // 最小タップターゲットサイズを保証する
    func ensureMinimumTapTarget() -> some View {
        modifier(MinimumTapTargetModifier())
    }
}
