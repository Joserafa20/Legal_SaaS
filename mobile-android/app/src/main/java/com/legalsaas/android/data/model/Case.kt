package com.legalsaas.android.data.model

import com.google.gson.annotations.SerializedName

data class Case(
    @SerializedName("id")
    val id: String,

    @SerializedName("title")
    val title: String,

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("case_number")
    val caseNumber: String,

    @SerializedName("status")
    val status: CaseStatus,

    @SerializedName("priority")
    val priority: CasePriority,

    @SerializedName("client_name")
    val clientName: String,

    @SerializedName("client_email")
    val clientEmail: String? = null,

    @SerializedName("client_phone")
    val clientPhone: String? = null,

    @SerializedName("court_name")
    val courtName: String? = null,

    @SerializedName("judge_name")
    val judgeName: String? = null,

    @SerializedName("opposing_counsel")
    val opposingCounsel: String? = null,

    @SerializedName("practice_area")
    val practiceArea: String? = null,

    @SerializedName("filing_date")
    val filingDate: String? = null,

    @SerializedName("next_hearing_date")
    val nextHearingDate: String? = null,

    @SerializedName("assigned_attorney_id")
    val assignedAttorneyId: String? = null,

    @SerializedName("created_at")
    val createdAt: String,

    @SerializedName("updated_at")
    val updatedAt: String
)

enum class CaseStatus {
    @SerializedName("open")
    OPEN,

    @SerializedName("in_progress")
    IN_PROGRESS,

    @SerializedName("pending")
    PENDING,

    @SerializedName("closed")
    CLOSED,

    @SerializedName("dismissed")
    DISMISSED,

    @SerializedName("settled")
    SETTLED
}

enum class CasePriority {
    @SerializedName("low")
    LOW,

    @SerializedName("medium")
    MEDIUM,

    @SerializedName("high")
    HIGH,

    @SerializedName("urgent")
    URGENT
}

data class CaseRequest(
    @SerializedName("title")
    val title: String,

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("case_number")
    val caseNumber: String,

    @SerializedName("status")
    val status: CaseStatus,

    @SerializedName("priority")
    val priority: CasePriority,

    @SerializedName("client_name")
    val clientName: String,

    @SerializedName("client_email")
    val clientEmail: String? = null,

    @SerializedName("client_phone")
    val clientPhone: String? = null,

    @SerializedName("court_name")
    val courtName: String? = null,

    @SerializedName("judge_name")
    val judgeName: String? = null,

    @SerializedName("opposing_counsel")
    val opposingCounsel: String? = null,

    @SerializedName("practice_area")
    val practiceArea: String? = null,

    @SerializedName("filing_date")
    val filingDate: String? = null,

    @SerializedName("next_hearing_date")
    val nextHearingDate: String? = null,

    @SerializedName("assigned_attorney_id")
    val assignedAttorneyId: String? = null
)
