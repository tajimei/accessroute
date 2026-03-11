import Foundation
import SwiftUI

// オンボーディングのステップ
enum OnboardingStep: Int, CaseIterable {
    case mobilityType = 0
    case companions
    case maxDistance
    case avoidConditions
    case preferConditions

    var title: String {
        switch self {
        case .mobilityType: return "移動手段"
        case .companions: return "同行者"
        case .maxDistance: return "移動距離"
        case .avoidConditions: return "回避したい条件"
        case .preferConditions: return "希望条件"
        }
    }

    var subtitle: String {
        switch self {
        case .mobilityType: return "普段の移動手段を教えてください"
        case .companions: return "一緒に移動する方はいますか？"
        case .maxDistance: return "一度に移動できる最大距離を設定してください"
        case .avoidConditions: return "ルートで避けたい条件を選んでください"
        case .preferConditions: return "ルート周辺にあると嬉しい施設を選んでください"
        }
    }
}

// オンボーディング画面のViewModel
@MainActor
final class OnboardingViewModel: ObservableObject {
    @Published var currentStep: OnboardingStep = .mobilityType
    @Published var selectedMobilityType: MobilityType = .walk
    @Published var selectedCompanions: Set<Companion> = []
    @Published var maxDistanceMeters: Double = 1000
    @Published var selectedAvoidConditions: Set<AvoidCondition> = []
    @Published var selectedPreferConditions: Set<PreferCondition> = []
    @Published var isSubmitting = false
    @Published var errorMessage: String?

    // 現在のステップのインデックス（0始まり）
    var currentStepIndex: Int {
        currentStep.rawValue
    }

    // 全ステップ数
    var totalSteps: Int {
        OnboardingStep.allCases.count
    }

    // 進捗率（0.0〜1.0）
    var progress: Double {
        Double(currentStepIndex + 1) / Double(totalSteps)
    }

    // 次のステップに進めるか
    var canProceed: Bool {
        switch currentStep {
        case .mobilityType:
            return true // デフォルト値があるので常にtrue
        case .companions:
            return true // 選択なしでもOK
        case .maxDistance:
            return maxDistanceMeters > 0
        case .avoidConditions:
            return true // 選択なしでもOK
        case .preferConditions:
            return true // 選択なしでもOK
        }
    }

    // 最後のステップか
    var isLastStep: Bool {
        currentStep == OnboardingStep.allCases.last
    }

    // 次のステップへ
    func nextStep() {
        guard let nextIndex = OnboardingStep(rawValue: currentStep.rawValue + 1) else {
            return
        }
        withAnimation {
            currentStep = nextIndex
        }
    }

    // 前のステップへ
    func previousStep() {
        guard let prevIndex = OnboardingStep(rawValue: currentStep.rawValue - 1) else {
            return
        }
        withAnimation {
            currentStep = prevIndex
        }
    }

    // 同行者の選択をトグル
    func toggleCompanion(_ companion: Companion) {
        if selectedCompanions.contains(companion) {
            selectedCompanions.remove(companion)
        } else {
            selectedCompanions.insert(companion)
        }
    }

    // 回避条件の選択をトグル
    func toggleAvoidCondition(_ condition: AvoidCondition) {
        if selectedAvoidConditions.contains(condition) {
            selectedAvoidConditions.remove(condition)
        } else {
            selectedAvoidConditions.insert(condition)
        }
    }

    // 希望条件の選択をトグル
    func togglePreferCondition(_ condition: PreferCondition) {
        if selectedPreferConditions.contains(condition) {
            selectedPreferConditions.remove(condition)
        } else {
            selectedPreferConditions.insert(condition)
        }
    }

    // プロファイルInput生成
    func buildProfileInput() -> UserProfileInput {
        UserProfileInput(
            mobilityType: selectedMobilityType,
            companions: Array(selectedCompanions),
            maxDistanceMeters: maxDistanceMeters,
            avoidConditions: Array(selectedAvoidConditions),
            preferConditions: Array(selectedPreferConditions)
        )
    }

    // プロファイル保存（API送信）
    func submitProfile() async {
        isSubmitting = true
        errorMessage = nil

        // TODO: Firebase Auth トークン取得後に実装
        // let input = buildProfileInput()
        // do {
        //     let token = try await AuthService.shared.getToken()
        //     _ = try await APIService.shared.saveProfile(input: input, token: token)
        // } catch {
        //     errorMessage = error.localizedDescription
        // }

        // 現時点ではローカル保存のみ
        UserDefaults.standard.set(true, forKey: "onboardingCompleted")
        isSubmitting = false
    }
}
