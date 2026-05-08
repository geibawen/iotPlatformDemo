import SwiftUI

struct ProfileView: View {
    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack(spacing: 12) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 50))
                            .foregroundColor(.blue)
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Demo 用户")
                                .font(.headline)
                            Text("IoT 开发者平台")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 8)
                }

                Section("设置") {
                    LabeledContent("服务器地址", value: "localhost:3001")
                    LabeledContent("App 版本", value: "1.0.0 (Demo)")
                }

                Section("关于") {
                    Text("本 App 为 IoT 开发者平台 Demo 的移动端演示，类似涂鸦智能 App。数据来自后端 API，无需登录和配网。")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .navigationTitle("我的")
        }
    }
}
