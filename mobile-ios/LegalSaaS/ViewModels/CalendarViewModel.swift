import Foundation
import Combine

class CalendarViewModel: ObservableObject {
    @Published var deadlines: [Deadline] = []
    @Published var selectedDate = Date()
    @Published var selectedDeadline: Deadline?
    @Published var isShowingDeadlineDetail = false
    @Published var isShowingCreateSheet = false
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let deadlineService = DeadlineService.shared
    private var cancellables = Set<AnyCancellable>()

    var deadlinesForSelectedDate: [Deadline] {
        deadlines.filter { deadline in
            Calendar.current.isDate(deadline.dueDate, inSameDayAs: selectedDate)
        }
    }

    var deadlinesGroupedByDate: [Date: [Deadline]] {
        Dictionary(grouping: deadlines) { deadline in
            Calendar.current.startOfDay(for: deadline.dueDate)
        }
    }

    func loadDeadlines() async {
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }

        do {
            try await deadlineService.fetchDeadlines()
            await MainActor.run {
                self.deadlines = deadlineService.deadlines
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func createDeadline(
        caseId: UUID,
        title: String,
        description: String?,
        dueDate: Date,
        type: DeadlineType,
        reminderDays: [Int]
    ) async {
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }

        let request = CreateDeadlineRequest(
            caseId: caseId,
            title: title,
            description: description,
            dueDate: dueDate,
            type: type,
            reminderDays: reminderDays
        )

        do {
            let newDeadline = try await deadlineService.createDeadline(request)
            await MainActor.run {
                self.deadlines.insert(newDeadline, at: 0)
                self.isShowingCreateSheet = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func toggleDeadlineCompletion(_ deadline: Deadline) async {
        do {
            let updated = try await deadlineService.updateDeadline(
                id: deadline.id,
                isCompleted: !deadline.isCompleted
            )
            await MainActor.run {
                if let index = self.deadlines.firstIndex(where: { $0.id == deadline.id }) {
                    self.deadlines[index] = updated
                }
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func deleteDeadline(_ deadline: Deadline) async {
        do {
            try await deadlineService.deleteDeadline(id: deadline.id)
            await MainActor.run {
                self.deadlines.removeAll { $0.id == deadline.id }
                if selectedDeadline?.id == deadline.id {
                    selectedDeadline = nil
                    isShowingDeadlineDetail = false
                }
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    func selectDate(_ date: Date) {
        selectedDate = date
    }
}
