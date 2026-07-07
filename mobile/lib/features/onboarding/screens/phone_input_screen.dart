import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/gradient_button.dart';

class PhoneInputScreen extends ConsumerStatefulWidget {
  const PhoneInputScreen({super.key});

  @override
  ConsumerState<PhoneInputScreen> createState() => _PhoneInputScreenState();
}

class _PhoneInputScreenState extends ConsumerState<PhoneInputScreen> {
  final TextEditingController _phoneCtrl = TextEditingController();
  final FocusNode _phoneFocusNode = FocusNode();
  final TextEditingController _nameCtrl = TextEditingController();
  final FocusNode _nameFocusNode = FocusNode();
  bool _isLoading = false;
  bool _isDpdpAgreed = false;
  bool _isInputValid = false;
  bool _isPhoneFocused = false;
  bool _isNameFocused = false;

  @override
  void initState() {
    super.initState();
    _phoneCtrl.addListener(_validateInput);
    _nameCtrl.addListener(_validateInput);
    _phoneFocusNode.addListener(() {
      setState(() {
        _isPhoneFocused = _phoneFocusNode.hasFocus;
      });
    });
    _nameFocusNode.addListener(() {
      setState(() {
        _isNameFocused = _nameFocusNode.hasFocus;
      });
    });
  }

  void _validateInput() {
    final phone = _phoneCtrl.text.trim();
    final name = _nameCtrl.text.trim();
    final isValid = phone.length >= 10 && name.isNotEmpty;
    if (isValid != _isInputValid) {
      setState(() {
        _isInputValid = isValid;
      });
    }
  }

