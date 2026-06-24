import Foundation

struct User: Codable, Identifiable {
    let id: UUID
    let email: String
    let firstName: String
    let lastName: String
    let role: UserRole
    let firmName: String?
    let createdAt: Date

    var fullName: String {
        "\(firstName) \(lastName)"
    }

    enum CodingKeys: String, CodingKey {
        case id
        case email
        case firstName = "first_name"
        case lastName = "last_name"
        case role
        case firmName = "firm_name"
        case createdAt = "created_at"
    }
}

enum UserRole: String, Codable {
    case admin
    case attorney
    case paralegal
    case assistant
}

struct AuthResponse: Codable {
    let user: User
    let token: String
    let refreshToken: String

    enum CodingKeys: String, CodingKey {
        case user
        case token
        case refreshToken = "refresh_token"
    }
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let email: String
    let password: String
    let firstName: String
    let lastName: String
    let firmName: String?

    enum CodingKeys: String, CodingKey {
        case email
        case password
        case firstName = "first_name"
        case lastName = "last_name"
        case firmName = "firm_name"
    }
}
