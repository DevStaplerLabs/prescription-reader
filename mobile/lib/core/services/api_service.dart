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
      'rawOcrText': 'Dr. Smith\nAmoxicillin 500mg\nTake 1 tablet every 8 hours\nFor 7 days',
      'extractedData': {
        'drugName': 'Amoxicillin',
        'dosage': '500mg',
        'frequency': 'Every 8 hours',
        'durationDays': 7,
      }
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
      'drugName': 'Amoxicillin',
      'dosage': '500mg',
      'time': '08:00 AM',
      'status': 'pending', // taken, missed, snoozed, pending
    },
    {
      'id': '2',
      'drugName': 'Ibuprofen',
      'dosage': '200mg',
      'time': '02:00 PM',
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
