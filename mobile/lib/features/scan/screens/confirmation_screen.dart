import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/services/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/gradient_button.dart';

class MedicationForm {
  final TextEditingController drugName;
  final TextEditingController dosage;
  final TextEditingController frequency;
  final TextEditingController duration;

  MedicationForm({String drug = '', String dos = '', String freq = '', String dur = ''})
      : drugName = TextEditingController(text: drug),
        dosage = TextEditingController(text: dos),
        frequency = TextEditingController(text: freq),
        duration = TextEditingController(text: dur);

  void dispose() {
    drugName.dispose();
    dosage.dispose();
    frequency.dispose();
    duration.dispose();
  }
}

class ConfirmationScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> ocrData;

  const ConfirmationScreen({super.key, required this.ocrData});

  @override
  ConsumerState<ConfirmationScreen> createState() => _ConfirmationScreenState();
}

class _ConfirmationScreenState extends ConsumerState<ConfirmationScreen> {
  final List<MedicationForm> _forms = [];
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final data = widget.ocrData['extractedData'] as Map<String, dynamic>? ?? {};
    _forms.add(MedicationForm(
      drug: data['drugName']?.toString() ?? '',
      dos: data['dosage']?.toString() ?? '',
      freq: data['frequency']?.toString() ?? '',
      dur: data['durationDays']?.toString() ?? '',
    ));
  }

  @override
  void dispose() {
    for (var form in _forms) {
      form.dispose();
    }
    super.dispose();
  }

  Future<void> _saveSchedule() async {
    setState(() => _isSaving = true);
    
    try {
      final apiService = ref.read(apiServiceProvider);
      
      for (var form in _forms) {
        final payload = {
          'drugName': form.drugName.text,
          'dosage': form.dosage.text,
          'frequency': form.frequency.text,
          'durationDays': form.duration.text,
        };
        await apiService.saveSchedule(payload);
      }
      
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Schedules Saved Successfully!', style: GoogleFonts.plusJakartaSans(color: Colors.white)),
          backgroundColor: AppTheme.successColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      context.go('/'); // Go back home
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to save: $e', style: GoogleFonts.plusJakartaSans(color: Colors.white)),
          backgroundColor: AppTheme.dangerColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _addMedication() {
    setState(() {
      _forms.add(MedicationForm());
    });
  }

  void _removeMedication(int index) {
    setState(() {
      _forms[index].dispose();
      _forms.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    final rawText = widget.ocrData['rawOcrText']?.toString() ?? 'No raw text';

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Confirm Details',
          style: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.bold,
            color: AppTheme.primaryColor,
          ),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Parsed Prescription Text:',
              style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: AppTheme.primaryColor.withValues(alpha: 0.1),
                  width: 1,
                ),
              ),
              child: Text(
                rawText,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  color: AppTheme.primaryColor.withValues(alpha: 0.8),
                  height: 1.5,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Edit Extracted Details:',
              style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 16),
            
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _forms.length,
              itemBuilder: (context, index) {
                final form = _forms[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 20),
                  padding: const EdgeInsets.all(20.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: AppTheme.premiumShadow,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Medication ${index + 1}',
                            style: GoogleFonts.plusJakartaSans(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: AppTheme.primaryColor,
                            ),
                          ),
                          if (_forms.length > 1)
                            IconButton(
                              icon: const Icon(Icons.delete_outline_rounded, color: AppTheme.dangerColor),
                              onPressed: () => _removeMedication(index),
                            ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      TextField(
                        controller: form.drugName,
                        style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                        decoration: const InputDecoration(
                          labelText: 'Drug Name',
                          hintText: 'e.g. Paracetamol',
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: form.dosage,
                              style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                              decoration: const InputDecoration(
                                labelText: 'Dosage',
                                hintText: 'e.g. 500mg',
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextField(
                              controller: form.frequency,
                              style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                              decoration: const InputDecoration(
                                labelText: 'Frequency',
                                hintText: 'e.g. 1-0-1',
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: form.duration,
                        style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                        decoration: const InputDecoration(
                          labelText: 'Duration (Days)',
                          hintText: 'e.g. 5',
                        ),
                        keyboardType: TextInputType.number,
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 8),
            
            OutlinedButton(
              onPressed: _addMedication,
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.accentColor,
                side: const BorderSide(color: AppTheme.accentColor, width: 2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                minimumSize: const Size(double.infinity, 56),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.add_rounded, color: AppTheme.accentColor, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Add Medication',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.only(left: 24.0, right: 24.0, bottom: 24.0),
          child: GradientButton(
            text: 'Save Schedule ✓',
            onPressed: _isSaving ? null : _saveSchedule,
            isLoading: _isSaving,
          ),
        ),
      ),
    );
  }
}
