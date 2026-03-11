"""ルート検索フローのE2Eテスト。

プロファイル設定 -> 目的地指定 -> ルート検索 -> 結果取得
の一連のフローをモック版でテストする。
外部API依存なしで実行可能。
"""

import json
from typing import Any

import pytest


# --- テスト用のモッククラス ---


class MockFirestore:
    """Firestoreのモック。"""

    def __init__(self) -> None:
        self.data: dict[str, dict[str, Any]] = {}

    def get_user_profile(self, user_id: str) -> dict[str, Any] | None:
        """ユーザープロファイルを取得する。"""
        return self.data.get(f"users/{user_id}")

    def upsert_user_profile(
        self, user_id: str, profile: dict[str, Any]
    ) -> dict[str, Any]:
        """ユーザープロファイルを更新する。"""
        key = f"users/{user_id}"
        existing = self.data.get(key, {})
        existing.update(profile)
        existing["userId"] = user_id
        self.data[key] = existing
        return existing

    def save_search_history(
        self, user_id: str, search_type: str, query: dict[str, Any]
    ) -> None:
        """検索履歴を保存する。"""
        key = f"search_history/{user_id}/{len(self.data)}"
        self.data[key] = {
            "userId": user_id,
            "searchType": search_type,
            "query": query,
        }


class MockMapsApi:
    """Google Maps APIのモック。"""

    def __init__(self) -> None:
        self.routes: list[dict[str, Any]] = []

    def add_route(self, route: dict[str, Any]) -> None:
        """ルートを追加する。"""
        self.routes.append(route)

    def search_routes(
        self,
        origin: dict[str, float],
        destination: dict[str, float],
        prioritize: str = "accessible",
    ) -> list[dict[str, Any]]:
        """ルートを検索する。"""
        if not self.routes:
            return self._default_routes(origin, destination)
        return self.routes

    def search_nearby_places(
        self,
        lat: float,
        lng: float,
        radius_meters: int = 300,
    ) -> list[dict[str, Any]]:
        """周辺スポットを検索する。"""
        return [
            {
                "spotId": "spot-001",
                "name": "バリアフリートイレ（丸の内側）",
                "category": "restroom",
                "location": {"lat": lat + 0.001, "lng": lng + 0.001},
                "accessibilityScore": 0.9,
                "distanceFromRoute": 50,
            },
            {
                "spotId": "spot-002",
                "name": "休憩ベンチ広場",
                "category": "rest_area",
                "location": {"lat": lat + 0.002, "lng": lng - 0.001},
                "accessibilityScore": 0.85,
                "distanceFromRoute": 100,
            },
        ]

    def _default_routes(
        self, origin: dict[str, float], destination: dict[str, float]
    ) -> list[dict[str, Any]]:
        """デフォルトのルートを返す。"""
        return [
            {
                "distanceMeters": 1200,
                "durationSeconds": 900,
                "steps": [
                    {
                        "stepId": "step-1",
                        "instruction": "東京駅丸の内口を出て直進",
                        "distanceMeters": 300,
                        "durationSeconds": 240,
                        "startLocation": origin,
                        "endLocation": {
                            "lat": (origin["lat"] + destination["lat"]) / 2,
                            "lng": (origin["lng"] + destination["lng"]) / 2,
                        },
                        "polyline": "encodedPolyline1",
                        "hasStairs": False,
                        "hasSlope": False,
                        "surfaceType": "paved",
                    },
                    {
                        "stepId": "step-2",
                        "instruction": "横断歩道を渡って右折",
                        "distanceMeters": 500,
                        "durationSeconds": 360,
                        "startLocation": {
                            "lat": (origin["lat"] + destination["lat"]) / 2,
                            "lng": (origin["lng"] + destination["lng"]) / 2,
                        },
                        "endLocation": destination,
                        "polyline": "encodedPolyline2",
                        "hasStairs": False,
                        "hasSlope": True,
                        "slopeGrade": 3,
                        "surfaceType": "paved",
                    },
                ],
            },
            {
                "distanceMeters": 1500,
                "durationSeconds": 1200,
                "steps": [
                    {
                        "stepId": "step-3",
                        "instruction": "東京駅八重洲口を出て北へ",
                        "distanceMeters": 800,
                        "durationSeconds": 600,
                        "startLocation": origin,
                        "endLocation": destination,
                        "polyline": "encodedPolyline3",
                        "hasStairs": True,
                        "hasSlope": False,
                        "surfaceType": "paved",
                    },
                ],
            },
        ]


def calculate_route_score(
    steps: list[dict[str, Any]],
    profile: dict[str, Any],
    nearby_spots: list[dict[str, Any]] | None = None,
) -> float:
    """ルートのアクセシビリティスコアを計算する（簡易版）。"""
    score = 1.0
    avoid = profile.get("avoidConditions", [])

    for step in steps:
        if step.get("hasStairs") and "stairs" in avoid:
            score -= 0.3
        if step.get("hasSlope") and "slope" in avoid:
            grade = step.get("slopeGrade", 5)
            score -= 0.1 * (grade / 5)

    # 希望条件のスポットが近くにある場合はボーナス
    prefer = profile.get("preferConditions", [])
    if nearby_spots and prefer:
        for spot in nearby_spots:
            if spot.get("category") in prefer:
                score += 0.05

    return max(0.0, min(1.0, score))


