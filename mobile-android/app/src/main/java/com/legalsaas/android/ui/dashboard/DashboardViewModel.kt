package com.legalsaas.android.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.legalsaas.android.data.model.Case
import com.legalsaas.android.data.model.Deadline
import com.legalsaas.android.data.model.User
import com.legalsaas.android.data.repository.AuthRepository
import com.legalsaas.android.data.repository.CaseRepository
import com.legalsaas.android.data.repository.DeadlineRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DashboardUiState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val cases: List<Case> = emptyList(),
    val upcomingDeadlines: List<Deadline> = emptyList(),
    val caseStats: CaseStats = CaseStats(),
    val error: String? = null
)

data class CaseStats(
    val totalCases: Int = 0,
    val openCases: Int = 0,
    val pendingDeadlines: Int = 0,
    val urgentCases: Int = 0
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val caseRepository: CaseRepository,
    private val deadlineRepository: DeadlineRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadDashboardData()
    }

    fun loadDashboardData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            try {
                val userResult = authRepository.getCurrentUser()
                userResult.onSuccess { user ->
                    _uiState.value = _uiState.value.copy(user = user)
                }

                val casesResult = caseRepository.getCases()
                casesResult.onSuccess { cases ->
                    val stats = CaseStats(
                        totalCases = cases.size,
                        openCases = cases.count { it.status == com.legalsaas.android.data.model.CaseStatus.OPEN },
                        urgentCases = cases.count { it.priority == com.legalsaas.android.data.model.CasePriority.URGENT }
                    )
                    _uiState.value = _uiState.value.copy(
                        cases = cases,
                        caseStats = stats
                    )
                }

                val deadlinesResult = deadlineRepository.getUpcomingDeadlines()
                deadlinesResult.onSuccess { deadlines ->
                    _uiState.value = _uiState.value.copy(
                        upcomingDeadlines = deadlines,
                        caseStats = _uiState.value.caseStats.copy(
                            pendingDeadlines = deadlines.size
                        )
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Failed to load dashboard data"
                )
            } finally {
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }

    fun refresh() {
        loadDashboardData()
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
        }
    }
}
