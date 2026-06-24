package com.legalsaas.android.di

import android.content.Context
import com.legalsaas.android.data.api.AuthInterceptor
import com.legalsaas.android.data.api.RetrofitClient
import com.legalsaas.android.data.api.TokenManager
import com.legalsaas.android.data.repository.AuthRepository
import com.legalsaas.android.data.repository.CaseRepository
import com.legalsaas.android.data.repository.DeadlineRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideTokenManager(@ApplicationContext context: Context): TokenManager {
        return TokenManager(context)
    }

    @Provides
    @Singleton
    fun provideAuthInterceptor(tokenManager: TokenManager): AuthInterceptor {
        return AuthInterceptor(tokenManager)
    }

    @Provides
    @Singleton
    fun provideRetrofitClient(authInterceptor: AuthInterceptor): RetrofitClient {
        return RetrofitClient(authInterceptor)
    }

    @Provides
    @Singleton
    fun provideAuthRepository(
        retrofitClient: RetrofitClient,
        tokenManager: TokenManager
    ): AuthRepository {
        return AuthRepository(retrofitClient, tokenManager)
    }

    @Provides
    @Singleton
    fun provideCaseRepository(retrofitClient: RetrofitClient): CaseRepository {
        return CaseRepository(retrofitClient)
    }

    @Provides
    @Singleton
    fun provideDeadlineRepository(retrofitClient: RetrofitClient): DeadlineRepository {
        return DeadlineRepository(retrofitClient)
    }
}
