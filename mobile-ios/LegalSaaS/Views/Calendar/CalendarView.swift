import SwiftUI

struct CalendarView: View {
    @StateObject private var viewModel = CalendarViewModel()

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                calendarHeader
                deadlinesList
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Calendar")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        viewModel.isShowingCreateSheet = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $viewModel.isShowingCreateSheet) {
                CreateDeadlineSheet(viewModel: viewModel)
            }
            .task {
                await viewModel.loadDeadlines()
            }
        }
    }

    private var calendarHeader: some View {
        VStack(spacing: 12) {
            DatePicker(
                "Select Date",
                selection: $viewModel.selectedDate,
                displayedComponents: .date
            )
            .datePickerStyle(.graphical)
            .padding(16)
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .padding(.horizontal, 16)
            .padding(.top, 8)

            if !viewModel.deadlinesForSelectedDate.isEmpty {
                HStack {
                    Text("\(viewModel.deadlinesForSelectedDate.count) deadline(s) on this day")
                        .font(.caption.bold())
                        .foregroundStyle(.secondary)
                    Spacer()
                }
                .padding(.horizontal, 20)
            }
        }
    }

    private var deadlinesList: some View {
        List {
            if viewModel.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding()
            } else if viewModel.deadlinesForSelectedDate.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "calendar.badge.checkmark")
                        .font(.title2)
                        .foregroundStyle(.secondary)
                    Text("No deadlines on this date")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .listRowBackground(Color.clear)
            } else {
                ForEach(viewModel.deadlinesForSelectedDate) { deadline in
                    DeadlineDetailRow(deadline: deadline) {
                        Task { await viewModel.toggleDeadlineCompletion(deadline) }
                    }
                    .swipeActions(edge: .trailing) {
                        Button(role: .destructive) {
                            Task { await viewModel.deleteDeadline(deadline) }
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                    }
                }
            }
        }
        .listStyle(.plain)
    }
}

struct DeadlineDetailRow: View {
    let deadline: Deadline
    let onToggle: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Button(action: onToggle) {
                Image(systemName: deadline.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundStyle(deadline.isCompleted ? .green : .secondary)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(deadline.title)
                        .font(.subheadline.bold())
                        .strikethrough(deadline.isCompleted)

                    if deadline.isOverdue {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.caption)
                            .foregroundStyle(.red)
                    }
                }

                if let description = deadline.description {
                    Text(description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                HStack(spacing: 8) {
                    Label(deadline.type.displayName, systemImage: deadline.type.iconName)
                        .font(.caption2)
                        .foregroundStyle(.blue)

                    Text(deadline.dueDate.formatted(date: .abbreviated, time: .shortened))
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            if deadline.isOverdue {
                Text("Overdue")
                    .font(.caption2.bold())
                    .foregroundStyle(.red)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(Color.red.opacity(0.1))
                    .clipShape(Capsule())
            }
        }
        .padding(.vertical, 4)
        .opacity(deadline.isCompleted ? 0.6 : 1)
    }
}

struct CreateDeadlineSheet: View {
    @ObservedObject var viewModel: CalendarViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var description = ""
    @State private var dueDate = Date()
    @State private var type: DeadlineType = .other
    @State private var reminderDays = [1, 3, 7]

    let caseId: UUID

    init(viewModel: CalendarViewModel, caseId: UUID = UUID()) {
        self.viewModel = viewModel
        self.caseId = caseId
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Deadline Details") {
                    TextField("Title", text: $title)
                    Picker("Type", selection: $type) {
                        ForEach(DeadlineType.allCases, id: \.self) { t in
                            Label(t.displayName, systemImage: t.iconName).tag(t)
                        }
                    }
                    DatePicker("Due Date", selection: $dueDate)
                    TextField("Description (Optional)", text: $description, axis: .vertical)
                        .lineLimit(2...4)
                }

                Section("Reminders") {
                    ForEach(reminderDays, id: \.self) { day in
                        Text("\(day) day(s) before")
                    }
                }
            }
            .navigationTitle("New Deadline")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") {
                        Task {
                            await viewModel.createDeadline(
                                caseId: caseId,
                                title: title,
                                description: description.isEmpty ? nil : description,
                                dueDate: dueDate,
                                type: type,
                                reminderDays: reminderDays
                            )
                        }
                    }
                    .disabled(title.isEmpty)
                }
            }
        }
    }
}

#Preview {
    CalendarView()
}