  Future<void> _submitPhone() async {
    final phone = _phoneCtrl.text.trim();
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Please enter your name',
            style: GoogleFonts.plusJakartaSans(color: Colors.white),
          ),
          backgroundColor: AppTheme.dangerColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      return;
    }
    if (phone.isEmpty || phone.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Please enter a valid 10-digit phone number',
            style: GoogleFonts.plusJakartaSans(color: Colors.white),
          ),
          backgroundColor: AppTheme.dangerColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      return;
    }

    if (!_isDpdpAgreed) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Please agree to the DPDP guidelines to proceed',
            style: GoogleFonts.plusJakartaSans(color: Colors.white),
          ),
          backgroundColor: AppTheme.warningColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    
    // Save to storage
    final storage = ref.read(storageServiceProvider);
    await storage.save('phone_number', phone);
    await storage.save('user_name', name);
    
    // Small delay for UX
    await Future.delayed(const Duration(milliseconds: 800));
    
    if (!mounted) return;
    context.go('/'); // Proceed to home
  }

  @override
  void dispose() {
    _phoneCtrl.removeListener(_validateInput);
    _nameCtrl.removeListener(_validateInput);
    _phoneCtrl.dispose();
    _phoneFocusNode.dispose();
    _nameCtrl.dispose();
    _nameFocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor, // Soft light mint background
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              physics: const ClampingScrollPhysics(),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight - 32, // adjust for padding
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Top Header Row (Logo)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        // Left Logo (StaplerLabs Logo + Title + Tagline)
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8),
                                color: Colors.white,
                                border: Border.all(color: Colors.grey.shade200),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.asset(
                                  'assets/images/logo.png',
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Prescription Reader',
                                  style: GoogleFonts.plusJakartaSans(
                                    color: AppTheme.primaryColor,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: -0.5,
                                  ),
                                ),
                                Text(
                                  'Powered by StaplerLabs',
                                  style: GoogleFonts.plusJakartaSans(
                                    color: Colors.grey.shade500,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),

                    // Main Middle Section
                    Column(
                      children: [
                        const SizedBox(height: 32),
                        // Pulsing, Glowing Concentric Signal Smartphone Graphic
                        const _GlowingPhoneGraphic(),
                        const SizedBox(height: 24),
                        
                        // Title
                        Text(
                          'Enter your phone number',
                          style: GoogleFonts.plusJakartaSans(
                            color: const Color(0xFF0F172A),
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            letterSpacing: -0.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 12),
                        
                        // Subtitle
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            "We'll send your medication reminders to this WhatsApp number",
                            style: GoogleFonts.plusJakartaSans(
                              color: Colors.grey.shade600,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              height: 1.4,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 36),

                        // Tactile 3D Elevated Name Input Container
                        Container(
                          height: 58,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: _isNameFocused 
                                  ? AppTheme.primaryColor 
                                  : Colors.grey.shade200, 
                              width: _isNameFocused ? 1.8 : 1.2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: _isNameFocused
                                    ? AppTheme.primaryColor.withValues(alpha: 0.05)
                                    : Colors.black.withValues(alpha: 0.03),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                              const BoxShadow(
                                color: Colors.white,
                                blurRadius: 4,
                                offset: Offset(-2, -2),
                              )
                            ],
                          ),
                          child: Row(
                            children: [
                              const SizedBox(width: 18),
                              const Icon(
                                Icons.person_outline_rounded,
                                color: AppTheme.primaryColor,
                                size: 20,
                              ),
                              const SizedBox(width: 12),
                              Container(
                                width: 1.2,
                                height: 24,
                                color: Colors.grey.shade200,
                              ),
                              const SizedBox(width: 18),
                              Expanded(
                                child: TextField(
                                  controller: _nameCtrl,
                                  focusNode: _nameFocusNode,
                                  keyboardType: TextInputType.name,
                                  textCapitalization: TextCapitalization.words,
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFF0F172A),
                                  ),
                                  decoration: InputDecoration(
                                    hintText: 'Enter your name',
                                    hintStyle: GoogleFonts.plusJakartaSans(
                                      color: Colors.grey.shade400,
                                      fontWeight: FontWeight.w500,
                                    ),
                                    filled: false,
                                    border: InputBorder.none,
                                    enabledBorder: InputBorder.none,
                                    focusedBorder: InputBorder.none,
                                    contentPadding: EdgeInsets.zero,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Tactile 3D Elevated Mobile Input Container (Focus border detection)
                        Container(
                          height: 58,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: _isPhoneFocused 
                                  ? AppTheme.primaryColor 
                                  : Colors.grey.shade200, 
                              width: _isPhoneFocused ? 1.8 : 1.2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: _isPhoneFocused
                                    ? AppTheme.primaryColor.withValues(alpha: 0.05)
                                    : Colors.black.withValues(alpha: 0.03),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                              const BoxShadow(
                                color: Colors.white,
                                blurRadius: 4,
                                offset: Offset(-2, -2),
                              )
                            ],
                          ),
                          child: Row(
                            children: [
                              const SizedBox(width: 18),
                              Text(
                                '+91',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF1E293B),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Container(
                                width: 1.2,
                                height: 24,
                                color: Colors.grey.shade200,
                              ),
                              const SizedBox(width: 18),
                              Expanded(
                                child: TextField(
                                  controller: _phoneCtrl,
                                  focusNode: _phoneFocusNode,
                                  keyboardType: TextInputType.phone,
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFF0F172A),
                                  ),
                                  decoration: InputDecoration(
                                    hintText: '98765 XXXXX',
                                    hintStyle: GoogleFonts.plusJakartaSans(
                                      color: Colors.grey.shade400,
                                      fontWeight: FontWeight.w500,
                                    ),
                                    filled: false, // Ensure no background fill on focus
                                    border: InputBorder.none,
                                    enabledBorder: InputBorder.none,
                                    focusedBorder: InputBorder.none,
                                    contentPadding: EdgeInsets.zero,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        // DPDP Consent Checkbox Card (glowing borders)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: _isDpdpAgreed 
                                  ? AppTheme.primaryColor.withValues(alpha: 0.4) 
                                  : Colors.grey.shade200, 
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: _isDpdpAgreed 
                                    ? AppTheme.primaryColor.withValues(alpha: 0.05) 
                                    : Colors.black.withValues(alpha: 0.01),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              )
                            ],
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SizedBox(
                                width: 24,
                                height: 24,
                                child: Checkbox(
                                  value: _isDpdpAgreed,
                                  onChanged: (bool? val) {
                                    setState(() {
                                      _isDpdpAgreed = val ?? false;
                                    });
                                  },
                                  activeColor: AppTheme.primaryColor,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(5),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  'I agree to data collection under DPDP guidelines. Your data stays private and is never sold.',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFF334155),
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    // Bottom Continue CTA (using our Premium GradientButton, always active)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 32),
                        GradientButton(
                          text: 'Continue',
                          onPressed: _isLoading ? null : _submitPhone, // Always active
                          isLoading: _isLoading,
                          icon: const Icon(Icons.arrow_forward_rounded, color: AppTheme.primaryColor, size: 18),
                        ),
                        const SizedBox(height: 12),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _GlowingPhoneGraphic extends StatefulWidget {
  const _GlowingPhoneGraphic();

  @override
  State<_GlowingPhoneGraphic> createState() => _GlowingPhoneGraphicState();
}

class _GlowingPhoneGraphicState extends State<_GlowingPhoneGraphic>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return SizedBox(
          width: 160,
          height: 160,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Concentric Pulsing Ripples (3 stages)
              ...List.generate(3, (index) {
                final double progress = (_controller.value + (index / 3.0)) % 1.0;
                final double size = 60 + (progress * 90);
                final double opacity = (1.0 - progress) * 0.22;
                return Container(
                  width: size,
                  height: size,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppTheme.primaryColor.withValues(alpha: opacity),
                      width: 1.8,
                    ),
                  ),
                );
              }),

              // 3D Elevated Graphic Hub
              Container(
                width: 78,
                height: 78,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withValues(alpha: 0.12),
                      blurRadius: 16,
                      spreadRadius: 2,
                    ),
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 6,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: Center(
                  child: Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: AppTheme.backgroundColor,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryColor.withValues(alpha: 0.08),
                          blurRadius: 4,
                          spreadRadius: 1,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.phone_android_rounded,
                      size: 26,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
