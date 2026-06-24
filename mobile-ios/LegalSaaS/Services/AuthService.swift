import Foundation
import Combine

class AuthService: ObservableObject {
    static let shared = AuthService()

    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false

    var token: String? {
        get {
            UserDefaults.standard.string(forKey: "auth_token")
        }
        set {
            if let newValue = newValue {
                UserDefaults.standard.set(newValue, forKey: "auth_token")
            } else {
                UserDefaults.standard.removeObject(forKey: "auth_token")
            }
        }
    }

    var refreshTokenValue: String? {
        get {
            UserDefaults.standard.string(forKey: "refresh_token")
        }
        set {
            if let newValue = newValue {
                UserDefaults.standard.set(newValue, forKey: "refresh_token")
            } else {
                UserDefaults.standard.removeObject(forKey: "refresh_token")
            }
        }
    }

    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()

    private init() {
        checkAuthStatus()
    }

    func checkAuthStatus() {
        if token != nil {
            Task {
                await fetchCurrentUser()
            }
        }
    }

    func login(email: String, password: String) async throws -> User {
        isLoading = true
        defer { isLoading = false }

        let request = LoginRequest(email: email, password: password)
        let response: AuthResponse = try await apiService.request(
            endpoint: "/auth/login",
            method: .post,
            body: request
        )

        await MainActor.run {
            self.token = response.token
            self.refreshTokenValue = response.refreshToken
            self.currentUser = response.user
            self.isAuthenticated = true
        }

        return response.user
    }

    func register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        firmName: String?
    ) async throws -> User {
        isLoading = true
        defer { isLoading = false }

        let request = RegisterRequest(
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            firmName: firmName
        )
        let response: AuthResponse = try await apiService.request(
            endpoint: "/auth/register",
            method: .post,
            body: request
        )

        await MainActor.run {
            self.token = response.token
            self.refreshTokenValue = response.refreshToken
            self.currentUser = response.user
            self.isAuthenticated = true
        }

        return response.user
    }

    func logout() {
        token = nil
        refreshTokenValue = nil
        currentUser = nil
        isAuthenticated = false
    }

    func refreshAccessToken() async throws {
        guard let currentRefreshToken = refreshTokenValue else {
            throw APIError.unauthorized
        }

        struct RefreshRequest: Codable {
            let refreshToken: String
            enum CodingKeys: String, CodingKey {
                case refreshToken = "refresh_token"
            }
        }

        let response: AuthResponse = try await apiService.request(
            endpoint: "/auth/refresh",
            method: .post,
            body: RefreshRequest(refreshToken: currentRefreshToken)
        )

        await MainActor.run {
            self.token = response.token
            self.refreshTokenValue = response.refreshToken
        }
    }

    @MainActor
    private func fetchCurrentUser() async {
        do {
            let user: User = try await apiService.request(endpoint: "/auth/me")
            self.currentUser = user
            self.isAuthenticated = true
        } catch {
            self.logout()
        }
    }
}
