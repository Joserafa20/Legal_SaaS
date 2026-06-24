package com.legalsaas.android.ui.ai

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.legalsaas.android.data.api.RetrofitClient
import com.legalsaas.android.data.model.AIRequest
import com.legalsaas.android.data.model.AIResponse
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ChatMessage(
    val id: String,
    val content: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)

data class AIUiState(
    val isLoading: Boolean = false,
    val messages: List<ChatMessage> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class AIViewModel @Inject constructor(
    private val retrofitClient: RetrofitClient
) : ViewModel() {

    private val _uiState = MutableStateFlow(AIUiState())
    val uiState: StateFlow<AIUiState> = _uiState.asStateFlow()

    init {
        addWelcomeMessage()
    }

    private fun addWelcomeMessage() {
        val welcomeMessage = ChatMessage(
            id = "welcome",
            content = "Hello! I'm your AI legal assistant. I can help you with:\n\n" +
                    "• Legal research and analysis\n" +
                    "• Document review and summarization\n" +
                    "• Case strategy suggestions\n" +
                    "• Deadline management\n" +
                    "• Client communication drafting\n\n" +
                    "How can I assist you today?",
            isUser = false
        )
        _uiState.value = _uiState.value.copy(messages = listOf(welcomeMessage))
    }

    fun sendMessage(message: String) {
        if (message.isBlank()) return

        val userMessage = ChatMessage(
            id = "user_${System.currentTimeMillis()}",
            content = message,
            isUser = true
        )

        _uiState.value = _uiState.value.copy(
            messages = _uiState.value.messages + userMessage,
            isLoading = true,
            error = null
        )

        viewModelScope.launch {
            try {
                val response = retrofitClient.apiService.chatWithAI(
                    AIRequest(message = message)
                )

                if (response.isSuccessful) {
                    val aiResponse = response.body()!!
                    val aiMessage = ChatMessage(
                        id = "ai_${System.currentTimeMillis()}",
                        content = aiResponse.response,
                        isUser = false
                    )
                    _uiState.value = _uiState.value.copy(
                        messages = _uiState.value.messages + aiMessage,
                        isLoading = false
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "Failed to get response: ${response.message()}"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "An error occurred"
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    fun clearChat() {
        _uiState.value = AIUiState()
        addWelcomeMessage()
    }
}
