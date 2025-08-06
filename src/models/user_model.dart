import 'package:cloud_firestore/cloud_firestore.dart';

class UserModel {
  final String uid;
  final String email;
  final String displayName;
  final String photoUrl;
  final Timestamp createdAt;
  final GeoPoint location;
  final List<String> interests;
  final bool onboardingCompleted;
  final int greenCoins;
  final bool isAdmin;
  final Map<String, dynamic> gamification;

  const UserModel({
    required this.uid,
    required this.email,
    required this.displayName,
    required this.photoUrl,
    required this.createdAt,
    required this.location,
    required this.interests,
    required this.onboardingCompleted,
    required this.greenCoins,
    required this.isAdmin,
    required this.gamification,
  });

  factory UserModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return UserModel(
      uid: data['uid'] as String,
      email: data['email'] as String,
      displayName: data['displayName'] as String,
      photoUrl: data['photoUrl'] as String,
      createdAt: data['createdAt'] as Timestamp,
      location: data['location'] as GeoPoint,
      interests: List<String>.from(data['interests'] ?? []),
      onboardingCompleted: data['onboardingCompleted'] as bool? ?? false,
      greenCoins: data['greenCoins'] as int? ?? 0,
      isAdmin: data['isAdmin'] as bool? ?? false,
      gamification: Map<String, dynamic>.from(data['gamification'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'email': email,
      'displayName': displayName,
      'photoUrl': photoUrl,
      'createdAt': createdAt,
      'location': location,
      'interests': interests,
      'onboardingCompleted': onboardingCompleted,
      'greenCoins': greenCoins,
      'isAdmin': isAdmin,
      'gamification': gamification,
    };
  }
}
