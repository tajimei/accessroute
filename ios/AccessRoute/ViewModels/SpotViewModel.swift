import Foundation

// スポット詳細画面のViewModel
@MainActor
final class SpotViewModel: ObservableObject {
    @Published var spotDetail: SpotDetail?
    @Published var isLoading = false
    @Published var errorMessage: String?

    // スポット詳細取得
    func loadSpotDetail(spotId: String) async {
        isLoading = true
        errorMessage = nil

        // TODO: Firebase Auth トークン取得後に実装
        // do {
        //     let token = try await AuthService.shared.getToken()
        //     spotDetail = try await APIService.shared.getSpotDetail(
        //         spotId: spotId, token: token
        //     )
        // } catch {
        //     errorMessage = error.localizedDescription
        // }

        // モックデータで表示確認
        spotDetail = Self.mockSpotDetail(spotId: spotId)
        isLoading = false
    }

    // プレビュー用モックデータ
    static func mockSpotDetail(spotId: String) -> SpotDetail {
        SpotDetail(
            spotId: spotId,
            name: "バリアフリーカフェ サンプル",
            description: "車椅子でもゆったり過ごせるバリアフリー対応のカフェです。段差なしの入口、広い通路、多目的トイレを完備しています。",
            category: .cafe,
            location: LatLng(lat: 35.6812, lng: 139.7671),
            address: "東京都千代田区丸の内1-1-1",
            accessibilityScore: 85,
            accessibility: AccessibilityInfo(
                wheelchairAccessible: true,
                hasElevator: true,
                hasAccessibleRestroom: true,
                hasBabyChangingStation: true,
                hasNursingRoom: false,
                floorType: .flat,
                notes: ["入口にスロープあり", "テーブル間隔が広い"]
            ),
            photoUrls: [],
            openingHours: "9:00 - 21:00",
            phoneNumber: "03-1234-5678",
            website: "https://example.com"
        )
    }
}
