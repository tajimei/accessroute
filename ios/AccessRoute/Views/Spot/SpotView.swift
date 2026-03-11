import SwiftUI

// スポット一覧画面
struct SpotView: View {
    @StateObject private var homeViewModel = HomeViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if homeViewModel.isSearching {
                    ProgressView("スポットを検索中...")
                        .accessibilityLabel("スポット検索中")
                } else if homeViewModel.nearbySpots.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "mappin.and.ellipse")
                            .font(.system(size: 48))
                            .foregroundStyle(.secondary)
                        Text("周辺スポットを検索中...")
                            .foregroundStyle(.secondary)
                    }
                } else {
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(homeViewModel.nearbySpots) { spot in
                                NavigationLink {
                                    SpotDetailView(spotId: spot.spotId)
                                } label: {
                                    SpotListRow(spot: spot)
                                        .padding(.horizontal)
                                        .padding(.vertical, 4)
                                }
                                .accessibilityLabel("\(spot.name)、\(spot.category.label)、スコア\(spot.accessibilityScore)点")

                                Divider()
                                    .padding(.leading, 64)
                            }
                        }
                    }
                }
            }
            .navigationTitle("スポット")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                // モック位置で周辺スポット検索
                await homeViewModel.searchNearbySpots(lat: 35.6812, lng: 139.7671)
            }
        }
    }
}

// スポットリスト行
struct SpotListRow: View {
    let spot: SpotSummary

    var body: some View {
        HStack(spacing: 12) {
            // カテゴリアイコン
            Image(systemName: spot.category.iconName)
                .font(.title3)
                .foregroundStyle(.white)
                .frame(width: 40, height: 40)
                .background(
                    AccessibilityHelpers.scoreColor(for: spot.accessibilityScore),
                    in: RoundedRectangle(cornerRadius: 10)
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(spot.name)
                    .font(.subheadline)
                    .fontWeight(.medium)

                HStack(spacing: 8) {
                    Text(spot.category.label)
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Text("\(Int(spot.distanceFromRoute))m")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            // スコア
            Text("\(spot.accessibilityScore)")
                .font(.headline)
                .foregroundStyle(AccessibilityHelpers.scoreColor(for: spot.accessibilityScore))
        }
        .padding(.vertical, 4)
    }

}
