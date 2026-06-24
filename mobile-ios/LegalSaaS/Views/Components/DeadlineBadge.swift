import SwiftUI

struct DeadlineBadge: View {
    let deadline: Deadline

    var statusColor: Color {
        if deadline.isCompleted {
            return .green
        } else if deadline.isOverdue {
            return .red
        } else if deadline.daysUntilDue <= 3 {
            return .orange
        } else {
            return .blue
        }
    }

    var statusText: String {
        if deadline.isCompleted {
            return "Completed"
        } else if deadline.isOverdue {
            return "Overdue"
        } else if deadline.daysUntilDue == 0 {
            return "Due Today"
        } else if deadline.daysUntilDue == 1 {
            return "Due Tomorrow"
        } else {
            return "\(deadline.daysUntilDue) days left"
        }
    }

    var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(statusColor)
                .frame(width: 8, height: 8)

            Text(statusText)
                .font(.caption2.bold())
                .foregroundStyle(statusColor)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(statusColor.opacity(0.1))
        .clipShape(Capsule())
    }
}

#Preview {
    VStack(spacing: 12) {
        DeadlineBadge(deadline: Deadline(
            id: UUID(),
            caseId: UUID(),
            title: "Filing Due",
            description: nil,
            dueDate: Date().addingTimeInterval(86400 * 5),
            type: .filing,
            isCompleted: false,
            reminderDays: [1],
            createdAt: Date()
        ))

        DeadlineBadge(deadline: Deadline(
            id: UUID(),
            caseId: UUID(),
            title: "Hearing",
            description: nil,
            dueDate: Date().addingTimeInterval(-86400),
            type: .hearing,
            isCompleted: false,
            reminderDays: [1],
            createdAt: Date()
        ))

        DeadlineBadge(deadline: Deadline(
            id: UUID(),
            caseId: UUID(),
            title: "Completed Task",
            description: nil,
            dueDate: Date().addingTimeInterval(86400),
            type: .motion,
            isCompleted: true,
            reminderDays: [1],
            createdAt: Date()
        ))
    }
}
