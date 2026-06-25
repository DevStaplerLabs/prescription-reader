import 'package:flutter/material.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // MOCK HISTORY DATA
    final pastPrescriptions = [
      {'date': '2023-09-10', 'drug': 'Azithromycin', 'duration': '5 days', 'adherence': 87},
      {'date': '2023-10-01', 'drug': 'Vitamin C', 'duration': '30 days', 'adherence': 45},
      {'date': '2023-11-15', 'drug': 'Ibuprofen', 'duration': '10 days', 'adherence': 95},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Prescription History')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: pastPrescriptions.length,
        itemBuilder: (context, index) {
          final item = pastPrescriptions[index];
          final adherence = item['adherence'] as int;
          
          Color adherenceColor = Colors.green;
          if (adherence < 50) {
            adherenceColor = Colors.red;
          } else if (adherence < 80) {
            adherenceColor = Colors.orange;
          }

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              title: Text(item['drug'] as String, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('Date: ${item['date']} • Duration: ${item['duration']}'),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: adherenceColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: adherenceColor),
                ),
                child: Text('$adherence% Adherence', style: TextStyle(color: adherenceColor, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ),
          );
        },
      ),
    );
  }
}
