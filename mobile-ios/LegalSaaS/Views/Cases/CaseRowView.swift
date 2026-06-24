import SwiftUI

struct CaseRowView: View {
    let caseItem: Case

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(caseItem.caseNumber)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                CaseStatusBadge(status: caseItem.status)
            }

            Text(caseItem.title)
                .font(.subheadline.bold())
                .lineLimit(1)

            HStack {
                Label(caseItem.clientName, systemImage: "person")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Spacer()

                PriorityBadge(priority: caseItem.priority)
            }
        }
        .padding(.vertical, 4)
    }
}

struct CaseStatusBadge: View {
    let status: CaseStatus

    var color: Color {
        switch status {
        case .active: return .green
        case .pending: return .orange
        case .closed: return .gray
        case .archived: return .blue
        }
    }

    var body: some View {
        Text(status.displayName)
            .font(.caption2.bold())
            .foregroundStyle(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.1))
            .clipShape(Capsule())
    }
}

#Preview {
    List {
        CaseRowView(caseItem: Case(
            id: UUID(),
            title: "Smith vs. Johnson",
            description: nil,
            caseNumber: "2024-CV-001",
            status: .active,
            priority: .high,
            clientName: "John Smith",
            clientEmail: nil,
            clientPhone: nil,
            courtName: nil,
            judgeName: nil,
            assignedTo: UUID(),
            createdAt: Date(),
            updatedAt: Date(),
            deadlines: nil
        ))
    }
}
