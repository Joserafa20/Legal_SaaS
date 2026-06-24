import SwiftUI

struct CasesListView: View {
    @StateObject private var viewModel = CasesViewModel()

    var body: some View {
        List {
            Section {
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(.secondary)
                    TextField("Search cases...", text: $viewModel.searchQuery)
                        .textInputAutocapitalization(.never)
                }

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        FilterChip(
                            title: "All",
                            isSelected: viewModel.selectedStatus == nil,
                            action: { viewModel.setStatusFilter(nil) }
                        )

                        ForEach(CaseStatus.allCases, id: \.self) { status in
                            FilterChip(
                                title: status.displayName,
                                isSelected: viewModel.selectedStatus == status,
                                action: { viewModel.setStatusFilter(status) }
                            )
                        }
                    }
                }
            }

            Section {
                if viewModel.isLoading && viewModel.filteredCases.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .padding()
                } else if viewModel.filteredCases.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "folder.badge.questionmark")
                            .font(.title2)
                            .foregroundStyle(.secondary)
                        Text("No cases found")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                } else {
                    ForEach(viewModel.filteredCases) { caseItem in
                        NavigationLink {
                            CaseDetailView(caseItem: caseItem)
                        } label: {
                            CaseRowView(caseItem: caseItem)
                        }
                    }
                    .onDelete { indexSet in
                        for index in indexSet {
                            let caseItem = viewModel.filteredCases[index]
                            Task { await viewModel.deleteCase(caseItem) }
                        }
                    }
                }
            }
        }
        .navigationTitle("Cases")
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
            CreateCaseSheet(viewModel: viewModel)
        }
        .task {
            await viewModel.loadCases()
        }
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption.bold())
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? Color.blue : Color(.tertiarySystemGroupedBackground))
                .foregroundStyle(isSelected ? .white : .primary)
                .clipShape(Capsule())
        }
    }
}

struct CreateCaseSheet: View {
    @ObservedObject var viewModel: CasesViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var caseNumber = ""
    @State private var clientName = ""
    @State private var clientEmail = ""
    @State private var clientPhone = ""
    @State private var courtName = ""
    @State private var judgeName = ""
    @State private var description = ""
    @State private var priority: CasePriority = .medium

    var body: some View {
        NavigationStack {
            Form {
                Section("Case Information") {
                    TextField("Case Title", text: $title)
                    TextField("Case Number", text: $caseNumber)
                    Picker("Priority", selection: $priority) {
                        ForEach(CasePriority.allCases, id: \.self) { p in
                            Text(p.displayName).tag(p)
                        }
                    }
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section("Client Information") {
                    TextField("Client Name", text: $clientName)
                    TextField("Client Email", text: $clientEmail)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                    TextField("Client Phone", text: $clientPhone)
                        .keyboardType(.phonePad)
                }

                Section("Court Information") {
                    TextField("Court Name", text: $courtName)
                    TextField("Judge Name", text: $judgeName)
                }
            }
            .navigationTitle("New Case")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") {
                        Task {
                            await viewModel.createCase(
                                title: title,
                                description: description.isEmpty ? nil : description,
                                caseNumber: caseNumber,
                                clientName: clientName,
                                clientEmail: clientEmail.isEmpty ? nil : clientEmail,
                                clientPhone: clientPhone.isEmpty ? nil : clientPhone,
                                courtName: courtName.isEmpty ? nil : courtName,
                                judgeName: judgeName.isEmpty ? nil : judgeName,
                                priority: priority
                            )
                        }
                    }
                    .disabled(title.isEmpty || caseNumber.isEmpty || clientName.isEmpty)
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        CasesListView()
    }
}
