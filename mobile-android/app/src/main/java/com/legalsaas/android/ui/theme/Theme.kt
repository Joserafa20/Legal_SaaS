package com.legalsaas.android.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = Primary,
    onPrimary = White,
    primaryContainer = PrimaryLight,
    onPrimaryContainer = DarkBlue,
    secondary = Secondary,
    onSecondary = White,
    secondaryContainer = SecondaryLight,
    onSecondaryContainer = DarkBlue,
    tertiary = Accent,
    onTertiary = White,
    tertiaryContainer = AccentLight,
    onTertiaryContainer = DarkOrange,
    background = BackgroundLight,
    onBackground = DarkGray,
    surface = SurfaceLight,
    onSurface = DarkGray,
    surfaceVariant = SurfaceVariantLight,
    onSurfaceVariant = MediumGray,
    error = Error,
    onError = White
)

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryLight,
    onPrimary = DarkBlue,
    primaryContainer = PrimaryDark,
    onPrimaryContainer = White,
    secondary = SecondaryLight,
    onSecondary = DarkBlue,
    secondaryContainer = SecondaryDark,
    onSecondaryContainer = White,
    tertiary = AccentLight,
    onTertiary = DarkOrange,
    tertiaryContainer = AccentDark,
    onTertiaryContainer = White,
    background = BackgroundDark,
    onBackground = White,
    surface = SurfaceDark,
    onSurface = White,
    surfaceVariant = SurfaceVariantDark,
    onSurfaceVariant = LightGray,
    error = ErrorLight,
    onError = DarkRed
)

@Composable
fun LegalSaaSTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
