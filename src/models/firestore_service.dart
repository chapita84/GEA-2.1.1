import 'package:cloud_firestore/cloud_firestore.dart';
import 'user_model.dart';
import 'product_model.dart';
// import 'transaction_model.dart'; // Debes crear este modelo según tu estructura

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // --- Usuarios ---
  Future<void> createUser(UserModel user) async {
    await _db.collection('users').doc(user.uid).set(user.toJson());
  }

  Future<UserModel> getUser(String uid) async {
    final doc = await _db.collection('users').doc(uid).get();
    return UserModel.fromFirestore(doc);
  }

  // --- Productos ---
  Future<List<ProductModel>> getProducts() async {
    final query = await _db.collection('products').get();
    return query.docs.map((doc) => ProductModel.fromFirestore(doc)).toList();
  }

  // --- Transacciones ---
  Future<void> addTransaction(TransactionModel transaction) async {
    await _db.collection('transactions').add({
      ...transaction.toJson(),
      'status': 'pending',
    });
  }

  Stream<List<TransactionModel>> getPendingTransactions() {
    return _db
        .collection('transactions')
        .where('status', isEqualTo: 'pending')
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => TransactionModel.fromFirestore(doc)).toList());
  }

  Future<void> updateTransactionStatus(String transactionId, String status) async {
    await _db.collection('transactions').doc(transactionId).update({'status': status});
  }
}
