import Foundation

// 座標
struct LatLng: Codable {
    let lat: Double
    let lng: Double
}

// ルート優先度
enum RoutePriority: String, Codable, CaseIterable, Identifiable {
    case shortest
    case safest
    case accessible

    var id: String { rawValue }

    var label: String {
        switch self {
        case .shortest: return "最短ルート"
        case .safest: return "安全ルート"
        case .accessible: return "バリアフリールート"
        }
    }
}

// 路面タイプ
enum SurfaceType: String, Codable {
    case paved
    case gravel
    case dirt
    case unknown
}

// ルート検索リクエスト
struct RouteRequest: Codable {
    let origin: LatLng
    let destination: LatLng
    let userProfileId: String
    let prioritize: RoutePriority
}

// ルートのステップ
struct RouteStep: Codable, Identifiable {
    var id: String { stepId }
    let stepId: String
    let instruction: String
    let distanceMeters: Double
    let durationSeconds: Double
    let startLocation: LatLng
    let endLocation: LatLng
    let polyline: String
    let hasStairs: Bool
    let hasSlope: Bool
    let slopeGrade: Double?
    let surfaceType: SurfaceType?
}

// ルート検索結果
struct RouteResult: Codable, Identifiable {
    var id: String { routeId }
    let routeId: String
    let accessibilityScore: Int
    let distanceMeters: Double
    let durationMinutes: Double
    let steps: [RouteStep]
    let warnings: [String]
    let nearbySpots: [SpotSummary]
}

// ルート検索レスポンス
struct RouteResponse: Codable {
    let routes: [RouteResult]
}
