import SwiftUI

struct PluginLoadingView: View {
    let device: Device

    @State private var progress: Double = 0
    @State private var phase: LoadPhase = .downloading
    @State private var pluginReady = false

    enum LoadPhase: String {
        case downloading = "正在下载插件..."
        case extracting = "正在解压..."
        case initializing = "正在初始化..."
    }

    var body: some View {
        if pluginReady {
            DeviceControlView(device: device)
        } else {
            VStack(spacing: 24) {
                Spacer()

                Image(systemName: "arrow.down.circle")
                    .font(.system(size: 50))
                    .foregroundColor(.blue)
                    .symbolEffect(.pulse)

                Text(phase.rawValue)
                    .font(.headline)
                    .foregroundColor(.primary)

                ProgressView(value: progress, total: 1.0)
                    .progressViewStyle(.linear)
                    .frame(width: 200)

                Text("\(Int(progress * 100))%")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()
            }
            .navigationTitle(device.name)
            .navigationBarTitleDisplayMode(.inline)
            .task { await simulateDownload() }
        }
    }

    private func simulateDownload() async {
        // Phase 1: Downloading (0% - 60%)
        for i in 0...60 {
            try? await Task.sleep(nanoseconds: 20_000_000)
            progress = Double(i) / 100.0
        }

        // Phase 2: Extracting (60% - 85%)
        phase = .extracting
        for i in 60...85 {
            try? await Task.sleep(nanoseconds: 15_000_000)
            progress = Double(i) / 100.0
        }

        // Phase 3: Initializing (85% - 100%)
        phase = .initializing
        for i in 85...100 {
            try? await Task.sleep(nanoseconds: 10_000_000)
            progress = Double(i) / 100.0
        }

        try? await Task.sleep(nanoseconds: 300_000_000)
        pluginReady = true
    }
}
