import Foundation
import Combine

class DashboardViewModel: ObservableObject {
    @Published var activeCasesCount = 0
    @Published var pendingDeadlinesCount = 0
    @Published var upcomingDeadlines: [Deadline] = []
    @Published var recentCases: [Case] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let caseService = CaseService.shared
    private let deadlineService = DeadlineService.shared
    private var cancellables = Set<AnyCancellable>()

    func loadDashboard() async {
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }

        do {
            async let casesResult = caseService.fetchCases()
            async let deadlinesResult = deadlineService.fetchUpcomingDeadlines(days: 7)

            let (cases, deadlines) = try await (casesResult, deadlinesResult)

            await MainActor.run {
                self.recentCases = Array(cases.prefix(5))
                self.activeCasesCount = cases.filter { $0.status == .active }.count
                self.upcomingDeadlines = deadlines
                self.pendingDeadlinesCount = deadlines.filter { !$0.isCompleted }.count
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func refreshDashboard() async {
        await loadDashboard()
    }
}
