import SwiftUI

struct DevModeView: View {
    let device: Device

    @State private var serviceGroups: [ServicePropertyGroup] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        Group {
            if isLoading {
                ProgressView("加载物模型...")
            } else if let error = errorMessage {
                VStack(spacing: 12) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundColor(.orange)
                    Text(error)
                        .foregroundColor(.secondary)
                    Button("重试") { Task { await loadAll() } }
                }
            } else if serviceGroups.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "tray")
                        .font(.largeTitle)
                        .foregroundColor(.secondary)
                    Text("该产品暂无物模型定义")
                        .foregroundColor(.secondary)
                }
            } else {
                List {
                    ForEach(serviceGroups, id: \.siid) { group in
                        ServiceSection(device: device, group: group, onRefresh: { await loadAll() })
                    }
                }
            }
        }
        .navigationTitle("开发者模式")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { Task { await loadAll() } }) {
                    Image(systemName: "arrow.clockwise")
                }
            }
        }
        .task { await loadAll() }
    }

    private func loadAll() async {
        isLoading = true
        errorMessage = nil
        do {
            serviceGroups = try await APIService.shared.getAllProperties(deviceId: device.id)
        } catch {
            errorMessage = "加载失败: \(error.localizedDescription)"
        }
        isLoading = false
    }
}

struct ServiceSection: View {
    let device: Device
    let group: ServicePropertyGroup
    let onRefresh: () async -> Void

    var body: some View {
        Section {
            ForEach(group.properties) { pv in
                if let prop = pv.prop {
                    PropertyRow(device: device, propertyValue: pv, prop: prop, onRefresh: onRefresh)
                }
            }
        } header: {
            HStack {
                Image(systemName: "cube.fill")
                    .foregroundColor(.blue)
                VStack(alignment: .leading) {
                    Text("Service \(group.siid): \(group.service.name)")
                        .font(.headline)
                    Text(group.service.identifier)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
    }
}

struct PropertyRow: View {
    let device: Device
    let propertyValue: PropertyValue
    let prop: ThingModelProperty
    let onRefresh: () async -> Void

    @State private var isEditing = false
    @State private var editValue = ""
    @State private var isSaving = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 4) {
                        Text(prop.name)
                            .font(.subheadline)
                            .fontWeight(.medium)
                        Text("(siid:\(propertyValue.siid) piid:\(propertyValue.piid))")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    Text("\(prop.identifier) · \(prop.dataType) · \(prop.accessMode)")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                Spacer()
                accessBadge
            }

            HStack {
                Text("当前值:")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(propertyValue.value?.displayString ?? "未设置")
                    .font(.system(.caption, design: .monospaced))
                    .foregroundColor(propertyValue.value != nil ? .primary : .secondary)
            }

            if isEditing {
                HStack {
                    TextField("输入新值", text: $editValue)
                        .textFieldStyle(.roundedBorder)
                        .font(.caption)
                    Button(action: { Task { await saveValue() } }) {
                        if isSaving {
                            ProgressView()
                                .controlSize(.small)
                        } else {
                            Text("设置")
                                .font(.caption)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                    .disabled(isSaving)

                    Button("取消") { isEditing = false }
                        .font(.caption)
                        .controlSize(.small)
                }
            } else if prop.accessMode != "r" {
                Button(action: {
                    editValue = propertyValue.value?.displayString ?? ""
                    isEditing = true
                }) {
                    Label("修改", systemImage: "pencil")
                        .font(.caption)
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
            }
        }
        .padding(.vertical, 4)
    }

    private var accessBadge: some View {
        Text(prop.accessMode.uppercased())
            .font(.caption2)
            .fontWeight(.bold)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(prop.accessMode == "rw" ? Color.green.opacity(0.15) : Color.gray.opacity(0.15))
            .foregroundColor(prop.accessMode == "rw" ? .green : .gray)
            .clipShape(Capsule())
    }

    private func saveValue() async {
        isSaving = true
        let parsedValue: Any = parseValue(editValue, dataType: prop.dataType)
        let params: [[String: Any]] = [
            ["did": device.id, "siid": propertyValue.siid, "piid": propertyValue.piid, "value": parsedValue]
        ]
        do {
            _ = try await APIService.shared.setProperties(deviceId: device.id, params: params)
            isEditing = false
            await onRefresh()
        } catch {
            // silently fail in demo
        }
        isSaving = false
    }

    private func parseValue(_ str: String, dataType: String) -> Any {
        switch dataType {
        case "int":
            return Int(str) ?? 0
        case "float":
            return Double(str) ?? 0.0
        case "bool":
            return str.lowercased() == "true" || str == "1"
        default:
            return str
        }
    }
}
