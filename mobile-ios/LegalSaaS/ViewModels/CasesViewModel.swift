import Foundation
import Combine

class CasesViewModel: ObservableObject {
    @Published var cases: [Case] = []
    @Published var filteredCases: [Case] = []
    @Published var selectedStatus: CaseStatus?
    @Published var searchQuery = ""
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isShowingCreateSheet = false

    private let caseService = CaseService.shared
    private var cancellables = Set<AnyCancellable>()

    init() {
        $cases
            .combineLatest($selectedStatus, $searchQuery)
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .sink { [weak self] cases, status, query in
                self?.filterCases(cases: cases, status: status, query: query)
            }
            .store(in: &cancellables)
    }

    func loadCases() async {
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }

        do {
            try await caseService.fetchCases()
            await MainActor.run {
                self.cases = caseService.cases
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func createCase(
        title: String,
        description: String?,
        caseNumber: String,
        clientName: String,
        clientEmail: String?,
        clientPhone: String?,
        courtName: String?,
        judgeName: String?,
        priority: CasePriority
    ) async {
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }

        let request = CreateCaseRequest(
            title: title,
            description: description,
            caseNumber: caseNumber,
            clientName: clientName,
            clientEmail: clientEmail,
            clientPhone: clientPhone,
            courtName: courtName,
            judgeName: judgeName,
            priority: priority
        )

        do {
            let newCase = try await caseService.createCase(request)
            await MainActor.run {
                self.cases.insert(newCase, at: 0)
                self.isShowingCreateSheet = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func deleteCase(_ caseItem: Case) async {
        do {
            try await caseService.deleteCase(id: caseItem.id)
            await MainActor.run {
                self.cases.removeAll { $0.id == caseItem.id }
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func updateCaseStatus(_ caseItem: Case, status: CaseStatus) async {
        do {
            let updated = try await caseService.updateCase(
                id: caseItem.id,
                updates: ["status": status.rawValue]
            )
            await MainActor.run {
                if let index = self.cases.firstIndex(where: { $0.id == caseItem.id }) {
                    self.cases[index] = updated
                }
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    private func filterCases(cases: [Case], status: CaseStatus?, query: String) {
        var result = cases

        if let status = status {
            result = result.filter { $0.status == status }
        }

        if !query.isEmpty {
            result = result.filter {
                $0.title.localizedCaseInsensitiveContains(query) ||
                $0.clientName.localizedCaseInsensitiveContains(query) ||
                $0.caseNumber.localizedCaseInsensitiveContains(query)
            }
        }

        filteredCases = result
    }

    func setSearchQuery(_ query: String) {
        searchQuery = query
    }

    func setStatusFilter(_ status: CaseStatus?) {
        selectedStatus = status
    }
}
