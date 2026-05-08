import SwiftUI

struct DeviceControlView: View {
    let device: Device

    @State private var powerOn = true
    @State private var brightness: Double = 75
    @State private var colorTemperature: Double = 4000

    var body: some View {
        List {
            Section("设备信息") {
                LabeledContent("名称", value: device.name)
                LabeledContent("SN", value: device.sn)
                HStack {
                    Text("状态")
                    Spacer()
                    HStack(spacing: 4) {
                        Circle()
                            .fill(device.isOnline ? Color.green : Color.gray)
                            .frame(width: 8, height: 8)
                        Text(device.isOnline ? "在线" : "离线")
                            .foregroundColor(device.isOnline ? .green : .secondary)
                    }
                }
            }

            Section("设备控制") {
                Toggle("电源开关", isOn: $powerOn)

                VStack(alignment: .leading) {
                    HStack {
                        Text("亮度")
                        Spacer()
                        Text("\(Int(brightness))%")
                            .foregroundColor(.secondary)
                    }
                    Slider(value: $brightness, in: 1...100, step: 1)
                }

                VStack(alignment: .leading) {
                    HStack {
                        Text("色温")
                        Spacer()
                        Text("\(Int(colorTemperature))K")
                            .foregroundColor(.secondary)
                    }
                    Slider(value: $colorTemperature, in: 2700...6500, step: 100)
                }
            }

            Section("动作") {
                Button(action: {}) {
                    Label("设置颜色", systemImage: "paintpalette")
                }
                Button(action: {}) {
                    Label("启动呼吸灯", systemImage: "waveform.path")
                }
            }

            Section {
                NavigationLink(destination: DevModeView(device: device)) {
                    Label("开发者模式", systemImage: "hammer.fill")
                        .foregroundColor(.orange)
                }
            }
        }
        .navigationTitle("插件控制")
        .navigationBarTitleDisplayMode(.inline)
    }
}
