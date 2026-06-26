import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

class ApiService {
  // ignore: unused_field
  final Dio _dio = Dio();

  // Mock method to upload image and return parsed OCR text
  Future<Map<String, dynamic>> uploadPrescription(String filePath) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));

    // MOCK RESPONSE
    return {
      'rawOcrText': 'Rx\nParacetamol 500mg - 3x/day for 5 days after food\nAzithromycin 250mg - 1x/day for 3 days before food\nCetrizine 10mg - 1x/day at Night with water',
      'extractedMedicines': [
        {
          'drugName': 'Paracetamol',
          'dosage': '500mg',
          'frequency': '3×/day',
          'durationDays': 5,
          'instruction': 'After food',
        },
        {
          'drugName': 'Azithromycin',
          'dosage': '250mg',
          'frequency': '1×/day',
          'durationDays': 3,
          'instruction': 'Before food',
        },
        {
          'drugName': 'Cetrizine',
          'dosage': '10mg',
          'frequency': '1×/day',
          'durationDays': 'Night',
          'instruction': 'With water',
        }
      ]
    };
  }

  // Mock method to save the schedule
  Future<bool> saveSchedule(Map<String, dynamic> scheduleData) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));
    return true; // Successfully saved
  }

  // Local state to simulate database
  final List<Map<String, dynamic>> _mockSchedules = [
    {
      'id': '1',
      'drugName': 'Paracetamol',
      'dosage': '500mg',
      'time': 'Morning',
      'instruction': 'After food',
      'status': 'taken', // taken, missed, snoozed, pending
    },
    {
      'id': '2',
      'drugName': 'Azithromycin',
      'dosage': '250mg',
      'time': 'Morning',
      'instruction': 'Before food',
      'status': 'pending',
    },
    {
      'id': '3',
      'drugName': 'Cetrizine',
      'dosage': '10mg',
      'time': 'Night',
      'instruction': 'With water',
      'status': 'pending',
    }
  ];

  // Mock method to get active schedules
  Future<List<Map<String, dynamic>>> getActiveSchedules() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return _mockSchedules;
  }

  // Mock method to log adherence
  Future<bool> logAdherence(String id, String newStatus) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _mockSchedules.indexWhere((s) => s['id'] == id);
    if (index != -1) {
      _mockSchedules[index]['status'] = newStatus;
      return true;
    }
    return false;
  }
}
