import Foundation
import Combine

class DeadlineService: ObservableObject {
    static let shared = DeadlineService()

    @Published var deadlines: [Deadline] = []
    @Published var upcomingDeadlines: [Deadline] = []
    @Published var isLoading = false

    private let apiService = APIService.shared

    private init() {}

    func fetchDeadlines(caseId: UUID? = nil) async throws {
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }

        var queryParams: [String: String] = [:]
        if let caseId = caseId {
            queryParams["case_id"] = caseId.uuidString
        }

        let result: [Deadline] = try await apiService.request(
            endpoint: "/deadlines",
            method: .get,
            queryParams: queryParams.isEmpty ? nil : queryParams
        )

        await MainActor.run {
            self.deadlines = result
        }
    }

    func fetchUpcomingDeadlines(days: Int = 30) async throws {
        let result: [Deadline] = try await apiService.request(
            endpoint: "/deadlines/upcoming",
            method: .get,
            queryParams: ["days": String(days)]
        )

        await MainActor.run {
            self.upcomingDeadlines = result
        }
    }

    func createDeadline(_ request: CreateDeadlineRequest) async throws -> Deadline {
        let result: Deadline = try await apiService.request(
            endpoint: "/deadlines",
            method: .post,
            body: request
        )

        await MainActor.run {
            self.deadlines.insert(result, at: 0)
        }

        return result
    }

    func updateDeadline(id: UUID, isCompleted: Bool) async throws -> Deadline {
        struct UpdateBody: Codable {
            let isCompleted: Bool
            enum CodingKeys: String, CodingKey {
                case isCompleted = "is_completed"
            }
        }

        let result: Deadline = try await apiService.request(
            endpoint: "/deadlines/\(id)",
            method: .patch,
            body: UpdateBody(isCompleted: isCompleted)
        )

        await MainActor.run {
            if let index = self.deadlines.firstIndex(where: { $0.id == id }) {
                self.deadlines[index] = result
            }
            if let index = self.upcomingDeadlines.firstIndex(where: { $0.id == id }) {
                self.upcomingDeadlines[index] = result
            }
        }

        return result
    }

    func deleteDeadline(id: UUID) async throws {
        try await apiService.requestVoid(
            endpoint: "/deadlines/\(id)",
            method: .delete
        )

        await MainActor.run {
            self.deadlines.removeAll { $0.id == id }
            self.upcomingDeadlines.removeAll { $0.id == id }
        }
    }
}
