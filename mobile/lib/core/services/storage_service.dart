import 'package:flutter_riverpod/flutter_riverpod.dart';

final storageServiceProvider = Provider<StorageService>((ref) => StorageService());

class StorageService {
  // We'll use a simple in-memory mock storage for now.
  // In a real app, you would use SharedPreferences or flutter_secure_storage.
  final Map<String, dynamic> _storage = {};

  Future<void> save(String key, dynamic value) async {
    _storage[key] = value;
  }

  Future<dynamic> read(String key) async {
    return _storage[key];
  }

  Future<void> remove(String key) async {
    _storage.remove(key);
  }
}
