import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primaryColor = Color(0xFF00B894); // Teal/Mint Primary
  static const Color secondaryColor = Color(0xFF00A381); // Dark Teal/Mint for Headers
  static const Color accentColor = Color(0xFF00B894);  // Accent Mint
  static const Color successColor = Color(0xFF00B894); // Success/Taken Mint
  static const Color warningColor = Color(0xFFEAA011); // Warning Orange/Yellow
  static const Color dangerColor = Color(0xFFE25C6E);  // Danger Red/Pink
  static const Color backgroundColor = Color(0xFFE8FBF5); // Primary Light Mint background
  static const Color cardColor = Colors.white;

  static List<BoxShadow> get premiumShadow => [
        BoxShadow(
          color: const Color(0xFF00B894).withValues(alpha: 0.08),
          offset: const Offset(0, 4),
          blurRadius: 20,
          spreadRadius: 0,
        )
      ];

  static ThemeData get lightTheme {
    final textTheme = GoogleFonts.plusJakartaSansTextTheme();
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        primary: primaryColor,
        secondary: accentColor,
        surface: backgroundColor,
      ),
      scaffoldBackgroundColor: backgroundColor,
      
      // Plus Jakarta Sans Font Setup
      textTheme: textTheme.copyWith(
        titleLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, color: primaryColor),
        bodyLarge: GoogleFonts.plusJakartaSans(color: const Color(0xFF1E293B)),
        bodyMedium: GoogleFonts.plusJakartaSans(color: const Color(0xFF475569)),
      ),

      // AppBar Overhaul
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: primaryColor),
        titleTextStyle: GoogleFonts.plusJakartaSans(
          color: primaryColor,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),

      // Card Theme
      cardTheme: CardThemeData(
        color: cardColor,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),

      // Modern Inputs
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: backgroundColor,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: accentColor, width: 2),
        ),
      ),
      
      // Bottom Navigation Bar
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: primaryColor,
        unselectedItemColor: Colors.grey.shade400,
        type: BottomNavigationBarType.fixed,
        elevation: 20,
        selectedLabelStyle: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, fontSize: 12),
        unselectedLabelStyle: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w500, fontSize: 12),
      ),
    );
  }
}
