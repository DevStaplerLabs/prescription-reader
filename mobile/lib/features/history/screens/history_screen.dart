import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // MOCK HISTORY DATA
    final pastPrescriptions = [
      {'date': '2023-09-10', 'drug': 'Azithromycin', 'duration': '5 days', 'adherence': 87},
      {'date': '2023-10-01', 'drug': 'Vitamin C', 'duration': '30 days', 'adherence': 45},
      {'date': '2023-11-15', 'drug': 'Ibuprofen', 'duration': '10 days', 'adherence': 75},
    ];

    return Scaffold(
      body: Column(
        children: [
          // Custom Gradient Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(top: 60, bottom: 24),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            child: Center(
              child: Text(
                'Prescription History',
                style: GoogleFonts.plusJakartaSans(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          
          // History Cards List
          Expanded(
            child: ListView.builder(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              itemCount: pastPrescriptions.length,
              itemBuilder: (context, index) {
                final item = pastPrescriptions[index];
                final adherence = item['adherence'] as int;
                
                Color adherenceColor;
                if (adherence >= 80) {
                  adherenceColor = AppTheme.successColor;
                } else if (adherence >= 50) {
                  adherenceColor = AppTheme.warningColor;
                } else {
                  adherenceColor = AppTheme.dangerColor;
                }

                return Container(
                  margin: const EdgeInsets.only(bottom: 20),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: AppTheme.premiumShadow,
                    border: Border(
                      left: BorderSide(
                        color: adherenceColor,
                        width: 6,
                      ),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item['drug'] as String,
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryColor,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Date: ${item['date']} • Duration: ${item['duration']}',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 13,
                                    color: Colors.grey.shade500,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: adherenceColor.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              adherence >= 80
                                  ? 'Good Adherence'
                                  : adherence >= 50
                                      ? 'Average Adherence'
                                      : 'Poor Adherence',
                              style: GoogleFonts.plusJakartaSans(
                                color: adherenceColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      
                      // Progress Bar & Percentage
                      Row(
                        children: [
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: LinearProgressIndicator(
                                value: adherence / 100.0,
                                backgroundColor: AppTheme.backgroundColor,
                                valueColor: AlwaysStoppedAnimation<Color>(adherenceColor),
                                minHeight: 8,
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Text(
                            '$adherence%',
                            style: GoogleFonts.plusJakartaSans(
                              fontWeight: FontWeight.bold,
                              color: adherenceColor,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
