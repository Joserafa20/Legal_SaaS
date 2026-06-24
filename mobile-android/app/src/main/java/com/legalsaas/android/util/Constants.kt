package com.legalsaas.android.util

object Constants {
    // API Configuration
    const val BASE_URL = "https://api.legalsaas.com/"
    const val AUTH_HEADER = "Authorization"
    const val BEARER_PREFIX = "Bearer "

    // DataStore Keys
    const val DATASTORE_NAME = "auth_prefs"

    // Date Formats
    const val DATE_FORMAT = "yyyy-MM-dd"
    const val DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss"
    const val DISPLAY_DATE_FORMAT = "MMM dd, yyyy"
    const val DISPLAY_TIME_FORMAT = "hh:mm a"

    // Pagination
    const val DEFAULT_PAGE_SIZE = 20
    const val MAX_PAGE_SIZE = 100

    // Timeouts
    const val CONNECT_TIMEOUT = 30L
    const val READ_TIMEOUT = 30L
    const val WRITE_TIMEOUT = 30L

    // Cache
    const val CACHE_SIZE = 10L * 1024 * 1024 // 10 MB
    const val CACHE_MAX_AGE = 5 // minutes
    const val CACHE_MAX_STALE = 7 // days

    // User Roles
    const val ROLE_ADMIN = "admin"
    const val ROLE_ATTORNEY = "attorney"
    const val ROLE_PARALEGAL = "paralegal"
    const val ROLE_SECRETARY = "secretary"

    // Case Status
    const val CASE_STATUS_OPEN = "open"
    const val CASE_STATUS_IN_PROGRESS = "in_progress"
    const val CASE_STATUS_PENDING = "pending"
    const val CASE_STATUS_CLOSED = "closed"

    // Deadline Types
    const val DEADLINE_TYPE_FILING = "filing"
    const val DEADLINE_TYPE_HEARING = "hearing"
    const val DEADLINE_TYPE_DISCOVERY = "discovery"
    const val DEADLINE_TYPE_DEPOSITION = "deposition"

    // Priority Levels
    const val PRIORITY_LOW = "low"
    const val PRIORITY_MEDIUM = "medium"
    const val PRIORITY_HIGH = "high"
    const val PRIORITY_URGENT = "urgent"
}
