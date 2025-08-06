import 'package:cloud_firestore/cloud_firestore.dart';

class ProductModel {
  final String productId;
  final String name;
  final String description;
  final String imageUrl;
  final String category;
  final int coinsRequired;
  final int stock;
  final String ecologicalImpact;
  final String vendorId;

  const ProductModel({
    required this.productId,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.category,
    required this.coinsRequired,
    required this.stock,
    required this.ecologicalImpact,
    required this.vendorId,
  });

  factory ProductModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return ProductModel(
      productId: data['productId'] as String,
      name: data['name'] as String,
      description: data['description'] as String,
      imageUrl: data['imageUrl'] as String,
      category: data['category'] as String,
      coinsRequired: data['coinsRequired'] as int? ?? 0,
      stock: data['stock'] as int? ?? 0,
      ecologicalImpact: data['ecologicalImpact'] as String,
      vendorId: data['vendorId'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'category': category,
      'coinsRequired': coinsRequired,
      'stock': stock,
      'ecologicalImpact': ecologicalImpact,
      'vendorId': vendorId,
    };
  }
}
