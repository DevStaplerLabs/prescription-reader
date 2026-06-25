import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/services/api_service.dart';
import '../../../core/theme/app_theme.dart';

// Riverpod Provider to fetch active schedules
final schedulesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final apiService = ref.read(apiServiceProvider);
  return apiService.getActiveSchedules();
});

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final schedulesAsyncValue = ref.watch(schedulesProvider);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(schedulesProvider);
        },
        child: schedulesAsyncValue.when(
          data: (schedules) {
            int pending = schedules.where((s) => s['status'] == 'pending').length;
            int taken = schedules.where((s) => s['status'] == 'taken').length;
            int missed = schedules.where((s) => s['status'] == 'missed').length;

            final Map<String, List<Map<String, dynamic>>> grouped = {
              'Morning 🌅': [],
              'Afternoon ☀️': [],
              'Evening 🌙': [],
            };

            for (var s in schedules) {
              String time = s['time'] as String;
              if (time.contains('AM')) {
                grouped['Morning 🌅']!.add(s);
              } else {
                int hour = int.tryParse(time.split(':')[0]) ?? 12;
                if (hour == 12 || (hour >= 1 && hour < 5)) {
                  grouped['Afternoon ☀️']!.add(s);
                } else {
                  grouped['Evening 🌙']!.add(s);
                }
              }
            }

            return CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              slivers: [
                SliverToBoxAdapter(
                  child: _buildHeader(context, pending, taken, missed),
                ),
                ...grouped.entries.map((entry) {
                  if (entry.value.isEmpty) {
                    return const SliverToBoxAdapter(child: SizedBox.shrink());
                  }
                  return SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        if (index == 0) {
                          return _buildSectionHeader(entry.key);
                        }
                        return _buildMedicationCard(
                          context,
                          ref,
                          entry.value[index - 1],
                        );
                      },
                      childCount: entry.value.length + 1,
                    ),
                  );
                }),
                const SliverToBoxAdapter(child: SizedBox(height: 40)),
              ],
            );
          },
          loading: () => const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
            ),
          ),
          error: (e, st) => Center(
            child: Text(
              'Error: $e',
              style: GoogleFonts.plusJakartaSans(color: AppTheme.dangerColor),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, int pending, int taken, int missed) {
    final now = DateTime.now();
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    final dateStr = "${now.day} ${months[now.month - 1]}, ${now.year}";
    final nextApptDate = "${now.day + 2} ${months[now.month - 1]}";
    
    String greeting = 'Good Morning';
    if (now.hour >= 12 && now.hour < 17) {
      greeting = 'Good Afternoon';
    } else if (now.hour >= 17) {
      greeting = 'Good Evening';
    }

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(32),
          bottomRight: Radius.circular(32),
        ),
      ),
      padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Clinic Branding Section (Real hospital header design)
          Center(
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.25),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.local_hospital_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        "Your Clinic Logo Here",
                        style: GoogleFonts.plusJakartaSans(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  "Powered by prescription_reader",
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white.withValues(alpha: 0.6),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 36),
          
          // Greeting & Date
          Text(
            '$greeting, Ayush 👋',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Today is $dateStr',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 14,
              color: Colors.white.withValues(alpha: 0.7),
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 28),
          
          // Stats Row: 3 inline cards
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  pending.toString(),
                  'Pending',
                  AppTheme.accentColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  taken.toString(),
                  'Taken',
                  AppTheme.successColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  missed.toString(),
                  'Missed',
                  AppTheme.dangerColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Placeholder Banner Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.15),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                const Text("📢 ", style: TextStyle(fontSize: 18)),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 13,
                        color: Colors.white,
                      ),
                      children: [
                        const TextSpan(
                          text: "Your next appointment is on ",
                          style: TextStyle(fontWeight: FontWeight.w500),
                        ),
                        TextSpan(
                          text: nextApptDate,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                        const TextSpan(
                          text: " — Tap to view",
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const Icon(
                  Icons.chevron_right_rounded,
                  size: 20,
                  color: Colors.white70,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String count, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                count,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 24, right: 24, top: 32, bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title.toUpperCase(),
            style: GoogleFonts.plusJakartaSans(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade600,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 6),
          const Divider(thickness: 1, color: Color(0xFFE2E8F0)),
        ],
      ),
    );
  }

  Widget _buildMedicationCard(BuildContext context, WidgetRef ref, Map<String, dynamic> schedule) {
    final status = schedule['status'] as String;
    Color statusColor;
    switch (status) {
      case 'taken':
        statusColor = AppTheme.successColor;
        break;
      case 'snoozed':
        statusColor = AppTheme.warningColor;
        break;
      case 'missed':
        statusColor = AppTheme.dangerColor;
        break;
      default:
        statusColor = AppTheme.accentColor;
    }

    return Container(
      margin: const EdgeInsets.only(left: 24, right: 24, bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: AppTheme.premiumShadow,
        border: Border(
          left: BorderSide(
            color: statusColor,
            width: 6,
          ),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () => _showStatusBottomSheet(context, ref, schedule['id']),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
            child: Row(
              children: [
                // Colored Pill Icon
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Icon(
                      Icons.medical_services_rounded,
                      color: statusColor,
                      size: 24,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                
                // Medicine details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        schedule['drugName'],
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${schedule['dosage']} • ${schedule['time']}',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          color: Colors.grey.shade500,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                
                // Status Chip
                _buildStatusChip(status, statusColor),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.toUpperCase(),
        style: GoogleFonts.plusJakartaSans(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: color,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  void _showStatusBottomSheet(BuildContext context, WidgetRef ref, String scheduleId) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      backgroundColor: Colors.white,
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 48,
                  height: 5,
                  margin: const EdgeInsets.only(bottom: 24),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                Text(
                  'Mark Medication As',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryColor,
                  ),
                ),
                const SizedBox(height: 24),
                _buildBottomSheetOption(
                  context,
                  ref,
                  scheduleId,
                  'taken',
                  'Taken',
                  Icons.check_circle_rounded,
                  AppTheme.successColor,
                ),
                const Divider(height: 1, indent: 24, endIndent: 24),
                _buildBottomSheetOption(
                  context,
                  ref,
                  scheduleId,
                  'snoozed',
                  'Snoozed',
                  Icons.snooze_rounded,
                  AppTheme.warningColor,
                ),
                const Divider(height: 1, indent: 24, endIndent: 24),
                _buildBottomSheetOption(
                  context,
                  ref,
                  scheduleId,
                  'missed',
                  'Missed',
                  Icons.cancel_rounded,
                  AppTheme.dangerColor,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBottomSheetOption(
    BuildContext context,
    WidgetRef ref,
    String scheduleId,
    String status,
    String label,
    IconData icon,
    Color color,
  ) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 6),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: color, size: 24),
      ),
      title: Text(
        label,
        style: GoogleFonts.plusJakartaSans(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: AppTheme.primaryColor,
        ),
      ),
      onTap: () async {
        Navigator.pop(context); // Close sheet
        final apiService = ref.read(apiServiceProvider);
        await apiService.logAdherence(scheduleId, status);
        ref.invalidate(schedulesProvider);
      },
    );
  }
}
