import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/services/api_service.dart';

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
      backgroundColor: const Color(0xFFF8F9FA),
      body: schedulesAsyncValue.when(
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
            slivers: [
              SliverToBoxAdapter(child: _buildHeader(context, pending, taken, missed)),
              ...grouped.entries.map((entry) {
                if (entry.value.isEmpty) return const SliverToBoxAdapter(child: SizedBox.shrink());
                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      if (index == 0) return _buildSectionHeader(entry.key);
                      return _buildMedicationCard(context, ref, entry.value[index - 1]);
                    },
                    childCount: entry.value.length + 1,
                  ),
                );
              }).toList(),
              const SliverToBoxAdapter(child: SizedBox(height: 40)),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, int pending, int taken, int missed) {
    final now = DateTime.now();
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    final dateStr = "${now.day} ${months[now.month - 1]}, ${now.year}";
    
    String greeting = 'Good Morning';
    if (now.hour >= 12 && now.hour < 17) greeting = 'Good Afternoon';
    else if (now.hour >= 17) greeting = 'Good Evening';

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.only(top: 60, left: 20, right: 20, bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$greeting, Ayush 👋',
            style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
          ),
          const SizedBox(height: 4),
          Text(
            'Today is $dateStr',
            style: GoogleFonts.inter(fontSize: 14, color: Colors.black54),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF8F9FA),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.withOpacity(0.2)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildSummaryStat(pending, 'Pending', Colors.grey.shade600),
                _buildSummaryStat(taken, 'Taken', Colors.green),
                _buildSummaryStat(missed, 'Missed', Colors.red),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryStat(int count, String label, Color color) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(
          '$count $label',
          style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.black87),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 20, right: 20, top: 24, bottom: 12),
      child: Text(
        title.toUpperCase(),
        style: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: Colors.black45,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildMedicationCard(BuildContext context, WidgetRef ref, Map<String, dynamic> schedule) {
    return Container(
      margin: const EdgeInsets.only(left: 20, right: 20, bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _showStatusBottomSheet(context, ref, schedule['id']),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Icon
                Container(
                  width: 48,
                  height: 48,
                  decoration: const BoxDecoration(
                    color: Color(0xFF1A73E8), // Primary Blue
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.add, color: Colors.white, size: 24), // Medical cross icon
                ),
                const SizedBox(width: 16),
                // Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        schedule['drugName'],
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${schedule['dosage']} • ${schedule['time']}',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: Colors.black54,
                        ),
                      ),
                    ],
                  ),
                ),
                // Status Chip
                _buildStatusChip(schedule['status']),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    Color bgColor;
    switch (status) {
      case 'taken':
        color = Colors.green;
        bgColor = Colors.green.withOpacity(0.1);
        break;
      case 'snoozed':
        color = Colors.orange;
        bgColor = Colors.orange.withOpacity(0.1);
        break;
      case 'missed':
        color = Colors.red;
        bgColor = Colors.red.withOpacity(0.1);
        break;
      default:
        color = Colors.grey.shade700;
        bgColor = Colors.grey.shade200;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.toUpperCase(),
        style: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }

  void _showStatusBottomSheet(BuildContext context, WidgetRef ref, String scheduleId) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: Colors.white,
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Text(
                  'Mark Medication As',
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 20),
                _buildBottomSheetOption(
                  context, ref, scheduleId, 'taken', 'Taken', Icons.check_circle, Colors.green),
                _buildBottomSheetOption(
                  context, ref, scheduleId, 'snoozed', 'Snoozed', Icons.snooze, Colors.orange),
                _buildBottomSheetOption(
                  context, ref, scheduleId, 'missed', 'Missed', Icons.cancel, Colors.red),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBottomSheetOption(BuildContext context, WidgetRef ref, String scheduleId,
      String status, String label, IconData icon, Color color) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: color),
      ),
      title: Text(
        label,
        style: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600,
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

