import SwiftUI

struct ProductDetailView: View {
    let product: Product
    @State private var properties: [ThingModelProperty] = []
    @State private var isLoading = true

    var body: some View {
        List {
            Section("基本信息") {
                LabeledContent("产品名称", value: product.name)
                LabeledContent("类型", value: product.category)
                LabeledContent("连接方式", value: product.connectionType)
                LabeledContent("状态", value: product.status == "published" ? "已发布" : "草稿")
            }

            Section("描述") {
                Text(product.description)
                    .font(.body)
                    .foregroundColor(.secondary)
            }

            Section("物模型属性") {
                if isLoading {
                    ProgressView()
                } else if properties.isEmpty {
                    Text("暂无属性定义")
                        .foregroundColor(.secondary)
                } else {
                    ForEach(properties) { prop in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(prop.name)
                                    .font(.headline)
                                Spacer()
                                Text(prop.dataType)
                                    .font(.caption)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Color.purple.opacity(0.15))
                                    .clipShape(Capsule())
                            }
                            Text(prop.identifier)
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text(prop.description)
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        .padding(.vertical, 2)
                    }
                }
            }
        }
        .navigationTitle(product.name)
        .task { await loadProperties() }
    }

    private func loadProperties() async {
        do {
            properties = try await APIService.shared.fetchProperties(productId: product.id)
        } catch {
            properties = []
        }
        isLoading = false
    }
}
