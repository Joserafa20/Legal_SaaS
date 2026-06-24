package com.legalsaas.android.data.model

import com.google.gson.annotations.SerializedName

data class Deadline(
    @SerializedName("id")
    val id: String,

    @SerializedName("title")
    val title: String,

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("due_date")
    val dueDate: String,

    @SerializedName("due_time")
    val dueTime: String? = null,

    @SerializedName("type")
    val type: DeadlineType,

    @SerializedName("priority")
    val priority: DeadlinePriority,

    @SerializedName("case_id")
    val caseId: String? = null,

    @SerializedName("case_title")
    val caseTitle: String? = null,

    @SerializedName("is_completed")
    val isCompleted: Boolean = false,

    @SerializedName("reminder_enabled")
    val reminderEnabled: Boolean = true,

    @SerializedName("reminder_days_before")
    val reminderDaysBefore: Int = 3,

    @SerializedName("assigned_to")
    val assignedTo: String? = null,

    @SerializedName("created_at")
    val createdAt: String,

    @SerializedName("updated_at")
    val updatedAt: String
)

enum class DeadlineType {
    @SerializedName("filing")
    FILING,

    @SerializedName("hearing")
    HEARING,

    @SerializedName("discovery")
    DISCOVERY,

    @SerializedName("deposition")
    DEPOSITION,

    @SerializedName("meeting")
    MEETING,

    @SerializedName("other")
    OTHER
}

enum class DeadlinePriority {
    @SerializedName("low")
    LOW,

    @SerializedName("medium")
    MEDIUM,

    @SerializedName("high")
    HIGH,

    @SerializedName("urgent")
    URGENT
}

data class DeadlineRequest(
    @SerializedName("title")
    val title: String,

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("due_date")
    val dueDate: String,

    @SerializedName("due_time")
    val dueTime: String? = null,

    @SerializedName("type")
    val type: DeadlineType,

    @SerializedName("priority")
    val priority: DeadlinePriority,

    @SerializedName("case_id")
    val caseId: String? = null,

    @SerializedName("reminder_enabled")
    val reminderEnabled: Boolean = true,

    @SerializedName("reminder_days_before")
    val reminderDaysBefore: Int = 3,

    @SerializedName("assigned_to")
    val assignedTo: String? = null
)
