import Foundation

enum AuthState {
    case unauthenticated
    case authenticating
    case authenticated(User)
    case error(String)

    var isAuthenticated: Bool {
        if case .authenticated = self { return true }
        return false
    }

    var isLoading: Bool {
        if case .authenticating = self { return true }
        return false
    }

    var user: User? {
        if case .authenticated(let user) = self { return user }
        return nil
    }

    var errorMessage: String? {
        if case .error(let message) = self { return message }
        return nil
    }
}
