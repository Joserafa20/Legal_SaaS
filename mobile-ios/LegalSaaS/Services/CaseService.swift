import Foundation
import Combine

class CaseService: ObservableObject {
    static let shared = CaseService()

    @Published var cases: [Case] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let apiService = APIService.shared

    private init() {}

    func fetchCases(status: CaseStatus? = nil, search: String? = nil) async throws {
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }

        var queryParams: [String: String] = [:]
        if let status = status {
            queryParams["status"] = status.rawValue
        }
        if let search = search, !search.isEmpty {
            queryParams["search"] = search
        }

        let result: [Case] = try await apiService.request(
            endpoint: "/cases",
            method: .get,
            queryParams: queryParams.isEmpty ? nil : queryParams
        )

        await MainActor.run {
            self.cases = result
        }
    }

    func fetchCase(id: UUID) async throws -> Case {
        let result: Case = try await apiService.request(
            endpoint: "/cases/\(id)",
            method: .get
        )
        return result
    }

    func createCase(_ request: CreateCaseRequest) async throws -> Case {
        let result: Case = try await apiService.request(
            endpoint: "/cases",
            method: .post,
            body: request
        )

        await MainActor.run {
            self.cases.insert(result, at: 0)
        }

        return result
    }

    func updateCase(id: UUID, updates: [String: Any]) async throws -> Case {
        let result: Case = try await apiService.request(
            endpoint: "/cases/\(id)",
            method: .patch,
            body: updates
        )

        await MainActor.run {
            if let index = self.cases.firstIndex(where: { $0.id == id }) {
                self.cases[index] = result
            }
        }

        return result
    }

    func deleteCase(id: UUID) async throws {
        try await apiService.requestVoid(
            endpoint: "/cases/\(id)",
            method: .delete
        )

        await MainActor.run {
            self.cases.removeAll { $0.id == id }
        }
    }

    func searchCases(query: String) async throws -> [Case] {
        let result: [Case] = try await apiService.request(
            endpoint: "/cases/search",
            method: .get,
            queryParams: ["q": query]
        )
        return result
    }
}
