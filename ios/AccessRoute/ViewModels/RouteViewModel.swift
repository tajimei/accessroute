import Foundation

// ルート検索画面のViewModel
@MainActor
final class RouteViewModel: ObservableObject {
    @Published var selectedPriority: RoutePriority = .accessible
    @Published var routeResults: [RouteResult] = []
    @Published var selectedRoute: RouteResult?
    @Published var isSearching = false
    @Published var errorMessage: String?
    @Published var destinationText = ""

    // ルート検索
    func searchRoute(
        origin: LatLng,
        destination: LatLng,
        userProfileId: String
    ) async {
        isSearching = true
        errorMessage = nil

        // TODO: Firebase Auth トークン取得後に実装
        // do {
        //     let token = try await AuthService.shared.getToken()
        //     let request = RouteRequest(
        //         origin: origin,
        //         destination: destination,
        //         userProfileId: userProfileId,
        //         prioritize: selectedPriority
        //     )
        //     let response = try await APIService.shared.searchRoute(
        //         request: request, token: token
        //     )
        //     routeResults = response.routes
        // } catch {
        //     errorMessage = error.localizedDescription
        // }

        // モックデータで表示確認
        routeResults = Self.mockRouteResults()
        isSearching = false
    }

    // ルート選択
    func selectRoute(_ route: RouteResult) {
        selectedRoute = route
    }

    // モックデータ
    static func mockRouteResults() -> [RouteResult] {
        [
            RouteResult(
                routeId: "route_1",
                accessibilityScore: 92,
                distanceMeters: 850,
                durationMinutes: 12,
                steps: [
                    RouteStep(
                        stepId: "step_1_1",
                        instruction: "北口を出て右に進む",
                        distanceMeters: 200,
                        durationSeconds: 180,
                        startLocation: LatLng(lat: 35.6812, lng: 139.7671),
                        endLocation: LatLng(lat: 35.6820, lng: 139.7675),
                        polyline: "o~wxEkgatY{@Sg@Sg@SSS",
                        hasStairs: false,
                        hasSlope: false,
                        slopeGrade: nil,
                        surfaceType: .paved
                    ),
                    RouteStep(
                        stepId: "step_1_2",
                        instruction: "交差点を左折し、歩道を直進",
                        distanceMeters: 350,
                        durationSeconds: 300,
                        startLocation: LatLng(lat: 35.6820, lng: 139.7675),
                        endLocation: LatLng(lat: 35.6835, lng: 139.7680),
                        polyline: "ocxxE{iatYg@S{@S{@Sg@Sg@S{@?",
                        hasStairs: false,
                        hasSlope: true,
                        slopeGrade: 3.0,
                        surfaceType: .paved
                    ),
                    RouteStep(
                        stepId: "step_1_3",
                        instruction: "目的地に到着",
                        distanceMeters: 300,
                        durationSeconds: 240,
                        startLocation: LatLng(lat: 35.6835, lng: 139.7680),
                        endLocation: LatLng(lat: 35.6845, lng: 139.7690),
                        polyline: "{lxxE_matYg@g@g@g@g@g@g@g@g@g@",
                        hasStairs: false,
                        hasSlope: false,
                        slopeGrade: nil,
                        surfaceType: .paved
                    )
                ],
                warnings: [],
                nearbySpots: [
                    SpotSummary(
                        spotId: "spot_1",
                        name: "多目的トイレ A",
                        category: .restroom,
                        location: LatLng(lat: 35.6825, lng: 139.7678),
                        accessibilityScore: 90,
                        distanceFromRoute: 20
                    )
                ]
            ),
            RouteResult(
                routeId: "route_2",
                accessibilityScore: 68,
                distanceMeters: 620,
                durationMinutes: 8,
                steps: [
                    RouteStep(
                        stepId: "step_2_1",
                        instruction: "南口を出て直進",
                        distanceMeters: 300,
                        durationSeconds: 200,
                        startLocation: LatLng(lat: 35.6812, lng: 139.7671),
                        endLocation: LatLng(lat: 35.6830, lng: 139.7685),
                        polyline: "o~wxEkgatY{@{@{@{@oA{@oA{@oAg@",
                        hasStairs: true,
                        hasSlope: false,
                        slopeGrade: nil,
                        surfaceType: .paved
                    ),
                    RouteStep(
                        stepId: "step_2_2",
                        instruction: "階段を上り、右折",
                        distanceMeters: 320,
                        durationSeconds: 280,
                        startLocation: LatLng(lat: 35.6830, lng: 139.7685),
                        endLocation: LatLng(lat: 35.6845, lng: 139.7690),
                        polyline: "wixxEcpatY{@S{@S{@S{@S{@S",
                        hasStairs: true,
                        hasSlope: false,
                        slopeGrade: nil,
                        surfaceType: .paved
                    )
                ],
                warnings: ["この区間に階段があります", "段差に注意してください"],
                nearbySpots: []
            ),
            RouteResult(
                routeId: "route_3",
                accessibilityScore: 45,
                distanceMeters: 520,
                durationMinutes: 7,
                steps: [
                    RouteStep(
                        stepId: "step_3_1",
                        instruction: "地下通路を通る",
                        distanceMeters: 520,
                        durationSeconds: 420,
                        startLocation: LatLng(lat: 35.6812, lng: 139.7671),
                        endLocation: LatLng(lat: 35.6845, lng: 139.7690),
                        polyline: "o~wxEkgatYoA{@oA{@cB{@cB{@cB{@cBg@cBg@",
                        hasStairs: true,
                        hasSlope: true,
                        slopeGrade: 8.0,
                        surfaceType: .paved
                    )
                ],
                warnings: ["階段が複数あります", "急な坂道があります", "暗い通路を通ります"],
                nearbySpots: []
            )
        ]
    }
}
