import SwiftUI

// オンボーディング画面（5ステップウィザード）
struct OnboardingView: View {
    @StateObject private var viewModel = OnboardingViewModel()
    @Binding var isOnboardingCompleted: Bool

    var body: some View {
        VStack(spacing: 0) {
            // 進捗バー
            ProgressView(value: viewModel.progress)
                .progressViewStyle(.linear)
                .tint(.blue)
                .padding(.horizontal)
                .padding(.top, 8)
                .accessibilityLabel("オンボーディング進捗")
                .accessibilityValue("ステップ \(viewModel.currentStepIndex + 1) / \(viewModel.totalSteps)")

            // ステップ表示
            Text("ステップ \(viewModel.currentStepIndex + 1) / \(viewModel.totalSteps)")
                .font(.caption)
                .foregroundStyle(.secondary)
                .padding(.top, 4)

            // ステップコンテンツ
            TabView(selection: $viewModel.currentStep) {
                MobilityTypeStepView(viewModel: viewModel)
                    .tag(OnboardingStep.mobilityType)

                CompanionStepView(viewModel: viewModel)
                    .tag(OnboardingStep.companions)

                MaxDistanceStepView(viewModel: viewModel)
                    .tag(OnboardingStep.maxDistance)

                AvoidConditionStepView(viewModel: viewModel)
                    .tag(OnboardingStep.avoidConditions)

                PreferConditionStepView(viewModel: viewModel)
                    .tag(OnboardingStep.preferConditions)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.easeInOut, value: viewModel.currentStep)

            // エラーメッセージ
            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .padding(.horizontal)
            }

            // ナビゲーションボタン
            HStack(spacing: 16) {
                if viewModel.currentStepIndex > 0 {
                    Button {
                        viewModel.previousStep()
                    } label: {
                        HStack {
                            Image(systemName: "chevron.left")
                            Text("戻る")
                        }
                        .ensureMinimumTapTarget()
                    }
                    .accessibilityLabel("前のステップに戻る")
                }

                Spacer()

                if viewModel.isLastStep {
                    Button {
                        Task {
                            await viewModel.submitProfile()
                            isOnboardingCompleted = true
                        }
                    } label: {
                        HStack {
                            Text("完了")
                            Image(systemName: "checkmark")
                        }
                        .fontWeight(.bold)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 24)
                        .ensureMinimumTapTarget()
                        .background(.blue, in: RoundedRectangle(cornerRadius: 12))
                    }
                    .disabled(viewModel.isSubmitting)
                    .accessibilityLabel("設定を完了する")
                } else {
                    Button {
                        viewModel.nextStep()
                    } label: {
                        HStack {
                            Text("次へ")
                            Image(systemName: "chevron.right")
                        }
                        .fontWeight(.bold)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 24)
                        .ensureMinimumTapTarget()
                        .background(.blue, in: RoundedRectangle(cornerRadius: 12))
                    }
                    .disabled(!viewModel.canProceed)
                    .accessibilityLabel("次のステップに進む")
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 24)
        }
    }
}

// MARK: - Step1: 移動手段選択

struct MobilityTypeStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    var body: some View {
        VStack(spacing: 20) {
            StepHeaderView(step: .mobilityType)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                ForEach(MobilityType.allCases) { type in
                    SelectionCard(
                        title: type.label,
                        iconName: type.iconName,
                        isSelected: viewModel.selectedMobilityType == type
                    ) {
                        viewModel.selectedMobilityType = type
                    }
                    .accessibilityLabel("\(type.label)を選択")
                    .accessibilityAddTraits(viewModel.selectedMobilityType == type ? .isSelected : [])
                }
            }
            .padding(.horizontal)

            Spacer()
        }
    }
}

// MARK: - Step2: 同行者選択

