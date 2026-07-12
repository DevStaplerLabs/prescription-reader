import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/services/api_service.dart';
import '../../../core/theme/app_theme.dart';

class MedicationReminderEditor extends ConsumerStatefulWidget {
  final Map<String, dynamic> medication;

  const MedicationReminderEditor({super.key, required this.medication});

  @override
  ConsumerState<MedicationReminderEditor> createState() =>
      _MedicationReminderEditorState();
}

class _MedicationReminderEditorState
    extends ConsumerState<MedicationReminderEditor> {
  late bool _reminderEnabled;
  late List<String> _times;
  late DateTime _startDate;
  late DateTime _endDate;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _reminderEnabled = widget.medication['reminderEnabled'] != false;
    _times = List<String>.from(
      widget.medication['scheduledTimes'] as List<dynamic>? ?? const <String>[],
    );
    _times.sort();
    _startDate = _parseDate(widget.medication['startDate']) ?? DateTime.now();
    _endDate = _parseDate(widget.medication['endDate']) ?? _startDate;
  }

  DateTime? _parseDate(dynamic value) {
    if (value is! String) return null;
    return DateTime.tryParse(value)?.toLocal();
  }

  String _displayDate(DateTime value) {
    const months = <String>[
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${value.day} ${months[value.month - 1]} ${value.year}';
  }

  String _displayTime(String value) {
    final parts = value.split(':');
    final hour = int.tryParse(parts.first) ?? 0;
    final minute = parts.length > 1 ? parts[1] : '00';
    final suffix = hour >= 12 ? 'PM' : 'AM';
    final hour12 = hour % 12 == 0 ? 12 : hour % 12;
    return '$hour12:$minute $suffix';
  }

  Future<void> _pickTime() async {
    final selected = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 8, minute: 0),
      helpText: 'Choose reminder time',
    );
    if (selected == null) return;

    final value =
        '${selected.hour.toString().padLeft(2, '0')}:${selected.minute.toString().padLeft(2, '0')}';
    if (_times.contains(value)) {
      _showMessage('That reminder time is already added.', isError: true);
      return;
    }
    setState(() {
      _times = [..._times, value]..sort();
    });
  }

  Future<void> _pickDate({required bool isStart}) async {
    final initialDate = isStart ? _startDate : _endDate;
    final selected = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
      helpText: isStart ? 'Choose start date' : 'Choose end date',
    );
    if (selected == null) return;
    setState(() {
      if (isStart) {
        _startDate = selected;
        if (_endDate.isBefore(selected)) _endDate = selected;
      } else {
        _endDate = selected.isBefore(_startDate) ? _startDate : selected;
      }
    });
  }

  Future<void> _save() async {
    if (_times.isEmpty) {
      _showMessage('Add at least one reminder time.', isError: true);
      return;
    }

    setState(() => _isSaving = true);
    try {
      await ref
          .read(apiServiceProvider)
          .updateMedicationReminder(
            scheduleId: widget.medication['scheduleId'] as String,
            medicationId: widget.medication['medicationId'] as String,
            reminderEnabled: _reminderEnabled,
            scheduledTimes: _times,
            startDate: _startDate,
            endDate: _endDate,
          );
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } catch (_) {
      if (!mounted) return;
      _showMessage(
        'Could not update the reminder. Please try again.',
        isError: true,
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _showMessage(String message, {required bool isError}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: GoogleFonts.plusJakartaSans()),
        backgroundColor: isError ? AppTheme.dangerColor : AppTheme.successColor,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final medicationName =
        '${widget.medication['drugName']} ${widget.medication['dosage']}'
            .trim();
    return SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          20,
          12,
          20,
          20 + MediaQuery.viewInsetsOf(context).bottom,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                medicationName,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryColor,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Adjust when this medicine should remind you.',
                style: GoogleFonts.plusJakartaSans(
                  color: Colors.grey.shade600,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 20),
              SwitchListTile.adaptive(
                contentPadding: EdgeInsets.zero,
                title: Text(
                  'Medication reminders',
                  style: GoogleFonts.plusJakartaSans(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                subtitle: Text(
                  _reminderEnabled
                      ? 'On for the times below'
                      : 'Paused, your schedule is kept',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 13,
                    color: Colors.grey.shade600,
                  ),
                ),
                value: _reminderEnabled,
                activeTrackColor: AppTheme.accentColor,
                activeThumbColor: AppTheme.primaryColor,
                onChanged: _isSaving
                    ? null
                    : (value) => setState(() => _reminderEnabled = value),
              ),
              const Divider(height: 32),
              Text(
                'Reminder times',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ..._times.map(
                    (time) => InputChip(
                      label: Text(
                        _displayTime(time),
                        style: GoogleFonts.plusJakartaSans(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      onDeleted: _isSaving
                          ? null
                          : () => setState(() => _times.remove(time)),
                      deleteIcon: const Icon(Icons.close_rounded, size: 18),
                      backgroundColor: AppTheme.primaryColor.withValues(
                        alpha: 0.07,
                      ),
                      side: BorderSide(
                        color: AppTheme.primaryColor.withValues(alpha: 0.14),
                      ),
                    ),
                  ),
                  ActionChip(
                    avatar: const Icon(Icons.add_rounded, size: 18),
                    label: Text(
                      'Add time',
                      style: GoogleFonts.plusJakartaSans(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    onPressed: _isSaving ? null : _pickTime,
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Text(
                'Medication period',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _DateButton(
                      label: 'Starts',
                      value: _displayDate(_startDate),
                      onTap: _isSaving ? null : () => _pickDate(isStart: true),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _DateButton(
                      label: 'Ends',
                      value: _displayDate(_endDate),
                      onTap: _isSaving ? null : () => _pickDate(isStart: false),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _save,
                  child: _isSaving
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(strokeWidth: 2.5),
                        )
                      : const Text('Update medication'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DateButton extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback? onTap;

  const _DateButton({
    required this.label,
    required this.value,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onTap,
      style: OutlinedButton.styleFrom(
        alignment: Alignment.centerLeft,
        minimumSize: const Size(0, 58),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