def generate_warnings(
    steps: list[dict[str, Any]], profile: dict[str, Any]
) -> list[str]:
    """ルートの警告を生成する（簡易版）。"""
    warnings: list[str] = []
    avoid = profile.get("avoidConditions", [])

    for step in steps:
        if step.get("hasStairs") and "stairs" in avoid:
            warnings.append(f"階段あり: {step.get('instruction', '')}")
        if step.get("hasSlope") and "slope" in avoid:
            warnings.append(f"坂道あり: {step.get('instruction', '')}")

    return warnings


# --- テストフィクスチャ ---


@pytest.fixture
def mock_firestore() -> MockFirestore:
    """Firestoreモック。"""
    return MockFirestore()


@pytest.fixture
def mock_maps_api() -> MockMapsApi:
    """Maps APIモック。"""
    return MockMapsApi()


# --- E2Eテスト ---


class TestRouteFlowE2E:
    """ルート検索フローの全体テスト。"""

    def test_full_route_search_flow_wheelchair(
        self,
        mock_firestore: MockFirestore,
        mock_maps_api: MockMapsApi,
    ) -> None:
        """車椅子ユーザーのルート検索フロー。

        1. プロファイル設定
        2. 目的地指定
        3. ルート検索
        4. アクセシビリティスコア計算
        5. 結果取得・警告確認
        """
        user_id = "test-user-001"

        # ステップ1: プロファイル設定
        profile = mock_firestore.upsert_user_profile(
            user_id,
            {
                "mobilityType": "wheelchair",
                "companions": [],
                "maxDistanceMeters": 1000,
                "avoidConditions": ["stairs", "slope"],
                "preferConditions": ["restroom", "rest_area"],
            },
        )
        assert profile["mobilityType"] == "wheelchair"

        # ステップ2: 目的地指定
        origin = {"lat": 35.6812, "lng": 139.7671}  # 東京駅
        destination = {"lat": 35.6762, "lng": 139.7704}  # 丸の内

        # ステップ3: ルート検索
        raw_routes = mock_maps_api.search_routes(origin, destination, "accessible")
        assert len(raw_routes) >= 1

        # ステップ4: スコア計算と結果構築
        results = []
        for i, raw_route in enumerate(raw_routes):
            # 中間地点で周辺スポットを検索
            mid_step = raw_route["steps"][len(raw_route["steps"]) // 2]
            nearby_spots = mock_maps_api.search_nearby_places(
                mid_step["startLocation"]["lat"],
                mid_step["startLocation"]["lng"],
            )

            score = calculate_route_score(
                raw_route["steps"], profile, nearby_spots
            )
            warnings = generate_warnings(raw_route["steps"], profile)

            results.append(
                {
                    "routeId": f"route-{i}",
                    "accessibilityScore": score,
                    "distanceMeters": raw_route["distanceMeters"],
                    "durationMinutes": raw_route["durationSeconds"] // 60,
                    "steps": raw_route["steps"],
                    "warnings": warnings,
                    "nearbySpots": nearby_spots,
                }
            )

        # アクセシビリティスコア順にソート
        results.sort(key=lambda r: r["accessibilityScore"], reverse=True)

        # ステップ5: 結果検証
        best_route = results[0]
        assert best_route["accessibilityScore"] >= 0.0

        # 階段のあるルートは低スコアになるはず
        stair_route = next(
            (
                r
                for r in results
                if any(s.get("hasStairs") for s in r["steps"])
            ),
            None,
        )
        if stair_route:
            assert stair_route["accessibilityScore"] < best_route["accessibilityScore"]

        # 車椅子ユーザーで階段ルートには警告があること
        if stair_route:
            assert len(stair_route["warnings"]) > 0
            assert any("階段" in w for w in stair_route["warnings"])

        # 近隣スポットにバリアフリートイレがあること
        assert len(best_route["nearbySpots"]) > 0
        restroom_spots = [
            s for s in best_route["nearbySpots"] if s["category"] == "restroom"
        ]
        assert len(restroom_spots) > 0

        # 検索履歴の保存
        mock_firestore.save_search_history(
            user_id,
            "route",
            {
                "origin": origin,
                "destination": destination,
                "prioritize": "accessible",
                "resultCount": len(results),
            },
        )

    def test_route_search_with_distance_limit(
        self,
        mock_firestore: MockFirestore,
        mock_maps_api: MockMapsApi,
    ) -> None:
        """距離制限付きルート検索。"""
        user_id = "test-user-002"

        profile = mock_firestore.upsert_user_profile(
            user_id,
            {
                "mobilityType": "cane",
                "companions": ["elderly"],
                "maxDistanceMeters": 500,
                "avoidConditions": ["stairs"],
                "preferConditions": ["rest_area"],
            },
        )

        origin = {"lat": 35.6812, "lng": 139.7671}
        destination = {"lat": 35.6762, "lng": 139.7704}

        raw_routes = mock_maps_api.search_routes(origin, destination)

        # 距離制限でフィルタリング
        max_distance = profile["maxDistanceMeters"]
        filtered_routes = [
            r for r in raw_routes if r["distanceMeters"] <= max_distance
        ]

        # 全ルートが距離制限を超えている場合でも結果を返す（警告付き）
        if not filtered_routes:
            # 最短ルートを返し、警告を追加
            shortest = min(raw_routes, key=lambda r: r["distanceMeters"])
            warnings = generate_warnings(shortest["steps"], profile)
            warnings.append(
                f"設定された移動距離（{max_distance}m）を超えています: "
                f"{shortest['distanceMeters']}m"
            )
            assert len(warnings) > 0

    def test_route_search_stroller_family(
        self,
        mock_firestore: MockFirestore,
        mock_maps_api: MockMapsApi,
    ) -> None:
        """ベビーカーファミリーのルート検索。"""
        user_id = "test-user-003"

        profile = mock_firestore.upsert_user_profile(
            user_id,
            {
                "mobilityType": "stroller",
                "companions": ["child"],
                "maxDistanceMeters": 300,
                "avoidConditions": ["stairs", "slope"],
                "preferConditions": ["rest_area"],
            },
        )

        origin = {"lat": 35.6812, "lng": 139.7671}
        destination = {"lat": 35.6762, "lng": 139.7704}

        raw_routes = mock_maps_api.search_routes(origin, destination)

        # 各ルートの評価
        for route in raw_routes:
            score = calculate_route_score(route["steps"], profile)
            warnings = generate_warnings(route["steps"], profile)

            # ベビーカーで階段は問題
            for step in route["steps"]:
                if step.get("hasStairs"):
                    assert score < 1.0
                    assert any("階段" in w for w in warnings)

    def test_route_search_no_profile(
        self,
        mock_firestore: MockFirestore,
        mock_maps_api: MockMapsApi,
    ) -> None:
        """プロファイル未設定時のルート検索。"""
        user_id = "unknown-user"

        profile = mock_firestore.get_user_profile(user_id)
        assert profile is None

        # プロファイルなしの場合はデフォルト設定で検索
        default_profile = {
            "mobilityType": "walk",
            "companions": [],
            "maxDistanceMeters": 2000,
            "avoidConditions": [],
            "preferConditions": [],
        }

        origin = {"lat": 35.6812, "lng": 139.7671}
        destination = {"lat": 35.6762, "lng": 139.7704}

        raw_routes = mock_maps_api.search_routes(origin, destination)
        assert len(raw_routes) > 0

        # デフォルトプロファイルではavoidConditionsが空なので警告なし
        for route in raw_routes:
            warnings = generate_warnings(route["steps"], default_profile)
            assert len(warnings) == 0

    def test_route_search_priority_shortest(
        self,
        mock_firestore: MockFirestore,
        mock_maps_api: MockMapsApi,
    ) -> None:
        """最短ルート優先の検索。"""
        user_id = "test-user-004"

        profile = mock_firestore.upsert_user_profile(
            user_id,
            {
                "mobilityType": "walk",
                "companions": [],
                "maxDistanceMeters": 5000,
                "avoidConditions": [],
                "preferConditions": [],
            },
        )

        origin = {"lat": 35.6812, "lng": 139.7671}
        destination = {"lat": 35.6762, "lng": 139.7704}

        raw_routes = mock_maps_api.search_routes(origin, destination, "shortest")

        # 距離順にソート
        sorted_routes = sorted(raw_routes, key=lambda r: r["distanceMeters"])
        assert sorted_routes[0]["distanceMeters"] <= sorted_routes[-1]["distanceMeters"]

    def test_route_search_saves_history(
        self,
        mock_firestore: MockFirestore,
        mock_maps_api: MockMapsApi,
    ) -> None:
        """ルート検索が検索履歴を保存すること。"""
        user_id = "test-user-005"

        mock_firestore.upsert_user_profile(
            user_id,
            {
                "mobilityType": "wheelchair",
                "companions": [],
                "maxDistanceMeters": 1000,
                "avoidConditions": ["stairs"],
                "preferConditions": [],
            },
        )

        origin = {"lat": 35.6812, "lng": 139.7671}
        destination = {"lat": 35.6762, "lng": 139.7704}

        raw_routes = mock_maps_api.search_routes(origin, destination)

        # 検索履歴を保存
        mock_firestore.save_search_history(
            user_id,
            "route",
            {
                "origin": origin,
                "destination": destination,
                "prioritize": "accessible",
                "resultCount": len(raw_routes),
            },
        )

        # 検索履歴が保存されていること
        history_keys = [
            k for k in mock_firestore.data.keys() if k.startswith("search_history/")
        ]
        assert len(history_keys) > 0

        history_entry = mock_firestore.data[history_keys[0]]
        assert history_entry["userId"] == user_id
        assert history_entry["searchType"] == "route"
        assert history_entry["query"]["resultCount"] == len(raw_routes)
