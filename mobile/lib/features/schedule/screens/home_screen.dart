import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/theme/app_theme.dart';

// Riverpod Provider to load the user's name
final userNameProvider = FutureProvider.autoDispose<String>((ref) async {
  final storage = ref.read(storageServiceProvider);
  final name = await storage.read('user_name') as String?;
  return name ?? 'User';
});

// Riverpod Provider to fetch historical inactive schedules
final historySchedulesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final apiService = ref.read(apiServiceProvider);
  final storage = ref.read(storageServiceProvider);
  String phone = await storage.read('phone_number') as String? ?? '';
  if (phone.isEmpty) return [];
  
  phone = phone.replaceAll(RegExp(r'[^0-9]'), '');
  if (!phone.startsWith('91') && phone.length == 10) {
    phone = '91$phone';
  }
  return apiService.getHistorySchedules(phone);
});

// Riverpod Provider to fetch active schedules — simple FutureProvider that always fetches fresh
final schedulesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final storage = ref.read(storageServiceProvider);
  final apiService = ref.read(apiServiceProvider);
  String phone = await storage.read('phone_number') as String? ?? '';
  if (phone.isEmpty) return [];
  
  phone = phone.replaceAll(RegExp(r'[^0-9]'), '');
  if (!phone.startsWith('91') && phone.length == 10) {
    phone = '91$phone';
  }
  return apiService.getActiveSchedules(phone);
});

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Always fetch fresh when this screen is first built
     Future.microtask(() => ref.refresh(schedulesProvider));
  }

  String _getTimeBasedGreeting() {
    final hour = DateTime.now().hour;
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  }

  Future<void> _confirmDiscontinue(BuildContext context, WidgetRef ref, String scheduleId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(
            'Discontinue Schedule?',
            style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold),
          ),
          content: Text(
            'Are you sure you want to discontinue all current medications? This will clear the active schedule and stop reminders.',
            style: GoogleFonts.plusJakartaSans(),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: Text(
                'Cancel',
                style: GoogleFonts.plusJakartaSans(color: Colors.grey),
              ),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.dangerColor,
                foregroundColor: Colors.white,
              ),
              child: Text(
                'Discontinue',
                style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      try {
        final apiService = ref.read(apiServiceProvider);
        final storage = ref.read(storageServiceProvider);
        await apiService.deactivateActiveSchedule(scheduleId);
        await storage.remove('cached_schedules'); // Invalidate SWR cache
        ref.invalidate(schedulesProvider);
        ref.invalidate(historySchedulesProvider);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Active schedule discontinued.', style: GoogleFonts.plusJakartaSans()),
              backgroundColor: AppTheme.successColor,
            ),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to discontinue: $e', style: GoogleFonts.plusJakartaSans()),
              backgroundColor: AppTheme.dangerColor,
            ),
          );
        }
      }
    }
  }

  Future<void> _restorePastSchedule(BuildContext context, WidgetRef ref, String scheduleId) async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final storage = ref.read(storageServiceProvider);
      final phone = await storage.read('phone_number') as String? ?? '';

      if (phone.isEmpty) {
        throw Exception('User phone number not found.');
      }

      final success = await apiService.restoreSchedule(scheduleId, phone);
      if (success) {
        await storage.remove('cached_schedules'); // Invalidate SWR cache
        ref.invalidate(schedulesProvider);
        ref.invalidate(historySchedulesProvider);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Schedule restored successfully!', style: GoogleFonts.plusJakartaSans()),
              backgroundColor: AppTheme.successColor,
            ),
          );
        }
      } else {
        throw Exception('Restoration failed.');
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to restore: $e', style: GoogleFonts.plusJakartaSans()),
            backgroundColor: AppTheme.dangerColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final schedulesAsyncValue = ref.watch(schedulesProvider);
    final userNameAsync = ref.watch(userNameProvider);
    final userName = userNameAsync.value ?? 'User';

    return Scaffold(
      body: RefreshIndicator(
        color: AppTheme.primaryColor,
        onRefresh: () async {
          ref.invalidate(schedulesProvider);
          ref.invalidate(historySchedulesProvider);
          // Wait for provider to rebuild
          await ref.read(schedulesProvider.future).catchError((_) => <Map<String, dynamic>>[]);
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
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${_getTimeBasedGreeting()}, $userName 👋',
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
                        // Logout action button
                        IconButton(
                          icon: const Icon(Icons.logout_rounded, color: AppTheme.primaryColor),
                          tooltip: 'Logout',
                          onPressed: () async {
                            final storage = ref.read(storageServiceProvider);
                            await storage.remove('phone_number');
                            await storage.remove('user_name');
                            await storage.remove('cached_schedules');
                            ref.invalidate(schedulesProvider);
                            ref.invalidate(historySchedulesProvider);
                            if (context.mounted) {
                              context.go('/onboarding');
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                // Grouped Cards List (Neumorphic floating cards)
                if (schedules.isNotEmpty)
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

                if (schedules.isNotEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.only(left: 24, right: 24, top: 12, bottom: 24),
                      child: _DiscontinueAnimatedButton(
                        onTap: () => _confirmDiscontinue(
                          context,
                          ref,
                          schedules.first['scheduleId'] as String,
                        ),
                      ),
                    ),
                  ),
                
                // Empty state and Past Schedule History list
                if (schedules.isEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withValues(alpha: 0.05),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.15)),
                            ),
                            child: Column(
                              children: [
                                const Text(
                                  '🧘',
                                  style: TextStyle(fontSize: 48),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  'No active medications',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFF0F172A),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Scan a new prescription to start or restore a past one below.',
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 13,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 32),
                          Text(
                            'Previous Prescriptions',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 12),
                          ref.watch(historySchedulesProvider).when(
                            data: (history) {
                              if (history.isEmpty) {
                                return Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 24.0),
                                  child: Center(
                                    child: Text(
                                      'No prescription history found.',
                                      style: GoogleFonts.plusJakartaSans(color: Colors.grey),
                                    ),
                                  ),
                                );
                              }
                              return ListView.builder(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: history.length,
                                itemBuilder: (context, index) {
                                  final pastSchedule = history[index];
                                  final extData = pastSchedule['prescriptionId']?['extractedData'];
                                  final clinic = extData?['clinicName'] ?? 'Clinic';
                                  final doctor = extData?['doctorName'] ?? 'Doctor';
                                  final meds = pastSchedule['medications'] as List<dynamic>? ?? [];

                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 12),
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: Colors.grey.shade100),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.02),
                                          blurRadius: 8,
                                          offset: const Offset(0, 4),
                                        ),
                                      ],
                                    ),
                                    child: Row(
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                '$clinic — Dr. $doctor',
                                                style: GoogleFonts.plusJakartaSans(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 14,
                                                  color: const Color(0xFF1E293B),
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                '${meds.length} medication(s)',
                                                style: GoogleFonts.plusJakartaSans(
                                                  fontSize: 12,
                                                  color: Colors.grey.shade500,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        ElevatedButton(
                                          onPressed: () => _restorePastSchedule(
                                            context,
                                            ref,
                                            pastSchedule['_id'] as String,
                                          ),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: AppTheme.primaryColor,
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                            minimumSize: Size.zero,
                                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          ),
                                          child: Text(
                                            'Restore',
                                            style: GoogleFonts.plusJakartaSans(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              );
                            },
                            loading: () => const Padding(
                              padding: EdgeInsets.symmetric(vertical: 24.0),
                              child: Center(
                                child: CircularProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                                ),
                              ),
                            ),
                            error: (err, _) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 24.0),
                              child: Center(
                                child: Text(
                                  'Error loading history: $err',
                                  style: GoogleFonts.plusJakartaSans(color: AppTheme.dangerColor),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
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
          colors: [AppTheme.accentColor, Color(0xFFE5B600)],
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
              // StaplerLabs Logo Container
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppTheme.primaryColor.withValues(alpha: 0.22),
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
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.asset(
                    'assets/images/logo.png',
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Prescription Reader",
                    style: GoogleFonts.plusJakartaSans(
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    "Powered by StaplerLabs",
                    style: GoogleFonts.plusJakartaSans(
                      color: AppTheme.primaryColor.withValues(alpha: 0.65),
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
              color: AppTheme.primaryColor.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: AppTheme.primaryColor.withValues(alpha: 0.1),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Navy dot status indicator (adjusted contrast for yellow header)
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppTheme.primaryColor,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryColor,
                        blurRadius: 4,
                        spreadRadius: 0.5,
                      )
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  "Next appointment: Jul 3, 2026 — Dr. Sharma",
                  style: GoogleFonts.plusJakartaSans(
                    color: AppTheme.primaryColor,
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
        // Invalidate to rebuild with new in-memory status
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

class _DiscontinueAnimatedButton extends StatefulWidget {
  final VoidCallback onTap;

  const _DiscontinueAnimatedButton({required this.onTap});

  @override
  State<_DiscontinueAnimatedButton> createState() => _DiscontinueAnimatedButtonState();
}

class _DiscontinueAnimatedButtonState extends State<_DiscontinueAnimatedButton> {
  bool _isHovered = false;
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTapDown: (_) => setState(() => _isPressed = true),
        onTapUp: (_) => setState(() => _isPressed = false),
        onTapCancel: () => setState(() => _isPressed = false),
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          transform: Matrix4.diagonal3Values(
            _isPressed ? 0.98 : (_isHovered ? 1.02 : 1.0),
            _isPressed ? 0.98 : (_isHovered ? 1.02 : 1.0),
            1.0,
          ),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
          decoration: BoxDecoration(
            color: _isHovered ? AppTheme.dangerColor.withValues(alpha: 0.05) : Colors.transparent,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: AppTheme.dangerColor.withValues(alpha: 0.35),
              width: 1.5,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.cancel_presentation_outlined,
                color: AppTheme.dangerColor,
                size: 18,
              ),
              const SizedBox(width: 10),
              Text(
                'Discontinue your current schedule',
                style: GoogleFonts.plusJakartaSans(
                  color: AppTheme.dangerColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  letterSpacing: 0.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
