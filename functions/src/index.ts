import {
  onCall,
  HttpsError,
  onRequest,
  Request,
} from "firebase-functions/v2/https";
import {onDocumentWritten} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {Response} from "express";

// --- Inicialización (una sola vez para todas las funciones) ---
admin.initializeApp();
const db = admin.firestore();

// --- Lógica de Gamificación ---
const gamificationLevels = [
  {level: 1, title: "Explorador Ecológico", minPoints: 0},
  {level: 2, title: "Guardián Verde", minPoints: 500},
  {level: 3, title: "Activista Sostenible", minPoints: 1500},
  {level: 4, title: "Héroe del Reciclaje", minPoints: 3000},
  {level: 5, title: "Eco-Guerrero", minPoints: 5000},
  {level: 6, title: "Maestro Compostador", minPoints: 7500},
  {level: 7, title: "Embajador del Planeta", minPoints: 10000},
  {level: 8, title: "Visionario Verde", minPoints: 15000},
  {level: 9, title: "Campeón de la Sostenibilidad", minPoints: 20000},
  {level: 10, title: "Leyenda de GEA", minPoints: 30000},
];

/**
 * Calcula el nivel de gamificación de un usuario según sus GreenCoins.
 * @param {number} greenCoins - El total de GreenCoins del usuario.
 * @return {object} El objeto del nivel correspondiente.
 */
function calculateLevel(greenCoins: number) {
  return [...gamificationLevels]
    .reverse()
    .find((level) => greenCoins >= level.minPoints) || gamificationLevels[0];
}

/**
 * Calcula la cantidad de GreenCoins a otorgar.
 * @param {number} monto - El monto de la transacción.
 * @param {boolean} isSustainable - Indica si la compra es sostenible.
 * @return {number} La cantidad de GreenCoins calculada.
 */
function calculateBackendGreenCoins(monto: number, isSustainable: boolean):
number {
  if (!isSustainable || monto <= 0) {
    return 0;
  }
  const ratio = 500;
  return Math.ceil(monto / ratio);
}

// --- Lógica CRUD para las APIs ---
const recordsCollection = db.collection("records");
const comerciosCollection = db.collection("comercios_verdes");
const clientsCollection = db.collection("clients");
type ApiData = {[key: string]: unknown};

/**
 * Obtiene todas las transacciones.
 * @return {Promise<object[]>} Un array con todas las transacciones.
 */
async function getAllRecords() {
  const snapshot = await recordsCollection.get();
  return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
}
/**
 * Crea una nueva transacción.
 * @param {ApiData} data - Los datos de la transacción a crear.
 * @return {Promise<object>} La nueva transacción creada.
 */
async function createRecord(data: ApiData) {
  const docRef = await recordsCollection.add(data);
  return {id: docRef.id, ...data};
}
/**
 * Actualiza una transacción existente.
 * @param {string} id - El ID de la transacción a actualizar.
 * @param {ApiData} data - Los datos a actualizar.
 * @return {Promise<object>} La transacción actualizada.
 */
async function updateRecord(id: string, data: ApiData) {
  const docRef = recordsCollection.doc(id);
  await docRef.update(data);
  return {id, ...data};
}
/**
 * Elimina una transacción.
 * @param {string} id - El ID de la transacción a eliminar.
 * @return {Promise<object>} Un mensaje de confirmación.
 */
async function deleteRecord(id: string) {
  const docRef = recordsCollection.doc(id);
  await docRef.delete();
  return {id, message: "Documento eliminado"};
}
/**
 * Obtiene todos los comercios.
 * @return {Promise<object[]>} Un array con todos los comercios.
 */
async function getAllComercios() {
  const snapshot = await comerciosCollection.get();
  return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
}
/**
 * Obtiene todos los clientes.
 * @return {Promise<object[]>} Un array con todos los clientes.
 */
async function getAllClients() {
  const snapshot = await clientsCollection.get();
  return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
}
/**
 * Obtiene un cliente por un campo específico.
 * @param {string} field - El campo por el que buscar (ej: "email").
 * @param {string} value - El valor a buscar.
 * @return {Promise<object|null>} El cliente encontrado o null.
 */