struct CompanionStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    var body: some View {
        VStack(spacing: 20) {
            StepHeaderView(step: .companions)

            Text("該当するものを全て選択してください（なしでもOK）")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                ForEach(Companion.allCases) { companion in
                    SelectionCard(
                        title: companion.label,
                        iconName: companion.iconName,
                        isSelected: viewModel.selectedCompanions.contains(companion)
                    ) {
                        viewModel.toggleCompanion(companion)
                    }
                    .accessibilityLabel("\(companion.label)を選択")
                    .accessibilityAddTraits(viewModel.selectedCompanions.contains(companion) ? .isSelected : [])
                }
            }
            .padding(.horizontal)

            Spacer()
        }
    }
}

// MARK: - Step3: 最大移動距離設定

struct MaxDistanceStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    var body: some View {
        VStack(spacing: 20) {
            StepHeaderView(step: .maxDistance)

            Spacer()

            Text(AccessibilityHelpers.distanceText(meters: viewModel.maxDistanceMeters))
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .accessibilityLabel("最大移動距離 \(AccessibilityHelpers.distanceText(meters: viewModel.maxDistanceMeters))")

            Slider(
                value: $viewModel.maxDistanceMeters,
                in: 100...5000,
                step: 100
            ) {
                Text("最大移動距離")
            } minimumValueLabel: {
                Text("100m")
                    .font(.caption)
            } maximumValueLabel: {
                Text("5km")
                    .font(.caption)
            }
            .padding(.horizontal, 32)
            .accessibilityLabel("最大移動距離スライダー")
            .accessibilityValue(AccessibilityHelpers.distanceText(meters: viewModel.maxDistanceMeters))

            Spacer()
        }
    }
}

// MARK: - Step4: 回避条件

struct AvoidConditionStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    var body: some View {
        VStack(spacing: 20) {
            StepHeaderView(step: .avoidConditions)

            Text("該当するものを全て選択してください（なしでもOK）")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                ForEach(AvoidCondition.allCases) { condition in
                    SelectionCard(
                        title: condition.label,
                        iconName: condition.iconName,
                        isSelected: viewModel.selectedAvoidConditions.contains(condition)
                    ) {
                        viewModel.toggleAvoidCondition(condition)
                    }
                    .accessibilityLabel("\(condition.label)を回避")
                    .accessibilityAddTraits(viewModel.selectedAvoidConditions.contains(condition) ? .isSelected : [])
                }
            }
            .padding(.horizontal)

            Spacer()
        }
    }
}

// MARK: - Step5: 希望条件

struct PreferConditionStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    var body: some View {
        VStack(spacing: 20) {
            StepHeaderView(step: .preferConditions)

            Text("該当するものを全て選択してください（なしでもOK）")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                ForEach(PreferCondition.allCases) { condition in
                    SelectionCard(
                        title: condition.label,
                        iconName: condition.iconName,
                        isSelected: viewModel.selectedPreferConditions.contains(condition)
                    ) {
                        viewModel.togglePreferCondition(condition)
                    }
                    .accessibilityLabel("\(condition.label)を希望")
                    .accessibilityAddTraits(viewModel.selectedPreferConditions.contains(condition) ? .isSelected : [])
                }
            }
            .padding(.horizontal)

            Spacer()
        }
    }
}

// MARK: - 共通コンポーネント

// ステップのヘッダー
struct StepHeaderView: View {
    let step: OnboardingStep

    var body: some View {
        VStack(spacing: 8) {
            Text(step.title)
                .font(.title)
                .fontWeight(.bold)

            Text(step.subtitle)
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 24)
        .padding(.horizontal)
    }
}

// 選択カード（単一選択・複数選択共用）
struct SelectionCard: View {
    let title: String
    let iconName: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Image(systemName: iconName)
                    .font(.title)
                    .foregroundStyle(isSelected ? .white : .primary)

                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(isSelected ? .white : .primary)
            }
            .frame(maxWidth: .infinity)
            .frame(minHeight: 100)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(isSelected ? AppColors.selectedBackground : AppColors.unselectedBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? AppColors.selectedBackground : Color.clear, lineWidth: 2)
            )
        }
        .ensureMinimumTapTarget()
    }
}
