import mongoose from "mongoose";

/**
 * Type décrivant la structure de notre cache de connexion.
 * - conn: l'instance de connexion Mongoose une fois établie
 * - promise: la promesse de connexion en cours, pour éviter les connexions concurrentes
 */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

/**
 * En développement, Next.js recharge les modules à chaque changement de fichier (HMR),
 * ce qui recréerait une nouvelle connexion MongoDB à chaque fois si on ne la stocke pas
 * quelque part de persistant entre les rechargements.
 * On utilise donc l'objet global de Node.js pour stocker le cache.
 */
declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

// Initialise le cache global s'il n'existe pas encore
const cached: MongooseCache = global.mongooseCache ?? {
    conn: null,
    promise: null,
};

if (!global.mongooseCache) {
    global.mongooseCache = cached;
}

/**
 * Établit (ou réutilise) une connexion à MongoDB via Mongoose.
 * Retourne toujours la même instance de connexion tant qu'elle reste active,
 * ce qui évite de multiplier les connexions inutilement.
 *
 * La validation de MONGODB_URI est faite ici (et non au niveau du module)
 * pour que l'import de ce fichier ne fasse jamais planter l'app dans un
 * contexte sans variable d'environnement (build, tests, etc.). L'erreur
 * n'apparaît que si on tente réellement de se connecter.
 */
async function connectDB(): Promise<typeof mongoose> {
    // Si une connexion existe déjà en cache, on la réutilise directement
    if (cached.conn) {
        return cached.conn;
    }

    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        throw new Error(
            "Please define the MONGODB_URI environment variable inside .env.local"
        );
    }

    // Si aucune connexion n'est en cours d'établissement, on en démarre une
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // désactive le buffering des commandes tant que la connexion n'est pas prête
        };

        cached.promise = mongoose
            .connect(MONGODB_URI, opts)
            .then((mongooseInstance) => mongooseInstance);
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // En cas d'échec, on réinitialise la promesse pour permettre une nouvelle tentative
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}

export default connectDB;