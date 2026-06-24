package com.legalsaas.android.data.repository

import com.legalsaas.android.data.api.RetrofitClient
import com.legalsaas.android.data.model.Case
import com.legalsaas.android.data.model.CaseRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CaseRepository @Inject constructor(
    private val retrofitClient: RetrofitClient
) {
    suspend fun getCases(): Result<List<Case>> {
        return try {
            val response = retrofitClient.apiService.getCases()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to fetch cases: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCaseById(id: String): Result<Case> {
        return try {
            val response = retrofitClient.apiService.getCaseById(id)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to fetch case: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createCase(caseRequest: CaseRequest): Result<Case> {
        return try {
            val response = retrofitClient.apiService.createCase(caseRequest)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to create case: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateCase(id: String, caseRequest: CaseRequest): Result<Case> {
        return try {
            val response = retrofitClient.apiService.updateCase(id, caseRequest)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to update case: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteCase(id: String): Result<Unit> {
        return try {
            val response = retrofitClient.apiService.deleteCase(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to delete case: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun searchCases(query: String): Result<List<Case>> {
        return try {
            val cases = getCases()
            cases.map { caseList ->
                caseList.filter { case ->
                    case.title.contains(query, ignoreCase = true) ||
                            case.clientName.contains(query, ignoreCase = true) ||
                            case.caseNumber.contains(query, ignoreCase = true)
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
