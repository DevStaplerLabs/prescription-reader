class AppConstants {
  static const String appName = 'Prescription Reader';

  // API Endpoints
  static const String baseUrl = 'https://prescription-reader-production.up.railway.app/api';
  static const String uploadEndpoint = '/prescriptions/upload';
  static const String parseEndpoint = '/prescriptions/parse';
  static const String schedulesEndpoint = '/schedules';
  static const String activeSchedulesEndpoint = '/schedules/active';
  static const String logAdherenceEndpoint = '/adherence/log';

  // Storage Keys
  static const String tokenKey = 'auth_token';
}
