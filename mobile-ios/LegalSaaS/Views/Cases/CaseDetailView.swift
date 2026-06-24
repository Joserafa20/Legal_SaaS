import SwiftUI

struct CaseDetailView: View {
    let caseItem: Case
    @StateObject private var viewModel = CasesViewModel()
    @State private var showDeleteAlert = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                headerSection
                statusSection
                clientSection
                courtSection
                deadlinesSection
            }
            .padding(16)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle(caseItem.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button(role: .destructive) {
                        showDeleteAlert = true
                    } label: {
                        Label("Delete Case", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .alert("Delete Case", isPresented: $showDeleteAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                Task { await viewModel.deleteCase(caseItem) }
            }
        } message: {
            Text("Are you sure you want to delete this case? This action cannot be undone.")
        }
    }

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(caseItem.caseNumber)
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
                Spacer()
                PriorityBadge(priority: caseItem.priority)
            }

            Text(caseItem.title)
                .font(.title2.bold())

            if let description = caseItem.description {
                Text(description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var statusSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Status")
                .font(.headline)

            HStack(spacing: 8) {
                ForEach(CaseStatus.allCases, id: \.self) { status in
                    Button {
                        Task { await viewModel.updateCaseStatus(caseItem, status: status) }
                    } label: {
                        Text(status.displayName)
                            .font(.caption.bold())
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .frame(maxWidth: .infinity)
                            .background(caseItem.status == status ? Color.blue : Color(.tertiarySystemGroupedBackground))
                            .foregroundStyle(caseItem.status == status ? .white : .primary)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var clientSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Client Information")
                .font(.headline)

            InfoRow(label: "Name", value: caseItem.clientName, icon: "person")

            if let email = caseItem.clientEmail {
                InfoRow(label: "Email", value: email, icon: "envelope")
            }

            if let phone = caseItem.clientPhone {
                InfoRow(label: "Phone", value: phone, icon: "phone")
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var courtSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Court Information")
                .font(.headline)

            if let court = caseItem.courtName {
                InfoRow(label: "Court", value: court, icon: "building.columns")
            }

            if let judge = caseItem.judgeName {
                InfoRow(label: "Judge", value: judge, icon: "person.badge.gearshape")
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var deadlinesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Deadlines")
                .font(.headline)

            if let deadlines = caseItem.deadlines, !deadlines.isEmpty {
                ForEach(deadlines) { deadline in
                    DeadlineRowView(deadline: deadline)
                }
            } else {
                Text("No deadlines for this case")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct InfoRow: View {
    let label: String
    let value: String
    let icon: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(.secondary)
                .frame(width: 20)
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
    }
}

struct PriorityBadge: View {
    let priority: CasePriority

    var color: Color {
        switch priority {
        case .low: return .green
        case .medium: return .orange
        case .high: return .red
        case .urgent: return .purple
        }
    }

    var body: some View {
        Text(priority.displayName)
            .font(.caption2.bold())
            .foregroundStyle(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.1))
            .clipShape(Capsule())
    }
}

#Preview {
    NavigationStack {
        CaseDetailView(caseItem: Case(
            id: UUID(),
            title: "Smith vs. Johnson",
            description: "Personal injury case involving a car accident.",
            caseNumber: "2024-CV-001",
            status: .active,
            priority: .high,
            clientName: "John Smith",
            clientEmail: "john@example.com",
            clientPhone: "555-0123",
            courtName: "Superior Court",
            judgeName: "Hon. Sarah Wilson",
            assignedTo: UUID(),
            createdAt: Date(),
            updatedAt: Date(),
            deadlines: nil
        ))
    }
}
