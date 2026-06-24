package com.legalsaas.android.data.api

import com.legalsaas.android.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // Auth endpoints
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("api/auth/logout")
    suspend fun logout(): Response<Unit>

    @GET("api/auth/me")
    suspend fun getCurrentUser(): Response<User>

    // Case endpoints
    @GET("api/cases")
    suspend fun getCases(): Response<List<Case>>

    @GET("api/cases/{id}")
    suspend fun getCaseById(@Path("id") id: String): Response<Case>

    @POST("api/cases")
    suspend fun createCase(@Body case: CaseRequest): Response<Case>

    @PUT("api/cases/{id}")
    suspend fun updateCase(@Path("id") id: String, @Body case: CaseRequest): Response<Case>

    @DELETE("api/cases/{id}")
    suspend fun deleteCase(@Path("id") id: String): Response<Unit>

    // Deadline endpoints
    @GET("api/deadlines")
    suspend fun getDeadlines(): Response<List<Deadline>>

    @GET("api/deadlines/{id}")
    suspend fun getDeadlineById(@Path("id") id: String): Response<Deadline>

    @POST("api/deadlines")
    suspend fun createDeadline(@Body deadline: DeadlineRequest): Response<Deadline>

    @PUT("api/deadlines/{id}")
    suspend fun updateDeadline(@Path("id") id: String, @Body deadline: DeadlineRequest): Response<Deadline>

    @DELETE("api/deadlines/{id}")
    suspend fun deleteDeadline(@Path("id") id: String): Response<Unit>

    // Notification endpoints
    @GET("api/notifications")
    suspend fun getNotifications(): Response<List<Notification>>

    @PUT("api/notifications/{id}/read")
    suspend fun markNotificationAsRead(@Path("id") id: String): Response<Unit>

    // AI endpoints
    @POST("api/ai/chat")
    suspend fun chatWithAI(@Body request: AIRequest): Response<AIResponse>

    @POST("api/ai/analyze-document")
    suspend fun analyzeDocument(@Body request: DocumentAnalysisRequest): Response<DocumentAnalysisResponse>
}
