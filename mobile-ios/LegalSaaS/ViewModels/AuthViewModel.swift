import Foundation
import Combine

class AuthViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var firstName = ""
    @Published var lastName = ""
    @Published var firmName = ""
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isLoginMode = true

    private let authService = AuthService.shared
    private var cancellables = Set<AnyCancellable>()

    init() {
        authService.$isAuthenticated
            .assign(to: &$isAuthenticated)
    }

    func checkAuthStatus() {
        authService.checkAuthStatus()
    }

    @MainActor
    func login() async {
        guard validateLoginInput() else { return }

        isLoading = true
        errorMessage = nil

        do {
            _ = try await authService.login(email: email, password: password)
            clearForm()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    @MainActor
    func register() async {
        guard validateRegisterInput() else { return }

        isLoading = true
        errorMessage = nil

        do {
            _ = try await authService.register(
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                firmName: firmName.isEmpty ? nil : firmName
            )
            clearForm()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func logout() {
        authService.logout()
        clearForm()
    }

    func toggleAuthMode() {
        isLoginMode.toggle()
        errorMessage = nil
    }

    private func validateLoginInput() -> Bool {
        guard !email.trimmingCharacters(in: .whitespaces).isEmpty else {
            errorMessage = "Email is required"
            return false
        }
        guard email.contains("@") else {
            errorMessage = "Please enter a valid email"
            return false
        }
        guard !password.isEmpty else {
            errorMessage = "Password is required"
            return false
        }
        return true
    }

    private func validateRegisterInput() -> Bool {
        guard !firstName.trimmingCharacters(in: .whitespaces).isEmpty else {
            errorMessage = "First name is required"
            return false
        }
        guard !lastName.trimmingCharacters(in: .whitespaces).isEmpty else {
            errorMessage = "Last name is required"
            return false
        }
        guard !email.trimmingCharacters(in: .whitespaces).isEmpty else {
            errorMessage = "Email is required"
            return false
        }
        guard email.contains("@") else {
            errorMessage = "Please enter a valid email"
            return false
        }
        guard password.count >= 8 else {
            errorMessage = "Password must be at least 8 characters"
            return false
        }
        return true
    }

    private func clearForm() {
        email = ""
        password = ""
        firstName = ""
        lastName = ""
        firmName = ""
    }
}
