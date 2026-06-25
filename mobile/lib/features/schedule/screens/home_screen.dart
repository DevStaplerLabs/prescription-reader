import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
      appBar: AppBar(
        title: const Text('My Schedule'),
      ),
      body: schedulesAsyncValue.when(
        data: (schedules) {
          if (schedules.isEmpty) {
            return const Center(child: Text('No active medications.'));
          }
          final pendingCount = schedules.where((s) => s['status'] == 'pending').length;
          final takenCount = schedules.where((s) => s['status'] == 'taken').length;
          final now = DateTime.now();
          final formattedDate = "${now.day}/${now.month}/${now.year}";

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: schedules.length + 1,
            itemBuilder: (context, index) {
              if (index == 0) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Good morning!', style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 4),
                      Text('Today is $formattedDate', style: Theme.of(context).textTheme.bodyMedium),
                      const SizedBox(height: 8),
                      Text('$pendingCount pending • $takenCount taken', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                    ],
                  ),
                );
              }
              final schedule = schedules[index - 1];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const Icon(Icons.medication, color: Colors.blue, size: 40),
                  title: Text(schedule['drugName']),
                  subtitle: Text('${schedule['dosage']} • ${schedule['time']}'),
                  trailing: _buildStatusChip(schedule['status']),
                  onTap: () {
                    _showStatusDialog(context, ref, schedule['id']);
                  },
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    switch (status) {
      case 'taken':
        color = Colors.green;
        break;
      case 'snoozed':
        color = Colors.orange;
        break;
      case 'missed':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }
    return Chip(
      label: Text(status.toUpperCase(), style: const TextStyle(fontSize: 10, color: Colors.white)),
      backgroundColor: color,
    );
  }

  Future<void> _showStatusDialog(BuildContext context, WidgetRef ref, String scheduleId) async {
    final result = await showDialog<String>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Update Status'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.check_circle, color: Colors.green),
                title: const Text('Taken'),
                onTap: () => Navigator.pop(context, 'taken'),
              ),
              ListTile(
                leading: const Icon(Icons.snooze, color: Colors.orange),
                title: const Text('Snoozed'),
                onTap: () => Navigator.pop(context, 'snoozed'),
              ),
              ListTile(
                leading: const Icon(Icons.cancel, color: Colors.red),
                title: const Text('Missed'),
                onTap: () => Navigator.pop(context, 'missed'),
              ),
            ],
          ),
        );
      },
    );

    if (result != null) {
      final apiService = ref.read(apiServiceProvider);
      await apiService.logAdherence(scheduleId, result);
      ref.invalidate(schedulesProvider);
    }
  }
}
