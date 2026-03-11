import CoreLocation

// Google Encoded Polyline をデコードして座標配列に変換するユーティリティ
enum PolylineDecoder {
    /// エンコードされたポリライン文字列を座標配列にデコード
    static func decode(_ encoded: String) -> [CLLocationCoordinate2D] {
        var coordinates: [CLLocationCoordinate2D] = []
        var index = encoded.startIndex
        var lat: Int32 = 0
        var lng: Int32 = 0

        while index < encoded.endIndex {
            // 緯度のデコード
            let latDelta = decodeValue(from: encoded, index: &index)
            lat += latDelta

            guard index < encoded.endIndex else { break }

            // 経度のデコード
            let lngDelta = decodeValue(from: encoded, index: &index)
            lng += lngDelta

            coordinates.append(
                CLLocationCoordinate2D(
                    latitude: Double(lat) / 1e5,
                    longitude: Double(lng) / 1e5
                )
            )
        }

        return coordinates
    }

    private static func decodeValue(from string: String, index: inout String.Index) -> Int32 {
        var result: Int32 = 0
        var shift: Int32 = 0

        while index < string.endIndex {
            var byte = Int32(string[index].asciiValue! - 63)
            index = string.index(after: index)
            result |= (byte & 0x1F) << shift
            shift += 5
            if byte < 0x20 { break }
        }

        // 符号ビットの処理
        if result & 1 != 0 {
            return ~(result >> 1)
        } else {
            return result >> 1
        }
    }
}
