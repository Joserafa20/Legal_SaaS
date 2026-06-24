package com.legalsaas.android.data.repository

import com.legalsaas.android.data.api.RetrofitClient
import com.legalsaas.android.data.model.Deadline
import com.legalsaas.android.data.model.DeadlineRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DeadlineRepository @Inject constructor(
    private val retrofitClient: RetrofitClient
) {
    suspend fun getDeadlines(): Result<List<Deadline>> {
        return try {
            val response = retrofitClient.apiService.getDeadlines()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to fetch deadlines: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getDeadlineById(id: String): Result<Deadline> {
        return try {
            val response = retrofitClient.apiService.getDeadlineById(id)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to fetch deadline: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createDeadline(deadlineRequest: DeadlineRequest): Result<Deadline> {
        return try {
            val response = retrofitClient.apiService.createDeadline(deadlineRequest)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to create deadline: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateDeadline(id: String, deadlineRequest: DeadlineRequest): Result<Deadline> {
        return try {
            val response = retrofitClient.apiService.updateDeadline(id, deadlineRequest)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to update deadline: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteDeadline(id: String): Result<Unit> {
        return try {
            val response = retrofitClient.apiService.deleteDeadline(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to delete deadline: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getUpcomingDeadlines(): Result<List<Deadline>> {
        return try {
            val deadlines = getDeadlines()
            deadlines.map { deadlineList ->
                deadlineList
                    .filter { !it.isCompleted }
                    .sortedBy { it.dueDate }
                    .take(10)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
