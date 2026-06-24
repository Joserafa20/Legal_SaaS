import Foundation

struct Case: Codable, Identifiable {
    let id: UUID
    let title: String
    let description: String?
    let caseNumber: String
    let status: CaseStatus
    let priority: CasePriority
    let clientName: String
    let clientEmail: String?
    let clientPhone: String?
    let courtName: String?
    let judgeName: String?
    let assignedTo: UUID
    let createdAt: Date
    let updatedAt: Date
    let deadlines: [Deadline]?

    enum CodingKeys: String, CodingKey {
        case id, title, description, status, priority
        case caseNumber = "case_number"
        case clientName = "client_name"
        case clientEmail = "client_email"
        case clientPhone = "client_phone"
        case courtName = "court_name"
        case judgeName = "judge_name"
        case assignedTo = "assigned_to"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case deadlines
    }
}

enum CaseStatus: String, Codable, CaseIterable {
    case active
    case pending
    case closed
    case archived

    var displayName: String {
        switch self {
        case .active: return "Active"
        case .pending: return "Pending"
        case .closed: return "Closed"
        case .archived: return "Archived"
        }
    }

    var color: String {
        switch self {
        case .active: return "green"
        case .pending: return "orange"
        case .closed: return "gray"
        case .archived: return "blue"
        }
    }
}

enum CasePriority: String, Codable, CaseIterable {
    case low
    case medium
    case high
    case urgent

    var displayName: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        case .urgent: return "Urgent"
        }
    }
}

struct CreateCaseRequest: Codable {
    let title: String
    let description: String?
    let caseNumber: String
    let clientName: String
    let clientEmail: String?
    let clientPhone: String?
    let courtName: String?
    let judgeName: String?
    let priority: CasePriority

    enum CodingKeys: String, CodingKey {
        case title, description, priority
        case caseNumber = "case_number"
        case clientName = "client_name"
        case clientEmail = "client_email"
        case clientPhone = "client_phone"
        case courtName = "court_name"
        case judgeName = "judge_name"
    }
}
