import SwiftUI

struct ProductListView: View {
    @State private var products: [Product] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    ProgressView("加载中...")
                } else if let error = errorMessage {
                    VStack(spacing: 12) {
                        Image(systemName: "wifi.slash")
                            .font(.largeTitle)
                            .foregroundColor(.secondary)
                        Text(error)
                            .foregroundColor(.secondary)
                        Button("重试") { Task { await loadProducts() } }
                    }
                } else {
                    List(products) { product in
                        NavigationLink(destination: ProductDetailView(product: product)) {
                            ProductRow(product: product)
                        }
                    }
                }
            }
            .navigationTitle("产品列表")
            .task { await loadProducts() }
            .refreshable { await loadProducts() }
        }
    }

    private func loadProducts() async {
        isLoading = true
        errorMessage = nil
        do {
            products = try await APIService.shared.fetchProducts()
        } catch {
            errorMessage = "无法连接服务器：\(error.localizedDescription)"
        }
        isLoading = false
    }
}

struct ProductRow: View {
    let product: Product

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: iconForCategory(product.category))
                .font(.title2)
                .foregroundColor(.blue)
                .frame(width: 40, height: 40)
                .background(Color.blue.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 4) {
                Text(product.name)
                    .font(.headline)
                HStack {
                    Text(product.connectionType)
                        .font(.caption)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.gray.opacity(0.15))
                        .clipShape(Capsule())
                    Text(product.category)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }

    private func iconForCategory(_ category: String) -> String {
        switch category {
        case "light": return "lightbulb.fill"
        case "sensor": return "thermometer"
        case "switch": return "switch.2"
        case "gateway": return "server.rack"
        default: return "cube.fill"
        }
    }
}
