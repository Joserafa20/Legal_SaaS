package com.legalsaas.android.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.legalsaas.android.ui.ai.AIAssistantScreen
import com.legalsaas.android.ui.auth.LoginScreen
import com.legalsaas.android.ui.calendar.CalendarScreen
import com.legalsaas.android.ui.cases.CaseDetailScreen
import com.legalsaas.android.ui.cases.CasesScreen
import com.legalsaas.android.ui.dashboard.DashboardScreen

object Routes {
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val DASHBOARD = "dashboard"
    const val CASES = "cases"
    const val CASE_DETAIL = "case/{caseId}"
    const val CALENDAR = "calendar"
    const val AI_ASSISTANT = "ai_assistant"

    fun caseDetail(caseId: String) = "case/$caseId"
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Routes.LOGIN
    ) {
        composable(Routes.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                onNavigateToRegister = {
                    navController.navigate(Routes.REGISTER)
                }
            )
        }

        composable(Routes.DASHBOARD) {
            DashboardScreen(
                onNavigateToCases = {
                    navController.navigate(Routes.CASES)
                },
                onNavigateToCalendar = {
                    navController.navigate(Routes.CALENDAR)
                },
                onNavigateToAI = {
                    navController.navigate(Routes.AI_ASSISTANT)
                },
                onLogout = {
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.CASES) {
            CasesScreen(
                onCaseClick = { caseId ->
                    navController.navigate(Routes.caseDetail(caseId))
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(
            route = Routes.CASE_DETAIL,
            arguments = listOf(
                navArgument("caseId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val caseId = backStackEntry.arguments?.getString("caseId") ?: ""
            CaseDetailScreen(
                caseId = caseId,
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(Routes.CALENDAR) {
            CalendarScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(Routes.AI_ASSISTANT) {
            AIAssistantScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}