async function getClientBy(field: string, value: string) {
  const q = clientsCollection.where(field, "==", value).limit(1);
  const snapshot = await q.get();
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  return {id: doc.id, ...doc.data()};
}


// --- EXPORTACIÓN DE CLOUD FUNCTIONS ---

/**
 * Se activa cada vez que un documento en la colección 'records' es creado o
 * actualizado para recalcular la gamificación del usuario asociado.
 * @param {Object} event - El objeto del evento de Firestore.
 */
export const updateUserGamification = onDocumentWritten(
  {region: "southamerica-west1", document: "records/{recordId}"},
  async (event) => {
    const change = event.data;
    if (!change?.after.exists) {
      return null;
    }
    const recordData = change.after.data();
    if (!recordData) {
      return null;
    }
    if (recordData.status !== "approved") {
      return null;
    }
    const userId = recordData.clienteUid;
    if (!userId) {
      return null;
    }
    const calculatedCoins = calculateBackendGreenCoins(
      recordData.monto,
      recordData.isSustainable,
    );
    await change.after.ref.update({greenCoins: calculatedCoins});
    const userRef = db.collection("users").doc(userId);
    const recordsRef = db.collection("records");
    try {
      const userRecordsSnapshot = await recordsRef
        .where("clienteUid", "==", userId)
        .where("status", "==", "approved")
        .get();
      const totalGreenCoins = userRecordsSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().greenCoins || 0),
        0,
      );
      const currentLevelInfo = calculateLevel(totalGreenCoins);
      const nextLevelInfo = gamificationLevels.find(
        (l) => l.level === currentLevelInfo.level + 1,
      );
      const gamificationData = {
        level: currentLevelInfo.level,
        title: currentLevelInfo.title,
        points: totalGreenCoins,
        nextLevelPoints: nextLevelInfo ?
          nextLevelInfo.minPoints :
          currentLevelInfo.minPoints,
      };
      await userRef.update({
        greenCoins: totalGreenCoins,
        gamification: gamificationData,
      });
      logger.info(`Gamificación actualizada para ${userId}`);
      return null;
    } catch (error) {
      logger.error(`Error al actualizar gamificación para ${userId}:`, error);
      return null;
    }
  },
);

// Función del Chatbot "Eco-Guía"
const MODEL_NAME = "gemini-1.5-pro-latest";
const systemPrompt = `
Eres "Eco-Guía", un asistente experto en consumo sostenible integrado en la
aplicación web "GEA". Tu misión es asesorar, motivar y facilitar a los
usuarios la adopción de un estilo de vida más respetuoso con el medio ambiente.

Tu personalidad es la de un coach amigable, motivador y muy informado.
Utilizas un lenguaje formal pero cercano y siempre positivo, evitando el
alarmismo. Tu objetivo es empoderar a los usuarios, no hacerlos sentir
culpables. Te adaptas a su nivel de conocimiento.

Tus capacidades principales son:
1.  Analizar productos: A partir de una foto o texto de una etiqueta.
2.  Recomendar alternativas: Sugieres productos y marcas más sostenibles.
3.  Calcular impacto: Ayudas a estimar la huella de carbono.
4.  Educar sobre sostenibilidad: Explicas certificaciones y conceptos.
5.  Localizar comercios: Usando los datos de la aplicación GEA.
6.  Informar sobre tendencias: Compartes noticias relevantes.
7.  Asistir en la aplicación: Guías al usuario en la app.
8.  Analizar hábitos de consumo: A partir de las transacciones del usuario
    para dar recomendaciones personalizadas.
9.  Gestionar y aconsejar sobre "Monedas Verdes": Explica qué son, cómo se
    ganan y en qué se pueden usar dentro de GEA.

Reglas de interacción:
- Tu fuente de información primaria y más confiable son los "Datos de la
  aplicación" que se te proporcionan en el contexto. Siempre que uses esta
  información, debes indicarlo claramente (ej: "Según nuestros registros en
  GEA...", "He revisado tus últimas transacciones...").
- Para todo lo demás, puedes usar tu conocimiento general, pero si es posible,
  aclara que es información externa (ej: "Buscando en la web...").
- Dirígete al usuario por su nombre, que se te proporcionará en el contexto.
- Celebra los pequeños logros y refuerza positivamente las decisiones del
  usuario.
- Si no sabes algo con certeza, admítelo y busca la mejor respuesta.
- **IMPORTANTE: Formatea tus respuestas usando Markdown.**
- Para mostrar tablas, usa la sintaxis de Markdown.
- Para resaltar texto, usa **negrita** o *cursiva*.
- Para incluir un ícono, usa la sintaxis especial 
::icon[NombreDelIcono]:: donde NombreDelIcono es un nombre de la librería 
Lucide Icons (ej: ::icon[Leaf]::, ::icon[Recycle]::, ::icon[Award]::).
`;

