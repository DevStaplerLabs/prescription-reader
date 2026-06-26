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
        color: AppTheme.primaryColor,
        onRefresh: () async {
          ref.invalidate(schedulesProvider);
        },
        child: schedulesAsyncValue.when(
          data: (schedules) {
            // Group schedules by their time of day (e.g. 'Morning', 'Night')
            final Map<String, List<Map<String, dynamic>>> grouped = {};
            for (var s in schedules) {
              String time = s['time'] as String? ?? 'Other';
              if (!grouped.containsKey(time)) {
                grouped[time] = [];
              }
              grouped[time]!.add(s);
            }

            return CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              slivers: [
                // Glowing Gradient Header Sliver
                SliverToBoxAdapter(
                  child: _buildHeader(context),
                ),
                
                // Welcome Greeting and Today Date Section
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.only(left: 24.0, right: 24.0, top: 28.0, bottom: 8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Good Morning, Ayush 👋',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _getTodayDateString().toUpperCase(),
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey.shade600,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Grouped Cards List (Neumorphic floating cards)
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final timeGroup = grouped.keys.toList()[index];
                      final list = grouped[timeGroup]!;
                      return _buildGroupedCard(context, ref, timeGroup, list);
                    },
                    childCount: grouped.keys.length,
                  ),
                ),
                
                const SliverToBoxAdapter(child: SizedBox(height: 32)),
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

  Widget _buildHeader(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
      ),
      padding: const EdgeInsets.only(top: 54, left: 24, right: 24, bottom: 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Clinic Logo and Title Row (Glassmorphic)
          Row(
            children: [
              // Logo Placeholder Icon with Glassmorphism
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.22),
                    width: 1.2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    )
                  ],
                ),
                child: const Center(
                  child: Icon(
                    Icons.image_outlined,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Your Clinic Logo Here",
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    "Powered by Prescription Reader",
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white.withValues(alpha: 0.65),
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          // Appointment pill/chip container with glowing dot
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.1),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Yellow dot status indicator
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFFB703), // Vibrant yellow status dot
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Color(0xFFFFB703),
                        blurRadius: 6,
                        spreadRadius: 1,
                      )
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  "Next appointment: Jul 3, 2026 — Dr. Sharma",
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGroupedCard(BuildContext context, WidgetRef ref, String timeGroup, List<Map<String, dynamic>> items) {
    // Determine the icon and text based on the group
    String headerText = timeGroup;
    Widget groupIcon = const Icon(Icons.wb_sunny_outlined, color: AppTheme.primaryColor);
    
    if (timeGroup.toLowerCase() == 'morning') {
      headerText = 'Morning';
      groupIcon = const Text('🌅 ', style: TextStyle(fontSize: 18));
    } else if (timeGroup.toLowerCase() == 'night') {
      headerText = 'Night';
      groupIcon = const Text('🌙 ', style: TextStyle(fontSize: 18));
    } else if (timeGroup.toLowerCase() == 'afternoon') {
      headerText = 'Afternoon';
      groupIcon = const Text('☀️ ', style: TextStyle(fontSize: 18));
    } else if (timeGroup.toLowerCase() == 'evening') {
      headerText = 'Evening';
      groupIcon = const Text('🌇 ', style: TextStyle(fontSize: 18));
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          // Light highlight top-left
          const BoxShadow(
            color: Colors.white,
            blurRadius: 12,
            offset: Offset(-4, -4),
          ),
          // Soft dark shadow bottom-right
          BoxShadow(
            color: AppTheme.secondaryColor.withValues(alpha: 0.05),
            blurRadius: 16,
            offset: const Offset(4, 6),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.01),
            blurRadius: 1,
            spreadRadius: 0.5,
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Time-of-day Header
          Padding(
            padding: const EdgeInsets.only(left: 18.0, right: 18.0, top: 18.0, bottom: 8.0),
            child: Row(
              children: [
                groupIcon,
                const SizedBox(width: 6),
                Text(
                  headerText,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
          ),
          
          // List of medicines inside this group
          Column(
            children: List.generate(items.length, (index) {
              final schedule = items[index];
              return Column(
                children: [
                  if (index > 0)
                    Divider(height: 1, color: Colors.grey.shade100, indent: 18, endIndent: 18),
                  
                  // Medicine List Row with animated scale interaction
                  _HomeMedicationRow(
                    schedule: schedule,
                    statusChip: _buildStatusChip(schedule['status'] as String? ?? 'pending'),
                    onTap: () => _showStatusBottomSheet(context, ref, schedule['id']),
                  ),
                ],
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color bg;
    Color fg;
    String label;

    switch (status.toLowerCase()) {
      case 'taken':
        bg = const Color(0xFFE8FBF5);
        fg = AppTheme.primaryColor;
        label = 'Taken';
        break;
      case 'missed':
        bg = const Color(0xFFFEE2E2);
        fg = AppTheme.dangerColor;
        label = 'Missed';
        break;
      case 'snoozed':
      case 'pending':
      default:
        bg = const Color(0xFFFEF3C7);
        fg = const Color(0xFFD97706);
        label = 'Pending';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          // Active soft glow corresponding to status
          BoxShadow(
            color: fg.withValues(alpha: 0.12),
            blurRadius: 8,
            offset: const Offset(0, 3),
          )
        ],
      ),
      child: Text(
        label,
        style: GoogleFonts.plusJakartaSans(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: fg,
        ),
      ),
    );
  }

  String _getTodayDateString() {
    final now = DateTime.now();
    final days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    final dayOfWeek = days[now.weekday % 7];
    final monthStr = months[now.month - 1];
    
    return "TODAY • $dayOfWeek, $monthStr ${now.day}";
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
                    color: const Color(0xFF0F172A),
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
                  AppTheme.primaryColor,
                ),
                const Divider(height: 1, indent: 24, endIndent: 24),
                _buildBottomSheetOption(
                  context,
                  ref,
                  scheduleId,
                  'snoozed',
                  'Pending (Snoozed)',
                  Icons.snooze_rounded,
                  const Color(0xFFEAA011),
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
          color: const Color(0xFF0F172A),
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

class _HomeMedicationRow extends StatefulWidget {
  final Map<String, dynamic> schedule;
  final VoidCallback onTap;
  final Widget statusChip;

  const _HomeMedicationRow({
    required this.schedule,
    required this.onTap,
    required this.statusChip,
  });

  @override
  State<_HomeMedicationRow> createState() => _HomeMedicationRowState();
}

class _HomeMedicationRowState extends State<_HomeMedicationRow> {
  double _scale = 1.0;

  @override
  Widget build(BuildContext context) {
    return AnimatedScale(
      scale: _scale,
      duration: const Duration(milliseconds: 100),
      curve: Curves.easeInOut,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTapDown: (_) => setState(() => _scale = 0.98),
          onTapUp: (_) => setState(() => _scale = 1.0),
          onTapCancel: () => setState(() => _scale = 1.0),
          onTap: widget.onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 15.0),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${widget.schedule['drugName']} ${widget.schedule['dosage']}',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF1E293B),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.schedule['instruction'] as String? ?? 'After food',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          color: Colors.grey.shade500,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                widget.statusChip,
              ],
            ),
          ),
        ),
      ),
    );
  }
}
