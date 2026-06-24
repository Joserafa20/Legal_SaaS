import Foundation

enum Constants {
    enum API {
        static let baseURL = "https://api.legalsaas.com/v1"
        static let timeout: TimeInterval = 30
    }

    enum Storage {
        static let authTokenKey = "auth_token"
        static let refreshTokenKey = "refresh_token"
        static let userKey = "current_user"
        static let isFirstLaunchKey = "is_first_launch"
    }

    enum UI {
        static let cornerRadius: CGFloat = 12
        static let padding: CGFloat = 16
        static let smallPadding: CGFloat = 8
        static let animationDuration: Double = 0.3
    }

    enum Notifications {
        static let deadlineReminder = "deadline_reminder"
        static let caseUpdate = "case_update"
    }

    enum DateFormats {
        static let full = "MMMM d, yyyy"
        static let short = "MMM d, yyyy"
        static let time = "h:mm a"
        static let dateTime = "MMM d, yyyy h:mm a"
    }
}
