import Foundation

struct Product: Codable, Identifiable {
    let id: String
    let name: String
    let description: String
    let category: String
    let connectionType: String
    let status: String
    let createdAt: String
    let updatedAt: String
    var image: String?
}

struct Device: Codable, Identifiable {
    let id: String
    let name: String
    let productId: String
    let sn: String
    let mac: String
    let firmwareVersion: String
    let status: String
    let lastOnlineAt: String
    let createdAt: String

    var isOnline: Bool { status == "online" }
}

struct ThingModelProperty: Codable, Identifiable {
    let id: String
    let productId: String
    let identifier: String
    let name: String
    let description: String
    let dataType: String
    let accessMode: String
    let required: Bool
    let createdAt: String
    let updatedAt: String
}

struct ThingModelService: Codable, Identifiable {
    let id: String
    let productId: String
    let identifier: String
    let name: String
    let description: String
    let propertyIds: [String]
    let actionIds: [String]
    let createdAt: String
    let updatedAt: String
}

// Response from GET /devices/:did/properties/all
struct ServicePropertyGroup: Codable {
    let siid: Int
    let service: ThingModelService
    let properties: [PropertyValue]
}

struct PropertyValue: Codable, Identifiable {
    let siid: Int
    let piid: Int
    let did: String
    let prop: ThingModelProperty?
    let value: AnyCodable?

    var id: String { "\(siid):\(piid)" }
}

// miio-style response
struct MiioResponse: Codable {
    let id: Int
    let result: [MiioPropertyResult]
}

struct MiioPropertyResult: Codable {
    let did: String
    let siid: Int
    let piid: Int
    let code: Int
    var value: AnyCodable?
}

// A type-erased Codable wrapper for JSON values
struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) { self.value = value }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() {
            self.value = NSNull()
        } else if let b = try? container.decode(Bool.self) {
            self.value = b
        } else if let i = try? container.decode(Int.self) {
            self.value = i
        } else if let d = try? container.decode(Double.self) {
            self.value = d
        } else if let s = try? container.decode(String.self) {
            self.value = s
        } else {
            self.value = NSNull()
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch value {
        case let b as Bool: try container.encode(b)
        case let i as Int: try container.encode(i)
        case let d as Double: try container.encode(d)
        case let s as String: try container.encode(s)
        default: try container.encodeNil()
        }
    }

    var displayString: String {
        switch value {
        case let b as Bool: return b ? "true" : "false"
        case let i as Int: return "\(i)"
        case let d as Double: return String(format: "%.2f", d)
        case let s as String: return s
        case is NSNull: return "null"
        default: return "\(value)"
        }
    }
}
