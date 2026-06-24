import Foundation
import Combine

class AIViewModel: ObservableObject {
    @Published var query = ""
    @Published var conversations: [AIConversation] = []
    @Published var currentConversation: AIConversation?
    @Published var lastResponse: AIResponse?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let aiService = AIService.shared
    private var cancellables = Set<AnyCancellable>()

    init() {
        aiService.$conversations
            .assign(to: &$conversations)

        aiService.$currentConversation
            .assign(to: &$currentConversation)

        aiService.$lastResponse
            .assign(to: &$lastResponse)
    }

    func sendQuery(caseContext: UUID? = nil) async {
        let currentQuery = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !currentQuery.isEmpty else { return }

        await MainActor.run {
            isLoading = true
            errorMessage = nil
        }
        defer { Task { @MainActor in isLoading = false } }

        do {
            _ = try await aiService.sendQuery(currentQuery, caseContext: caseContext)
            await MainActor.run {
                self.query = ""
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func loadConversations() async {
        do {
            try await aiService.fetchConversations()
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func selectConversation(_ conversation: AIConversation) async {
        do {
            _ = try await aiService.fetchConversation(id: conversation.id)
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func deleteConversation(_ conversation: AIConversation) async {
        do {
            try await aiService.deleteConversation(id: conversation.id)
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func startNewConversation() {
        aiService.startNewConversation()
        query = ""
    }

    func generateDocumentDraft(caseId: UUID, type: String, instructions: String) async -> String? {
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }

        do {
            let content = try await aiService.generateDocumentDraft(
                caseId: caseId,
                type: type,
                instructions: instructions
            )
            return content
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
            return nil
        }
    }
}
