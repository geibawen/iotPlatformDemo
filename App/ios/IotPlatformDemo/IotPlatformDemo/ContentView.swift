import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            ProductListView()
                .tabItem {
                    Label("产品", systemImage: "square.grid.2x2")
                }

            DeviceListView()
                .tabItem {
                    Label("设备", systemImage: "house.fill")
                }

            ProfileView()
                .tabItem {
                    Label("我的", systemImage: "person.fill")
                }
        }
    }
}

#Preview {
    ContentView()
}
