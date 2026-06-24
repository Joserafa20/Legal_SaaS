import Foundation

struct AIResponse: Codable, Identifiable {
    let id: UUID
    let query: String
    let response: String
    let suggestions: [AISuggestion]
    let confidence: Double
    let sources: [AISource]
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, query, response, suggestions, confidence, sources
        case createdAt = "created_at"
    }
}

struct AISuggestion: Codable, Identifiable {
    let id: UUID
    let text: String
    let actionType: AISuggestionAction
    let relatedCaseId: UUID?

    enum CodingKeys: String, CodingKey {
        case id, text
        case actionType = "action_type"
        case relatedCaseId = "related_case_id"
    }
}

enum AISuggestionAction: String, Codable {
    case createDeadline
    case updateCase
    case draftDocument
    case scheduleMeeting
    case researchTopic

    var displayName: String {
        switch self {
        case .createDeadline: return "Create Deadline"
        case .updateCase: return "Update Case"
        case .draftDocument: return "Draft Document"
        case .scheduleMeeting: return "Schedule Meeting"
        case .researchTopic: return "Research Topic"
        }
    }
}

struct AISource: Codable, Identifiable {
    let id: UUID
    let title: String
    let url: String?
    let relevance: Double
}

struct AIQueryRequest: Codable {
    let query: String
    let caseContext: UUID?
    let conversationHistory: [AIConversationMessage]?

    enum CodingKeys: String, CodingKey {
        case query
        case caseContext = "case_context"
        case conversationHistory = "conversation_history"
    }
}

struct AIConversationMessage: Codable, Identifiable {
    let id: UUID
    let role: AIRole
    let content: String
    let timestamp: Date
}

enum AIRole: String, Codable {
    case user
    case assistant
    case system
}

struct AIConversation: Codable, Identifiable {
    let id: UUID
    let title: String
    let messages: [AIConversationMessage]
    let caseId: UUID?
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id, title, messages
        case caseId = "case_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
