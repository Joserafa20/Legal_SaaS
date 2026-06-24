package com.legalsaas.android.ui.cases

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.legalsaas.android.data.model.Case
import com.legalsaas.android.data.model.CaseStatus
import com.legalsaas.android.data.repository.CaseRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CasesUiState(
    val isLoading: Boolean = false,
    val cases: List<Case> = emptyList(),
    val filteredCases: List<Case> = emptyList(),
    val selectedFilter: CaseStatus? = null,
    val searchQuery: String = "",
    val error: String? = null
)

@HiltViewModel
class CasesViewModel @Inject constructor(
    private val caseRepository: CaseRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CasesUiState())
    val uiState: StateFlow<CasesUiState> = _uiState.asStateFlow()

    init {
        loadCases()
    }

    fun loadCases() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = caseRepository.getCases()
            result.fold(
                onSuccess = { cases ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        cases = cases,
                        filteredCases = cases
                    )
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Failed to load cases"
                    )
                }
            )
        }
    }

    fun filterByStatus(status: CaseStatus?) {
        _uiState.value = _uiState.value.copy(selectedFilter = status)
        applyFilters()
    }

    fun searchCases(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        applyFilters()
    }

    private fun applyFilters() {
        val state = _uiState.value
        var filtered = state.cases

        state.selectedFilter?.let { status ->
            filtered = filtered.filter { it.status == status }
        }

        if (state.searchQuery.isNotBlank()) {
            filtered = filtered.filter {
                it.title.contains(state.searchQuery, ignoreCase = true) ||
                        it.clientName.contains(state.searchQuery, ignoreCase = true) ||
                        it.caseNumber.contains(state.searchQuery, ignoreCase = true)
            }
        }

        _uiState.value = _uiState.value.copy(filteredCases = filtered)
    }

    fun deleteCase(id: String) {
        viewModelScope.launch {
            val result = caseRepository.deleteCase(id)
            result.fold(
                onSuccess = {
                    loadCases()
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        error = exception.message ?: "Failed to delete case"
                    )
                }
            )
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
