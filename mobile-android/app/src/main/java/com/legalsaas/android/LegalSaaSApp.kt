package com.legalsaas.android

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class LegalSaaSApp : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
