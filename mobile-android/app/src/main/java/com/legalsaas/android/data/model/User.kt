package com.legalsaas.android.data.model

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("id")
    val id: String,

    @SerializedName("email")
    val email: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("role")
    val role: UserRole,

    @SerializedName("firm_name")
    val firmName: String? = null,

    @SerializedName("avatar_url")
    val avatarUrl: String? = null,

    @SerializedName("created_at")
    val createdAt: String,

    @SerializedName("updated_at")
    val updatedAt: String
)

enum class UserRole {
    @SerializedName("admin")
    ADMIN,

    @SerializedName("attorney")
    ATTORNEY,

    @SerializedName("paralegal")
    PARALEGAL,

    @SerializedName("secretary")
    SECRETARY
}

data class LoginRequest(
    @SerializedName("email")
    val email: String,

    @SerializedName("password")
    val password: String
)

data class RegisterRequest(
    @SerializedName("email")
    val email: String,

    @SerializedName("password")
    val password: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("firm_name")
    val firmName: String? = null
)

data class AuthResponse(
    @SerializedName("token")
    val token: String,

    @SerializedName("refresh_token")
    val refreshToken: String,

    @SerializedName("user")
    val user: User
)
