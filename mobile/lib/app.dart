import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/main_scaffold.dart';
import 'features/scan/screens/scan_screen.dart';
import 'features/scan/screens/confirmation_screen.dart';
import 'features/schedule/screens/home_screen.dart';
import 'features/history/screens/history_screen.dart';
import 'features/onboarding/screens/phone_input_screen.dart';
import 'features/scan/screens/consent_screen.dart';

import 'core/services/storage_service.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>();

final goRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/onboarding',
    redirect: (context, state) async {
      final storage = ref.read(storageServiceProvider);
      final phone = await storage.read('phone_number') as String?;
      final isOnboarding = state.matchedLocation == '/onboarding';
      
      if (phone != null && phone.trim().isNotEmpty) {
        if (isOnboarding) {
          return '/';
        }
      } else {
        if (!isOnboarding) {
          return '/onboarding';
        }
      }
      return null;
    },
    routes: [
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const PhoneInputScreen(),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          return MainScaffold(child: child);
        },
        routes: [
          GoRoute(
            path: '/',
            name: 'home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/scan',
            name: 'scan',
            builder: (context, state) => const ScanScreen(),
          ),
          GoRoute(
            path: '/history',
            name: 'history',
            builder: (context, state) => const HistoryScreen(),
          ),
        ],
      ),
      // Confirmation screen sits outside the ShellRoute because it's a full-screen flow
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/confirmation',
        name: 'confirmation',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          return ConfirmationScreen(ocrData: extra);
        },
      ),
      // Consent screen
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/consent',
        name: 'consent',
        builder: (context, state) => const ConsentScreen(),
      ),
    ],
  );
});

class PrescriptionApp extends ConsumerWidget {
  const PrescriptionApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(goRouterProvider);

    return MaterialApp.router(
      title: 'Prescription Reader',
      theme: AppTheme.lightTheme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
