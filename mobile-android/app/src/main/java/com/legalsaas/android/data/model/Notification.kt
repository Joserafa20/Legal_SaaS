package com.legalsaas.android.data.model

import com.google.gson.annotations.SerializedName

data class Notification(
    @SerializedName("id")
    val id: String,

    @SerializedName("title")
    val title: String,

    @SerializedName("message")
    val message: String,

    @SerializedName("type")
    val type: NotificationType,

    @SerializedName("is_read")
    val isRead: Boolean = false,

    @SerializedName("case_id")
    val caseId: String? = null,

    @SerializedName("deadline_id")
    val deadlineId: String? = null,

    @SerializedName("action_url")
    val actionUrl: String? = null,

    @SerializedName("created_at")
    val createdAt: String
)

enum class NotificationType {
    @SerializedName("deadline_reminder")
    DEADLINE_REMINDER,

    @SerializedName("case_update")
    CASE_UPDATE,

    @SerializedName("new_message")
    NEW_MESSAGE,

    @SerializedName("task_assigned")
    TASK_ASSIGNED,

    @SerializedName("system")
    SYSTEM
}

data class AIRequest(
    @SerializedName("message")
    val message: String,

    @SerializedName("context")
    val context: String? = null,

    @SerializedName("case_id")
    val caseId: String? = null
)

data class AIResponse(
    @SerializedName("response")
    val response: String,

    @SerializedName("suggestions")
    val suggestions: List<String> = emptyList(),

    @SerializedName("confidence")
    val confidence: Float = 0f
)

data class DocumentAnalysisRequest(
    @SerializedName("document_text")
    val documentText: String,

    @SerializedName("analysis_type")
    val analysisType: String
)

data class DocumentAnalysisResponse(
    @SerializedName("summary")
    val summary: String,

    @SerializedName("key_points")
    val keyPoints: List<String>,

    @SerializedName("risk_assessment")
    val riskAssessment: String,

    @SerializedName("recommendations")
    val recommendations: List<String>
)
