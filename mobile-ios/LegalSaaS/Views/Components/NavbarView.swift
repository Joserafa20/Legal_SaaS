import SwiftUI

struct NavbarView: View {
    let title: String
    var showBackButton = false
    var onBack: (() -> Void)?
    var trailingButton: AnyView?

    init(
        title: String,
        showBackButton: Bool = false,
        onBack: (() -> Void)? = nil
    ) {
        self.title = title
        self.showBackButton = showBackButton
        self.onBack = onBack
    }

    var body: some View {
        HStack {
            if showBackButton {
                Button(action: { onBack?() }) {
                    Image(systemName: "chevron.left")
                        .font(.body.bold())
                }
            }

            Text(title)
                .font(.headline)

            Spacer()

            if let trailing = trailingButton {
                trailing
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color(.systemBackground))
    }
}

#Preview {
    VStack {
        NavbarView(title: "Dashboard")

        NavbarView(title: "Back", showBackButton: true)
    }
}
