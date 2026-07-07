import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:prescription_reader/core/theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class MainScaffold extends StatefulWidget {
  final Widget child;

  const MainScaffold({super.key, required this.child});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  @override
  Widget build(BuildContext context) {
    // Calculate current index based on the route location
    final String location = GoRouterState.of(context).uri.path;
    int currentIndex = 0;
    if (location.startsWith('/scan') || location.startsWith('/consent')) {
      currentIndex = 1;
    } else if (location.startsWith('/history')) {
      currentIndex = 2;
    }

    final double screenWidth = MediaQuery.of(context).size.width;
    final double tabWidth = screenWidth / 3;
    const double pillWidth = 90;
    const double pillHeight = 46;
    final double leftOffset = tabWidth * currentIndex + (tabWidth - pillWidth) / 2;

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: Container(
        height: 76,
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 12,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Sliding Active Background Pill with subtle 3D shadow and glow
            AnimatedPositioned(
              duration: const Duration(milliseconds: 350),
              curve: Curves.easeOutBack,
              left: leftOffset,
              child: Container(
                width: pillWidth,
                height: pillHeight,
                decoration: BoxDecoration(
                  color: AppTheme.backgroundColor, // Soft light mint background
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withValues(alpha: 0.12),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                    BoxShadow(
                      color: Colors.white.withValues(alpha: 0.8),
                      blurRadius: 4,
                      offset: const Offset(0, -1),
                    )
                  ],
                ),
              ),
            ),

            // Tab Buttons
            Row(
              children: [
                _buildNavItem(
                  index: 0,
                  currentIndex: currentIndex,
                  activeIcon: Icons.home_rounded,
                  inactiveIcon: Icons.home_outlined,
                  label: 'Home',
                  route: '/',
                ),
                _buildNavItem(
                  index: 1,
                  currentIndex: currentIndex,
                  activeIcon: Icons.document_scanner_rounded,
                  inactiveIcon: Icons.document_scanner_outlined,
                  label: 'Scan',
                  route: '/scan',
                ),
                _buildNavItem(
                  index: 2,
                  currentIndex: currentIndex,
                  activeIcon: Icons.history_rounded,
                  inactiveIcon: Icons.history_outlined,
                  label: 'History',
                  route: '/history',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required int currentIndex,
    required IconData activeIcon,
    required IconData inactiveIcon,
    required String label,
    required String route,
  }) {
    final bool isActive = index == currentIndex;
    final color = isActive ? AppTheme.primaryColor : Colors.grey.shade400;

    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => context.go(route),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              transitionBuilder: (child, animation) {
                return ScaleTransition(scale: animation, child: child);
              },
              child: Icon(
                isActive ? activeIcon : inactiveIcon,
                key: ValueKey<bool>(isActive),
                color: color,
                size: 24,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                color: color,
                fontSize: 12,
                fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
