import connectToDatabase from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectToDatabase();
        return NextResponse.json({ message: "Connexion réussie" });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erreur de connexion à la base de données" },
            { status: 500 }
        );
    }
}