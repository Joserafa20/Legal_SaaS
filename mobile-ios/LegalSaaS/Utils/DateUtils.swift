import Foundation

enum DateUtils {
    static func formatFull(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }

    static func formatShort(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = Constants.DateFormats.short
        return formatter.string(from: date)
    }

    static func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = Constants.DateFormats.time
        return formatter.string(from: date)
    }

    static func formatDateTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = Constants.DateFormats.dateTime
        return formatter.string(from: date)
    }

    static func daysBetween(_ start: Date, and end: Date) -> Int {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day], from: start, to: end)
        return components.day ?? 0
    }

    static func isOverdue(_ date: Date) -> Bool {
        date < Date()
    }

    static func isToday(_ date: Date) -> Bool {
        Calendar.current.isDateInToday(date)
    }

    static func isTomorrow(_ date: Date) -> Bool {
        Calendar.current.isDateInTomorrow(date)
    }

    static func isThisWeek(_ date: Date) -> Bool {
        Calendar.current.isDate(date, equalTo: Date(), toGranularity: .weekOfYear)
    }

    static func relativeDescription(for date: Date) -> String {
        let days = daysBetween(Date(), and: date)

        if days < 0 {
            return "\(abs(days)) day(s) overdue"
        } else if days == 0 {
            return "Due today"
        } else if days == 1 {
            return "Due tomorrow"
        } else if days <= 7 {
            return "Due in \(days) days"
        } else {
            return formatShort(date)
        }
    }
}
