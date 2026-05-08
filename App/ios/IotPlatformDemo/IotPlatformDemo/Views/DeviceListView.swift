import SwiftUI

struct DeviceListView: View {
    @State private var devices: [Device] = []
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
                        Button("重试") { Task { await loadDevices() } }
                    }
                } else if devices.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "tray")
                            .font(.largeTitle)
                            .foregroundColor(.secondary)
                        Text("暂无设备")
                            .foregroundColor(.secondary)
                    }
                } else {
                    List(devices) { device in
                        NavigationLink(destination: PluginLoadingView(device: device)) {
                            DeviceRow(device: device)
                        }
                    }
                }
            }
            .navigationTitle("我的设备")
            .task { await loadDevices() }
            .refreshable { await loadDevices() }
        }
    }

    private func loadDevices() async {
        isLoading = true
        errorMessage = nil
        do {
            devices = try await APIService.shared.fetchDevices()
        } catch {
            errorMessage = "无法连接服务器：\(error.localizedDescription)"
        }
        isLoading = false
    }
}

struct DeviceRow: View {
    let device: Device

    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(device.isOnline ? Color.green : Color.gray)
                .frame(width: 10, height: 10)

            VStack(alignment: .leading, spacing: 4) {
                Text(device.name)
                    .font(.headline)
                HStack {
                    Text("SN: \(device.sn)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("v\(device.firmwareVersion)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}
