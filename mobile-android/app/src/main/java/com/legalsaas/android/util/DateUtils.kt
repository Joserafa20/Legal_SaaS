package com.legalsaas.android.util

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.*

object DateUtils {

    private val displayFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy")
    private val timeFormatter = DateTimeFormatter.ofPattern("hh:mm a")
    private val fullFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy hh:mm a")

    fun formatDate(date: LocalDate): String {
        return date.format(displayFormatter)
    }

    fun formatDateTime(dateTime: LocalDateTime): String {
        return dateTime.format(fullFormatter)
    }

    fun formatTime(dateTime: LocalDateTime): String {
        return dateTime.format(timeFormatter)
    }

    fun getDaysUntil(date: LocalDate): Long {
        val today = LocalDate.now()
        return ChronoUnit.DAYS.between(today, date)
    }

    fun getDaysUntilFormatted(date: LocalDate): String {
        val days = getDaysUntil(date)
        return when {
            days < 0 -> "Overdue by ${-days} days"
            days == 0L -> "Today"
            days == 1L -> "Tomorrow"
            days <= 7L -> "In $days days"
            days <= 30L -> "In ${days / 7} weeks"
            else -> "In ${days / 30} months"
        }
    }

    fun isOverdue(date: LocalDate): Boolean {
        return date.isBefore(LocalDate.now())
    }

    fun isUpcoming(date: LocalDate, daysThreshold: Int = 7): Boolean {
        val today = LocalDate.now()
        val threshold = today.plusDays(daysThreshold.toLong())
        return !date.isBefore(today) && !date.isAfter(threshold)
    }

    fun parseDate(dateString: String): LocalDate? {
        return try {
            LocalDate.parse(dateString)
        } catch (e: Exception) {
            null
        }
    }

    fun getMonthDays(yearMonth: java.time.YearMonth): List<LocalDate> {
        val days = mutableListOf<LocalDate>()
        val daysInMonth = yearMonth.lengthOfMonth()
        for (day in 1..daysInMonth) {
            days.add(yearMonth.atDay(day))
        }
        return days
    }
}
