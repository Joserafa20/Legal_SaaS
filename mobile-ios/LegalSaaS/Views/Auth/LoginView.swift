import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showPassword = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    headerSection

                    formSection

                    if let error = authViewModel.errorMessage {
                        errorBanner(error)
                    }

                    authButton

                    toggleAuthModeButton
                }
                .padding(.horizontal, 24)
                .padding(.top, 60)
            }
            .background(Color(.systemGroupedBackground))
            .navigationBarHidden(true)
        }
    }

    private var headerSection: some View {
        VStack(spacing: 8) {
            Image(systemName: "building.columns.fill")
                .font(.system(size: 60))
                .foregroundStyle(.blue)

            Text("LegalSaaS")
                .font(.largeTitle.bold())

            Text(authViewModel.isLoginMode ? "Sign in to your account" : "Create your account")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding(.bottom, 20)
    }

    private var formSection: some View {
        VStack(spacing: 16) {
            if !authViewModel.isLoginMode {
                HStack(spacing: 12) {
                    CustomTextField(
                        placeholder: "First Name",
                        text: $authViewModel.firstName,
                        icon: "person"
                    )

                    CustomTextField(
                        placeholder: "Last Name",
                        text: $authViewModel.lastName,
                        icon: "person"
                    )
                }
            }

            CustomTextField(
                placeholder: "Email",
                text: $authViewModel.email,
                icon: "envelope",
                keyboardType: .emailAddress
            )

            CustomSecureField(
                placeholder: "Password",
                text: $authViewModel.password,
                showPassword: $showPassword
            )

            if !authViewModel.isLoginMode {
                CustomTextField(
                    placeholder: "Firm Name (Optional)",
                    text: $authViewModel.firmName,
                    icon: "building.2"
                )
            }
        }
    }

    private var authButton: some View {
        Button {
            Task {
                if authViewModel.isLoginMode {
                    await authViewModel.login()
                } else {
                    await authViewModel.register()
                }
            }
        } label: {
            HStack {
                if authViewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text(authViewModel.isLoginMode ? "Sign In" : "Create Account")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(Color.blue)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .disabled(authViewModel.isLoading)
    }

    private var toggleAuthModeButton: some View {
        Button {
            authViewModel.toggleAuthMode()
        } label: {
            Text(authViewModel.isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Sign In")
                .font(.subheadline)
                .foregroundStyle(.blue)
        }
    }

    private func errorBanner(_ message: String) -> some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.red)
            Text(message)
                .font(.caption)
                .foregroundStyle(.red)
        }
        .frame(maxWidth: .infinity)
        .padding(12)
        .background(Color.red.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct CustomTextField: View {
    let placeholder: String
    @Binding var text: String
    let icon: String
    var keyboardType: UIKeyboardType = .default

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(.secondary)
                .frame(width: 20)

            TextField(placeholder, text: $text)
                .keyboardType(keyboardType)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
        }
        .padding(16)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct CustomSecureField: View {
    let placeholder: String
    @Binding var text: String
    @Binding var showPassword: Bool

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "lock")
                .foregroundStyle(.secondary)
                .frame(width: 20)

            if showPassword {
                TextField(placeholder, text: $text)
                    .textInputAutocapitalization(.never)
            } else {
                SecureField(placeholder, text: $text)
            }

            Button {
                showPassword.toggle()
            } label: {
                Image(systemName: showPassword ? "eye.slash" : "eye")
                    .foregroundStyle(.secondary)
            }
        }
        .padding(16)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthViewModel())
}
