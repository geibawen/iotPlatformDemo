import Foundation

class APIService: ObservableObject {
    static let shared = APIService()

    private let baseURL = "http://localhost:3001/api"

    private init() {}

    // MARK: - Products

    func fetchProducts() async throws -> [Product] {
        let url = URL(string: "\(baseURL)/products")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([Product].self, from: data)
    }

    func fetchProduct(id: String) async throws -> Product {
        let url = URL(string: "\(baseURL)/products/\(id)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(Product.self, from: data)
    }

    // MARK: - Devices

    func fetchDevices() async throws -> [Device] {
        let url = URL(string: "\(baseURL)/devices")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([Device].self, from: data)
    }

    func fetchDevicesByProduct(productId: String) async throws -> [Device] {
        let url = URL(string: "\(baseURL)/devices?productId=\(productId)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([Device].self, from: data)
    }

    // MARK: - Thing Model

    func fetchProperties(productId: String) async throws -> [ThingModelProperty] {
        let url = URL(string: "\(baseURL)/products/\(productId)/properties")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([ThingModelProperty].self, from: data)
    }

    func fetchServices(productId: String) async throws -> [ThingModelService] {
        let url = URL(string: "\(baseURL)/products/\(productId)/services")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([ThingModelService].self, from: data)
    }

    // MARK: - Device Property Values (miio-style)

    func getAllProperties(deviceId: String) async throws -> [ServicePropertyGroup] {
        let url = URL(string: "\(baseURL)/devices/\(deviceId)/properties/all")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([ServicePropertyGroup].self, from: data)
    }

    func getProperties(deviceId: String, params: [[String: Any]]) async throws -> MiioResponse {
        let url = URL(string: "\(baseURL)/devices/\(deviceId)/properties/get")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = [
            "id": Int.random(in: 1000...9999),
            "method": "get_properties",
            "params": params
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(MiioResponse.self, from: data)
    }

    func setProperties(deviceId: String, params: [[String: Any]]) async throws -> MiioResponse {
        let url = URL(string: "\(baseURL)/devices/\(deviceId)/properties/set")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = [
            "id": Int.random(in: 1000...9999),
            "method": "set_properties",
            "params": params
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(MiioResponse.self, from: data)
    }
}