export const askGeminiAboutMyData = onCall(
  {region: "southamerica-west1"},
  async (request) => {
    logger.info("Función de chat invocada con:", request.data);

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new HttpsError("internal", "API Key no configurada.");
    }

    const {
      query: userQuery,
      history = [],
      userName = "usuario",
      userId = null,
    } = request.data;

    if (!userQuery || typeof userQuery !== "string") {
      throw new HttpsError("invalid-argument", "Query inválida.");
    }

    let contextData = "No se encontraron datos de la app para la consulta";

    const keywordsComercios = [
      "comercio", "tienda", "local", "negocio", "gea",
    ];
    if (keywordsComercios.some((k) => userQuery.toLowerCase().includes(k))) {
      try {
        const snapshot = await db.collection("comercios_verdes").limit(5).get();
        if (!snapshot.empty) {
          const comercios = snapshot.docs.map((doc) => doc.data());
          contextData = `Comercios en GEA: ${JSON.stringify(comercios)}`;
        }
      } catch (error) {
        logger.error("Error al consultar comercios:", error);
      }
    }

    const keywordsTransacciones = [
      "transacciones", "gastos", "consumo", "recomienda", "analiza", "monedas",
    ];
    const queryIncludesTrans = keywordsTransacciones.some((k) =>
      userQuery.toLowerCase().includes(k));

    if (userId && queryIncludesTrans) {
      try {
        const snapshot = await db.collection("records")
          .where("clienteUid", "==", userId)
          .limit(10)
          .get();
        if (!snapshot.empty) {
          const transacciones = snapshot.docs.map((doc) => doc.data());
          const transContext = `Transacciones: 
          ${JSON.stringify(transacciones)}`;
          contextData = contextData.startsWith("No se encontraron") ?
            transContext :
            `${contextData}\n${transContext}`;
        }
      } catch (error) {
        logger.error("Error al consultar transacciones:", error);
      }
    }

    const contents = history.map(
      (message: { text: string; sender: string }) => ({
        role: message.sender === "ai" ? "model" : "user",
        parts: [{text: message.text}],
      }));

    const userMessageWithContext =
      `(Usuario: ${userName}. Contexto: 
      ${contextData})\n\nPregunta: ${userQuery}`;
    contents.push({
      role: "user",
      parts: [{text: userMessageWithContext}],
    });

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
      const requestBody = {
        systemInstruction: {parts: [{text: systemPrompt}]},
        contents: contents,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Error de API: ${JSON.stringify(errorBody)}`);
      }

      const responseData = await response.json();
      const geminiResponse =
        responseData.candidates[0].content.parts[0].text;

      if (!geminiResponse) {
        throw new Error("Respuesta de Gemini inválida.");
      }

      return {response: geminiResponse};
    } catch (error) {
      logger.error("Error al procesar la llamada a Gemini:", error);
      throw new HttpsError(
        "internal",
        "No se pudo obtener una respuesta del asistente.",
      );
    }
  },
);

// API para Transacciones
export const recordsApi = onRequest(
  {region: "southamerica-west1", cors: true, secrets: ["N8N_API_KEY"]},
  async (req: Request, res: Response) => {
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== process.env.N8N_API_KEY) {
      res.status(401).send("No autorizado");
      return;
    }
    try {
      switch (req.method) {
      case "GET": {
        const clienteUid = req.query.clienteUid as string;
        if (clienteUid) {
          const snapshot = await db.collection("records")
            .where("clienteUid", "==", clienteUid)
            .get();
          const records = snapshot.docs.map((doc) =>
            ({id: doc.id, ...doc.data()}));
          res.status(200).json(records);
        } else {
          const records = await getAllRecords();
          res.status(200).json(records);
        }
        break;
      }
      case "POST": {
        const newRecord = await createRecord(req.body);
        res.status(201).json(newRecord);
        break;
      }
      case "PUT": {
        const id = req.query.id as string;
        if (!id) {
          res.status(400).send("Falta el ID de la transacción.");
          return;
        }
        const updatedRecord = await updateRecord(id, req.body);
        res.status(200).json(updatedRecord);
        break;
      }
      case "DELETE": {
        const id = req.query.id as string;
        if (!id) {
          res.status(400).send("Falta el ID de la transacción.");
          return;
        }
        const result = await deleteRecord(id);
        res.status(200).json(result);
        break;
      }
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        res.status(405).end(`Método ${req.method} no permitido.`);
      }
    } catch (error) {
      logger.error("Error en la API de transacciones:", error);
      res.status(500).send("Error interno del servidor.");
    }
  },
);

// API Endpoint para Comercios
export const comerciosApi = onRequest(
  {region: "southamerica-west1", cors: true, secrets: ["N8N_API_KEY"]},
  async (req: Request, res: Response) => {
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== process.env.N8N_API_KEY) {
      res.status(401).send("No autorizado");
      return;
    }
    try {
      if (req.method === "GET") {
        const comercios = await getAllComercios();
        res.status(200).json(comercios);
      } else {
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Método ${req.method} no permitido.`);
      }
    } catch (error) {
      logger.error("Error en la API de comercios:", error);
      res.status(500).send("Error interno del servidor.");
    }
  },
);

