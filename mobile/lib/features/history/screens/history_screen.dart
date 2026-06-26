import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Exact history data from mockup Image 4
    final adherenceData = [
      {
        'drug': 'Paracetamol 500mg',
        'percentage': 92,
        'streak': ['taken', 'taken', 'missed', 'taken', 'taken', 'taken', 'taken']
      },
      {
        'drug': 'Azithromycin 250mg',
        'percentage': 67,
        'streak': ['taken', 'missed', 'taken', 'snoozed', 'taken', 'missed', 'taken']
      },
      {
        'drug': 'Cetrizine 10mg',
        'percentage': 100,
        'streak': ['taken', 'taken', 'taken', 'taken', 'taken', 'taken', 'taken']
      },
    ];

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Column(
        children: [
          // Dark Teal Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(top: 54, bottom: 20, left: 20, right: 20),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF00B894), Color(0xFF00A381)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Adherence History',
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Last 7 days',
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white.withValues(alpha: 0.85),
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          
          // History list
          Expanded(
            child: ListView.builder(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0),
              itemCount: adherenceData.length + 1, // list + legend
              itemBuilder: (context, index) {
                // Return Legend at the end
                if (index == adherenceData.length) {
                  return _buildLegendRow();
                }

                final item = adherenceData[index];
                final percentage = item['percentage'] as int;
                final streak = item['streak'] as List<String>;

                // Determine progress bar color based on percentage
                Color adherenceColor;
                if (percentage >= 80) {
                  adherenceColor = AppTheme.primaryColor; // mint/teal success
                } else if (percentage >= 50) {
                  adherenceColor = const Color(0xFFEAA011); // orange/yellow
                } else {
                  adherenceColor = const Color(0xFFE25C6E); // red/pink
                }

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.02),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                      BoxShadow(
                        color: AppTheme.secondaryColor.withValues(alpha: 0.02),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      )
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Drug name & Percentage Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            item['drug'] as String,
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF1E293B),
                            ),
                          ),
                          Text(
                            '$percentage%',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: adherenceColor,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      
                      // 3D Cylindrical Glass Tube Progress Bar
                      Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(5),
                            child: LinearProgressIndicator(
                              value: percentage / 100.0,
                              backgroundColor: Colors.grey.shade100,
                              valueColor: AlwaysStoppedAnimation<Color>(adherenceColor),
                              minHeight: 10,
                            ),
                          ),
                          // Cylindrical Highlight Overlay for 3D Gloss
                          Positioned.fill(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(5),
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.white.withValues(alpha: 0.35),
                                      Colors.white.withValues(alpha: 0.05),
                                      Colors.black.withValues(alpha: 0.02),
                                      Colors.black.withValues(alpha: 0.18),
                                    ],
                                    stops: const [0.0, 0.3, 0.7, 1.0],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      
                      // 7-day streak dots rendered as 3D glass marbles
                      Row(
                        children: List.generate(streak.length, (dotIdx) {
                          final state = streak[dotIdx];
                          Color dotColor;
                          switch (state) {
                            case 'taken':
                              dotColor = AppTheme.primaryColor;
                              break;
                            case 'missed':
                              dotColor = const Color(0xFFFCA5A5); // pinkish-red
                              break;
                            case 'snoozed':
                            default:
                              dotColor = const Color(0xFFFCD34D); // yellow/orange
                              break;
                          }

                          return Container(
                            width: 15,
                            height: 15,
                            margin: const EdgeInsets.only(right: 8),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: RadialGradient(
                                colors: [
                                  Colors.white.withValues(alpha: 0.9), // spec highlight
                                  dotColor,
                                  dotColor.withValues(alpha: 0.82), // base shadow
                                ],
                                center: const Alignment(-0.35, -0.35),
                                radius: 0.85,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: dotColor.withValues(alpha: 0.28),
                                  blurRadius: 5,
                                  offset: const Offset(0, 2),
                                )
                              ],
                            ),
                          );
                        }),
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

  Widget _buildLegendRow() {
    return Padding(
      padding: const EdgeInsets.only(top: 8.0, bottom: 24.0, left: 4.0),
      child: Row(
        children: [
          _buildLegendItem('Taken', AppTheme.primaryColor),
          const SizedBox(width: 16),
          _buildLegendItem('Missed', const Color(0xFFFCA5A5)),
          const SizedBox(width: 16),
          _buildLegendItem('Snoozed', const Color(0xFFFCD34D)),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // 3D Glass Marble legend marker
        Container(
          width: 15,
          height: 15,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [
                Colors.white.withValues(alpha: 0.9),
                color,
                color.withValues(alpha: 0.82),
              ],
              center: const Alignment(-0.35, -0.35),
              radius: 0.85,
            ),
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: 0.2),
                blurRadius: 4,
                offset: const Offset(0, 1.5),
              )
            ],
          ),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }
}
