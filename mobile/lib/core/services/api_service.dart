import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/app_constants.dart';

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

class ApiService {
  final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 25),
    ),
  );

  // In-memory store for dose adherence statuses (e.g. 'taken', 'missed', 'snoozed')
  final Map<String, String> _adherenceStore = {};

  // Upload image and return parsed OCR text along with structured data
  Future<Map<String, dynamic>> uploadPrescription(String filePath) async {
    try {
      final fileName = filePath.split('/').last;
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          filePath,
          filename: fileName,
        ),
      });

      final response = await _dio.post(
        '${AppConstants.baseUrl}${AppConstants.parseEndpoint}',
        data: formData,
      );

      if (response.statusCode == 200 && response.data != null) {
        final apiResponse = response.data as Map<String, dynamic>;
        if (apiResponse['status'] == 'success') {
          final data = apiResponse['data'] as Map<String, dynamic>;
          final parsedData = data['parsedData'] as Map<String, dynamic>? ?? {};
          final backendMeds = parsedData['medications'] as List<dynamic>? ?? [];

          // Map to the format the frontend expects
          final extractedMedicines = backendMeds.map((med) {
            // Helper to format frequency map into a string like "1-0-1"
            final freq = med['frequency'] as Map<String, dynamic>?;
            String freqStr = '1-0-1'; // fallback
            if (freq != null) {
              freqStr = '${freq['morning'] ?? 0}-${freq['afternoon'] ?? 0}-${freq['night'] ?? 0}';
            }

            // Duration value
            final duration = med['duration'] as Map<String, dynamic>?;
            String durationDays = '5'; // fallback
            if (duration != null) {
              final val = duration['value'];
              final unit = duration['unit']?.toString() ?? 'days';
              if (unit == 'weeks') {
                durationDays = ((int.tryParse(val.toString()) ?? 1) * 7).toString();
              } else if (unit == 'months') {
                durationDays = ((int.tryParse(val.toString()) ?? 1) * 30).toString();
              } else {
                durationDays = val.toString();
              }
            }

            // Meal instruction formatting
            final meal = med['mealInstruction']?.toString() ?? '';
            String instruction = 'After food';
            if (meal == 'before') {
              instruction = 'Before food';
            } else if (meal == 'with') {
              instruction = 'With food';
            }

            return {
              'drugName': med['drugName']?.toString() ?? '',
              'dosage': med['dosage']?.toString() ?? '',
              'frequency': freqStr,
              'durationDays': durationDays,
              'instruction': instruction,
            };
          }).toList();

          return {
            'rawOcrText': data['rawOcrText'] ?? '',
            'extractedMedicines': extractedMedicines,
            'parsedData': parsedData, // Store the original parsedData for confirming
          };
        }
      }
      throw Exception(response.data?['message'] ?? 'Failed to parse prescription');
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  // Save the complete schedule by sending confirmed prescription data to the backend
  Future<bool> confirmPrescription(Map<String, dynamic> confirmPayload) async {
    try {
      final response = await _dio.post(
        '${AppConstants.baseUrl}${AppConstants.uploadEndpoint.replaceAll('/upload', '/confirm')}',
        data: confirmPayload,
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return true;
      }
      return false;
    } catch (e) {
      throw Exception('API Confirm Error: $e');
    }
  }

  // Get active schedules from database
  Future<List<Map<String, dynamic>>> getActiveSchedules(String patientPhone) async {
    try {
      final response = await _dio.get(
        '${AppConstants.baseUrl}${AppConstants.activeSchedulesEndpoint}',
        queryParameters: {
          if (patientPhone.isNotEmpty) 'patientPhone': patientPhone,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        final apiResponse = response.data as Map<String, dynamic>;
        if (apiResponse['status'] == 'success') {
          final data = apiResponse['data'] as Map<String, dynamic>? ?? {};
          final schedule = data['schedule'] as Map<String, dynamic>?;
          if (schedule == null) {
            return [];
          }

          final medications = schedule['medications'] as List<dynamic>? ?? [];
          final flatList = <Map<String, dynamic>>[];

          for (var med in medications) {
            final drugName = med['drugName']?.toString() ?? 'Unknown';
            final dosage = med['dosage']?.toString() ?? '';
            final times = med['scheduledTimes'] as List<dynamic>? ?? [];
            final meal = med['mealInstruction']?.toString() ?? 'after';
            String mealInst = 'After food';
            if (meal == 'before') mealInst = 'Before food';
            if (meal == 'with') mealInst = 'With food';

            for (var t in times) {
              final timeStr = t.toString();
              String timeGroup = 'Morning';
              if (timeStr == '08:00') {
                timeGroup = 'Morning';
              } else if (timeStr == '14:00') {
                timeGroup = 'Afternoon';
              } else if (timeStr == '21:00') {
                timeGroup = 'Night';
              }

              // Create a unique key for tracking adherence state of this specific dose
              final doseId = '${med['_id']}_$timeStr';
              final status = _adherenceStore[doseId] ?? 'pending';

              flatList.add({
                'id': doseId,
                'scheduleId': schedule['_id']?.toString() ?? '',
                'drugName': drugName,
                'dosage': dosage,
                'time': timeGroup,
                'instruction': mealInst,
                'status': status,
              });
            }
          }

          return flatList;
        }
      }
      return [];
    } catch (e) {
      if (e is DioException && e.response?.statusCode == 404) {
        return []; // 404 is standard when there is no active schedule in the DB
      }
      throw Exception('API Active Schedules Error: $e');
    }
  }

  // Discontinue/deactivate an active schedule
  Future<bool> deactivateActiveSchedule(String scheduleId) async {
    try {
      final response = await _dio.patch(
        '${AppConstants.baseUrl}${AppConstants.schedulesEndpoint}/$scheduleId/deactivate',
      );
      if (response.statusCode == 200) {
        return true;
      }
      return false;
    } catch (e) {
      throw Exception('API Deactivate Error: $e');
    }
  }

  // Get past inactive schedules history for a patient
  Future<List<Map<String, dynamic>>> getHistorySchedules(String patientPhone) async {
    try {
      final response = await _dio.get(
        '${AppConstants.baseUrl}${AppConstants.schedulesEndpoint}/history',
        queryParameters: {'patientPhone': patientPhone},
      );

      if (response.statusCode == 200 && response.data != null) {
        final apiResponse = response.data as Map<String, dynamic>;
        if (apiResponse['status'] == 'success') {
          final data = apiResponse['data'] as Map<String, dynamic>? ?? {};
          final historyList = data['history'] as List<dynamic>? ?? [];
          return historyList.map((e) => Map<String, dynamic>.from(e)).toList();
        }
      }
      return [];
    } catch (e) {
      throw Exception('API History Error: $e');
    }
  }

  // Atomic restore of a past schedule
  Future<bool> restoreSchedule(String scheduleId, String patientPhone) async {
    try {
      final response = await _dio.post(
        '${AppConstants.baseUrl}${AppConstants.schedulesEndpoint}/$scheduleId/restore',
        data: {'patientPhone': patientPhone},
      );
      if (response.statusCode == 200) {
        return true;
      }
      return false;
    } catch (e) {
      throw Exception('API Restore Error: $e');
    }
  }

  // Log adherence in memory for mock simulation
  Future<bool> logAdherence(String id, String newStatus) async {
    _adherenceStore[id] = newStatus;
    return true;
  }
}
