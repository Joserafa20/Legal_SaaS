import Foundation
import Combine

class AIService: ObservableObject {
    static let shared = AIService()

    @Published var conversations: [AIConversation] = []
    @Published var currentConversation: AIConversation?
    @Published var isLoading = false
    @Published var lastResponse: AIResponse?

    private let apiService = APIService.shared

    private init() {}

    func sendQuery(_ query: String, caseContext: UUID? = nil) async throws -> AIResponse {
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }

        var conversationHistory: [AIConversationMessage] = []
        if let current = currentConversation {
            conversationHistory = current.messages
        }

        let request = AIQueryRequest(
            query: query,
            caseContext: caseContext,
            conversationHistory: conversationHistory.isEmpty ? nil : conversationHistory
        )

        let response: AIResponse = try await apiService.request(
            endpoint: "/ai/query",
            method: .post,
            body: request
        )

        await MainActor.run {
            self.lastResponse = response

            let userMessage = AIConversationMessage(
                id: UUID(),
                role: .user,
                content: query,
                timestamp: Date()
            )
            let assistantMessage = AIConversationMessage(
                id: UUID(),
                role: .assistant,
                content: response.response,
                timestamp: Date()
            )

            if var conversation = self.currentConversation {
                conversation.messages.append(contentsOf: [userMessage, assistantMessage])
                self.currentConversation = conversation
            } else {
                let newConversation = AIConversation(
                    id: UUID(),
                    title: String(query.prefix(50)),
                    messages: [userMessage, assistantMessage],
                    caseId: caseContext,
                    createdAt: Date(),
                    updatedAt: Date()
                )
                self.currentConversation = newConversation
                self.conversations.insert(newConversation, at: 0)
            }
        }

        return response
    }

    func fetchConversations() async throws {
        let result: [AIConversation] = try await apiService.request(
            endpoint: "/ai/conversations",
            method: .get
        )

        await MainActor.run {
            self.conversations = result
        }
    }

    func fetchConversation(id: UUID) async throws -> AIConversation {
        let result: AIConversation = try await apiService.request(
            endpoint: "/ai/conversations/\(id)",
            method: .get
        )

        await MainActor.run {
            self.currentConversation = result
        }

        return result
    }

    func deleteConversation(id: UUID) async throws {
        try await apiService.requestVoid(
            endpoint: "/ai/conversations/\(id)",
            method: .delete
        )

        await MainActor.run {
            self.conversations.removeAll { $0.id == id }
            if self.currentConversation?.id == id {
                self.currentConversation = nil
            }
        }
    }

    func startNewConversation() {
        currentConversation = nil
    }

    func generateDocumentDraft(caseId: UUID, type: String, instructions: String) async throws -> String {
        struct DraftRequest: Codable {
            let caseId: UUID
            let type: String
            let instructions: String
            enum CodingKeys: String, CodingKey {
                case caseId = "case_id"
                case type, instructions
            }
        }

        struct DraftResponse: Codable {
            let content: String
        }

        let result: DraftResponse = try await apiService.request(
            endpoint: "/ai/draft",
            method: .post,
            body: DraftRequest(caseId: caseId, type: type, instructions: instructions)
        )

        return result.content
    }
}
