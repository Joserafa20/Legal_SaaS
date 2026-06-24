import Foundation

struct AppNotification: Codable, Identifiable {
    let id: UUID
    let title: String
    let body: String
    let type: NotificationType
    let caseId: UUID?
    let isRead: Bool
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, title, body, type
        case caseId = "case_id"
        case isRead = "is_read"
        case createdAt = "created_at"
    }
}

enum NotificationType: String, Codable {
    case deadlineReminder
    case caseUpdate
    case aiSuggestion
    case systemAlert
    case teamMention

    var iconName: String {
        switch self {
        case .deadlineReminder: return "calendar.badge.exclamationmark"
        case .caseUpdate: return "folder.badge.gearshape"
        case .aiSuggestion: return "brain"
        case .systemAlert: return "exclamationmark.triangle"
        case .teamMention: return "person.2"
        }
    }
}
