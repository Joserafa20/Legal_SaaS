package com.legalsaas.android.data.repository

import com.legalsaas.android.data.api.RetrofitClient
import com.legalsaas.android.data.api.TokenManager
import com.legalsaas.android.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val retrofitClient: RetrofitClient,
    private val tokenManager: TokenManager
) {
    val isLoggedIn: Flow<Boolean> = flow {
        tokenManager.getToken().collect { token ->
            emit(!token.isNullOrEmpty())
        }
    }

    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            val response = retrofitClient.apiService.login(LoginRequest(email, password))
            if (response.isSuccessful) {
                val authResponse = response.body()!!
                tokenManager.saveTokens(authResponse.token, authResponse.refreshToken)
                Result.success(authResponse)
            } else {
                Result.failure(Exception("Login failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(
        email: String,
        password: String,
        name: String,
        firmName: String?
    ): Result<AuthResponse> {
        return try {
            val response = retrofitClient.apiService.register(
                RegisterRequest(email, password, name, firmName)
            )
            if (response.isSuccessful) {
                val authResponse = response.body()!!
                tokenManager.saveTokens(authResponse.token, authResponse.refreshToken)
                Result.success(authResponse)
            } else {
                Result.failure(Exception("Registration failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout(): Result<Unit> {
        return try {
            retrofitClient.apiService.logout()
            tokenManager.clearTokens()
            Result.success(Unit)
        } catch (e: Exception) {
            tokenManager.clearTokens()
            Result.failure(e)
        }
    }

    suspend fun getCurrentUser(): Result<User> {
        return try {
            val response = retrofitClient.apiService.getCurrentUser()
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get user: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
