import Foundation

struct Deadline: Codable, Identifiable {
    let id: UUID
    let caseId: UUID
    let title: String
    let description: String?
    let dueDate: Date
    let type: DeadlineType
    let isCompleted: Bool
    let reminderDays: [Int]
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, title, description, type
        case caseId = "case_id"
        case dueDate = "due_date"
        case isCompleted = "is_completed"
        case reminderDays = "reminder_days"
        case createdAt = "created_at"
    }

    var isOverdue: Bool {
        !isCompleted && dueDate < Date()
    }

    var daysUntilDue: Int {
        let calendar = Calendar.current
        return calendar.dateComponents([.day], from: Date(), to: dueDate).day ?? 0
    }
}

enum DeadlineType: String, Codable, CaseIterable {
    case filing
    case hearing
    case deposition
    case mediation
    case discovery
    case motion
    case other

    var displayName: String {
        switch self {
        case .filing: return "Filing"
        case .hearing: return "Hearing"
        case .deposition: return "Deposition"
        case .mediation: return "Mediation"
        case .discovery: return "Discovery"
        case .motion: return "Motion"
        case .other: return "Other"
        }
    }

    var iconName: String {
        switch self {
        case .filing: return "doc.text"
        case .hearing: return "person.badge.gearshape"
        case .deposition: return "mic"
        case .mediation: return "handshake"
        case .discovery: return "magnifyingglass"
        case .motion: return "arrow.up.circle"
        case .other: return "ellipsis.circle"
        }
    }
}

struct CreateDeadlineRequest: Codable {
    let caseId: UUID
    let title: String
    let description: String?
    let dueDate: Date
    let type: DeadlineType
    let reminderDays: [Int]

    enum CodingKeys: String, CodingKey {
        case title, description, type
        case caseId = "case_id"
        case dueDate = "due_date"
        case reminderDays = "reminder_days"
    }
}
