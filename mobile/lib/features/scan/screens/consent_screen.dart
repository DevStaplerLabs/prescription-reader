import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class ConsentScreen extends StatefulWidget {
  const ConsentScreen({super.key});

  @override
  State<ConsentScreen> createState() => _ConsentScreenState();
}

class _ConsentScreenState extends State<ConsentScreen> {
  bool _agreed = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Data Privacy Consent')),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.privacy_tip_outlined, size: 60, color: AppTheme.primaryColor),
                const SizedBox(height: 24),
                const Text(
                  'Before we scan your prescription...',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                const Text(
                  'To read your prescription, the image will be securely processed using OCR technology. We adhere strictly to the Digital Personal Data Protection (DPDP) Act.',
                  style: TextStyle(fontSize: 16, height: 1.5, color: Colors.black87),
                ),
                const SizedBox(height: 24),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.2)),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('• Your data is encrypted in transit and at rest.'),
                      SizedBox(height: 8),
                      Text('• Images are deleted after parsing unless you opt to save them.'),
                      SizedBox(height: 8),
                      Text('• We do not share your medical data with third-party advertisers.'),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                CheckboxListTile(
                  title: const Text('I consent to the processing of my medical data for schedule extraction.'),
                  value: _agreed,
                  onChanged: (val) {
                    setState(() => _agreed = val ?? false);
                  },
                  controlAffinity: ListTileControlAffinity.leading,
                  contentPadding: EdgeInsets.zero,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _agreed ? () => context.pop(true) : null,
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 54),
                  ),
                  child: const Text('I Agree & Continue'),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () => context.pop(false),
                  style: TextButton.styleFrom(
                    minimumSize: const Size(double.infinity, 54),
                  ),
                  child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

