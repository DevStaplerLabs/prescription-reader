import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/services/api_service.dart';

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
        const SnackBar(content: Text('Schedules Saved Successfully!')),
      );
      context.go('/'); // Go back home
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to save: $e')),
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
      appBar: AppBar(title: const Text('Confirm Details')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Parsed Prescription Text:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(rawText, style: const TextStyle(fontFamily: 'monospace')),
            ),
            const SizedBox(height: 24),
            const Text('Edit Extracted Details:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _forms.length,
              itemBuilder: (context, index) {
                final form = _forms[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.blue.withValues(alpha: 0.1)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Medication ${index + 1}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            if (_forms.length > 1)
                              IconButton(
                                icon: const Icon(Icons.delete, color: Colors.red),
                                onPressed: () => _removeMedication(index),
                              ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: form.drugName,
                          decoration: const InputDecoration(labelText: 'Drug Name', border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: form.dosage,
                          decoration: const InputDecoration(labelText: 'Dosage', border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: form.frequency,
                          decoration: const InputDecoration(labelText: 'Frequency', border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: form.duration,
                          decoration: const InputDecoration(labelText: 'Duration (Days)', border: OutlineInputBorder()),
                          keyboardType: TextInputType.number,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            
            TextButton.icon(
              onPressed: _addMedication,
              icon: const Icon(Icons.add),
              label: const Text('Add Another Medication'),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            
            const SizedBox(height: 32),
            _isSaving
                ? const Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    onPressed: _saveSchedule,
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 54),
                    ),
                    child: const Text('Save All Schedules'),
                  ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
