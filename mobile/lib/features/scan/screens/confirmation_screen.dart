import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../schedule/screens/home_screen.dart';

class MedicationForm {
  final TextEditingController drugName;
  final TextEditingController dosage;
  final TextEditingController frequency;
  final TextEditingController duration;
  final TextEditingController instruction;

  MedicationForm({String drug = '', String dos = '', String freq = '', String dur = '', String inst = ''})
      : drugName = TextEditingController(text: drug),
        dosage = TextEditingController(text: dos),
        frequency = TextEditingController(text: freq),
        duration = TextEditingController(text: dur),
        instruction = TextEditingController(text: inst);

  void dispose() {
    drugName.dispose();
    dosage.dispose();
    frequency.dispose();
    duration.dispose();
    instruction.dispose();
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
  final List<bool> _isEditing = [];
  bool _isSaving = false;
  bool _showRawText = false;

  @override
  void initState() {
    super.initState();
    final medicines = widget.ocrData['extractedMedicines'] as List<dynamic>?;
    if (medicines != null && medicines.isNotEmpty) {
      for (var med in medicines) {
        _forms.add(MedicationForm(
          drug: med['drugName']?.toString() ?? '',
          dos: med['dosage']?.toString() ?? '',
          freq: med['frequency']?.toString() ?? '',
          dur: med['durationDays']?.toString() ?? '',
          inst: med['instruction']?.toString() ?? '',
        ));
        _isEditing.add(false); // Default to read-only view matching mockup
      }
    } else {
      final data = widget.ocrData['extractedData'] as Map<String, dynamic>? ?? {};
      _forms.add(MedicationForm(
        drug: data['drugName']?.toString() ?? '',
        dos: data['dosage']?.toString() ?? '',
        freq: data['frequency']?.toString() ?? '',
        dur: data['durationDays']?.toString() ?? '',
        inst: data['instruction']?.toString() ?? '',
      ));
      _isEditing.add(false);
    }
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
      
      // Build the medications list from the form values
      final List<Map<String, dynamic>> medications = _forms.map((form) {
        // Parse frequency (e.g. "1-0-1" or "1-1-1")
        final freqText = form.frequency.text.trim();
        final freqParts = freqText.split('-');
        final frequencyMap = {
          'morning': 0,
          'afternoon': 0,
          'night': 0,
        };
        if (freqParts.length == 3) {
          frequencyMap['morning'] = int.tryParse(freqParts[0]) ?? 0;
          frequencyMap['afternoon'] = int.tryParse(freqParts[1]) ?? 0;
          frequencyMap['night'] = int.tryParse(freqParts[2]) ?? 0;
        } else {
          // simple fallback logic
          if (freqText.toLowerCase().contains('morning') || freqText == '1') {
            frequencyMap['morning'] = 1;
          }
          if (freqText.toLowerCase().contains('night')) {
            frequencyMap['night'] = 1;
          }
        }

        // Parse duration (e.g. "5")
        final durationValue = int.tryParse(form.duration.text) ?? 5;

        // Parse instruction (e.g. "Before food")
        final instLower = form.instruction.text.toLowerCase();
        String mealInstruction = 'after';
        if (instLower.contains('before') || instLower.contains('pre')) {
          mealInstruction = 'before';
        } else if (instLower.contains('with')) {
          mealInstruction = 'with';
        }

        return {
          'drugName': form.drugName.text,
          'form': 'Tab', // default form for now
          'dosage': form.dosage.text,
          'frequency': frequencyMap,
          'duration': {
            'value': durationValue,
            'unit': 'days',
          },
          'mealInstruction': mealInstruction,
          'route': 'oral',
          'specialInstructions': null,
        };
      }).toList();

      // Original parsedData contains clinic/doctor/patient fields
      final originalParsedData = widget.ocrData['parsedData'] as Map<String, dynamic>? ?? {};

      // Merge user edits back into the parsedData
      final Map<String, dynamic> mergedParsedData = Map.from(originalParsedData);
      mergedParsedData['medications'] = medications;

      // Fetch the registered phone number from StorageService
      final storage = ref.read(storageServiceProvider);
      final rawPhone = await storage.read('phone_number') as String?;
      String? phone = rawPhone;
      if (phone != null && phone.isNotEmpty) {
        phone = phone.replaceAll(RegExp(r'[^0-9]'), '');
        // Default to Indian country code (+91) if it's a standard 10-digit number
        if (!phone.startsWith('91') && phone.length == 10) {
          phone = '91$phone';
        }
      }

      // Inject the phone number into the patient details
      final Map<String, dynamic> patientData = Map.from(mergedParsedData['patient'] as Map<String, dynamic>? ?? {});
      patientData['phone'] = phone;
      mergedParsedData['patient'] = patientData;

      final confirmPayload = {
        'rawOcrText': widget.ocrData['rawOcrText'] ?? '',
        'parsedData': mergedParsedData,
      };
      
      await apiService.confirmPrescription(confirmPayload);
      
      await storage.remove('cached_schedules'); // Invalidate SWR cache
      ref.invalidate(schedulesProvider);
      
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
      _isEditing.add(true); // new items open in edit mode
    });
  }

  void _removeMedication(int index) {
    setState(() {
      _forms[index].dispose();
      _forms.removeAt(index);
      _isEditing.removeAt(index);
    });
  }

  Color _getDotColor(int index) {
    final colors = [
      AppTheme.primaryColor,
      AppTheme.accentColor,
      AppTheme.dangerColor,
    ];
    return colors[index % colors.length];
  }

  @override
  Widget build(BuildContext context) {
    final rawText = widget.ocrData['rawOcrText']?.toString() ?? 'No raw text';

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Column(
        children: [
          // Navy Header Bar matching StaplerLabs theme
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(top: 54, bottom: 20, left: 20, right: 20),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Confirm Details',
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                // Help Button
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.help_outline_rounded,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Collapsible Raw OCR text block (kept for verification without cluttering)
                  ExpansionPanelList(
                    elevation: 0,
                    expandedHeaderPadding: EdgeInsets.zero,
                    expansionCallback: (index, isExpanded) {
                      setState(() {
                        _showRawText = !isExpanded;
                      });
                    },
                    children: [
                      ExpansionPanel(
                        backgroundColor: Colors.transparent,
                        headerBuilder: (context, isExpanded) {
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(
                              'Show Raw Parsed Prescription Text',
                              style: GoogleFonts.plusJakartaSans(
                                fontWeight: FontWeight.bold,
                                color: Colors.grey.shade600,
                                fontSize: 13,
                              ),
                            ),
                          );
                        },
                        body: Container(
                          width: double.infinity,
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Text(
                            rawText,
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 13,
                              color: Colors.grey.shade700,
                              height: 1.4,
                            ),
                          ),
                        ),
                        isExpanded: _showRawText,
                      )
                    ],
                  ),
                  const SizedBox(height: 12),
                  
                  // Mockup section header
                  Text(
                    'EXTRACTED MEDICINES',
                    style: GoogleFonts.plusJakartaSans(
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade600,
                      fontSize: 12,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Dynamic list of cards
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _forms.length,
                    itemBuilder: (context, index) {
                      final form = _forms[index];
                      final isEditing = _isEditing[index];
                      final dotColor = _getDotColor(index);

                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.only(bottom: 14),
                        padding: const EdgeInsets.all(16.0),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.grey.shade200, width: 1.2),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            )
                          ],
                        ),
                        child: isEditing 
                            ? _buildEditCard(index, form) 
                            : _buildPreviewCard(index, form, dotColor),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  
                  // Outlined Add Medication Button
                  OutlinedButton(
                    onPressed: _addMedication,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primaryColor,
                      side: const BorderSide(color: AppTheme.primaryColor, width: 1.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      minimumSize: const Size(double.infinity, 52),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.add_rounded, color: AppTheme.primaryColor, size: 20),
                        const SizedBox(width: 6),
                        Text(
                          'Add Medication',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.only(left: 20.0, right: 20.0, bottom: 20.0),
          child: SizedBox(
            height: 54,
            child: ElevatedButton(
              onPressed: _isSaving ? null : _saveSchedule,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: _isSaving
                  ? const SizedBox(
                      height: 24,
                      width: 24,
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        strokeWidth: 2.5,
                      ),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Save Schedule',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Icon(Icons.check_rounded, size: 18),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPreviewCard(int index, MedicationForm form, Color dotColor) {
    // Generate detail subtitle text (e.g. 3×/day • 5 days • After food)
    final details = [
      if (form.frequency.text.isNotEmpty) form.frequency.text,
      if (form.duration.text.isNotEmpty) '${form.duration.text} days',
      if (form.instruction.text.isNotEmpty) form.instruction.text,
    ].join(' • ');

    return Row(
      children: [
        // Colored Status Dot
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: dotColor,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 16),
        
        // Drug name and detail subtitles
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${form.drugName.text} ${form.dosage.text}',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF1E293B),
                ),
              ),
              if (details.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  details,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 13,
                    color: Colors.grey.shade500,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ],
          ),
        ),
        
        // Circular Pencil Edit Button
        InkWell(
          onTap: () {
            setState(() {
              _isEditing[index] = true;
            });
          },
          borderRadius: BorderRadius.circular(20),
          child: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Icon(
                Icons.edit_rounded,
                color: AppTheme.primaryColor,
                size: 16,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEditCard(int index, MedicationForm form) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Edit Medication ${index + 1}',
              style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: AppTheme.primaryColor,
              ),
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.check_circle_outline_rounded, color: AppTheme.primaryColor, size: 22),
                  onPressed: () {
                    setState(() {
                      _isEditing[index] = false;
                    });
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, color: AppTheme.dangerColor, size: 22),
                  onPressed: () => _removeMedication(index),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 10),
        TextField(
          controller: form.drugName,
          style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
          decoration: const InputDecoration(
            labelText: 'Drug Name',
            hintText: 'e.g. Paracetamol',
            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: form.dosage,
                style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                decoration: const InputDecoration(
                  labelText: 'Dosage',
                  hintText: 'e.g. 500mg',
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: form.frequency,
                style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                decoration: const InputDecoration(
                  labelText: 'Frequency',
                  hintText: 'e.g. 3×/day',
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: form.duration,
                style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                decoration: const InputDecoration(
                  labelText: 'Duration (Days)',
                  hintText: 'e.g. 5',
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                keyboardType: TextInputType.number,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: form.instruction,
                style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                decoration: const InputDecoration(
                  labelText: 'Instruction',
                  hintText: 'e.g. After food',
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
