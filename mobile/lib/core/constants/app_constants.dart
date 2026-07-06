import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class AppConstants {
  static const String appName = 'Prescription Reader';

  // API Endpoints
  static const String baseUrl = 'http://192.168.29.39:5000/api';
  static const String uploadEndpoint = '/prescriptions/upload';
  static const String parseEndpoint = '/prescriptions/parse';
  static const String schedulesEndpoint = '/schedules';
  static const String activeSchedulesEndpoint = '/schedules/active';
  static const String logAdherenceEndpoint = '/adherence/log';

  // Storage Keys
  static const String tokenKey = 'auth_token';
}
