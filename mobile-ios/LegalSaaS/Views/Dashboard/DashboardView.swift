import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    statsSection
                    upcomingDeadlinesSection
                    recentCasesSection
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Dashboard")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task { await viewModel.refreshDashboard() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
            .task {
                await viewModel.loadDashboard()
            }
            .refreshable {
                await viewModel.refreshDashboard()
            }
        }
    }

    private var statsSection: some View {
        VStack(spacing: 12) {
            Text("Overview")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 12) {
                StatCard(
                    title: "Active Cases",
                    value: "\(viewModel.activeCasesCount)",
                    icon: "folder.fill",
                    color: .blue
                )

                StatCard(
                    title: "Pending Deadlines",
                    value: "\(viewModel.pendingDeadlinesCount)",
                    icon: "clock.fill",
                    color: .orange
                )
            }
        }
    }

    private var upcomingDeadlinesSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Upcoming Deadlines")
                    .font(.headline)
                Spacer()
                NavigationLink("View All") {
                    CalendarView()
                }
                .font(.subheadline)
            }

            if viewModel.upcomingDeadlines.isEmpty {
                EmptyStateCard(
                    icon: "calendar.badge.checkmark",
                    message: "No upcoming deadlines"
                )
            } else {
                ForEach(viewModel.upcomingDeadlines.prefix(5)) { deadline in
                    DeadlineRowView(deadline: deadline)
                }
            }
        }
    }

    private var recentCasesSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Recent Cases")
                    .font(.headline)
                Spacer()
                NavigationLink("View All") {
                    CasesListView()
                }
                .font(.subheadline)
            }

            if viewModel.recentCases.isEmpty {
                EmptyStateCard(
                    icon: "folder.badge.plus",
                    message: "No cases yet"
                )
            } else {
                ForEach(viewModel.recentCases) { caseItem in
                    NavigationLink {
                        CaseDetailView(caseItem: caseItem)
                    } label: {
                        CaseRowView(caseItem: caseItem)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundStyle(color)
                Spacer()
            }
            Text(value)
                .font(.title.bold())
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct EmptyStateCard: View {
    let icon: String
    let message: String

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(.secondary)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct DeadlineRowView: View {
    let deadline: Deadline

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: deadline.type.iconName)
                .font(.title3)
                .foregroundStyle(deadline.isOverdue ? .red : .blue)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 4) {
                Text(deadline.title)
                    .font(.subheadline.bold())
                    .lineLimit(1)

                Text(deadline.dueDate.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            if deadline.isOverdue {
                Text("Overdue")
                    .font(.caption2.bold())
                    .foregroundStyle(.red)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.red.opacity(0.1))
                    .clipShape(Capsule())
            } else if deadline.daysUntilDue <= 3 {
                Text("\(deadline.daysUntilDue)d left")
                    .font(.caption2.bold())
                    .foregroundStyle(.orange)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.orange.opacity(0.1))
                    .clipShape(Capsule())
            }
        }
        .padding(12)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

#Preview {
    DashboardView()
}
