import SwiftUI

// アプリ共通カラーセット（ダークモード完全対応）
enum AppColors {
    // MARK: - プライマリカラー

    // メインブランドカラー
    static let accent = Color.blue

    // セカンダリブランドカラー
    static let accentSecondary = Color.teal

    // MARK: - 背景カラー

    // メイン背景
    static let background = Color(.systemBackground)

    // グループ化された背景
    static let groupedBackground = Color(.systemGroupedBackground)

    // セカンダリ背景（カード等）
    static let secondaryBackground = Color(.secondarySystemBackground)

    // MARK: - テキストカラー

    // プライマリテキスト
    static let textPrimary = Color.primary

    // セカンダリテキスト
    static let textSecondary = Color.secondary

    // 反転テキスト（ボタン上のテキスト等）
    static let textOnAccent = Color.white

    // MARK: - チャットバブルカラー

    // ユーザーメッセージバブル
    static let chatUserBubble = Color.blue

    // AIメッセージバブル（ダークモード対応）
    static let chatAssistantBubble = Color(.systemGray5)

    // ユーザーメッセージテキスト
    static let chatUserText = Color.white

    // AIメッセージテキスト
    static let chatAssistantText = Color.primary

    // MARK: - スコアカラー

    // 高スコア
    static let scoreHigh = Color.green

    // 中スコア
    static let scoreMedium = Color.orange

    // 低スコア
    static let scoreLow = Color.red

    // MARK: - 警告・通知カラー

    // 警告背景
    static let warningBackground = Color.orange.opacity(0.1)

    // 警告テキスト
    static let warningText = Color.orange

    // 情報背景
    static let infoBackground = Color.blue.opacity(0.08)

    // 情報テキスト
    static let infoText = Color.blue

    // 成功
    static let success = Color.green

    // エラー
    static let error = Color.red

    // MARK: - カードカラー

    // カード背景
    static let cardBackground = Color(.systemBackground)

    // カード影
    static let cardShadow = Color.black.opacity(0.08)

    // 選択状態の背景
    static let selectedBackground = Color.blue

    // 非選択状態の背景
    static let unselectedBackground = Color(.systemGray6)

    // MARK: - セパレーター

    // 区切り線
    static let separator = Color(.separator)

    // MARK: - タグ・バッジ

    // タグ背景
    static let tagBackground = Color.blue.opacity(0.1)

    // タグテキスト
    static let tagText = Color.blue

    // バリアフリー対応アイコン
    static let accessibleAvailable = Color.green

    // バリアフリー非対応アイコン
    static let accessibleUnavailable = Color.gray
}
