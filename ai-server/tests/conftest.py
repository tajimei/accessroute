"""pytest 共通設定・フィクスチャ。

テスト全体で共有するフィクスチャやヘルパーを定義する。
"""

import pytest


@pytest.fixture
def sample_user_profile() -> dict:
    """テスト用のユーザープロフィールデータ。"""
    return {
        "user_id": "test-user-001",
        "mobility_type": "wheelchair",
        "preferences": {
            "avoid_stairs": True,
            "prefer_elevator": True,
            "max_slope_degree": 5,
        },
    }


@pytest.fixture
def sample_route_request() -> dict:
    """テスト用のルート検索リクエストデータ。"""
    return {
        "origin": {"lat": 35.6812, "lng": 139.7671},
        "destination": {"lat": 35.6595, "lng": 139.7004},
        "mobility_type": "wheelchair",
        "preferences": {
            "avoid_stairs": True,
            "prefer_elevator": True,
        },
    }