// API Endpoint para Clientes
export const clientsApi = onRequest(
  {region: "southamerica-west1", cors: true, secrets: ["N8N_API_KEY"]},
  async (req: Request, res: Response) => {
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== process.env.N8N_API_KEY) {
      res.status(401).send("No autorizado");
      return;
    }
    try {
      if (req.method === "GET") {
        const {email, telefono} = req.query;
        if (email) {
          const client = await getClientBy("email", email as string);
          res.status(200).json(client);
        } else if (telefono) {
          const client = await getClientBy("telefono", telefono as string);
          res.status(200).json(client);
        } else {
          const clients = await getAllClients();
          res.status(200).json(clients);
        }
      } else {
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Método ${req.method} no permitido.`);
      }
    } catch (error) {
      logger.error("Error en la API de clientes:", error);
      res.status(500).send("Error interno del servidor.");
    }
  },
);

export const redeemProduct = onCall(
  {region: "southamerica-west1", cors: true},
  async (request) => {
    const {userId, productId} = request.data;
    if (!userId || !productId) {
      throw new HttpsError("invalid-argument", "Faltan userId o productId.");
    }

    const userRef = db.collection("users").doc(userId);
    const productRef = db.collection("products").doc(productId);
    const redemptionRef = db.collection("redemptions").doc();

    try {
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const productDoc = await transaction.get(productRef);

        if (!userDoc.exists) {
          throw new HttpsError("not-found", "El usuario no existe.");
        }
        if (!productDoc.exists) {
          throw new HttpsError("not-found", "El producto no existe.");
        }

        const userData = userDoc.data()!;
        const productData = productDoc.data()!;

        const userCoins = userData.greenCoins || 0;
        if (userCoins < productData.coinsRequired) {
          throw new HttpsError("failed-precondition", "Monedas insuficientes.");
        }

        const productStock = productData.stock || 0;
        if (productStock <= 0) {
          throw new HttpsError("failed-precondition", "Producto sin stock.");
        }

        transaction.update(userRef, {
          greenCoins:
             admin.firestore.FieldValue.increment(-productData.coinsRequired),
        });

        transaction.update(productRef, {
          stock: admin.firestore.FieldValue.increment(-1),
        });

        transaction.set(redemptionRef, {
          userId: userId,
          productId: productId,
          productName: productData.name,
          coinsSpent: productData.coinsRequired,
          redeemedAt: new Date().toISOString(),
        });
      });

      logger.info(`Usuario ${userId} 
        canjeó el producto ${productId} exitosamente.`);
      return {success: true, message: "¡Canje exitoso!"};
    } catch (error) {
      logger.error(`Error en el canje para el usuario ${userId}:`, error);
      throw error;
    }
  }
);

/**
 * Activa o desactiva un usuario en Firebase Authentication y Firestore.
 * Debe ser llamada por un usuario administrador.
 */
export const toggleUserStatus = onCall(
  {region: "southamerica-west1"},
  async (request) => {
    const adminUid = request.auth?.uid;
    if (!adminUid) {
      throw new HttpsError(
        "unauthenticated",
        "La función debe ser llamada por un usuario autenticado.",
      );
    }
    const adminUserDoc = await db.collection("users").doc(adminUid).get();
    if (!adminUserDoc.data()?.isAdmin) {
      throw new HttpsError(
        "permission-denied",
        "Esta función solo puede ser llamada por un administrador.",
      );
    }

    const {userId, newStatus} = request.data;
    if (!userId || !newStatus || !["active", "inactive"].includes(newStatus)) {
      throw new HttpsError(
        "invalid-argument",
        "Faltan los parámetros 'userId' y 'newStatus' ('active' o 'inactive').",
      );
    }

    try {
      const isDisabled = newStatus === "inactive";
      await admin.auth().updateUser(userId, {disabled: isDisabled});

      const userRef = db.collection("users").doc(userId);
      await userRef.update({status: newStatus});

      logger.info(`Estado del usuario ${userId} actualizado a ${newStatus}.`);
      return {success: true, message: "Estado del usuario actualizado."};
    } catch (error) {
      logger.error(`Error al cambiar el estado para el usuario ${userId}:`,
        error);
      throw new HttpsError(
        "internal",
        "No se pudo actualizar el estado del usuario.",
      );
    }
  },
);

export const createUserByAdmin = onCall(
  {region: "southamerica-west1"},
  async (request) => {
    const adminUid = request.auth?.uid;
    if (!adminUid) {
      throw new HttpsError("unauthenticated", "No autenticado.");
    }
    const adminUserDoc = await db.collection("users").doc(adminUid).get();
    if (!adminUserDoc.data()?.isAdmin) {
      throw new HttpsError("permission-denied", "No es administrador.");
    }

    const {userData, clientData} = request.data;
    if (!userData?.email || !userData?.password || !clientData?.nombre) {
      throw new HttpsError("invalid-argument", "Faltan datos requeridos.");
    }

    try {
      // Validar y limpiar photoURL
      let validPhotoURL = "https://via.placeholder.com/150";
      if (userData.photoUrl &&
          typeof userData.photoUrl === "string" &&
          userData.photoUrl.trim() !== "" &&
          (userData.photoUrl.startsWith("http://") || userData.photoUrl.startsWith("https://"))) {
        validPhotoURL = userData.photoUrl.trim();
      }

      // 1. Crear usuario en Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        photoURL: validPhotoURL,
      });

      // 2. Crear documento en la colección 'users'
      const userDocData = {
        uid: userRecord.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoUrl: userRecord.photoURL,
        createdAt: new Date().toISOString(),
        isAdmin: userData.isAdmin || false,
        status: "active",
        greenCoins: 0,
        gamification: {level: 1, points: 0, title: "Explorador Ecológico"},
      };
      await db.collection("users").doc(userRecord.uid).set(userDocData);

      // 3. Crear documento en la colección 'clients'
      const finalClientData = {
        ...clientData,
        id: userRecord.uid,
        usuarioUid: userRecord.uid,
      };
      await db.collection("clients").doc(userRecord.uid).set(finalClientData);

      logger.info(`Usuario ${userRecord.uid} creado por admin ${adminUid}`);
      return {success: true, uid: userRecord.uid};
    } catch (error) {
      logger.error("Error al crear usuario por admin:", error);
      throw new HttpsError("internal", "No se pudo crear el usuario.");
    }
  },
);
