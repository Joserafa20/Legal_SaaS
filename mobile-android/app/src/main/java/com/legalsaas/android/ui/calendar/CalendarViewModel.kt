package com.legalsaas.android.ui.calendar

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.legalsaas.android.data.model.Deadline
import com.legalsaas.android.data.model.DeadlineType
import com.legalsaas.android.data.repository.DeadlineRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.YearMonth
import javax.inject.Inject

data class CalendarUiState(
    val isLoading: Boolean = false,
    val currentMonth: YearMonth = YearMonth.now(),
    val selectedDate: LocalDate = LocalDate.now(),
    val deadlines: List<Deadline> = emptyList(),
    val deadlinesForSelectedDate: List<Deadline> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class CalendarViewModel @Inject constructor(
    private val deadlineRepository: DeadlineRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CalendarUiState())
    val uiState: StateFlow<CalendarUiState> = _uiState.asStateFlow()

    init {
        loadDeadlines()
    }

    fun loadDeadlines() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = deadlineRepository.getDeadlines()
            result.fold(
                onSuccess = { deadlines ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        deadlines = deadlines
                    )
                    filterDeadlinesForSelectedDate()
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Failed to load deadlines"
                    )
                }
            )
        }
    }

    fun selectDate(date: LocalDate) {
        _uiState.value = _uiState.value.copy(selectedDate = date)
        filterDeadlinesForSelectedDate()
    }

    fun previousMonth() {
        _uiState.value = _uiState.value.copy(
            currentMonth = _uiState.value.currentMonth.minusMonths(1)
        )
    }

    fun nextMonth() {
        _uiState.value = _uiState.value.copy(
            currentMonth = _uiState.value.currentMonth.plusMonths(1)
        )
    }

    private fun filterDeadlinesForSelectedDate() {
        val selectedDate = _uiState.value.selectedDate
        val filteredDeadlines = _uiState.value.deadlines.filter { deadline ->
            try {
                val deadlineDate = LocalDate.parse(deadline.dueDate)
                deadlineDate == selectedDate
            } catch (e: Exception) {
                false
            }
        }
        _uiState.value = _uiState.value.copy(
            deadlinesForSelectedDate = filteredDeadlines
        )
    }

    fun getDeadlinesForDate(date: LocalDate): List<Deadline> {
        return _uiState.value.deadlines.filter { deadline ->
            try {
                val deadlineDate = LocalDate.parse(deadline.dueDate)
                deadlineDate == date
            } catch (e: Exception) {
                false
            }
        }
    }

    fun deleteDeadline(id: String) {
        viewModelScope.launch {
            val result = deadlineRepository.deleteDeadline(id)
            result.fold(
                onSuccess = {
                    loadDeadlines()
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        error = exception.message ?: "Failed to delete deadline"
                    )
                }
            )
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
